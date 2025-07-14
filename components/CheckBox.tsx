import { PrivacyStrings, TosStrings } from "@/constants";
import Colors from "@/constants/colors";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface CheckBoxProps {
  isPressed: boolean;
  onPress: () => void;
  page: string;
}

const EnhancedCheckBox: React.FC<CheckBoxProps> = ({
  isPressed,
  onPress,
  page,
}) => {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isPressed }}
      style={styles.container}
      hitSlop={8}
    >
      <View style={[styles.box, isPressed && styles.boxChecked]}>
        {isPressed && <View style={styles.checkmark} />}
      </View>
      <Text style={styles.label}>
        {page === "tos"
          ? TosStrings.termsAgreement
          : PrivacyStrings.privacyAgreement}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  box: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    transitionProperty: "background-color",
    transitionDuration: "200ms",
  },
  boxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    width: 12,
    height: 6,
    borderLeftWidth: 2.5,
    borderBottomWidth: 2.5,
    borderColor: "#fff",
    transform: [{ rotate: "-45deg" }],
    marginTop: 2,
  },
  label: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: "500",
    flexShrink: 1,
  },
});

export default EnhancedCheckBox;
