import GroupCard from "@/components/GroupCard";
import { useGroupContext } from "@/store/GroupContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  RefreshControl,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  Platform
} from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { FAB, Portal, Provider } from "react-native-paper";


// Modern Tab Component
interface TabButtonProps {
  title: string;
  count: number;
  isActive: boolean;
  onPress: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({
  title,
  count,
  isActive,
  onPress,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-1 mx-1"
      activeOpacity={0.8}
    >
      <View className="relative">
        <LinearGradient
          colors={isActive ? ["#667eea", "#764ba2"] : ["#f3f4f6", "#e5e7eb"]}
          className="rounded-2xl py-4 px-6 "
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View className="flex-row items-center justify-center">
            <Text
              className={` text-base font-poppins-semiBold ${Platform.OS === "ios" ? "p-4" : ""} ${
                isActive ? "text-white" : "text-gray-600"
              }`}
            >
              {title}
            </Text>
            <View
              className={`ml-2 px-2 py-1 rounded-full ${
                isActive ? "bg-white/20" : "bg-gray-200"
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  isActive ? "text-white" : "text-gray-600"
                }`}
              >
                {count}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Active indicator */}
        {isActive && (
          <View className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
            <View className="w-8 h-1 bg-white rounded-full" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const Groups = () => {
  const router = useRouter();
  const { groups, allGroups, user, loading, refreshGroups, fetchAllGroups } =
    useGroupContext();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"joined" | "all">("joined");
  const [refreshing, setRefreshing] = useState(false);

  const onStateChange = ({ open }: { open: boolean }) => setOpen(open);

  // Refresh function for pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Refresh both user groups and all groups
      await Promise.all([refreshGroups(), fetchAllGroups()]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshGroups, fetchAllGroups]);

  // Separate joined groups from all groups
  const joinedGroups = useMemo(() => {
    return groups.filter((group) => group.members.includes(user?.uid || ""));
  }, [groups, user?.uid]);

  const availableGroups = useMemo(() => {
    if (!user?.uid) return allGroups;
    const joinedGroupIds = joinedGroups.map((group) => group.id);
    return allGroups.filter((group) => !joinedGroupIds.includes(group.id));
  }, [allGroups, joinedGroups, user?.uid]);

  const renderGroupCard = ({ item }: { item: any }) => (
    <View className="items-center">
      <GroupCard
        id={item.id}
        members={item.members}
        description={item.description}
        createdBy={item.createdBy}
        name={item.name}
        imageUrl={item.imageUrl}
        groupType={item.createdBy}
        canJoin={activeTab === "all"}
        isPrivate={item.isPrivate}
      />
    </View>
  );

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center px-8 py-16 bg-white">
      <View className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-100">
        <View className="items-center">
          <View className="w-20 h-20 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full items-center justify-center mb-4">
            <Ionicons
              name={
                activeTab === "joined" ? "people-outline" : "search-outline"
              }
              size={40}
              color="blue"
            />
          </View>
          <Text className="font-bold text-gray-800 text-xl text-center mb-2">
            {activeTab === "joined"
              ? "No Groups Joined"
              : "No Groups Available"}
          </Text>
          <Text className="text-gray-600 text-center text-base leading-6 mb-6">
            {activeTab === "joined"
              ? "You haven't joined any study groups yet. Start exploring to find your perfect study community!"
              : "There are no groups available at the moment. Check back later or create your own group!"}
          </Text>
          {activeTab === "joined" ? (
            <TouchableOpacity
              onPress={() => setActiveTab("all")}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-4 rounded-2xl"
            >
              <View className="flex-row items-center">
                <Ionicons name="search" size={20} color="white" />
                <Text className="text-white font-bold text-base ml-2">
                  Explore Groups
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => router.push("/groupCreate")}
              className="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-4 rounded-2xl"
            >
              <View className="flex-row items-center">
                <Ionicons name="add" size={20} color="white" />
                <Text className="text-white font-bold text-base ml-2">
                  Create Group
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  const renderLoadingState = () => (
    <View className="flex-1 justify-center items-center px-8 py-16">
      <View className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-3xl p-8 border border-gray-100">
        <View className="items-center">
          <View className="w-20 h-20 bg-gradient-to-r from-gray-400 to-blue-500 rounded-full items-center justify-center mb-4">
            <Ionicons name="refresh" size={40} color="white" />
          </View>
          <Text className="font-bold text-gray-800 text-xl text-center mb-2">
            Loading Groups
          </Text>
          <Text className="text-gray-600 text-center text-base leading-6">
            Fetching your study groups and available communities...
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <Provider>
      <Portal>
        <FAB.Group
          open={open}
          visible={true}
          icon={open ? "close" : "plus"}
          color="#fff"
          style={{
            position: "absolute",
            bottom: 80,
            right: 16,
            zIndex: 9999,
            elevation: 9999,
          }}
          fabStyle={{
            backgroundColor: "#667eea",
            borderRadius: 28,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.25,
            shadowRadius: 16,
            elevation: 12,
          }}
          actions={[
            {
              icon: "web",
              label: "Explore Groups",
              onPress: () => setActiveTab("all"),
              style: {
                backgroundColor: "#4facfe",
                borderRadius: 20,
              },
            },
            {
              icon: "plus",
              label: "Create Group",
              onPress: () => router.push("/groupCreate"),
              style: {
                backgroundColor: "#22c55e",
                borderRadius: 20,
              },
            },
          ]}
          onStateChange={onStateChange}
          onPress={() => {
            if (open) {
              // FAB opened
            } else {
              // FAB closed
            }
          }}
        />
      </Portal>

      <View className="flex-1 bg-white">
        <StatusBar barStyle={"dark-content"} />

        {/* Enhanced Header with tabs */}
        <View className="bg-white border-b border-gray-100 pt-5 pb-6">


          <View className="flex-row justify-between items-center px-6 mb-6">
            <View>
              <Text className="text-gray-500 text-xl font-poppins-semiBold">
                {activeTab === "joined"
                  ? "Your study communities"
                  : "Discover new groups"}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push("/(dashboard)/settings")}
              className="p-3 rounded-2xl bg-gradient-to-r from-gray-100 to-gray-200"
              activeOpacity={0.7}
            >
              <Ionicons name="settings-outline" size={24} color="#667eea" />
            </TouchableOpacity>
          </View>

          {/* Enhanced Tab Navigation */}
          <View className="px-6">
            <View className="flex-row">
              <TabButton
                title="My Groups"
                count={joinedGroups.length}
                isActive={activeTab === "joined"}
                onPress={() => setActiveTab("joined")}
              />
              <TabButton
                title="Explore"
                count={availableGroups.length}
                isActive={activeTab === "all"}
                onPress={() => setActiveTab("all")}
              />
            </View>
          </View>
        </View>

        {/* Enhanced Groups List */}
        <View className="flex-1">
          {loading ? (
            renderLoadingState()
          ) : (
            <FlatList
              data={activeTab === "joined" ? joinedGroups : availableGroups}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{
                paddingBottom: 140,
                flexGrow: 1,
                paddingTop: 20,
              }}
              renderItem={renderGroupCard}
              ListEmptyComponent={renderEmptyState}
              showsVerticalScrollIndicator={false}
              initialNumToRender={2}
              maxToRenderPerBatch={5}
              numColumns={1}
              key={`${activeTab}-${
                activeTab === "joined"
                  ? joinedGroups.length
                  : availableGroups.length
              }`} // Force re-render when tab changes or groups update
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            />
          )}
        </View>
      </View>
    </Provider>
  );
};

export default Groups;
