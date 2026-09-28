#include "PluginEditor.h"

// ─── Constructor ──────────────────────────────────────────────────────────────

MixSpaceAudioProcessorEditor::MixSpaceAudioProcessorEditor (MixSpaceAudioProcessor& p)
    : AudioProcessorEditor (&p), audioProcessor (p)
{
    // Plugin window size — big enough to show the React web app comfortably
    setSize (960, 620);
    setResizable (true, false);

    addAndMakeVisible (browser);

    audioProcessor.addAuthListener (this);

    // If already logged in (e.g. plugin reopened mid-session) go straight to the app.
    // Otherwise kick off the login flow: the processor generates a sessionId,
    // registers it with the API, and starts polling. authStateChanged() will
    // be called with WaitingForBrowser and we navigate the embedded browser there.
    if (audioProcessor.getAuthState() == AuthState::LoggedIn)
        browser.goToURL ("http://localhost:5173");
    else
        audioProcessor.startLoginFlow();
}

// ─── Destructor ───────────────────────────────────────────────────────────────

MixSpaceAudioProcessorEditor::~MixSpaceAudioProcessorEditor()
{
    audioProcessor.removeAuthListener (this);
}

// ─── AuthStateListener ───────────────────────────────────────────────────────

void MixSpaceAudioProcessorEditor::authStateChanged (AuthState newState)
{
    // Must be called on the message thread — JUCE guarantees this via callAsync.
    switch (newState)
    {
        case AuthState::WaitingForBrowser:
        {
            // Navigate the embedded browser to the React login page with the
            // sessionId so the user can log in without leaving FL Studio.
            const juce::String url = audioProcessor.getLoginUrl();
            if (url.isNotEmpty())
                browser.goToURL (url);
            break;
        }

        case AuthState::LoggedIn:
            // Login completed — load the full app (no sessionId needed anymore).
            browser.goToURL ("http://localhost:5173");
            break;

        case AuthState::LoggedOut:
            // Session ended or error — show the app root so the user can log in again.
            browser.goToURL ("http://localhost:5173");
            break;
    }
}

// ─── Paint ───────────────────────────────────────────────────────────────────

void MixSpaceAudioProcessorEditor::paint (juce::Graphics& g)
{
    // Dark background shown only during the brief moment before the browser loads.
    g.fillAll (juce::Colour (0xff111111));
}

// ─── Resized ─────────────────────────────────────────────────────────────────

void MixSpaceAudioProcessorEditor::resized()
{
    browser.setBounds (getLocalBounds());
}
