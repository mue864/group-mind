import Group from "@/assets/icons/group.svg";
import MiniTabs from "@/components/MiniTabs";
import { Strings } from "@/constants";
import { useEffect, useState } from "react";
import { Text, View, StatusBar } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { snapShort } from "./home";
import Rect from "@/assets/icons/rectangle.svg";
import Elipse from "@/assets/icons/ellipse.svg";
import FloatingButton from "@/components/FloatingButton";
import {useRouter} from "expo-router";
import {db} from "@/services/firebase";
import { collection } from "firebase/firestore";

const Groups = () => {
  const router = useRouter();

  const opacity = useSharedValue(0);
  const [userGroups, setUserGroups] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: opacity.value }],
  }));

  const retrieveData = () => {
    const groups = snapShort.joinedGroups;
    setUserGroups(groups);
    console.log(groups)
  };

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 1000 });
  });
  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle={'dark-content'}  />
      <View className="absolute bottom-0" pointerEvents="box-none">
        <Rect width={150} height={200} />
      </View>
      <View className="absolute top-0 right-0" pointerEvents="box-none">
        <Elipse width={150} height={200} />
      </View>
      {userGroups.length === 0 && pageIndex === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Animated.View style={animatedStyle}>
            <Group width={100} height={100} />
          </Animated.View>
          {/* your groups tab */}
          <View className="absolute top-5 left-10">
            <MiniTabs
              index={pageIndex}
              setIndex={setPageIndex}
              isActive={pageIndex === 0 ? true : false}
              tabText={Strings.group.yourGroupsTab}
            />
          </View>
          {/* explore groups */}
          <View className="absolute top-5 left-44">
            <MiniTabs
              index={pageIndex}
              setIndex={setPageIndex}
              isActive={false}
              tabText={Strings.group.exploreGroups}
            />
          </View>
          <View className="justify-center items-center mx-10">
            <Text className="font-poppins text-gray-500 text-center">
              No groups yet.
            </Text>
            <Text className="font-poppins text-gray-500 text-center">
              Create or Search for existing groups
            </Text>
          </View>
        </View>
      ) : (
        <View className="flex-1 justify-center items-center">
          {userGroups.length === 0 ? (
            <>
            <View className="absolute top-5 left-10">
                      
                <MiniTabs
                  index={pageIndex}
                  setIndex={setPageIndex}
                  isActive={pageIndex === 0 ? true : false}
                  tabText={Strings.group.yourGroupsTab}
                />
                </View>
                  
                 <View className="absolute top-5 left-44">
                  <MiniTabs
                  index={pageIndex}
                  setIndex={setPageIndex}
                  isActive={pageIndex === 1 ? true : false}
                  tabText={Strings.group.exploreGroups}
                  />
                 </View>

                 <View>
                  <Text className="font-poppins text-gray-500 text-center">No Groups Found</Text>
                 </View>
                </>
          ) : (
            <>
              <View className="absolute top-1 left-10">
                <MiniTabs
                  index={pageIndex}
                  setIndex={setPageIndex}
                  isActive={pageIndex === 0 ? true : false}
                  tabText={Strings.group.yourGroupsTab}
                />
              </View>
              <View className="absolute top-1 left-44">
                <MiniTabs
                  index={pageIndex}
                  setIndex={setPageIndex}
                  isActive={pageIndex === 1 ? true : false}
                  tabText={Strings.group.exploreGroups}
                />
              </View>
            </>
          )}
          <FloatingButton action={() => router.push("/(groups)/groupCreate")} />
        </View>
      )}
    </View>
  );
};

export default Groups;
