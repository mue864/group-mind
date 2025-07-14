import React, { useState } from "react";
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  checkUnifiedPermissions,
  requestUnifiedPermissions,
} from "../utils/permissions";

export const PermissionTest: React.FC = () => {
  const [testResults, setTestResults] = useState({
    permissions: "",
    unified: "",
    directMedia: "",
    webrtcService: "",
  });
  const [isTesting, setIsTesting] = useState(false);

  const testPermissions = async () => {
    setTestResults((prev) => ({ ...prev, permissions: "Testing..." }));

    try {
      const result = await requestUnifiedPermissions("video");
      setTestResults((prev) => ({
        ...prev,
        permissions: `✅ Success: Audio=${result.microphone}, Video=${result.camera}`,
      }));
    } catch (error) {
      setTestResults((prev) => ({
        ...prev,
        permissions: `❌ Failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      }));
    }
  };

  const testUnifiedCheck = async () => {
    setTestResults((prev) => ({ ...prev, unified: "Testing..." }));

    try {
      const result = await checkUnifiedPermissions("video");
      setTestResults((prev) => ({
        ...prev,
        unified: `✅ Check: Audio=${result.microphone}, Video=${result.camera}`,
      }));
    } catch (error) {
      setTestResults((prev) => ({
        ...prev,
        unified: `❌ Failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      }));
    }
  };

  const testDirectMediaAccess = async () => {
    setTestResults((prev) => ({ ...prev, directMedia: "Testing..." }));

    try {
      console.log("Testing direct media access...");

      // Test audio only
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      console.log(
        "Audio access successful:",
        audioStream.getAudioTracks().length,
        "tracks"
      );
      audioStream.getTracks().forEach((track) => track.stop());

      // Test video only
      const videoStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      console.log(
        "Video access successful:",
        videoStream.getVideoTracks().length,
        "tracks"
      );
      videoStream.getTracks().forEach((track) => track.stop());

      // Test both
      const bothStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      console.log("Both access successful:", {
        audio: bothStream.getAudioTracks().length,
        video: bothStream.getVideoTracks().length,
      });
      bothStream.getTracks().forEach((track) => track.stop());

      setTestResults((prev) => ({
        ...prev,
        directMedia: "✅ All media access successful",
      }));
    } catch (error) {
      console.error("Direct media access failed:", error);
      setTestResults((prev) => ({
        ...prev,
        directMedia: `❌ Failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      }));
    }
  };

  const testWebRTCService = async () => {
    setTestResults((prev) => ({ ...prev, webrtcService: "Testing..." }));

    try {
      console.log("Testing WebRTC service...");

      // Test the service directly
      const stream = await webrtcService.initializeCall(
        "test-room",
        "test-user",
        "Test User",
        false,
        false,
        "video"
      );

      console.log("WebRTC service test successful:", {
        audioTracks: stream.getAudioTracks().length,
        videoTracks: stream.getVideoTracks().length,
      });

      // Clean up
      stream.getTracks().forEach((track) => track.stop());
      await webrtcService.endCall();

      setTestResults((prev) => ({
        ...prev,
        webrtcService: "✅ WebRTC service working",
      }));
    } catch (error) {
      console.error("WebRTC service test failed:", error);
      setTestResults((prev) => ({
        ...prev,
        webrtcService: `❌ Failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      }));
    }
  };

  const showSettingsAlert = () => {
    Alert.alert(
      "Permission Settings",
      "Would you like to open your device settings to check camera and microphone permissions?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Open Settings",
          onPress: () => openAppSettings(),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Permission Test Tool</Text>
      <Text style={styles.subtitle}>
        Use this to debug camera/microphone issues
      </Text>

      <View className="space-y-4">
        <TouchableOpacity
          onPress={testPermissions}
          className="bg-blue-500 p-3 rounded-lg"
          disabled={isTesting}
        >
          <Text className="text-white text-center font-semibold">
            Test Permission Request
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={testUnifiedCheck}
          className="bg-green-500 p-3 rounded-lg"
          disabled={isTesting}
        >
          <Text className="text-white text-center font-semibold">
            Test Permission Check
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={testDirectMediaAccess}
          className="bg-purple-500 p-3 rounded-lg"
          disabled={isTesting}
        >
          <Text className="text-white text-center font-semibold">
            Test Direct Media Access
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={testWebRTCService}
          className="bg-orange-500 p-3 rounded-lg"
          disabled={isTesting}
        >
          <Text className="text-white text-center font-semibold">
            Test WebRTC Service
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={showSettingsAlert}
          className="bg-red-500 p-3 rounded-lg"
        >
          <Text className="text-white text-center font-semibold">
            Open Settings
          </Text>
        </TouchableOpacity>
      </View>

      {/* Test Results */}
      <View className="mt-6 space-y-2">
        <Text className="text-lg font-bold text-gray-800">Test Results:</Text>
        
        {testResults.permissions && (
          <View className="bg-gray-100 p-3 rounded-lg">
            <Text className="font-semibold text-gray-700">Permission Request:</Text>
            <Text className="text-gray-600">{testResults.permissions}</Text>
          </View>
        )}
        
        {testResults.unified && (
          <View className="bg-gray-100 p-3 rounded-lg">
            <Text className="font-semibold text-gray-700">Permission Check:</Text>
            <Text className="text-gray-600">{testResults.unified}</Text>
          </View>
        )}
        
        {testResults.directMedia && (
          <View className="bg-gray-100 p-3 rounded-lg">
            <Text className="font-semibold text-gray-700">Direct Media Access:</Text>
            <Text className="text-gray-600">{testResults.directMedia}</Text>
          </View>
        )}
        
        {testResults.webrtcService && (
          <View className="bg-gray-100 p-3 rounded-lg">
            <Text className="font-semibold text-gray-700">WebRTC Service:</Text>
            <Text className="text-gray-600">{testResults.webrtcService}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: "#666",
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 20,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  audioButton: {
    backgroundColor: "#4CAF50",
  },
  videoButton: {
    backgroundColor: "#2196F3",
  },
  checkButton: {
    backgroundColor: "#FF9800",
  },
  webrtcButton: {
    backgroundColor: "#9C27B0",
  },
  settingsButton: {
    backgroundColor: "#607D8B",
  },
  clearButton: {
    backgroundColor: "#F44336",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  noResults: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
  },
  resultText: {
    fontSize: 14,
    marginBottom: 4,
    color: "#333",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
});

export default PermissionTest;
