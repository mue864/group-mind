import React from "react";
import { StyleSheet, View } from "react-native";
import PermissionTest from "../../components/PermissionTest";

export default function PermissionTestScreen() {
  return (
    <View style={styles.container}>
      <PermissionTest />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
});
