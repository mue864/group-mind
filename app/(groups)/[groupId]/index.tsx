import {Text, View, StatusBar, TouchableOpacity} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import {db} from "@/services/firebase"
import { collection, onSnapshot, orderBy, query, Timestamp } from 'firebase/firestore';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useGroupContext } from '@/store/GroupContext';
import Back from "@/assets/icons/Arrow_left.svg";
import AsyncStorage from '@react-native-async-storage/async-storage';
import QApostCard from "@/components/QApostCard";
import { FlatList } from 'react-native-gesture-handler';
import { FAB, Provider, Portal } from 'react-native-paper';
import Chat from "@/assets/icons/chat.svg";
export type QaPost = {
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
    const [posts, setPosts] = useState<QaPost[]>([]);
    const [open, setOpen] = useState(false);

    const router = useRouter();
    
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
    }, [groupId]);

    // save groupName locally
    useEffect(() => {
      if (posts.length === 0) return
      const saveGroupName = async () => {
       try {
        await AsyncStorage.setItem("groupName", posts[0].groupName);
       } catch(error) {
        console.error("Unable to save group name", error)
       }
      }
      saveGroupName();
    }, [posts])
    
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
              timeSent: data.sentAt,
              responseFrom: data.responseFrom,
              responseTo: data.responseTo,
              isAnswered: data.isAnswered,
              type: data.type,
              sentBy: data.sentBy,
              groupName: data.groupName,
            } satisfies QaPost;
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

    const saveData = async (groupId: string, postData: QaPost[]) => {
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
    <Provider>
      <Portal>
      <FAB.Group
      open={open}
      icon={open ? 'close' : () => <Chat width={25} height={25} />}
      color='#fff'
      label="Post Question"
      onStateChange={({open}) => setOpen(open) }
      actions={[
        {
          icon: "plus",
          label: "Post Question",
          onPress: () => {
            router.push(`/(create_post)/${groupId}`)
          }
        }
      ]}
      onPress={() => {
        if (!open) {
          setOpen(true)
        } else {
          console.log("Pressed")
        }
      }}  
      style={{position: 'absolute', bottom: 80, right: 3, zIndex: 9999, elevation: 5}}
      fabStyle={{backgroundColor: "#4169E1"}}
      />


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
          <View className="mx-5 mt-10">
            <Text className="font-inter font-bold text-xl text-primary">
              Q&A Board
            </Text>
          </View>

          <View>
            <FlatList
              data={posts}
              keyExtractor={(item) => item.toString()}
              renderItem={renderPosts}
            />
          </View>
        </View>
      </Portal>
    </Provider>
  );
}

export default GroupQA