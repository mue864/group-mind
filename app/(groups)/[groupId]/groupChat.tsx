import { Text, View } from "react-native";
import { Button } from "react-native-paper";
import { router } from "expo-router";
import { id } from "./index";

const GroupChat = () => {

    // fetch all messages from here


    console.log("groupID in GroupChat main: ", id);
    return (
      <View className="flex-1 bg-background relative">
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
                    groupId: id,
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