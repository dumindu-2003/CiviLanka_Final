import { useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@react-native-vector-icons/ionicons";
import { COLORS } from "../constants/colors";

const FEATURED = {
  id: "important-nic",
  kicker: "IMPORTANT NOTICE • 15 SEP 2026",
  title: "Revised Digital NIC & Vital Records Verification Guidelines",
  body: "New protocol mandates bi-annual credential verification for Divisional Registrars and Village Officers handling online certificate issuance.",
  ref: "RG/2026/08 • 4 min read",
  action: "Read Gazette",
};

const BULLETINS = [
  {
    id: "marriage-timelines",
    tag: "PUBLIC NOTICE",
    time: "Yesterday",
    title: "Online Marriage Registration Processing Timelines Updated",
    body: "Standard processing time for verified submissions reduced to 48 working hours across all District Secretariats.",
    meta: "Notice Ref: SL-PR-992",
    action: "open",
  },
  {
    id: "gazette-birth",
    tag: "GAZETTE EXTRAORDINARY",
    time: "3 days ago",
    title: "Gazette No. 2410/18: Birth Registration Act Amendments",
    body: "Official enactment of digital birth certificate issuance and remote informant identification guidelines.",
    meta: "Gazette No. 2410/18 • PDF Available",
    action: "view",
  },
  {
    id: "system-upgrade",
    tag: "SYSTEM UPDATE",
    time: "5 days ago",
    title: "Maintenance & System Upgrade Scheduled for Sept 20",
    body: "The central Document Tracker portal will undergo scheduled maintenance from 22:00 to 02:00 IST.",
    meta: "Technical Bulletin v3.2",
    action: "open",
  },
  {
    id: "village-signoff",
    tag: "CIRCULAR",
    time: "1 week ago",
    title: "Authorized Sign-Off Requirements for Village Officers",
    body: "Mandatory requirement to attach official deployment credentials for Form submission.",
    meta: "Circular: VO-2026-04",
    action: "open",
  },
];

const ARCHIVE = [
  {
    id: "archive-2024",
    tag: "GAZETTE",
    time: "2024",
    title: "Gazette archive 2024: civil registration amendments",
    body: "Collected gazettes for birth, death, and marriage registration issued during 2024.",
    meta: "Archive 2024",
    action: "view",
  },
  {
    id: "archive-2022",
    tag: "GAZETTE",
    time: "2022",
    title: "Gazette archive 2022: registrar circulars",
    body: "Registrar General circulars issued to district and village offices in 2022.",
    meta: "Archive 2022",
    action: "view",
  },
  {
    id: "archive-2020",
    tag: "GAZETTE",
    time: "2020",
    title: "Gazette archive 2020: vital records notices",
    body: "Public notices on vital records issued from 2020.",
    meta: "Archive 2020",
    action: "open",
  },
];

export default function VillageNewsScreen({ navigation }) {
  const searchRef = useRef(null);
  const [query, setQuery] = useState("");
  const [showArchive, setShowArchive] = useState(false);
  const [openItem, setOpenItem] = useState(null);

  const needle = query.trim().toLowerCase();
  const bulletins = (showArchive ? [...BULLETINS, ...ARCHIVE] : BULLETINS).filter((item) =>
    matches(item, needle)
  );
  const showFeatured = matches(FEATURED, needle);

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <SafeAreaView edges={["top"]} style={styles.topSafe}>
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.navigate("Home")}
            style={styles.headerIcon}
            accessibilityLabel="Home"
          >
            <Ionicons name="home-outline" size={22} color={COLORS.PRIMARY_NAVY} />
          </Pressable>
          <Text style={styles.headerTitle}>News</Text>
          <Pressable
            onPress={() => searchRef.current?.focus()}
            style={styles.headerIcon}
            accessibilityLabel="Search news"
          >
            <Ionicons name="search-outline" size={22} color={COLORS.PRIMARY_NAVY} />
          </Pressable>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>Official Government Updates • Dept. of Registrar General & Public</Text>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={COLORS.MUTED_TEXT} />
          <TextInput
            ref={searchRef}
            value={query}
            onChangeText={setQuery}
            placeholder="Search news, gazettes, circulars..."
            placeholderTextColor={COLORS.MUTED_TEXT}
            style={styles.searchInput}
          />
        </View>

        {showFeatured ? (
          <Pressable style={styles.featured} onPress={() => setOpenItem(FEATURED)} accessibilityRole="button">
            <View style={styles.featuredKickerRow}>
              <View style={styles.alertDot} />
              <Text style={styles.featuredKicker}>{FEATURED.kicker}</Text>
            </View>
            <Text style={styles.featuredTitle}>{FEATURED.title}</Text>
            <Text style={styles.featuredBody}>{FEATURED.body}</Text>
            <View style={styles.featuredFoot}>
              <Text style={styles.meta}>{FEATURED.ref}</Text>
              <Text style={styles.link}>Read Gazette</Text>
            </View>
          </Pressable>
        ) : null}

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Recent Bulletins</Text>
          <View style={styles.countPill}>
            <Text style={styles.countText}>{bulletins.length}</Text>
          </View>
        </View>

        {bulletins.length === 0 ? <Text style={styles.empty}>No matching news.</Text> : null}
        {bulletins.map((item) => (
          <Pressable key={item.id} style={styles.bulletin} onPress={() => setOpenItem(item)} accessibilityRole="button">
            <View style={styles.bulletinTop}>
              <View style={styles.tag}>
                <Text style={styles.tagText}>{item.tag}</Text>
              </View>
              <Text style={styles.time}>{item.time}</Text>
            </View>
            <Text style={styles.bulletinTitle}>{item.title}</Text>
            <Text style={styles.bulletinBody}>{item.body}</Text>
            <View style={styles.bulletinFoot}>
              <Text style={styles.meta}>{item.meta}</Text>
              {item.action === "view" ? (
                <View style={styles.viewPill}>
                  <Text style={styles.viewPillText}>View</Text>
                </View>
              ) : (
                <Ionicons name="chevron-forward" size={18} color={COLORS.MUTED_TEXT} />
              )}
            </View>
          </Pressable>
        ))}

        <Pressable style={styles.archiveButton} onPress={() => setShowArchive((current) => !current)} accessibilityRole="button">
          <Ionicons name="document-text-outline" size={16} color={COLORS.PRIMARY_NAVY} />
          <Text style={styles.archiveText}>
            {showArchive ? "Hide Gazette Archive" : "View Gazette Archive (2020 - 2026)"}
          </Text>
        </Pressable>
        <Text style={styles.footer}>National Registry Information System • Version 4.8.2</Text>
      </ScrollView>

      {openItem ? (
        <View style={styles.detailWrap}>
          <Pressable style={styles.detailBackdrop} onPress={() => setOpenItem(null)} />
          <View style={styles.detailCard}>
            <Text style={styles.detailKicker}>{openItem.kicker || openItem.tag}</Text>
            <Text style={styles.detailTitle}>{openItem.title}</Text>
            <Text style={styles.detailBody}>{openItem.body}</Text>
            <Text style={styles.meta}>{openItem.ref || openItem.meta}</Text>
            <Pressable style={styles.closeButton} onPress={() => setOpenItem(null)} accessibilityRole="button">
              <Text style={styles.closeText}>Close</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );
}

function matches(item, needle) {
  if (!needle) {
    return true;
  }
  return [item.kicker, item.tag, item.title, item.body, item.meta, item.ref, item.time]
    .join(" ")
    .toLowerCase()
    .includes(needle);
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  topSafe: { backgroundColor: COLORS.BACKGROUND },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingBottom: 6,
  },
  headerIcon: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, color: COLORS.PRIMARY_NAVY, fontSize: 28, fontWeight: "700" },
  content: { paddingHorizontal: 16, paddingBottom: 28 },
  subtitle: { color: COLORS.MUTED_TEXT, fontSize: 13, marginBottom: 12 },
  searchBox: {
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    backgroundColor: COLORS.WHITE,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: { flex: 1, color: COLORS.DARK_TEXT, fontSize: 15, paddingVertical: 10 },
  featured: {
    marginTop: 14,
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.ACCENT_YELLOW,
    padding: 14,
  },
  featuredKickerRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  alertDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.ACCENT_YELLOW },
  featuredKicker: { color: COLORS.PRIMARY_NAVY, fontSize: 11, fontWeight: "700" },
  featuredTitle: { marginTop: 8, color: COLORS.DARK_TEXT, fontSize: 18, fontWeight: "700", lineHeight: 24 },
  featuredBody: { marginTop: 6, color: COLORS.MUTED_TEXT, fontSize: 14, lineHeight: 20 },
  featuredFoot: { marginTop: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  link: { color: COLORS.PRIMARY_NAVY, fontSize: 13, fontWeight: "700" },
  sectionRow: { marginTop: 18, marginBottom: 10, flexDirection: "row", alignItems: "center", gap: 8 },
  sectionTitle: { color: COLORS.PRIMARY_NAVY, fontSize: 18, fontWeight: "700" },
  countPill: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.PRIMARY_NAVY,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  countText: { color: COLORS.WHITE, fontSize: 12, fontWeight: "700" },
  empty: { color: COLORS.MUTED_TEXT, fontSize: 14, marginBottom: 8 },
  bulletin: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    padding: 14,
    marginBottom: 10,
  },
  bulletinTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  tag: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: { color: COLORS.PRIMARY_NAVY, fontSize: 10, fontWeight: "700" },
  time: { color: COLORS.MUTED_TEXT, fontSize: 12 },
  bulletinTitle: { marginTop: 8, color: COLORS.DARK_TEXT, fontSize: 16, fontWeight: "700", lineHeight: 22 },
  bulletinBody: { marginTop: 4, color: COLORS.MUTED_TEXT, fontSize: 13, lineHeight: 18 },
  bulletinFoot: { marginTop: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  meta: { flex: 1, color: COLORS.MUTED_TEXT, fontSize: 12 },
  viewPill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.PRIMARY_NAVY,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  viewPillText: { color: COLORS.PRIMARY_NAVY, fontSize: 12, fontWeight: "700" },
  archiveButton: {
    marginTop: 6,
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    backgroundColor: COLORS.WHITE,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  archiveText: { color: COLORS.PRIMARY_NAVY, fontSize: 14, fontWeight: "700" },
  footer: { marginTop: 12, textAlign: "center", color: COLORS.MUTED_TEXT, fontSize: 12 },
  detailWrap: { ...StyleSheet.absoluteFillObject, justifyContent: "flex-end" },
  detailBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(10, 31, 68, 0.45)" },
  detailCard: {
    backgroundColor: COLORS.WHITE,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 18,
    paddingBottom: 28,
  },
  detailKicker: { color: COLORS.PRIMARY_NAVY, fontSize: 12, fontWeight: "700" },
  detailTitle: { marginTop: 8, color: COLORS.DARK_TEXT, fontSize: 18, fontWeight: "700" },
  detailBody: { marginTop: 8, color: COLORS.DARK_TEXT, fontSize: 15, lineHeight: 22 },
  closeButton: {
    marginTop: 16,
    minHeight: 46,
    borderRadius: 12,
    backgroundColor: COLORS.PRIMARY_NAVY,
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: { color: COLORS.WHITE, fontSize: 15, fontWeight: "700" },
});
