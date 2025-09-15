import {createContext, useEffect, useState, useContext, useRef, useCallback} from "react";
import { db, auth } from "../services/firebase";
import { collection, onSnapshot, Timestamp, orderBy, query, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import {User, onAuthStateChanged} from "firebase/auth"
import type {Group} from "./GroupContext"
import { fastAIDetector } from "@/utils/aiDetector";

export interface Post {
    id: string,
    userId: string,
    post: string,
    timeSent: Timestamp,
    groupId: string,
    userAvatar?: string,
    aiScore?: number,
    aiWarning?: 'none' | 'likely' | 'detected',
}
interface PostByGroup {
    [groupId: string]: Post[];
}
interface PostContextType {
    posts: Post[];
    postByGroup: PostByGroup
    user: User | null;
    sendPost: (groudId: string, text:string) => Promise<void>;
    getGroupNameFromId: (groupId: string) => Promise<string | undefined>;
}

 const PostContext = createContext<PostContextType | undefined>(undefined);

export const PostProvider = ({children, loading, groups: initialGroups}: {children: React.ReactNode, loading: boolean, groups: Group[]}) => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [postByGroup, setPostByGroup] = useState<PostByGroup>({});
    const [groups, setGroups] = useState<Group[]>([]);
    const groupsRef = useRef<Group[]>([]);
    
    // Update groups ref and state when initialGroups changes
    useEffect(() => {
        if (initialGroups && initialGroups.length > 0) {
            groupsRef.current = [...initialGroups];
            setGroups(initialGroups);
        }
    }, [initialGroups]);

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

        if (!groups || groups.length === 0) return; // defensive measures
        
        const unsubscribes = groups
            .filter((group) => !!group.id)
            .map((group) => {
                const groupRef = collection(db, "groups", group.id, "posts");
                const q = query(groupRef, orderBy("timeSent", "desc"));

                const unsubscribe = onSnapshot(q, (snapshot) => {
                    const posts = snapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    })) as Post[];
                    
                    setPosts(prevPosts => {
                        // Only update if posts have actually changed
                        if (JSON.stringify(prevPosts) !== JSON.stringify(posts)) {
                            return posts;
                        }
                        return prevPosts;
                    });
                    
                    setPostByGroup((prev) => ({
                        ...prev,
                        [group.id]: posts
                    }));
                });
                
                return unsubscribe;
            });
            
        return () => {
            unsubscribes.forEach(unsubscribe => unsubscribe && unsubscribe());
        };
    }, [loading, groups]);

    const getGroupNameFromId = useCallback(async (groupId: string): Promise<string> => {
        try {
            // First check in the ref (most up-to-date)
            const cachedGroup = groupsRef.current.find(g => g.id === groupId);
            if (cachedGroup) return cachedGroup.name;
            
            // Then check in state (might be stale)
            const stateGroup = groups.find(g => g.id === groupId);
            if (stateGroup) {
                // Update ref if found in state but not in ref
                if (!groupsRef.current.some(g => g.id === groupId)) {
                    groupsRef.current = [...groupsRef.current, stateGroup];
                }
                return stateGroup.name;
            }
            
            // If not found locally, fetch from Firestore
            const groupDoc = await getDoc(doc(db, 'groups', groupId));
            if (groupDoc.exists()) {
                const groupData = { 
                    id: groupDoc.id, 
                    ...groupDoc.data() 
                } as Group;
                
                // Update both ref and state
                groupsRef.current = [...groupsRef.current, groupData];
                setGroups(prev => {
                    // Avoid duplicates
                    if (!prev.some(g => g.id === groupId)) {
                        return [...prev, groupData];
                    }
                    return prev;
                });
                
                return groupData.name;
            }
            
            return 'Unknown Group';
        } catch (error) {
            console.error('Error getting group name:', error);
            return 'Loading...';
        }
    }, [groups]);

    const sendPost = async (groupId: string, text: string) => {
        const groupRef = collection(db, "groups", groupId, "posts");
        if (!user) return;
        
        // AI Detection
        const aiScore = fastAIDetector(text);
        const aiWarning = aiScore >= 0.6 ? 'detected' : aiScore >= 0.55 ? 'likely' : 'none';
        
        await addDoc(groupRef, {
            text,
            sender: user.uid,
            timeSent: serverTimestamp(),
            aiScore,
            aiWarning,
        })
    }
    return (
      <PostContext.Provider
        value={{ posts, user, sendPost, getGroupNameFromId, postByGroup}}
      >
        {children}
      </PostContext.Provider>
    );
}

export const usePostContext = () => {
    const context = useContext(PostContext);
    if (!context) {
        throw new Error("usePostContext must be used within a PostContextProvider");
    }
    return context;
}

 
export default PostContext;