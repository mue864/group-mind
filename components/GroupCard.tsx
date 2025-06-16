import {View, Text, Image} from "react-native"
import { memo, useEffect, useState } from "react";
import groupImages from "@/assets/images/group_images";
import GroupButton from "./GroupButton";
import { db } from "@/services/firebase";
import { getDoc, doc } from "firebase/firestore";
import avatars from "@/assets/images/avatars";

interface GroupCardProps {
    id: string,
    imageUrl: string,
    members: string[],
    description: string,
    name: string,
    createdBy: string,
    groupType: string
}

interface GroupCardImages {
    groupImage1: string,
    groupImage2: string,
    groupImage3: string,
    groupImage4: string,
    groupImage5: string,
    groupImage6: string,
    groupImage7: string,
    groupImage8: string,
    groupImage9: string,
    groupImage10: string,
    groupImage11: string,
};

interface Avatars {
    avatar1: string,
    avatar2: string,
    avatar3: string,
    avatar4: string,
    avatar5: string,
    avatar6: string,
    avatar7: string,
    avatar8: string,
    avatar9: string,
}

const GroupCard = ({id, imageUrl, description, members, createdBy, name, groupType}: GroupCardProps) => {

    const [groupCreatorName, setGroupCreatorName] = useState("")
    const [groupCreatorImage, setGroupCreatorImage] = useState<string | null>(null)

    useEffect(() => {
        const retriveCreatorImage = async () => {
            const userRef = doc(db, "users", createdBy.trim());
            const userDoc = await getDoc(userRef);

            if (userDoc.exists()) {
                setGroupCreatorName(userDoc.data().userName)
                setGroupCreatorImage(userDoc.data().profileImage)
            } else {
                console.log("nothing here")
            }
        };
        retriveCreatorImage()
    }, []);

    return (
      <View className="bg-gray-50 border-2 border-gray-100 shadow-sm rounded-xl mb-7">
        <Image
          source={
            imageUrl
              ? groupImages[imageUrl as keyof GroupCardImages]
              : groupImages.groupImage8
          }
          className="w-full h-36 rounded-t-xl"
          resizeMode="cover"
        />
        <View className="p-2 h-44 mx-4">
          {/* group name */}
          <Text className="font-inter font-bold text-xl text-secondary">
            {name}
          </Text>
          {/* creator details */}
          <View className="flex flex-row items-center justify-between">
            <View className="flex flex-row items-center mt-4 mb-4 gap-1">
              <Image
                source={
                  groupCreatorImage
                    ? avatars[groupCreatorImage as keyof Avatars]
                    : avatars.avatar1
                }
                resizeMode="cover"
                className="rounded-full w-10 h-10"
              />
              <Text className="font-inter font-bold text-md ">
                {groupCreatorName}
              </Text>
            </View>

            <View>
              <Text className="font-inter text-md text-[#ADAAAA] font-bold">
                {members.length > 1
                  ? members.length + " Members"
                  : members.length + " Member"}
              </Text>
            </View>
          </View>
          {/* group info */}
          <View className="flex flex-row gap-6">
            <View className="justify-center items-center w-56">
              <Text>{description}</Text>
            </View>

            <View>
              <GroupButton
                openGroup={() => console.log("Opening")}
                groupType="Yours"
              />
            </View>
          </View>
        </View>
      </View>
    );
}
 
export default memo(GroupCard);