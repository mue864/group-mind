import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { getAuth } from "firebase/auth";
import {
  addDoc,
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
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import AgoraService from "../services/agoraService";
import { db } from "../services/firebase";
import { useGroupContext } from "../store/GroupContext";

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

export default function LiveSessions() {
  const [isLoading, setIsLoading] = useState(false);
  const [scheduledCalls, setScheduledCalls] = useState<ScheduledCall[]>([]);
  const [activeCalls, setActiveCalls] = useState<ActiveCall[]>([]);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [callTitle, setCallTitle] = useState("");
  const [callType, setCallType] = useState<"audio" | "video">("video");
  const [showScheduleForm, setShowScheduleForm] = useState(false);

  const router = useRouter();
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const { userInformation } = useGroupContext();
  const [groupID, setGroupID] = useState("");
  const [groupName, setGroupName] = useState("");

  // Get Agora service instance
  const agoraService = AgoraService.getInstance();

  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        const storedGroupID = await AsyncStorage.getItem("groupID");
        const storedGroupName = await AsyncStorage.getItem("groupName");
        if (storedGroupID) setGroupID(storedGroupID);
        if (storedGroupName) setGroupName(storedGroupName);
      } catch (error) {
        console.error("Error fetching group data:", error);
      }
    };
    fetchGroupData();
  }, []);

  // Fetch scheduled calls
  useEffect(() => {
    if (!groupID) return;
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

  // Utility functions
  const generateChannelName = (): string => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `group-${groupID}-${timestamp}-${random}`;
  };

  const generateJoinLink = (
    channelName: string,
    callType: "audio" | "video"
  ): string => {
    const baseUrl = "groupmind://call";
    return `${baseUrl}?channel=${channelName}&type=${callType}&groupId=${groupID}`;
  };

  // Call actions
  const handleStartCall = async (type: "audio" | "video" = "video") => {
    if (!currentUser || !userInformation) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please sign in to start a call",
      });
      return;
    }
    setIsLoading(true);
    try {
      const channelName = generateChannelName();
      const callRef = await addDoc(collection(db, "activeCalls"), {
        groupId: groupID,
        channelName,
        createdBy: currentUser.uid,
        createdByUserName: userInformation.userName,
        callType: type,
        startedAt: serverTimestamp(),
        status: "active",
        participants: [currentUser.uid],
        groupName,
      });
      const joinLink = generateJoinLink(channelName, type);
      await updateDoc(doc(db, "activeCalls", callRef.id), { joinLink });
      router.push({
        pathname: "/call",
        params: {
          channelName,
          callType: type,
          groupId: groupID,
          callId: callRef.id,
        },
      });
      Toast.show({
        type: "success",
        text1: "Call Started",
        text2: "Your call is now active",
      });
    } catch (error) {
      console.error("Error starting call:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to start call",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleScheduleCall = async () => {
    if (!currentUser || !userInformation) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please sign in to schedule a call",
      });
      return;
    }
    if (!callTitle.trim() || !scheduledDate || !scheduledTime) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please fill in all fields",
      });
      return;
    }
    setIsLoading(true);
    try {
      const [year, month, day] = scheduledDate.split("-").map(Number);
      const [hour, minute] = scheduledTime.split(":").map(Number);
      const scheduledDateTime = new Date(year, month - 1, day, hour, minute);
      if (scheduledDateTime <= new Date()) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Scheduled time must be in the future",
        });
        return;
      }
      const channelName = generateChannelName();
      const scheduledCallRef = await addDoc(collection(db, "scheduledCalls"), {
        title: callTitle,
        scheduledTime: Timestamp.fromDate(scheduledDateTime),
        groupId: groupID,
        createdBy: currentUser.uid,
        createdByUserName: userInformation.userName,
        status: "scheduled",
        callType,
        channelName,
        participants: [currentUser.uid],
        groupName,
      });
      const joinLink = generateJoinLink(channelName, callType);
      await updateDoc(doc(db, "scheduledCalls", scheduledCallRef.id), {
        joinLink,
      });
      setCallTitle("");
      setScheduledDate("");
      setScheduledTime("");
      setShowScheduleForm(false);
      Toast.show({
        type: "success",
        text1: "Call Scheduled",
        text2: "Your call has been scheduled successfully",
      });
    } catch (error) {
      console.error("Error scheduling call:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to schedule call",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinScheduledCall = async (call: ScheduledCall) => {
    if (!currentUser) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please sign in to join the call",
      });
      return;
    }
    try {
      await addDoc(collection(db, "activeCalls"), {
        groupId: call.groupId,
        channelName: call.channelName,
        createdBy: call.createdBy,
        createdByUserName: call.createdByUserName,
        callType: call.callType,
        startedAt: serverTimestamp(),
        status: "active",
        participants: [...call.participants, currentUser.uid],
        groupName,
        joinLink: call.joinLink,
      });
      await updateDoc(doc(db, "scheduledCalls", call.id), {
        status: "in-progress",
        participants: [...call.participants, currentUser.uid],
      });
      router.push({
        pathname: "/call",
        params: {
          channelName: call.channelName,
          callType: call.callType,
          groupId: call.groupId,
        },
      });
    } catch (error) {
      console.error("Error joining scheduled call:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to join call",
      });
    }
  };

  const handleJoinActiveCall = async (call: ActiveCall) => {
    if (!currentUser) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please sign in to join the call",
      });
      return;
    }
    try {
      if (!call.participants.includes(currentUser.uid)) {
        await updateDoc(doc(db, "activeCalls", call.id), {
          participants: [...call.participants, currentUser.uid],
        });
      }
      router.push({
        pathname: "/call",
        params: {
          channelName: call.channelName,
          callType: call.callType,
          groupId: call.groupId,
          callId: call.id,
        },
      });
    } catch (error) {
      console.error("Error joining active call:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to join call",
      });
    }
  };

  const handleShareLink = async (joinLink: string, callTitle: string) => {
    try {
      Toast.show({
        type: "info",
        text1: "Join Link",
        text2: "Link copied to clipboard",
      });
    } catch (error) {
      console.error("Error sharing link:", error);
    }
  };

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

  const isCallStartingSoon = (scheduledTime: Timestamp): boolean => {
    const now = new Date();
    const callTime = scheduledTime.toDate();
    const diffInMinutes = (callTime.getTime() - now.getTime()) / (1000 * 60);
    return diffInMinutes <= 10 && diffInMinutes > 0;
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="bg-gradient-to-r from-purple-500 to-blue-600 px-6 py-8">
          <Text className="text-white text-2xl font-poppins-semiBold mb-2">
            Live Sessions
          </Text>
          <Text className="text-purple-100 text-base">
            Start or join video calls with your group
          </Text>
        </View>

        {/* Active Calls Section */}
        {activeCalls.length > 0 && (
          <View className="px-6 py-4">
            <Text className="text-xl font-poppins-semiBold text-gray-800 mb-4">
              Active Calls
            </Text>
            {activeCalls.map((call) => (
              <View
                key={call.id}
                className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 mb-3 border border-green-200"
              >
                <View className="flex-row items-center mb-3">
                  <Ionicons
                    name={call.callType === "video" ? "videocam" : "call"}
                    size={24}
                    color="#059669"
                  />
                  <Text className="text-lg font-poppins-semiBold text-gray-800 ml-2">
                    {call.callType === "video" ? "Video" : "Audio"} Call
                  </Text>
                  <View className="bg-green-100 px-3 py-1 rounded-full ml-auto">
                    <Text className="text-green-700 text-xs font-poppins-semiBold">
                      LIVE
                    </Text>
                  </View>
                </View>
                <Text className="text-gray-600 mb-2">
                  Started by {call.createdByUserName}
                </Text>
                <Text className="text-gray-500 text-sm mb-3">
                  {call.participants.length} participant(s)
                </Text>
                <View className="flex-row space-x-2">
                  <TouchableOpacity
                    className="flex-1 bg-green-500 py-3 px-4 rounded-xl"
                    onPress={() => handleJoinActiveCall(call)}
                  >
                    <Text className="text-white font-poppins-semiBold text-center">
                      Join Now
                    </Text>
                  </TouchableOpacity>
                  {call.joinLink && (
                    <TouchableOpacity
                      className="bg-blue-500 py-3 px-4 rounded-xl"
                      onPress={() =>
                        handleShareLink(call.joinLink!, "Active Call")
                      }
                    >
                      <Ionicons name="share-outline" size={20} color="white" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Quick Actions Section */}
        <View className="px-6 py-4">
          <Text className="text-xl font-poppins-semiBold text-gray-800 mb-4">
            Quick Actions
          </Text>
          <View className="flex-row space-x-3 mb-4">
            <TouchableOpacity
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 py-4 px-6 rounded-2xl"
              onPress={() => handleStartCall("video")}
              disabled={isLoading}
            >
              <View className="items-center">
                <Ionicons name="videocam" size={32} color="white" />
                <Text className="text-white font-poppins-semiBold mt-2">
                  Start Video Call
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-gradient-to-r from-green-500 to-teal-600 py-4 px-6 rounded-2xl"
              onPress={() => handleStartCall("audio")}
              disabled={isLoading}
            >
              <View className="items-center">
                <Ionicons name="call" size={32} color="white" />
                <Text className="text-white font-poppins-semiBold mt-2">
                  Start Audio Call
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            className="bg-gradient-to-r from-purple-500 to-pink-600 py-4 px-6 rounded-2xl"
            onPress={() => setShowScheduleForm(!showScheduleForm)}
            disabled={isLoading}
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="calendar" size={24} color="white" />
              <Text className="text-white font-poppins-semiBold ml-3 text-lg">
                {showScheduleForm ? "Cancel" : "Schedule"}
              </Text>
            </View>
          </TouchableOpacity>
          {showScheduleForm && (
            <View className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100 mb-4">
              <TextInput
                className="border border-gray-300 rounded-xl p-4 mb-4 text-gray-800 bg-white font-inter"
                value={callTitle}
                onChangeText={setCallTitle}
                placeholder="Call title"
                placeholderTextColor="#9CA3AF"
              />
              <View className="flex-row space-x-3 mb-4">
                <TextInput
                  className="flex-1 border border-gray-300 rounded-xl p-4 text-gray-800 bg-white font-inter"
                  value={scheduledDate}
                  onChangeText={setScheduledDate}
                  placeholder="Date (YYYY-MM-DD)"
                  placeholderTextColor="#9CA3AF"
                />
                <TextInput
                  className="flex-1 border border-gray-300 rounded-xl p-4 text-gray-800 bg-white font-inter"
                  value={scheduledTime}
                  onChangeText={setScheduledTime}
                  placeholder="Time (HH:MM)"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              <View className="flex-row space-x-3 mb-4">
                <TouchableOpacity
                  className={`flex-1 py-3 px-4 rounded-xl border-2 ${
                    callType === "video"
                      ? "bg-blue-500 border-blue-500"
                      : "bg-white border-gray-300"
                  }`}
                  onPress={() => setCallType("video")}
                >
                  <View className="flex-row items-center justify-center">
                    <Ionicons
                      name="videocam"
                      size={20}
                      color={callType === "video" ? "white" : "#6B7280"}
                    />
                    <Text
                      className={`ml-2 font-poppins-semiBold ${
                        callType === "video" ? "text-white" : "text-gray-600"
                      }`}
                    >
                      Video
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 py-3 px-4 rounded-xl border-2 ${
                    callType === "audio"
                      ? "bg-blue-500 border-blue-500"
                      : "bg-white border-gray-300"
                  }`}
                  onPress={() => setCallType("audio")}
                >
                  <View className="flex-row items-center justify-center">
                    <Ionicons
                      name="call"
                      size={20}
                      color={callType === "audio" ? "white" : "#6B7280"}
                    />
                    <Text
                      className={`ml-2 font-poppins-semiBold ${
                        callType === "audio" ? "text-white" : "text-gray-600"
                      }`}
                    >
                      Audio
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                className="bg-purple-500 py-4 px-6 rounded-xl"
                onPress={handleScheduleCall}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <View className="flex-row items-center justify-center">
                    <Ionicons name="calendar" size={24} color="white" />
                    <Text className="text-white font-poppins-semiBold ml-3 text-lg">
                      Schedule Call
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Scheduled Calls Section */}
        <View className="px-6 py-4">
          <Text className="text-xl font-poppins-semiBold text-gray-800 mb-4">
            Scheduled Calls
          </Text>
          {scheduledCalls.length === 0 ? (
            <View className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8 border border-gray-100">
              <View className="items-center">
                <View className="w-20 h-20 bg-gradient-to-r from-gray-400 to-blue-500 rounded-full items-center justify-center mb-4">
                  <Ionicons name="calendar-outline" size={40} color="white" />
                </View>
                <Text className="font-bold text-gray-800 text-xl text-center mb-2">
                  No Scheduled Calls
                </Text>
                <Text className="text-gray-600 text-center text-base leading-6">
                  Schedule a call to see it here. Your group members will be
                  able to join when the time comes.
                </Text>
              </View>
            </View>
          ) : (
            scheduledCalls.map((call) => (
              <View
                key={call.id}
                className={`rounded-2xl p-4 mb-3 border ${
                  isCallStartingSoon(call.scheduledTime)
                    ? "bg-gradient-to-r from-orange-50 to-red-50 border-orange-200"
                    : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
                }`}
              >
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center">
                    <Ionicons
                      name={call.callType === "video" ? "videocam" : "call"}
                      size={24}
                      color={
                        isCallStartingSoon(call.scheduledTime)
                          ? "#EA580C"
                          : "#2563EB"
                      }
                    />
                    <Text className="text-lg font-poppins-semiBold text-gray-800 ml-2">
                      {call.title}
                    </Text>
                  </View>
                  {isCallStartingSoon(call.scheduledTime) && (
                    <View className="bg-orange-100 px-3 py-1 rounded-full">
                      <Text className="text-orange-700 text-xs font-poppins-semiBold">
                        STARTING SOON
                      </Text>
                    </View>
                  )}
                </View>
                <Text className="text-gray-600 mb-2">
                  {call.callType === "video" ? "Video" : "Audio"} call by{" "}
                  {call.createdByUserName}
                </Text>
                <Text className="text-gray-500 text-sm mb-3">
                  {formatDate(call.scheduledTime)}
                </Text>
                <View className="flex-row space-x-2">
                  <TouchableOpacity
                    className="flex-1 bg-blue-500 py-3 px-4 rounded-xl"
                    onPress={() => handleJoinScheduledCall(call)}
                  >
                    <Text className="text-white font-poppins-semiBold text-center">
                      Join Call
                    </Text>
                  </TouchableOpacity>
                  {call.joinLink && (
                    <TouchableOpacity
                      className="bg-green-500 py-3 px-4 rounded-xl"
                      onPress={() =>
                        handleShareLink(call.joinLink!, call.title)
                      }
                    >
                      <Ionicons name="share-outline" size={20} color="white" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
        <View className="h-20" />
      </ScrollView>
    </View>
  );
}
