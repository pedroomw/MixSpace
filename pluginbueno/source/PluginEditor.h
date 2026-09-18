#pragma once
#include "PluginProcessor.h"

// ─── Project picker popup content ────────────────────────────────────────────
// This component lives inside the CallOutBox. It shows a scrollable list of
// projects and calls onSelected when the user clicks one.

class ProjectPickerContent : public juce::Component
{
public:
    std::function<void(const Project&)> onSelected;

    explicit ProjectPickerContent (const juce::Array<Project>& projects)
    {
        for (const auto& p : projects)
        {
            auto* btn = buttons.add (std::make_unique<juce::TextButton> (p.name));
            const Project captured = p;

            btn->setColour (juce::TextButton::buttonColourId,  juce::Colour (0xff2a2a2a));
            btn->setColour (juce::TextButton::textColourOffId, juce::Colour (0xffffffff));
            btn->onClick = [this, captured]
            {
                if (onSelected)
                    onSelected (captured);
            };
            addAndMakeVisible (btn);
        }

        // Empty state
        if (projects.isEmpty())
        {
            emptyLabel.setText ("Sin proyectos", juce::dontSendNotification);
            emptyLabel.setColour (juce::Label::textColourId, juce::Colour (0xffaaaaaa));
            emptyLabel.setJustificationType (juce::Justification::centred);
            addAndMakeVisible (emptyLabel);
        }

        const int rows    = juce::jmax (1, projects.size());
        const int height  = juce::jmin (rows * ROW_H, MAX_H);
        setSize (WIDTH, height);
    }

    void resized() override
    {
        auto area = getLocalBounds();

        if (buttons.isEmpty())
        {
            emptyLabel.setBounds (area);
            return;
        }

        for (auto* btn : buttons)
            btn->setBounds (area.removeFromTop (ROW_H));
    }

private:
    static constexpr int WIDTH = 260;
    static constexpr int ROW_H = 36;
    static constexpr int MAX_H = 200;

    juce::OwnedArray<juce::TextButton> buttons;
    juce::Label emptyLabel;
};

// ─── Editor ──────────────────────────────────────────────────────────────────

class MixSpaceAudioProcessorEditor
    : public juce::AudioProcessorEditor
    , public AuthStateListener
    , public UploadStateListener
    , public ProjectsListener
{
public:
    explicit MixSpaceAudioProcessorEditor (MixSpaceAudioProcessor&);
    ~MixSpaceAudioProcessorEditor() override;

    void paint   (juce::Graphics&) override;
    void resized () override;

    // ── Listener callbacks ─────────────────────────────────────────────────
    void authStateChanged   (AuthState  newState)                            override;
    void uploadStateChanged (UploadState newState, const juce::String& msg)  override;
    void projectsLoaded     (const juce::Array<Project>& projects)           override;

private:
    MixSpaceAudioProcessor& audioProcessor;

    // ── Login screen ───────────────────────────────────────────────────────
    juce::TextButton loginButton    { "Iniciar sesion" };
    juce::Label      loginStatusLabel;

    // ── Upload screen ──────────────────────────────────────────────────────
    juce::TextButton  chooseFileButton   { "Elegir archivo .flp" };
    juce::Label       fileNameLabel;
    juce::TextEditor  descriptionEditor;

    // Project picker — button opens a CallOutBox with the list
    juce::TextButton  projectPickerButton { "Seleccionar proyecto..." };
    juce::Label       selectedProjectLabel;   // shown below button when picked

    juce::TextButton  uploadButton   { "Subir version" };
    juce::TextButton  logoutButton   { "Cerrar sesion" };
    juce::Label       uploadStatusLabel;

    juce::File   selectedFile;
    Project      selectedProject;   // filled when user picks from popup
    bool         hasSelectedProject { false };

    // ── Helpers ────────────────────────────────────────────────────────────
    void layoutLoginScreen  (juce::Rectangle<int> area);
    void layoutUploadScreen (juce::Rectangle<int> area);
    void refreshVisibility  ();

    void handleChooseFile();
    void handleUpload();
    void showProjectPicker();

    // colour palette
    static constexpr juce::uint32 COL_BG      = 0xff1a1a1a;
    static constexpr juce::uint32 COL_SURFACE  = 0xff2a2a2a;
    static constexpr juce::uint32 COL_ACCENT   = 0xffb44fd6;
    static constexpr juce::uint32 COL_TEXT     = 0xffffffff;
    static constexpr juce::uint32 COL_MUTED    = 0xffaaaaaa;
    static constexpr juce::uint32 COL_SUCCESS  = 0xff10b981;
    static constexpr juce::uint32 COL_ERROR    = 0xffef4444;

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR (MixSpaceAudioProcessorEditor)
};
