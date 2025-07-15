import { QaPost } from "@/app/(groups)/[groupId]";
import Back from "@/assets/icons/Arrow_left.svg";
import HR from "@/assets/icons/hr2.svg";
import { messages } from "@/assets/icons/messages";
import avatars from "@/assets/images/avatars";
import ShareModal from "@/components/ShareModal";
import { useGroupContext } from "@/store/GroupContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { format, isToday, isYesterday } from "date-fns";
import { router, useLocalSearchParams } from "expo-router";
import { Timestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { TextInput } from "react-native-paper";

interface Avatars {
  avatar1: string;
  avatar2: string;
  avatar3: string;
  avatar4: string;
  avatar5: string;
  avatar6: string;
  avatar7: string;
  avatar8: string;
  avatar9: string;
}

const CreatePost = () => {
  const { groupId } = useLocalSearchParams();
  const deviceWidth = Dimensions.get("window").width;
  const [post, setPost] = useState("");
  const [localPost, setLocalPost] = useState<QaPost[]>([]);
  const [userTyping, setUserTyping] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const { sendQaPost, qaPostSent, user, userInformation, qaPostID } =
    useGroupContext();
  const [groupName, setGroupName] = useState("");
  const [sendButtonClicked, setSendButtonClicked] = useState(false);
  const [checkTime, setCheckTime] = useState("");
  const [sentMessage, setSentMessage] = useState("");
  const [sentTime, setSentTime] = useState("");

  const isAdmin = false;
  const isMod = true;

  const timeSent = new Date();

  function getMessageSentTime() {
    return format(timeSent, "HH:mm");
  }
  useEffect(() => {
    try {
      const fetchPostData = async () => {
        const local = await AsyncStorage.getItem(`${groupId}`);
        if (local) {
          setLocalPost(JSON.parse(local));
        }
      };
      fetchPostData();
    } catch (error) {
      console.error("Failed to fetch QAposts", error);
    }
  }, [groupId]);

  useEffect(() => {
    const now = new Date();
    setCheckTime(getTimeLabel(now));
  }, []);

  function getTimeLabel(dateString: Date) {
    const date = new Date(dateString);

    if (isToday(date)) {
      return "Today";
    } else if (isYesterday(date)) {
      return "Yesterday";
    } else {
      return format(date, "dd, MM, yyyy");
    }
  }

  const userAvatar = userInformation?.profilePicture.toString();
  const isSelf = true;

  const sendPost = (
    groupId: string,
    message: string,
    timeSent: Timestamp,
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
      isAnswered,
      type,
      sentBy,
      groupName,
      isMod,
      isAdmin
    );
  };

  useEffect(() => {
    const fetchGroupName = async () => {
      if (!user) return;
      try {
        const name = await AsyncStorage.getItem("groupName");
        if (!name) return;
        setGroupName(name);
      } catch (error) {
        console.error("There has been an error: ", error);
      }
    };

    fetchGroupName();
  }, [groupId, user]);

  // Group name for post creation

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
          {!sendButtonClicked && (
            <View className="flex justify-center items-center mt-7">
              <View className="w-80 bg-white p-8 rounded-xl shadow-lg shadow-secondary">
                <Text className="text-center font-poppins">
                  Be respectful, stay on topic, and avoid spam. GroupMind is a
                  safe space for students to learn and grow. 🚀
                </Text>
              </View>
            </View>
          )}

          {/* Time Card */}
          {sendButtonClicked && (
            <View className="flex items-center justify-center mt-5 ">
              <View className="bg-primary w-20  rounded-2xl p-1 items-center shadow-md shadow-black ">
                <Text className="text-white font-bold font-inter ">
                  {checkTime}
                </Text>
              </View>
            </View>
          )}

          <View
            className={`flex-row px-4 py-2 ${
              isSelf ? "justify-end" : "justify-start"
            }`}
          >
            <View
              className={`flex ${
                isSelf ? "items-end" : "items-start"
              } max-w-[80%] my-2`}
            >
              {/* Message Bubble */}
              {sendButtonClicked && (
                <>
                  {/* Header: Badge, Name, Time */}
                  <View className={`flex-row items-center gap-2`}>
                    {!isSelf && (
                      <Image
                        source={
                          userAvatar
                            ? avatars[userAvatar as keyof Avatars]
                            : avatars.avatar6
                        }
                        className="w-10 h-10 rounded-full"
                        resizeMode="cover"
                      />
                    )}

                    {isAdmin || isMod ? (
                      <View
                        className={`rounded-2xl ${
                          isAdmin ? "bg-primary/40" : "bg-[#CCE141]/30"
                        } px-2 py-1`}
                      >
                        <Text className="font-bold font-inter text-xs">
                          {isAdmin ? "Admin" : "Mod"}
                        </Text>
                      </View>
                    ) : null}

                    <Text className="font-inter font-bold text-sm">
                      {isSelf ? "You" : "Me"}
                    </Text>
                    <Text className="text-xs font-inter text-gray-500">
                      {sentTime}
                    </Text>

                    {isSelf && (
                      <Image
                        source={
                          userAvatar
                            ? avatars[userAvatar as keyof Avatars]
                            : avatars.avatar6
                        }
                        className="w-10 h-10 rounded-full"
                        resizeMode="cover"
                      />
                    )}
                  </View>
                  <View
                    className={`p-3 rounded-2xl my-1 ${
                      isSelf ? "bg-primary/70" : "bg-[#E8E8E8]"
                    }`}
                  >
                    <Text className="font-inter text-md">{sentMessage}</Text>
                  </View>

                  <View>
                    <Text className="font-inter">
                      {qaPostSent ? "Sent" : "Sending.."}
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>
        </KeyboardAwareScrollView>

        <ShareModal
          visible={isActive}
          onDismiss={() => setIsActive(!isActive)}
        />

        <View className="px-4 py-2 border-t border-gray-200 bg-white flex flex-row items-center">
          {/* Add Button */}
          <TouchableOpacity
            className="justify-center items-center p-2"
            onPress={() => setIsActive(!isActive)}
            accessibilityLabel="Add attachment"
            accessibilityRole="button"
          >
            <Image
              source={messages.Add}
              className="w-10 h-10"
              tintColor={isActive ? "#4169E1" : "#64748b"}
            />
          </TouchableOpacity>

          {/* Message Input */}
          <View className="flex-1 mx-2 justify-center">
            <TextInput
              value={post}
              onChangeText={(text) => (setPost(text), setUserTyping(!!text))}
              mode="outlined"
              outlineColor="transparent"
              activeOutlineColor="transparent"
              cursorColor="#4169E1"
              textColor="#1e293b"
              placeholder="Type your question..."
              placeholderTextColor="#94a3b8"
              className="bg-gray-100 rounded-2xl px-4 py-2 text-base"
              contentStyle={{ textAlignVertical: "center" }}
              style={{ minHeight: 40, maxHeight: 120 }}
              multiline
              maxLength={500}
              accessibilityLabel="Question input"
            />
          </View>

          {/* Send Button */}
          <TouchableOpacity
            className="justify-center items-center p-2"
            activeOpacity={post.length === 0 ? 0.5 : 1}
            disabled={post.length === 0}
            onPress={() => {
              if (post.length === 0 || !user) return;
              setSentMessage(post);
              setPost("");
              setSentTime(getMessageSentTime());
              sendPost(
                groupId.toString(),
                post,
                Timestamp.now(),
                [],
                [],
                false,
                "question",
                user.uid,
                groupName
              );
              setSendButtonClicked(true);
              setUserTyping(false);
            }}
            accessibilityLabel="Send question"
            accessibilityRole="button"
          >
            <View
              className={`p-2 rounded-full ${
                post.length > 0 ? "bg-blue-500" : "bg-gray-300"
              }`}
            >
              <Image
                source={messages.Send}
                className="w-6 h-6"
                tintColor={post.length > 0 ? "#ffffff" : "#94a3b8"}
              />
            </View>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default CreatePost;
