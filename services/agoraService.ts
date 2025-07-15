/**
 * Agora Video Calling Service
 *
 * This service provides a complete video calling solution using Agora's React Native SDK.
 * It implements a singleton pattern to ensure only one instance exists throughout the app.
 *
 * Key Features:
 * - Audio and video calling capabilities
 * - Real-time participant management
 * - Connection state monitoring
 * - Camera and microphone controls
 * - Event handling for user join/leave
 * - Error handling and resource management
 *
 * @author GroupMind Team
 * @version 1.0.0
 */

import {
  ChannelProfileType,
  ClientRoleType,
  createAgoraRtcEngine,
  IRtcEngine,
  IRtcEngineEventHandler,
  RtcConnection,
} from "react-native-agora";

/**
 * Configuration interface for Agora service
 */
export interface AgoraConfig {
  appId: string; // Agora App ID from console
  channel: string; // Channel name for the call
  token?: string; // Optional token for secure authentication
  uid?: number; // Optional user ID
}

/**
 * Interface representing a participant in a call
 */
export interface CallParticipant {
  uid: number; // Unique identifier for the participant
  isLocal: boolean; // Whether this is the local user
  isVideoEnabled: boolean; // Video stream status
  isAudioEnabled: boolean; // Audio stream status
  userName: string; // Display name for the participant
}

/**
 * AgoraService - Singleton class for managing video calls
 *
 * This class handles all Agora SDK interactions including:
 * - Engine initialization and configuration
 * - Channel joining and leaving
 * - Participant management
 * - Audio/video controls
 * - Event handling
 * - Resource cleanup
 */
class AgoraService {
  // Singleton instance
  private static instance: AgoraService;

  // Core Agora engine instance
  private engine: IRtcEngine | null = null;

  // Event handler for Agora callbacks
  private eventHandler: IRtcEngineEventHandler | null = null;

  // Initialization status flag
  private isInitialized = false;

  // Current channel name
  private currentChannel: string | null = null;

  // Map of participants in the current call
  private participants: Map<number, CallParticipant> = new Map();

  // Callback for participant updates
  private onParticipantUpdate?: (participants: CallParticipant[]) => void;

  // Callback for connection state changes
  private onConnectionStateChange?: (state: number) => void;

  // Agora App ID from your configuration
  // Replace with your actual App ID from Agora Console
  private readonly APP_ID = "e7f6e9aeecf14b2ba10e3f40be9f56e7";

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    // Initialize in debug mode if in development
    if (__DEV__) {
      // Initializing in debug mode
    }
  }

  /**
   * Get the singleton instance of AgoraService
   * @returns AgoraService instance
   */
  static getInstance(): AgoraService {
    if (!AgoraService.instance) {
      AgoraService.instance = new AgoraService();
    }
    return AgoraService.instance;
  }

  /**
   * Initialize the Agora RTC engine
   * This method must be called before any other operations
   *
   * @throws Error if initialization fails
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      // Already initialized, skipping
      return;
    }

    try {
      // Creating RTC engine

      // Create RTC engine instance
      this.engine = createAgoraRtcEngine();

      // Initialize with App ID
      await this.engine.initialize({ appId: this.APP_ID });

      // Set up event handlers for real-time callbacks
      this.setupEventHandlers();

      // Enable video by default
      this.engine.enableVideo();

      // Start video preview
      this.engine.startPreview();

      this.isInitialized = true;
      // Engine initialized successfully
    } catch (error) {
      console.error("AgoraService: Failed to initialize engine:", error);
      throw error;
    }
  }

  /**
   * Set up event handlers for Agora callbacks
   * This method configures all the event listeners for the RTC engine
   */
  private setupEventHandlers(): void {
    if (!this.engine) {
      console.error("AgoraService: Engine not available for event setup");
      return;
    }

    // Setting up event handlers

    this.eventHandler = {
      /**
       * Called when local user successfully joins the channel
       */
      onJoinChannelSuccess: (connection: RtcConnection, elapsed: number) => {
        console.log(
          "AgoraService: Local user joined channel:",
          connection.channelId,
          "elapsed:",
          elapsed
        );
        this.currentChannel = connection.channelId || null;

        // Add local user to participants list
        this.addParticipant(0, true, true, true, "You");
      },

      /**
       * Called when a remote user joins the channel
       */
      onUserJoined: (
        connection: RtcConnection,
        uid: number,
        elapsed: number
      ) => {
        console.log(
          "AgoraService: Remote user joined:",
          uid,
          "elapsed:",
          elapsed
        );
        this.addParticipant(uid, false, true, true, `User ${uid}`);
      },

      /**
       * Called when a remote user leaves the channel
       */
      onUserOffline: (
        connection: RtcConnection,
        uid: number,
        reason: number
      ) => {
        console.log(
          "AgoraService: Remote user offline:",
          uid,
          "reason:",
          reason
        );
        this.removeParticipant(uid);
      },

      /**
       * Called when connection state changes
       */
      onConnectionStateChanged: (
        connection: RtcConnection,
        state: number,
        reason: number
      ) => {
        console.log(
          "AgoraService: Connection state changed:",
          state,
          "reason:",
          reason
        );
        if (this.onConnectionStateChange) {
          this.onConnectionStateChange(state);
        }
      },

      /**
       * Called when remote video state changes
       */
      onRemoteVideoStateChanged: (
        connection: RtcConnection,
        remoteUid: number,
        state: number,
        reason: number,
        elapsed: number
      ) => {
        console.log(
          "AgoraService: Remote video state changed:",
          remoteUid,
          "state:",
          state
        );
        // State 2 = enabled, other states = disabled
        this.updateParticipantVideo(remoteUid, state === 2);
      },

      /**
       * Called when remote audio state changes
       */
      onRemoteAudioStateChanged: (
        connection: RtcConnection,
        remoteUid: number,
        state: number,
        reason: number,
        elapsed: number
      ) => {
        console.log(
          "AgoraService: Remote audio state changed:",
          remoteUid,
          "state:",
          state
        );
        // State 2 = enabled, other states = disabled
        this.updateParticipantAudio(remoteUid, state === 2);
      },
    };

    // Register the event handler with the engine
    this.engine.registerEventHandler(this.eventHandler);
    // Event handlers registered successfully
  }

  /**
   * Join a channel for video/audio calling
   *
   * @param channel - Channel name to join
   * @param token - Optional token for secure authentication
   * @param uid - Optional user ID (0 for auto-assignment)
   * @throws Error if joining fails
   */
  async joinChannel(
    channel: string,
    token?: string,
    uid?: number
  ): Promise<void> {
    if (!this.engine || !this.isInitialized) {
      // Engine not initialized, initializing now
      await this.initialize();
    }

    try {
      // Joining channel

      // Join the channel with specified configuration
      this.engine?.joinChannel(token || "", channel, uid || 0, {
        channelProfile: ChannelProfileType.ChannelProfileCommunication,
        clientRoleType: ClientRoleType.ClientRoleBroadcaster,
        publishMicrophoneTrack: true,
        publishCameraTrack: true,
        autoSubscribeAudio: true,
        autoSubscribeVideo: true,
      });

      // Join channel request sent successfully
    } catch (error) {
      console.error("AgoraService: Failed to join channel:", error);
      throw error;
    }
  }

  /**
   * Leave the current channel
   * This method cleans up the current call session
   *
   * @throws Error if leaving fails
   */
  async leaveChannel(): Promise<void> {
    if (!this.engine) {
      console.warn("AgoraService: Engine not available for leaving channel");
      return;
    }

    try {
      console.log("AgoraService: Leaving channel...");

      // Leave the channel
      this.engine.leaveChannel();

      // Reset internal state
      this.currentChannel = null;
      this.participants.clear();

      console.log("AgoraService: Successfully left channel");
    } catch (error) {
      console.error("AgoraService: Failed to leave channel:", error);
      throw error;
    }
  }

  /**
   * Enable or disable local video stream
   *
   * @param enabled - Whether to enable video
   * @throws Error if operation fails
   */
  async enableLocalVideo(enabled: boolean): Promise<void> {
    if (!this.engine) {
      console.warn("AgoraService: Engine not available for video toggle");
      return;
    }

    try {
      console.log("AgoraService: Toggling local video:", enabled);

      if (enabled) {
        this.engine.enableVideo();
      } else {
        this.engine.disableVideo();
      }

      // Update local participant state
      this.updateLocalParticipantVideo(enabled);

      console.log("AgoraService: Local video toggled successfully");
    } catch (error) {
      console.error("AgoraService: Failed to toggle local video:", error);
      throw error;
    }
  }

  /**
   * Enable or disable local audio stream
   *
   * @param enabled - Whether to enable audio
   * @throws Error if operation fails
   */
  async enableLocalAudio(enabled: boolean): Promise<void> {
    if (!this.engine) {
      console.warn("AgoraService: Engine not available for audio toggle");
      return;
    }

    try {
      console.log("AgoraService: Toggling local audio:", enabled);

      if (enabled) {
        this.engine.enableAudio();
      } else {
        this.engine.disableAudio();
      }

      // Update local participant state
      this.updateLocalParticipantAudio(enabled);

      console.log("AgoraService: Local audio toggled successfully");
    } catch (error) {
      console.error("AgoraService: Failed to toggle local audio:", error);
      throw error;
    }
  }

  /**
   * Switch between front and back camera
   *
   * @throws Error if operation fails
   */
  async switchCamera(): Promise<void> {
    if (!this.engine) {
      console.warn("AgoraService: Engine not available for camera switch");
      return;
    }

    try {
      console.log("AgoraService: Switching camera...");
      this.engine.switchCamera();
      console.log("AgoraService: Camera switched successfully");
    } catch (error) {
      console.error("AgoraService: Failed to switch camera:", error);
      throw error;
    }
  }

  /**
   * Add a participant to the participants list
   *
   * @param uid - User ID
   * @param isLocal - Whether this is the local user
   * @param isVideoEnabled - Video stream status
   * @param isAudioEnabled - Audio stream status
   * @param userName - Display name
   */
  private addParticipant(
    uid: number,
    isLocal: boolean,
    isVideoEnabled: boolean,
    isAudioEnabled: boolean,
    userName: string
  ): void {
    console.log("AgoraService: Adding participant:", {
      uid,
      isLocal,
      userName,
    });

    this.participants.set(uid, {
      uid,
      isLocal,
      isVideoEnabled,
      isAudioEnabled,
      userName,
    });

    // Notify listeners of participant update
    this.notifyParticipantUpdate();
  }

  /**
   * Remove a participant from the participants list
   *
   * @param uid - User ID to remove
   */
  private removeParticipant(uid: number): void {
    console.log("AgoraService: Removing participant:", uid);

    this.participants.delete(uid);

    // Notify listeners of participant update
    this.notifyParticipantUpdate();
  }

  /**
   * Update video state for a specific participant
   *
   * @param uid - User ID
   * @param enabled - Whether video is enabled
   */
  private updateParticipantVideo(uid: number, enabled: boolean): void {
    const participant = this.participants.get(uid);
    if (participant) {
      console.log(
        "AgoraService: Updating video state for user",
        uid,
        ":",
        enabled
      );
      participant.isVideoEnabled = enabled;
      this.notifyParticipantUpdate();
    }
  }

  /**
   * Update audio state for a specific participant
   *
   * @param uid - User ID
   * @param enabled - Whether audio is enabled
   */
  private updateParticipantAudio(uid: number, enabled: boolean): void {
    const participant = this.participants.get(uid);
    if (participant) {
      console.log(
        "AgoraService: Updating audio state for user",
        uid,
        ":",
        enabled
      );
      participant.isAudioEnabled = enabled;
      this.notifyParticipantUpdate();
    }
  }

  /**
   * Update video state for local participant
   *
   * @param enabled - Whether video is enabled
   */
  private updateLocalParticipantVideo(enabled: boolean): void {
    const localParticipant = this.participants.get(0);
    if (localParticipant) {
      localParticipant.isVideoEnabled = enabled;
      this.notifyParticipantUpdate();
    }
  }

  /**
   * Update audio state for local participant
   *
   * @param enabled - Whether audio is enabled
   */
  private updateLocalParticipantAudio(enabled: boolean): void {
    const localParticipant = this.participants.get(0);
    if (localParticipant) {
      localParticipant.isAudioEnabled = enabled;
      this.notifyParticipantUpdate();
    }
  }

  /**
   * Notify listeners of participant list changes
   */
  private notifyParticipantUpdate(): void {
    if (this.onParticipantUpdate) {
      const participantsList = Array.from(this.participants.values());
      this.onParticipantUpdate(participantsList);
    }
  }

  /**
   * Get current list of participants
   *
   * @returns Array of participants
   */
  getParticipants(): CallParticipant[] {
    return Array.from(this.participants.values());
  }

  /**
   * Get current channel name
   *
   * @returns Current channel name or null
   */
  getCurrentChannel(): string | null {
    return this.currentChannel;
  }

  /**
   * Set callback for participant updates
   *
   * @param callback - Function to call when participants change
   */
  setParticipantUpdateCallback(
    callback: (participants: CallParticipant[]) => void
  ): void {
    this.onParticipantUpdate = callback;
  }

  /**
   * Set callback for connection state changes
   *
   * @param callback - Function to call when connection state changes
   */
  setConnectionStateCallback(callback: (state: number) => void): void {
    this.onConnectionStateChange = callback;
  }

  /**
   * Destroy the Agora engine and clean up resources
   * This method should be called when the app is closing or when
   * the service is no longer needed
   *
   * @throws Error if destruction fails
   */
  async destroy(): Promise<void> {
    try {
      console.log("AgoraService: Destroying engine...");

      // Leave channel if currently in one
      if (this.currentChannel) {
        await this.leaveChannel();
      }

      // Destroy the engine
      if (this.engine) {
        this.engine.destroy();
        this.engine = null;
      }

      // Clear all state
      this.isInitialized = false;
      this.currentChannel = null;
      this.participants.clear();
      this.eventHandler = null;
      this.onParticipantUpdate = undefined;
      this.onConnectionStateChange = undefined;

      console.log("AgoraService: Engine destroyed successfully");
    } catch (error) {
      console.error("AgoraService: Failed to destroy engine:", error);
      throw error;
    }
  }

  /**
   * Generate a token for secure channel access
   * Note: This is a placeholder implementation
   * In production, tokens should be generated on your server
   *
   * @param channelName - Channel name
   * @param uid - User ID
   * @returns Generated token
   */
  generateToken(channelName: string, uid: number): string {
    // TODO: Implement proper token generation
    // This should call your server to generate a secure token
    console.warn(
      "AgoraService: Token generation not implemented - using empty token"
    );
    return "";
  }
}

// Export singleton instance
export default AgoraService;
