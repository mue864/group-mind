import { memo } from "react";
import tab from "@/assets/icons/tab";
import { Tabs } from "expo-router";
import { Image, Text, View, Platform } from "react-native";

// Memoized TabIcon for better performance
const TabIcon = memo(({ color, focused, icon, name }) => {
  return (
    <View className="w-20 justify-center items-center mt-5">
      <Image
        source={icon}
        resizeMode="contain"
        className="w-10 h-10"
        tintColor={color}
        accessibilityRole="image"
        accessibilityLabel={`${name} tab icon`}
      />
      <Text
        className={`${
          focused ? "text-primary" : "text-[#757474]"
        } font-poppins-semiBold text-sm `}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.8}
      >
        {name}
      </Text>
    </View>
  );
});

TabIcon.displayName = "TabIcon";

// Configuration for cleaner code
const TAB_CONFIG = [
  {
    name: "home",
    title: "Dashboard",
    label: "Home",
    icon: tab.home,
  },
  {
    name: "groups",
    title: "Groups",
    label: "Groups",
    icon: tab.groups,
  },
  {
    name: "resources",
    title: "Resources",
    label: "Resources",
    icon: tab.resources,
  },
  {
    name: "liveSession",
    title: "Live Sessions",
    label: "Live",
    icon: tab.sessions,
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
          height: Platform.OS === "ios" ? 85 : 75,
          position: "absolute",
          bottom: Platform.OS === "ios" ? 25 : 15,
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
            height: 4,
          },
          shadowOpacity: 0.1,
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
