import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { Platform } from "react-native";
import { db } from "./firebase";

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

class WebRTCService {
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private localStream?: MediaStream;
  private roomId: string = "";
  private userId: string = "";
  private userName: string = "";
  private isAdmin: boolean = false;
  private isMod: boolean = false;
  private onParticipantUpdate?: (participants: CallParticipant[]) => void;
  private onCallStateChange?: (state: Partial<CallState>) => void;
  private participantsUnsubscribe?: () => void;
  private signalsUnsubscribe?: () => void;

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

  constructor() {
    // Initialize WebRTC polyfills for React Native if needed
    if (Platform.OS !== "web") {
      // React Native specific setup
      this.setupReactNativeWebRTC();
    }
  }

  private setupReactNativeWebRTC() {
    // For React Native, we might need additional setup
    // This would depend on the specific WebRTC library being used
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

    // Join the room
    await this.joinRoom(callType);

    // Listen for other participants
    this.listenForParticipants();

    // Listen for signals
    this.listenForSignals();

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
      console.log("Requesting media with constraints:", constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log("Media access granted:", {
        audioTracks: stream.getAudioTracks().length,
        videoTracks: stream.getVideoTracks().length,
      });
      return stream;
    } catch (error) {
      console.error("Error accessing media devices:", error);

      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          throw new Error(
            "Camera/microphone access was denied. Please allow access and try again."
          );
        } else if (error.name === "NotFoundError") {
          throw new Error("Camera or microphone not found on this device.");
        } else if (error.name === "NotSupportedError") {
          throw new Error(
            "Camera/microphone access is not supported on this device."
          );
        } else if (error.name === "NotReadableError") {
          throw new Error(
            "Camera/microphone is already in use by another application."
          );
        } else if (error.name === "OverconstrainedError") {
          throw new Error("Camera/microphone constraints are not supported.");
        } else if (error.name === "TypeError") {
          throw new Error(
            "Invalid constraints provided for camera/microphone access."
          );
        } else if (error.name === "AbortError") {
          throw new Error("Media access was aborted. Please try again.");
        } else if (error.name === "SecurityError") {
          throw new Error("Media access blocked due to security restrictions.");
        }
      }

      // Check if it's a network-related error
      if (error instanceof DOMException && error.name === "NetworkError") {
        throw new Error(
          "Network error prevented media access. Please check your connection."
        );
      }

      throw new Error(
        "Failed to access camera/microphone. Please check your permissions and try again."
      );
    }
  }

  // Join room and signal presence
  private async joinRoom(callType: "audio" | "video") {
    const participantRef = doc(
      db,
      "calls",
      this.roomId,
      "participants",
      this.userId
    );

    await setDoc(participantRef, {
      id: this.userId,
      name: this.userName,
      isAdmin: this.isAdmin,
      isMod: this.isMod,
      isMuted: false,
      isVideoOff: callType === "audio",
      joinedAt: serverTimestamp(),
      callType,
      lastSeen: serverTimestamp(),
    });
  }

  // Listen for other participants
  private listenForParticipants() {
    const participantsRef = collection(
      db,
      "calls",
      this.roomId,
      "participants"
    );

    this.participantsUnsubscribe = onSnapshot(
      participantsRef,
      async (snapshot) => {
        const participants: CallParticipant[] = [];

        snapshot.forEach((doc) => {
          const data = doc.data();
          // Only include participants who have been active in the last 30 seconds
          const lastSeen = data.lastSeen?.toDate?.() || new Date(0);
          const thirtySecondsAgo = new Date(Date.now() - 30000);

          if (lastSeen > thirtySecondsAgo) {
            participants.push({
              id: data.id,
              name: data.name,
              isAdmin: data.isAdmin || false,
              isMod: data.isMod || false,
              isMuted: data.isMuted || false,
              isVideoOff: data.isVideoOff || false,
            });
          }
        });

        // Handle new participants
        for (const participant of participants) {
          if (
            participant.id !== this.userId &&
            !this.peerConnections.has(participant.id)
          ) {
            await this.createPeerConnection(participant.id);
          }
        }

        // Handle disconnected participants
        const currentParticipantIds = participants.map((p) => p.id);
        for (const [peerId, pc] of this.peerConnections) {
          if (!currentParticipantIds.includes(peerId)) {
            this.removePeerConnection(peerId);
          }
        }

        this.onParticipantUpdate?.(participants);
      }
    );
  }

  // Listen for all signals
  private listenForSignals() {
    const signalsRef = collection(db, "calls", this.roomId, "signals");

    this.signalsUnsubscribe = onSnapshot(signalsRef, async (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === "added") {
          const signalData = change.doc.data();
          const signalId = change.doc.id;

          // Parse signal ID to get sender and receiver
          const [senderId, receiverId, signalType] = signalId.split("_");

          if (receiverId === this.userId) {
            switch (signalType) {
              case "offer":
                await this.handleOffer(senderId, signalData);
                break;
              case "answer":
                await this.handleAnswer(senderId, signalData);
                break;
              case "ice":
                await this.handleIceCandidate(senderId, signalData);
                break;
            }
          }
        }
      });
    });
  }

  // Create peer connection with another user
  private async createPeerConnection(peerId: string) {
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
    await this.sendOffer(peerId, offer);
  }

  // Send offer to peer
  private async sendOffer(peerId: string, offer: RTCSessionDescriptionInit) {
    const signalId = `${this.userId}_${peerId}_offer`;
    const signalRef = doc(db, "calls", this.roomId, "signals", signalId);

    await setDoc(signalRef, {
      sdp: offer.sdp,
      type: offer.type,
      timestamp: serverTimestamp(),
    });
  }

  // Handle incoming offer
  private async handleOffer(peerId: string, offerData: any) {
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
    await pc.setRemoteDescription(new RTCSessionDescription(offerData));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    // Send answer
    await this.sendAnswer(peerId, answer);

    // Clean up offer signal
    const offerSignalId = `${peerId}_${this.userId}_offer`;
    const offerSignalRef = doc(
      db,
      "calls",
      this.roomId,
      "signals",
      offerSignalId
    );
    await deleteDoc(offerSignalRef);
  }

  // Send answer to peer
  private async sendAnswer(peerId: string, answer: RTCSessionDescriptionInit) {
    const signalId = `${this.userId}_${peerId}_answer`;
    const signalRef = doc(db, "calls", this.roomId, "signals", signalId);

    await setDoc(signalRef, {
      sdp: answer.sdp,
      type: answer.type,
      timestamp: serverTimestamp(),
    });
  }

  // Handle incoming answer
  private async handleAnswer(peerId: string, answerData: any) {
    const pc = this.peerConnections.get(peerId);
    if (pc) {
      await pc.setRemoteDescription(new RTCSessionDescription(answerData));
    }

    // Clean up answer signal
    const answerSignalId = `${peerId}_${this.userId}_answer`;
    const answerSignalRef = doc(
      db,
      "calls",
      this.roomId,
      "signals",
      answerSignalId
    );
    await deleteDoc(answerSignalRef);
  }

  // Send ICE candidate
  private async sendIceCandidate(peerId: string, candidate: RTCIceCandidate) {
    const signalId = `${this.userId}_${peerId}_ice_${Date.now()}`;
    const signalRef = doc(db, "calls", this.roomId, "signals", signalId);

    await setDoc(signalRef, {
      candidate: candidate.candidate,
      sdpMLineIndex: candidate.sdpMLineIndex,
      sdpMid: candidate.sdpMid,
      timestamp: serverTimestamp(),
    });
  }

  // Handle incoming ICE candidate
  private async handleIceCandidate(peerId: string, candidateData: any) {
    const pc = this.peerConnections.get(peerId);
    if (pc) {
      await pc.addIceCandidate(new RTCIceCandidate(candidateData));
    }

    // Clean up ICE signal after a delay
    setTimeout(async () => {
      const signalsRef = collection(db, "calls", this.roomId, "signals");
      const q = query(
        signalsRef,
        where("timestamp", "<", new Date(Date.now() - 10000))
      );
      const oldSignals = await q.get();
      oldSignals.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });
    }, 5000);
  }

  // Toggle mute
  async toggleMute(): Promise<boolean> {
    if (!this.localStream) return false;

    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      const isMuted = !audioTrack.enabled;

      // Update participant status
      await this.updateParticipantStatus({ isMuted });

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

      // Update participant status
      await this.updateParticipantStatus({ isVideoOff });

      this.onCallStateChange?.({ isVideoOff });
      return isVideoOff;
    }
    return false;
  }

  // Update participant status
  private async updateParticipantStatus(updates: Partial<CallParticipant>) {
    const participantRef = doc(
      db,
      "calls",
      this.roomId,
      "participants",
      this.userId
    );
    await updateDoc(participantRef, {
      ...updates,
      lastSeen: serverTimestamp(),
    });
  }

  // Get all participants (this would be populated from the Firestore listener)
  private getAllParticipants(): CallParticipant[] {
    // This is handled by the Firestore listener
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

    // Remove from room
    const participantRef = doc(
      db,
      "calls",
      this.roomId,
      "participants",
      this.userId
    );
    await deleteDoc(participantRef);

    // Clean up listeners
    if (this.participantsUnsubscribe) {
      this.participantsUnsubscribe();
    }
    if (this.signalsUnsubscribe) {
      this.signalsUnsubscribe();
    }

    // Clean up old signals
    const signalsRef = collection(db, "calls", this.roomId, "signals");
    const q = query(
      signalsRef,
      where("timestamp", "<", new Date(Date.now() - 60000))
    );
    const oldSignals = await q.get();
    oldSignals.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });

    this.roomId = "";
    this.userId = "";
  }

  // Get call state
  getCallState(): CallState {
    return {
      roomId: this.roomId,
      participants: this.getAllParticipants(),
      localStream: this.localStream,
      isConnected: this.peerConnections.size > 0,
      isMuted: false, // This should be tracked
      isVideoOff: false, // This should be tracked
      callType: "video", // This should be tracked
    };
  }
}

export const webrtcService = new WebRTCService();
export default webrtcService;
