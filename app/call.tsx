import React, { useEffect, useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useGroupContext } from '@/store/GroupContext';
import WebRTCCall from '@/components/WebRTCCall';

export default function GroupCallScreen() {
  const { groupId, channel, type } = useLocalSearchParams();
  const { user, userInformation } = useGroupContext();
  const groupName = 'Group';
  const [callType, setCallType] = useState<'audio' | 'video'>((type as 'audio' | 'video') || 'video');
  const [isInCall, setIsInCall] = useState(false);

  useEffect(() => {
    if (!user || !userInformation) {
      Alert.alert('Authentication Required', 'Please sign in to join the call.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
      return;
    }
    if (!groupId || !channel) {
      Alert.alert('Invalid Call', 'Call parameters are missing.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
      return;
    }
  }, [user, userInformation, groupId, channel]);

  const handleEndCall = () => {
    Alert.alert('Call Ended', 'You have left the call.', [
      {
        text: 'OK',
        onPress: () => router.push(`/(groups)/${groupId}`),
      },
    ]);
  };

  const handleStartCall = (callType: 'audio' | 'video') => {
    setCallType(callType);
    setIsInCall(true);
  };

  if (!isInCall) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <StatusBar style="dark" />
        <View className="p-5 items-center">
          <Text className="text-2xl font-bold mb-5">Start Group Call</Text>
          <TouchableOpacity
            className="bg-primary px-8 py-4 rounded-full mb-4 flex-row items-center"
            onPress={() => handleStartCall('video')}
            accessibilityLabel="Start video call"
            accessibilityRole="button"
          >
            <Ionicons name="videocam" size={24} color="#fff" style={{ marginRight: 10 }} />
            <Text className="text-white text-base font-semibold">Start Video Call</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-emerald-600 px-8 py-4 rounded-full flex-row items-center"
            onPress={() => handleStartCall('audio')}
            accessibilityLabel="Start audio call"
            accessibilityRole="button"
          >
            <Ionicons name="call" size={24} color="#fff" style={{ marginRight: 10 }} />
            <Text className="text-white text-base font-semibold">Start Audio Call</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (isInCall && userInformation) {
    return (
      <View className="flex-1">
        <StatusBar style="light" />
        <WebRTCCall
          roomId={String(channel)}
          userId={userInformation.userID}
          userName={userInformation.userName}
          callType={callType}
          onEndCall={handleEndCall}
          
        />
      </View>
    );
  }
  return null;
}
