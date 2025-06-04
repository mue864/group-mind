import {View, Text} from "react-native";
import Group from "@/assets/icons/groupUsers.svg";

interface PostCardProps {
    post: string,   
    groupName: string
}

const PostCard = ({post, groupName}: PostCardProps) => {
    return ( 
        <View className="bg-red-500 rounded-2xl">
            <View className="flex flex-row gap-3 bg-primary items-center justify-around rounded-tl-2xl rounded-tr-2xl">
                <Group width={40} height={40} />
                <Text className="font-inter text-background font-bold text-xl">{groupName}</Text>
            </View>
            <View>
                <Text>{post}</Text>
            </View>
        </View>
     );
}
 
export default PostCard;