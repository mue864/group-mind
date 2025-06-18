import {Text, View, StatusBar, TouchableOpacity} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import {db} from "@/services/firebase"
import { collection, onSnapshot, orderBy, query, Timestamp } from 'firebase/firestore';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useGroupContext } from '@/store/GroupContext';
import Back from "@/assets/icons/Arrow_left.svg";
import AsyncStorage from '@react-native-async-storage/async-storage';
import QApostCard from "@/components/QApostCard";
import { FlatList } from 'react-native-gesture-handler';
type Post = {
  id: string;
  message: string;
  timeSent: Timestamp; // or Timestamp if you're importing from firebase
  responseFrom?: [];
  responseTo: [];
  isAnswered?: boolean;
  type: string;
  sentBy: string;
  groupName: string;
};



function GroupQA() {
    const {groupId} = useLocalSearchParams();
    const {user} = useGroupContext();
    const [posts, setPosts] = useState<Post[]>([])
    
    // first fetch locally
    useEffect(() => {
      const localData = async () => {
        try {
          const cached = await AsyncStorage.getItem(`${groupId}`);

          if (cached) {
            setPosts(JSON.parse(cached));
          } else {
            console.log("no data")
          }
        } catch(error) {
          console.error("Error fetching local data:" , error)
        }
      }
      localData();
    }, [groupId])
    
    
    
    useEffect(() => {
      if (!user || !groupId) return;

      const unsubscribe = onSnapshot(
        collection(db, "groups", groupId.toString(), "qa"),
        (snapshot) => {
          const posts = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              message: data.message,
              timeSent: data.timeSent,
              responseFrom: data.responseFrom,
              responseTo: data.responseTo,
              isAnswered: data.isAnswered,
              type: data.type,
              sentBy: data.sentBy,
              groupName: data.groupName,
            } satisfies Post;
          });

          setPosts(posts);
          saveData(groupId.toString(), posts)
        },
        (error) => {
          console.error("Error fetching QA posts:", error);
        }
      );
      return () => unsubscribe(); 
    }, [groupId, user]);

    const saveData = async (groupId: string, postData: Post[]) => {
      try {
       await AsyncStorage.setItem(groupId, JSON.stringify(postData));
      
      } catch (error) {
        console.error("Failed to sace groupData ", error)
      }
    }

   const renderPosts = useCallback(({item}) => (
     <View>
       <QApostCard
        post={item.message}
        timeSent={item.timeSent}
        responseTo={item.responseTo}
        responseFrom={item.responseFrom}
       />
     </View>
   ), [])

   console.log(posts)

  return (
    <View className="bg-background flex-1">
      <View className="flex flex-row items-center justify-between mx-4 mt-4 relative">
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.push("/groups")}
          activeOpacity={0.7}
        >
          <Back />
        </TouchableOpacity>

        {/* Group Name (centered absolutely) */}
        {posts.length !== 0 && (
          <Text className="absolute left-1/2 -translate-x-1/2 text-2xl font-bold">
            {posts[0].groupName}
          </Text>
        )}
      </View>

      {/* Page Name */}
      <View className='mx-5 mt-10'>
        <Text className='font-inter font-bold text-xl text-primary'>Q&A Board</Text>
      </View>
      
      <View>
        <FlatList 
        data={posts}
        keyExtractor={(key, item) => item.toString()}
        renderItem={renderPosts}
        />
      </View>
    </View>
  );
}

export default GroupQA