/**
 * VideoCall Component
 * 
 * This component provides a complete video calling interface using Agora's React Native SDK.
 * It handles both audio and video calls with comprehensive controls and participant management.
 * 
 * Features:
 * - Local and remote video rendering
 * - Audio/video controls (mute, camera toggle, camera switch)
 * - Participant list with real-time updates
 * - Connection status display
 * - Call invitation integration
 * - Responsive layout for different screen sizes
 * - Accessibility support
 * 
 * @author GroupMind Team
 * @version 1.0.0
 */

import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { RtcSurfaceView, VideoSourceType } from "react-native-agora";
import AgoraService, { CallParticipant } from "../services/agoraService";
import { useGroupContext } from "../store/GroupContext";
import CallInvitation from "./CallInvitation";

// Get singleton instance of Agora service
const agoraService = AgoraService.getInstance();

/**
 * Props interface for VideoCall component
 */
interface VideoCallProps {
  channelName: string;           // Channel name for the call
  onEndCall: () => void;         // Callback when call ends
  callType: "audio" | "video";   // Type of call (audio or video)
  groupName?: string;            // Optional group name for display
}

// Get screen dimensions for responsive layout
const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

/**
 * VideoCall Component - Main video calling interface
 * 
 * This component renders the complete video calling experience including:
 * - Video streams for all participants
 * - Call controls (mute, video, camera switch, invite, end call)
 * - Connection status and participant count
 * - Call invitation modal
 */
const VideoCall: React.FC<VideoCallProps> = ({
  channelName,
  onEndCall,
  callType,
  groupName = "Group",
}) => {
  // Get user context for authentication and user info
  const { user, userInformation } = useGroupContext();
  
  // State management for call participants and controls
  const [participants, setParticipants] = useState<CallParticipant[]>([]);
  const [isLocalVideoEnabled, setIsLocalVideoEnabled] = useState(
    callType === "video"
  );
  const [isLocalAudioEnabled, setIsLocalAudioEnabled] = useState(true);
  const [isConnecting, setIsConnecting] = useState(true);
  const [connectionState, setConnectionState] = useState<number>(0);
  const [showInvitation, setShowInvitation] = useState(false);

  // Extract local and remote participants for easier rendering
  const localParticipant = participants.find((p) => p.isLocal);
  const remoteParticipants = participants.filter((p) => !p.isLocal);

  /**
   * Initialize the call when component mounts
   * Sets up Agora service callbacks and joins the channel
   */
  useEffect(() => {
    const initializeCall = async () => {
      try {
        console.log("VideoCall: Initializing call for channel:", channelName);
        setIsConnecting(true);

        // Set up callbacks for participant updates and connection state
        agoraService.setParticipantUpdateCallback(setParticipants);
        agoraService.setConnectionStateCallback(setConnectionState);

        // Join the specified channel
        await agoraService.joinChannel(channelName);

        // Set initial video/audio state based on call type
        if (callType === "audio") {
          await agoraService.enableLocalVideo(false);
          setIsLocalVideoEnabled(false);
        }

        setIsConnecting(false);
        console.log("VideoCall: Call initialized successfully");
      } catch (error) {
        console.error("VideoCall: Failed to initialize call:", error);
        Alert.alert("Error", "Failed to join the call. Please try again.");
        onEndCall();
      }
    };

    initializeCall();

    // Cleanup will be handled by the parent component
    return () => {
      console.log("VideoCall: Component unmounting");
    };
  }, [channelName, callType]);

  /**
   * Toggle local video stream on/off
   * Updates both Agora service and local state
   */
  const handleToggleVideo = async () => {
    try {
      const newState = !isLocalVideoEnabled;
      console.log("VideoCall: Toggling video:", newState);
      
      await agoraService.enableLocalVideo(newState);
      setIsLocalVideoEnabled(newState);
    } catch (error) {
      console.error("VideoCall: Failed to toggle video:", error);
    }
  };

  /**
   * Toggle local audio stream on/off (mute/unmute)
   * Updates both Agora service and local state
   */
  const handleToggleAudio = async () => {
    try {
      const newState = !isLocalAudioEnabled;
      console.log("VideoCall: Toggling audio:", newState);
      
      await agoraService.enableLocalAudio(newState);
      setIsLocalAudioEnabled(newState);
    } catch (error) {
      console.error("VideoCall: Failed to toggle audio:", error);
    }
  };

  /**
   * Switch between front and back camera
   * Only available on devices with multiple cameras
   */
  const handleSwitchCamera = async () => {
    try {
      console.log("VideoCall: Switching camera");
      await agoraService.switchCamera();
    } catch (error) {
      console.error("VideoCall: Failed to switch camera:", error);
    }
  };

  /**
   * End the current call
   * Leaves the channel and calls the onEndCall callback
   */
  const handleEndCall = async () => {
    try {
      console.log("VideoCall: Ending call");
      await agoraService.leaveChannel();
      onEndCall();
    } catch (error) {
      console.error("VideoCall: Failed to leave channel:", error);
      onEndCall();
    }
  };

  /**
   * Get human-readable connection status text
   * Maps Agora connection state codes to user-friendly messages
   * 
   * @returns Connection status string
   */
  const getConnectionStatusText = (): string => {
    switch (connectionState) {
      case 1:
        return "Connecting...";
      case 3:
        return "Connected";
      case 5:
        return "Reconnecting...";
      default:
        return "Disconnected";
    }
  };

  /**
   * Render local video stream or placeholder
   * Shows actual video feed or avatar placeholder based on video state
   * 
   * @returns Local video component
   */
  const renderLocalVideo = () => {
    if (!isLocalVideoEnabled || callType === "audio") {
      return (
        <View style={styles.localVideoPlaceholder}>
          <Ionicons name="person" size={40} color="#666" />
          <Text style={styles.placeholderText}>You</Text>
        </View>
      );
    }

    return (
      <RtcSurfaceView
        style={styles.localVideo}
        canvas={{
          uid: 0, // Local user always has UID 0
          sourceType: VideoSourceType.VideoSourceCamera,
        }}
      />
    );
  };

  /**
   * Render remote video streams or waiting message
   * Shows video feeds for all remote participants or waiting message
   * 
   * @returns Remote videos component
   */
  const renderRemoteVideos = () => {
    if (remoteParticipants.length === 0) {
      return (
        <View style={styles.noParticipantsContainer}>
          <Ionicons name="people" size={60} color="#666" />
          <Text style={styles.noParticipantsText}>
            Waiting for others to join...
          </Text>
        </View>
      );
    }

    return remoteParticipants.map((participant) => (
      <View key={participant.uid} style={styles.remoteVideoContainer}>
        {participant.isVideoEnabled ? (
          <RtcSurfaceView
            style={styles.remoteVideo}
            canvas={{
              uid: participant.uid,
              sourceType: VideoSourceType.VideoSourceCamera,
            }}
          />
        ) : (
          <View style={styles.remoteVideoPlaceholder}>
            <Ionicons name="person" size={40} color="#666" />
            <Text style={styles.placeholderText}>{participant.userName}</Text>
          </View>
        )}
        <View style={styles.participantInfo}>
          <Text style={styles.participantName}>{participant.userName}</Text>
          {!participant.isAudioEnabled && (
            <Ionicons name="mic-off" size={16} color="#ff4444" />
          )}
        </View>
      </View>
    ));
  };

  return (
    <View style={styles.container}>
      {/* Hide status bar for immersive experience */}
      <StatusBar hidden />

      {/* Header section with call info */}
      <View style={styles.header}>
        <Text style={styles.channelName}>{channelName}</Text>
        <Text style={styles.connectionStatus}>{getConnectionStatusText()}</Text>
        <Text style={styles.participantCount}>
          {participants.length} participant
          {participants.length !== 1 ? "s" : ""}
        </Text>
      </View>

      {/* Main video area */}
      <View style={styles.videoContainer}>
        {isConnecting ? (
          // Loading state while connecting
          <View style={styles.connectingContainer}>
            <Ionicons name="call" size={60} color="#4169E1" />
            <Text style={styles.connectingText}>Joining call...</Text>
          </View>
        ) : (
          // Video streams once connected
          <>
            {/* Remote participants video area */}
            <View style={styles.remoteVideosContainer}>
              {renderRemoteVideos()}
            </View>

            {/* Local video picture-in-picture */}
            <View style={styles.localVideoContainer}>{renderLocalVideo()}</View>
          </>
        )}
      </View>

      {/* Call controls bar */}
      <View style={styles.controls}>
        {/* Mute/Unmute button */}
        <TouchableOpacity
          style={[
            styles.controlButton,
            !isLocalAudioEnabled && styles.controlButtonDisabled,
          ]}
          onPress={handleToggleAudio}
          accessibilityLabel={isLocalAudioEnabled ? "Mute microphone" : "Unmute microphone"}
          accessibilityRole="button"
        >
          <Ionicons
            name={isLocalAudioEnabled ? "mic" : "mic-off"}
            size={24}
            color={isLocalAudioEnabled ? "#fff" : "#ff4444"}
          />
        </TouchableOpacity>

        {/* Video toggle button (only for video calls) */}
        {callType === "video" && (
          <>
            <TouchableOpacity
              style={[
                styles.controlButton,
                !isLocalVideoEnabled && styles.controlButtonDisabled,
              ]}
              onPress={handleToggleVideo}
              accessibilityLabel={isLocalVideoEnabled ? "Turn off camera" : "Turn on camera"}
              accessibilityRole="button"
            >
              <Ionicons
                name={isLocalVideoEnabled ? "videocam" : "videocam-off"}
                size={24}
                color={isLocalVideoEnabled ? "#fff" : "#ff4444"}
              />
            </TouchableOpacity>

            {/* Camera switch button */}
            <TouchableOpacity
              style={styles.controlButton}
              onPress={handleSwitchCamera}
              accessibilityLabel="Switch camera"
              accessibilityRole="button"
            >
              <Ionicons name="camera-reverse" size={24} color="#fff" />
            </TouchableOpacity>
          </>
        )}

        {/* Invite button */}
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => setShowInvitation(true)}
          accessibilityLabel="Invite others to call"
          accessibilityRole="button"
        >
          <Ionicons name="person-add" size={24} color="#fff" />
        </TouchableOpacity>

        {/* End call button */}
        <TouchableOpacity
          style={[styles.controlButton, styles.endCallButton]}
          onPress={handleEndCall}
          accessibilityLabel="End call"
          accessibilityRole="button"
        >
          <Ionicons name="call" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Call invitation modal */}
      <CallInvitation
        visible={showInvitation}
        onClose={() => setShowInvitation(false)}
        channelName={channelName}
        callType={callType}
        groupName={groupName}
      />
    </View>
  );
};

/**
 * Styles for the VideoCall component
 * Responsive design that adapts to different screen sizes
 */
const styles = StyleSheet.create({
  // Main container
  container: {
    flex: 1,
    backgroundColor: "#000",
  },

  // Header section
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },

  // Channel name display
  channelName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },

  // Connection status indicator
  connectionStatus: {
    color: "#ccc",
    fontSize: 14,
    marginBottom: 5,
  },

  // Participant count
  participantCount: {
    color: "#ccc",
    fontSize: 12,
  },

  // Main video container
  videoContainer: {
    flex: 1,
    position: "relative",
  },

  // Loading/connecting state
  connectingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
  },

  connectingText: {
    color: "#fff",
    fontSize: 18,
    marginTop: 20,
  },

  // Remote videos container
  remoteVideosContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // No participants waiting state
  noParticipantsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  noParticipantsText: {
    color: "#ccc",
    fontSize: 16,
    marginTop: 20,
    textAlign: "center",
  },

  // Individual remote video container
  remoteVideoContainer: {
    position: "relative",
    width: screenWidth,
    height: screenHeight * 0.7,
  },

  // Remote video stream
  remoteVideo: {
    width: "100%",
    height: "100%",
  },

  // Remote video placeholder (when video is disabled)
  remoteVideoPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#2a2a2a",
    justifyContent: "center",
    alignItems: "center",
  },

  // Participant info overlay
  participantInfo: {
    position: "absolute",
    bottom: 20,
    left: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },

  // Participant name
  participantName: {
    color: "#fff",
    fontSize: 14,
    marginRight: 5,
  },

  // Local video container (picture-in-picture)
  localVideoContainer: {
    position: "absolute",
    top: 100,
    right: 20,
    width: 120,
    height: 160,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#fff",
  },

  // Local video stream
  localVideo: {
    width: "100%",
    height: "100%",
  },

  // Local video placeholder
  localVideoPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#2a2a2a",
    justifyContent: "center",
    alignItems: "center",
  },

  // Placeholder text
  placeholderText: {
    color: "#ccc",
    fontSize: 12,
    marginTop: 5,
  },

  // Controls bar
  controls: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },

  // Individual control button
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#4169E1",
    justifyContent: "center",
    alignItems: "center",
  },

  // Disabled control button state
  controlButtonDisabled: {
    backgroundColor: "#666",
  },

  // End call button (red)
  endCallButton: {
    backgroundColor: "#ff4444",
  },
});

export default VideoCall;
