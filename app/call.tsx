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
  // Get group ID and channel from route parameters
  const { groupId, channel, type } = useLocalSearchParams();

  // Get user context for authentication and user info
  const { user, userInformation } = useGroupContext();

  // Group name for display (can be enhanced to get from group context)
  const groupName = "Group"; // You can get this from your group context if needed

  // State management for call type and call status
  const [callType, setCallType] = useState<"audio" | "video">(
    (type as "audio" | "video") || "video"
  );
  const [isInCall, setIsInCall] = useState(false);
  const [agoraUid, setAgoraUid] = useState<number | null>(null);

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

    // Check if groupId and channel are provided
    if (!groupId || !channel) {
      // Required parameters missing, redirecting
      Alert.alert("Invalid Call", "Call parameters are missing.", [
        { text: "OK", onPress: () => router.back() },
      ]);
      return;
    }

    // Generate a unique numeric UID for Agora
    let uid = 0;
    if (userInformation?.userID) {
      const parsed = parseInt(
        userInformation.userID.replace(/\D/g, "").slice(-8)
      );
      uid =
        !isNaN(parsed) && parsed > 0
          ? parsed
          : Math.floor(Math.random() * 1000000);
    } else {
      uid = Math.floor(Math.random() * 1000000);
    }
    setAgoraUid(uid);
    console.log("Agora UID:", uid);
  }, [user, userInformation, groupId, channel]);

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
   * @param callType - Type of call to start (audio or video)
   */
  const handleStartCall = (callType: "audio" | "video") => {
    // Starting call
    setCallType(callType);
    setIsInCall(true);
  };

  // Render call type selection interface if not in call
  if (!isInCall) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        {/* Status bar for call selection screen */}
        <StatusBar style="dark" />

        {/* Call type selection container */}
        <View className="p-5 items-center">
          {/* Screen title */}
          <Text className="text-2xl font-bold mb-5">Start Group Call</Text>

          {/* Video call button */}
          <TouchableOpacity
            className="bg-primary px-8 py-4 rounded-full mb-4 flex-row items-center"
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
            <Text className="text-white text-base font-semibold">
              Start Video Call
            </Text>
          </TouchableOpacity>

          {/* Audio call button */}
          <TouchableOpacity
            className="bg-emerald-600 px-8 py-4 rounded-full flex-row items-center"
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
            <Text className="text-white text-base font-semibold">
              Start Audio Call
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Render the actual video call interface
  if (isInCall && agoraUid !== null) {
    return (
      <View className="flex-1">
        <StatusBar style="light" />
        <VideoCall
          channelName={channel as string}
          callType={callType}
          onEndCall={handleEndCall}
          groupName={groupName}
        />
      </View>
    );
  }
}
