import Back from "@/assets/icons/Arrow_left.svg";
import HR from "@/assets/icons/hr2.svg";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Dimensions, Text, TouchableOpacity, View, KeyboardAvoidingView, Platform, Image } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { TextInput } from "react-native-paper";
import { messages } from "@/assets/icons/messages";
import { doc, FieldValue, getDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { useGroupContext } from "@/store/GroupContext";
import { db } from "@/services/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";


const CreatePost = () => {
  const { groupId } = useLocalSearchParams();
  const deviceWidth = Dimensions.get("window").width;
  const [post, setPost] = useState("");
  const [userTyping, setUserTyping] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const {sendQaPost, qaPostSent, user} = useGroupContext();
  const [groupName, setGroupName] = useState("");
  
  const sendPost = 
  (
        groupId: string,
        message: string,
        timeSent: Timestamp | FieldValue,
        responseFrom: [],
        responseTo: [],
        isAnswered: boolean,
        type: string,
        sentBy: string,
        groupName: string
  ) => {
    sendQaPost(
        groupId,
        message,
        timeSent,
        responseFrom,
        responseTo,
        isAnswered,
        type,
        sentBy,
        groupName
    );
  }

  useEffect(() => {
    const fetchGroupName = async () => {
     if (!user) return;
     try {
       const name =  await AsyncStorage.getItem("groupName");
       if (!name) return
       setGroupName(name);
     } catch(error) {
        console.error("There has been an error: ", error);
     }
    };

    fetchGroupName();
  }, [groupId, user])

  console.log("groupName: ", groupName);

  return (
    <View className="flex-1 bg-[#F5F6FA]">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 35}
      >
        <KeyboardAwareScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 90 }}
          enableOnAndroid={true}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex flex-row items-center justify-between mx-4 mt-4 relative">
            <TouchableOpacity
              onPress={() => router.push(`/(groups)/${groupId}`)}
              activeOpacity={0.7}
            >
              <Back />
            </TouchableOpacity>

            <Text className="absolute left-1/2 -translate-x-1/2 text-2xl font-bold">
              Post Question
            </Text>
          </View>

          <View className="mt-2">
            <HR width={deviceWidth} height={2} />
          </View>

          {/* reminder card */}
          <View className="flex justify-center items-center mt-7">
            <View className="w-80 bg-white p-8 rounded-xl shadow-lg shadow-secondary">
              <Text className="text-center font-poppins">
                Be respectful, stay on topic, and avoid spam. GroupMind is a
                safe space for students to learn and grow. 🚀
              </Text>
            </View>
          </View>

          {/* post bubble */}
          <View className="flex flex-row mt-10 justify-end mx-10">
            {/* Image Container */}
            <View>
                <Image 
                
                />
            </View>

            {/* text container */}
            <View>
                {/* Name container */}
              <View>
                {/* Name */}
                <View>
                <Text className="font-inter font-bold">You</Text>
                </View>
                {/* Badge if any */}
              </View>
            </View>
          </View>
        </KeyboardAwareScrollView>

        <View className="px-4 py-2 border-t border-gray-300 bg-[#F5F6FA] flex flex-row">
          <TouchableOpacity className="justify-center items-center"
          onPress={() => setIsActive(!isActive)}
          >
            <Image
              source={messages.Add}
              className="w-12 h-12"
              tintColor={isActive ? "#4169E1" : "#2A4157"}
            />
          </TouchableOpacity>
          <View className="mx-auto">
            <TextInput
              value={post}
              onChangeText={(text) => (setPost(text), setUserTyping(true))}
              mode="outlined"
              outlineColor="transparent"
              activeOutlineColor="transparent"
              cursorColor="#333"
              textColor="#333"
              style={{
                backgroundColor: "#eee",
                borderRadius: 16,
                width: 250,
              }}
            />
          </View>
          <TouchableOpacity
            className="justify-center items-center"
            activeOpacity={post.length === 0 ? 1 : 0.5}
            onPress={post.length !== 0 && user ? () => {
            sendPost(
             groupId.toString(),
             post,
             serverTimestamp(),
             [],
             [],
             false,
             "question",
              user?.uid,
              groupName
            ); setPost("")} : () => console.log("none")}
          >
            <Image
              source={messages.Send}
              className="w-14 h-14"
              tintColor={
                userTyping && post.length !== 0 ? "#4169E1" : "#2A4157"
              }
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default CreatePost;
