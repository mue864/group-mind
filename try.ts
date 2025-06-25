import {
  collection,
  doc as firestoreDoc,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/services/firebase";

interface MessageData {
  message: string;
  sentBy: string;
  timeSent: Timestamp;
  isAdmin: boolean;
  isMod: boolean;
  imageUrl?: string;
  userName: string;
  purpose: string;
  type: "message" | "question" | "response";
  parentMessageId?: string; // For responses
  isHelpful?: boolean; // For tracking helpful responses
  helpfulCount?: number; // Count of helpful votes
}

interface SendMessageParams {
  message: string;
  isAdmin: boolean;
  isMod: boolean;
  sentBy: string;
  timeSent: Timestamp;
  groupId: string;
  type: "message" | "question" | "response";
  parentMessageId?: string; // Required for responses
  userInformation: {
    profilePicture?: string;
    userName: string;
    purpose: string;
  };
}

// Unified send message function
const sendUnifiedMessage = async ({
  message,
  isAdmin,
  isMod,
  sentBy,
  timeSent,
  groupId,
  type = "message",
  parentMessageId,
  userInformation,
}: SendMessageParams) => {
  try {
    let messageRef;

    if (type === "response" && parentMessageId) {
      // Response to a specific message
      messageRef = firestoreDoc(
        collection(
          db,
          "groups",
          groupId.toString(),
          "messages",
          parentMessageId.toString(),
          "responses"
        )
      );
    } else {
      // Regular message or question
      messageRef = firestoreDoc(
        collection(db, "groups", groupId.toString(), "messages")
      );
    }

    const messageData: MessageData = {
      message,
      sentBy,
      timeSent,
      isAdmin,
      isMod,
      imageUrl: userInformation?.profilePicture,
      userName: userInformation?.userName,
      purpose: userInformation?.purpose,
      type,
      ...(parentMessageId && { parentMessageId }),
      ...(type === "response" && { isHelpful: false, helpfulCount: 0 }),
    };

    await setDoc(messageRef, messageData);
    return { success: true, messageId: messageRef.id };
  } catch (error) {
    console.error("An error occurred when sending message: ", error);
    return { success: false, error };
  }
};

// Specific helper functions for different message types
const sendMessage = async (
  message: string,
  isAdmin: boolean,
  isMod: boolean,
  sentBy: string,
  timeSent: Timestamp,
  groupId: string,
  userInformation: any
) => {
  return sendUnifiedMessage({
    message,
    isAdmin,
    isMod,
    sentBy,
    timeSent,
    groupId,
    type: "message",
    userInformation,
  });
};

const sendQuestion = async (
  message: string,
  isAdmin: boolean,
  isMod: boolean,
  sentBy: string,
  timeSent: Timestamp,
  groupId: string,
  userInformation: any
) => {
  return sendUnifiedMessage({
    message,
    isAdmin,
    isMod,
    sentBy,
    timeSent,
    groupId,
    type: "question",
    userInformation,
  });
};

const respondToMessage = async (
  message: string,
  isAdmin: boolean,
  isMod: boolean,
  sentBy: string,
  timeSent: Timestamp,
  groupId: string,
  parentMessageId: string,
  userInformation: any
) => {
  return sendUnifiedMessage({
    message,
    isAdmin,
    isMod,
    sentBy,
    timeSent,
    groupId,
    type: "response",
    parentMessageId,
    userInformation,
  });
};

// Function to mark response as helpful
const markResponseHelpful = async (
  groupId: string,
  messageId: string,
  responseId: string
) => {
  try {
    const responseRef = firestoreDoc(
      db,
      "groups",
      groupId,
      "messages",
      messageId,
      "responses",
      responseId
    );

    await setDoc(responseRef, { isHelpful: true }, { merge: true });
    return { success: true };
  } catch (error) {
    console.error("Error marking response as helpful:", error);
    return { success: false, error };
  }
};

export {
  sendUnifiedMessage,
  sendMessage,
  sendQuestion,
  respondToMessage,
  markResponseHelpful,
  type MessageData,
  type SendMessageParams,
};
