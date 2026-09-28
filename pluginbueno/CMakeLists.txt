cmake_minimum_required(VERSION 3.22)

project(MixSpace VERSION 1.0.0)

# TODO: change this path to wherever you cloned JUCE on THIS machine
add_subdirectory("C:/Users/devandroid/Desktop/JUCE-master" "JUCE-build")
juce_add_plugin(MixSpace
    COMPANY_NAME "MixSpace"
    IS_SYNTH FALSE
    NEEDS_MIDI_INPUT FALSE
    NEEDS_MIDI_OUTPUT FALSE
    NEEDS_WEBVIEW2 TRUE
    PLUGIN_MANUFACTURER_CODE Mxsp
    PLUGIN_CODE Mxsp
    FORMATS VST3
    PRODUCT_NAME "MixSpace")

target_sources(MixSpace
    PRIVATE
        source/PluginProcessor.cpp
        source/PluginEditor.cpp)

target_compile_definitions(MixSpace
    PUBLIC
        JUCE_WEB_BROWSER=1
        JUCE_USE_WIN_WEBVIEW2=1
        JUCE_USE_CURL=1
        JUCE_VST3_CAN_REPLACE_VST2=0)

target_link_libraries(MixSpace
    PRIVATE
        juce::juce_audio_utils
        juce::juce_core
        juce::juce_gui_extra
    PUBLIC
        juce::juce_recommended_config_flags
        juce::juce_recommended_lto_flags
        juce::juce_recommended_warning_flags)
