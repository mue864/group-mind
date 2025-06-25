import { auth, db } from "@/services/firebase";
import { reviveTimestamps } from "@/utils/formatDate";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  arrayRemove,
  arrayUnion,
  collection,
  FieldValue,
  doc as firestoreDoc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import React, { createContext, useContext, useEffect, useState } from "react";
import Toast from "react-native-toast-message";

export interface Group {
  id: string;
  name: string;
  description: string;
  members: string[];
  admins: string[];
  moderators: string[];
  callScheduled?: {
    CallTime: Timestamp;
    callType: string;
    scheduled: boolean;
    sessionTitle: string;
  };
  [key: string]: any;
  createdBy: string;
  imageUrl: string;
}

interface MessageData {
  message: string;
  sentBy: string;
  timeSent: Timestamp;
  isAdmin: boolean;
  isMod: boolean;
  imageUrl?: string;
  userName: string;
  purpose: string;
  type: 'message' | 'question' | 'response';
  parentMessageId?: string;
  isHelpful?: boolean;
  helpfulCount?: number;
}

interface SendMessageParams {
  message: string;
  isAdmin: boolean;
  isMod: boolean;
  sentBy: string;
  timeSent: Timestamp;
  groupId: string;
  type: 'message' | 'question' | 'response';
  parentMessageId?: string;
  userInformation: {
    profilePicture?: string;
    userName: string;
    purpose: string;
  };
}

interface GroupContextType {
  groups: Group[];
  loading: boolean;
  groupCreating: boolean;
  groupCreated: boolean;
  qaPostSent: boolean;
  error: string | null;
  user: User | null;
  joinGroup: (groupId: string) => Promise<void>;
  leaveGroup: (groupId: string) => Promise<void>;
  createGroup: (
    name: string,
    description: string,
    imageUrl: string | null,
    category: string,
    maxGradeLevel: string,
    onboardingText: string
  ) => Promise<void>;
  sendQaPost: (
    groupId: string,
    message: string,
    timeSent: Timestamp | FieldValue,
    isAnswered: boolean,
    type: string,
    sentBy: string,
    groupName: string,
    isMod: boolean,
    isAdmin: boolean,
    postID: string
  ) => Promise<void>;
  responseQaPost: (
    postId: string,
    message: string,
    isAdmin: boolean,
    isMod: boolean,
    sentBy: string,
    timeSent: Timestamp,
    groupId: string
  ) => Promise<void>;
  sendMessage: (
    message: string,
    isAdmin: boolean,
    isMod: boolean,
    sentBy: string,
    timeSent: Timestamp,
    groupId: string,
    type?: 'message' | 'question' | 'response',
    parentMessageId?: string
  ) => Promise<{ success: boolean; messageId?: string; error?: any }>;
  respondToMessage: (
    message: string,
    isAdmin: boolean,
    isMod: boolean,
    sentBy: string,
    timeSent: Timestamp,
    groupId: string,
    parentMessageId: string,
  ) => Promise<{ success: boolean; messageId?: string; error?: any }>;
  markResponseHelpful: (
    groupId: string,
    messageId: string,
    responseId: string
  ) => Promise<{ success: boolean; error?: any }>;
  refreshGroups: () => Promise<void>;
  userInformation: UserInfo | null;
  qaPostID: string;
}

interface UserInfo {
  userName: string;
  profilePicture: string;
  purpose: string;
  level: string;
  joinedGroups: [];
  canExplainToPeople: boolean;
  userID: string;
}

const GroupContext = createContext<GroupContextType | undefined>(undefined);

export const GroupProvider = ({ children }: { children: React.ReactNode }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [groupCreating, setGroupCreating] = useState(false);
  const [groupCreated, setGroupCreated] = useState(false);
  const [qaPostSent, setQaPostSent] = useState(false);
  const [savedLocalData, setSavedLocalData] = useState<Group[]>([]);
  const [userInformation, setUserInformation] = useState<UserInfo | null>(null);
  const [qaPostID, setQaPostID] = useState("");
  const [messageSent, setMessageSent] = useState(false);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) {
        setGroups([]);
        setLoading(false);
        setError(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // local data
  useEffect(() => {
    if (!user) return;
    const retriveLocalData = async () => {
      try {
        const data = await AsyncStorage.getItem("validGroups");
        if (!data) return;
        const rawData = JSON.parse(data);
        const fixedTimeStamps = reviveTimestamps(rawData);
        // data to temporarily use for fast loading
        setGroups(fixedTimeStamps);
        // data to be compared with the online data
        setSavedLocalData(fixedTimeStamps);
      } catch (error) {
        console.log("Unable to retrive group data: ", error);
      }
    };
    retriveLocalData();
    getUserInfo();
  }, [user]);

  // compare data
  function compareData(localData: Group[], remoteData: Group[]) {
    if (localData.length !== remoteData.length) {
      // save local first
      saveGroupData(remoteData);
      // set the value to groups state
      setGroups(remoteData);

      setSavedLocalData(remoteData);
      return true;
    }
    return false;
  }


  // Subscribe to real-time updates for user's groups
  useEffect(() => {
    let unsubscribe: () => void;

    const subscribeToGroups = async () => {
      if (!user) return; // this is where the isssue is!!!!

      try {
        const userRef = firestoreDoc(db, "users", user.uid);
        unsubscribe = onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            const userData = doc.data();
            const groupIds = userData.joinedGroups || [];

            // Fetch all group data when user data changes
            const fetchGroups = async () => {
              const groupPromises = groupIds.map(async (groupId: string) => {
                const groupRef = firestoreDoc(db, "groups", groupId);
                const groupDoc = await getDoc(groupRef);
                if (groupDoc.exists()) {
                  const data = groupDoc.data();
                  if (data) {
                    const groupData = data as Group; // type assertion i.e. telling the compiler that the data is of type Group
                    return { ...groupData, id: groupId }; // creating a shallow copy of the group data to avoid side effects
                  }
                  return null;
                }
                return null;
              });

              const results = await Promise.all(groupPromises); // wait for all promises to resolve i.e. wait for all group data to be fetched
              const validGroups = results.filter((g): g is Group => g !== null); // says g is of type Group and filter out any null values, i.e. groups that don't exist (g !== null)
              compareData(savedLocalData, validGroups);

              console.log("data fetched from web");
              setLoading(false);
            };
            fetchGroups();
          }
        });
      } catch (err) {
        console.error("Error subscribing to groups:", err);
        setError("Failed to load groups");
        setLoading(false);
      }
    };

    subscribeToGroups();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  const saveGroupData = async (validGroups: Group[]) => {
    try {
      await AsyncStorage.setItem("validGroups", JSON.stringify(validGroups));
    } catch (error) {
      console.error("Unable to save group data: ", error);
    }
  };

  const joinGroup = async (groupId: string) => {
    if (!user) return;

    try {
      const userRef = firestoreDoc(db, "users", user.uid);
      await updateDoc(userRef, {
        joinedGroups: arrayUnion(groupId),
      });
    } catch (err) {
      console.error("Error joining group:", err);
      throw err;
    }
  };

  const createGroup = async (
    name: string,
    description: string,
    imageUrl: string | null,
    category: string,
    maxGradeLevel: string,
    onboardingText: string
  ) => {
    try {
      setGroupCreating(true);
      setGroupCreated(false);
      const groupRef = firestoreDoc(collection(db, "groups"));
      const groupData = {
        name,
        description,
        category,
        imageUrl,
        onboardingText,
        maxGradeLevel,
        members: [user?.uid],
        createdBy: user?.uid,
        createdAt: serverTimestamp(),
        admins: [user?.uid],
      };
      await setDoc(groupRef, groupData);

      joinGroup(groupRef.id);
      Toast.show({
        type: "success",
        text1: name,
        text2: "Successfully created",
      });
      setGroupCreating(false);
      setGroupCreated(true);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Unable to create group " + error,
      });
      setGroupCreating(false);
    }
  };

  const sendQaPost = async (
    groupId: string,
    message: string,
    timeSent: Timestamp | FieldValue,
    isAnswered: boolean,
    type: string,
    sentBy: string,
    groupName: string,
    isMod: boolean,
    isAdmin: boolean,
  ) => {
    if (!user) return;
    try {
      setQaPostSent(false);
      const qaRef = firestoreDoc(collection(db, "groups", groupId, "qa"));
      const qaData = {
        groupId,
        message,
        timeSent,
        isAnswered,
        type,
        sentBy,
        groupName,
        isAdmin,
        isMod,
        imageUrl: userInformation?.profilePicture,
        userName: userInformation?.userName,
        purpose: userInformation?.purpose,
      };
      await setDoc(qaRef, qaData);
      setQaPostID(qaRef.id)
      setQaPostSent(true);
    } catch (error) {
      console.error("Unable to send post: ", error);
    }
  };

  const responseQaPost = async (
    postId: string,
    message: string,
    isAdmin: boolean,
    isMod: boolean,
    sentBy: string,
    timeSent: Timestamp,
    groupId: string
  ) => {
    if (!user) return;
    try {
      setQaPostSent(false);
      const responseRef = firestoreDoc(
        collection(
          db,
          "groups",
          groupId.toString(),
          "qa",
          postId.toString(),
          "qa_responses"
        )
      );

      const resposeData = {
        postId,
        userName: userInformation?.userName,
        message,
        isAdmin,
        isMod,
        sentBy,
        timeSent,
        imageUrl: userInformation?.profilePicture,
        purpose: userInformation?.purpose,
        type: "response",
      };
      await setDoc(responseRef, resposeData);
      setQaPostSent(true);
    } catch (error) {
      console.error("An error occured when sending response: ", error);
    }
  };

  const sendUnifiedMessage = async ({
    message,
    isAdmin,
    isMod,
    sentBy,
    timeSent,
    groupId,
    type = 'message',
    parentMessageId,
    userInformation: userInfoParam,
  }: SendMessageParams) => {
    try {
      setMessageSent(false);
      let messageRef;

      if (type === 'response' && parentMessageId) {
        messageRef = firestoreDoc(
          collection(
            db,
            'groups',
            groupId.toString(),
            'messages',
            parentMessageId.toString(),
            'responses'
          )
        );
      } else {
        messageRef = firestoreDoc(
          collection(db, 'groups', groupId.toString(), 'messages')
        );
      }

      const userInfo = userInfoParam || userInformation;
      const messageData: MessageData = {
        message,
        sentBy,
        timeSent,
        isAdmin,
        isMod,
        imageUrl: userInfo?.profilePicture,
        userName: userInfo?.userName || '',
        purpose: userInfo?.purpose || '',
        type,
        ...(parentMessageId && { parentMessageId }),
        ...(type === 'response' && { isHelpful: false, helpfulCount: 0 }),
      };

      await setDoc(messageRef, messageData);
      setMessageSent(true);
      return { success: true, messageId: messageRef.id };
    } catch (error) {
      console.error('An error occurred when sending message: ', error);
      return { success: false, error };
    }
  };

  const sendMessage = async (
    message: string,
    isAdmin: boolean,
    isMod: boolean,
    sentBy: string,
    timeSent: Timestamp,
    groupId: string,
    type: 'message' | 'question' | 'response' = 'message',
    parentMessageId?: string
  ) => {
    if (!userInformation) {
      return { success: false, error: 'User information not available' };
    }

    return sendUnifiedMessage({
      message,
      isAdmin,
      isMod,
      sentBy,
      timeSent,
      groupId,
      type,
      parentMessageId,
      userInformation: {
        profilePicture: userInformation.profilePicture,
        userName: userInformation.userName,
        purpose: userInformation.purpose,
      },
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
  ) => {
    if (!userInformation) {
      return { success: false, error: 'User information not available' };
    }

    return sendUnifiedMessage({
      message,
      isAdmin,
      isMod,
      sentBy,
      timeSent,
      groupId,
      type: 'response',
      parentMessageId,
      userInformation: {
        profilePicture: userInformation.profilePicture,
        userName: userInformation.userName,
        purpose: userInformation.purpose,
      },
    });
  };

  const markResponseHelpful = async (
    groupId: string,
    messageId: string,
    responseId: string
  ) => {
    try {
      const responseRef = firestoreDoc(
        db,
        'groups',
        groupId,
        'messages',
        messageId,
        'responses',
        responseId
      );

      await updateDoc(responseRef, { 
        isHelpful: true,
        helpfulCount: arrayUnion(1) // Increment helpful count
      });
      return { success: true };
    } catch (error) {
      console.error('Error marking response as helpful:', error);
      return { success: false, error };
    }
  }

  const leaveGroup = async (groupId: string) => {
    if (!user) return;

    try {
      const userRef = firestoreDoc(db, "users", user.uid);
      await updateDoc(userRef, {
        joinedGroups: arrayRemove(groupId),
      });
    } catch (err) {
      console.error("Error leaving group:", err);
      throw err;
    }
  };

  const refreshGroups = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const userRef = firestoreDoc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const groupIds = userData.joinedGroups || [];

        const groupPromises = groupIds.map(async (groupId: string) => {
          const groupRef = firestoreDoc(db, "groups", groupId);
          const groupDoc = await getDoc(groupRef);
          if (groupDoc.exists()) {
            return { id: groupDoc.id, ...groupDoc.data() } as Group;
          }
          return null;
        });

        const results = await Promise.all(groupPromises);
        const validGroups = results.filter((g): g is Group => g !== null);
        setGroups(validGroups);
      }
    } catch (err) {
      console.error("Error refreshing groups:", err);
      setError("Failed to refresh groups");
    } finally {
      setLoading(false);
    }
  };



  // get and save the user information locally
  const getUserInfo = async () => {
    if (!user) return;
    try {
      const userRef = firestoreDoc(db, "users", user.uid);
      const docRef = await getDoc(userRef);

      if (docRef.exists()) {
        const data = docRef.data();
        const savedData = (data) => {
          return {
            userName: data.userName,
            profilePicture: data.profileImage,
            purpose: data.purpose,
            level: data.level,
            joinedGroups: data.joinedGroups,
            canExplainToPeople: data.canExplainToPeople,
            userID: user.uid,
          } satisfies UserInfo;
        };
        setUserInformation(savedData(data));
      }
    } catch (error) {
      console.error("Unable to fetch user data", error);
    }
  };


  return (
    <GroupContext.Provider
      value={{
        groups,
        loading,
        error,
        joinGroup,
        leaveGroup,
        refreshGroups,
        createGroup,
        groupCreating,
        groupCreated,
        user,
        qaPostSent,
        sendQaPost,
        responseQaPost,
        sendMessage,
        respondToMessage,
        markResponseHelpful,
        userInformation,
        qaPostID,
      }}
    >
      {children}
    </GroupContext.Provider>
  );
};

export const useGroupContext = () => {
  const context = useContext(GroupContext);
  if (context === undefined) {
    throw new Error("useGroupContext must be used within a GroupProvider");
  }
  return context;
};

export default GroupProvider;
