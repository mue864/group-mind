import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import { Camera } from "expo-camera";
import { useRouter } from "expo-router";
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { db } from "../../../services/firebase";
import { useGroupContext } from "../../../store/GroupContext";
import { showMessage } from "react-native-flash-message";

// Types for calls
type ScheduledCall = {
  id: string;
  title: string;
  scheduledTime: Timestamp;
  groupId: string;
  createdBy: string;
  createdByUserName: string;
  status: "scheduled" | "in-progress" | "completed";
  callType: "audio" | "video";
  channelName: string;
  joinLink?: string;
  participants: string[];
  maxParticipants?: number;
};

type ActiveCall = {
  id: string;
  groupId: string;
  channelName: string;
  callType: "audio" | "video";
  startedAt: Timestamp;
  createdBy: string;
  createdByUserName: string;
  participants: string[];
  status: "active" | "ended";
  joinLink?: string;
};

export default function Live() {
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [callType, setCallType] = useState("video"); // "video" or "audio"
  const [callTitle, setCallTitle] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");

  // Add group context
  const { userInformation, groupID: contextGroupID, updateCallParticipants } = useGroupContext();
  const router = useRouter();

  // Local state for groupID and groupName from AsyncStorage
  const [groupID, setGroupID] = useState("");
  const [groupName, setGroupName] = useState("");

  // Backend state
  const [scheduledCalls, setScheduledCalls] = useState<ScheduledCall[]>([]);
  const [activeCalls, setActiveCalls] = useState<ActiveCall[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStartingCall, setIsStartingCall] = useState(false);
  const [callDocId, setCallDocId] = useState("");

  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        const storedGroupID = await AsyncStorage.getItem("groupID");
        const storedGroupName = await AsyncStorage.getItem("groupName");
        if (storedGroupID) setGroupID(storedGroupID);
        if (storedGroupName) setGroupName(storedGroupName);
      } catch (error) {
        console.error("Error fetching group data from AsyncStorage:", error);
      }
    };
    fetchGroupData();
  }, []);

  // Fetch scheduled calls
  useEffect(() => {
    if (!groupID) return;
    setIsLoading(true);
    const q = query(
      collection(db, "scheduledCalls"),
      where("groupId", "==", groupID),
      where("status", "in", ["scheduled", "in-progress"])
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const calls = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ScheduledCall[];
      const sortedCalls = [...calls].sort(
        (a, b) => a.scheduledTime.seconds - b.scheduledTime.seconds
      );
      setScheduledCalls(sortedCalls);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [groupID]);

  // Fetch active calls
  useEffect(() => {
    if (!groupID) return;
    const q = query(
      collection(db, "activeCalls"),
      where("groupId", "==", groupID),
      where("status", "==", "active")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const calls = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ActiveCall[];
      setActiveCalls(calls);
    });
    return () => unsubscribe();
  }, [groupID]);

  // Generate a unique channel name
  const generateChannelName = (): string => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `group-${groupID}-${timestamp}-${random}`;
  };

  // Generate join link (optional, for future use)
  const generateJoinLink = (
    channelName: string,
    callType: "audio" | "video"
  ): string => {
    const baseUrl = "groupmind://call";
    return `${baseUrl}?channel=${channelName}&type=${callType}&groupId=${groupID}`;
  };

  // Handle start call
  const handleStartCall = async (type: "audio" | "video" = "video") => {
    if (!userInformation) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please sign in to start a call",
      });
      return;
    }
    if (!groupID) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No group selected",
      });
      return;
    }
    setIsStartingCall(true);
    try {
      const channelName = generateChannelName();
      const callRef = await addDoc(collection(db, "activeCalls"), {
        groupId: groupID,
        channelName,
        createdBy: userInformation.userID,
        createdByUserName: userInformation.userName,
        callType: type,
        startedAt: serverTimestamp(),
        status: "active",
        participants: [userInformation.userID],
        groupName,
      });
      const joinLink = generateJoinLink(channelName, type);
      setCallDocId(callRef.id);
      await updateDoc(doc(db, "activeCalls", callRef.id),{
        id: callRef.id,
        joinLink,
      } );
      Toast.show({
        type: "success",
        text1: "Call Started",
        text2: `Your ${type} call is now active`,
      });
    } catch (error) {
      console.error("Error starting call:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to start call",
      });
    } finally {
      setIsStartingCall(false);
    }
  };

  async function requestCallPermissions(callType: "audio" | "video") {
    let cameraGranted = true;
    let audioGranted = true;

    if (callType === "video") {
      const { status } = await Camera.requestCameraPermissionsAsync();
      cameraGranted = status === "granted";
    }
    const { status: audioStatus } = await Audio.requestPermissionsAsync();
    audioGranted = audioStatus === "granted";

    return cameraGranted && audioGranted;
  }

  // Handle join active call
  const handleJoinActiveCall = async (call: ActiveCall) => {
    if (!userInformation) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please sign in to join the call",
      });
      return;
    }
    // permissions
    const granted = await requestCallPermissions(call.callType);
    if (!granted) {
      Alert.alert(
        "Permissions Required",
        "Camera and microphone permissions are required to join the call"
      );
    }
    try {
      console.log("callDocId: ", callDocId);
      console.log("User info", userInformation.userID)
      // update participants in firestore
      await updateDoc(doc(db, "activeCalls", call.id), {
        participants: arrayUnion(userInformation.userID),
      });

      // Only use updateCallParticipants to handle joining
      await updateCallParticipants(callDocId, userInformation.userID, true);

      router.push({
        pathname: "/call",
        params: {
          groupId: String(call.groupId),
          channel: String(call.channelName),
          type: String(call.callType),
          groupName: String(groupName),
          callDocId: String(callDocId),
          callId: String(call.id),
        },
      });
      console.log("Call doc id: ", callDocId);
    } catch (error) {
      console.error("Error joining active call:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to join call",
      });
    }
  };

  // Format date utility
  const formatDate = (timestamp: Timestamp): string => {
    const date = timestamp.toDate();
    return date.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 mt-4 py-3">
          <Text className="text-white bg-primary border border-secondary/50 rounded-2xl p-3 text-2xl font-poppins-semiBold mb-2">
            Live Sessions
          </Text>
        </View>
        

        {/* Active Calls Section */}
        <View className="px-6 py-4">
          <Text className="text-xl font-poppins-semiBold text-slate-800 mb-4">
            Active Calls
          </Text>
          {activeCalls.length === 0 ? (
            <Text className="text-slate-400 text-sm font-poppins">
              No active calls.
            </Text>
          ) : (
            activeCalls.map((call) => (
              <View
                key={call.id}
                className="bg-emerald-100 rounded-2xl p-4 mb-3 border border-emerald-200"
              >
                <View className="flex-row items-center mb-3">
                  <Ionicons
                    name={call.callType === "video" ? "videocam" : "call"}
                    size={24}
                    color="#059669"
                  />
                  <Text className="text-lg font-poppins-semiBold text-slate-800 ml-2">
                    {call.callType === "video" ? "Video" : "Audio"} Call
                  </Text>
                  <View className="bg-emerald-200 px-3 py-1 rounded-full ml-auto">
                    <Text className="text-emerald-700 text-xs font-poppins-semiBold">
                      LIVE
                    </Text>
                  </View>
                </View>
                <Text className="text-slate-400 mb-1 font-poppins-semiBold">
                  Started by {call.createdByUserName}
                </Text>
                <Text className="text-slate-400 text-sm mb-3">
                  {call.participants.length} participant(s)
                </Text>
                <View className="flex-row space-x-2">
                  <TouchableOpacity
                    className="flex-1 bg-emerald-500 py-3 rounded-xl"
                    onPress={() => handleJoinActiveCall(call)}
                  >
                    <Text className="text-white font-bold text-center font-poppins">
                      Join Now
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Quick Actions Section (with start call) */}
        <View className="px-6 py-4">
          <Text className="text-xl font-poppins-semiBold text-slate-800 mb-4">
            Quick Actions
          </Text>
          <View className="flex-row gap-3 mb-4">
            <TouchableOpacity
              className={`flex-1 bg-indigo-500 py-4 rounded-2xl items-center ${
                isStartingCall ? "opacity-60" : ""
              }`}
              onPress={() => handleStartCall("video")}
              disabled={isStartingCall}
            >
              <Ionicons name="videocam" size={32} color="white" />
              <Text className="text-white font-poppins-semiBold mt-2">
                Start Video Call
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 bg-emerald-500 py-4 rounded-2xl items-center ${
                isStartingCall ? "opacity-60" : ""
              }`}
              onPress={() => handleStartCall("audio")}
              disabled={isStartingCall}
            >
              <Ionicons name="call" size={32} color="white" />
              <Text className="text-white font-poppins-semiBold mt-2">
                Start Audio Call
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            className="bg-primary py-4 rounded-2xl items-center"
            onPress={() => setShowScheduleForm((prev) => !prev)}
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="calendar" size={24} color="white" />
              <Text className="text-white font-poppins-semiBold ml-3 text-lg">
                {showScheduleForm ? "Cancel" : "Schedule"}
              </Text>
            </View>
          </TouchableOpacity>
          {showScheduleForm && (
            <View className="bg-primary/10 rounded-2xl p-6 border border-primary/50 mt-4">
              <TextInput
                className="border border-gray-300 rounded-xl p-3 mb-3 text-slate-800"
                value={callTitle}
                onChangeText={setCallTitle}
                placeholder="Call title"
                placeholderTextColor="#9CA3AF"
              />
              <View className="flex-row gap-3 mb-3">
                <TextInput
                  className="flex-1 border border-gray-300 rounded-xl p-3 text-slate-800"
                  value={scheduledDate}
                  onChangeText={setScheduledDate}
                  placeholder="Date (YYYY-MM-DD)"
                  placeholderTextColor="#9CA3AF"
                />
                <TextInput
                  className="flex-1 border border-gray-300 rounded-xl p-3 text-slate-800"
                  value={scheduledTime}
                  onChangeText={setScheduledTime}
                  placeholder="Time (HH:MM)"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              <View className="flex-row gap-3 mb-3">
                <TouchableOpacity
                  className={`flex-1 py-3 rounded-xl border-2 items-center ${
                    callType === "video"
                      ? "bg-blue-500 border-blue-500"
                      : "bg-green-500 border-green-500"
                  }`}
                  onPress={() => setCallType("video")}
                >
                  <View className="flex-row items-center">
                    <Ionicons
                      name="videocam"
                      size={20}
                      color={callType === "video" ? "white" : "#6B7280"}
                    />
                    <Text
                      className={`ml-2 font-poppins-semiBold ${
                        callType === "video" ? "text-white" : "text-gray-700"
                      }`}
                    >
                      Video
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 py-3 rounded-xl border-2 items-center ${
                    callType === "audio"
                      ? "bg-blue-500 border-blue-500"
                      : "bg-green-500 border-green-500"
                  }`}
                  onPress={() => setCallType("audio")}
                >
                  <View className="flex-row items-center">
                    <Ionicons
                      name="call"
                      size={20}
                      color={callType === "audio" ? "white" : "white"}
                    />
                    <Text
                      className={`ml-2 font-bold ${
                        callType === "audio" ? "text-white" : "text-white"
                      }`}
                    >
                      Audio
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                className="bg-primary py-4 rounded-xl items-center"
                onPress={() => {}}
              >
                <View className="flex-row items-center justify-center">
                  <Ionicons name="calendar" size={24} color="white" />
                  <Text className="text-white font-poppins-semiBold ml-3 text-lg">
                    Schedule Call
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Scheduled Calls Section */}
        <View className="px-6 py-4">
          <Text className="text-xl font-bold text-slate-800 mb-4">
            Scheduled Calls
          </Text>
          {isLoading ? (
            <ActivityIndicator size="small" color="#6366f1" />
          ) : scheduledCalls.length === 0 ? (
            <View className="bg-slate-100 rounded-2xl p-8 border border-slate-200 items-center">
              <View className="w-20 h-20 bg-indigo-500 rounded-full items-center justify-center mb-4">
                <Ionicons name="calendar-outline" size={40} color="white" />
              </View>
              <Text className="font-bold text-slate-800 text-xl text-center mb-2">
                No Scheduled Calls
              </Text>
              <Text className="text-slate-400 text-center font-poppins-semiBold text-base leading-6">
                Schedule a call to see it here. Your group members will be able
                to join when the time comes.
              </Text>
            </View>
          ) : (
            scheduledCalls.map((call) => (
              <View
                key={call.id}
                className="bg-slate-100 rounded-2xl p-4 mb-3 border border-slate-200"
              >
                <View className="flex-row items-center mb-3">
                  <Ionicons
                    name={call.callType === "video" ? "videocam" : "call"}
                    size={24}
                    color="#6366f1"
                  />
                  <Text className="text-lg font-poppins-semiBold text-slate-800 ml-2">
                    {call.title}
                  </Text>
                </View>
                <Text className="text-slate-400 mb-1 font-poppins-semiBold">
                  {call.callType === "video" ? "Video" : "Audio"} call by{" "}
                  {call.createdByUserName}
                </Text>
                <Text className="text-slate-400 text-sm mb-3 font-poppins-semiBold">
                  {formatDate(call.scheduledTime)}
                </Text>
              </View>
            ))
          )}
        </View>


        <View className="h-20" />
      </ScrollView>
    </View>
  );
}
