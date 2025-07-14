import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

interface InputFieldProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoCorrect?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  error?: string;
  disabled?: boolean;
  icon?: string;
  iconPosition?: "left" | "right";
  onIconPress?: () => void;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  variant?: "default" | "outlined" | "filled";
  size?: "small" | "medium" | "large";
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "none",
  autoCorrect = false,
  multiline = false,
  numberOfLines = 1,
  maxLength,
  error,
  disabled = false,
  icon,
  iconPosition = "left",
  onIconPress,
  style,
  inputStyle,
  labelStyle,
  errorStyle,
  variant = "default",
  size = "medium",
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return {
          paddingVertical: 8,
          paddingHorizontal: 12,
          fontSize: 14,
          iconSize: 16,
        };
      case "medium":
        return {
          paddingVertical: 12,
          paddingHorizontal: 16,
          fontSize: 16,
          iconSize: 18,
        };
      case "large":
        return {
          paddingVertical: 16,
          paddingHorizontal: 20,
          fontSize: 18,
          iconSize: 20,
        };
      default:
        return {
          paddingVertical: 12,
          paddingHorizontal: 16,
          fontSize: 16,
          iconSize: 18,
        };
    }
  };

  const getVariantStyles = () => {
    const sizeStyles = getSizeStyles();

    switch (variant) {
      case "outlined":
        return {
          borderWidth: 2,
          borderColor: error ? "#ef4444" : isFocused ? "#667eea" : "#d1d5db",
          backgroundColor: "transparent",
          borderRadius: 12,
        };
      case "filled":
        return {
          borderWidth: 0,
          borderColor: "transparent",
          backgroundColor: error
            ? "#fef2f2"
            : isFocused
            ? "#f0f9ff"
            : "#f3f4f6",
          borderRadius: 12,
        };
      default:
        return {
          borderWidth: 1,
          borderColor: error ? "#ef4444" : isFocused ? "#667eea" : "#e5e7eb",
          backgroundColor: "#ffffff",
          borderRadius: 8,
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const variantStyles = getVariantStyles();

  const containerStyle: ViewStyle = {
    marginBottom: 16,
    ...style,
  };

  const inputContainerStyle: ViewStyle = {
    flexDirection: "row",
    alignItems: multiline ? "flex-start" : "center",
    paddingVertical: sizeStyles.paddingVertical,
    paddingHorizontal: sizeStyles.paddingHorizontal,
    ...variantStyles,
  };

  const inputTextStyle: TextStyle = {
    flex: 1,
    fontSize: sizeStyles.fontSize,
    color: disabled ? "#9ca3af" : "#1f2937",
    paddingVertical: 0,
    textAlignVertical: multiline ? "top" : "center",
    ...inputStyle,
  };

  const labelTextStyle: TextStyle = {
    fontSize: 14,
    fontWeight: "600",
    color: error ? "#ef4444" : "#374151",
    marginBottom: 6,
    ...labelStyle,
  };

  const errorTextStyle: TextStyle = {
    fontSize: 12,
    color: "#ef4444",
    marginTop: 4,
    marginLeft: 4,
    ...errorStyle,
  };

  const renderIcon = (iconName: string, position: "left" | "right") => {
    if (!iconName) return null;

    const iconStyle = {
      marginRight: position === "left" ? 12 : 0,
      marginLeft: position === "right" ? 12 : 0,
    };

    return (
      <TouchableOpacity
        onPress={onIconPress}
        disabled={!onIconPress}
        style={iconStyle}
      >
        <Ionicons
          name={iconName as any}
          size={sizeStyles.iconSize}
          color={error ? "#ef4444" : isFocused ? "#667eea" : "#6b7280"}
        />
      </TouchableOpacity>
    );
  };

  const renderPasswordToggle = () => {
    if (!secureTextEntry) return null;

    return (
      <TouchableOpacity
        onPress={() => setShowPassword(!showPassword)}
        style={{ marginLeft: 12 }}
      >
        <Ionicons
          name={showPassword ? "eye-off" : "eye"}
          size={sizeStyles.iconSize}
          color="#6b7280"
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={containerStyle}>
      {label && <Text style={labelTextStyle}>{label}</Text>}

      <View style={inputContainerStyle}>
        {icon && iconPosition === "left" && renderIcon(icon, "left")}

        <TextInput
          style={inputTextStyle}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxLength={maxLength}
          editable={!disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {icon && iconPosition === "right" && renderIcon(icon, "right")}
        {renderPasswordToggle()}
      </View>

      {error && <Text style={errorTextStyle}>{error}</Text>}
    </View>
  );
};

export default InputField;
