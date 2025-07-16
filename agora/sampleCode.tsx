// Import React Hooks
import React, { useEffect, useRef, useState } from "react";
// Import user interface elements
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
// Import components related to obtaining Android device permissions
import { PermissionsAndroid, Platform } from "react-native";
// Import Agora SDK
import {
  ChannelProfileType,
  ClientRoleType,
  createAgoraRtcEngine,
  IRtcEngine,
  IRtcEngineEventHandler,
  RtcConnection,
  RtcSurfaceView,
  VideoSourceType,
} from "react-native-agora";

// Define basic information
const appId = "6789f301a9b14fbd855543bc208187b3";
const token =
  "007eJxTYMh7UPn/u67p5/k7n/6+fiPzyOaDzpdMrBbz5zHdWqy+qdJVgcHM3MIyzdjAMNEyydAkLSnFwtTU1MQ4KdnIwMLQwjzJWKS5PKMhkJFBQNWdmZEBAkF8AwaF9KL80gJdg/y8JG9TE9MAv8iUiEzPoCAvC39dQ3NTIzMzI0MLYwNLQ12LzKSSkkoGBgDIViyl";
const channelName = "test"; // Use the same string on both devices
const localUid = 0; // Set to a unique number per device for testing, e.g., 1 for device A, 2 for device B

const App = () => {
  const agoraEngineRef = useRef<IRtcEngine>(); // IRtcEngine instance
  const [isJoined, setIsJoined] = useState(false); // Whether the local user has joined the channel
  const [isHost, setIsHost] = useState(true); // User role
  const [remoteUid, setRemoteUid] = useState(0); // Uid of the remote user
  const [message, setMessage] = useState(""); // User prompt message
  const eventHandler = useRef<IRtcEngineEventHandler>(); // Implement callback functions

  useEffect(() => {
    const init = async () => {
      await setupVideoSDKEngine();
      setupEventHandler();
    };
    init();
    // Cleanup on unmount
    return () => {
      agoraEngineRef.current?.unregisterEventHandler(eventHandler.current!);
      agoraEngineRef.current?.release();
    };
  }, []); // Empty dependency array ensures it runs only once

  const setupEventHandler = () => {
    eventHandler.current = {
      onJoinChannelSuccess: () => {
        setMessage("Successfully joined channel: " + channelName);
        setupLocalVideo();
        setIsJoined(true);
      },
      onUserJoined: (_connection: RtcConnection, uid: number) => {
        setMessage("Remote user " + uid + " joined");
        setRemoteUid(uid);
      },
      onUserOffline: (_connection: RtcConnection, uid: number) => {
        setMessage("Remote user " + uid + " left the channel");
        setRemoteUid(uid);
      },
    };
    agoraEngineRef.current?.registerEventHandler(eventHandler.current);
  };

  const setupVideoSDKEngine = async () => {
    try {
      if (Platform.OS === "android") {
        await getPermission();
      }
      agoraEngineRef.current = createAgoraRtcEngine();
      const agoraEngine = agoraEngineRef.current;
      await agoraEngine.initialize({ appId: appId });
    } catch (e) {
      console.error(e);
    }
  };

  const setupLocalVideo = () => {
    agoraEngineRef.current?.enableVideo();
    agoraEngineRef.current?.startPreview();
  };

  // Define the join method called after clicking the join channel button
  const join = async () => {
    if (isJoined) {
      return;
    }
    try {
      if (isHost) {
        // Join the channel as a broadcaster
        agoraEngineRef.current?.joinChannel(token, channelName, localUid, {
          // Set channel profile to live broadcast
          channelProfile: ChannelProfileType.ChannelProfileCommunication,
          // Set user role to broadcaster
          clientRoleType: ClientRoleType.ClientRoleBroadcaster,
          // Publish audio collected by the microphone
          publishMicrophoneTrack: true,
          // Publish video collected by the camera
          publishCameraTrack: true,
          // Automatically subscribe to all audio streams
          autoSubscribeAudio: true,
          // Automatically subscribe to all video streams
          autoSubscribeVideo: true,
        });
      } else {
        // Join the channel as an audience
        agoraEngineRef.current?.joinChannel(token, channelName, localUid, {
          // Set channel profile to live broadcast
          channelProfile: ChannelProfileType.ChannelProfileCommunication,
          // Set user role to audience
          clientRoleType: ClientRoleType.ClientRoleAudience,
          // Do not publish audio collected by the microphone
          publishMicrophoneTrack: false,
          // Do not publish video collected by the camera
          publishCameraTrack: false,
          // Automatically subscribe to all audio streams
          autoSubscribeAudio: true,
          // Automatically subscribe to all video streams
          autoSubscribeVideo: true,
        });
      }
    } catch (e) {
      // Error occurred during join
    }
  };

  // Define the leave method called after clicking the leave channel button
  const leave = () => {
    try {
      // Call leaveChannel method to leave the channel
      agoraEngineRef.current?.leaveChannel();
      setRemoteUid(0);
      setIsJoined(false);
      showMessage("Left the channel");
    } catch (e) {
      // Error occurred during leave
    }
  };

  // Render user interface
  return (
    <SafeAreaView style={styles.main}>
      <Text style={styles.head}>Agora Video SDK Quickstart</Text>
      <View style={styles.btnContainer}>
        <Text onPress={join} style={styles.button}>
          Join Channel
        </Text>
        <Text onPress={leave} style={styles.button}>
          Leave Channel
        </Text>
      </View>
      <View style={styles.btnContainer}>
        <Text>Audience</Text>
        <Switch
          onValueChange={(switchValue) => {
            setIsHost(switchValue);
            if (isJoined) {
              leave();
            }
          }}
          value={isHost}
        />
        <Text>Host</Text>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContainer}
      >
        {isJoined && isHost ? (
          <React.Fragment key={localUid}>
            <Text>Local user uid: {localUid}</Text>
            <RtcSurfaceView
              canvas={{
                uid: localUid,
                sourceType: VideoSourceType.VideoSourceCamera,
              }}
              style={styles.videoView}
            />
          </React.Fragment>
        ) : (
          <Text>Join a channel</Text>
        )}
        {isJoined && remoteUid !== 0 ? (
          <React.Fragment key={remoteUid}>
            <Text>Remote user uid: {remoteUid}</Text>
            <RtcSurfaceView
              canvas={{
                uid: remoteUid,
                sourceType: VideoSourceType.VideoSourceCamera,
              }}
              style={styles.videoView}
            />
          </React.Fragment>
        ) : (
          <Text>
            {isJoined && !isHost ? "Waiting for remote user to join" : ""}
          </Text>
        )}
        <Text style={styles.info}>{message}</Text>
      </ScrollView>
    </SafeAreaView>
  );

  // Display information
  function showMessage(msg: string) {
    setMessage(msg);
  }
};

// Define user interface styles
const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 25,
    paddingVertical: 4,
    fontWeight: "bold",
    color: "#ffffff",
    backgroundColor: "#0055cc",
    margin: 5,
  },
  main: { flex: 1, alignItems: "center" },
  scroll: { flex: 1, backgroundColor: "#ddeeff", width: "100%" },
  scrollContainer: { alignItems: "center" },
  videoView: { width: "90%", height: 200 },
  btnContainer: { flexDirection: "row", justifyContent: "center" },
  head: { fontSize: 20 },
  info: { backgroundColor: "#ffffe0", paddingHorizontal: 8, color: "#0000ff" },
});

const getPermission = async () => {
  if (Platform.OS === "android") {
    await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      PermissionsAndroid.PERMISSIONS.CAMERA,
    ]);
  }
};

export default App;
