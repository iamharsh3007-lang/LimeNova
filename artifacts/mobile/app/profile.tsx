import React from "react";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useFormulation } from "@/context/FormulationContext";

const D = {
  bg: "#FAF8F4",
  bgAlt: "#F2EDE6",
  card: "#FFFFFF",
  border: "#E4DDD5",
  text: "#1A1614",
  muted: "#7C6F65",
  faded: "#B5A99E",
  sage: "#6B9E7A",
  rose: "#B8706E",
  gold: "#B8882A",
};

const MENU = [
  { icon: "package" as const, label: "Order History", sub: "View your past orders", route: "/history" },
  { icon: "shield" as const, label: "Privacy & Data", sub: "Manage your skin data", route: null },
  { icon: "bell" as const, label: "Notifications", sub: "Formula and shipping alerts", route: null },
  { icon: "help-circle" as const, label: "Help & Support", sub: "FAQ and contact us", route: null },
  { icon: "info" as const, label: "About FORMULAB", sub: "Version 1.0 — Skin, decoded.", route: null },
];

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { formulations } = useFormulation();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;
  const paidOrders = formulations.length;

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      <View style={styles.headerStrip} />

      <View style={styles.nav}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={18} color={D.muted} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Profile</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: botPad + 40 }]} showsVerticalScrollIndicator={false}>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarBox}>
            <View style={styles.avatarRing} />
            <View style={styles.avatarInner}>
              <Text style={styles.avatarSymbol}>◈</Text>
            </View>
          </View>
          <Text style={styles.avatarName}>FORMULAB User</Text>
          <Text style={styles.avatarSub}>Ireland · Personal Care</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={[styles.statNum, { color: D.sage }]}>{paidOrders}</Text>
            <Text style={styles.statLabel}>Formulas{"\n"}Created</Text>
          </View>
          <View style={[styles.statCard, styles.statCardMid]}>
            <Text style={[styles.statNum, { color: D.rose, fontSize: 18 }]}>AI</Text>
            <Text style={styles.statLabel}>Skin{"\n"}Analysis</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNum, { color: D.gold, fontSize: 18 }]}>IE</Text>
            <Text style={styles.statLabel}>Irish{"\n"}Climate</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>ACCOUNT</Text>

        {MENU.map((item, i) => (
          <TouchableOpacity
            key={i} style={styles.menuItem} activeOpacity={0.75}
            onPress={() => { if (item.route) router.push(item.route as any); }}
          >
            <View style={styles.menuIcon}>
              <Feather name={item.icon} size={17} color={D.muted} />
            </View>
            <View style={styles.menuBody}>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuSub}>{item.sub}</Text>
            </View>
            <Feather name="chevron-right" size={15} color={D.faded} />
          </TouchableOpacity>
        ))}

        <Text style={[styles.sectionLabel, { marginTop: 28 }]}>BRAND</Text>

        <View style={styles.brandCard}>
          <View style={styles.brandSymbolRow}>
            <Text style={[styles.brandGlyph, { color: D.sage }]}>◈</Text>
            <Text style={[styles.brandGlyph, { color: D.rose }]}>◇</Text>
            <Text style={[styles.brandGlyph, { color: D.gold }]}>◆</Text>
          </View>
          <Text style={styles.brandTitle}>FORMULAB</Text>
          <Text style={[styles.brandSub, { color: D.sage }]}>Skin, decoded.</Text>
          <Text style={styles.brandTagline}>
            Ireland's first AI-powered personal care brand.{"\n"}
            Formulated for Irish skin, water, and weather.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: D.bg },
  headerStrip: { position: "absolute", top: 0, left: 0, right: 0, height: 220, backgroundColor: D.bgAlt },
  nav: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: D.card, borderWidth: 1, borderColor: D.border, alignItems: "center", justifyContent: "center" },
  navTitle: { fontFamily: "Fraunces_700Bold", fontSize: 17, color: D.text, letterSpacing: -0.2 },
  content: { paddingHorizontal: 20 },
  avatarSection: { alignItems: "center", paddingVertical: 24 },
  avatarBox: { width: 80, height: 80, alignItems: "center", justifyContent: "center", marginBottom: 14 },
  avatarRing: { position: "absolute", width: 80, height: 80, borderRadius: 40, borderWidth: 1.5, borderColor: D.sage, borderStyle: "dashed" },
  avatarInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: D.card, borderWidth: 1, borderColor: D.border, alignItems: "center", justifyContent: "center" },
  avatarSymbol: { fontSize: 28, color: D.sage, lineHeight: 34 },
  avatarName: { fontFamily: "Fraunces_700Bold", fontSize: 20, color: D.text, letterSpacing: -0.3, marginBottom: 4 },
  avatarSub: { fontFamily: "Inter_400Regular", fontSize: 13, color: D.muted },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 28 },
  statCard: { flex: 1, backgroundColor: D.card, borderRadius: 14, borderWidth: 1, borderColor: D.border, padding: 14, alignItems: "center" },
  statCardMid: {},
  statNum: { fontFamily: "Fraunces_700Bold", fontSize: 26, letterSpacing: -0.5, marginBottom: 4 },
  statLabel: { fontFamily: "Inter_400Regular", fontSize: 11, color: D.faded, textAlign: "center", lineHeight: 16 },
  sectionLabel: { fontFamily: "Inter_600SemiBold", fontSize: 9.5, color: D.faded, letterSpacing: 2, marginBottom: 12 },
  menuItem: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: D.card, borderRadius: 14, borderWidth: 1, borderColor: D.border, padding: 14, marginBottom: 8 },
  menuIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: D.bgAlt, alignItems: "center", justifyContent: "center" },
  menuBody: { flex: 1 },
  menuLabel: { fontFamily: "Inter_500Medium", fontSize: 15, color: D.text, marginBottom: 2 },
  menuSub: { fontFamily: "Inter_400Regular", fontSize: 12, color: D.faded },
  brandCard: { borderRadius: 16, borderWidth: 1, borderColor: D.border, padding: 24, alignItems: "center", backgroundColor: D.card, marginTop: 4 },
  brandSymbolRow: { flexDirection: "row", gap: 12, marginBottom: 14 },
  brandGlyph: { fontSize: 22, lineHeight: 28 },
  brandTitle: { fontFamily: "Fraunces_700Bold", fontSize: 22, color: D.text, letterSpacing: 3, marginBottom: 6 },
  brandSub: { fontFamily: "Inter_500Medium", fontSize: 12, letterSpacing: 0.5, marginBottom: 12, fontStyle: "italic" },
  brandTagline: { fontFamily: "Inter_400Regular", fontSize: 13, color: D.muted, textAlign: "center", lineHeight: 21 },
});
