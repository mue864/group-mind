import { Text, View } from "react-native";
import {useEffect, useState} from "react";
import FolderOpen from "@/assets/icons/folderOpen.svg"
import Animated,
{
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const Resources = () => {
    const [resources, setResources] = useState([]);
    const opacity = useSharedValue(0);
    
    useEffect(() => {
        opacity.value = withTiming(1, { duration: 1000 });
    }, []);
    
    const animatedStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
      transform: [{ scale: opacity.value }],
    }));
    
    return ( 
        <View className="flex-1 bg-white">
            {resources.length === 0 ? (
                <Animated.View style={animatedStyle}
                className="flex-1 justify-center items-center"
                >
                <FolderOpen width={100} height={100} />
                <Text className="font-poppins text-gray-500 text-center">
                No resources found
              </Text>
              </Animated.View>
            ) : (
                <Text>Resources</Text>
            )}
        </View>
     );
}
 
export default Resources;