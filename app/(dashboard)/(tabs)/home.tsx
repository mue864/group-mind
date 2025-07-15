import Book from "@/assets/icons/book.svg";
import Elipse from "@/assets/icons/ellipse.svg";
import Rect from "@/assets/icons/rectangle.svg";
import ActionButton from "@/components/ActionButton";
import QApostCard from "@/components/QApostCard";
import RandomGroupCard from "@/components/RandomGroupCard";
import ScheduledCard from "@/components/ScheduledCard";
import { Colors } from "@/constants";
import { useInterval } from "@/hooks/useInterval";
import { db } from "@/services/firebase";
import { useGroupContext } from "@/store/GroupContext";
import { usePostContext } from "@/store/PostContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { collection, onSnapshot, Timestamp } from "firebase/firestore";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Q&A Post type definition
type QaPost = {
  id: string;
  message: string;
  timeSent: Timestamp;
  responseFrom?: any[];
  responseTo: any[];
  isAnswered?: boolean;
  type: string;
  sentBy: string;
  groupName: string;
  isAdmin: boolean;
  isMod: boolean;
  imageUrl: string | undefined;
  purpose: string;
  userName: string;
  groupId: string; // Add groupId for navigation
};

const Home = () => {
  const router = useRouter();
  const { groups, allGroups, loading, user } = useGroupContext();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const screenWidth = Dimensions.get("window").width;
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [qaPosts, setQaPosts] = useState<QaPost[]>([]);
  const [qaLoading, setQaLoading] = useState(true);
  const userID = user?.uid;

  // Fetch Q&A posts from all user's groups
  useEffect(() => {
    if (!user || !groups.length) {
      setQaLoading(false);
      return;
    }

    const unsubscribes: (() => void)[] = [];
    const allQaPosts: QaPost[] = [];

    groups.forEach((group) => {
      if (!group.id) return;

      const unsubscribe = onSnapshot(
        collection(db, "groups", group.id, "qa"),
        (snapshot) => {
          const groupQaPosts = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              message: data.message,
              timeSent: data.timeSent,
              responseFrom: data.responseFrom || [],
              responseTo: data.responseTo || [],
              isAnswered: data.isAnswered || false,
              type: data.type,
              sentBy: data.sentBy,
              groupName: data.groupName || group.name,
              imageUrl: data.imageUrl,
              isAdmin: data.isAdmin || false,
              isMod: data.isMod || false,
              purpose: data.purpose,
              userName: data.userName,
              groupId: group.id,
            } as QaPost;
          });

          // Update the specific group's posts
          setQaPosts((prevPosts) => {
            const filteredPosts = prevPosts.filter(
              (post) => post.groupId !== group.id
            );
            return [...filteredPosts, ...groupQaPosts];
          });
        },
        (error) => {
          console.error(
            `Error fetching QA posts for group ${group.id}:`,
            error
          );
        }
      );

      unsubscribes.push(unsubscribe);
    });

    setQaLoading(false);

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, [user, groups]);

  const scheduledGroups = useMemo(() => {
    return groups.filter((group) => group.callScheduled);
  }, [groups]);

  // Get suggested groups (groups the user hasn't joined yet)
  const suggestedGroups = useMemo(() => {
    if (!userID || !allGroups.length) return [];

    const userJoinedGroupIds = groups.map((group) => group.id);
    return allGroups
      .filter((group) => !userJoinedGroupIds.includes(group.id))
      .slice(0, 3); // Show up to 3 suggested groups
  }, [allGroups, groups, userID]);

  // Sort Q&A posts by time (most recent first) and limit to 2
  const recentQaPosts = useMemo(() => {
    return qaPosts
      .sort((a, b) => b.timeSent.toMillis() - a.timeSent.toMillis())
      .slice(0, 2);
  }, [qaPosts]);

  useInterval(() => {
    if (!isAutoScrolling || scheduledGroups.length <= 1) return;

    const index = (currentIndex + 1) % scheduledGroups.length;
    flatListRef.current?.scrollToIndex({ index, animated: true });
    setCurrentIndex(index);
  }, 5000);

  const handleUserScroll = useCallback(
    (event: any) => {
      const newIndex = Math.round(
        event.nativeEvent.contentOffset.x / screenWidth
      );
      setCurrentIndex(newIndex);
      setIsAutoScrolling(false);

      // Resume auto-scroll after user pauses interaction
      setTimeout(() => {
        setIsAutoScrolling(true);
      }, 7000);
    },
    [screenWidth]
  );

  // memoizing values to improve device performance
  // using useCallback to only recall the
  const renderScheduledCard = useCallback(
    ({ item }: { item: any }) => (
      <View style={{ width: screenWidth }}>
        <ScheduledCard
          title={item.callScheduled.sessionTitle}
          time={item.callScheduled.CallTime}
          type={item.callScheduled.callType}
          groupName={item.name}
        />
      </View>
    ),
    [screenWidth]
  );

  // mapping through the suggested group number and creating dots for each for UI hints
  const renderScheduledCardDots = useMemo(
    () => (
      <View className="flex-row justify-center items-center mt-2">
        {scheduledGroups.map((_, index) => (
          <View
            key={index}
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              marginHorizontal: 4,
              backgroundColor: index === currentIndex ? "#7291EE" : "#ccc",
            }}
          />
        ))}
      </View>
    ),
    [scheduledGroups, currentIndex]
  );

  // Create a single FlatList with all content
  const renderMainContent = useCallback(
    ({ item }: {item: any}) => {
      if (item.type === "scheduledCards") {
        return (
          <View>
            <FlatList
              ref={flatListRef}
              data={scheduledGroups}
              keyExtractor={(item, index) => index.toString()}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleUserScroll}
              renderItem={renderScheduledCard}
              removeClippedSubviews={true}
              maxToRenderPerBatch={10}
              initialNumToRender={5}
              windowSize={5}
            />
            {renderScheduledCardDots}
          </View>
        );
      }

      if (item.type === "qaPostsHeader") {
        return (
          <View className="mx-4 mt-6">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="font-inter font-bold text-xl text-gray-800">
                  Recent Q&A
                </Text>
                <Text className="font-inter text-gray-500 text-sm mt-1">
                  Questions and answers from your groups
                </Text>
              </View>
              {recentQaPosts.length > 0 && (
                <TouchableOpacity
                  onPress={() => router.push("/(dashboard)/(tabs)/groups")}
                  className="bg-blue-50 rounded-full px-3 py-1"
                >
                  <Text className="text-blue-600 font-inter font-semibold text-sm">
                    View All
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        );
      }

      if (item.type === "qaPost") {
        return (
          <View className="mb-4">
            <QApostCard
              post={item.data.message}
              timeSent={item.data.timeSent}
              responseTo={item.data.responseTo}
              responseFrom={item.data.responseFrom}
              postID={item.data.id}
              groupID={item.data.groupId}
            />
          </View>
        );
      }

      if (item.type === "qaEmptyState") {
        return (
          <View className="mx-4 mb-6">
            <View className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-100">
              <View className="items-center">
                <View className="w-16 h-16 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full items-center justify-center mb-4">
                  <Ionicons
                    name="help-circle-outline"
                    size={32}
                    color="white"
                  />
                </View>
                <Text className="font-bold text-gray-800 text-lg text-center mb-2">
                  No Q&A Posts Yet
                </Text>
                <Text className="text-gray-600 text-center text-sm leading-5 mb-4">
                  Start asking questions in your study groups to see them here!
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/(dashboard)/(tabs)/groups")}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-3 rounded-xl"
                >
                  <View className="flex-row items-center">
                    <Ionicons name="add" size={18} color="white" />
                    <Text className="text-white font-bold text-sm ml-2">
                      Ask a Question
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );
      }

      if (item.type === "suggestedHeader") {
        return (
          <View className="mx-4">
            <Text className="font-inter font-bold text-xl mt-3">
              Groups You May be Interested In
            </Text>
            <Text className="font-inter text-gray-500 text-sm mt-1">
              Discover and join new study groups
            </Text>
          </View>
        );
      }

      if (item.type === "suggestedGroup") {
        return (
          <View className="mb-4">
            <RandomGroupCard
              group={item.data}
              groupType="Group"
              userId={userID}
            />
          </View>
        );
      }

      if (item.type === "exploreMoreButton") {
        return (
          <TouchableOpacity
            onPress={() => router.push("/(dashboard)/(tabs)/groups")}
            className="mx-4 mb-8 bg-blue-50 rounded-xl p-4 border border-blue-200"
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="search" size={20} color="#4169E1" />
              <Text className="text-blue-600 font-inter font-semibold text-lg ml-2">
                Explore More Groups
              </Text>
            </View>
          </TouchableOpacity>
        );
      }

      return null;
    },
    [
      scheduledGroups,
      renderScheduledCard,
      renderScheduledCardDots,
      suggestedGroups,
      userID,
      handleUserScroll,
      router,
      recentQaPosts,
    ]
  );

  // Create data array for the main FlatList
  const mainData = useMemo(() => {
    const data = [];

    // Add scheduled cards
    data.push({ type: "scheduledCards", id: "scheduled" });

    // Add Q&A posts section
    data.push({ type: "qaPostsHeader", id: "qaHeader" });

    if (qaLoading) {
      // Show loading state for Q&A posts
      data.push({ type: "qaLoading", id: "qaLoading" });
    } else if (recentQaPosts.length > 0) {
      // Add Q&A posts
      recentQaPosts.forEach((qaPost, index) => {
        data.push({ type: "qaPost", id: `qaPost-${index}`, data: qaPost });
      });
    } else {
      // Show empty state for Q&A posts
      data.push({ type: "qaEmptyState", id: "qaEmpty" });
    }

    // Add suggested groups section if there are suggested groups
    if (suggestedGroups.length > 0) {
      data.push({ type: "suggestedHeader", id: "suggestedHeader" });

      // Add each suggested group
      suggestedGroups.forEach((group, index) => {
        data.push({
          type: "suggestedGroup",
          id: `suggestedGroup-${index}`,
          data: group,
        });
      });

      // Add explore more button
      data.push({ type: "exploreMoreButton", id: "exploreMoreButton" });
    }

    return data;
  }, [suggestedGroups, recentQaPosts, qaLoading]);

  return (
    <View className="bg-white flex-1">
      <StatusBar barStyle={"dark-content"} backgroundColor={"white"} />

      <View className="absolute bottom-0" pointerEvents="box-none">
        <Rect width={150} height={200} />
      </View>
      <View className="absolute top-0 right-0" pointerEvents="box-none">
        <Elipse width={150} height={200} />
      </View>
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size={"large"} color={Colors.primary} />
        </View>
      ) : groups.length === 0 && suggestedGroups.length === 0 ? (
        // Empty state
        <View className="flex-1 justify-center items-center">
          <View>
            <Book width={100} height={100} color={"#7291EE"} />
          </View>

          <View className="justify-center items-center mx-10">
            <Text className="font-poppins text-gray-500 text-center">
              You have not joined or created any study groups yet. Start by
              creating your own or exploring existing ones!
            </Text>
          </View>

          <ActionButton
            action={() => router.push("/(dashboard)/(tabs)/groups")}
          />
        </View>
      ) : (
        // Main content with single FlatList
        <FlatList
          data={mainData}
          keyExtractor={(item) => item.id}
          renderItem={renderMainContent}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          initialNumToRender={5}
          windowSize={5}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingBottom: 100}}
        />
      )}
    </View>
  );
};

export default Home;
