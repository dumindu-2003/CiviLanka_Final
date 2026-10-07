import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@react-native-vector-icons/ionicons";
import { COLORS } from "../constants/colors";

export default function StaffUpdatesScreen({ route }) {
  const title = route.params?.title || "News";
  const intro = route.params?.intro || "";
  const items = route.params?.items || [];
  const isNotification = route.params?.kind === "notification";
  const [readIds, setReadIds] = useState([]);

  function markRead(id) {
    setReadIds((current) => (current.includes(id) ? current : [...current, id]));
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <SafeAreaView edges={["top"]} style={styles.headerSafe}>
          <Text style={styles.headerTitle}>{title}</Text>
        </SafeAreaView>
        <View style={styles.headerAccent} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {intro ? <Text style={styles.intro}>{intro}</Text> : null}
        {items.map((item) => {
          const isRead = readIds.includes(item.id);
          const card = (
            <>
              <View style={styles.iconCircle}>
                <Ionicons
                  name={isNotification ? "notifications-outline" : "newspaper-outline"}
                  size={16}
                  color={COLORS.PRIMARY_NAVY}
                />
              </View>
              <View style={styles.copy}>
                {item.date ? <Text style={styles.date}>{item.date}</Text> : null}
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.body}>{item.body}</Text>
                {item.time ? <Text style={styles.time}>{item.time}</Text> : null}
              </View>
              {isNotification && !isRead ? <View style={styles.unread} /> : null}
            </>
          );
          if (!isNotification) {
            return (
              <View key={item.id} style={styles.card}>
                {card}
              </View>
            );
          }
          return (
            <Pressable
              key={item.id}
              style={styles.card}
              onPress={() => markRead(item.id)}
              accessibilityRole="button"
            >
              {card}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  header: { backgroundColor: COLORS.PRIMARY_NAVY },
  headerSafe: { backgroundColor: COLORS.PRIMARY_NAVY, paddingBottom: 14, alignItems: "center" },
  headerAccent: { height: 4, backgroundColor: COLORS.ACCENT_YELLOW },
  headerTitle: { color: COLORS.WHITE, fontSize: 18, fontWeight: "700" },
  content: { padding: 16, paddingBottom: 32 },
  intro: { color: COLORS.MUTED_TEXT, fontSize: 14, marginBottom: 12 },
  card: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.ACCENT_YELLOW,
    padding: 14,
    marginBottom: 12,
    flexDirection: "row",
    gap: 10,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.ACCENT_YELLOW,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: { flex: 1 },
  date: { color: COLORS.MUTED_TEXT, fontSize: 12, fontWeight: "700" },
  title: { marginTop: 2, color: COLORS.PRIMARY_NAVY, fontSize: 15, fontWeight: "700" },
  body: { marginTop: 4, color: COLORS.DARK_TEXT, fontSize: 14, lineHeight: 20 },
  time: { marginTop: 6, color: COLORS.MUTED_TEXT, fontSize: 12 },
  unread: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.ACCENT_YELLOW, marginTop: 4 },
});
