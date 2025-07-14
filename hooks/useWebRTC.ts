import { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import webrtcService, { CallParticipant } from "../services/webrtcService";
import { useGroupContext } from "../store/GroupContext";
import {
  checkUnifiedPermissions,
  PermissionError,
  requestUnifiedPermissions,
  showPermissionDeniedAlert,
} from "../utils/permissions";

export interface UseWebRTCReturn {
  // State
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  participants: CallParticipant[];
  isConnected: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  isInitializing: boolean;
  error: string | null;

  // Controls
  startCall: (roomId: string, callType: "audio" | "video") => Promise<void>;
  endCall: () => Promise<void>;
  toggleMute: () => Promise<void>;
  toggleVideo: () => Promise<void>;
  switchCamera: () => void;

  // Refs for video elements
  localVideoRef: React.RefObject<any>;
  remoteVideoRefs: Map<string, React.RefObject<any>>;
}

export const useWebRTC = (): UseWebRTCReturn => {
  const { user, userInformation } = useGroupContext();

  // State
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(
    new Map()
  );
  const [participants, setParticipants] = useState<CallParticipant[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const localVideoRef = useRef<any>(null);
  const remoteVideoRefs = useRef<Map<string, React.RefObject<any>>>(new Map());

  // Initialize WebRTC service callbacks
  useEffect(() => {
    webrtcService.setCallbacks(
      (updatedParticipants) => {
        setParticipants(updatedParticipants);

        // Update remote streams
        const newRemoteStreams = new Map<string, MediaStream>();
        updatedParticipants.forEach((participant) => {
          if (participant.stream && participant.id !== user?.uid) {
            newRemoteStreams.set(participant.id, participant.stream);
          }
        });
        setRemoteStreams(newRemoteStreams);

        // Update connection status
        setIsConnected(updatedParticipants.length > 1);
      },
      (stateChanges) => {
        if (stateChanges.isMuted !== undefined) {
          setIsMuted(stateChanges.isMuted);
        }
        if (stateChanges.isVideoOff !== undefined) {
          setIsVideoOff(stateChanges.isVideoOff);
        }
      }
    );
  }, [user?.uid]);

  // Start call with proper permission handling
  const startCall = useCallback(
    async (roomId: string, callType: "audio" | "video" = "video") => {
      if (!user || !userInformation) {
        setError("User not authenticated");
        return;
      }

      setIsInitializing(true);
      setError(null);

      try {
        // For web, we can't reliably check permissions without requesting them
        // So we'll skip the permission check and let the WebRTC service handle it
        if (Platform.OS !== "web") {
          // Check if permissions are already granted (mobile only)
          const currentPermissions = await checkUnifiedPermissions(callType);

          if (!currentPermissions.canProceed) {
            // Request permissions with proper error handling
            const permissions = await requestUnifiedPermissions(callType);

            if (!permissions.canProceed) {
              // Show permission denied alert
              showPermissionDeniedAlert(
                callType === "video" ? "both" : "microphone"
              );
              return;
            }
          }
        }

        // Initialize call - this will handle permission requests for web
        const stream = await webrtcService.initializeCall(
          roomId,
          user.uid,
          userInformation.userName || "Anonymous",
          userInformation.isAdmin || false,
          userInformation.isMod || false,
          callType
        );

        setLocalStream(stream);
        setIsVideoOff(callType === "audio");
      } catch (err) {
        console.error("Failed to start call:", err);

        if (err instanceof PermissionError) {
          setError(err.message);
          showPermissionDeniedAlert(err.permissionType);
        } else {
          setError(err instanceof Error ? err.message : "Failed to start call");
        }
      } finally {
        setIsInitializing(false);
      }
    },
    [user, userInformation]
  );

  // End call
  const endCall = useCallback(async () => {
    try {
      await webrtcService.endCall();
      setLocalStream(null);
      setRemoteStreams(new Map());
      setParticipants([]);
      setIsConnected(false);
      setIsMuted(false);
      setIsVideoOff(false);
      setError(null);
    } catch (err) {
      console.error("Failed to end call:", err);
      setError("Failed to end call");
    }
  }, []);

  // Toggle mute
  const toggleMute = useCallback(async () => {
    try {
      const newMutedState = await webrtcService.toggleMute();
      setIsMuted(newMutedState);
    } catch (err) {
      console.error("Failed to toggle mute:", err);
      setError("Failed to toggle mute");
    }
  }, []);

  // Toggle video
  const toggleVideo = useCallback(async () => {
    try {
      const newVideoState = await webrtcService.toggleVideo();
      setIsVideoOff(newVideoState);
    } catch (err) {
      console.error("Failed to toggle video:", err);
      setError("Failed to toggle video");
    }
  }, []);

  // Switch camera (front/back)
  const switchCamera = useCallback(() => {
    if (!localStream) return;

    const videoTrack = localStream.getVideoTracks()[0];
    if (videoTrack && "getCapabilities" in videoTrack) {
      const capabilities = videoTrack.getCapabilities();
      if (capabilities.facingMode) {
        const facingMode = capabilities.facingMode.includes("user")
          ? "environment"
          : "user";
        videoTrack.applyConstraints({
          advanced: [{ facingMode }],
        });
      }
    }
  }, [localStream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isConnected) {
        endCall();
      }
    };
  }, [isConnected, endCall]);

  return {
    // State
    localStream,
    remoteStreams,
    participants,
    isConnected,
    isMuted,
    isVideoOff,
    isInitializing,
    error,

    // Controls
    startCall,
    endCall,
    toggleMute,
    toggleVideo,
    switchCamera,

    // Refs
    localVideoRef,
    remoteVideoRefs: remoteVideoRefs.current,
  };
};
