import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

const D = {
  bg: "#FAF8F4",
  bgAlt: "#F2EDE6",
  card: "#FFFFFF",
  border: "#E4DDD5",
  borderLight: "#EDE8E0",
  text: "#1A1614",
  muted: "#7C6F65",
  faded: "#B5A99E",
  rose: "#B8706E",
  roseLight: "#F5EAEA",
  roseBorder: "#D4A0A0",
  slate: "#5C7A8A",
  slateLight: "#EFF5F8",
  slateBorder: "#C8DCE6",
};

export default function AnalysisModeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { productType, fragranceId } = useLocalSearchParams<{ productType: string; fragranceId: string }>();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleCamera = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({ pathname: "/camera-analysis", params: { productType, fragranceId } });
  };

  const handleManual = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: "/questionnaire", params: { productType, fragranceId } });
  };

  return (
    <View style={styles.root}>
      <View style={styles.topStrip} />

      <View style={[styles.container, { paddingTop: topPad + 12, paddingBottom: botPad + 20 }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.productLabel, { color: D.rose }]}>RITUAL BODY WASH</Text>
        </View>

        <View style={styles.titleSection}>
          <Text style={styles.title}>How should we{"\n"}read your skin?</Text>
          <Text style={styles.subtitle}>
            A more detailed reading means a more accurate formula. Choose what works best for you.
          </Text>
        </View>

        <View style={styles.cards}>
          {/* AI Camera Card */}
          <TouchableOpacity activeOpacity={0.88} onPress={handleCamera} style={styles.cardWrap}>
            <View style={[styles.card, { borderColor: D.slateBorder, backgroundColor: D.slateLight }]}>
              <View style={styles.cardTopRow}>
                <View style={[styles.iconBox, { backgroundColor: "#DDEAF0" }]}>
                  <Text style={styles.iconText}>◉</Text>
                </View>
                <View style={[styles.recommendedBadge, { borderColor: D.slateBorder }]}>
                  <View style={[styles.recommendedDot, { backgroundColor: D.slate }]} />
                  <Text style={[styles.recommendedText, { color: D.slate }]}>RECOMMENDED</Text>
                </View>
              </View>
              <Text style={[styles.cardTitle, { color: D.slate }]}>AI Camera Scan</Text>
              <Text style={styles.cardDesc}>
                Take a selfie — our AI reads your skin tone, texture, and hydration in seconds. Fully private.
              </Text>
              <View style={styles.cardCTA}>
                <Text style={[styles.ctaText, { color: D.slate }]}>Use Camera →</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Manual Card */}
          <TouchableOpacity activeOpacity={0.88} onPress={handleManual} style={styles.cardWrap}>
            <View style={[styles.card, { borderColor: D.border, backgroundColor: D.card }]}>
              <View style={styles.cardTopRow}>
                <View style={[styles.iconBox, { backgroundColor: D.bgAlt }]}>
                  <Text style={styles.iconText}>◈</Text>
                </View>
              </View>
              <Text style={styles.cardTitle}>Fill Manually</Text>
              <Text style={styles.cardDesc}>
                Answer 7 short questions about your skin type, concerns, and preferences.
              </Text>
              <View style={styles.cardCTA}>
                <Text style={[styles.ctaText, { color: D.muted }]}>Start Questionnaire →</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.privacyNote}>Your photo is analysed instantly and never stored.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: D.bg },
  topStrip: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 220,
    backgroundColor: D.bgAlt,
  },
  container: { flex: 1, paddingHorizontal: 22 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  backBtn: { paddingVertical: 4 },
  backText: { fontFamily: "Inter_500Medium", fontSize: 14, color: D.muted },
  productLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 9,
    letterSpacing: 2.5,
  },
  titleSection: { marginBottom: 28 },
  title: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 36,
    color: D.text,
    lineHeight: 44,
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: D.muted,
    lineHeight: 22,
  },
  cards: { gap: 12, flex: 1 },
  cardWrap: {},
  card: {
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 20,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: { fontSize: 22 },
  recommendedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#FFFFFF",
  },
  recommendedDot: { width: 5, height: 5, borderRadius: 3 },
  recommendedText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 8.5,
    letterSpacing: 1.5,
  },
  cardTitle: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 22,
    color: D.text,
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  cardDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: D.muted,
    lineHeight: 20,
    marginBottom: 16,
  },
  cardCTA: {},
  ctaText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  privacyNote: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: D.faded,
    textAlign: "center",
    marginTop: 20,
  },
});
