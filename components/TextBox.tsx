import { useState } from "react";
import { TextInput, View } from "react-native";

interface TextBoxProps {
  placeholder: string;
  method: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry: boolean;
  borderColor: boolean
}

const TextBox = ({ placeholder, value, onChangeText, method, secureTextEntry, borderColor }: TextBoxProps) => {

  return (
    <View>
      <TextInput
        placeholder={placeholder}
        onChangeText={onChangeText}
        value={value}
        secureTextEntry={secureTextEntry}
        keyboardType={method === "email" ? 'email-address' : "default"}
        
        className={`bg-muted-50 border ${borderColor? `border-muted` : `border-red-600`} w-full h-16 rounded-xl font-poppins-semiBold text-xl px-5 text-gray-500`}
      />
    </View>
  );
};

export default TextBox;
