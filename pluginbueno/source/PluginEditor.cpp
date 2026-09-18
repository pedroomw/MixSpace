#include "PluginEditor.h"

// ─── Constructor ──────────────────────────────────────────────────────────────

MixSpaceAudioProcessorEditor::MixSpaceAudioProcessorEditor
    (MixSpaceAudioProcessor& p)
    : AudioProcessorEditor (&p), audioProcessor (p)
{
    setSize (440, 380);

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
    descriptionEditor.setTextToShowWhenEmpty ("Descripcion...", juce::Colour (COL_MUTED));
    descriptionEditor.setColour (juce::TextEditor::backgroundColourId, juce::Colour (COL_SURFACE));
    descriptionEditor.setColour (juce::TextEditor::textColourId,       juce::Colour (COL_TEXT));
    descriptionEditor.setColour (juce::TextEditor::outlineColourId,    juce::Colour (0xff444444));
    addAndMakeVisible (descriptionEditor);

    // Project picker button
    styleButton (projectPickerButton, COL_SURFACE, COL_MUTED);
    projectPickerButton.onClick = [this] { showProjectPicker(); };
    addAndMakeVisible (projectPickerButton);

    // Small label shown below the picker button once a project is selected
    selectedProjectLabel.setFont (juce::Font (11.0f));
    selectedProjectLabel.setColour (juce::Label::textColourId, juce::Colour (COL_ACCENT));
    selectedProjectLabel.setJustificationType (juce::Justification::centredLeft);
    addAndMakeVisible (selectedProjectLabel);

    styleButton (uploadButton, COL_ACCENT, COL_TEXT);
    uploadButton.onClick = [this] { handleUpload(); };
    addAndMakeVisible (uploadButton);

    styleButton (logoutButton, COL_SURFACE, COL_MUTED);
    logoutButton.onClick = [this] { audioProcessor.logout(); };
    addAndMakeVisible (logoutButton);

    uploadStatusLabel.setJustificationType (juce::Justification::centred);
    uploadStatusLabel.setColour (juce::Label::textColourId, juce::Colour (COL_MUTED));
    addAndMakeVisible (uploadStatusLabel);

    // ── Register as listener ──────────────────────────────────────────────
    audioProcessor.addAuthListener     (this);
    audioProcessor.addUploadListener   (this);
    audioProcessor.addProjectsListener (this);

    refreshVisibility();
}

// ─── Destructor ───────────────────────────────────────────────────────────────

MixSpaceAudioProcessorEditor::~MixSpaceAudioProcessorEditor()
{
    audioProcessor.removeAuthListener     (this);
    audioProcessor.removeUploadListener   (this);
    audioProcessor.removeProjectsListener (this);
}

// ─── Listener callbacks ───────────────────────────────────────────────────────

void MixSpaceAudioProcessorEditor::authStateChanged (AuthState newState)
{
    switch (newState)
    {
        case AuthState::LoggedOut:
            loginStatusLabel.setText ("", juce::dontSendNotification);
            loginStatusLabel.setColour (juce::Label::textColourId, juce::Colour (COL_MUTED));
            loginButton.setEnabled (true);
            // Reset picker state on logout
            hasSelectedProject = false;
            selectedProject    = {};
            selectedProjectLabel.setText ("", juce::dontSendNotification);
            projectPickerButton.setButtonText ("Seleccionar proyecto...");
            projectPickerButton.setColour (juce::TextButton::textColourOffId,
                                           juce::Colour (COL_MUTED));
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

void MixSpaceAudioProcessorEditor::uploadStateChanged (UploadState newState,
                                                        const juce::String& msg)
{
    uploadStatusLabel.setText (msg, juce::dontSendNotification);

    juce::uint32 colour = COL_MUTED;
    switch (newState)
    {
        case UploadState::Uploading: colour = COL_MUTED;   break;
        case UploadState::Success:   colour = COL_SUCCESS; break;
        case UploadState::Error:     colour = COL_ERROR;   break;
        default: break;
    }

    uploadStatusLabel.setColour (juce::Label::textColourId, juce::Colour (colour));
    uploadButton.setEnabled (newState != UploadState::Uploading);
    repaint();
}

void MixSpaceAudioProcessorEditor::projectsLoaded (const juce::Array<Project>& projects)
{
    // Projects arrived — update picker button to signal they're ready.
    // The actual list is read directly from audioProcessor.getCachedProjects()
    // when the popup opens, so nothing else to do here.
    if (projects.isEmpty())
    {
        projectPickerButton.setButtonText ("Sin proyectos disponibles");
        projectPickerButton.setEnabled (false);
    }
    else
    {
        projectPickerButton.setButtonText (hasSelectedProject
            ? selectedProject.name
            : "Seleccionar proyecto...");
        projectPickerButton.setEnabled (true);
    }

    repaint();
}

// ─── Paint ───────────────────────────────────────────────────────────────────

void MixSpaceAudioProcessorEditor::paint (juce::Graphics& g)
{
    g.fillAll (juce::Colour (COL_BG));

    g.setColour (juce::Colour (COL_ACCENT));
    g.setFont (juce::Font (20.0f, juce::Font::bold));
    g.drawText ("MixSpace", getLocalBounds().removeFromTop (48),
                juce::Justification::centred, true);

    const AuthState state = audioProcessor.getAuthState();

    g.setColour (juce::Colour (COL_MUTED));
    g.setFont (13.0f);
    auto sub = getLocalBounds().removeFromTop (80);
    sub.removeFromTop (48);

    if (state == AuthState::LoggedOut || state == AuthState::WaitingForBrowser)
        g.drawText ("Inicia sesion para subir versiones", sub,
                    juce::Justification::centred, true);
    else
        g.drawText ("Sube una nueva version de tu proyecto", sub,
                    juce::Justification::centred, true);
}

// ─── Resized ─────────────────────────────────────────────────────────────────

void MixSpaceAudioProcessorEditor::resized()
{
    auto area = getLocalBounds().reduced (24);
    area.removeFromTop (64);

    const AuthState state = audioProcessor.getAuthState();

    if (state == AuthState::LoggedOut || state == AuthState::WaitingForBrowser)
        layoutLoginScreen (area);
    else
        layoutUploadScreen (area);
}

// ─── Layout helpers ───────────────────────────────────────────────────────────

void MixSpaceAudioProcessorEditor::layoutLoginScreen (juce::Rectangle<int> area)
{
    area.removeFromTop (16);
    loginButton.setBounds      (area.removeFromTop (42));
    area.removeFromTop (8);
    loginStatusLabel.setBounds (area.removeFromTop (24));
}

void MixSpaceAudioProcessorEditor::layoutUploadScreen (juce::Rectangle<int> area)
{
    // Row 1: choose file
    chooseFileButton.setBounds (area.removeFromTop (36));
    area.removeFromTop (4);

    // Row 2: file name
    fileNameLabel.setBounds (area.removeFromTop (20));
    area.removeFromTop (8);

    // Row 3: description
    descriptionEditor.setBounds (area.removeFromTop (36));
    area.removeFromTop (6);

    // Row 4: project picker button
    projectPickerButton.setBounds (area.removeFromTop (36));
    area.removeFromTop (3);

    // Row 5: selected project name (small, accent colour)
    selectedProjectLabel.setBounds (area.removeFromTop (16));
    area.removeFromTop (8);

    // Row 6: upload + logout
    auto buttonRow = area.removeFromTop (36);
    logoutButton.setBounds (buttonRow.removeFromRight (110));
    buttonRow.removeFromRight (8);
    uploadButton.setBounds (buttonRow);

    // Row 7: status
    area.removeFromTop (8);
    uploadStatusLabel.setBounds (area.removeFromTop (24));
}

// ─── Visibility toggle ────────────────────────────────────────────────────────

void MixSpaceAudioProcessorEditor::refreshVisibility()
{
    const bool loggedIn = (audioProcessor.getAuthState() == AuthState::LoggedIn);

    loginButton.setVisible        (!loggedIn);
    loginStatusLabel.setVisible   (!loggedIn);

    chooseFileButton.setVisible      (loggedIn);
    fileNameLabel.setVisible         (loggedIn);
    descriptionEditor.setVisible     (loggedIn);
    projectPickerButton.setVisible   (loggedIn);
    selectedProjectLabel.setVisible  (loggedIn);
    uploadButton.setVisible          (loggedIn);
    logoutButton.setVisible          (loggedIn);
    uploadStatusLabel.setVisible     (loggedIn);

    resized();
}

// ─── File picker ──────────────────────────────────────────────────────────────

void MixSpaceAudioProcessorEditor::handleChooseFile()
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
            fileNameLabel.setColour (juce::Label::textColourId, juce::Colour (COL_TEXT));
        });
}

// ─── Project picker popup ─────────────────────────────────────────────────────

void MixSpaceAudioProcessorEditor::showProjectPicker()
{
    const auto& projects = audioProcessor.getCachedProjects();

    // Build the content component on the heap; CallOutBox owns it
    auto* content = new ProjectPickerContent (projects);

    content->onSelected = [this] (const Project& picked)
    {
        selectedProject    = picked;
        hasSelectedProject = true;

        projectPickerButton.setButtonText (picked.name);
        projectPickerButton.setColour (juce::TextButton::textColourOffId,
                                       juce::Colour (COL_TEXT));

        selectedProjectLabel.setText ("ID: " + picked.id, juce::dontSendNotification);

        // Close the CallOutBox by finding it in the parent hierarchy
        if (auto* box = content->findParentComponentOfClass<juce::CallOutBox>())
            box->dismiss();
    };

    // Place the popup anchored to the picker button
    auto& box = juce::CallOutBox::launchAsynchronously (
        std::unique_ptr<juce::Component> (content),
        getLocalArea (&projectPickerButton, projectPickerButton.getLocalBounds()),
        this);

    box.setColour (juce::CallOutBox::backgroundColourId, juce::Colour (0xff2a2a2a));
}

// ─── Upload trigger ───────────────────────────────────────────────────────────

void MixSpaceAudioProcessorEditor::handleUpload()
{
    if (!selectedFile.existsAsFile())
    {
        uploadStatusLabel.setText ("Primero selecciona un archivo .flp",
                                   juce::dontSendNotification);
        uploadStatusLabel.setColour (juce::Label::textColourId, juce::Colour (COL_ERROR));
        return;
    }

    const juce::String description = descriptionEditor.getText().trim();

    if (description.isEmpty())
    {
        uploadStatusLabel.setText ("La descripcion es obligatoria",
                                   juce::dontSendNotification);
        uploadStatusLabel.setColour (juce::Label::textColourId, juce::Colour (COL_ERROR));
        return;
    }

    if (!hasSelectedProject)
    {
        uploadStatusLabel.setText ("Selecciona un proyecto primero",
                                   juce::dontSendNotification);
        uploadStatusLabel.setColour (juce::Label::textColourId, juce::Colour (COL_ERROR));
        return;
    }

    audioProcessor.uploadVersion (selectedFile, description, selectedProject.id);
}
