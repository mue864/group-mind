import { auth, db } from "@/services/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";
import type { Group } from "./GroupContext";

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName?: string;
  timeSent: Timestamp;
}

type MessagesByGroup = {
  [groupId: string]: Message[];
};

interface MessagesContextType {
  messagesByGroup: MessagesByGroup;
  sendMessage: (groupId: string, text: string) => Promise<void>;
}

const MessagesContext = createContext<MessagesContextType | undefined>(
  undefined
);

export const MessagesProvider = ({
  groups = [],
  loading,
  children,
}: {
  groups?: Group[];
  loading: boolean;
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [messagesByGroup, setMessagesByGroup] = useState<MessagesByGroup>({});

  useEffect(() => {
    const subscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      }
    });
    return () => subscribe();
  }, []);

  useEffect(() => {

    if (loading) {
      const interval = setInterval(() => {

      }, 1000);
      return () => clearInterval(interval);
    }
    if (!groups || groups.length === 0) return;

    const unsubscribes = groups.filter((group => !!group.id)).map(group => {
      const groupRef = collection(db, "groups", group.id, "messages");
      const q = query(groupRef, orderBy("timeSent", "asc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const messages = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Message[];
        setMessagesByGroup((prev) => ({
          ...prev,
          [group.id]: messages,
        }));
        
      });
      return unsubscribe;
    });
    return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
  }, [groups]);

  const sendMessage = async (groupId: string, text: string) => {
    if (!user) return;
    const messageRef = collection(db, "groups", groupId, "messages");
    await addDoc(messageRef, {
      text,
      senderId: user.uid,
      timeSent: serverTimestamp(),
    });
  };

  return (
    <MessagesContext.Provider value={{ messagesByGroup, sendMessage }}>
      {children}
    </MessagesContext.Provider>
  );
};

export const useMessages = () => {
  const context = useContext(MessagesContext);
  if (!context) {
    throw new Error("useMessages must be used within a MessagesProvider");
  }
  return context;
};
