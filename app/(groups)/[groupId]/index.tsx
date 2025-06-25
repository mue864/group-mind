import Back from "@/assets/icons/Arrow_left.svg";
import Chat from "@/assets/icons/chat.svg";
import QApostCard from "@/components/QApostCard";
import { db } from "@/services/firebase";
import { useGroupContext } from "@/store/GroupContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { collection, onSnapshot, Timestamp } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { FAB, Portal, Provider } from "react-native-paper";

export type QaPost = {
  id: string;
  message: string;
  timeSent: Timestamp;
  responseFrom?: [];
  responseTo: [];
  isAnswered?: boolean;
  type: string;
  sentBy: string;
  groupName: string;
  isAdmin: boolean;
  isMod: boolean;
  imageUrl: string | undefined;
  purpose: string;
  userName: string;
};

function GroupQA() {
  const { groupId } = useLocalSearchParams();
  const { user } = useGroupContext();
  const [posts, setPosts] = useState<QaPost[]>([]);
  const [open, setOpen] = useState(false);
  const [messagesById, setMessagesById] = useState<Record<string, QaPost>>({});

  const router = useRouter();

  // first fetch locally
  useEffect(() => {
    const localData = async () => {
      const id = groupId.toString();
      try {
        const cachedQaGroups = await AsyncStorage.getItem(id);
        if (cachedQaGroups) {
          setPosts(JSON.parse(cachedQaGroups));
        } else {
          console.log("no data");
        }
      } catch (error) {
        console.error("Error fetching local data:", error);
      }
    };

    const localMessages = async () => {
      try {
        const cachedLocalData = await AsyncStorage.getItem(`local-${groupId}`);

        if (cachedLocalData) {
          console.log("cached messages: ", JSON.parse(cachedLocalData));
          setMessagesById(JSON.parse(cachedLocalData));
        } else {
          console.log("Unable to fetch data");
        }
      } catch (error) {
        console.error("There has been an error in fetching messages: ", error);
      }
    };
    localData();
    localMessages();
  }, [groupId]);

  useEffect(() => {
    if (!user || !groupId) return;

    const unsubscribe = onSnapshot(
      collection(db, "groups", groupId.toString(), "qa"),
      (snapshot) => {
        const onlineData = snapshot.docs.map((doc) => {
          const data = doc.data();

          const messageMap = snapshot.docs.reduce((acc, doc) => {
            const data = doc.data();
            const id = doc.id;

            acc[id] = {
              id,
              message: data.message,
              timeSent: data.timeSent,
              responseFrom: data.responseFrom,
              responseTo: data.responseTo,
              isAnswered: data.isAnswered,
              type: data.type,
              sentBy: data.sentBy,
              groupName: data.groupName,
              imageUrl: data.imageUrl,
              isAdmin: data.isAdmin,
              isMod: data.isMod,
              purpose: data.purpose,
              userName: data.userName,
            } satisfies QaPost;

            return acc;
          }, {} as Record<string, QaPost>);
          // this is useful for text messages in posts as I will be able to just do an ID lookup easily
          compareLocalMessages(messagesById, messageMap);

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
            imageUrl: data.imageUrl,
            isAdmin: data.isAdmin,
            isMod: data.isMod,
            purpose: data.purpose,
            userName: data.userName,
          } satisfies QaPost;
        });
        compareData(posts, onlineData);
      },
      (error) => {
        console.error("Error fetching QA posts:", error);
      }
    );
    return () => unsubscribe();
  }, [groupId, user]);

  // save groupName locally
  useEffect(() => {
    if (posts.length === 0) return;
    const saveGroupName = async () => {
      try {
        await AsyncStorage.setItem("groupName", posts[0].groupName); // change this logic with time
      } catch (error) {
        console.error("Unable to save group name", error);
      }
    };
    saveGroupName();
  }, [posts]);

  // const local and cloud data comparison
  function compareData(localData: QaPost[], cloudData: QaPost[]) {
    if (localData.length !== cloudData.length) {
      // if not match then get the cloud data for rerender
      setPosts(cloudData);

      // Also make a copy of local
      // local save
      localSaveData(groupId.toString(), cloudData);
    }
  }

  const compareLocalMessages = (
    localMessages: Record<string, QaPost>,
    onlineMessages: Record<string, QaPost>
  ) => {
    const localKeysLength = Object.keys(localMessages);
    const onlineKeysLength = Object.keys(onlineMessages);

    if (localKeysLength !== onlineKeysLength) {
      console.log("in here");
      setMessagesById(onlineMessages);
      saveLocalMessagesById(onlineMessages);
    }
  };
  // cache messagesByID data
  const saveLocalMessagesById = async (
    onlineMessages: Record<string, QaPost>
  ) => {
    try {
      await AsyncStorage.setItem(
        `local-${groupId}`,
        JSON.stringify(onlineMessages)
      );
    } catch (error) {
      console.log("Unable to save messages", error);
    }
  };

  // caching post data
  const localSaveData = async (groupId: string, postData: QaPost[]) => {
    try {
      await AsyncStorage.setItem(groupId, JSON.stringify(postData));
    } catch (error) {
      console.error("Failed to sace groupData ", error);
    }
  };

  const renderPosts = useCallback(
    ({ item }) => (
      <View>
        <QApostCard
          post={item.message}
          timeSent={item.timeSent}
          responseTo={item.responseTo}
          responseFrom={item.responseFrom}
          postID={item.id}
          groupID={groupId}
        />
      </View>
    ),
    []
  );

  return (
    <Provider>
      <Portal>
        <FAB.Group
          open={open}
          icon={open ? "close" : () => <Chat width={25} height={25} />}
          color="#fff"
          label="Post Question"
          onStateChange={({ open }) => setOpen(open)}
          actions={[
            {
              icon: "plus",
              label: "Post Question",
              onPress: () => {
                router.push(`/(create_post)/${groupId}`);
              },
            },
          ]}
          onPress={() => {
            if (!open) {
              setOpen(true);
            } else {
              console.log("Pressed");
            }
          }}
          style={{
            position: "absolute",
            bottom: 80,
            right: 3,
            zIndex: 9999,
            elevation: 5,
          }}
          fabStyle={{ backgroundColor: "#4169E1" }}
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
                {/* Group Name issue */}
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

          <View style={{ flex: 1 }}>
            <FlatList
              data={posts}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderPosts}
              contentContainerStyle={{ paddingBottom: 120 }}
            />
          </View>
        </View>
      </Portal>
    </Provider>
  );
}

export default GroupQA;
