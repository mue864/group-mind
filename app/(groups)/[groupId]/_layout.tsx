import { groupIcons } from "@/assets/icons/groups";
import { Tabs } from "expo-router";
import { Image, Text, View } from "react-native";

const TabBarIcon = ({ name, focus, color, icon }) => {
  return (
    <View className="w-40 justify-center items-center mt-7">
      <Image
        source={icon}
        tintColor={color}
        resizeMode="contain"
        className="w-10 h-10"
      />
      <Text
        className={`${
          focus ? "text-primary" : "text-[#757474]"
        } font-poppins-semiBold text-sm `}
      >
        {name}
      </Text>
    </View>
  );
};
const GroupMenuLayout = () => {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 75,
          position: "absolute",
          bottom: 8,
          marginLeft: 15,
          marginRight: 15,
          borderRadius: 15,
          shadowOffset: {
            width: 0,
            height: 10,
          },
          shadowOpacity: 0.05,
          shadowRadius: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Q&A",
          tabBarIcon: ({ color, focused, size }) => (
            <TabBarIcon
              icon={groupIcons.qa}
              color={color}
              focus={focused}
              name="Q&A"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="groupChat"
        options={{
          title: "Group Chat",
          tabBarIcon: ({ color, focused, size }) => (
            <TabBarIcon
              icon={groupIcons.chat}
              color={color}
              focus={focused}
              name="Group Chat"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="groupResources"
        options={{
          title: "Resources",
          tabBarIcon: ({ color, focused, size }) => (
            <TabBarIcon
              icon={groupIcons.resources}
              color={color}
              focus={focused}
              name="Resources"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="sessions"
        options={{
          title: "Schedule Session",
          tabBarIcon: ({ color, focused, size }) => (
            <TabBarIcon
              icon={groupIcons.sessions}
              color={color}
              focus={focused}
              name="Sessions"
            />
          ),
        }}
      />
    </Tabs>
  );
};

export default GroupMenuLayout;
