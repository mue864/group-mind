import React, { useState } from "react";
import { Text, TextInput, View, ViewStyle } from "react-native";

interface TextBoxProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  errorText?: string;
  textColor?: string;
  style?: ViewStyle;
  textContentType?:
    | "none"
    | "URL"
    | "addressCity"
    | "addressCityAndState"
    | "addressState"
    | "countryName"
    | "creditCardNumber"
    | "emailAddress"
    | "familyName"
    | "fullStreetAddress"
    | "givenName"
    | "jobTitle"
    | "location"
    | "middleName"
    | "name"
    | "namePrefix"
    | "nameSuffix"
    | "nickname"
    | "organizationName"
    | "postalCode"
    | "streetAddressLine1"
    | "streetAddressLine2"
    | "sublocality"
    | "telephoneNumber"
    | "username"
    | "password"
    | "newPassword"
    | "oneTimeCode";
}

const TextBox = ({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  errorText,
  textColor = "#222",
  style,
  textContentType,
}: TextBoxProps) => {
  const [isFocused, setIsFocused] = useState(false);

  // NativeWind classNames for different states
  const baseInputClass =
    "font-poppins-semiBold h-16 rounded-xl p-3 text-gray-600 rounded-2xl text-lg py-2 bg-white border";
  const defaultBorder = "border-muted";
  const focusedBorder = "border-primary";
  const errorBorder = "border-[#ef4444]";

  const inputClassName = [
    baseInputClass,
    errorText ? errorBorder : isFocused ? focusedBorder : defaultBorder,
  ].join(" ");

  return (
    <View className="w-full" style={style}>
      <TextInput
        placeholder={placeholder}
        onChangeText={onChangeText}
        value={value}
        secureTextEntry={secureTextEntry}
        className={inputClassName}
        placeholderTextColor="#9EADD9"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        autoCapitalize="none"
        autoCorrect={false}
        textContentType={textContentType}
      />
      {!!errorText && (
        <Text className="text-[#ef4444] text-[13px] mt-1 ml-0.5 font-poppins-semiBold">
          {errorText}
        </Text>
      )}
    </View>
  );
};

export default TextBox;
