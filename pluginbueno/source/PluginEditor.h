#pragma once
#include "PluginProcessor.h"
#include <juce_gui_extra/juce_gui_extra.h>

class MixSpaceAudioProcessorEditor
    : public juce::AudioProcessorEditor
    , public AuthStateListener
{
public:
    explicit MixSpaceAudioProcessorEditor (MixSpaceAudioProcessor&);
    ~MixSpaceAudioProcessorEditor() override;

    void paint   (juce::Graphics&) override;
    void resized () override;

    // AuthStateListener
    void authStateChanged (AuthState newState) override;

private:
    MixSpaceAudioProcessor& audioProcessor;

    // Give WebView2 a dedicated user-data folder so it can initialise
    // correctly when hosted inside FL Studio's process.
    static juce::WebBrowserComponent::Options makeBrowserOptions()
    {
        const auto dataFolder = juce::File::getSpecialLocation (
            juce::File::userApplicationDataDirectory)
            .getChildFile ("MixSpace").getChildFile ("WebView2");

        return juce::WebBrowserComponent::Options{}
            .withKeepPageLoadedWhenBrowserIsHidden()
            .withWinWebView2Options (
                juce::WebBrowserComponent::Options::WinWebView2{}
                    .withUserDataFolder (dataFolder)
                    .withStatusBarDisabled()
                    .withBuiltInErrorPageDisabled());
    }

    juce::WebBrowserComponent browser { makeBrowserOptions() };

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR (MixSpaceAudioProcessorEditor)
};
