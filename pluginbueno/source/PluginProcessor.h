#pragma once
#include <juce_audio_processors/juce_audio_processors.h>
#include <juce_core/juce_core.h>

// ─── States ──────────────────────────────────────────────────────────────────

enum class AuthState   { LoggedOut, WaitingForBrowser, LoggedIn };
enum class UploadState { Idle, Uploading, Success, Error };

// ─── Data ────────────────────────────────────────────────────────────────────

struct Project
{
    juce::String id;
    juce::String name;
};

// ─── Listener interfaces ─────────────────────────────────────────────────────

struct AuthStateListener
{
    virtual ~AuthStateListener() = default;
    virtual void authStateChanged (AuthState newState) = 0;
};

struct UploadStateListener
{
    virtual ~UploadStateListener() = default;
    virtual void uploadStateChanged (UploadState newState,
                                     const juce::String& message) = 0;
};

struct ProjectsListener
{
    virtual ~ProjectsListener() = default;
    virtual void projectsLoaded (const juce::Array<Project>& projects) = 0;
};

// ─── Processor ───────────────────────────────────────────────────────────────

class MixSpaceAudioProcessor : public juce::AudioProcessor
{
public:
    MixSpaceAudioProcessor();
    ~MixSpaceAudioProcessor() override;

    // ── AudioProcessor boilerplate ─────────────────────────────────────────
    void prepareToPlay  (double, int) override {}
    void releaseResources() override {}
    void processBlock   (juce::AudioBuffer<float>&, juce::MidiBuffer&) override {}

    juce::AudioProcessorEditor* createEditor() override;
    bool hasEditor() const override { return true; }

    const juce::String getName() const override { return "MixSpace"; }
    bool acceptsMidi()  const override { return false; }
    bool producesMidi() const override { return false; }
    double getTailLengthSeconds() const override { return 0.0; }

    int  getNumPrograms()               override { return 1; }
    int  getCurrentProgram()            override { return 0; }
    void setCurrentProgram (int)        override {}
    const juce::String getProgramName (int) override { return {}; }
    void changeProgramName (int, const juce::String&) override {}

    void getStateInformation (juce::MemoryBlock&)   override {}
    void setStateInformation (const void*, int)     override {}

    // ── Auth ───────────────────────────────────────────────────────────────

    /** Generates a session ID, registers it on the API, opens the browser,
     *  and starts polling. Thread-safe to call from the message thread. */
    void startLoginFlow();
    void logout();

    AuthState    getAuthState() const { return authState.load(); }
    juce::String getToken()     const { return token; }

    void addAuthListener    (AuthStateListener* l) { authListeners.add (l); }
    void removeAuthListener (AuthStateListener* l) { authListeners.remove (l); }

    // ── Projects ───────────────────────────────────────────────────────────

    /** Fetches /projects from the API on a background thread.
     *  Calls projectsLoaded() on all listeners when done. */
    void fetchProjects();

    const juce::Array<Project>& getCachedProjects() const { return cachedProjects; }

    void addProjectsListener    (ProjectsListener* l) { projectsListeners.add (l); }
    void removeProjectsListener (ProjectsListener* l) { projectsListeners.remove (l); }

    // ── Upload ─────────────────────────────────────────────────────────────

    /** Upload a .flp file to POST /versions/upload.
     *  @param file        The .flp file chosen by the user.
     *  @param description Free-text description.
     *  @param projectId   Project UUID / ID string. */
    void uploadVersion (const juce::File& file,
                        const juce::String& description,
                        const juce::String& projectId);

    UploadState  getUploadState()   const { return uploadState.load(); }
    juce::String getUploadMessage() const { return uploadMessage; }

    void addUploadListener    (UploadStateListener* l) { uploadListeners.add (l); }
    void removeUploadListener (UploadStateListener* l) { uploadListeners.remove (l); }

private:
    // ── Auth internals ─────────────────────────────────────────────────────
    std::atomic<AuthState>  authState  { AuthState::LoggedOut };
    juce::String            token;
    juce::String            pendingSessionId;

    std::unique_ptr<juce::ThreadPool> threadPool;

    void pollForToken (const juce::String& sessionId);

    // ── Projects internals ─────────────────────────────────────────────────
    juce::Array<Project> cachedProjects;

    // ── Upload internals ───────────────────────────────────────────────────
    std::atomic<UploadState> uploadState { UploadState::Idle };
    juce::String             uploadMessage;

    // ── Listeners ──────────────────────────────────────────────────────────
    juce::ListenerList<AuthStateListener>   authListeners;
    juce::ListenerList<UploadStateListener> uploadListeners;
    juce::ListenerList<ProjectsListener>    projectsListeners;

    void notifyAuthChange    (AuthState s);
    void notifyUploadChange  (UploadState s, const juce::String& msg);
    void notifyProjectsLoaded (const juce::Array<Project>& projects);

    // ── HTTP helpers ───────────────────────────────────────────────────────
    static constexpr const char* API_BASE = "http://localhost:3000";

    static juce::var httpPost (const juce::String& url,
                               const juce::String& jsonBody,
                               const juce::String& bearerToken = {});

    static juce::var httpGet  (const juce::String& url,
                               const juce::String& bearerToken = {});

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR (MixSpaceAudioProcessor)
};
