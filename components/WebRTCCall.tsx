import { WEBRTC_CONFIG } from "@/constants";
import { useGroupContext } from "@/store/GroupContext";
import { NetworkDiagnosticsService } from "@/utils/networkDiagnostics";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import {
  mediaDevices,
  MediaStream,
  RTCIceCandidate,
  RTCPeerConnection,
  RTCSessionDescription,
  RTCView,
} from "react-native-webrtc";
import { db } from "@/services/firebase";
import { doc, updateDoc, arrayRemove, deleteDoc, getDoc } from "firebase/firestore";

interface WebRTCCallProps {
  roomId: string;
  userId: string;
  userName: string;
  callType: "audio" | "video";
  onEndCall: () => void;
  groupName: string;
  callDocId: string;
  callId: string;
}

const WebRTCCall: React.FC<WebRTCCallProps> = ({
  roomId,
  userId,
  userName,
  callType,
  onEndCall,
  groupName,
  callDocId,
  callId,
}) => {
  const { updateCallParticipants } = useGroupContext();
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(
    new Map()
  );
  const [participants, setParticipants] = useState<
    { id: string; name: string }[]
  >([]);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(callType === "video");
  const [connectionState, setConnectionState] = useState<string>("connecting");

  const wsRef = useRef<WebSocket | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const isInitiatorRef = useRef(false);

  useEffect(() => {
    initializeCall();
    return () => {
      cleanup();
    };
  }, []);

  // Update participants in Firebase
  useEffect(() => {
    // Join call
    updateCallParticipants(callDocId, userId, true);

    // Leave call on unmount
    return () => {
      updateCallParticipants(callDocId, userId, false);
    };
  }, [callDocId, userId]);

  const initializeCall = async () => {
    try {
      console.log("Initializing WebRTC call...", { roomId, userId, userName });

      // Run network diagnostics first in production builds
      if (!__DEV__) {
        console.log("Running network diagnostics...");
        const diagnostics = await NetworkDiagnosticsService.getInstance().performDiagnostics(WEBRTC_CONFIG.SIGNALING_URL);
        const report = NetworkDiagnosticsService.getInstance().generateDiagnosticReport(diagnostics);
        console.log(report);
        
        // Show warning if critical issues detected
        if (!diagnostics.canReachSignalingServer || !diagnostics.stunServerReachable) {
          const suggestions = NetworkDiagnosticsService.getInstance().getTroubleshootingSuggestions(diagnostics);
          Alert.alert(
            "Connection Issues Detected",
            `Network diagnostics found potential issues:\n\n${suggestions.join('\n')}\n\nDo you want to continue anyway?`,
            [
              { text: "Cancel", onPress: () => onEndCall() },
              { text: "Continue", style: "default" }
            ]
          );
        }
      }

      // Get local media stream FIRST and wait for it
      const stream = await setupLocalStream();
      if (!stream) {
        throw new Error("Failed to get local stream");
      }

      // Set both state and ref
      localStreamRef.current = stream;
      setLocalStream(stream);

      // Log stream details
      console.log("Local stream ready:", {
        id: stream.id,
        audioTracks: stream.getAudioTracks().length,
        videoTracks: stream.getVideoTracks().length,
      });

      // Give React a chance to update state
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Only connect to signaling server after local stream is ready
      connectToSignalingServer();
    } catch (error: any) {
      console.error("Failed to initialize call:", error);
      Alert.alert("Error", "Failed to initialize call: " + (error instanceof Error ? error.message : String(error)));
    }
  };
  // remove user from  participants when call ends
  const removeUser = async () => {
    try {
      const callDoc = doc(db, "activeCalls", callId);
      const callDocSnap = await getDoc(callDoc);
      if (callDocSnap.exists()) {
        const callData = callDocSnap.data();
        if (callData.participants.includes(userId)) {
          await updateDoc(callDoc, {
            participants: arrayRemove(userId),
          });
        }
        if (callData.participants.length === 0) {
          await deleteDoc(callDoc);
        }
      }
    } catch (error) {
      console.error("Error removing user from participants:", error);
    }


  };

  useEffect(() => {
    if (connectionState === "disconnected") {
      removeUser();
    }
  }, [connectionState]);

  const setupLocalStream = async () => {
    try {
      // Wait a bit to ensure proper initialization
      await new Promise((resolve) => setTimeout(resolve, 100));

      const mediaConstraints = {
        audio: true,
        video: callType === "video",
      };

      const stream = await mediaDevices.getUserMedia(mediaConstraints);

      // Verify stream is valid
      if (!stream || stream.getTracks().length === 0) {
        throw new Error("No media tracks available");
      }

      // Configure tracks
      stream.getTracks().forEach((track) => {
        track.enabled = true;
        console.log(`Initialized local ${track.kind} track:`, {
          id: track.id,
          enabled: track.enabled,
          muted: track.muted,
          readyState: track.readyState,
        });
      });

      return stream;
    } catch (error) {
      console.error("Error getting local stream:", error);
      throw error;
    }
  };

  const connectToSignalingServer = () => {
    const stream = localStreamRef.current;
    if (!stream) {
      console.error("Cannot connect to signaling server without local stream");
      setConnectionState("error");
      return;
    }

    const wsUrl = `${
      WEBRTC_CONFIG.SIGNALING_URL
    }?roomId=${roomId}&userId=${userId}&userName=${encodeURIComponent(
      userName
    )}`;

    console.log("Connecting to signaling server:", {
      url: wsUrl,
      isDev: __DEV__,
      streamId: stream.id,
      audioTracks: stream.getAudioTracks().length,
      videoTracks: stream.getVideoTracks().length,
    });

    try {
      wsRef.current = new WebSocket(wsUrl);
      
      // Set connection timeout
      const connectionTimeout = setTimeout(() => {
        if (wsRef.current?.readyState !== WebSocket.OPEN) {
          console.error("WebSocket connection timeout");
          setConnectionState("error");
          wsRef.current?.close();
          Alert.alert(
            "Connection Error", 
            "Failed to connect to call server. Please check your internet connection and try again."
          );
        }
      }, 10000); // 10 second timeout

      wsRef.current.onopen = () => {
        clearTimeout(connectionTimeout);
        console.log("WebSocket connected successfully:", {
          url: wsUrl,
          readyState: wsRef.current?.readyState,
          streamId: stream.id,
          audioTracks: stream.getAudioTracks().length,
          videoTracks: stream.getVideoTracks().length,
        });
        setConnectionState("connected");
      };
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
      setConnectionState("error");
      Alert.alert(
        "Connection Error", 
        "Failed to initialize call connection: " + (error instanceof Error ? error.message : String(error))
      );
      return;
    }


    wsRef.current.onmessage = async (event: WebSocketMessageEvent) => {
      try {
        const message = JSON.parse(event.data);
        console.log("Received signaling message:", message);

        // Use ref to check stream availability
        if (!localStreamRef.current) {
          console.error(
            "No local stream available for signaling message:",
            message.type
          );
          return;
        }

        await handleSignalingMessage(message);
      } catch (error) {
        console.error("Error handling signaling message:", error);
      }
    };

    wsRef.current.onerror = async (event: Event) => {
      console.error("WebSocket error:", {
        event,
        url: wsUrl,
        readyState: wsRef.current?.readyState,
        isDev: __DEV__,
      });
      setConnectionState("error");
      
      // Run diagnostics on connection error in production
      if (!__DEV__) {
        try {
          const diagnostics = await NetworkDiagnosticsService.getInstance().performDiagnostics(WEBRTC_CONFIG.SIGNALING_URL);
          const suggestions = NetworkDiagnosticsService.getInstance().getTroubleshootingSuggestions(diagnostics);
          
          Alert.alert(
            "Connection Error", 
            `Lost connection to call server.\n\nTroubleshooting suggestions:\n${suggestions.join('\n')}`
          );
        } catch (diagError) {
          Alert.alert(
            "Connection Error", 
            "Lost connection to call server. Please check your internet connection."
          );
        }
      } else {
        Alert.alert(
          "Connection Error", 
          "Lost connection to call server. Please check your internet connection."
        );
      }
    };

    wsRef.current.onclose = (event: WebSocketCloseEvent) => {
      console.log("WebSocket closed:", {
        code: event.code,
        reason: event.reason,
        url: wsUrl,
        isDev: __DEV__,
      });
      
      // Only show error if it wasn't a clean close
      if (event.code !== 1000) {
        setConnectionState("error");
        Alert.alert(
          "Connection Lost", 
          `Call connection closed unexpectedly (Code: ${event.code}). ${event.reason || "Please try again."}`
        );
      } else {
        setConnectionState("disconnected");
      }
    };
  };

  const handleSignalingMessage = async (message: any) => {
    try {
      const stream = localStreamRef.current;
      if (!stream) {
        console.error("No local stream available for message:", message.type);
        return;
      }

      console.log("Handling signaling message:", {
        type: message.type,
        from: message.fromUserId,
        participants: message.participants?.length,
        hasLocalStream: true,
        localStreamId: stream.id,
        localTracks: stream.getTracks().length,
      });

      switch (message.type) {
        case "welcome":
          console.log("Welcome message received:", {
            ...message,
            localStreamId: stream.id,
          });
          setParticipants(message.participants || []);
          break;

        case "participant-joined":
          console.log("New participant joined:", {
            newUser: message.userId,
            totalParticipants: message.participants?.length,
            currentUser: userId,
            localStreamId: stream.id,
          });

          setParticipants(message.participants || []);

          // If we're already in the room and a new participant joins,
          // we should initiate the connection
          if (message.userId !== userId) {
            console.log(
              "Creating peer connection as initiator for new participant:",
              message.userId
            );
            await createPeerConnection(message.userId, true);
          }
          break;

        case "existing-participants":
          console.log("Received existing participants:", {
            participants: message.participants,
            currentUser: userId,
            localStreamId: stream.id,
          });

          // Create connections for all existing participants
          const existingParticipants = message.participants.filter(
            (p: { id: string }) => p.id !== userId
          );

          console.log(
            "Creating connections for existing participants:",
            existingParticipants.map((p: { id: string }) => p.id)
          );

          for (const participant of existingParticipants) {
            if (!peerConnectionsRef.current.has(participant.id)) {
              console.log(
                "Creating peer connection for existing participant:",
                participant.id
              );
              await createPeerConnection(participant.id, false);
            }
          }
          break;

        case "offer":
          console.log("Processing offer:", {
            from: message.fromUserId,
            hasLocalStream: !!stream,
            existingPeerConnection: peerConnectionsRef.current.has(
              message.fromUserId
            ),
          });
          await handleOffer(message.fromUserId, message.sdp);
          break;

        case "answer":
          console.log("Processing answer:", {
            from: message.fromUserId,
            hasLocalStream: !!stream,
            existingPeerConnection: peerConnectionsRef.current.has(
              message.fromUserId
            ),
          });
          await handleAnswer(message.fromUserId, message.sdp);
          break;

        case "ice-candidate":
          console.log("Processing ICE candidate:", {
            from: message.fromUserId,
            hasLocalStream: !!stream,
            existingPeerConnection: peerConnectionsRef.current.has(
              message.fromUserId
            ),
            candidateType: message.candidate?.candidate?.split(" ")[7],
          });
          await handleIceCandidate(message.fromUserId, message.candidate);
          break;

        case "participant-left":
          console.log("Participant left:", {
            userId: message.userId,
            remainingParticipants: message.participants?.length,
          });
          setParticipants(message.participants || []);
          closePeerConnection(message.userId);
          break;

        default:
          console.log("Unknown message type:", message.type);
      }
    } catch (error) {
      console.error("Error in handleSignalingMessage:", error);
    }
  };

  const createPeerConnection = async (
    peerId: string,
    shouldCreateOffer: boolean
  ) => {
    try {
      // Ensure we have local stream
      if (!localStreamRef.current) {
        console.log("Waiting for local stream before creating peer connection");
        await new Promise((resolve) => setTimeout(resolve, 500));
        if (!localStreamRef.current) {
          throw new Error("No local stream available after waiting");
        }
      }

      console.log(`Creating peer connection for ${peerId}`, {
        shouldCreateOffer,
        hasLocalStream: !!localStreamRef.current,
        localStreamTracks: localStreamRef.current?.getTracks().length,
        existingConnections: Array.from(peerConnectionsRef.current.keys()),
      });

      // Check if we already have a connection
      if (peerConnectionsRef.current.has(peerId)) {
        console.log(`Peer connection already exists for ${peerId}`);
        return peerConnectionsRef.current.get(peerId)!;
      }

      const peerConnection = new RTCPeerConnection({
        iceServers: WEBRTC_CONFIG.ICE_SERVERS,
        iceTransportPolicy: "all",
        bundlePolicy: "max-bundle",
        rtcpMuxPolicy: "require",
        // Additional configuration for better connectivity
        iceCandidatePoolSize: 10,
      });

      // Add connection state monitoring
      (peerConnection as any).onconnectionstatechange = () => {
        console.log(`Peer connection state changed for ${peerId}:`, {
          connectionState: peerConnection.connectionState,
          iceConnectionState: peerConnection.iceConnectionState,
          iceGatheringState: peerConnection.iceGatheringState,
          signalingState: peerConnection.signalingState,
        });
        
        if (peerConnection.connectionState === 'failed') {
          console.error(`Peer connection failed for ${peerId}`);
          // Attempt to restart ICE
          try {
            (peerConnection as any).restartIce();
          } catch (e) {
            console.warn('Failed to restart ICE:', e);
          }
        }
      };

      (peerConnection as any).oniceconnectionstatechange = () => {
        console.log(`ICE connection state changed for ${peerId}:`, peerConnection.iceConnectionState);
        
        if (peerConnection.iceConnectionState === 'failed') {
          console.error(`ICE connection failed for ${peerId}`);
        }
      };

      // Store the peer connection FIRST
      peerConnectionsRef.current.set(peerId, peerConnection);

      // Set up event handlers BEFORE adding tracks
      (peerConnection as any).ontrack = (event: any) => {
        console.log(`Remote track received from ${peerId}:`, {
          kind: event.track.kind,
          enabled: event.track.enabled,
          readyState: event.track.readyState,
          streams: event.streams?.length,
          streamId: event.streams[0]?.id,
        });

        if (!event.streams || event.streams.length === 0) {
          console.warn("No streams in track event");
          return;
        }

        const [remoteStream] = event.streams;

        // Force enable the track
        event.track.enabled = true;

        // Enable all tracks in the stream
        remoteStream.getTracks().forEach((track: MediaStreamTrack) => {
          track.enabled = true;
          console.log(`Enabled remote track:`, {
            kind: track.kind,
            enabled: track.enabled,
            muted: track.muted,
            readyState: track.readyState,
          });
        });

        // Update remote streams
        setRemoteStreams((prev) => {
          const newStreams = new Map(prev);
          newStreams.set(peerId, remoteStream);
          console.log(`Updated remote streams map:`, {
            totalStreams: newStreams.size,
            audioTracks: remoteStream.getAudioTracks().length,
            videoTracks: remoteStream.getVideoTracks().length,
            allPeers: Array.from(newStreams.keys()),
          });
          return newStreams;
        });
      };

      // Now add tracks AFTER setting up handlers
      const tracks = localStreamRef.current.getTracks();
      console.log(
        `Adding ${tracks.length} local tracks to peer connection for ${peerId}`
      );

      for (const track of tracks) {
        try {
          const sender = peerConnection.addTrack(track, localStreamRef.current);
          console.log(`Added local track to peer connection:`, {
            kind: track.kind,
            enabled: track.enabled,
            muted: track.muted,
            readyState: track.readyState,
            peerId,
          });
        } catch (error) {
          console.error(`Failed to add ${track.kind} track:`, error);
          throw error; // Re-throw to handle connection failure
        }
      }

      // Set up connection monitoring
      (peerConnection as any).onicecandidate = (event: any) => {
        if (event.candidate) {
          console.log("Generated ICE candidate:", {
            type: event.candidate.candidate.split(" ")[7],
            protocol: event.candidate.protocol,
            peerId,
          });
          sendMessage({
            type: "ice-candidate",
            targetUserId: peerId,
            candidate: event.candidate.toJSON(),
          });
        } else {
          console.log("ICE candidate gathering complete for:", peerId);
        }
      };

      // Create offer if we're the initiator
      if (shouldCreateOffer) {
        try {
          console.log(`Creating initial offer for ${peerId}`);
          const offer = await peerConnection.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: callType === "video",
          });

          console.log(`Setting local description for ${peerId}`);
          await peerConnection.setLocalDescription(offer);

          console.log(`Sending offer to ${peerId}`);
          sendMessage({
            type: "offer",
            targetUserId: peerId,
            sdp: offer,
          });
        } catch (error) {
          console.error("Error creating offer:", error);
          throw error;
        }
      }

      return peerConnection;
    } catch (error) {
      console.error("Error in createPeerConnection:", error);
      // Clean up failed connection
      if (peerConnectionsRef.current.has(peerId)) {
        peerConnectionsRef.current.get(peerId)?.close();
        peerConnectionsRef.current.delete(peerId);
      }
      throw error;
    }
  };

  const handleOffer = async (
    fromUserId: string,
    sdp: RTCSessionDescriptionInit
  ) => {
    try {
      console.log("Handling offer from:", fromUserId, {
        hasSdp: !!sdp.sdp,
        type: sdp.type,
        hasLocalStream: !!localStreamRef.current,
        localTracks: localStreamRef.current?.getTracks().length,
      });

      let peerConnection = peerConnectionsRef.current.get(fromUserId);

      if (!peerConnection) {
        console.log("Creating new peer connection for offer");
        peerConnection = await createPeerConnection(fromUserId, false);
      }

      if (!peerConnection || !sdp.sdp) {
        console.error("Invalid peer connection or SDP");
        return;
      }

      // Set remote description first
      const remoteDesc = new RTCSessionDescription({
        type: sdp.type,
        sdp: sdp.sdp,
      });

      console.log("Setting remote description for offer");
      await peerConnection.setRemoteDescription(remoteDesc);

      // Create and set local description
      console.log("Creating answer with constraints:", {
        audio: true,
        video: callType === "video",
      });

      const answer = await peerConnection.createAnswer();

      console.log("Setting local description (answer)");
      await peerConnection.setLocalDescription(answer);

      // Send answer
      console.log("Sending answer to:", fromUserId);
      sendMessage({
        type: "answer",
        targetUserId: fromUserId,
        sdp: answer,
      });

      // Log connection state
      console.log("Offer handling complete, connection state:", {
        iceConnectionState: peerConnection.iceConnectionState,
        connectionState: peerConnection.connectionState,
        signalingState: peerConnection.signalingState,
        hasRemoteStreams: peerConnection.getReceivers().length > 0,
      });
    } catch (error) {
      console.error("Error handling offer:", error);
    }
  };

  const handleAnswer = async (
    fromUserId: string,
    sdp: RTCSessionDescriptionInit
  ) => {
    try {
      console.log("Handling answer from:", fromUserId, {
        hasSdp: !!sdp.sdp,
        type: sdp.type,
        hasLocalStream: !!localStreamRef.current,
        localTracks: localStreamRef.current?.getTracks().length,
      });

      const peerConnection = peerConnectionsRef.current.get(fromUserId);

      if (!peerConnection || !sdp.sdp) {
        console.error("Invalid peer connection or SDP");
        return;
      }

      const remoteDesc = new RTCSessionDescription({
        type: sdp.type,
        sdp: sdp.sdp,
      });

      console.log("Setting remote description for answer");
      await peerConnection.setRemoteDescription(remoteDesc);

      // Log connection state
      console.log("Answer handling complete, connection state:", {
        iceConnectionState: peerConnection.iceConnectionState,
        connectionState: peerConnection.connectionState,
        signalingState: peerConnection.signalingState,
        hasRemoteStreams: peerConnection.getReceivers().length > 0,
      });
    } catch (error) {
      console.error("Error handling answer:", error);
    }
  };

  const handleIceCandidate = async (
    fromUserId: string,
    candidate: RTCIceCandidateInit
  ) => {
    try {
      console.log("Processing ICE candidate from:", fromUserId, {
        candidateType: candidate.candidate?.split(" ")[7], // Log candidate type (host, srflx, relay)
        hasCandidate: !!candidate.candidate,
      });

      const peerConnection = peerConnectionsRef.current.get(fromUserId);

      if (!peerConnection) {
        console.error("No peer connection found for:", fromUserId);
        return;
      }

      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      console.log("ICE candidate added successfully");
    } catch (error) {
      console.error("Error handling ICE candidate:", error);
    }
  };

  const closePeerConnection = (peerId: string) => {
    const peerConnection = peerConnectionsRef.current.get(peerId);
    if (peerConnection) {
      peerConnection.close();
      peerConnectionsRef.current.delete(peerId);
    }

    setRemoteStreams((prev) => {
      const newStreams = new Map(prev);
      newStreams.delete(peerId);
      return newStreams;
    });
  };

  const sendMessage = (message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.error("WebSocket not open, cannot send message:", message);
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      const newState = !isAudioEnabled;

      audioTracks.forEach((track) => {
        track.enabled = newState;
        console.log(`Toggled audio track: ${track.label}`, {
          enabled: track.enabled,
          readyState: track.readyState,
        });
      });

      setIsAudioEnabled(newState);

      // Update the tracks in all peer connections
      peerConnectionsRef.current.forEach((pc, peerId) => {
        pc.getSenders().forEach((sender) => {
          if (sender.track?.kind === "audio") {
            sender.track.enabled = newState;
            console.log(`Updated audio sender for peer ${peerId}:`, {
              enabled: sender.track.enabled,
            });
          }
        });
      });
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current && callType === "video") {
      const videoTracks = localStreamRef.current.getVideoTracks();
      const newState = !isVideoEnabled;

      videoTracks.forEach((track) => {
        track.enabled = newState;
        console.log(`Toggled video track: ${track.label}`, {
          enabled: track.enabled,
          readyState: track.readyState,
        });
      });

      setIsVideoEnabled(newState);

      // Update the tracks in all peer connections
      peerConnectionsRef.current.forEach((pc, peerId) => {
        pc.getSenders().forEach((sender) => {
          if (sender.track?.kind === "video") {
            sender.track.enabled = newState;
            console.log(`Updated video sender for peer ${peerId}:`, {
              enabled: sender.track.enabled,
            });
          }
        });
      });
    }
  };

  const endCall = async () => {
    updateCallParticipants(callDocId, userId, false);
    console.log("Ending call...");
    // Send end call message to all participants
    peerConnectionsRef.current.forEach((_, peerId) => {
      try {
        sendMessage({
          type: "call-ended",
          targetUserId: peerId,
        });
        console.log(`Sent call-ended message to ${peerId}`);
      } catch (e) {
        console.warn(`Error sending call-ended message to ${peerId}:`, e);
      }
    });

    await cleanup();
    onEndCall();
  };

  // Handle call ended message
  const handleCallEnded = (fromUserId: string) => {
    console.log("Call ended by:", fromUserId);
    cleanup();
    onEndCall();
  };

  const cleanup = async () => {
    console.log("Starting WebRTC cleanup...");

    try {
      // Stop and remove all tracks from peer connections
      for (const [
        peerId,
        peerConnection,
      ] of peerConnectionsRef.current.entries()) {
        console.log(`Cleaning up peer connection for ${peerId}`);

        // Remove all senders
        const senders = peerConnection.getSenders();
        console.log(`Removing ${senders.length} senders for ${peerId}`);

        for (const sender of senders) {
          if (sender.track) {
            console.log(`Stopping ${sender.track.kind} track`);
            sender.track.stop();
            try {
              await peerConnection.removeTrack(sender);
              console.log(
                `Removed ${sender.track.kind} track from peer connection`
              );
            } catch (e) {
              console.warn(`Error removing track from peer connection:`, e);
            }
          }
        }

        // Close the peer connection
        try {
          peerConnection.close();
          console.log(`Closed peer connection for ${peerId}`);
        } catch (e) {
          console.warn(`Error closing peer connection:`, e);
        }
      }
      peerConnectionsRef.current.clear();
      console.log("Cleared all peer connections");

      // Stop and clear local stream
      if (localStreamRef.current) {
        console.log("Cleaning up local stream...");
        const tracks = localStreamRef.current.getTracks();
        console.log(`Stopping ${tracks.length} local tracks`);

        tracks.forEach((track) => {
          try {
            track.enabled = false; // Disable before stopping
            track.stop();
            localStreamRef.current?.removeTrack(track);
            console.log(`Stopped and removed ${track.kind} track`);
          } catch (e) {
            console.warn(`Error cleaning up local track:`, e);
          }
        });
        setLocalStream(null);
      }

      // Clean up remote streams
      console.log("Cleaning up remote streams...");
      remoteStreams.forEach((stream, peerId) => {
        console.log(`Cleaning up remote stream for ${peerId}`);
        stream.getTracks().forEach((track) => {
          try {
            track.enabled = false; // Disable before stopping
            track.stop();
            stream.removeTrack(track);
            console.log(`Stopped and removed remote ${track.kind} track`);
          } catch (e) {
            console.warn(`Error cleaning up remote track:`, e);
          }
        });
      });
      setRemoteStreams(new Map());

      // Close WebSocket
      if (wsRef.current) {
        try {
          wsRef.current.close();
          console.log("Closed WebSocket connection");
        } catch (e) {
          console.warn("Error closing WebSocket:", e);
        }
        wsRef.current = null;
      }

      setParticipants([]);
      setConnectionState("disconnected");
      console.log("Cleanup completed");
    } catch (error) {
      console.error("Error during cleanup:", error);
    }
  };

  const renderLocalVideo = () => {
    if (!localStreamRef.current || callType !== "video") return null;
    return (
      <View
        className={`absolute bottom-40 right-4  w-[120px] h-[160px] z-10 rounded-2xl overflow-hidden`}
      >
        <RTCView
          streamURL={localStreamRef.current.toURL()}
          className="absolute inset-0"
          style={{ width: "100%", height: "100%" }}
          objectFit="cover"
          mirror={true}
          zOrder={2}
        />
      </View>
    );
  };

  const renderRemoteVideos = () => {
    if (callType !== "video") return null;

    const remoteStreamArray = Array.from(remoteStreams.entries());
    if (remoteStreamArray.length === 0) {
      return (
        <View className="flex-1 justify-center items-center bg-gray-900">
          <Text className="text-white text-lg">
            Waiting for participants...
          </Text>
        </View>
      );
    }

    return (
      <View className="flex-1 flex-row flex-wrap">
        {remoteStreamArray.map(([peerId, stream]) => (
          <View
            key={peerId}
            className={`${
              remoteStreamArray.length === 1 ? "w-full h-full" : "w-1/2 h-1/2"
            } p-1`}
          >
            <View className="relative flex-1 bg-black rounded-lg overflow-hidden">
              <RTCView
                streamURL={stream.toURL()}
                style={{ width: "100%", height: "100%" }}
                className="absolute inset-0"
                objectFit="cover"
                mirror={false}
                zOrder={1}
              />
              <View className="absolute bottom-4 left-4 bg-black/50 px-3 py-1.5 rounded-lg z-10">
                <Text className="text-white font-medium">
                  {participants.find((p) => p.id === peerId)?.name ||
                    "Participant"}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-black safe-area-top">
      {/* Main content area */}
      <View className="flex-1 relative">
        {callType === "video" ? (
          <>
            <View className="flex-1">
              <Text className="text-white text-2xl font-semibold font-poppins text-center">
                {groupName} Session
              </Text>
              {renderRemoteVideos()}
            </View>
            {renderLocalVideo()}
          </>
        ) : (
          <View className="flex-1 justify-center items-center">
            <View className="bg-gray-800/50 rounded-full p-8 mb-6">
              <Ionicons name="call" size={100} color="white" />
            </View>
            <Text className="text-white text-2xl font-semibold">
              Audio Call
            </Text>
            <Text className="text-white/80 text-base mt-2.5">
              Connected: {participants.length} participant(s)
            </Text>
            <Text className="text-white/60 text-sm mt-1">
              Status: {connectionState}
            </Text>
          </View>
        )}
      </View>

      {/* Control buttons */}
      <View className="absolute bottom-safe left-0 right-0 pb-6">
        <View className="flex-row justify-center items-center px-5 gap-4">
          <TouchableOpacity
            onPress={toggleAudio}
            className={`${
              isAudioEnabled ? "bg-white/20" : "bg-red-500"
            } rounded-full w-16 h-16 justify-center items-center`}
          >
            <Ionicons
              name={isAudioEnabled ? "mic" : "mic-off"}
              size={28}
              color="white"
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={endCall}
            className="bg-red-500 rounded-full w-16 h-16 justify-center items-center"
          >
            <Ionicons name="call" size={28} color="white" />
          </TouchableOpacity>

          {callType === "video" && (
            <TouchableOpacity
              onPress={toggleVideo}
              className={`${
                isVideoEnabled ? "bg-white/20" : "bg-red-500"
              } rounded-full w-16 h-16 justify-center items-center`}
            >
              <Ionicons
                name={isVideoEnabled ? "videocam" : "videocam-off"}
                size={28}
                color="white"
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

export default WebRTCCall;
