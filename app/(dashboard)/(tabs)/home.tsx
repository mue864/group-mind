import Book from "@/assets/icons/book.svg";
import Elipse from "@/assets/icons/ellipse.svg";
import Rect from "@/assets/icons/rectangle.svg";
import ActionButton from "@/components/ActionButton";
import { Colors } from "@/constants";
import { auth, db } from "@/services/firebase";
import { useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StatusBar, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

// data accessible by routes
export let snapShort: any;
export let userId: string;
const Home = () => {
  const router = useRouter();
  const user = auth.currentUser;
  // Animation
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);

  const animated = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: opacity.value }],
  }));

  const [profileName, setProfileName] = useState("");
  const [loading, setLoading] = useState(true);
  interface Group {
    id: string;
    [key: string]: any; // For other properties from doc.data()
  }

  const [groups, setGroups] = useState<Group[]>([]);
  const [grouIDs, setGroupIDs] = useState<string[]>([]);

  const retrieveUserData = async () => {
    if (user) {
      userId = user.uid;
      const userRef = doc(db, "users", userId);
      const userDocSnap = await getDoc(userRef);

      if (userDocSnap.exists()) {
        snapShort = userDocSnap.data();
        const userName = userDocSnap.data().userName;
        const userGroups = userDocSnap.data().joinedGroups;
        setProfileName(userName);
        setGroupIDs(userGroups);
      } else {
        console.log("no user!");
      }
    }
  };

  const retrieveGroupsData = useCallback(async (groupIds: string[]) => {
    try {
      const groupPromises = groupIds.map(async (groupId) => {
        const docRef = doc(db, "groups", groupId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() };
        }
        return null;
      });

      const groupResults = await Promise.all(groupPromises);
      const validGroups = groupResults.filter(
        (group) => group !== null
      ) as Group[];
      setGroups(validGroups);
      console.log(groups)
    } catch (error) {
      console.error("Failed to retrieve groups:", error);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      if (!user) return;

      await retrieveUserData(); // sets `snapShort`

      const groupIds = snapShort?.joinedGroups;
      if (Array.isArray(groupIds) && groupIds.length > 0) {
        await retrieveGroupsData(groupIds);
        setLoading(false);
      }
    };

    init();

    opacity.value = withTiming(1, { duration: 1500 });
    translateY.value = withTiming(0, { duration: 100 });
  }, []);

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
        <Text>Some groups</Text>
      )}
    </View>
  );
};

export default Home;
