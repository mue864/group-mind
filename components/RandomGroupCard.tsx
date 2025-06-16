import avatars from "@/assets/images/avatars";
import groupImages from "@/assets/images/group_images";
import type { Group } from "@/store/GroupContext";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Image, Text, View } from "react-native";
import { db } from "../services/firebase";
import GroupButton from "./GroupButton";
import {memo} from "react";

interface GroupCardProps {
  group: Group;
  groupType: string
}

interface GroupImages {
  groupImage1: string;
  groupImage2: string;
  groupImage3: string;
  groupImage4: string;
  groupImage5: string;
  groupImage6: string;
  groupImage7: string;
  groupImage8: string;
  groupImage9: string;
  groupImage10: string;
  groupImage11: string;
}

interface Avatars {
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

const RandomGroupCard = ({ group, groupType }: GroupCardProps) => {
  const [groupCreatorName, setGroupCreatorName] = useState("");
  const [groupCreatorImage, setGroupCreatorImage] = useState<string | null>(
    null
  );

  useEffect(() => {
    const fetchGroupCreator = async () => {
      const userRef = doc(db, "users", group.createdBy.trim());
      const snapShot = await getDoc(userRef);

      if (snapShot.exists()) {
        setGroupCreatorName(snapShot.data().userName);
        setGroupCreatorImage(snapShot.data().profileImage);
      } else {
        console.log("nothing in here");
      }
    };
    fetchGroupCreator();
  }, []);

  return (
    <View className="w-full bg-gray-50 border-2 border-gray-100 shadow-sm rounded-xl mb-2">
      <Image
        source={
          group?.imageUrl
            ? groupImages[group.imageUrl as keyof GroupImages]
            : groupImages.groupImage8
        }
        className="w-full h-36 rounded-t-xl"
        resizeMode="cover"
      />
      <View className="p-2 h-44 mx-4">
        {/* group name */}
        <Text className="font-inter font-bold text-xl text-secondary">
          {group.name}
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
              {group.members.length > 1
                ? group.members.length + " Members"
                : group.members.length + " Member"}
            </Text>
          </View>
        </View>
        {/* group info */}
        <View className="flex flex-row gap-6">
          <View className="justify-center items-center w-56">
            <Text>
              We do discussions from 10am jhdjshfjdshfds jsdhfjshfjdsh
            </Text>
          </View>

          <View>
            <GroupButton
              openGroup={() => console.log("Opening")}
              groupType={groupType}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

export default memo(RandomGroupCard);
