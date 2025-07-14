import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, Alert, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { MaterialIcons } from '@expo/vector-icons';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

type ScheduledCall = {
  id: string;
  title: string;
  scheduledTime: Timestamp;
  groupId: string;
  createdBy: string;
  status: 'scheduled' | 'in-progress' | 'completed';
};

export default function GroupScheduleSession() {

  const [isLoading, setIsLoading] = useState(false);
  const [scheduledCalls, setScheduledCalls] = useState<ScheduledCall[]>([]);
  const [scheduledTime, setScheduledTime] = useState('');
  const [callTitle, setCallTitle] = useState('');
  const router = useRouter();
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const [groupID, setGroupID] = useState('');

  useEffect(() => {
    try {
        const fetchGroupID = async () => {
            const groupID = await AsyncStorage.getItem("groupID");
            if (groupID) {
                setGroupID(groupID);
            }
        }
        fetchGroupID();
    } catch (error) {
        console.error("Error fecthing groupID ", error);
    }
  }, [])

  const handleStartCall = async (callType: 'audio' | 'video' = 'video') => {
    if (!currentUser) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please sign in to start a call"
      })
      return;
    }
    setIsLoading(true);
    
    try {
      // Create call session in Firebase
      await addDoc(collection(db, 'activeCalls'), {
        groupId: groupID,
        createdBy: currentUser.uid,
        callType,
        startedAt: serverTimestamp(),
        status: 'active',
        participants: [currentUser.uid]
      });
      
      setIsLoading(false);
      router.push(`/(groups)/${groupID}/call?type=${callType}`);
    } catch (error) {
      console.error('Error starting call:', error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to start call. Please try again."
      });
      setIsLoading(false);
    }
  };

  console.log("GroupId: ", groupID);
  useEffect(() => {
    if (!groupID) return;
    
    const q = query(
      collection(db, 'scheduledCalls'),
      where('groupId', '==', groupID),
      where('status', 'in', ['scheduled', 'in-progress'])
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const calls = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ScheduledCall[];
      
      // Sort by scheduled time
      const sortedCalls = [...calls].sort((a, b) => 
        a.scheduledTime.seconds - b.scheduledTime.seconds
      );
      
      setScheduledCalls(sortedCalls);
    });
    
    return () => unsubscribe();
  }, [groupID]);

  const handleScheduleCall = async () => {
    if (!callTitle.trim() || !scheduledTime) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please enter a title and select a time for the call"
      })
      return;
    }

    if (!currentUser) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "You must be signed in to schedule a call"
      })
      return;
    }

    setIsLoading(true);
    try {
      await addDoc(collection(db, 'scheduledCalls'), {
        groupId: groupID,
        title: callTitle,
        scheduledTime: Timestamp.fromDate(new Date(scheduledTime)),
        createdBy: currentUser.uid,
        createdAt: serverTimestamp(),
        status: 'scheduled' as const
      });
      
      setCallTitle('');
      setScheduledTime('');
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Call scheduled successfully!"
      })
    } catch (error) {
      console.error('Error scheduling call:', error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to schedule call. Please try again."
      })
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-100 p-4">
        <Text className="text-gray-700">Please sign in to start a session</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100">
      <ScrollView className="flex-1 p-4">
        <View className="mb-6 p-4 bg-white rounded-lg shadow">
          <Text className="text-xl font-bold mb-4 text-gray-800">Schedule a Call</Text>
          <TextInput
            className="border border-gray-300 rounded-md p-3 mb-3 text-gray-800 bg-white"
            value={callTitle}
            onChangeText={setCallTitle}
            placeholder="Call title"
            placeholderTextColor="#9CA3AF"
          />
          <TextInput
            className="border border-gray-300 rounded-md p-3 mb-4 text-gray-800 bg-white"
            value={scheduledTime}
            onChangeText={setScheduledTime}
            placeholder="Scheduled time (YYYY-MM-DDTHH:mm:ss.sssZ)"
            placeholderTextColor="#9CA3AF"
          />
          <TouchableOpacity
            className="flex-row items-center justify-center bg-blue-600 py-3 px-6 rounded-lg mt-2"
            onPress={handleScheduleCall}
            disabled={isLoading}
          >
            <MaterialIcons name="schedule" size={24} color="#fff" />
            <Text className="text-white font-semibold ml-2">Schedule Call</Text>
          </TouchableOpacity>
        </View>
        <View className="mb-6 p-4 bg-white rounded-lg shadow">
          <Text className="text-xl font-bold mb-4 text-gray-800">Scheduled Calls</Text>
          {scheduledCalls.length === 0 ? (
            <Text className="text-gray-500 text-center py-4">No scheduled calls</Text>
          ) : (
            scheduledCalls.map(call => (
              <View key={call.id} className="bg-gray-50 p-4 rounded-lg mb-3 border border-gray-200">
                <Text className="text-lg font-semibold text-gray-800">{call.title}</Text>
                <Text className="text-gray-600 mb-3">{call.scheduledTime.toDate().toLocaleString()}</Text>
                <TouchableOpacity
                  className="bg-green-600 py-2 px-4 rounded-md"
                  onPress={() => router.push(`/call/group-${groupID}`)}
                >
                  <Text className="text-white font-medium">Join Call</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
        <View className="p-4 bg-white rounded-lg shadow">
          <Text className="text-xl font-bold mb-2 text-gray-800">Start a Call</Text>
          <Text className="text-gray-600 mb-4">Connect with your group members through video and audio</Text>
          
          {/* Video Call Button */}
          <TouchableOpacity
            className="flex-row items-center justify-center bg-green-600 py-3 px-6 rounded-lg mb-3"
            onPress={() => handleStartCall('video')}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <MaterialIcons name="video-call" size={24} color="#fff" />
                <Text className="text-white font-semibold ml-2">Start Video Call</Text>
              </>
            )}
          </TouchableOpacity>
          
          {/* Audio Call Button */}
          <TouchableOpacity
            className="flex-row items-center justify-center bg-blue-600 py-3 px-6 rounded-lg"
            onPress={() => handleStartCall('audio')}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <MaterialIcons name="call" size={24} color="#fff" />
                <Text className="text-white font-semibold ml-2">Start Audio Call</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}