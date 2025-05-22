import ActionButton from "@/components/ActionButton";
import { auth, db } from "@/services/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import Rect from "@/assets/icons/rectangle.svg";
import Elipse from "@/assets/icons/ellipse.svg";
import Book from "@/assets/icons/book.svg";
import Animated,
{
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from "react-native-reanimated";
import {useRouter} from "expo-router";

// data accessible by routes
export let snapShort: any;

const Home = () => {
    const router = useRouter();
    const user = auth.currentUser;
    // Animation
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(50);


    const animated = useAnimatedStyle(() => ({
      opacity: opacity.value,
      transform: [{scale: opacity.value}]
    }))

    const [profileName, setProfileName] = useState("");
    const [groups, setGroups] = useState([]);

    const retrieveData = async () => {
        if (user) {
          const userId = user.uid;
          const userRef = doc(db, "users", userId);
          const userDocSnap = await getDoc(userRef);

          if (userDocSnap.exists()) {
            snapShort = userDocSnap.data();
            console.log(userId)
            const userName = userDocSnap.data().userName;
            const userGroups = userDocSnap.data().joinedGroups;
            setProfileName(userName);
            setGroups(userGroups);
          } else {
            console.log("nice try!");
          }
        } 
       
    }
    useEffect(() => {
        retrieveData();

        opacity.value = withTiming(1, {duration: 1500});
        translateY.value = withTiming(0, {duration: 100});
    });
    
    return (
      <View className="bg-white flex-1">
        <View className="absolute bottom-0" pointerEvents="box-none">
          <Rect width={150} height={200} />
        </View>
        <View className="absolute top-0 right-0" pointerEvents="box-none">
          <Elipse width={150} height={200} />
        </View>
        {groups.length === 0 ? (
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
              action={() => router.push("/Dashboard/(tabs)/groups")}
            />
          </View>
        ) : (
          <Text>Some groups</Text>
        )}
      </View>
    );
}
 
export default Home;