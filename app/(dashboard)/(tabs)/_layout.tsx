import tab from "@/assets/icons/tab";
import { Tabs } from "expo-router";
import { useEffect } from "react";
import { Image, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const TabIcon = ({ color, focused, icon, name }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  useEffect(() => {
    if (focused) {
      scale.value = withSpring(1.2, { damping: 5 });
      const timeout = setTimeout(() => {
        scale.value = withSpring(1);
      }, 200);
      return () => clearTimeout(timeout);
    }
  }, [focused]);

  return (
    <Animated.View
      className="w-32 justify-center items-center"
      style={animatedStyle}
    >
      <Image
        source={icon}
        resizeMode="contain"
        className="w-10 h-10"
        tintColor={color}
      />
      <Text
        className={`text-xs font-bold font-poppins ${
          focused ? "text-primary" : "text-[#757474]"
        }`}
      >
        {name}
      </Text>
    </Animated.View>
  );
};

const DashboardLayout = () => {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        headerTitleAlign: "center",
        tabBarShowLabel: false,
        tabBarStyle: {
          borderRadius: 15,
          height: 75,
          position: "absolute",
          bottom: 15,
          marginLeft: 15,
          marginRight: 15,
          backgroundColor: "#fff",
          shadowOffset: {
            width: 0,
            height: 10,
          },
          shadowOpacity: 0.05,
          shadowRadius: 4,
        },
        headerStyle: {
          height: 80,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTitleStyle: {
          fontSize: 22,
        },
        tabBarActiveTintColor: "#4169E1",
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
              name="Home"
              icon={tab.home}
              focused={focused}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          title: "Groups",
          tabBarIcon: ({ color, size, focused }) => (
              <TabIcon
                name="Groups"
                icon={tab.groups}
                focused={focused}
                color={color}
              />
          ),
        }}
      />
      <Tabs.Screen
        name="resources"
        options={{
          title: "Resources",
          tabBarIcon: ({ color, size, focused }) => (
              <TabIcon
                name="Resources"
                icon={tab.resources}
                focused={focused}
                color={color}
              />
          ),
        }}
      />
      <Tabs.Screen
        name="liveSession"
        options={{
          title: "Live Sessions",
          tabBarIcon: ({ color, size, focused }) => (
  
              <TabIcon
                name="Resources"
                icon={tab.sessions}
                focused={focused}
                color={color}
              />
          ),
        }}
      />
    </Tabs>
  );
};

export default DashboardLayout;
