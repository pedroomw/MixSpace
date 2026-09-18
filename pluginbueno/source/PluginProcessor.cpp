#include "PluginProcessor.h"
#include "PluginEditor.h"

// ─── Constructor / Destructor ────────────────────────────────────────────────

MixSpaceAudioProcessor::MixSpaceAudioProcessor()
    : AudioProcessor (BusesProperties()
        .withInput  ("Input",  juce::AudioChannelSet::stereo(), true)
        .withOutput ("Output", juce::AudioChannelSet::stereo(), true))
{
    threadPool = std::make_unique<juce::ThreadPool> (2);
}

MixSpaceAudioProcessor::~MixSpaceAudioProcessor()
{
    authState.store (AuthState::LoggedOut);
    threadPool->removeAllJobs (true, 3000);
}

// ─── Editor factory ──────────────────────────────────────────────────────────

juce::AudioProcessorEditor* MixSpaceAudioProcessor::createEditor()
{
    return new MixSpaceAudioProcessorEditor (*this);
}

// ─── Auth ────────────────────────────────────────────────────────────────────

void MixSpaceAudioProcessor::startLoginFlow()
{
    juce::Random rng;
    auto makeHex = [&](int len)
    {
        juce::String s;
        for (int i = 0; i < len; ++i)
            s += juce::String::toHexString (rng.nextInt (256)).paddedLeft ('0', 2);
        return s;
    };

    const juce::String sessionId = makeHex (4) + "-" + makeHex (2) + "-"
                                 + makeHex (2) + "-" + makeHex (2) + "-"
                                 + makeHex (6);

    pendingSessionId = sessionId;

    authState.store (AuthState::WaitingForBrowser);
    notifyAuthChange (AuthState::WaitingForBrowser);

    threadPool->addJob ([this, sessionId]
    {
        const juce::String registerUrl =
            juce::String (API_BASE) + "/auth/plugin-session/" + sessionId;

        const juce::var registerResult = httpPost (registerUrl, "{}");

        if (registerResult.isVoid())
        {
            juce::MessageManager::callAsync ([this]
            {
                authState.store (AuthState::LoggedOut);
                notifyAuthChange (AuthState::LoggedOut);
            });
            return;
        }

        juce::MessageManager::callAsync ([sessionId]
        {
            const juce::String browserUrl =
                "http://localhost:5173?sessionId=" + sessionId;
            juce::URL (browserUrl).launchInDefaultBrowser();
        });

        pollForToken (sessionId);
    });
}

void MixSpaceAudioProcessor::pollForToken (const juce::String& sessionId)
{
    constexpr int POLL_INTERVAL_MS = 2000;
    constexpr int MAX_ATTEMPTS     = 150;

    const juce::String pollUrl =
        juce::String (API_BASE) + "/auth/plugin-session/" + sessionId;

    for (int attempt = 0; attempt < MAX_ATTEMPTS; ++attempt)
    {
        if (authState.load() != AuthState::WaitingForBrowser)
            return;

        juce::Thread::sleep (POLL_INTERVAL_MS);

        if (authState.load() != AuthState::WaitingForBrowser)
            return;

        const juce::var result = httpGet (pollUrl);

        if (result.isVoid())
            continue;

        const juce::String status = result["status"].toString();

        if (status == "ready")
        {
            const juce::String receivedToken = result["token"].toString();

            juce::MessageManager::callAsync ([this, receivedToken]
            {
                token = receivedToken;
                authState.store (AuthState::LoggedIn);
                notifyAuthChange (AuthState::LoggedIn);

                // Fetch the user's projects immediately after login
                fetchProjects();
            });
            return;
        }

        if (status == "expired")
        {
            juce::MessageManager::callAsync ([this]
            {
                authState.store (AuthState::LoggedOut);
                notifyAuthChange (AuthState::LoggedOut);
            });
            return;
        }
    }

    juce::MessageManager::callAsync ([this]
    {
        authState.store (AuthState::LoggedOut);
        notifyAuthChange (AuthState::LoggedOut);
    });
}

void MixSpaceAudioProcessor::logout()
{
    juce::MessageManager::callAsync ([this]
    {
        token.clear();
        pendingSessionId.clear();
        cachedProjects.clear();
        authState.store (AuthState::LoggedOut);
        notifyAuthChange (AuthState::LoggedOut);
    });
}

// ─── Projects ────────────────────────────────────────────────────────────────

void MixSpaceAudioProcessor::fetchProjects()
{
    // Can be called from message thread or background thread.
    const juce::String currentToken = token;

    threadPool->addJob ([this, currentToken]
    {
        const juce::String url = juce::String (API_BASE) + "/projects";
        const juce::var result = httpGet (url, currentToken);

        juce::Array<Project> loaded;

        if (!result.isVoid())
        {
            // API returns either an array at root or { projects: [...] }
            const juce::var* arr = nullptr;

            if (result.isArray())
            {
                arr = &result;
            }
            else if (result.isObject())
            {
                const juce::var& inner = result["projects"];
                if (inner.isArray())
                    arr = &inner;
            }

            if (arr != nullptr)
            {
                for (int i = 0; i < arr->size(); ++i)
                {
                    const juce::var& p = (*arr)[i];
                    Project proj;
                    proj.id   = p["id"].toString();
                    proj.name = p["name"].toString();
                    loaded.add (proj);
                }
            }
        }

        juce::MessageManager::callAsync ([this, loaded]
        {
            cachedProjects = loaded;
            notifyProjectsLoaded (cachedProjects);
        });
    });
}

// ─── Upload ──────────────────────────────────────────────────────────────────

void MixSpaceAudioProcessor::uploadVersion (const juce::File&   file,
                                             const juce::String& description,
                                             const juce::String& projectId)
{
    if (authState.load() != AuthState::LoggedIn)
    {
        notifyUploadChange (UploadState::Error, "No hay sesion activa");
        return;
    }

    if (!file.existsAsFile())
    {
        notifyUploadChange (UploadState::Error, "Archivo no encontrado");
        return;
    }

    uploadState.store (UploadState::Uploading);
    notifyUploadChange (UploadState::Uploading, "Subiendo...");

    const juce::String currentToken = token;

    threadPool->addJob ([this, file, description, projectId, currentToken]
    {
        juce::URL url (juce::String (API_BASE) + "/versions/upload");
        url = url.withFileToUpload ("file",        file,        "application/octet-stream");
        url = url.withParameter    ("description", description);
        url = url.withParameter    ("project_id",  projectId);

        int statusCode = 0;
        juce::StringPairArray responseHeaders;

        // inAddress lets JUCE build a proper multipart/form-data request
        auto stream = url.createInputStream (
            juce::URL::InputStreamOptions (juce::URL::ParameterHandling::inAddress)
                .withExtraHeaders        ("Authorization: Bearer " + currentToken)
                .withConnectionTimeoutMs (60000)
                .withResponseHeaders     (&responseHeaders)
                .withStatusCode          (&statusCode));

        const bool ok = (stream != nullptr && statusCode == 201);

        juce::MessageManager::callAsync ([this, ok, statusCode]
        {
            if (ok)
            {
                uploadState.store (UploadState::Success);
                notifyUploadChange (UploadState::Success, "Version subida correctamente");
            }
            else
            {
                uploadState.store (UploadState::Error);
                notifyUploadChange (UploadState::Error,
                    "Error al subir (codigo " + juce::String (statusCode) + ")");
            }
        });
    });
}

// ─── Listener notification helpers ───────────────────────────────────────────

void MixSpaceAudioProcessor::notifyAuthChange (AuthState s)
{
    authListeners.call ([s](AuthStateListener& l) { l.authStateChanged (s); });
}

void MixSpaceAudioProcessor::notifyUploadChange (UploadState s, const juce::String& msg)
{
    uploadMessage = msg;
    uploadListeners.call ([s, &msg](UploadStateListener& l)
    {
        l.uploadStateChanged (s, msg);
    });
}

void MixSpaceAudioProcessor::notifyProjectsLoaded (const juce::Array<Project>& projects)
{
    projectsListeners.call ([&projects](ProjectsListener& l)
    {
        l.projectsLoaded (projects);
    });
}

// ─── HTTP helpers ─────────────────────────────────────────────────────────────

juce::var MixSpaceAudioProcessor::httpPost (const juce::String& urlStr,
                                             const juce::String& jsonBody,
                                             const juce::String& bearerToken)
{
    juce::URL url (urlStr);
    url = url.withPOSTData (jsonBody);

    juce::String extraHeaders = "Content-Type: application/json\r\n";
    if (bearerToken.isNotEmpty())
        extraHeaders += "Authorization: Bearer " + bearerToken + "\r\n";

    int statusCode = 0;
    juce::StringPairArray responseHeaders;

    auto stream = url.createInputStream (
        juce::URL::InputStreamOptions (juce::URL::ParameterHandling::inPostData)
            .withExtraHeaders        (extraHeaders)
            .withConnectionTimeoutMs (10000)
            .withResponseHeaders     (&responseHeaders)
            .withStatusCode          (&statusCode));

    if (stream == nullptr)
        return {};

    return juce::JSON::parse (stream->readEntireStreamAsString());
}

juce::var MixSpaceAudioProcessor::httpGet (const juce::String& urlStr,
                                            const juce::String& bearerToken)
{
    juce::URL url (urlStr);

    juce::String extraHeaders;
    if (bearerToken.isNotEmpty())
        extraHeaders += "Authorization: Bearer " + bearerToken + "\r\n";

    int statusCode = 0;
    juce::StringPairArray responseHeaders;

    auto stream = url.createInputStream (
        juce::URL::InputStreamOptions (juce::URL::ParameterHandling::inAddress)
            .withExtraHeaders        (extraHeaders)
            .withConnectionTimeoutMs (10000)
            .withResponseHeaders     (&responseHeaders)
            .withStatusCode          (&statusCode));

    if (stream == nullptr)
        return {};

    return juce::JSON::parse (stream->readEntireStreamAsString());
}

// ─── Plugin factory ───────────────────────────────────────────────────────────

juce::AudioProcessor* JUCE_CALLTYPE createPluginFilter()
{
    return new MixSpaceAudioProcessor();
}
