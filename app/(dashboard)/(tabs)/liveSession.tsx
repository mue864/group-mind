import ScheduledCard from "@/components/ScheduledCard";
import { useGroupContext } from "@/store/GroupContext";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { ScrollView, StatusBar, Text, View } from "react-native";

const LiveSession = () => {
  const [session, setSession] = useState<any[]>([{}]);
  const { activeCalls, groups } = useGroupContext();

  const getActiveCalls = () => {
    const activeCalls = groups.filter((group) => group.activeCall);
    return activeCalls;
  };

  useEffect(() => {
    const activeCallz = getActiveCalls();
    setSession(activeCallz);
  }, [groups]);

  return (
    <View className="flex-1 bg-[#F5F6FA]">
      <StatusBar barStyle={"dark-content"} backgroundColor={"white"} />

      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-4 border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-800">Live Sessions</Text>
        <Text className="text-gray-600 mt-1">
          Navigate to groups then sessions
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-4 pt-4"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Active Sessions */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            Active Sessions
          </Text>
          {activeCalls.length === 0 ? (
            <View className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <View className="items-center">
                <Ionicons name="videocam-outline" size={48} color="#9CA3AF" />
                <Text className="text-gray-600 text-center mt-2">
                  No active sessions at the moment
                </Text>
              </View>
            </View>
          ) : (
            <View className="bg-white py-6 rounded-xl shadow-sm border border-gray-100">
              <View>
                {session.map((session, index) => (
                  <ScheduledCard
                    key={index}
                    title={session.activeCall?.name}
                    time={session.activeCall?.callTime}
                    type={session.activeCall?.callType}
                    groupName={session.name}
                    groupLink={session.activeCall?.joinLink}
                    groupID={session.id}
                  />
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Recent Sessions */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            Recent Sessions
          </Text>
          <View className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <View className="items-center">
              <Ionicons name="time-outline" size={48} color="#9CA3AF" />
              <Text className="text-gray-600 text-center mt-2">
                No recent sessions
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default LiveSession;
