import React, { useState } from "react";
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
import * as Haptics from "expo-haptics";
import { useFormulation } from "@/context/FormulationContext";

const D = {
  bg: "#FAF8F4",
  card: "#FFFFFF",
  border: "#E4DDD5",
  borderLight: "#EDE8E0",
  text: "#1A1614",
  muted: "#7C6F65",
  faded: "#B5A99E",
  sage: "#6B9E7A",
  rose: "#B8706E",
};

const FRAGRANCES = [
  {
    id: "pure",
    name: "Crystal Pure",
    tagline: "No fragrance — just skin science",
    note: "Unscented · Hypoallergenic · Pure efficacy",
    symbol: "◌",
    color: "#5C7A8A",
    bgColor: "#EFF5F8",
    borderColor: "#C8DCE6",
    value: "unscented",
  },
  {
    id: "atlantic",
    name: "Atlantic Mist",
    tagline: "Sea salt, rain & clean air",
    note: "Fresh · Light · Coastal",
    symbol: "◎",
    color: "#3A8E82",
    bgColor: "#ECFAF7",
    borderColor: "#A8D9D2",
    value: "fresh",
  },
  {
    id: "citrus",
    name: "Citrus Surge",
    tagline: "Bergamot, grapefruit & lime zest",
    note: "Energising · Bright · Zesty",
    symbol: "◑",
    color: "#A07428",
    bgColor: "#F8F3E8",
    borderColor: "#D9C494",
    value: "citrus",
  },
  {
    id: "emerald",
    name: "Emerald Forest",
    tagline: "Irish moss, cedar & wild sage",
    note: "Herbal · Grounding · Wild",
    symbol: "◈",
    color: "#4E8C5C",
    bgColor: "#EBF3ED",
    borderColor: "#A8C9B0",
    value: "herbal",
  },
  {
    id: "bloom",
    name: "Bloom Ritual",
    tagline: "Rose absolute, jasmine & morning dew",
    note: "Floral · Delicate · Feminine",
    symbol: "◇",
    color: "#A05C6A",
    bgColor: "#F8EEEE",
    borderColor: "#D4AAAA",
    value: "floral",
  },
  {
    id: "midnight",
    name: "Midnight Oak",
    tagline: "Sandalwood, vetiver & dark resin",
    note: "Woody · Warm · Mysterious",
    symbol: "◆",
    color: "#5C4E8A",
    bgColor: "#F0EEFC",
    borderColor: "#BCB4D8",
    value: "woody",
  },
];

export default function FragrancePickerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { productType } = useLocalSearchParams<{ productType: string }>();
  const { updateQuestionnaire } = useFormulation();
  const [selected, setSelected] = useState<string | null>(null);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const isDeodorant = productType !== "shower_gel";
  const accent = isDeodorant ? D.sage : D.rose;
  const productLabel = isDeodorant ? "BESPOKE DEODORANT" : "RITUAL BODY WASH";

  const handleSelect = async (f: typeof FRAGRANCES[0]) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(f.id);
  };

  const handleContinue = async () => {
    if (!selected) return;
    const frag = FRAGRANCES.find((f) => f.id === selected);
    if (!frag) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    updateQuestionnaire({ fragranceStyle: frag.value as any });
    if (productType === "shower_gel") {
      router.push({ pathname: "/analysis-mode", params: { productType, fragranceId: selected } });
    } else {
      router.push({ pathname: "/questionnaire", params: { productType, fragranceId: selected } });
    }
  };

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      {/* Header strip */}
      <View style={styles.headerStrip}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.productChip, { color: accent }]}>{productLabel}</Text>
      </View>

      <View style={styles.titleBlock}>
        <Text style={styles.title}>Your signature{"\n"}scent.</Text>
        <Text style={styles.subtitle}>
          Each blend is crafted to complement your personalised formula — and work beautifully with your skin.
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: botPad + 100 }]}
      >
        {FRAGRANCES.map((f) => {
          const isSel = selected === f.id;
          return (
            <TouchableOpacity
              key={f.id}
              onPress={() => handleSelect(f)}
              activeOpacity={0.88}
              style={styles.cardWrap}
            >
              <View style={[
                styles.card,
                { borderColor: isSel ? f.color : D.border },
                isSel && { backgroundColor: f.bgColor },
              ]}>
                {/* Symbol */}
                <View style={[styles.symbolBox, { backgroundColor: isSel ? f.borderColor + "60" : D.bg }]}>
                  <Text style={[styles.symbol, { color: isSel ? f.color : D.faded }]}>{f.symbol}</Text>
                </View>

                {/* Info */}
                <View style={styles.cardInfo}>
                  <Text style={[styles.cardName, { color: isSel ? f.color : D.text }]}>{f.name}</Text>
                  <Text style={styles.cardTagline}>{f.tagline}</Text>
                  <Text style={[styles.cardNote, { color: isSel ? f.color + "AA" : D.faded }]}>{f.note}</Text>
                </View>

                {/* Selected indicator */}
                <View style={[
                  styles.selCircle,
                  { borderColor: isSel ? f.color : D.border },
                  isSel && { backgroundColor: f.color },
                ]}>
                  {isSel && <View style={styles.selInner} />}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Footer CTA */}
      <View style={[styles.footer, { paddingBottom: botPad + 12 }]}>
        <TouchableOpacity
          style={[
            styles.continueBtn,
            { backgroundColor: selected ? accent : D.border },
          ]}
          onPress={handleContinue}
          disabled={!selected}
          activeOpacity={0.85}
        >
          <Text style={styles.continueBtnText}>
            {selected
              ? `Continue with ${FRAGRANCES.find((f) => f.id === selected)?.name ?? ""}`
              : "Select a Scent to Continue"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: D.bg },

  headerStrip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: D.border,
    backgroundColor: D.bg,
  },
  backBtn: { paddingVertical: 4 },
  backText: { fontFamily: "Inter_500Medium", fontSize: 14, color: D.muted },
  productChip: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 9,
    letterSpacing: 2.5,
  },

  titleBlock: {
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: D.borderLight,
  },
  title: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 38,
    lineHeight: 44,
    letterSpacing: -0.8,
    color: D.text,
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: D.muted,
    lineHeight: 20,
  },

  scrollContent: { padding: 16, gap: 10 },

  cardWrap: {},
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: D.card,
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
  },
  symbolBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  symbol: { fontSize: 22, lineHeight: 28 },
  cardInfo: { flex: 1 },
  cardName: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 16,
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  cardTagline: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: D.muted,
    marginBottom: 3,
  },
  cardNote: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    fontStyle: "italic",
  },
  selCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  selInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
  },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: D.bg,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: D.border,
  },
  continueBtn: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
  },
  continueBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: "#FFFFFF",
    letterSpacing: 0.1,
  },
});
