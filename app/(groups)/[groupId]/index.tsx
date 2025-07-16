import Back from "@/assets/icons/Arrow_left.svg";
import Chat from "@/assets/icons/chat.svg";
import QApostCard from "@/components/QApostCard";
import { db } from "@/services/firebase";
import { useGroupContext } from "@/store/GroupContext";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { collection, onSnapshot, Timestamp } from "firebase/firestore";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { FAB, Portal, Provider } from "react-native-paper";

export type QaPost = {
  id: string;
  message: string;
  timeSent: Timestamp;
  responseFrom: [];
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

export let id = "";

function GroupQA() {
  const { groupId, groupName } = useLocalSearchParams();
  const { user } = useGroupContext();
  const [posts, setPosts] = useState<QaPost[]>([]);
  const [open, setOpen] = useState(false);
  const [messagesById, setMessagesById] = useState<Record<string, QaPost>>({});
  const [localGroupName, setLocalGroupName] = useState("");

  const router = useRouter();
  console.log("GroupId: ", groupId);

  useEffect(() => {
    const interval = setInterval(() => {
      id = groupId.toString();
    }, 1000);
    return () => clearInterval(interval);
  }, [groupId]);

  // first fetch locally
  useEffect(() => {
    const localData = async () => {
      try {
        const cachedQaGroups = await AsyncStorage.getItem(id);
        if (cachedQaGroups) {
          setPosts(JSON.parse(cachedQaGroups));
        } else {
          // No cached data available
        }
      } catch (error) {
        console.error("Error fetching local data:", error);
      }
    };

    const localMessages = async () => {
      try {
        const cachedLocalData = await AsyncStorage.getItem(`local-${groupId}`);
        if (cachedLocalData) {
          setMessagesById(JSON.parse(cachedLocalData));
          console.log("fecthed with: ", groupId);
          console.log("Group Data: ", JSON.parse(cachedLocalData))
        } else {
          // No cached messages available
        }
      } catch (error) {
        console.error("There has been an error in fetching messages: ", error);
      }
    };

    const fetchGroupName = async () => {
      try {
        const cachedGroupName = await AsyncStorage.getItem("groupName");
        if (cachedGroupName) {
          setLocalGroupName(cachedGroupName);
        } else {
          // No cached group name available
        }
      } catch (error) {
        console.error("Error fetching group name: ", error);
      }
    };
    fetchGroupName();
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
    if (!groupName) return;

    const saveGroupName = async () => {
      try {
        await AsyncStorage.setItem("groupName", groupName.toString()); // change this logic with time
      } catch (error) {
        console.error("Unable to save group name", error);
      }
    };
    saveGroupName();
  }, [posts, groupName]);

  useEffect(() => {
    if (!groupId) return;

    const saveGroupID = async () => {
      try {
        await AsyncStorage.setItem("groupID", groupId.toString());
      } catch (error) {
        console.error("Unable to save group ID", error);
      }
    };
    saveGroupID();
  }, [groupId]);

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
      console.error("Unable to save messages", error);
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

  // sort posts by time
  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => {
      const timeA = a.timeSent?.toDate?.()?.getTime() || 0;
      const timeB = b.timeSent?.toDate?.()?.getTime() || 0;
      return timeB - timeA;
    });
  }, [posts]);

  const renderPosts = useCallback(
    ({ item }: { item: QaPost }) => (
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
    [groupId]
  );

  return (
    <Provider>
      <Portal>
        <FAB.Group
          open={open}
          visible={true}
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
              // FAB closed
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

            <Text className="absolute left-1/2 -translate-x-1/2 text-2xl font-bold">
              {/* Group Name issue */}
              {!groupName ? localGroupName : groupName}
            </Text>

            <TouchableOpacity
              onPress={() =>
                router.push(`/(settings)/(group_settings)/${groupId}`)
              }
            >
              <Ionicons name="settings-outline" size={30} />
            </TouchableOpacity>
          </View>

          {/* Page Name */}
          <View className="mx-5 mt-10">
            <Text className="font-inter font-bold text-xl text-primary">
              Q&A Board
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            {sortedPosts.length > 0 ? (
              <FlatList
                data={sortedPosts}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderPosts}
                contentContainerStyle={{ paddingBottom: 120 }}
              />
            ) : (
              <View className="flex-1 items-center justify-center">
                <Text className="font-poppins text-gray-500 ">
                  No Posts Yet.
                </Text>

                <TouchableOpacity
                onPress={() => router.push("/call")}
                >
                  <Text>Navigate to Call</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Portal>
    </Provider>
  );
}

export default GroupQA;
