import Colors from "@/constants/colors";
import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View, ViewStyle } from "react-native";

interface TextBoxProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  errorText?: string;
  textColor?: string;
  style?: ViewStyle;
}

const TextBox = ({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  errorText,
  textColor = "#222",
  style,
}: TextBoxProps) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, style]}>
      <TextInput
        placeholder={placeholder}
        onChangeText={onChangeText}
        value={value}
        secureTextEntry={secureTextEntry}
        style={[
          styles.input,
          errorText
            ? styles.inputError
            : isFocused
            ? styles.inputFocused
            : styles.inputDefault,
          { color: textColor },
        ]}
        placeholderTextColor="#9EADD9"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {!!errorText && <Text style={styles.errorText}>{errorText}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    paddingHorizontal: 12,
    color: "#222",
    backgroundColor: "#fff",
    textAlignVertical: "center",
    textAlign: "left",
    includeFontPadding: false,
    paddingTop: 0,
    paddingBottom: 0,
  },
  inputDefault: {
    borderColor: Colors.muted,
  },
  inputFocused: {
    borderColor: Colors.primary,
  },
  inputError: {
    borderColor: "#ef4444",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 13,
    marginTop: 4,
    marginLeft: 2,
    fontFamily: "Poppins-SemiBold",
  },
});

export default TextBox;
