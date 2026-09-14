#pragma once
#include "PluginProcessor.h"

// ─── Editor ──────────────────────────────────────────────────────────────────

class HolaMundoPluginAudioProcessorEditor
    : public juce::AudioProcessorEditor
    , public AuthStateListener
    , public UploadStateListener
{
public:
    explicit HolaMundoPluginAudioProcessorEditor (HolaMundoPluginAudioProcessor&);
    ~HolaMundoPluginAudioProcessorEditor() override;

    void paint   (juce::Graphics&) override;
    void resized () override;

    // ── Listener callbacks ─────────────────────────────────────────────────
    void authStateChanged   (AuthState  newState)                              override;
    void uploadStateChanged (UploadState newState, const juce::String& msg)   override;

private:
    HolaMundoPluginAudioProcessor& audioProcessor;

    // ── Login screen ───────────────────────────────────────────────────────
    juce::TextButton loginButton    { "Iniciar sesion" };
    juce::Label      loginStatusLabel;

    // ── Upload screen ──────────────────────────────────────────────────────
    juce::TextButton  chooseFileButton   { "Elegir archivo .flp" };
    juce::Label       fileNameLabel;
    juce::TextEditor  descriptionEditor;
    juce::TextEditor  projectIdEditor;
    juce::TextButton  uploadButton       { "Subir version" };
    juce::TextButton  logoutButton       { "Cerrar sesion" };
    juce::Label       uploadStatusLabel;

    juce::File selectedFile;

    // ── Helpers ────────────────────────────────────────────────────────────
    void layoutLoginScreen  (juce::Rectangle<int> area);
    void layoutUploadScreen (juce::Rectangle<int> area);
    void refreshVisibility  ();

    void handleChooseFile();
    void handleUpload();

    // colour palette
    static constexpr juce::uint32 COL_BG      = 0xff1a1a1a;
    static constexpr juce::uint32 COL_SURFACE  = 0xff2a2a2a;
    static constexpr juce::uint32 COL_ACCENT   = 0xffb44fd6;
    static constexpr juce::uint32 COL_TEXT     = 0xffffffff;
    static constexpr juce::uint32 COL_MUTED    = 0xffaaaaaa;
    static constexpr juce::uint32 COL_SUCCESS  = 0xff10b981;
    static constexpr juce::uint32 COL_ERROR    = 0xffef4444;

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR (HolaMundoPluginAudioProcessorEditor)
};
