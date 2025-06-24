import React, { useState } from "react";
// ...imports
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Clipboard,
  useColorScheme,
  SafeAreaView,
} from "react-native";
import Constants from "expo-constants";
import * as Speech from "expo-speech";
import RNPickerSelect from "react-native-picker-select";

const GEMINI_API_KEY = Constants.expoConfig?.extra?.GEMINI_API_KEY;

const LANGUAGES = [
  { label: "🇦🇲 Armenian", code: "hy" },
  { label: "🇸🇦 Arabic", code: "ar" },
  { label: "🇲🇷 Mauritanian Arabic", code: "ar-MR" },
  { label: "🇦🇿 Azerbaijani", code: "az" },
  { label: "🇧🇩 Bengali", code: "bn" },
  { label: "🇧🇦 Bosnian", code: "bs" },
  { label: "🇧🇬 Bulgarian", code: "bg" },
  { label: "🇧🇷 Brazilian Portuguese", code: "pt-BR" },
  { label: "🇨🇳 Chinese", code: "zh" },
  { label: "🇭🇰 Cantonese", code: "yue" },
  { label: "🇭🇷 Croatian", code: "hr" },
  { label: "🇨🇿 Czech", code: "cs" },
  { label: "🇩🇰 Danish", code: "da" },
  { label: "🇳🇱 Dutch", code: "nl" },
  { label: "🇺🇸 English", code: "en" },
  { label: "🇪🇪 Estonian", code: "et" },
  { label: "🇵🇭 Filipino", code: "tl" },
  { label: "🇫🇮 Finnish", code: "fi" },
  { label: "🇫🇷 French", code: "fr" },
  { label: "🇬🇷 Greek", code: "el" },
  { label: "🇮🇱 Hebrew", code: "he" },
  { label: "🇮🇳 Hindi", code: "hi" },
  { label: "🇭🇺 Hungarian", code: "hu" },
  { label: "🇮🇸 Icelandic", code: "is" },
  { label: "🇮🇩 Indonesian", code: "id" },
  { label: "🇮🇪 Irish", code: "ga" },
  { label: "🇯🇵 Japanese", code: "ja" },
  { label: "🇰🇿 Kazakh", code: "kk" },
  { label: "🇰🇭 Khmer", code: "km" },
  { label: "🇰🇷 Korean", code: "ko" },
  { label: "🇱🇻 Latvian", code: "lv" },
  { label: "🇱🇹 Lithuanian", code: "lt" },
  { label: "🇱🇺 Luxembourgish", code: "lb" },
  { label: "🇲🇬 Malagasy", code: "mg" },
  { label: "🇲🇾 Malay", code: "ms" },
  { label: "🇲🇰 Macedonian", code: "mk" },
  { label: "🇲🇳 Mongolian", code: "mn" },
  { label: "🇲🇹 Maltese", code: "mt" },
  { label: "🇲🇲 Burmese", code: "my" },
  { label: "🇳🇴 Norwegian", code: "no" },
  { label: "🇵🇰 Urdu", code: "ur" },
  { label: "🇵🇱 Polish", code: "pl" },
  { label: "🇵🇹 Portuguese", code: "pt" },
  { label: "🇷🇴 Romanian", code: "ro" },
  { label: "🇷🇺 Russian", code: "ru" },
  { label: "🇷🇸 Serbian", code: "sr" },
  { label: "🇸🇰 Slovak", code: "sk" },
  { label: "🇸🇮 Slovenian", code: "sl" },
  { label: "🇿🇦 Zulu", code: "zu" },
  { label: "🇸🇳 Wolof", code: "wo" },
  { label: "🇸🇪 Swedish", code: "sv" },
  { label: "🇸🇵 Spanish", code: "es" },
  { label: "🇹🇭 Thai", code: "th" },
  { label: "🇹🇷 Turkish", code: "tr" },
  { label: "🇺🇦 Ukrainian", code: "uk" },
  { label: "🇺🇿 Uzbek", code: "uz" },
  { label: "🇻🇳 Vietnamese", code: "vi" },
  { label: "🇬🇧 Welsh", code: "cy" },
];

export default function App() {
  const [inputText, setInputText] = useState("");
  const [targetLang, setTargetLang] = useState("en");
  const [translatedText, setTranslatedText] = useState("");
  const [copied, setCopied] = useState(false);
  const isDark = useColorScheme() === "dark";
  const isTranslated = translatedText && translatedText !== "Translating...";

  const translateWithGemini = async (text: string, target: string) => {
    const prompt = `Translate the following sentence into ${target}.
Only return the translated text with pronunciation in parentheses.

Sentence: ${text}`;
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 200,
            },
          }),
        },
      );
      const data = await response.json();
      const output = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      return output || "[No translation returned]";
    } catch (err) {
      console.error("Gemini Error:", err);
      return "[Translation failed]";
    }
  };

  const handleTranslate = async () => {
    if (!inputText || !targetLang) {
      setTranslatedText("Please enter text and select a language.");
      return;
    }
    setTranslatedText("Translating...");
    setCopied(false);
    const langName =
      LANGUAGES.find((l) => l.code === targetLang)?.label || targetLang;
    const translated = await translateWithGemini(
      inputText,
      langName.replace(/.*? /, ""),
    );
    setTranslatedText(translated);
  };

  const handleClear = () => {
    setInputText("");
    setTranslatedText("");
    setCopied(false);
  };

  const handleReverseTranslation = () => {
    if (!translatedText) return;
    setInputText(translatedText);
    setTargetLang("en");
  };

  const handleSpeak = () => {
    const speakText =
      translatedText.match(/\(([^)]+)\)/)?.[1] || translatedText;
    Speech.speak(speakText);
  };

  const handleCopy = () => {
    Clipboard.setString(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDark ? "#000" : "#fff" }}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { backgroundColor: isDark ? "#000" : "#fff" },
        ]}
      >
        <Text style={[styles.title, { color: isDark ? "#fff" : "#000" }]}>
          🌍 SalinTalk
        </Text>

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: isDark ? "#1c1c1e" : "#fff",
              color: isDark ? "#fff" : "#000",
            },
          ]}
          placeholder="Type or paste text here..."
          placeholderTextColor={isDark ? "#888" : "#999"}
          value={inputText}
          onChangeText={setInputText}
          multiline
        />

        <Text style={[styles.label, { color: isDark ? "#fff" : "#000" }]}>
          Translate to:
        </Text>

        <View style={styles.pickerWrapper}>
          <RNPickerSelect
            onValueChange={(value) => setTargetLang(value)}
            value={targetLang}
            placeholder={{ label: "Select language...", value: null }}
            items={LANGUAGES.map((lang) => ({
              label: lang.label,
              value: lang.code,
            }))}
            style={{
              inputIOS: {
                fontSize: 16,
                paddingVertical: 12,
                paddingHorizontal: 10,
                borderWidth: 1,
                borderColor: "gray",
                borderRadius: 10,
                color: isDark ? "#fff" : "#000",
                backgroundColor: isDark ? "#1c1c1e" : "#fff",
                paddingRight: 30,
              },
              inputAndroid: {
                fontSize: 16,
                paddingHorizontal: 10,
                paddingVertical: 8,
                borderWidth: 1,
                borderColor: "gray",
                borderRadius: 10,
                color: isDark ? "#fff" : "#000",
                backgroundColor: isDark ? "#1c1c1e" : "#fff",
                paddingRight: 30,
              },
            }}
            useNativeAndroidPickerStyle={false}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleTranslate}>
          <Text style={styles.buttonText}>🌐 Translate</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, !isTranslated && styles.disabledButton]}
          onPress={handleReverseTranslation}
          disabled={!isTranslated}
        >
          <Text style={styles.buttonText}>↩️ Reverse Translate</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleCopy}
          disabled={!isTranslated}
          style={!isTranslated && styles.disabledButton}
        >
          <Text style={[styles.output, { color: isDark ? "#eee" : "#333" }]}>
            {translatedText || "Translation will appear here."}
          </Text>
        </TouchableOpacity>

        {copied && (
          <Text
            style={[
              styles.copiedNotice,
              { color: isDark ? "#90ee90" : "green" },
            ]}
          >
            ✅ Copied to clipboard!
          </Text>
        )}

        <TouchableOpacity
          style={[styles.speakButton, !isTranslated && styles.disabledButton]}
          onPress={handleSpeak}
          disabled={!isTranslated}
        >
          <Text style={styles.buttonText}>🔊 Speak</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.clearButton, !isTranslated && styles.disabledButton]}
          onPress={handleClear}
          disabled={!isTranslated}
        >
          <Text style={styles.clearButtonText}>🧹 Clear Text</Text>
        </TouchableOpacity>

        {/* Divider + About Us */}
        <View style={styles.divider} />

        <View style={styles.footer}>
          <Text
            style={[styles.footerTitle, { color: isDark ? "#aaa" : "#555" }]}
          >
            About Us
          </Text>
          <Text
            style={[styles.footerText, { color: isDark ? "#777" : "#888" }]}
          >
            SalinTalk helps you translate your thoughts into 60+ languages —
            fast, accurate, and simple.
          </Text>
          <Text
            style={[styles.footerCredit, { color: isDark ? "#999" : "#666" }]}
          >
            Developed with ❤️ by Michael Entera
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    paddingHorizontal: 20,
    alignItems: "center",
    flexGrow: 1,
  },
  title: {
    fontSize: 36,
    fontWeight: "800",
    marginBottom: 30,
  },
  input: {
    width: "100%",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  pickerWrapper: {
    width: "100%",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#2196f3",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 50,
    marginBottom: 10,
  },
  speakButton: {
    backgroundColor: "#4caf50",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 50,
    marginBottom: 40,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  clearButton: {
    backgroundColor: "#f44336",
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 50,
    marginBottom: 10,
  },
  clearButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  disabledButton: {
    opacity: 0.5,
  },

  output: {
    fontSize: 18,
    marginVertical: 20,
    textAlign: "center",
    paddingHorizontal: 10,
  },
  copiedNotice: {
    marginBottom: 10,
    fontWeight: "bold",
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#ccc",
    marginVertical: 30,
    opacity: 0.2,
  },
  footer: {
    alignItems: "center",
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  footerTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },
  footerText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 10,
  },
  footerCredit: {
    fontSize: 12,
    fontStyle: "italic",
  },
});
