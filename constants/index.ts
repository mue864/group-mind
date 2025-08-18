export { default as Colors } from "./Colors";
export { default as PrivacyStrings } from "./privacyStrings";
export { default as Strings } from "./strings";
export { default as TosStrings } from "./tosStrings";

// WebRTC Configuration
export const WEBRTC_CONFIG = {
  // Use a proper WebSocket URL for your environment
  SIGNALING_URL: __DEV__
    ? "ws://signaling-server-seo6.onrender.com" // Development and production use the same deployed server
    : "ws://signaling-server-seo6.onrender.com", // Production server

  // ICE Servers configuration
  ICE_SERVERS: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:19302" },
  ],
};
