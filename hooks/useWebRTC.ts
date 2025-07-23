import { useCallback, useEffect, useRef, useState } from "react";
import {
  mediaDevices,
  MediaStream,
  RTCIceCandidate,
  RTCPeerConnection,
  RTCSessionDescription,
} from "react-native-webrtc";

const SIGNALING_URL = "ws://192.168.101.113:3001"; // Change to your server address if needed

export type WebRTCParticipant = {
  userId: string;
  userName: string;
  stream: MediaStream | null;
  isLocal: boolean;
};

export type UseWebRTCOptions = {
  roomId: string;
  userId: string;
  userName: string;
  callType: "audio" | "video";
};

export function useWebRTC({
  roomId,
  userId,
  userName,
  callType,
}: UseWebRTCOptions) {
  const [participants, setParticipants] = useState<WebRTCParticipant[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(callType === "video");
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ws = useRef<WebSocket | null>(null);
  const peerConnections = useRef<{ [userId: string]: RTCPeerConnection }>({});
  const remoteStreams = useRef<{ [userId: string]: MediaStream }>({});

  // --- 1. Get local media stream ---
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const stream = await mediaDevices.getUserMedia({
          audio: true,
          video: callType === "video",
        });
        if (isMounted) {
          setLocalStream(stream);
          setParticipants([
            {
              userId,
              userName,
              stream,
              isLocal: true,
            },
          ]);
        }
      } catch (err) {
        setError("Could not access media devices.");
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [callType, userId, userName]);

  // --- 2. Connect to signaling server ---
  useEffect(() => {
    if (!localStream) return;
    const wsUrl = `${SIGNALING_URL}?roomId=${roomId}&userId=${userId}&userName=${encodeURIComponent(
      userName
    )}`;
    const socket = new WebSocket(wsUrl);
    ws.current = socket;

    socket.onopen = () => {
      setConnected(true);
    };
    socket.onerror = (e) => {
      setError("WebSocket error");
    };
    socket.onclose = () => {
      setConnected(false);
    };
    socket.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        switch (data.type) {
          case "welcome":
            // Initiate offer to all existing participants
            if (data.participants) {
              for (const p of data.participants) {
                if (p.id !== userId) {
                  await createPeerConnection(p.id, p.name, true);
                }
              }
            }
            break;
          case "participant-joined":
            if (data.userId !== userId) {
              await createPeerConnection(data.userId, data.userName, false);
            }
            break;
          case "offer":
            await handleOffer(data.fromUserId, data.sdp);
            break;
          case "answer":
            await handleAnswer(data.fromUserId, data.sdp);
            break;
          case "ice-candidate":
            await handleIceCandidate(data.fromUserId, data.candidate);
            break;
          case "participant-left":
            removeParticipant(data.userId);
            break;
          default:
            break;
        }
      } catch (err) {
        // ignore
      }
    };
    return () => {
      socket.close();
      ws.current = null;
      // Cleanup peer connections
      Object.values(peerConnections.current).forEach((pc) => pc.close());
      peerConnections.current = {};
      remoteStreams.current = {};
      setParticipants((prev) => prev.filter((p) => p.isLocal));
    };
  }, [localStream, roomId, userId, userName]);

  // --- 3. Peer connection logic ---
  const createPeerConnection = useCallback(
    async (
      remoteUserId: string,
      remoteUserName: string,
      isInitiator: boolean
    ) => {
      if (peerConnections.current[remoteUserId]) return;
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      peerConnections.current[remoteUserId] = pc;

      // Add local tracks
      if (localStream) {
        localStream.getTracks().forEach((track) => {
          pc.addTrack(track, localStream);
        });
      }

      // Handle remote stream
      (pc as any).onaddstream = (event: { stream: MediaStream }) => {
        const stream = event.stream;
        remoteStreams.current[remoteUserId] = stream;
        setParticipants((prev) => {
          const exists = prev.find((p) => p.userId === remoteUserId);
          if (exists) {
            return prev.map((p) =>
              p.userId === remoteUserId ? { ...p, stream } : p
            );
          } else {
            return [
              ...prev,
              {
                userId: remoteUserId,
                userName: remoteUserName,
                stream,
                isLocal: false,
              },
            ];
          }
        });
      };

      // ICE candidates
      (pc as any).onicecandidate = (event: {
        candidate: RTCIceCandidate | null;
      }) => {
        if (event.candidate && ws.current) {
          ws.current.send(
            JSON.stringify({
              type: "ice-candidate",
              targetUserId: remoteUserId,
              candidate: event.candidate,
            })
          );
        }
      };

      // Negotiate
      if (isInitiator) {
        const offer = await pc.createOffer({
          offerToReceiveAudio: callType === "audio",
          offerToReceiveVideo: callType === "video",
        });
        await pc.setLocalDescription(offer);
        if (ws.current) {
          ws.current.send(
            JSON.stringify({
              type: "offer",
              targetUserId: remoteUserId,
              sdp: offer,
            })
          );
        }
      }
    },
    [localStream]
  );

  const handleOffer = useCallback(
    async (fromUserId: string, sdp: any) => {
      let pc = peerConnections.current[fromUserId];
      if (!pc) {
        await createPeerConnection(fromUserId, fromUserId, false);
        pc = peerConnections.current[fromUserId];
      }
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      if (ws.current) {
        ws.current.send(
          JSON.stringify({
            type: "answer",
            targetUserId: fromUserId,
            sdp: answer,
          })
        );
      }
    },
    [createPeerConnection]
  );

  const handleAnswer = useCallback(async (fromUserId: string, sdp: any) => {
    const pc = peerConnections.current[fromUserId];
    if (pc) {
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    }
  }, []);

  const handleIceCandidate = useCallback(
    async (fromUserId: string, candidate: any) => {
      const pc = peerConnections.current[fromUserId];
      if (pc && candidate) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    },
    []
  );

  const removeParticipant = useCallback((remoteUserId: string) => {
    if (peerConnections.current[remoteUserId]) {
      peerConnections.current[remoteUserId].close();
      delete peerConnections.current[remoteUserId];
    }
    if (remoteStreams.current[remoteUserId]) {
      delete remoteStreams.current[remoteUserId];
    }
    setParticipants((prev) => prev.filter((p) => p.userId !== remoteUserId));
  }, []);

  // --- 4. Controls ---
  const toggleMute = useCallback(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
        setIsMuted(!track.enabled);
      });
    }
  }, [localStream]);

  const toggleCamera = useCallback(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
        setIsCameraOn(track.enabled);
      });
    }
  }, [localStream]);

  const endCall = useCallback(() => {
    if (ws.current) ws.current.close();
    setParticipants([]);
    setLocalStream(null);
    setConnected(false);
    setError(null);
    // Cleanup peer connections
    Object.values(peerConnections.current).forEach((pc) => pc.close());
    peerConnections.current = {};
    remoteStreams.current = {};
  }, []);

  return {
    participants,
    localStream,
    isMuted,
    isCameraOn,
    connected,
    error,
    toggleMute,
    toggleCamera,
    endCall,
  };
}
