import { Platform } from "react-native";

export interface PeerConnection {
  id: string;
  pc: RTCPeerConnection;
  stream?: MediaStream;
}

export interface CallParticipant {
  id: string;
  name: string;
  isAdmin: boolean;
  isMod: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  stream?: MediaStream;
}

export interface CallState {
  roomId: string;
  participants: CallParticipant[];
  localStream?: MediaStream;
  isConnected: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  callType: "audio" | "video";
}

class WebRTCWebSocketService {
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private localStream?: MediaStream;
  private roomId: string = "";
  private userId: string = "";
  private userName: string = "";
  private isAdmin: boolean = false;
  private isMod: boolean = false;
  private onParticipantUpdate?: (participants: CallParticipant[]) => void;
  private onCallStateChange?: (state: Partial<CallState>) => void;
  private ws?: WebSocket;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  // WebRTC Configuration
  private rtcConfig = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
      { urls: "stun:stun3.l.google.com:19302" },
      { urls: "stun:stun4.l.google.com:19302" },
    ],
  };

  // Signaling server URL (change this to your server)
  // private signalingServerUrl = "ws://localhost:3001";

  private signalingServerUrl = "ws://signaling-server-seo6.onrender.com";

  constructor() {
    if (Platform.OS !== "web") {
      this.setupReactNativeWebRTC();
    }
  }

  private setupReactNativeWebRTC() {
    // React Native specific setup
  }

  // Initialize call
  async initializeCall(
    roomId: string,
    userId: string,
    userName: string,
    isAdmin: boolean = false,
    isMod: boolean = false,
    callType: "audio" | "video" = "video"
  ): Promise<MediaStream> {
    this.roomId = roomId;
    this.userId = userId;
    this.userName = userName;
    this.isAdmin = isAdmin;
    this.isMod = isMod;

    // Get user media
    this.localStream = await this.getUserMedia(callType);

    // Connect to signaling server
    await this.connectToSignalingServer();

    return this.localStream;
  }

  // Get user media (camera/microphone)
  private async getUserMedia(
    callType: "audio" | "video"
  ): Promise<MediaStream> {
    const constraints = {
      audio: true,
      video:
        callType === "video"
          ? {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: "user",
            }
          : false,
    };

    try {
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (error) {
      console.error("Error accessing media devices:", error);
      throw new Error("Failed to access camera/microphone");
    }
  }

  // Connect to WebSocket signaling server
  private async connectToSignalingServer(): Promise<void> {
    return new Promise((resolve, reject) => {
      const wsUrl = `${this.signalingServerUrl}?roomId=${this.roomId}&userId=${
        this.userId
      }&userName=${encodeURIComponent(this.userName)}`;

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        // Connected to signaling server
        this.reconnectAttempts = 0;
        resolve();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleSignalingMessage(data);
        } catch (error) {
          console.error("Error parsing signaling message:", error);
        }
      };

      this.ws.onclose = () => {
        // Disconnected from signaling server
        this.handleDisconnection();
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        reject(error);
      };
    });
  }

  // Handle incoming signaling messages
  private handleSignalingMessage(data: any) {
    switch (data.type) {
      case "welcome":
        // Welcome to room
        this.onParticipantUpdate?.(data.participants);
        break;

      case "participant-joined":
        // Participant joined
        this.createPeerConnection(data.userId);
        this.onParticipantUpdate?.(data.participants);
        break;

      case "participant-left":
        // Participant left
        this.removePeerConnection(data.userId);
        this.onParticipantUpdate?.(data.participants);
        break;

      case "offer":
        this.handleOffer(data.fromUserId, data.sdp);
        break;

      case "answer":
        this.handleAnswer(data.fromUserId, data.sdp);
        break;

      case "ice-candidate":
        this.handleIceCandidate(data.fromUserId, data.candidate);
        break;

      case "participant-update":
        this.handleParticipantUpdate(data.userId, data.updates);
        break;

      case "pong":
        // Keep alive response
        break;

      default:
      // Unknown signaling message type
    }
  }

  // Create peer connection with another user
  private async createPeerConnection(peerId: string) {
    if (this.peerConnections.has(peerId)) return;

    const pc = new RTCPeerConnection(this.rtcConfig);
    this.peerConnections.set(peerId, pc);

    // Add local stream tracks to peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        pc.addTrack(track, this.localStream!);
      });
    }

    // Handle incoming tracks
    pc.ontrack = (event) => {
      const participant = this.findParticipantById(peerId);
      if (participant) {
        participant.stream = event.streams[0];
        this.onParticipantUpdate?.(this.getAllParticipants());
      }
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendIceCandidate(peerId, event.candidate);
      }
    };

    // Create and send offer
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    this.sendOffer(peerId, offer);
  }

  // Send offer to peer
  private sendOffer(peerId: string, offer: RTCSessionDescriptionInit) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    this.ws.send(
      JSON.stringify({
        type: "offer",
        targetUserId: peerId,
        sdp: offer.sdp,
      })
    );
  }

  // Handle incoming offer
  private async handleOffer(peerId: string, sdp: string) {
    let pc = this.peerConnections.get(peerId);

    if (!pc) {
      pc = new RTCPeerConnection(this.rtcConfig);
      this.peerConnections.set(peerId, pc);

      // Add local stream tracks
      if (this.localStream) {
        this.localStream.getTracks().forEach((track) => {
          pc!.addTrack(track, this.localStream!);
        });
      }

      // Handle incoming tracks
      pc.ontrack = (event) => {
        const participant = this.findParticipantById(peerId);
        if (participant) {
          participant.stream = event.streams[0];
          this.onParticipantUpdate?.(this.getAllParticipants());
        }
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          this.sendIceCandidate(peerId, event.candidate);
        }
      };
    }

    // Set remote description and create answer
    await pc.setRemoteDescription(
      new RTCSessionDescription({ type: "offer", sdp })
    );
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    // Send answer
    this.sendAnswer(peerId, answer);
  }

  // Send answer to peer
  private sendAnswer(peerId: string, answer: RTCSessionDescriptionInit) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    this.ws.send(
      JSON.stringify({
        type: "answer",
        targetUserId: peerId,
        sdp: answer.sdp,
      })
    );
  }

  // Handle incoming answer
  private async handleAnswer(peerId: string, sdp: string) {
    const pc = this.peerConnections.get(peerId);
    if (pc) {
      await pc.setRemoteDescription(
        new RTCSessionDescription({ type: "answer", sdp })
      );
    }
  }

  // Send ICE candidate
  private sendIceCandidate(peerId: string, candidate: RTCIceCandidate) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    this.ws.send(
      JSON.stringify({
        type: "ice-candidate",
        targetUserId: peerId,
        candidate: {
          candidate: candidate.candidate,
          sdpMLineIndex: candidate.sdpMLineIndex,
          sdpMid: candidate.sdpMid,
        },
      })
    );
  }

  // Handle incoming ICE candidate
  private async handleIceCandidate(peerId: string, candidateData: any) {
    const pc = this.peerConnections.get(peerId);
    if (pc) {
      await pc.addIceCandidate(new RTCIceCandidate(candidateData));
    }
  }

  // Handle participant updates
  private handleParticipantUpdate(userId: string, updates: any) {
    // This would update participant status (mute, video, etc.)
    // Implementation depends on how you want to track participants
  }

  // Handle disconnection
  private handleDisconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
      );

      setTimeout(() => {
        this.connectToSignalingServer().catch((error) => {
          console.error("Reconnection failed:", error);
        });
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error("Max reconnection attempts reached");
      this.onCallStateChange?.({ isConnected: false });
    }
  }

  // Toggle mute
  async toggleMute(): Promise<boolean> {
    if (!this.localStream) return false;

    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      const isMuted = !audioTrack.enabled;

      // Update participant status via signaling
      this.sendParticipantUpdate({ isMuted });

      this.onCallStateChange?.({ isMuted });
      return isMuted;
    }
    return false;
  }

  // Toggle video
  async toggleVideo(): Promise<boolean> {
    if (!this.localStream) return false;

    const videoTrack = this.localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      const isVideoOff = !videoTrack.enabled;

      // Update participant status via signaling
      this.sendParticipantUpdate({ isVideoOff });

      this.onCallStateChange?.({ isVideoOff });
      return isVideoOff;
    }
    return false;
  }

  // Send participant update
  private sendParticipantUpdate(updates: any) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    this.ws.send(
      JSON.stringify({
        type: "participant-update",
        updates,
      })
    );
  }

  // Get all participants (this would be populated from signaling)
  private getAllParticipants(): CallParticipant[] {
    // This is handled by the signaling server
    return [];
  }

  // Find participant by ID
  private findParticipantById(id: string): CallParticipant | undefined {
    return this.getAllParticipants().find((p) => p.id === id);
  }

  // Remove peer connection
  private removePeerConnection(peerId: string) {
    const pc = this.peerConnections.get(peerId);
    if (pc) {
      pc.close();
      this.peerConnections.delete(peerId);
    }
  }

  // Set callbacks
  setCallbacks(
    onParticipantUpdate?: (participants: CallParticipant[]) => void,
    onCallStateChange?: (state: Partial<CallState>) => void
  ) {
    this.onParticipantUpdate = onParticipantUpdate;
    this.onCallStateChange = onCallStateChange;
  }

  // End call
  async endCall() {
    // Close all peer connections
    for (const [peerId, pc] of this.peerConnections) {
      pc.close();
    }
    this.peerConnections.clear();

    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = undefined;
    }

    // Close WebSocket connection
    if (this.ws) {
      this.ws.close();
      this.ws = undefined;
    }

    this.roomId = "";
    this.userId = "";
  }

  // Get call state
  getCallState(): CallState {
    return {
      roomId: this.roomId,
      participants: this.getAllParticipants(),
      localStream: this.localStream,
      isConnected:
        this.ws?.readyState === WebSocket.OPEN && this.peerConnections.size > 0,
      isMuted: false, // This should be tracked
      isVideoOff: false, // This should be tracked
      callType: "video", // This should be tracked
    };
  }

  // Set signaling server URL
  setSignalingServerUrl(url: string) {
    this.signalingServerUrl = url;
  }
}

export const webrtcWebSocketService = new WebRTCWebSocketService();
export default webrtcWebSocketService;
