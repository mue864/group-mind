import { id } from "@/app/(groups)/[groupId]";
import Back from "@/assets/icons/Arrow_left.svg";
import ExpandRight from "@/assets/icons/Expand_right_dark.svg";
import HR from "@/assets/icons/hr2.svg";
import MessageBubble from "@/components/MessageBubble";
import { db } from "@/services/firebase";
import { useGroupContext } from "@/store/GroupContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import {
  collection,
  onSnapshot,
  Timestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  ViewStyle,
  Alert,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { TextInput, Button } from "react-native-paper";

type TimelineMessage = {
  id: string;
  message: string;
  sentBy: string;
  timeSent: Timestamp;
  isSelf: boolean;
  isAdmin: boolean;
  isMod: boolean;
  imageUrl: string | undefined;
  userName: string;
  purpose: string;
  type: "message" | "question" | "response";
  parentMessageId?: string;
  responseCount?: number;
  isHelpful?: boolean;
};

function GroupChat() {
  const { user, sendMessage } = useGroupContext();
  const { groupId } = useLocalSearchParams();

  const deviceWidth = Dimensions.get("window").width;

  const [timeline, setTimeline] = useState<TimelineMessage[]>([]);
  const [isAdmin] = useState(true);
  const [isMod] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"message" | "question">(
    "message"
  );
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [groupName, setGroupName] = useState("");

//   fetch group name
  useEffect(() => {
    if (!groupId) return;
   try {
     const fetchGroupName = async () => {
        const groupName = await AsyncStorage.getItem(`groupName`);
        console.log(groupName);
        if (!groupName) return;
        setGroupName(groupName?.toString());
    }
    fetchGroupName();   
   } catch (error) {
    console.log(error);
   }
  }, [groupId]);


  useEffect(() => {
    if (!user || !groupId) return;

    const messagesQuery = query(
      collection(db, "groups", groupId.toString(), "messages"),
      orderBy("timeSent", "asc")
    );

    const unsubscribe = onSnapshot(
      messagesQuery,
      async (snapshot) => {
        const messagesData = [];

        for (const doc of snapshot.docs) {
          const data = doc.data();

          // Get response count for questions
          let responseCount = 0;
          if (data.type === "question") {
            try {
              const responsesSnapshot = await collection(
                db,
                "groups",
                groupId.toString(),
                "messages",
                doc.id,
                "responses"
              );
              // You'd need to count these - this is a simplified example
              responseCount = 0; // Implement actual counting logic
            } catch (error) {
              console.log("Error getting response count:", error);
            }
          }

          messagesData.push({
            id: doc.id,
            message: data.message || "",
            sentBy: data.sentBy || "",
            timeSent: data.timeSent || Timestamp.now(),
            isSelf: data.sentBy === user.uid,
            isAdmin: data.isAdmin || false,
            isMod: data.isMod || false,
            imageUrl: data.imageUrl,
            userName: data.userName || "Unknown User",
            purpose: data.purpose || "",
            type: data.type || "message",
            parentMessageId: data.parentMessageId,
            responseCount,
            isHelpful: data.isHelpful || false,
          });
        }

        setTimeline(messagesData);
      },
      (error) => {
        console.error("Error fetching messages:", error);
      }
    );

    return () => unsubscribe();
  }, [user, groupId]);

  const handleSendMessage = async () => {
    if (!message.trim() || !user || isSending || !groupId) return;

    try {
      setIsSending(true);
      const timeSent = Timestamp.now();

      if (replyingTo) {
        // Send as response
        await sendMessage(
          message.trim(),
          isAdmin,
          isMod,
          user.uid,
          timeSent,
          groupId.toString(),
          "response",
          replyingTo
        );
        setReplyingTo(null);
      } else {
        // Send as regular message or question
        await sendMessage(
          message.trim(),
          isAdmin,
          isMod,
          user.uid,
          timeSent,
          groupId.toString(),
          messageType
        );
      }

      setMessage("");
      setMessageType("message");
    } catch (error) {
      console.error("Error sending message:", error);
      Alert.alert("Error", "Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

//   rethink about this one
  const handleReply = (messageId?: string) => {
    if (messageId) {
      setReplyingTo(messageId);
      // You might want to show which message is being replied to
      const replyingToMessage = timeline.find((msg) => msg.id === messageId);
      if (replyingToMessage) {
        Alert.alert(
          "Replying to",
          `"${replyingToMessage.message.substring(0, 50)}${
            replyingToMessage.message.length > 50 ? "..." : ""
          }"`
        );
      }
    }
  };

  const handleHelpful = (messageId?: string) => {
    if (messageId) {
      // Implement helpful marking logic
      console.log("Mark as helpful:", messageId);
      // You can call markResponseHelpful here
    }
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  return (
    <View className="flex-1 bg-[#F5F6FA]">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, justifyContent: "space-between" }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 35}
      >
        <KeyboardAwareScrollView
          className="flex-1 pb-[90px]"
          enableOnAndroid={true}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="flex flex-row items-center justify-between mx-4 mt-4 relative">
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
              <Back />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push({
                pathname: `/(settings)/(group_settings)/[groupId]`,
                params: {
                    groupId: groupId,
                    groupName: groupName,
                }
              })}
              activeOpacity={0.7}
              className="absolute left-1/2 -translate-x-1/2 "
            >
            <View className="flex flex-row items-center gap-2">
              <Text className="text-2xl font-bold">{groupName}</Text>
              <ExpandRight width={20} height={20} />
            </View>
            </TouchableOpacity>
          </View>

          <View className="mt-2">
            <HR width={deviceWidth} height={2} />
          </View>

          {/* Messages */}
          <View className="px-2 py-2">
            {timeline.length > 0 ? (
              <View style={styles.messagesContainer}>
                {timeline.map((msg, index) => (
                  <MessageBubble
                    key={`${msg.id}-${index}`}
                    message={msg.message}
                    timeSent={msg.timeSent}
                    isSelf={msg.isSelf}
                    imageUrl={msg.imageUrl}
                    userName={msg.userName}
                    isAdmin={msg.isAdmin}
                    isMod={msg.isMod}
                    type={msg.type}
                    purpose={msg.purpose}
                    messageId={msg.id}
                    responseCount={msg.responseCount}
                    isHelpful={msg.isHelpful}
                    onReply={handleReply}
                    onHelpful={handleHelpful}
                  />
                ))}
              </View>
            ) : (
              <View className="flex-1 justify-center items-center p-5">
                <Text className="text-gray-400 text-base">No messages yet</Text>
              </View>
            )}
          </View>
        </KeyboardAwareScrollView>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          {/* Message Type Selector */}
          {!replyingTo && (
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  messageType === "message" && styles.activeTypeButton,
                ]}
                onPress={() => setMessageType("message")}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    messageType === "message" && styles.activeTypeButtonText,
                  ]}
                >
                  Message
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  messageType === "question" && styles.activeTypeButton,
                ]}
                onPress={() => setMessageType("question")}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    messageType === "question" && styles.activeTypeButtonText,
                  ]}
                >
                  Question
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Reply Indicator */}
          {replyingTo && (
            <View style={styles.replyIndicator}>
              <Text style={styles.replyText}>Replying to message</Text>
              <TouchableOpacity onPress={cancelReply}>
                <Text style={styles.cancelReply}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Input Row */}
          <View style={styles.inputRow}>
            <TextInput
              value={message}
              onChangeText={setMessage}
              mode="outlined"
              outlineColor="transparent"
              activeOutlineColor="transparent"
              contentStyle={{ textAlignVertical: "center" }}
              cursorColor="#4169E1"
              style={styles.input}
              placeholder={
                replyingTo
                  ? "Type your response..."
                  : messageType === "question"
                  ? "Ask a question..."
                  : "Type your message..."
              }
              placeholderTextColor="#94a3b8"
              multiline
              maxLength={500}
              onSubmitEditing={handleSendMessage}
              returnKeyType="send"
              blurOnSubmit={false}
            />
            <TouchableOpacity
              onPress={handleSendMessage}
              disabled={!message.trim() || isSending}
              style={[
                styles.sendButton,
                {
                  backgroundColor:
                    message.trim() && !isSending
                      ? messageType === "question"
                        ? "#8B5CF6"
                        : replyingTo
                        ? "#059669"
                        : "#4169E1"
                      : "#cccccc",
                },
              ]}
            >
              <Text style={styles.sendButtonText}>
                {isSending ? "..." : "↑"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  messagesContainer: {
    flex: 1,
  },
  inputContainer: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    padding: 10,
  },
  typeSelector: {
    flexDirection: "row",
    marginBottom: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    padding: 2,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 18,
    alignItems: "center",
  },
  activeTypeButton: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  typeButtonText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  activeTypeButtonText: {
    color: "#333",
    fontWeight: "600",
  },
  replyIndicator: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f0f9ff",
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
  },
  replyText: {
    color: "#0369a1",
    fontSize: 14,
    fontWeight: "500",
  },
  cancelReply: {
    color: "#dc2626",
    fontSize: 14,
    fontWeight: "500",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
    maxHeight: 100,
    minHeight: 40,
    justifyContent: "center",

  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  } as ViewStyle,
  sendButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default GroupChat;
