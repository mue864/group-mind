export { default as Colors } from "./Colors";
export { default as PrivacyStrings } from "./privacyStrings";
export { default as Strings } from "./strings";
export { default as TosStrings } from "./tosStrings";

// WebRTC Configuration
export const WEBRTC_CONFIG = {
  // Use secure WebSocket URL for production builds
  SIGNALING_URL: __DEV__
    ? "ws://signaling-server-seo6.onrender.com" // Development - can use ws://
    : "wss://signaling-server-seo6.onrender.com", // Production - must use wss:// for HTTPS domains

  // ICE Servers configuration with TURN servers for better connectivity
  ICE_SERVERS: [
    // STUN servers for NAT traversal
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:19302" },
    // Additional STUN servers for redundancy
    { urls: "stun:stun.services.mozilla.com" },
    { urls: "stun:stun.stunprotocol.org:3478" },
  ],
};
