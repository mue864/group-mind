import type { QaPost } from "@/app/(groups)/[groupId]";
import Back from "@/assets/icons/Arrow_left.svg";
import HR from "@/assets/icons/hr2.svg";
import { messages } from "@/assets/icons/messages";
import MessageBubble from "@/components/MessageBubble";
import ShareModal from "@/components/ShareModal";
import { db } from "@/services/firebase";
import { useGroupContext } from "@/store/GroupContext";
import { analyzePastedContent, getEducationalTooltip } from "@/utils/pasteDetector";
import EducationalTooltip from "@/components/EducationalTooltip";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { format, isToday, isYesterday } from "date-fns";
import { router, useLocalSearchParams } from "expo-router";
import {fastAIDetector} from "@/utils/aiDetector";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  Keyboard,
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
  isHelpful?: boolean;
  helpfulCount?: number;
  helpfulUsers?: string[];
  responseId?: string; // Add this to track individual responses
  aiScore?: number;
  aiWarning?: 'none' | 'likely' | 'detected';
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
  aiScore?: number;
  aiWarning?: 'none' | 'likely' | 'detected';
};

function ViewPost() {
  const { userInformation, responseQaPost, user, saveGroupResource } =
    useGroupContext();
  const scrollViewRef = useRef<KeyboardAwareScrollView>(null);

  const deviceWidth = Dimensions.get("window").width;

  const [timeline, setTimeline] = useState<TimelineMessage[]>([]);
  const [messagesByID, setMessagesById] = useState<Record<string, QaPost>>({});
  const [authorMessage, setAuthorMessage] = useState("");
  const [messageTime, setMessageTime] = useState("");
  const { postId, groupId } = useLocalSearchParams();
  const [isAdmin] = useState(false);
  const [isMod] = useState(false);
  const [timeCheck, setCheckTime] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [post, setPost] = useState("");
  const [userTyping, setUserTyping] = useState(false);
  const [sendButtonClicked, setSendButtonClicked] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [groupName, setGroupName] = useState("");
  const replyMessageRef = useRef("");
  const sendMessageRef = useRef("")

  const [qa_Responses, setQA_Responses] = useState<QaResponses[]>([]);

  // Reply functionality state
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showEducationalTooltip, setShowEducationalTooltip] = useState(false);
  const [educationalMessage, setEducationalMessage] = useState("");
  const prevReplyTextRef = useRef("");
  const prevPostTextRef = useRef("");

  const userAvatar = userInformation?.profilePicture;

  const handleReplyMessage = (val: string) => {
    const analysis = analyzePastedContent(val, prevReplyTextRef.current);
    
    if (analysis.isEducationalMoment && analysis.educationalMessage) {
      setEducationalMessage(analysis.educationalMessage);
      setShowEducationalTooltip(true);
    }
    
    setReplyMessage(val);
    replyMessageRef.current = val;
    prevReplyTextRef.current = val;
  }

  const handleSendMessage = (val: string) => {
    const analysis = analyzePastedContent(val, prevPostTextRef.current);
    
    if (analysis.isEducationalMoment && analysis.educationalMessage) {
      setEducationalMessage(analysis.educationalMessage);
      setShowEducationalTooltip(true);
    }
    
    setPost(val);
    sendMessageRef.current = val;
    prevPostTextRef.current = val;
    setUserTyping(!!val);
  };


  // fetch group name
  useEffect(() => {
    const getGroupName = async () => {
      try {
        const groupName = await AsyncStorage.getItem("groupName");
        if (groupName) {
          setGroupName(groupName);
        }
      } catch (error) {
        console.error("Unable to get group name: ", error);
      }
    }

    getGroupName();
  }, []);


  // Keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
        // Scroll to bottom when keyboard appears
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd(true);
        }, 100);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (timeline.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd(true);
      }, 100);
    }
  }, [timeline.length]);

  // Handle reply to a message
  const handleReply = (messageId?: string) => {
    if (messageId) {
      setReplyingTo(messageId);
      setShowReplyInput(true);
    }
  };

  // Handle marking response as helpful
  const handleHelpful = async (responseId?: string) => {
    if (!responseId || !user || !groupId) return;

    try {
      const responseRef = doc(
        db,
        "groups",
        groupId.toString(),
        "qa",
        postId.toString(),
        "qa_responses",
        responseId
      );

      // Get current response data
      const responseDoc = await getDoc(responseRef);
      if (!responseDoc.exists()) return;

      const currentData = responseDoc.data();
      const currentHelpfulCount = currentData.helpfulCount || 0;
      const helpfulUsers = currentData.helpfulUsers || [];
      const isCurrentlyHelpful = helpfulUsers.includes(user.uid);

      // Toggle helpful status
      if (isCurrentlyHelpful) {
        // Remove user from helpful users and decrease count
        await updateDoc(responseRef, {
          helpfulUsers: helpfulUsers.filter((uid: string) => uid !== user.uid),
          helpfulCount: Math.max(0, currentHelpfulCount - 1),
        });
      } else {
        // Add user to helpful users and increase count
        await updateDoc(responseRef, {
          helpfulUsers: [...helpfulUsers, user.uid],
          helpfulCount: currentHelpfulCount + 1,
        });
      }
    } catch (error) {
      console.error("Error marking response as helpful:", error);
    }
  };

  // Handle sending reply
  const handleSendReply = async () => {
    if (!replyMessage.trim() || !user || !replyingTo) return;

    // check if response is not AI generated
    const isAIGenerated = fastAIDetector(replyMessage);

    console.log(isAIGenerated);
    try {
      setIsSending(true);
      await responseQaPost(
        postId.toString(),
        replyMessage,
        isAdmin,
        isMod,
        user.uid,
        Timestamp.now(),
        groupId.toString()
      );

      setReplyMessage("");
      setReplyingTo(null);
      setShowReplyInput(false);
    } catch (error) {
      console.error("Error sending reply:", error);
    } finally {
      setIsSending(false);
    }
  };

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

    setLoadingMessages(true);
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
            isHelpful: data.isHelpful || false,
            helpfulCount: data.helpfulCount || 0,
            helpfulUsers: data.helpfulUsers || [],
            responseId: snap.id, // Add the document ID as responseId
            aiScore: data.aiScore,
            aiWarning: data.aiWarning || 'none',
          } satisfies QaResponses;
        });
        setQA_Responses(responseData);
        setLoadingMessages(false);
      }
    );
    return () => unsubscribe();
  }, [user, groupId, postId]);

  //  file upload
  const handleFileUploaded = async (fileUrl: string, fileName: string) => {
    if (!user || !groupId) return;

    try {
      await saveGroupResource ({
        groupId: groupId.toString(),
        name: groupName,
        url: fileUrl,
        type: getFileType(fileName),
        uploadedBy: user.uid,
        uploadedByUserName: userInformation?.userName || "Unkown User",
        uploadedAt: Timestamp.now(),
        fileSize: 0,
      })
    } catch (error) {
      console.error("Unable to send resource: ", error);
    }
  };

    const getFileType = (fileName: string): string => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "pdf":
        return "PDF";
      case "doc":
      case "docx":
        return "Document";
      case "xls":
      case "xlsx":
        return "Spreadsheet";
      case "ppt":
      case "pptx":
        return "Presentation";
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return "Image";
      case "mp4":
      case "avi":
      case "mov":
        return "Video";
      case "mp3":
      case "wav":
        return "Audio";
      default:
        return "File";
    }
  };

  // fetch local message data
  useEffect(() => {
    const fetchLocalMessagesData = async () => {
      try {
        const localSavedMessages = await AsyncStorage.getItem(
          `local-${groupId}`
        );

        if (localSavedMessages) {
          const parsedMessages = JSON.parse(localSavedMessages);
          setMessagesById(parsedMessages);
        }
      } catch (error) {
        console.error("An error has occured: ", error);
      }
    };

    fetchLocalMessagesData();
  }, [groupId]);

  // Combine the original post with its responses
  useEffect(() => {
    if (!messagesByID || !qa_Responses || !postId) return;

    const rawPost = messagesByID[postId.toString()];
    if (!rawPost) return;

    // Check if user can edit the post

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
      aiScore: rawPost.aiScore,
      aiWarning: rawPost.aiWarning || 'none',
    };

    // Process responses
    const responseMessages: TimelineMessage[] = qa_Responses.map(
      (response, index) => {
        const isResponseFromSelf = user?.uid === response.sentBy;
        // Process response message

        return {
          id: `response-${index}`,
          message: response.message,
          sentBy: response.sentBy,
          timeSent: response.timeSent,
          imageUrl: response.imageUrl,
          isSelf: isResponseFromSelf,
          isAdmin: response.isAdmin,
          isMod: response.isMod,
          type: "response",
          userName: response.userName || "Anonymous",
          purpose: response.purpose || "",
          aiScore: response.aiScore,
          aiWarning: response.aiWarning || 'none',
        };
      }
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
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex flex-row items-center justify-between mx-4 mt-4">
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Back />
        </TouchableOpacity>
        <Text className="text-2xl font-bold">Q&A Post</Text>
        <View className="w-8" />
      </View>

      <View className="mt-2">
        <HR width={deviceWidth} height={2} />
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 55 : 35}
      >
        <KeyboardAwareScrollView
          ref={scrollViewRef}
          className="flex-1"
          enableOnAndroid={true}
          enableAutomaticScroll={true}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          extraScrollHeight={Platform.OS === "ios" ? 0 : 0}
          extraHeight={Platform.OS === "ios" ? 0 : 0}
          contentContainerStyle={{
            flexGrow: 1,
          }}
        >
          {/* Original Post */}
          {authorMessage && (
            <View className="mx-4 mt-4 p-4 bg-white rounded-lg shadow-sm">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-lg font-semibold text-gray-800">
                  Original Question
                </Text>
                <Text className="text-sm text-gray-500">{messageTime}</Text>
              </View>
              <Text className="text-gray-700 leading-relaxed">
                {authorMessage}
              </Text>
            </View>
          )}

          {/* Messages */}
          <View className="px-2 py-2 flex-1">
            {timeline.length > 0 && !loadingMessages ? (
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
                  aiScore={msg.aiScore}
                  aiWarning={msg.aiWarning}
                  onReply={handleReply}
                  onHelpful={handleHelpful}
                  messageId={msg.id}
                  responseCount={
                    msg.type === "question"
                      ? qa_Responses.filter(
                          (response) =>
                            response.sentBy !==
                              messagesByID[postId.toString()]?.sentBy &&
                            response.type === "response" &&
                            !response.message.toLowerCase().includes("?") // Exclude follow-up questions (messages containing question marks)
                        ).length // Only count actual answers from other users, not follow-up questions
                      : 0
                  }
                  isHelpful={
                    msg.type === "response"
                      ? qa_Responses
                          .find((r) => r.responseId === msg.id)
                          ?.helpfulUsers?.includes(user?.uid || "")
                      : false
                  }
                />
              ))
            ) : (
              loadingMessages ? (
                <View className="flex-1 justify-center items-center p-5">
                  <Text className="text-gray-400 text-base">Loading messages...</Text>
                </View>
              ) : (
                <View className="flex-1 justify-center items-center p-5">
                  <Text className="text-gray-400 text-base">No messages yet</Text>
                </View>
              )
            )}
          </View>
        </KeyboardAwareScrollView>

        {/* Reply Input Section */}
        {showReplyInput && (
          <View
            className="px-4 py-3 border-t border-gray-200 bg-blue-50"
            style={{ paddingBottom: Platform.OS === "ios" ? 25 : 15 }}
          >
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm text-blue-600 font-medium">
                Replying to message
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowReplyInput(false);
                  setReplyingTo(null);
                  setReplyMessage("");
                }}
              >
                <Text className="text-red-500 text-sm">Cancel</Text>
              </TouchableOpacity>
            </View>
            <View className="flex-row items-center">
              <View className="flex-1 mr-2">
                <TextInput
                  value={replyMessage}
                  onChangeText={handleReplyMessage}
                  mode="outlined"
                  outlineColor="transparent"
                  activeOutlineColor="transparent"
                  cursorColor="#4169E1"
                  textColor="#1e293b"
                  placeholder="Type your reply..."
                  placeholderTextColor="#94a3b8"
                  className="bg-white rounded-2xl px-4 py-2 text-base"
                  contentStyle={{ textAlignVertical: "center" }}
                  style={{ minHeight: 40, maxHeight: 120 }}
                  multiline
                  maxLength={500}
                />
              </View>
              <TouchableOpacity
                className="justify-center items-center p-2"
                activeOpacity={replyMessage.length === 0 ? 0.5 : 1}
                disabled={replyMessage.length === 0 || isSending}
                onPress={handleSendReply}
              >
                <View
                  className={`p-2 rounded-full ${
                    replyMessage.length > 0 ? "bg-blue-500" : "bg-gray-300"
                  }`}
                >
                  <Image
                    source={messages.Send}
                    className="w-6 h-6"
                    tintColor={replyMessage.length > 0 ? "#ffffff" : "#94a3b8"}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Main Input Area */}
        {!showReplyInput && (
          <View
            className="px-4 py-3 border-t border-gray-200 bg-white flex flex-row items-center"
            style={{ paddingBottom: Platform.OS === "ios" ? 0 : 20 }}
          >
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
                onChangeText={handleSendMessage}
                mode="outlined"
                outlineColor="transparent"
                activeOutlineColor="transparent"
                cursorColor="#4169E1"
                textColor="#1e293b"
                placeholder="Type your message..."
                placeholderTextColor="#94a3b8"
                className="bg-gray-100 rounded-2xl px-4 py-2 text-base"
                contentStyle={{ textAlignVertical: "center" }}
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
                const isAIGenerated = fastAIDetector(post)
                console.log(isAIGenerated);
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
        )}

        {/* Educational Tooltip */}
        <EducationalTooltip
          message={educationalMessage}
          visible={showEducationalTooltip}
          onDismiss={() => setShowEducationalTooltip(false)}
          type="tip"
        />

        <ShareModal
          visible={isActive}
          onDismiss={() => setIsActive(!isActive)}
          onFileUploaded={  (fileUrl, fileName) => {
            handleFileUploaded(fileUrl, fileName);           
            setPost((prev) => prev + (prev ? "\n" : "") + fileUrl);
          }}
        />
      </KeyboardAvoidingView>
    </View>
  );
}

export default ViewPost;
