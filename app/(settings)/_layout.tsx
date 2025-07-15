import { Stack } from "expo-router";

const SettingsLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="(group_settings)/[groupId]" />
      <Stack.Screen name="(group_chat)/[groupId]" />
      <Stack.Screen name="(create_post)/[groupId]" />
      <Stack.Screen name="permissionTest" />
    </Stack>
  );
};

export default SettingsLayout; 