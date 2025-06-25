import { Text, View, TouchableOpacity, Image, FlatList } from "react-native";
import Back from "@/assets/icons/Arrow_left.svg";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/services/firebase";
import groupImages from "@/assets/images/group_images";
import Edit from "@/assets/icons/Edit.svg";
import GroupImageModal from "@/components/GroupImageModal";

interface GroupData {
    admins: [],
    description: string,
    groupImage: string,
    groupMembers: [],
    groupType: string,
    name: string,
    purpose: string,
    moderators: [],
}

interface GroupImages {
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
}

const GroupSettings = () => {
    const { groupId, groupName } = useLocalSearchParams();
    const [groupData, setGroupData] = useState<GroupData | null>(null);
    const [showModal, setShowModal] = useState(false);
    
    // fetch groupInfo
useEffect(() => {
  if (!groupId) return;

  const groupData = async () => {
    const groupRef = doc(db, "groups", groupId.toString());
    const groupSnapshot = await getDoc(groupRef);

    if (groupSnapshot.exists()) {
      const data = groupSnapshot.data();

      const formattedData = {
        admins: data.admins,
        description: data.description,
        groupImage: data.imageUrl,
        groupMembers: data.members,
        groupType: data.category,
        name: data.name,
        purpose: data.onboardingText,
        moderators: data.moderators,
      } satisfies GroupData;

      setGroupData(formattedData);
    }
  };

  groupData();
}, [groupId]);
 
console.log("groupData: ", groupData);
    return (
      <View className="flex-1 bg-background relative">
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}
          className="ml-6 mt-2"
          >
          <Back />
        </TouchableOpacity>
        <View className="pt-4">
          <View className="flex-row items-center justify-center gap-4">
            <Text className="text-2xl font-bold text-center">{groupName}</Text>
          </View>
          <TouchableOpacity onPress={() => {setShowModal(true)}} activeOpacity={0.7}
            className="absolute top-1 right-4">
            <Edit  />
          </TouchableOpacity>
          <View className="flex items-center mt-10">
            <Image
              source={
                groupData
                  ? groupImages[groupData.groupImage as keyof GroupImages]
                  : groupImages.groupImage1
              }
              style={{ width: 200, height: 200 }}
              className="rounded-full border-2 border-primary"
              resizeMode="contain"
            />
          </View>

        
        <View className="mt-6 items-center">
          <Text className=" text-lg font-poppins-semiBold ">Group Description</Text>
          <Text className="text-center font-poppins">{groupData?.description}</Text>
        </View>

        {/* list of members by heirachy */}
        <View className="mt-6">
          <Text className=" text-lg font-poppins-semiBold ">Group Members</Text>
          <View className="mt-4">
            <FlatList
              data={groupData?.groupMembers}
              renderItem={({ item }) => (
                <View className="flex-row items-center justify-center gap-4">
                  <Text className="text-lg font-poppins-semiBold ">{item}</Text>
                </View>
              )}
            />
          </View>
        </View>
        </View>
        <GroupImageModal show={showModal} onDismiss={() => setShowModal(false)} onImageSelect={(imageUri) => {}} />
      </View>
    );
}
 
export default GroupSettings;