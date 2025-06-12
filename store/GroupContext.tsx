import { auth, db } from "@/services/firebase";
import { User, onAuthStateChanged } from "firebase/auth";
import {
  arrayRemove,
  arrayUnion,
  doc as firestoreDoc,
  getDoc,
  onSnapshot,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import React, { createContext, useContext, useEffect, useState } from "react";

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

interface GroupContextType {
  groups: Group[];
  loading: boolean;
  error: string | null;
  joinGroup: (groupId: string) => Promise<void>;
  leaveGroup: (groupId: string) => Promise<void>;
  refreshGroups: () => Promise<void>;
}

const GroupContext = createContext<GroupContextType | undefined>(undefined);

export const GroupProvider = ({ children }: { children: React.ReactNode }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [groupName, setGroupName] = useState<string[]>([]);

 useEffect (() => {
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
              setGroups(validGroups);
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

  return (
    <GroupContext.Provider
      value={{
        groups,
        loading,
        error,
        joinGroup,
        leaveGroup,
        refreshGroups,
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
