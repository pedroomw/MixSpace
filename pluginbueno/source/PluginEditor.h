#pragma once
#include "PluginProcessor.h"

class HolaMundoPluginAudioProcessorEditor : public juce::AudioProcessorEditor
{
public:
    explicit HolaMundoPluginAudioProcessorEditor(HolaMundoPluginAudioProcessor&);
    void paint(juce::Graphics&) override;
    void resized() override;

private:
    HolaMundoPluginAudioProcessor& audioProcessor;
    juce::TextButton saveVersionButton { "Guardar Version" };
};