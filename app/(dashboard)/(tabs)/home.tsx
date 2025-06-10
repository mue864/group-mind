import Book from "@/assets/icons/book.svg";
import Elipse from "@/assets/icons/ellipse.svg";
import Rect from "@/assets/icons/rectangle.svg";
import ActionButton from "@/components/ActionButton";
import PostCard from "@/components/PostCard";
import ScheduledCard from "@/components/ScheduledCard";
import { Colors } from "@/constants";
import { useGroupContext } from "@/store/GroupContext";
import { Post, usePostContext } from "@/store/PostContext";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import {auth} from "@/services/firebase";

const Home = () => {
  const router = useRouter();
  const { groups, loading } = useGroupContext();
  const { posts, postByGroup, getGroupNameFromId } = usePostContext();
  const [groupNames, setGroupNames] = useState<Record<string, string>>({});
  const [testGroup, setTestGroups] = useState<Post[]>([]);
  const [morePosts, setMorePosts] = useState(1);

  const user = auth.currentUser;
  const userID = user?.uid;
  console.log(userID);

  // Animation
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);

  const animated = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: opacity.value }],
  }));

  useEffect(() => {
    const fetchGroupNames = async () => {
      try {
        const names: Record<string, string> = {};
        const processedGroupIds = new Set();

        // Process all posts and collect unique groupIds
        for (const post of posts) {
          const groupId = post.groupId;
          
          // Skip if we've already processed this groupId in this batch
          if (processedGroupIds.has(groupId) || !groupId) continue;
          
          // Skip if we already have the name in state
          if (groupNames[groupId]) {
            processedGroupIds.add(groupId);
            continue;
          }

          try {
            const name = await getGroupNameFromId(groupId);
            if (name) {
              names[groupId] = name;
              processedGroupIds.add(groupId);
            }
          } catch (error) {
            console.error(`Error fetching name for group ${groupId}:`, error);
            // Set a fallback name if there's an error
            names[groupId] = 'Unknown Group';
            processedGroupIds.add(groupId);
          }
        }

        // Only update state if we have new names
        if (Object.keys(names).length > 0) {
          setGroupNames((prev) => ({ ...prev, ...names }));
        }
      } catch (error) {
        console.error('Error in fetchGroupNames:', error);
      }
    };
    
    if (posts.length > 0) {
      fetchGroupNames();
    }
  }, [posts, getGroupNameFromId, groupNames]);

  useEffect(() => {
    // cleaning the data coming as a nested array of objects
    const cleanData = Object.values(postByGroup).flatMap(
      (group) => group as Post[]
    );
    setTestGroups(cleanData);
  }, [postByGroup]);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 1500 });
    translateY.value = withTiming(0, { duration: 100 });
  });
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const screenWidth = Dimensions.get("window").width;
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);

  const scheduledGroups = groups.filter((group) => group.callScheduled);


  useEffect(() => {
    const intervale = setInterval(() => {
      if (!isAutoScrolling || scheduledGroups.length <= 1) return;

      const index = (currentIndex + 1) % scheduledGroups.length;
      flatListRef.current?.scrollToIndex({ index: index, animated: true });
      setCurrentIndex(index);
    }, 5000);

    return () => clearInterval(intervale);
  }, [currentIndex, scheduledGroups.length, isAutoScrolling]);

  const handleUserScroll = (event: any) => {
    const newIndex = Math.round(
      event.nativeEvent.contentOffset.x / screenWidth
    );
    setCurrentIndex(newIndex);
    setIsAutoScrolling(false);

    // Resume auto-scroll after user pauses interaction
    setTimeout(() => {
      setIsAutoScrolling(true);
    }, 7000);
  };

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
      ) : groups.length === 0 ? (
        // Empty state
        <View className="flex-1 justify-center items-center">
          <Animated.View style={animated}>
            <Book width={100} height={100} color={"#7291EE"} />
          </Animated.View>

          <View className="justify-center items-center mx-10">
            <Text className="font-poppins text-gray-500 text-center">
              You haven’t joined or created any study groups yet. Start by
              creating your own or exploring existing ones!
            </Text>
          </View>

          <ActionButton
            action={() => router.push("/(dashboard)/(tabs)/groups")}
          />
        </View>
      ) : (
        // Scheduled Calls card
        <View className="flex">
          <FlatList
            ref={flatListRef}
            data={scheduledGroups}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleUserScroll}
            renderItem={({ item }) => (
              <View style={{ width: screenWidth }}>
                <ScheduledCard
                  title={item.callScheduled.sessionTitle}
                  time={item.callScheduled.CallTime}
                  type={item.callScheduled.callType}
                  groupName={item.name}
                />
              </View>
            )}
          />
          {/* Scheduled calls pagination */}
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
          {/* recent posts */}
          <View className="">
            {testGroup.length !== 0 && (
              <View className="mx-8">
                <Text className="font-inter font-semibold text-lg mt-3">
                  Recent Posts
                </Text>

                <View className="flex">
                  <FlatList
                    data={testGroup.slice(0, morePosts)}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                      <View className="mb-5">
                        <PostCard
                          post={item.post}
                          groupId={item.groupId}
                          timeSent={item.timeSent}
                          userName={item.userId && userID === item.userId.trim() ? "You" : "User"}
                          userAvatar={item.userAvatar}
                        />
                      </View>
                    )}
                  />
                  {morePosts < testGroup.length && (
                    <TouchableOpacity
                      onPress={() => setMorePosts((prev) => prev + 6)}
                      className="justify-center items-center mt-2 mb-2"
                    >
                      <Text className="text-secondary font-inter font-bold text-xl">
                        Show More ({testGroup.length - 1})
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

export default Home;
