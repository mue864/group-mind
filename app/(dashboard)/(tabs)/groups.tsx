import FloatingButton from "@/components/FloatingButton";
import GroupCard from "@/components/GroupCard";
import { useGroupContext } from "@/store/GroupContext";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StatusBar, View } from "react-native";
import { FlatList, ScrollView } from "react-native-gesture-handler";
import { FAB, Portal, Provider } from "react-native-paper";

const Groups = () => {
  const router = useRouter();

  const { groups } = useGroupContext();
  const [open, setOpen] = useState(false);

  const onStateChange = ({ open }: { open: boolean }) => setOpen(open);

  return (
    <Provider>
      <Portal>
        <FAB.Group
         open={open}
         icon={open ? 'close' : 'plus'}
        color="#fff"
         style={{ position: 'absolute', bottom: 80, right: 3, zIndex: 9999, elevation: 9999 }}
         fabStyle={{backgroundColor: '#4169E1'}}
         actions={[
          {
            icon: 'web',
            label: "Explore Groups",
            onPress: () => console.log("Explore Groups")
          },
          {
            icon: 'plus-box',
            label: "Create Group",
            onPress: () => router.push("/groupCreate")
          }
         ]}
         onStateChange={onStateChange}
         onPress={() => {
          if (open) {
            console.log("Open")
          } else {
            console.log("Closed")
          }
         }}
      />
      </Portal>
      <View className="flex-1 bg-background">
      <StatusBar barStyle={"dark-content"} />

      {/* groups available */}

        <View className="flex-1 justify-center items-center">
          <View className="justify-center items-center mt-5 relative"
          style={{flex: 1}}
          >
            <FlatList
              data={groups}
              keyExtractor={(item, index) => index.toString()}
              contentContainerStyle={{ paddingBottom: 120 }}
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
    </View>
    </Provider>
  );
};

export default Groups;
