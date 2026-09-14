#include "PluginEditor.h"

// ─── Constructor ──────────────────────────────────────────────────────────────

HolaMundoPluginAudioProcessorEditor::HolaMundoPluginAudioProcessorEditor
    (HolaMundoPluginAudioProcessor& p)
    : AudioProcessorEditor (&p), audioProcessor (p)
{
    setSize (440, 360);

    // ── Shared look ───────────────────────────────────────────────────────
    auto styleButton = [](juce::TextButton& b,
                          juce::uint32 bg, juce::uint32 fg)
    {
        b.setColour (juce::TextButton::buttonColourId,  juce::Colour (bg));
        b.setColour (juce::TextButton::textColourOffId, juce::Colour (fg));
    };

    // ── Login screen ──────────────────────────────────────────────────────
    styleButton (loginButton, COL_ACCENT, COL_TEXT);
    loginButton.onClick = [this] { audioProcessor.startLoginFlow(); };
    addAndMakeVisible (loginButton);

    loginStatusLabel.setJustificationType (juce::Justification::centred);
    loginStatusLabel.setColour (juce::Label::textColourId, juce::Colour (COL_MUTED));
    addAndMakeVisible (loginStatusLabel);

    // ── Upload screen ─────────────────────────────────────────────────────
    styleButton (chooseFileButton, COL_SURFACE, COL_TEXT);
    chooseFileButton.onClick = [this] { handleChooseFile(); };
    addAndMakeVisible (chooseFileButton);

    fileNameLabel.setText ("Ningun archivo seleccionado", juce::dontSendNotification);
    fileNameLabel.setColour (juce::Label::textColourId, juce::Colour (COL_MUTED));
    fileNameLabel.setJustificationType (juce::Justification::centredLeft);
    addAndMakeVisible (fileNameLabel);

    descriptionEditor.setMultiLine (false);
    descriptionEditor.setTextToShowWhenEmpty ("Descripcion...",
                                              juce::Colour (COL_MUTED));
    descriptionEditor.setColour (juce::TextEditor::backgroundColourId,
                                 juce::Colour (COL_SURFACE));
    descriptionEditor.setColour (juce::TextEditor::textColourId,
                                 juce::Colour (COL_TEXT));
    descriptionEditor.setColour (juce::TextEditor::outlineColourId,
                                 juce::Colour (0xff444444));
    addAndMakeVisible (descriptionEditor);

    projectIdEditor.setMultiLine (false);
    projectIdEditor.setTextToShowWhenEmpty ("ID del proyecto...",
                                            juce::Colour (COL_MUTED));
    projectIdEditor.setColour (juce::TextEditor::backgroundColourId,
                               juce::Colour (COL_SURFACE));
    projectIdEditor.setColour (juce::TextEditor::textColourId,
                               juce::Colour (COL_TEXT));
    projectIdEditor.setColour (juce::TextEditor::outlineColourId,
                               juce::Colour (0xff444444));
    addAndMakeVisible (projectIdEditor);

    styleButton (uploadButton, COL_ACCENT, COL_TEXT);
    uploadButton.onClick = [this] { handleUpload(); };
    addAndMakeVisible (uploadButton);

    styleButton (logoutButton, COL_SURFACE, COL_MUTED);
    logoutButton.onClick = [this] { audioProcessor.logout(); };
    addAndMakeVisible (logoutButton);

    uploadStatusLabel.setJustificationType (juce::Justification::centred);
    uploadStatusLabel.setColour (juce::Label::textColourId,
                                 juce::Colour (COL_MUTED));
    addAndMakeVisible (uploadStatusLabel);

    // ── Register as listener ──────────────────────────────────────────────
    audioProcessor.addAuthListener   (this);
    audioProcessor.addUploadListener (this);

    refreshVisibility();
}

// ─── Destructor ───────────────────────────────────────────────────────────────

HolaMundoPluginAudioProcessorEditor::~HolaMundoPluginAudioProcessorEditor()
{
    audioProcessor.removeAuthListener   (this);
    audioProcessor.removeUploadListener (this);
}

// ─── Listener callbacks ───────────────────────────────────────────────────────

void HolaMundoPluginAudioProcessorEditor::authStateChanged (AuthState newState)
{
    // Always called on the message thread (processor ensures this)
    switch (newState)
    {
        case AuthState::LoggedOut:
            loginStatusLabel.setText ("", juce::dontSendNotification);
            loginStatusLabel.setColour (juce::Label::textColourId,
                                        juce::Colour (COL_MUTED));
            loginButton.setEnabled (true);  // always re-enable on logout
            break;

        case AuthState::WaitingForBrowser:
            loginStatusLabel.setText ("Esperando login en el navegador...",
                                      juce::dontSendNotification);
            loginButton.setEnabled (false);
            break;

        case AuthState::LoggedIn:
            loginButton.setEnabled (true);
            uploadStatusLabel.setText ("", juce::dontSendNotification);
            break;
    }

    refreshVisibility();
    repaint();
}

void HolaMundoPluginAudioProcessorEditor::uploadStateChanged (UploadState newState,
                                                               const juce::String& msg)
{
    uploadStatusLabel.setText (msg, juce::dontSendNotification);

    juce::uint32 colour = COL_MUTED;
    switch (newState)
    {
        case UploadState::Uploading: colour = COL_MUTED;    break;
        case UploadState::Success:   colour = COL_SUCCESS;  break;
        case UploadState::Error:     colour = COL_ERROR;    break;
        default: break;
    }

    uploadStatusLabel.setColour (juce::Label::textColourId, juce::Colour (colour));
    uploadButton.setEnabled (newState != UploadState::Uploading);
    repaint();
}

// ─── Paint ───────────────────────────────────────────────────────────────────

void HolaMundoPluginAudioProcessorEditor::paint (juce::Graphics& g)
{
    g.fillAll (juce::Colour (COL_BG));

    // Logo / title at the top
    g.setColour (juce::Colour (COL_ACCENT));
    g.setFont (juce::Font (20.0f, juce::Font::bold));
    g.drawText ("MixSpace", getLocalBounds().removeFromTop (48),
                juce::Justification::centred, true);

    const AuthState state = audioProcessor.getAuthState();

    if (state == AuthState::LoggedOut || state == AuthState::WaitingForBrowser)
    {
        // Subtitle
        g.setColour (juce::Colour (COL_MUTED));
        g.setFont (13.0f);
        auto sub = getLocalBounds().removeFromTop (80);
        sub.removeFromTop (48);
        g.drawText ("Inicia sesion para subir versiones",
                    sub, juce::Justification::centred, true);
    }
    else
    {
        // "Subir version" heading
        g.setColour (juce::Colour (COL_MUTED));
        g.setFont (13.0f);
        auto sub = getLocalBounds().removeFromTop (80);
        sub.removeFromTop (48);
        g.drawText ("Sube una nueva version de tu proyecto",
                    sub, juce::Justification::centred, true);
    }
}

// ─── Resized ─────────────────────────────────────────────────────────────────

void HolaMundoPluginAudioProcessorEditor::resized()
{
    auto area = getLocalBounds().reduced (24);
    area.removeFromTop (64); // space for painted title + subtitle

    const AuthState state = audioProcessor.getAuthState();

    if (state == AuthState::LoggedOut || state == AuthState::WaitingForBrowser)
        layoutLoginScreen (area);
    else
        layoutUploadScreen (area);
}

// ─── Layout helpers ───────────────────────────────────────────────────────────

void HolaMundoPluginAudioProcessorEditor::layoutLoginScreen (juce::Rectangle<int> area)
{
    area.removeFromTop (16);
    loginButton.setBounds      (area.removeFromTop (42));
    area.removeFromTop (8);
    loginStatusLabel.setBounds (area.removeFromTop (24));
}

void HolaMundoPluginAudioProcessorEditor::layoutUploadScreen (juce::Rectangle<int> area)
{
    // Row 1: choose file button
    chooseFileButton.setBounds (area.removeFromTop (36));
    area.removeFromTop (4);

    // Row 2: file name label
    fileNameLabel.setBounds (area.removeFromTop (20));
    area.removeFromTop (8);

    // Row 3: description field
    descriptionEditor.setBounds (area.removeFromTop (36));
    area.removeFromTop (6);

    // Row 4: project id field
    projectIdEditor.setBounds (area.removeFromTop (36));
    area.removeFromTop (10);

    // Row 5: upload + logout buttons side by side
    auto buttonRow = area.removeFromTop (36);
    logoutButton.setBounds  (buttonRow.removeFromRight (110));
    buttonRow.removeFromRight (8);
    uploadButton.setBounds  (buttonRow);

    // Row 6: status
    area.removeFromTop (8);
    uploadStatusLabel.setBounds (area.removeFromTop (24));
}

// ─── Visibility toggle ────────────────────────────────────────────────────────

void HolaMundoPluginAudioProcessorEditor::refreshVisibility()
{
    const bool loggedIn = (audioProcessor.getAuthState() == AuthState::LoggedIn);

    loginButton.setVisible       (!loggedIn);
    loginStatusLabel.setVisible  (!loggedIn);

    chooseFileButton.setVisible  (loggedIn);
    fileNameLabel.setVisible     (loggedIn);
    descriptionEditor.setVisible (loggedIn);
    projectIdEditor.setVisible   (loggedIn);
    uploadButton.setVisible      (loggedIn);
    logoutButton.setVisible      (loggedIn);
    uploadStatusLabel.setVisible (loggedIn);

    // Trigger a fresh layout pass — do NOT call resized() directly here
    // because resized() is already called by JUCE when visibility changes
    // on child components. We just need to repaint.
    resized();
}

// ─── File picker ──────────────────────────────────────────────────────────────

void HolaMundoPluginAudioProcessorEditor::handleChooseFile()
{
    auto chooser = std::make_shared<juce::FileChooser> (
        "Seleccionar proyecto FL Studio",
        juce::File::getSpecialLocation (juce::File::userDocumentsDirectory),
        "*.flp");

    chooser->launchAsync (
        juce::FileBrowserComponent::openMode |
        juce::FileBrowserComponent::canSelectFiles,
        [this, chooser] (const juce::FileChooser& fc)
        {
            const auto results = fc.getResults();
            if (results.isEmpty()) return;

            selectedFile = results[0];

            juce::String name = selectedFile.getFileName();
            if (name.length() > 40)
                name = name.substring (0, 37) + "...";

            fileNameLabel.setText (name, juce::dontSendNotification);
            fileNameLabel.setColour (juce::Label::textColourId,
                                     juce::Colour (COL_TEXT));
        });
}

// ─── Upload trigger ───────────────────────────────────────────────────────────

void HolaMundoPluginAudioProcessorEditor::handleUpload()
{
    if (!selectedFile.existsAsFile())
    {
        uploadStatusLabel.setText ("Primero selecciona un archivo .flp",
                                   juce::dontSendNotification);
        uploadStatusLabel.setColour (juce::Label::textColourId,
                                     juce::Colour (COL_ERROR));
        return;
    }

    const juce::String description = descriptionEditor.getText().trim();
    const juce::String projectId   = projectIdEditor.getText().trim();

    if (description.isEmpty())
    {
        uploadStatusLabel.setText ("La descripcion es obligatoria",
                                   juce::dontSendNotification);
        uploadStatusLabel.setColour (juce::Label::textColourId,
                                     juce::Colour (COL_ERROR));
        return;
    }

    if (projectId.isEmpty())
    {
        uploadStatusLabel.setText ("El ID del proyecto es obligatorio",
                                   juce::dontSendNotification);
        uploadStatusLabel.setColour (juce::Label::textColourId,
                                     juce::Colour (COL_ERROR));
        return;
    }

    audioProcessor.uploadVersion (selectedFile, description, projectId);
}
