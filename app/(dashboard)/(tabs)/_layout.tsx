import { Tabs } from "expo-router";
import { Book, Home, Users, Video, BookOpenText } from "lucide-react-native";
import { memo } from "react";
import { Platform, Text, View } from "react-native";

// Memoized TabIcon for better performance
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
      <View className="w-20 justify-center items-center mt-2">
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

// Configuration for cleaner code
const TAB_CONFIG = [
  {
    name: "home",
    title: "Dashboard",
    label: "Home",
    icon: Home,
  },
  {
    name: "groups",
    title: "Groups",
    label: "Groups",
    icon: Users,
  },
  {
    name: "resources",
    title: "Resources",
    label: "Resources",
    icon: BookOpenText,
  },
  {
    name: "liveSession",
    title: "Live Sessions",
    label: "Live",
    icon: Video,
  },
];

const DashboardLayout = () => {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        headerTitleAlign: "center",
        tabBarShowLabel: false,
        tabBarStyle: {
          borderRadius: 16,
          height: Platform.OS === "ios" ? 65 : 65,
          position: "absolute",
          bottom: Platform.OS === "ios" ? 15 : 15,
          left: 15,
          right: 15,
          marginLeft: 15,
          marginRight: 15,
          backgroundColor: "#ffffff",
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          paddingTop: 8,
          paddingBottom: Platform.OS === "ios" ? 20 : 8,
        },

        headerStyle: {
          height: 80,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTitleStyle: {
          fontSize: 22,
          fontWeight: "600",
        },
        tabBarActiveTintColor: "#4169E1",
        tabBarInactiveTintColor: "#6B7280",
        tabBarHideOnKeyboard: true,
      }}
    >
      {TAB_CONFIG.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarAccessibilityLabel: `${tab.label} tab`,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                name={tab.label}
                icon={tab.icon}
                focused={focused}
                color={color}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
};

export default DashboardLayout;
