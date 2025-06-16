import FloatingButton from "@/components/FloatingButton";
import GroupCard from "@/components/GroupCard";
import { useGroupContext } from "@/store/GroupContext";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StatusBar, View, Text, Image } from "react-native";
import { FlatList, ScrollView } from "react-native-gesture-handler";
import icons from "@/assets/icons/tab"

const Groups = () => {
  const router = useRouter();

  const { groups, loading } = useGroupContext();
  const [userGroups, setUserGroups] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);

  return (
    <ScrollView className="flex-1 bg-background">
      <StatusBar barStyle={"dark-content"} />

      {/* groups available */}
      {groups.length !== 0 && pageIndex === 0 ? (
        <View className="flex-1 justify-center items-center">
          <View className="justify-center items-center mt-5 relative">
            <FlatList
              data={groups}
              keyExtractor={(item, index) => index.toString()}
              contentContainerStyle={{ paddingBottom: 100 }}
              renderItem={({ item }) => (
                <GroupCard
                  id={item.id}
                  members={item.members}
                  description={item.description}
                  createdBy={item.createdBy}
                  name={item.name}
                  imageUrl={item.imageUrl}
                  groupType="Yours"
                />
              )}
            />
          </View>
        </View>
      ) : (
        <View className="flex-1 justify-center items-center">
          <FloatingButton action={() => router.push("/(groups)/groupCreate")} />
        </View>
      )}
    </ScrollView>
  );
};

export default Groups;
