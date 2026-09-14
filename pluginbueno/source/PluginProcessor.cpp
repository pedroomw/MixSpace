#include "PluginProcessor.h"
#include "PluginEditor.h"

// ─── Constructor / Destructor ────────────────────────────────────────────────

HolaMundoPluginAudioProcessor::HolaMundoPluginAudioProcessor()
    : AudioProcessor (BusesProperties()
        .withInput  ("Input",  juce::AudioChannelSet::stereo(), true)
        .withOutput ("Output", juce::AudioChannelSet::stereo(), true))
{
    threadPool = std::make_unique<juce::ThreadPool> (2);
}

HolaMundoPluginAudioProcessor::~HolaMundoPluginAudioProcessor()
{
    // Signal any running poll to stop before joining threads
    authState.store (AuthState::LoggedOut);
    threadPool->removeAllJobs (true, 3000);
}

// ─── Editor factory ──────────────────────────────────────────────────────────

juce::AudioProcessorEditor* HolaMundoPluginAudioProcessor::createEditor()
{
    return new HolaMundoPluginAudioProcessorEditor (*this);
}

// ─── Auth ────────────────────────────────────────────────────────────────────

void HolaMundoPluginAudioProcessor::startLoginFlow()
{
    // Generate a random session ID (UUID-ish hex string)
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

    // Update state and UI immediately (we're on the message thread here)
    authState.store (AuthState::WaitingForBrowser);
    notifyAuthChange (AuthState::WaitingForBrowser);

    // All network work — including the registration POST — goes in the background
    // so the message thread (and therefore the UI) never blocks.
    threadPool->addJob ([this, sessionId]
    {
        const juce::String registerUrl =
            juce::String (API_BASE) + "/auth/plugin-session/" + sessionId;

        const juce::var registerResult = httpPost (registerUrl, "{}");

        if (registerResult.isVoid())
        {
            // API unreachable — bail out on the message thread
            juce::MessageManager::callAsync ([this]
            {
                authState.store (AuthState::LoggedOut);
                notifyAuthChange (AuthState::LoggedOut);
            });
            return;
        }

        // Open the browser from the message thread (required on some platforms)
        juce::MessageManager::callAsync ([sessionId]
        {
            const juce::String browserUrl =
                "http://localhost:5173?sessionId=" + sessionId;
            juce::URL (browserUrl).launchInDefaultBrowser();
        });

        // Now poll until we get the token
        pollForToken (sessionId);
    });
}

void HolaMundoPluginAudioProcessor::pollForToken (const juce::String& sessionId)
{
    // Must be called from a background thread only.
    constexpr int POLL_INTERVAL_MS = 2000;
    constexpr int MAX_ATTEMPTS     = 150; // 150 × 2 s = 5 min

    const juce::String pollUrl =
        juce::String (API_BASE) + "/auth/plugin-session/" + sessionId;

    for (int attempt = 0; attempt < MAX_ATTEMPTS; ++attempt)
    {
        // Abort if state changed (logout or new flow started)
        if (authState.load() != AuthState::WaitingForBrowser)
            return;

        juce::Thread::sleep (POLL_INTERVAL_MS);

        if (authState.load() != AuthState::WaitingForBrowser)
            return;

        const juce::var result = httpGet (pollUrl);

        if (result.isVoid())
            continue; // network hiccup — keep polling

        const juce::String status = result["status"].toString();

        if (status == "ready")
        {
            const juce::String receivedToken = result["token"].toString();

            juce::MessageManager::callAsync ([this, receivedToken]
            {
                token = receivedToken;
                authState.store (AuthState::LoggedIn);
                notifyAuthChange (AuthState::LoggedIn);
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

        // status == "pending" → keep waiting
    }

    // Timed out
    juce::MessageManager::callAsync ([this]
    {
        authState.store (AuthState::LoggedOut);
        notifyAuthChange (AuthState::LoggedOut);
    });
}

void HolaMundoPluginAudioProcessor::logout()
{
    // Safe to call from any thread — dispatch to message thread for UI updates
    juce::MessageManager::callAsync ([this]
    {
        token.clear();
        pendingSessionId.clear();
        authState.store (AuthState::LoggedOut);
        notifyAuthChange (AuthState::LoggedOut);
    });
}

// ─── Upload ──────────────────────────────────────────────────────────────────

void HolaMundoPluginAudioProcessor::uploadVersion (const juce::File&   file,
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
        // withFileToUpload triggers multipart/form-data automatically in JUCE.
        // withParameter adds the text fields alongside the file part.
        // We must NOT pass inPostData here — JUCE picks the right encoding
        // when a file is present.
        juce::URL url (juce::String (API_BASE) + "/versions/upload");
        url = url.withFileToUpload ("file",        file,        "application/octet-stream");
        url = url.withParameter    ("description", description);
        url = url.withParameter    ("project_id",  projectId);

        int statusCode = 0;
        juce::StringPairArray responseHeaders;

        auto stream = url.createInputStream (
            juce::URL::InputStreamOptions (juce::URL::ParameterHandling::inPostData)
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
// These must always be called on the message thread.

void HolaMundoPluginAudioProcessor::notifyAuthChange (AuthState s)
{
    authListeners.call ([s](AuthStateListener& l) { l.authStateChanged (s); });
}

void HolaMundoPluginAudioProcessor::notifyUploadChange (UploadState        s,
                                                         const juce::String& msg)
{
    uploadMessage = msg;
    uploadListeners.call ([s, &msg](UploadStateListener& l)
    {
        l.uploadStateChanged (s, msg);
    });
}

// ─── HTTP helpers ─────────────────────────────────────────────────────────────

juce::var HolaMundoPluginAudioProcessor::httpPost (const juce::String& urlStr,
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

    const juce::String body = stream->readEntireStreamAsString();
    return juce::JSON::parse (body);
}

juce::var HolaMundoPluginAudioProcessor::httpGet (const juce::String& urlStr,
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

    const juce::String body = stream->readEntireStreamAsString();
    return juce::JSON::parse (body);
}

// ─── Plugin factory ───────────────────────────────────────────────────────────

juce::AudioProcessor* JUCE_CALLTYPE createPluginFilter()
{
    return new HolaMundoPluginAudioProcessor();
}
