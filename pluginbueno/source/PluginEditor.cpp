#include "PluginEditor.h"

HolaMundoPluginAudioProcessorEditor::HolaMundoPluginAudioProcessorEditor(HolaMundoPluginAudioProcessor& p)
    : AudioProcessorEditor(&p), audioProcessor(p)
{
    setSize(400, 200);

    // Estilo del botón
    saveVersionButton.setColour(juce::TextButton::buttonColourId, juce::Colour(0xffb44fd6)); // violeta tipo MixSpace
    saveVersionButton.setColour(juce::TextButton::textColourOffId, juce::Colours::white);

    // Qué pasa al hacer click
    saveVersionButton.onClick = [this]
    {
        juce::URL("http://localhost:5173").launchInDefaultBrowser();
    };

    addAndMakeVisible(saveVersionButton);
}

void HolaMundoPluginAudioProcessorEditor::paint(juce::Graphics& g)
{
    g.fillAll(juce::Colour(0xff1a1a1a)); // fondo oscuro
    g.setColour(juce::Colours::white);
    g.setFont(24.0f);
    g.drawText("Hola Mundo", getLocalBounds().removeFromTop(120), juce::Justification::centred, true);
}

void HolaMundoPluginAudioProcessorEditor::resized()
{
    auto area = getLocalBounds();
    area.removeFromTop(120); // deja espacio arriba para el texto
    saveVersionButton.setBounds(area.reduced(100, 20)); // botón centrado, con márgenes
}