import Group from "@/assets/icons/groupUsers.svg";
import Clock from "@/assets/icons/time_blue.svg";
import avatars from "@/assets/images/avatars";
import { db } from "@/services/firebase";
import { Timestamp, doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface PostCardProps {
    post: string;   
    groupId: string;  
    timeSent?: Timestamp | null;
    userName?: string;
    userAvatar?: string;
}

interface Avatar {
    avatar1: string;
    avatar2: string;
    avatar3: string;
    avatar4: string;
    avatar5: string;
    avatar6: string;
    avatar7: string;
    avatar8: string;
    avatar9: string;
}


const PostCard = ({post, groupId, timeSent, userName, userAvatar}: PostCardProps) => {
    const [groupName, setGroupName] = useState<string>('Loading...');
    
    useEffect(() => {
        const fetchGroupName = async () => {
            if (!groupId) {
                setGroupName('Unknown Group');
                return;
            }
            
            try {
                const groupDoc = await getDoc(doc(db, 'groups', groupId));
                if (groupDoc.exists()) {
                    setGroupName(groupDoc.data().name || 'Unnamed Group');
                } else {
                    setGroupName('Unknown Group');
                }
            } catch (error) {
                console.error('Error fetching group name:', error);
                setGroupName('Error loading group');
            }
        };
        
        fetchGroupName();
    }, [groupId]);

    const rawTime = timeSent?.toDate().toTimeString().split(" ")[0];
    const rawDate = timeSent?.toDate().toDateString();
    const date = rawDate?.slice(4, 10)
    const time = rawTime?.slice(0, 5);

    console.log(post.length)

    return (
      <View className="rounded-2xl">
        <View className="flex flex-row gap-3 bg-primary items-center justify-around rounded-tl-2xl rounded-tr-2xl">
          <Group width={40} height={40} />
          <Text className="font-inter text-background font-bold text-xl">
            {groupName}
          </Text>
        </View>
        <View
          className={` ${post.length < 50 ? 'h-[150px]' : 'h-[200px]'} flex bg-background rounded-br-2xl rounded-bl-2xl`}
          style={{ elevation: 4 }}
        >
          <View className="flex flex-col mt-3 mx-6 mb-7">
            <View className="flex flex-row items-center gap-2">
            <View 
            style={{elevation: 8}}
            >
            <Image
              source={userAvatar ? avatars[userAvatar as keyof Avatar] : avatars.avatar1}
              className="w-10 h-10 rounded-full"
              onError={(e) => console.log('Failed to load avatar:', e.nativeEvent.error)}
            />
            </View>
            <View className="items-center justify-center h-10">
            <Text className="font-inter text-lg">{userName || 'Anonymous'}</Text>
            </View>
            </View>
           <View className="">
           <Text className="font-inter mt-5"> {post.length < 80 ? post : '"' + post.slice(0, 80) + '...' + '"'}</Text>
           <TouchableOpacity>
           <Text className="font-inter font-semibold text-primary mt-1"> {post.length > 80 ? "Read More" : ""}</Text>
           </TouchableOpacity>
           </View>
          </View>
          <View className="flex flex-row justify-end mx-6 items-center">
            <Clock width={25} height={25} />
            <Text className="font-inter">
              {date}, {time}
            </Text>
          </View>
        </View>
      </View>
    );
}
 
export default PostCard;