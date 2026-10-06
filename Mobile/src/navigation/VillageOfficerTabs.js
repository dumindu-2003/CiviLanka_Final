import { StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "@react-native-vector-icons/ionicons";
import { COLORS } from "../constants/colors";
import VillageOfficerDashboard from "../screens/VillageOfficerDashboard";
import VillageNewsScreen from "../screens/VillageNewsScreen";
import VillageNotificationScreen from "../screens/VillageNotificationScreen";
import StaffProfileScreen from "../screens/StaffProfileScreen";

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Home: { active: "home", inactive: "home-outline" },
  News: { active: "newspaper", inactive: "newspaper-outline" },
  Notification: { active: "notifications", inactive: "notifications-outline" },
  Profile: { active: "person", inactive: "person-outline" },
};

export default function VillageOfficerTabs() {
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
          return (
            <Ionicons
              name={focused ? iconSet.active : iconSet.inactive}
              size={22}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={VillageOfficerDashboard} />
      <Tab.Screen name="News" component={VillageNewsScreen} />
      <Tab.Screen name="Notification" component={VillageNotificationScreen} />
      <Tab.Screen name="Profile" component={StaffProfileScreen} />
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
