import { Stack } from "expo-router";

const Layout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerBackVisible: true,
        headerBackTitle: "Back",
        headerStyle: {
          backgroundColor: '#fff',
        }
      }}
    >
      <Stack.Screen name="groupCreate" options={{ title: "Create Group" }} />
    </Stack>
  );
};

export default Layout;
