export { default as Colors } from "./Colors";
export { default as PrivacyStrings } from "./privacyStrings";
export { default as Strings } from "./strings";
export { default as TosStrings } from "./tosStrings";

// WebRTC Configuration
export const WEBRTC_CONFIG = {
  // Use a proper WebSocket URL for your environment
  SIGNALING_URL: __DEV__
    ? "ws://192.168.101.113:3001" // Local development
    : "ws://192.168.101.113:3001", // Production server - replace with your actual server

  // ICE Servers configuration
  ICE_SERVERS: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:19302" },
  ],
};
