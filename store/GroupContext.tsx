import { auth, db } from "@/services/firebase";
import { reviveTimestamps } from "@/utils/formatDate";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  FieldValue,
  doc as firestoreDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import React, { createContext, useContext, useEffect, useState } from "react";
import { showMessage } from "react-native-flash-message";
import Toast from "react-native-toast-message";

export interface Group {
  id: string;
  name: string;
  description: string;
  members: string[];
  admins: string[];
  moderators: string[];
  groupOwner: string; // Changed from string[] to string
  joinRequests: string[];
  blockedUsers: string[];
  callScheduled?: {
    callTime: Timestamp;
    callType: string;
    scheduled: boolean;
    sessionTitle: string;
    joinLink: string;
    groupId: string;
  };
  activeCall?: {
    callType: string;
    callTime: Timestamp;
    callStatus: string;
    joinLink: string;
    groupId: string;
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
  type: "message" | "question" | "response";
  parentMessageId?: string;
  isHelpful?: boolean;
  helpfulCount?: number;
  helpfulUsers?: string[];
}

interface SendMessageParams {
  message: string;
  isAdmin: boolean;
  isMod: boolean;
  sentBy: string;
  timeSent: Timestamp;
  groupId: string;
  type: "message" | "question" | "response";
  parentMessageId?: string;
  userInformation: {
    profilePicture?: string;
    userName: string;
    purpose: string;
  };
}

interface GroupContextType {
  groups: Group[];
  allGroups: Group[]; // New state for all available groups
  loading: boolean;
  groupCreating: boolean;
  groupCreated: boolean;
  qaPostSent: boolean;
  error: string | null;
  user: User | null;
  isJoining: boolean;
  isSendingJoinRequest: boolean;
  setGroupCreated: (value: boolean) => void;
  promoteToModerator: (groupId: string, userId: string) => Promise<void>;
  demoteModerator: (groupId: string, userId: string) => Promise<void>;
  promoteToAdmin: (groupId: string, userId: string) => Promise<void>;
  removeMember: (groupId: string, userId: string) => Promise<void>;
  blockMember: (groupId: string, userId: string) => Promise<void>;
  unblockMember: (groupId: string, userId: string) => Promise<void>;
  approveJoinRequest: (grouId: string, userId: string) => Promise<void>;
  rejectJoinRequest: (groupId: string, userId: string) => Promise<void>;
  sendJoinRequest: (groupId: string, userId: string) => Promise<void>;
  getUserInformation: (userId: string) => Promise<UserInfo | null>;
  transferOwnership: (
    groupId: string,
    ownerId: string,
    receiverId: string
  ) => Promise<void>;
  joinGroup: (groupId: string) => Promise<void>;
  leaveGroup: (groupId: string) => Promise<void>;
  createGroup: (
    name: string,
    description: string,
    imageUrl: string | null,
    category: string,
    maxGradeLevel: string,
    onboardingText: string,
    isPrivate: boolean,
    onboardingRules: string[] // NEW
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
    isAdmin: boolean
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
    type?: "message" | "question" | "response",
    parentMessageId?: string
  ) => Promise<{ success: boolean; messageId?: string; error?: any }>;
  respondToMessage: (
    message: string,
    isAdmin: boolean,
    isMod: boolean,
    sentBy: string,
    timeSent: Timestamp,
    groupId: string,
    parentMessageId: string
  ) => Promise<{ success: boolean; messageId?: string; error?: any }>;
  markResponseHelpful: (
    groupId: string,
    messageId: string,
    responseId: string
  ) => Promise<{ success: boolean; error?: any }>;
  refreshGroups: () => Promise<void>;
  fetchAllGroups: () => Promise<void>; // New function to fetch all groups
  userInformation: UserInfo | null;
  qaPostID: string;
  groupID: string;
  getCurrentUserInfo: () => Promise<void>;
  setGroupOnboardingCompleted: (
    userId: string,
    groupId: string
  ) => Promise<void>;
  checkGroupOnboardingCompleted: (
    userId: string,
    groupId: string
  ) => Promise<boolean>;
  deleteOnboardingCompleted: (
    userId: string,
    groupId: string
  ) => Promise<void>;
  saveGroupResource: (params: {
    groupId: string;
    name: string;
    url: string;
    type: string;
    uploadedBy: string;
    uploadedByUserName: string;
    uploadedAt: Timestamp;
    fileSize?: number;
  }) => Promise<void>;
  getAllUserResources: (userId: string | undefined) => Promise<any[]>;
  activeCalls: CallInfo[];
  updateCallParticipants: (
    callDocId: string,
    userId: string,
    joining: boolean
  ) => Promise<void>;
}

interface UserInfo {
  userName: string;
  profilePicture: string;
  purpose: string;
  level: string;
  joinedGroups: [];
  canExplainToPeople: boolean;
  userID: string;
  bio?: string;
  profileComplete: boolean;
}

interface CallInfo {
  id: string;
  groupId: string;
  channelName: string;
  callType: "audio" | "video";
  participants: string[];
  startedAt: Timestamp;
  groupName: string;
  createdByUserName: string;
  createdBy: string;
}

const GroupContext = createContext<GroupContextType | undefined>(undefined);

export const GroupProvider = ({ children }: { children: React.ReactNode }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [allGroups, setAllGroups] = useState<Group[]>([]); // New state for all groups
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
  const [groupID, setGroupID] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [isSendingJoinRequest, setIsSendingJoinRequest] = useState(false);
  const [activeCalls, setActiveCalls] = useState<CallInfo[]>([]);

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
        console.error("Unable to retrieve group data: ", error);
      }
    };
    retriveLocalData();
    getCurrentUserInfo();
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

  // Monitor active calls
  useEffect(() => {
    if (!user?.uid) return;

    const activeCallsRef = collection(db, "activeCalls");
    const q = query(activeCallsRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        const callData = change.doc.data() as CallInfo;
        callData.id = change.doc.id;

        if (change.type === "added") {
          setActiveCalls((prev) => [...prev, callData]);
          // Show notification for new calls (not created by this user and not already joined)
          if (
            callData.createdBy !== user?.uid &&
            !callData.participants.includes(user?.uid)
          ) {
            console.log("Call created")
          }
        }

        if (change.type === "modified") {
          setActiveCalls((prev) =>
            prev.map((call) =>
              call.id === change.doc.id
                ? { ...callData, id: change.doc.id }
                : call
            )
          );

          // Check if participants dropped to 0
          if (callData.participants.length === 0) {
            // this will never get to 0
            try {
              await deleteDoc(firestoreDoc(db, "activeCalls", change.doc.id));
              console.log(
                "Call cleaned up due to 0 participants:",
                change.doc.id
              );

              setActiveCalls((prev) =>
                prev.filter((call) => call.id !== change.doc.id)
              );
            } catch (error) {
              console.error("Error cleaning up empty call:", error);
            }
          }
        }

        if (change.type === "removed") {
          setActiveCalls((prev) =>
            prev.filter((call) => call.id !== change.doc.id)
          );
        }
      });
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const saveGroupData = async (validGroups: Group[]) => {
    try {
      await AsyncStorage.setItem("validGroups", JSON.stringify(validGroups));
    } catch (error) {
      console.error("Unable to save group data: ", error);
    }
  };

  // Helper to move user between role arrays (atomic update)
  const moveUserRole = async (
    groupId: string,
    userId: string,
    addTo: keyof Group,
    removeFrom: (keyof Group)[]
  ) => {
    const groupRef = firestoreDoc(db, "groups", groupId);
    const updateObj: any = {};
    updateObj[addTo] = arrayUnion(userId);
    removeFrom.forEach((role) => {
      updateObj[role] = arrayRemove(userId);
    });
    await updateDoc(groupRef, updateObj);
  };

  const transferOwnership = async (
    groupId: string,
    ownerId: string,
    receiverId: string
  ) => {
    if (!user) return;
    try {
      const groupRef = firestoreDoc(db, "groups", groupId);
      await updateDoc(groupRef, {
        groupOwner: receiverId, // Set new owner directly
        admins: arrayUnion(receiverId), // Add new owner as admin
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "An error has occured: " + error,
      });
    }
  };
  const rejectJoinRequest = async (groupId: string, userId: string) => {
    if (!user) return;

    try {
      const groupRef = firestoreDoc(db, "groups", groupId);

      await updateDoc(groupRef, {
        joinRequests: arrayRemove(userId),
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Unable to reject request: " + error,
      });
    }
  };
  const approveJoinRequest = async (groupId: string, userId: string) => {
    if (!user) return;

    try {
      const groupRef = firestoreDoc(db, "groups", groupId);

      await updateDoc(groupRef, {
        members: arrayUnion(userId),
        joinRequests: arrayRemove(userId),
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "An error has occured: " + error,
      });
    }
  };
  const unblockMember = async (groupId: string, userId: string) => {
    if (!user) return;

    try {
      const groupRef = firestoreDoc(db, "groups", groupId);
      await updateDoc(groupRef, {
        blockedUsers: arrayRemove(userId),
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "An error has occured: " + error,
      });
    }
  };

  const sendJoinRequest = async (groupId: string, userId: string) => {
    if (!user) return;
    setIsSendingJoinRequest(true);
    try {
      const groupRef = firestoreDoc(db, "groups", groupId);
      await updateDoc(groupRef, {
        joinRequests: arrayUnion(userId),
      });
      setIsSendingJoinRequest(false);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "An error has occured: " + error,
      });
      setIsSendingJoinRequest(false);
    }
  };

  const blockMember = async (groupId: string, userId: string) => {
    if (!user) return;

    try {
      const groupRef = firestoreDoc(db, "groups", groupId);
      await updateDoc(groupRef, {
        blockedUsers: arrayUnion(userId),
        admins: arrayRemove(userId),
        moderators: arrayRemove(userId),
        members: arrayRemove(userId),
        joinRequests: arrayRemove(userId),
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "An error has occured: " + error,
      });
    }
  };

  const removeMember = async (groupId: string, userId: string) => {
    if (!user) return;

    try {
      const groupRef = firestoreDoc(db, "groups", groupId);
      await updateDoc(groupRef, {
        members: arrayRemove(userId),
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "An error has occured: " + error,
      });
    }
  };

  const demoteModerator = async (groupId: string, userId: string) => {
    if (!user) return;
    try {
      const groupRef = firestoreDoc(db, "groups", groupId);
      await updateDoc(groupRef, {
        moderators: arrayRemove(userId),
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Unable to remove user: " + error,
      });
    }
  };

  const promoteToModerator = async (groupId: string, userId: string) => {
    if (!user) return;

    try {
      const groupRef = firestoreDoc(db, "groups", groupId);
      await updateDoc(groupRef, {
        moderators: arrayUnion(userId),
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Failed",
        text2: "Unable to add user as Moderator: " + error,
      });
    }
  };

  const promoteToAdmin = async (groupId: string, userId: string) => {
    if (!user) return;
    // Add to admins, remove from moderators and members
    await moveUserRole(groupId, userId, "admins", ["moderators", "members"]);
  };

  const joinGroup = async (groupId: string) => {
    if (!user) return;

    setIsJoining(true);
    try {
      // update user fields to have groupId
      const userRef = firestoreDoc(db, "users", user.uid);
      await updateDoc(userRef, {
        joinedGroups: arrayUnion(groupId),
      });
      // then update group fields to have userId
      const groupRef = firestoreDoc(db, "groups", groupId);
      await updateDoc(groupRef, {
        members: arrayUnion(user?.uid),
      });

      setIsJoining(false);
    } catch (err) {
      console.error("Error joining group:", err);
      setIsJoining(false);
      throw err;
    }
  };

  const getUserInformation = async (userId: string) => {
    try {
      const userRef = firestoreDoc(db, "users", userId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        return userDoc.data() as UserInfo;
      }
      return null;
    } catch (error) {
      console.error("Error getting user information: ", error);
      return null;
    }
  };

  const createGroup = async (
    name: string,
    description: string,
    imageUrl: string | null,
    category: string,
    maxGradeLevel: string,
    onboardingText: string,
    isPrivate: boolean,
    onboardingRules: string[]
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
        onboardingRules,
        maxGradeLevel,
        members: [user?.uid],
        admins: [user?.uid],
        moderators: [],
        joinRequests: [],
        blockedUsers: [],
        groupOwner: user?.uid,
        createdBy: user?.uid,
        createdAt: serverTimestamp(),
        isPrivate,
      };
      await setDoc(groupRef, groupData);

      joinGroup(groupRef.id);
      setGroupID(groupRef.id);
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
    isAdmin: boolean
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
      setQaPostID(qaRef.id);
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
        isHelpful: false,
        helpfulCount: 0,
        helpfulUsers: [],
      };
      await setDoc(responseRef, resposeData);

      // Get the original post to check if the sender is the original poster
      const parentPostRef = firestoreDoc(
        db,
        "groups",
        groupId.toString(),
        "qa",
        postId.toString()
      );
      const parentPostDoc = await getDoc(parentPostRef);

      if (parentPostDoc.exists()) {
        const parentPostData = parentPostDoc.data();
        const originalPosterId = parentPostData.sentBy;

        // Only add to responseFrom array if the sender is NOT the original poster
        if (sentBy !== originalPosterId) {
          await updateDoc(parentPostRef, {
            responseFrom: arrayUnion(user.uid),
          });
        }
      }
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
    type = "message",
    parentMessageId,
    userInformation: userInfoParam,
  }: SendMessageParams) => {
    try {
      setMessageSent(false);
      let messageRef;

      if (type === "response" && parentMessageId) {
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
        messageRef = firestoreDoc(
          collection(db, "groups", groupId.toString(), "messages")
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
        userName: userInfo?.userName || "",
        purpose: userInfo?.purpose || "",
        type,
        ...(parentMessageId && { parentMessageId }),
        ...(type === "response" && {
          isHelpful: false,
          helpfulCount: 0,
          helpfulUsers: [],
        }),
      };

      await setDoc(messageRef, messageData);
      setMessageSent(true);
      return { success: true, messageId: messageRef.id };
    } catch (error) {
      console.error("An error occurred when sending message: ", error);
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
    type: "message" | "question" | "response" = "message",
    parentMessageId?: string
  ) => {
    if (!userInformation) {
      return { success: false, error: "User information not available" };
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
    parentMessageId: string
  ) => {
    if (!userInformation) {
      return { success: false, error: "User information not available" };
    }

    return sendUnifiedMessage({
      message,
      isAdmin,
      isMod,
      sentBy,
      timeSent,
      groupId,
      type: "response",
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
        "groups",
        groupId,
        "messages",
        messageId,
        "responses",
        responseId
      );

      await updateDoc(responseRef, {
        isHelpful: true,
        helpfulCount: arrayUnion(1), // Increment helpful count
      });
      return { success: true };
    } catch (error) {
      console.error("Error marking response as helpful:", error);
      return { success: false, error };
    }
  };

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

  // Real-time listener for all groups to detect new group creation
  const fetchAllGroups = async () => {
    if (!user) return;

    try {
      const groupsCollection = collection(db, "groups");

      // Use real-time listener instead of one-time fetch
      const unsubscribe = onSnapshot(
        groupsCollection,
        (snapshot) => {
          const allGroupsData: Group[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            if (data) {
              const groupData = { ...data, id: doc.id } as Group;
              allGroupsData.push(groupData);
            }
          });
          setAllGroups(allGroupsData);
        },
        (error) => {
          console.error("Error listening to all groups updates:", error);
        }
      );

      // Store unsubscribe function for cleanup (you can add cleanup logic if needed)
      // For now, we'll let it run indefinitely as it's a real-time listener
    } catch (error) {
      console.error("Error fetching all groups:", error);
    }
  };

  // Fetch all groups when user changes
  useEffect(() => {
    if (user) {
      fetchAllGroups();
    }
  }, [user]);

  // get and save the user information locally with real-time updates
  const getCurrentUserInfo = async () => {
    if (!user) return;

    try {
      const userRef = firestoreDoc(db, "users", user.uid);

      // Use real-time listener instead of one-time fetch
      const unsubscribe = onSnapshot(
        userRef,
        (doc) => {
          if (doc.exists()) {
            const data = doc.data();
            const savedData = {
              userName: data.userName,
              profilePicture: data.profileImage,
              purpose: data.purpose,
              level: data.level,
              joinedGroups: data.joinedGroups,
              canExplainToPeople: data.canExplainToPeople,
              userID: user.uid,
              bio: data.bio || "",
              profileComplete: data.profileComplete
            } satisfies UserInfo;
            setUserInformation(savedData);
          }
          unsubscribe();
        },
        (error) => {
          console.error("Error listening to user data updates:", error);
        }
      );
    } catch (error) {
      console.error("Unable to fetch user data", error);
    }
  };

  /**
   * Fetch all resources from all groups the user is a member of
   */
  const getAllUserResources = async (userId: string | undefined) => {
    if (!user) return [];
    try {
      // Get all groups the user is a member of
      const groupsSnapshot = await getDocs(collection(db, "groups"));
      const userGroups = groupsSnapshot.docs.filter((doc) => {
        const data = doc.data();
        return data.members && data.members.includes(userId);
      });
      let allResources: any[] = [];
      for (const groupDoc of userGroups) {
        const groupId = groupDoc.id;
        const groupName = groupDoc.data().name;
        const resourcesSnapshot = await getDocs(
          collection(db, "groups", groupId, "resources")
        );
        const groupResources = resourcesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          groupName,
          groupId,
        }));
        allResources.push(...groupResources);
      }
      // Sort by uploadedAt descending
      allResources.sort(
        (a, b) => b.uploadedAt?.seconds - a.uploadedAt?.seconds
      );
      return allResources;
    } catch (error) {
      console.error("Error fetching user resources:", error);
      return [];
    }
  };

  // Utility to set onboardingCompleted for a user in a group
  const setGroupOnboardingCompleted = async (
    userId: string,
    groupId: string
  ) => {
    const membershipRef = firestoreDoc(db, "users", userId, "groups", groupId);
    await setDoc(membershipRef, { onboardingCompleted: true }, { merge: true });
  };

  // Utility to check onboardingCompleted for a user in a group
  const checkGroupOnboardingCompleted = async (
    userId: string,
    groupId: string
  ) => {
    const membershipRef = firestoreDoc(db, "users", userId, "groups", groupId);
    const docSnap = await getDoc(membershipRef);
    return docSnap.exists() && docSnap.data().onboardingCompleted === true;
  };

  // deleting onboardingCompletedFlag if user exits group
  const deleteOnboardingCompleted = async (
    userId: string,
    groupId: string,
  ) => {
    console.log("UserId ", userId)
    console.log("GroupId ", groupId)
    const userRef = firestoreDoc(db, "users", userId, "groups", groupId);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      await deleteDoc(userRef);
    }
  }

  /**
   * Save a resource to the group's resources subcollection in Firestore
   */
  const saveGroupResource = async ({
    groupId,
    name,
    url,
    type,
    uploadedBy,
    uploadedByUserName,
    uploadedAt,
    fileSize,
  }: {
    groupId: string;
    name: string;
    url: string;
    type: string;
    uploadedBy: string;
    uploadedByUserName: string;
    uploadedAt: Timestamp;
    fileSize?: number;
  }) => {
    try {
      await addDoc(collection(db, "groups", groupId, "resources"), {
        name,
        url,
        type,
        uploadedBy,
        uploadedByUserName,
        uploadedAt,
        fileSize: fileSize || 0,
        groupId,
      });
      Toast.show({ type: "success", text1: "Resource uploaded!" });
    } catch (error) {
      console.error("Error saving resource:", error);
      Toast.show({ type: "error", text1: "Failed to save resource." });
    }
  };

  const updateCallParticipants = async (
    callDocId: string,
    userId: string,
    joining: boolean
  ) => {
    try {
      const call = activeCalls.find((call) => call.id === callDocId);

      if (!call) {
        return;
      }
      let updatedParticipants: string[] = [];
      if (joining) {
        // Only add if not already present
        updatedParticipants = call.participants.includes(userId)
          ? call.participants
          : [...call.participants, userId];
      } else {
        // Remove user if present
        updatedParticipants = call.participants.filter((id) => id !== userId);
      }

      const callRef = firestoreDoc(db, "activeCalls", callDocId);
      await updateDoc(callRef, {
        participants: updatedParticipants,
      });

      // If no participants left, delete the call document
      if (!joining && updatedParticipants.length === 0) {
        await deleteDoc(callRef);
      }
    } catch (error) {
      console.error("Error updating call participants:", error);
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
        allGroups, // Add allGroups to the context value
        fetchAllGroups, // Add fetchAllGroups to the context value
        demoteModerator,
        rejectJoinRequest,
        approveJoinRequest,
        removeMember,
        promoteToAdmin,
        promoteToModerator,
        transferOwnership,
        blockMember,
        unblockMember,
        sendJoinRequest,
        getUserInformation,
        groupID,
        setGroupCreated,
        isJoining,
        isSendingJoinRequest,
        getCurrentUserInfo, // <-- add this
        setGroupOnboardingCompleted,
        checkGroupOnboardingCompleted,
        saveGroupResource,
        getAllUserResources,
        activeCalls,
        updateCallParticipants,
        deleteOnboardingCompleted,
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
