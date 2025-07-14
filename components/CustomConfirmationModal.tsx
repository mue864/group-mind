import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface CustomConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  iconName?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  subtitle?: string;
}

const CustomConfirmationModal: React.FC<CustomConfirmationModalProps> = ({
  visible,
  onClose,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  iconName = "people",
  iconColor = "#4facfe",
  subtitle,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.85);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50 p-5">
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
            width: "100%",
            maxWidth: 400,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.18,
            shadowRadius: 24,
            elevation: 16,
            borderRadius: 24,
            backgroundColor: "white",
          }}
        >
          {/* Header with close button */}
          <LinearGradient
            colors={["#4facfe", "#00f2fe"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="pt-7 pb-5 px-6 items-center rounded-t-2xl relative"
          >
            <Pressable
              onPress={onClose}
              style={{
                position: "absolute",
                top: 18,
                right: 18,
                zIndex: 2,
                padding: 4,
              }}
              hitSlop={8}
            >
              <Ionicons name="close" size={22} color="#fff" />
            </Pressable>
            <View className="bg-white/20 p-4 rounded-full mb-2">
              <Ionicons name={iconName} size={32} color={iconColor} />
            </View>
            <Text className="text-white text-xl font-bold text-center mb-1">
              {title}
            </Text>
            {subtitle && (
              <Text className="text-white/80 text-base text-center mb-1">
                {subtitle}
              </Text>
            )}
          </LinearGradient>

          {/* Body */}
          <View className="px-6 pt-6 pb-5 bg-white rounded-b-2xl">
            <Text className="text-gray-700 text-center text-base mb-7">
              {message}
            </Text>
            {/* Buttons */}
            <View className="flex-row justify-between gap-4">
              <TouchableOpacity
                onPress={onCancel}
                className="flex-1 border-2 border-blue-100 rounded-xl py-3 items-center bg-white"
                activeOpacity={0.85}
              >
                <Text className="text-blue-500 font-semibold text-base">
                  {cancelText}
                </Text>
              </TouchableOpacity>
              <LinearGradient
                colors={["#4facfe", "#00f2fe"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="flex-1 rounded-xl"
              >
                <TouchableOpacity
                  onPress={onConfirm}
                  className="py-3 items-center"
                  activeOpacity={0.85}
                  style={{ width: "100%" }}
                >
                  <Text className="text-white font-semibold text-base">
                    {confirmText}
                  </Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default CustomConfirmationModal;
