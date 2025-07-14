import * as ExpoAudio from "expo-av";
import * as ExpoCamera from "expo-camera";
import { Alert, Linking, Platform } from "react-native";

export interface PermissionStatus {
  camera: boolean;
  microphone: boolean;
  canProceed: boolean;
}

export class PermissionError extends Error {
  constructor(
    message: string,
    public permissionType: "camera" | "microphone" | "both"
  ) {
    super(message);
    this.name = "PermissionError";
  }
}

/**
 * Request camera and microphone permissions with proper error handling
 */
export async function requestMediaPermissions(
  callType: "audio" | "video"
): Promise<PermissionStatus> {
  const status: PermissionStatus = {
    camera: false,
    microphone: false,
    canProceed: false,
  };

  try {
    // Request microphone permission (always needed)
    const audioPermission = await ExpoAudio.Audio.requestPermissionsAsync();
    status.microphone = audioPermission.status === "granted";

    if (!status.microphone) {
      throw new PermissionError(
        "Microphone permission is required for calls",
        "microphone"
      );
    }

    // Request camera permission only for video calls
    if (callType === "video") {
      const cameraPermission =
        await ExpoCamera.Camera.requestPermissionsAsync();
      status.camera = cameraPermission.status === "granted";

      if (!status.camera) {
        throw new PermissionError(
          "Camera permission is required for video calls",
          "camera"
        );
      }
    } else {
      // For audio calls, we don't need camera
      status.camera = true;
    }

    status.canProceed =
      status.microphone && (callType === "audio" || status.camera);
    return status;
  } catch (error) {
    console.error("Permission request failed:", error);

    if (error instanceof PermissionError) {
      throw error;
    }

    throw new PermissionError("Failed to request permissions", "both");
  }
}

/**
 * Check current permission status without requesting
 */
export async function checkMediaPermissions(
  callType: "audio" | "video"
): Promise<PermissionStatus> {
  const status: PermissionStatus = {
    camera: false,
    microphone: false,
    canProceed: false,
  };

  try {
    // Check microphone permission
    const audioPermission = await ExpoAudio.Audio.getPermissionsAsync();
    status.microphone = audioPermission.status === "granted";

    // Check camera permission only for video calls
    if (callType === "video") {
      const cameraPermission = await ExpoCamera.Camera.getPermissionsAsync();
      status.camera = cameraPermission.status === "granted";
    } else {
      status.camera = true; // Not needed for audio calls
    }

    status.canProceed =
      status.microphone && (callType === "audio" || status.camera);
    return status;
  } catch (error) {
    console.error("Permission check failed:", error);
    return status;
  }
}

/**
 * Show permission denied alert with option to open settings
 */
export function showPermissionDeniedAlert(
  permissionType: "camera" | "microphone" | "both"
) {
  const permissionName =
    permissionType === "both" ? "camera and microphone" : permissionType;

  Alert.alert(
    "Permission Required",
    `${
      permissionName.charAt(0).toUpperCase() + permissionName.slice(1)
    } permission is required for calls. Please enable it in your device settings.`,
    [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Open Settings",
        onPress: () => openAppSettings(),
      },
    ]
  );
}

/**
 * Open app settings
 */
export async function openAppSettings() {
  try {
    await Linking.openSettings();
  } catch (error) {
    console.error("Failed to open settings:", error);
    Alert.alert(
      "Error",
      "Unable to open settings. Please manually enable camera and microphone permissions in your device settings."
    );
  }
}

/**
 * Web-specific permission handling
 */
export async function requestWebPermissions(
  callType: "audio" | "video"
): Promise<PermissionStatus> {
  if (Platform.OS !== "web") {
    throw new Error("This function is for web only");
  }

  const status: PermissionStatus = {
    camera: false,
    microphone: false,
    canProceed: false,
  };

  try {
    // Test microphone access
    const audioStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    status.microphone = true;
    audioStream.getTracks().forEach((track) => track.stop());

    // Test camera access for video calls
    if (callType === "video") {
      const videoStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      status.camera = true;
      videoStream.getTracks().forEach((track) => track.stop());
    } else {
      status.camera = true; // Not needed for audio calls
    }

    status.canProceed =
      status.microphone && (callType === "audio" || status.camera);
    return status;
  } catch (error) {
    console.error("Web permission request failed:", error);

    if (error instanceof Error) {
      if (error.name === "NotAllowedError") {
        throw new PermissionError(
          "Camera/microphone access was denied. Please allow access and try again.",
          callType === "video" ? "both" : "microphone"
        );
      } else if (error.name === "NotFoundError") {
        throw new PermissionError(
          "Camera or microphone not found on this device.",
          "both"
        );
      } else if (error.name === "NotSupportedError") {
        throw new PermissionError(
          "Camera/microphone access is not supported on this device.",
          "both"
        );
      }
    }

    throw new PermissionError("Failed to access camera/microphone", "both");
  }
}

/**
 * Check web permissions without requesting media access
 */
export async function checkWebPermissions(
  callType: "audio" | "video"
): Promise<PermissionStatus> {
  if (Platform.OS !== "web") {
    throw new Error("This function is for web only");
  }

  const status: PermissionStatus = {
    camera: false,
    microphone: false,
    canProceed: false,
  };

  try {
    // Check if getUserMedia is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.warn("getUserMedia not supported");
      return status;
    }

    // For web, we can't reliably check permissions without requesting them
    // So we'll assume they might be granted and let the actual media request handle it
    // This is a limitation of web browsers - they don't provide a way to check
    // permissions without actually requesting them
    status.microphone = true;
    status.camera = callType === "audio" ? true : true; // Assume available
    status.canProceed = true;

    return status;
  } catch (error) {
    console.error("Web permission check failed:", error);
    return status;
  }
}

/**
 * Unified permission request that works on all platforms
 */
export async function requestUnifiedPermissions(
  callType: "audio" | "video"
): Promise<PermissionStatus> {
  try {
    if (Platform.OS === "web") {
      return await requestWebPermissions(callType);
    } else {
      return await requestMediaPermissions(callType);
    }
  } catch (error) {
    console.error("Unified permission request failed:", error);
    throw error;
  }
}

/**
 * Check if permissions are granted without requesting
 */
export async function checkUnifiedPermissions(
  callType: "audio" | "video"
): Promise<PermissionStatus> {
  try {
    if (Platform.OS === "web") {
      // For web, we can't reliably check without requesting, so assume available
      return await checkWebPermissions(callType);
    } else {
      return await checkMediaPermissions(callType);
    }
  } catch (error) {
    console.error("Unified permission check failed:", error);
    return {
      camera: false,
      microphone: false,
      canProceed: false,
    };
  }
}
