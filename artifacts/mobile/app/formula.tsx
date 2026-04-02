import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useFormulation } from "@/context/FormulationContext";
import { FormulaCard } from "@/components/FormulaCard";

const D = {
  bg: "#08111E",
  card: "rgba(255,255,255,0.06)",
  cardBorder: "rgba(255,255,255,0.10)",
  green: "#4CAF6E",
  blue: "#4A7CF7",
  gold: "#C9A84C",
  purple: "#8B6CF7",
  white: "#FFFFFF",
  muted: "rgba(255,255,255,0.55)",
  faded: "rgba(255,255,255,0.3)",
};

const SECTION_COLORS = [D.green, D.blue, D.gold, D.purple];

export default function FormulaScreen() {
  const { id, paid } = useLocalSearchParams<{ id: string; paid?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { formulations } = useFormulation();

  const formulation = formulations.find((f) => f.id === id);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const isPaid = paid === "true";
  const isDeodorant = formulation?.productType === "deodorant";
  const accentColor = isDeodorant ? D.green : D.blue;

  if (!formulation) {
    return (
      <View style={[styles.container, { paddingTop: topPad, alignItems: "center", justifyContent: "center" }]}>
        <LinearGradient colors={["#08111E", "#0C1A2E"]} style={StyleSheet.absoluteFill} />
        <Text style={styles.errorText}>Formula not found.</Text>
        <TouchableOpacity onPress={() => router.replace("/")}>
          <Text style={styles.errorLink}>Go home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const sections = [
    formulation.baseFormula,
    formulation.odorControl,
    formulation.skinCareActives,
    formulation.fragranceProfile,
  ];

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <LinearGradient colors={["#08111E", "#0C1A2E", "#08111E"]} style={StyleSheet.absoluteFill} />

      <View style={styles.nav}>
        <TouchableOpacity onPress={() => router.replace("/")} style={styles.navBtn}>
          <Feather name="x" size={18} color={D.muted} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)}
          style={styles.navBtn}
        >
          <Feather name="share" size={18} color={D.muted} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {isPaid && (
          <View style={styles.paidBanner}>
            <LinearGradient colors={[`${accentColor}25`, `${accentColor}10`]} style={StyleSheet.absoluteFill} />
            <Text style={styles.paidEmoji}>✅</Text>
            <View>
              <Text style={[styles.paidTitle, { color: accentColor }]}>Order Confirmed!</Text>
              <Text style={styles.paidSubtitle}>Your formula will ship in 3–5 business days.</Text>
            </View>
          </View>
        )}

        <View style={styles.hero}>
          <View style={[styles.heroBadge, { backgroundColor: `${accentColor}20`, borderColor: `${accentColor}40` }]}>
            <Text style={[styles.heroBadgeText, { color: accentColor }]}>
              {isDeodorant ? "🌿 Custom Deodorant" : "💧 Custom Shower Gel"}
            </Text>
          </View>
          <Text style={styles.productName}>{formulation.productName}</Text>
          <Text style={styles.tagline}>{formulation.tagline}</Text>
          <Text style={styles.date}>
            Formulated{" "}
            {new Date(formulation.createdAt).toLocaleDateString("en-IE", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </Text>
        </View>

        {sections.map((section, i) =>
          section ? <FormulaCard key={i} section={section} accentColor={SECTION_COLORS[i]} /> : null
        )}

        {formulation.applicationInstructions && (
          <View style={styles.infoCard}>
            <Feather name="info" size={16} color={D.muted} style={{ marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoTitle}>How to use</Text>
              <Text style={styles.infoText}>{formulation.applicationInstructions}</Text>
            </View>
          </View>
        )}

        {formulation.irishWaterNote && (
          <View style={[styles.infoCard, styles.irishCard]}>
            <Text style={styles.irishFlag}>🇮🇪</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.infoTitle, { color: D.green }]}>Irish Climate Optimised</Text>
              <Text style={styles.infoText}>{formulation.irishWaterNote}</Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={styles.newBtn}
          onPress={() => router.replace("/")}
          activeOpacity={0.85}
        >
          <LinearGradient colors={[D.green, "#3A9E5F"]} style={styles.newBtnGradient}>
            <Text style={styles.newBtnText}>Create Another Formula</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: D.bg },
  nav: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: D.card,
    borderWidth: 1,
    borderColor: D.cardBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 8 },
  paidBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(76,175,110,0.3)",
    padding: 14,
    marginBottom: 20,
    overflow: "hidden",
    position: "relative",
  },
  paidEmoji: { fontSize: 24 },
  paidTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    marginBottom: 2,
  },
  paidSubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: D.muted,
  },
  hero: {
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
    marginBottom: 16,
  },
  heroBadge: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  heroBadgeText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    letterSpacing: 0.3,
  },
  productName: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 30,
    color: D.white,
    lineHeight: 38,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  tagline: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: D.muted,
    lineHeight: 22,
    marginBottom: 10,
    fontStyle: "italic",
  },
  date: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: D.faded,
  },
  infoCard: {
    backgroundColor: D.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: D.cardBorder,
    padding: 16,
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  irishCard: {
    borderColor: "rgba(76,175,110,0.3)",
    backgroundColor: "rgba(76,175,110,0.06)",
  },
  irishFlag: { fontSize: 20, marginTop: 1 },
  infoTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: D.white,
    marginBottom: 4,
  },
  infoText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: D.muted,
    lineHeight: 19,
  },
  newBtn: {
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 8,
  },
  newBtnGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  newBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: D.white,
  },
  errorText: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: D.muted,
    textAlign: "center",
    marginTop: 40,
  },
  errorLink: {
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    color: D.green,
    textAlign: "center",
    marginTop: 12,
  },
});
