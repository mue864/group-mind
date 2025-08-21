import { Text, View } from "react-native";
import { Button } from "react-native-paper";
import { router } from "expo-router";
import { useState, useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const GroupChat = () => {
    const [id, setId] = useState("");
    const idRef = useRef(id);
    const [groupName, setGroupName] = useState("");
    const groupNameRef = useRef(groupName);
    useEffect(() => {
        const fetchGroupId = async () => {
            try {
                const cachedGroupId = await AsyncStorage.getItem("groupID");
                const cachedGroupName = await AsyncStorage.getItem("groupName");
                if (cachedGroupId) {
                    setId(cachedGroupId);
                    idRef.current = cachedGroupId;
                }
                if (cachedGroupName) {
                    setGroupName(cachedGroupName);
                    groupNameRef.current = cachedGroupName;
                } 
            } catch (error) {
                console.error("Error fetching group ID: ", error);
            }
        };


        fetchGroupId();
    }, []);
    return (
      <View className="flex-1 bg-white relative">
        <View className="justify-center items-center flex-1">
          <Text className="text-center text-lg font-inter">
            As always, be respectful, kind, and considerate. Ask questions,
            share your thoughts, and engage in meaningful conversations.
          </Text>
        </View>
        <View className="absolute bottom-28 left-1/2 transform -translate-x-1/2">
          <Button
            mode="contained"
            onPress={() => router.push({
                pathname: `/(settings)/(group_chat)/[groupId]`,
                params: {
                    groupId: idRef.current,
                    groupName: groupNameRef.current,
                }
            })}
            className="self-center shadow-xl drop-shadow-xl shadow-black  shadow-opacity-5"
          >
            Join Chat
          </Button>
        </View>
      </View>
    );
}
 
export default GroupChat;