import { StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "@react-native-vector-icons/ionicons";
import { COLORS } from "../constants/colors";
import HomeScreen from "../screens/HomeScreen";
import PlaceholderScreen from "../screens/PlaceholderScreen";

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Home: { active: "home", inactive: "home-outline" },
  News: { active: "newspaper", inactive: "newspaper-outline" },
  Notification: { active: "notifications", inactive: "notifications-outline" },
  Profile: { active: "person", inactive: "person-outline" },
};

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.PRIMARY_NAVY,
        tabBarInactiveTintColor: COLORS.MUTED_TEXT,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ color, focused }) => {
          const iconSet = TAB_ICONS[route.name];
          const iconName = focused ? iconSet.active : iconSet.inactive;
          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen
        name="News"
        component={PlaceholderScreen}
        initialParams={{
          title: "News",
          message:
            "Official service updates will appear here in a later development stage.",
        }}
      />
      <Tab.Screen
        name="Notification"
        component={PlaceholderScreen}
        initialParams={{
          title: "Notification",
          message:
            "Notifications are not available yet. This screen is ready for a later development stage.",
        }}
      />
      <Tab.Screen
        name="Profile"
        component={PlaceholderScreen}
        initialParams={{
          title: "Profile",
          message: "Profile details will be added in a later development stage.",
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.WHITE,
    borderTopColor: COLORS.ACCENT_YELLOW,
    borderTopWidth: 3,
    paddingTop: 4,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
});
