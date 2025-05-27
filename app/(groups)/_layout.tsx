import { Stack } from "expo-router";

const Layout = () => {
    return (
        <Stack>
            <Stack.Screen name="GroupCreate" options={{headerShown: true, title: "Create Group"}} />
            <Stack.Screen name="GroupBanner" options={{headerShown: true, title: "Group Banner"}} />
            <Stack.Screen name="GroupChat" options={{headerShown: true, title: "Group Chat"}} />
            <Stack.Screen name="GroupDetails" options={{headerShown: true, title: "Group Details"}} />
            <Stack.Screen name="GroupInfoEdit" options={{headerShown: true, title: "Group Info Edit"}} />
            <Stack.Screen name="GroupResources" options={{headerShown: true, title: "Group Resources"}} />
            <Stack.Screen name="GroupQA" options={{headerShown: true, title: "Group QA"}} />
            <Stack.Screen name="GroupScheduleSession" options={{headerShown: true, title: "Group Schedule Session"}} />
        </Stack>
    )
}

export default Layout;
