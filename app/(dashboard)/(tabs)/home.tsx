import Book from "@/assets/icons/book.svg";
import Elipse from "@/assets/icons/ellipse.svg";
import Rect from "@/assets/icons/rectangle.svg";
import ActionButton from "@/components/ActionButton";
import PostCard from "@/components/PostCard";
import ScheduledCard from "@/components/ScheduledCard";
import { Colors } from "@/constants";
import { useGroupContext } from "@/store/GroupContext";
import { usePostContext } from "@/store/PostContext";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  StatusBar,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const Home = () => {
  const router = useRouter();
  const { groups, loading } = useGroupContext();
  const { posts, user, getGroupNameFromId } = usePostContext();
  const [groupNames, setGroupNames] = useState<Record<string, string>>({});

  // Animation
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);

  const animated = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: opacity.value }],
  }));

  useEffect(() => {
    const fetchGroupNames = async () => {
      const names: Record<string, string> = {};
      for (const post of posts) {
        if (!groupNames[post.groupId]) {
          const name = await getGroupNameFromId(post.groupId);
          if (name) {
            names[post.groupId] = name;
          }
        }
      }
      setGroupNames((prev) => ({ ...prev, ...names }));
    };
    fetchGroupNames();
  }, [posts, getGroupNameFromId]);

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
        <View>
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

          <View>
            {posts.length !== 0 ? (
              <View className="mx-8">
                <Text className="font-inter font-semibold text-lg mt-3">
                  Recent Posts
                </Text>

                <View>
                  {posts.map((post, index) => (
                    <PostCard 
                    key={index}
                    post={post.post}
                    groupName={groupNames[post.groupId]}
                    />
                  ))}
                </View>
                <View></View>
              </View>
            ) : (
              <View className="mx-8 mt-3">
                <Text>No posts yet</Text>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

export default Home;
