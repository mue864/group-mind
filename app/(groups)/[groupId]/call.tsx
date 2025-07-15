/**
 * Group Call Screen
 *
 * This screen provides the entry point for video and audio calling functionality.
 * It handles call type selection and integrates with the VideoCall component.
 *
 * Features:
 * - Call type selection (audio/video)
 * - User authentication validation
 * - Agora service initialization
 * - Seamless transition to video call interface
 * - Error handling and user feedback
 *
 * @author GroupMind Team
 * @version 1.0.0
 */

import VideoCall from "@/components/VideoCall";
import AgoraService from "@/services/agoraService";
import { useGroupContext } from "@/store/GroupContext";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";

// Get singleton instance of Agora service
const agoraService = AgoraService.getInstance();

/**
 * GroupCallScreen Component - Main call entry point
 *
 * This component serves as the main interface for initiating video and audio calls.
 * It provides a call type selection interface and handles the transition to the
 * actual video calling experience.
 */
export default function GroupCallScreen() {
  // Get group ID from route parameters
  const { groupId } = useLocalSearchParams();

  // Get user context for authentication and user info
  const { user, userInformation } = useGroupContext();

  // Group name for display (can be enhanced to get from group context)
  const groupName = "Group"; // You can get this from your group context if needed

  // State management for call type and call status
  const [callType, setCallType] = useState<"audio" | "video">("video");
  const [isInCall, setIsInCall] = useState(false);

  /**
   * Initialize Agora service and validate user authentication
   * This effect runs when the component mounts to ensure proper setup
   */
  useEffect(() => {
    // Check if user is authenticated
    if (!user || !userInformation) {
      // User not authenticated, redirecting
      Alert.alert(
        "Authentication Required",
        "Please sign in to join the call.",
        [{ text: "OK", onPress: () => router.back() }]
      );
      return;
    }

    // Check if groupId is provided
    if (!groupId) {
      // Group ID missing, redirecting
      Alert.alert("Invalid Call", "Group ID is missing.", [
        { text: "OK", onPress: () => router.back() },
      ]);
      return;
    }

    // Initialize Agora service for video calling
    const initializeAgora = async () => {
      try {
        // Initializing Agora service
        await agoraService.initialize();
        // Agora service initialized successfully
      } catch (error) {
        console.error("GroupCallScreen: Failed to initialize Agora:", error);
        Alert.alert(
          "Call Error",
          "Failed to initialize video calling. Please try again.",
          [{ text: "OK", onPress: () => router.back() }]
        );
      }
    };

    initializeAgora();
  }, [user, userInformation, groupId]);

  /**
   * Handle call ending
   * Destroys Agora service and navigates back to group
   */
  const handleEndCall = async () => {
    try {
      // Ending call
      await agoraService.destroy();
      Alert.alert("Call Ended", "You have left the call.", [
        {
          text: "OK",
          onPress: () => router.push(`/(groups)/${groupId}`),
        },
      ]);
    } catch (error) {
      console.error("GroupCallScreen: Error ending call:", error);
      router.push(`/(groups)/${groupId}`);
    }
  };

  /**
   * Start a call with the specified type
   * Transitions from call selection to actual call interface
   *
   * @param type - Type of call to start (audio or video)
   */
  const handleStartCall = (type: "audio" | "video") => {
    // Starting call
    setCallType(type);
    setIsInCall(true);
  };

  // Render call type selection interface if not in call
  if (!isInCall) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#F5F6FA",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Status bar for call selection screen */}
        <StatusBar style="dark" />

        {/* Call type selection container */}
        <View style={{ padding: 20, alignItems: "center" }}>
          {/* Screen title */}
          <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>
            Start Group Call
          </Text>

          {/* Video call button */}
          <TouchableOpacity
            style={{
              backgroundColor: "#4169E1",
              paddingHorizontal: 30,
              paddingVertical: 15,
              borderRadius: 25,
              marginBottom: 15,
              flexDirection: "row",
              alignItems: "center",
            }}
            onPress={() => handleStartCall("video")}
            accessibilityLabel="Start video call"
            accessibilityRole="button"
          >
            <Ionicons
              name="videocam"
              size={24}
              color="#fff"
              style={{ marginRight: 10 }}
            />
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
              Start Video Call
            </Text>
          </TouchableOpacity>

          {/* Audio call button */}
          <TouchableOpacity
            style={{
              backgroundColor: "#059669",
              paddingHorizontal: 30,
              paddingVertical: 15,
              borderRadius: 25,
              flexDirection: "row",
              alignItems: "center",
            }}
            onPress={() => handleStartCall("audio")}
            accessibilityLabel="Start audio call"
            accessibilityRole="button"
          >
            <Ionicons
              name="call"
              size={24}
              color="#fff"
              style={{ marginRight: 10 }}
            />
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
              Start Audio Call
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Render video call interface when call is active
  return (
    <View style={{ flex: 1 }}>
      {/* Hide status bar for immersive call experience */}
      <StatusBar hidden />

      {/* VideoCall component with call configuration */}
      <VideoCall
        channelName={`group-${groupId}`}
        onEndCall={handleEndCall}
        callType={callType}
        groupName={groupName}
      />
    </View>
  );
}
