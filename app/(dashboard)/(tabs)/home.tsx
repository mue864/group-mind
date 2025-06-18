import Book from "@/assets/icons/book.svg";
import Elipse from "@/assets/icons/ellipse.svg";
import Rect from "@/assets/icons/rectangle.svg";
import ActionButton from "@/components/ActionButton";
import PostCard from "@/components/PostCard";
import RandomGroupCard from "@/components/RandomGroupCard";
import ScheduledCard from "@/components/ScheduledCard";
import { Colors } from "@/constants";
import { useInterval } from "@/hooks/useInterval";
import { auth } from "@/services/firebase";
import { useGroupContext } from "@/store/GroupContext";
import { Post, usePostContext } from "@/store/PostContext";
import { useRouter } from "expo-router";
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
import { ScrollView } from "react-native-gesture-handler";

const Home = () => {
  const router = useRouter();
  const { groups, loading } = useGroupContext();
  const { posts, postByGroup, getGroupNameFromId } = usePostContext();
  const [groupNames, setGroupNames] = useState<Record<string, string>>({});
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const screenWidth = Dimensions.get("window").width;
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [morePosts, setMorePosts] = useState(1);
  const [suggestedGroup, setSuggestedGroup] = useState(0);
  const user = auth.currentUser;
  const userID = user?.uid;



  useEffect(() => {
    const getRandomId = () => {
      const randomIndex = Math.floor(Math.random() * groups.length);
      return randomIndex;
    };
    setSuggestedGroup(getRandomId());
  }, [groups]);

  useEffect(() => {
    // useMemo can't be used here
    const fetchGroupNames = async () => {
      const names: Record<string, string> = {};

      for (const post of posts) {
        // Check both current state AND local names object
        if (!groupNames[post.groupId] && !names[post.groupId]) {
          const name = await getGroupNameFromId(post.groupId);
          if (name) {
            names[post.groupId] = name;
          }
        }
      }

      // Only update state if we have new names
      if (Object.keys(names).length > 0) {
        setGroupNames((prev) => ({ ...prev, ...names }));
      }
    };

    fetchGroupNames();
  }, [posts, getGroupNameFromId]);

  // memoizing as this does not give any side effects and is efficient like this
  const recentPosts = useMemo(() => {
    return Object.values(postByGroup).flatMap((group) => group as Post[]);
  }, [postByGroup]);

  const recentPostsCard = useCallback(
    ({ item }) => (
      <View className="mb-5">
        <PostCard
          post={item.post}
          groupId={item.groupId}
          timeSent={item.timeSent}
          userName={userID === item.userId ? "You" : "User"}
          userAvatar={item.userAvatar}
        />
      </View>
    ),
    []
  );

  const scheduledGroups = useMemo(() => {
    return groups.filter((group) => group.callScheduled);
  }, [groups]);

  useInterval(() => {
    if (!isAutoScrolling || scheduledGroups.length <= 1) return;

    const index = (currentIndex + 1) % scheduledGroups.length;
    flatListRef.current?.scrollToIndex({ index, animated: true });
    setCurrentIndex(index);
  }, 5000);

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

  // memoizing values to improve device performance
  // using useCallback to only recall the
  const renderScheduledCard = useCallback(
    ({ item }) => (
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

  return (
    <ScrollView className="bg-white flex-1">
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
            <View>
              <Book width={100} height={100} color={"#7291EE"} />
            </View>

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
              renderItem={renderScheduledCard}
              removeClippedSubviews={true}
              maxToRenderPerBatch={10}
              initialNumToRender={5}
              windowSize={5}
            />
            {/* Scheduled calls pagination */}
            <View className="flex-row justify-center items-center mt-2">
              {/* find a way to optmize this */}
              {renderScheduledCardDots}
            </View>
            {/* recent posts */}
            <View className="">
              {recentPosts.length !== 0 && (
                <View className="mx-8">
                  <Text className="font-inter font-semibold text-lg mt-3">
                    Recent Posts
                  </Text>

                  <View className="flex">
                    <FlatList
                      data={recentPosts.slice(0, morePosts)}
                      keyExtractor={(item, index) => index.toString()}
                      renderItem={recentPostsCard}
                      removeClippedSubviews={true}
                      maxToRenderPerBatch={10}
                      initialNumToRender={5}
                      windowSize={5}
                    />
                    {morePosts < recentPosts.length && (
                      <TouchableOpacity
                        onPress={() => setMorePosts((prev) => prev + 6)}
                        className="justify-center items-center mt-2 mb-2"
                      >
                        <Text className="text-secondary font-inter font-bold text-xl">
                          Show More ({recentPosts.length - 1})
                        </Text>
                      </TouchableOpacity>
                    )}

                    {/* Sugested groups */}
                    <View>
                      <Text className="font-inter font-bold text-xl mt-3">
                        Groups You May be Interested In
                      </Text>
                      {/* Group Card */}

                      <View className="mb-32">
                        <RandomGroupCard
                          group={groups[suggestedGroup]} // get random group id
                          groupType="Invite"
                        />
                      </View>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}
   
    </ScrollView>
  );
};

export default Home;
