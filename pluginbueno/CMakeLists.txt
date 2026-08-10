cmake_minimum_required(VERSION 3.22)

project(HolaMundoPlugin VERSION 1.0.0)

# Apuntá esto a donde clonaste JUCE
add_subdirectory("C:/Users/devandroid/Desktop/JUCE-master" "JUCE-build")

juce_add_plugin(HolaMundoPlugin
    COMPANY_NAME "MiEmpresa"
    IS_SYNTH FALSE
    NEEDS_MIDI_INPUT FALSE
    NEEDS_MIDI_OUTPUT FALSE
    PLUGIN_MANUFACTURER_CODE Juce
    PLUGIN_CODE Hmnd
    FORMATS VST3
    PRODUCT_NAME "HolaMundoPlugin")

target_sources(HolaMundoPlugin
    PRIVATE
        source/PluginProcessor.cpp
        source/PluginEditor.cpp)

target_compile_definitions(HolaMundoPlugin
    PUBLIC
        JUCE_WEB_BROWSER=0
        JUCE_USE_CURL=0
        JUCE_VST3_CAN_REPLACE_VST2=0)

target_link_libraries(HolaMundoPlugin
    PRIVATE
        juce::juce_audio_utils
    PUBLIC
        juce::juce_recommended_config_flags
        juce::juce_recommended_lto_flags
        juce::juce_recommended_warning_flags)