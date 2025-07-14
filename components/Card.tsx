import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  gradient?: boolean;
  gradientColors?: string[];
  shadow?: "light" | "medium" | "heavy";
  borderRadius?: "small" | "medium" | "large" | "xl";
  padding?: "small" | "medium" | "large";
  backgroundColor?: string;
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  gradient = false,
  gradientColors = ["#ffffff", "#f8fafc"],
  shadow = "medium",
  borderRadius = "large",
  padding = "medium",
  backgroundColor = "#ffffff",
}) => {
  const getShadowStyle = () => {
    switch (shadow) {
      case "light":
        return {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 4,
          elevation: 3,
        };
      case "medium":
        return {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.12,
          shadowRadius: 16,
          elevation: 12,
        };
      case "heavy":
        return {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.18,
          shadowRadius: 24,
          elevation: 16,
        };
      default:
        return {};
    }
  };

  const getBorderRadius = () => {
    switch (borderRadius) {
      case "small":
        return 8;
      case "medium":
        return 16;
      case "large":
        return 24;
      case "xl":
        return 32;
      default:
        return 24;
    }
  };

  const getPadding = () => {
    switch (padding) {
      case "small":
        return 12;
      case "medium":
        return 20;
      case "large":
        return 24;
      default:
        return 20;
    }
  };

  const cardStyle = {
    borderRadius: getBorderRadius(),
    padding: getPadding(),
    ...getShadowStyle(),
  };

  if (gradient) {
    return (
      <LinearGradient
        colors={gradientColors}
        style={[styles.container, cardStyle, style]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {children}
      </LinearGradient>
    );
  }

  return (
    <View style={[styles.container, cardStyle, { backgroundColor }, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
});

export default Card;
