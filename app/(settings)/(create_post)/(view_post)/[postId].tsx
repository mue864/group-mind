import type { QaPost } from "@/app/(groups)/[groupId]";
import Back from "@/assets/icons/Arrow_left.svg";
import HR from "@/assets/icons/hr2.svg";
import { messages } from "@/assets/icons/messages";
import MessageBubble from "@/components/MessageBubble";
import { db } from "@/services/firebase";
import { useGroupContext } from "@/store/GroupContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { format, isToday, isYesterday } from "date-fns";
import { router, useLocalSearchParams } from "expo-router";
import { collection, onSnapshot, Timestamp } from "firebase/firestore";
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
type QaResponses = {
  message: string;
  sentBy: string;
  timeSent: Timestamp;
  type: string;
  isAdmin: boolean;
  isMod: boolean;
  imageUrl: string | undefined;
  userName: string;
  purpose: string;
};

type TimelineMessage = {
  id: string;
  message: string;
  sentBy: string;
  timeSent: Timestamp;
  isSelf: boolean;
  isAdmin: boolean;
  isMod: boolean;
  imageUrl: string | undefined;
  type: "question" | "response";
  userName: string;
  purpose: string;
};

function ViewPost() {
  const { userInformation, responseQaPost, user, qaPostSent } = useGroupContext();

  const deviceWidth = Dimensions.get("window").width;

  const [timeline, setTimeline] = useState<TimelineMessage[]>([]);
  const [messagesByID, setMessagesById] = useState<Record<string, QaPost>>({});
  const [authorMessage, setAuthorMessage] = useState("");
  const [messageTime, setMessageTime] = useState("");
  const { postId, groupId } = useLocalSearchParams();
  const [isSelf] = useState(false);
  const [isAdmin] = useState(true);
  const [isMod] = useState(false);
  const [timeCheck, setCheckTime] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [post, setPost] = useState("");
  const [userTyping, setUserTyping] = useState(false);
  const [sendButtonClicked, setSendButtonClicked] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const [qa_Responses, setQA_Responses] = useState<QaResponses[]>([]);

  const userAvatar = userInformation?.profilePicture;

  // get responses
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

  // fetch online responses
  useEffect(() => {
    if (!user || !groupId) return;

    const unsubscribe = onSnapshot(
      collection(
        db,
        "groups",
        groupId.toString(),
        "qa",
        postId.toString(),
        "qa_responses"
      ),
      (snapshot) => {
        const responseData = snapshot.docs.map((snap) => {
          const data = snap.data();
          return {
            message: data.message,
            sentBy: data.sentBy,
            timeSent: data.timeSent,
            type: data.type,
            isMod: data.isMod,
            isAdmin: data.isAdmin,
            imageUrl: data.imageUrl,
            userName: data.userName,
            purpose: data.purpose,
          } satisfies QaResponses;
        });
        setQA_Responses(responseData);
      }
    );
    return () => unsubscribe();
  }, [user, groupId, postId]);

  // fetch local message data
  useEffect(() => {
    const fetchLocalMessagesData = async () => {
      try {
        const localSavedMessages = await AsyncStorage.getItem(
          `local-${groupId}`
        );

        if (localSavedMessages) {
          setMessagesById(JSON.parse(localSavedMessages));
        }
      } catch (error) {
        console.error("An error has occured: ", error);
      }
    };

    fetchLocalMessagesData();
  }, [groupId]);

  // checking if this is the originator of the msgs

  // fetch group name
  useEffect(() => {
    const fetchGroupName = async () => {
      if (!user) return;
      try {
        await AsyncStorage.getItem("groupName");
      } catch (error) {
        console.error("There has been an error: ", error);
      }
    };

    fetchGroupName();
  }, [groupId, user]);

  // Combine the original post with its responses
  useEffect(() => {
    if (!messagesByID || !qa_Responses || !postId) return;

    const rawPost = messagesByID[postId.toString()];
    if (!rawPost) return;

    // Create the original question message
    const originalMessage: TimelineMessage = {
      id: postId.toString(),
      message: rawPost.message,
      sentBy: rawPost.sentBy,
      timeSent: rawPost.timeSent,
      imageUrl: rawPost.imageUrl || userAvatar,
      isSelf: user?.uid === rawPost.sentBy,
      isAdmin: rawPost.isAdmin || false,
      isMod: rawPost.isMod || false,
      type: "question",
      userName: rawPost.userName || "Anonymous",
      purpose: rawPost.purpose || "",
    };

    // Process responses
    const responseMessages: TimelineMessage[] = qa_Responses.map(
      (response, index) => ({
        id: `response-${index}`,
        message: response.message,
        sentBy: response.sentBy,
        timeSent: response.timeSent,
        imageUrl: response.imageUrl,
        isSelf: user?.uid === response.sentBy,
        isAdmin: response.isAdmin,
        isMod: response.isMod,
        type: "response",
        userName: response.userName || "Anonymous",
        purpose: response.purpose || "",
      })
    );

    // Combine and sort by time
    const combined = [originalMessage, ...responseMessages].sort(
      (a, b) => a.timeSent.seconds - b.timeSent.seconds
    );

    setTimeline(combined);
  }, [messagesByID, qa_Responses, postId, user?.uid, userAvatar]);

  // this has to be moved to the Messages bubble
  useEffect(() => {
    if (messagesByID) {
      const messageTime = messagesByID[postId.toString()]?.timeSent;
      const message = messagesByID[postId.toString()]?.message;
      if (!messageTime || !message) return; // I did this because on the message object is only loading on second render
      const date = new Date(
        messageTime.seconds * 1000 +
          Math.floor(messageTime.nanoseconds / 1_000_000)
      ); // Why multiply by 1000? Because JavaScript Date expects milliseconds, but Firestore gives you seconds and nanoseconds.
      const formatedTime = format(date, "HH:mm");
      setMessageTime(formatedTime);
      setCheckTime(getTimeLabel(date));
      setAuthorMessage(message);
    }
  }, [messageTime, messagesByID, postId]);

  return (
    <View className="flex-1 bg-[#F5F6FA]">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 35}
      >
        <KeyboardAwareScrollView
          className="flex-1 pb-[90px]"
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
              Q&A Thread
            </Text>
          </View>

          <View className="mt-2">
            <HR width={deviceWidth} height={2} />
          </View>

          {/* Time Card */}
          {authorMessage && (
            <View className="flex items-center justify-center mt-5 ">
              <View className="bg-primary w-24  rounded-2xl p-1 justify-center items-center shadow-md shadow-black ">
                <Text className="text-white font-bold font-inter">
                  {timeCheck}
                </Text>
              </View>
            </View>
          )}
          <View className="px-2 py-2">
            {timeline.length > 0 ? (
              timeline.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg.message}
                  messageTimeSent={msg.timeSent}
                  userAvatar={msg.imageUrl || ""}
                  userName={msg.userName}
                  isAdmin={msg.isAdmin}
                  isMod={msg.isMod}
                  isSelf={msg.isSelf}
                  type={msg.type}
                  purpose={msg.purpose}
                />
              ))
            ) : (
              <View className="flex-1 justify-center items-center p-5">
                <Text className="text-gray-400 text-base">No messages yet</Text>
              </View>
            )}
          </View>
        </KeyboardAwareScrollView>

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
          <View className="flex-1 mx-2 ">
            <TextInput
              value={post}
              onChangeText={(text) => (setPost(text), setUserTyping(!!text))}
              mode="outlined"
              outlineColor="transparent"
              activeOutlineColor="transparent"
              cursorColor="#4169E1"
              textColor="#1e293b"
              placeholder="Type your message..."
              placeholderTextColor="#94a3b8"
              className="bg-gray-100 rounded-2xl px-4 py-2 text-base"
              contentStyle={{ textAlignVertical: 'center' }}
              style={{ minHeight: 40, maxHeight: 120 }}
              multiline
              maxLength={500}
              accessibilityLabel="Message input"
            />
          </View>

          {/* Send Button */}
          <TouchableOpacity
            className="justify-center items-center p-2"
            activeOpacity={post.length === 0 ? 0.5 : 1}
            disabled={post.length === 0}
            onPress={() => {
              if (post.length === 0 || !user) return;
              
              setIsSending(true);
              setPost("");
              responseQaPost(
                postId.toString(),
                post,
                isAdmin,
                isMod,
                user.uid,
                Timestamp.now(),
                groupId.toString()
              )
              .then(() => {
                setSendButtonClicked(true);
               
                setUserTyping(false);
              })
              .catch((error) => {
                console.error("Error sending message:", error);
                // Optionally show error to user
              })
              .finally(() => {
                setIsSending(false);
              });
            }}
            accessibilityLabel="Send message"
            accessibilityRole="button"
          >
            <View className={`p-2 rounded-full ${post.length > 0 ? 'bg-blue-500' : 'bg-gray-300'}`}>
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
}

export default ViewPost;
