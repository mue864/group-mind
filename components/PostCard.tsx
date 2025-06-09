import {View, Text} from "react-native";
import Group from "@/assets/icons/groupUsers.svg";
import { Timestamp } from "firebase/firestore";
import Clock from "@/assets/icons/time_blue.svg";

interface PostCardProps {
    post: string,   
    groupName: string,
    timeSent?: Timestamp | null,
}

const PostCard = ({post, groupName, timeSent}: PostCardProps) => {

    const rawTime = timeSent?.toDate().toTimeString().split(" ")[0];
    const rawDate = timeSent?.toDate().toDateString();
    const date = rawDate?.slice(4, 10)
    const time = rawTime?.slice(0, 5);

    return (
      <View className="bg-red-500 rounded-2xl">
        <View className="flex flex-row gap-3 bg-primary items-center justify-around rounded-tl-2xl rounded-tr-2xl">
          <Group width={40} height={40} />
          <Text className="font-inter text-background font-bold text-xl">
            {groupName}
          </Text>
        </View>
        <View
          className="h-40 flex bg-background rounded-br-2xl rounded-bl-2xl"
          style={{ elevation: 4 }}
        >
          <View className="flex flex-col mt-6 mx-6 mb-7">
            <Text className="mb-5 font-inter">Name</Text>
            <Text className="font-inter"> &quot;{post}&quot;</Text>
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