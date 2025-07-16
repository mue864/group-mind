import { Tabs } from "expo-router";
import { BookOpenText, MessageSquare, Users, Video } from "lucide-react-native";
import { memo } from "react";
import { Text, View } from "react-native";

const TabIcon = memo(
  ({
    color,
    focused,
    icon,
    name,
  }: {
    color: string;
    focused: boolean;
    icon: any;
    name: string;
  }) => {
    const IconComponent = icon;
    return (
      <View className="w-20 justify-center items-center mt-6">
        <IconComponent color={color} size={28} />
        <Text
          className={`${
            focused ? "text-primary" : "text-[#757474]"
          } font-poppins-semiBold text-xs`}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.8}
        >
          {name}
        </Text>
      </View>
    );
  }
);
TabIcon.displayName = "TabIcon";

const GroupMenuLayout = () => {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 65,
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
          tabBarAccessibilityLabel: "Q&A tab",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name="Q&A"
              icon={MessageSquare}
              focused={focused}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="groupChat"
        options={{
          title: "Group Chat",
          tabBarAccessibilityLabel: "Chat tab",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="Chat" icon={Users} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="groupResources"
        options={{
          title: "Resources",
          tabBarAccessibilityLabel: "Resources tab",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name="Resources"
              icon={BookOpenText}
              focused={focused}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="live"
        options={{
          title: "Live",
          tabBarAccessibilityLabel: "Live tab",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="Live" icon={Video} focused={focused} color={color} />
          ),
        }}
      />
    </Tabs>
  );
};

export default GroupMenuLayout;
