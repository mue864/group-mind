import {createContext, useEffect, useState, useContext} from "react";
import { db, auth } from "../services/firebase";
import { collection, onSnapshot, Timestamp, orderBy, query, addDoc, serverTimestamp } from "firebase/firestore";
import {User, onAuthStateChanged} from "firebase/auth"
import type {Group} from "./GroupContext"

export interface Post {
    id: string,
    sender: string,
    post: string,
    timeSent: Timestamp,
    groupId: string
}
interface PostByGroup {
    [groupId: string]: Post[];
}
interface PostContextType {
    posts: Post[],
    user: User | null;
    sendPost: (groudId: string, text:string) => Promise<void>;
    getGroupNameFromId: (groupId: string) => Promise<string | undefined>;
}

 const PostContext = createContext<PostContextType | undefined>(undefined);

export const PostProvider = ({children, loading, groups}: {children: React.ReactNode, loading: boolean, groups: Group[]}) => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [postByGroup, setPostByGroup] = useState<PostByGroup>({});

    useEffect(() => {
        const subscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
            }
        });
        return () => subscribe();
    }, []);

    useEffect (() => {
        if(loading) {
            const interval = setInterval(() => {
                console.log("loading data")
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
            setPosts(posts);
            setPostByGroup((prev) => ({
                ...prev,
                [group.id]: posts,
            }))
          });
          return unsubscribe;
        });
      return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
      
    }, [loading, groups]);

    const getGroupNameFromId = async (groupId: string) => {
        const group = groups.find((group) => group.id === groupId);
        return group?.name;
    }

    const sendPost = async (groupId: string, text: string) => {
        const groupRef = collection(db, "groups", groupId, "posts");
        if (!user) return;
        await addDoc(groupRef, {
            text,
            sender: user.uid,
            timeSent: serverTimestamp(),
        })
    }


    


    return ( 
        <PostContext.Provider value={{posts, user, sendPost, getGroupNameFromId}}>
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