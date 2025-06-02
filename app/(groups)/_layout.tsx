import { Stack } from "expo-router";

const Layout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackVisible: true,
        headerBackTitle: "Back",
        headerStyle: {
          backgroundColor: '#fff',
        }
      }}
    >
      <Stack.Screen name="groupCreate" options={{ title: "Create Group" }} />
      <Stack.Screen name="groupBanner" options={{ title: "Group Banner" }} />
      <Stack.Screen name="groupChat" options={{ title: "Group Chat" }} />
      <Stack.Screen name="groupDetails" options={{ title: "Group Details" }} />
      <Stack.Screen
        name="groupInfoEdit"
        options={{ title: "Group Info Edit" }}
      />
      <Stack.Screen
        name="groupResources"
        options={{ title: "Group Resources" }}
      />
      <Stack.Screen name="groupQA" options={{ title: "Group QA" }} />
      <Stack.Screen
        name="groupScheduleSession"
        options={{ title: "Group Schedule Session" }}
      />
    </Stack>
  );
};

export default Layout;
