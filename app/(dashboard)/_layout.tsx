import ProfileIcon from "@/components/ProfileIcon";
import { useNavigationState } from "@react-navigation/native";
import { Drawer } from "expo-router/drawer";

function getActiveRouteName(state: any) {
  if (!state) return null;
  const route = state.routes[state.index];
  // If the route has nested state, drill down
  if (route.state) {
    return getActiveRouteName(route.state);
  }
  return route.name;
}

const DrawerLayout = () => {
  const navState = useNavigationState((state) => state);
  const activeRoute = getActiveRouteName(navState);

  const getTitle = (routeName: string) => {
    switch (routeName) {
      case "home":
        return "Dashboard";
      case "groups":
        return "Groups";
      case "resources":
        return "Resources";
      case "liveSession":
        return "Live Sessions";
      case "profile":
        return "Profile";
      case "settings":
        return "Settings";
      default:
        return "GroupMind";
    }
  };

  const headerTitle = getTitle(activeRoute);

  return (
    <Drawer
      screenOptions={{
        headerTitle,
        headerTitleAlign: "center",
        drawerType: "front",
        drawerStyle: { width: 240 },
        headerStyle: {
          elevation: 0, // Android
          shadowOpacity: 0, // iOS
          borderBottomWidth: 0, // iOS
        },
        headerTitleStyle: {
          fontFamily: "Inter",
          fontWeight: 800,
          fontSize: 22,
        },
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          headerTitle: headerTitle,
          drawerLabel: "Home",
          headerRight: () => <ProfileIcon />,
        }}
      />
      <Drawer.Screen
        name="profile"
        options={{ headerTitle: headerTitle, drawerLabel: "Profile" }}
      />
      <Drawer.Screen
        name="settings"
        options={{ headerTitle: headerTitle, drawerLabel: "Settings" }}
      />
    </Drawer>
  );
};

export default DrawerLayout;
