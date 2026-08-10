#include "PluginProcessor.h"
#include "PluginEditor.h"

HolaMundoPluginAudioProcessor::HolaMundoPluginAudioProcessor()
    : AudioProcessor(BusesProperties()
        .withInput("Input", juce::AudioChannelSet::stereo(), true)
        .withOutput("Output", juce::AudioChannelSet::stereo(), true))
{
}

juce::AudioProcessorEditor* HolaMundoPluginAudioProcessor::createEditor()
{
    return new HolaMundoPluginAudioProcessorEditor(*this);
}

juce::AudioProcessor* JUCE_CALLTYPE createPluginFilter()
{
    return new HolaMundoPluginAudioProcessor();
}