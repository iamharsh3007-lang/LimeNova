import React, { useState, useMemo } from "react";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useFormulation, Formulation, FormulaIngredient } from "@/context/FormulationContext";

const D = {
  bg: "#FAF8F4",
  bgAlt: "#F2EDE6",
  card: "#FFFFFF",
  border: "#E4DDD5",
  text: "#1A1614",
  muted: "#7C6F65",
  faded: "#B5A99E",
  sage: "#6B9E7A",
  sageLight: "#EBF3ED",
  sageBorder: "#B8D4BE",
};

const SECTION_COLORS = ["#6B9E7A", "#5C7A8A", "#B8882A", "#A05C8A"];

function IngredientChip({ ingredient, selected, onToggle }: { ingredient: FormulaIngredient; selected: boolean; onToggle: () => void }) {
  return (
    <TouchableOpacity
      onPress={async () => { await Haptics.selectionAsync(); onToggle(); }}
      style={[styles.chip, selected && styles.chipSelected]}
      activeOpacity={0.8}
    >
      <View style={styles.chipInner}>
        <View style={[styles.chipCheck, selected && styles.chipCheckSel]}>
          {selected && <Text style={styles.checkMark}>✓</Text>}
        </View>
        <View style={styles.chipContent}>
          <Text style={[styles.chipName, selected && styles.chipNameSel]}>{ingredient.name}</Text>
          {ingredient.percentage && <Text style={styles.chipPct}>{ingredient.percentage}</Text>}
        </View>
      </View>
      <Text style={styles.chipPurpose} numberOfLines={2}>{ingredient.purpose}</Text>
    </TouchableOpacity>
  );
}

export default function IngredientPickerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id, fragranceId } = useLocalSearchParams<{ id: string; fragranceId: string }>();
  const { formulations } = useFormulation();

  const formulation = useMemo(() => formulations.find((f) => f.id === id), [formulations, id]);
  const allIngredients = useMemo(() => {
    if (!formulation) return [];
    return [...formulation.baseFormula.ingredients, ...formulation.odorControl.ingredients, ...formulation.skinCareActives.ingredients, ...formulation.fragranceProfile.ingredients];
  }, [formulation]);

  const [selected, setSelected] = useState<Set<string>>(() => new Set(allIngredients.map((i) => i.name)));
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const toggleIngredient = (name: string) => {
    setSelected((prev) => { const next = new Set(prev); if (next.has(name)) next.delete(name); else next.add(name); return next; });
  };

  const handleContinue = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({ pathname: "/product-making", params: { id, fragranceId } });
  };

  if (!formulation) {
    return <View style={[styles.root, { alignItems: "center", justifyContent: "center" }]}><Text style={{ color: D.text }}>Formula not found.</Text></View>;
  }

  const sections = [
    { label: "Base Formula", data: formulation.baseFormula.ingredients, color: SECTION_COLORS[0] },
    { label: "Active Agents", data: formulation.odorControl.ingredients, color: SECTION_COLORS[1] },
    { label: "Skin-Care Actives", data: formulation.skinCareActives.ingredients, color: SECTION_COLORS[2] },
    { label: "Fragrance Profile", data: formulation.fragranceProfile.ingredients, color: SECTION_COLORS[3] },
  ];

  return (
    <View style={styles.root}>
      <View style={styles.headerStrip} />

      <View style={[styles.topBar, { paddingTop: topPad + 12 }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleContinue}>
          <Text style={styles.skipText}>Skip →</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: botPad + 120 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.titleSection}>
          <Text style={[styles.productLabel, { color: D.sage }]}>{formulation.productName.toUpperCase()}</Text>
          <Text style={styles.title}>Your formula{"\n"}ingredients.</Text>
          <Text style={styles.subtitle}>Tap any ingredient to remove it from your formula.</Text>
        </View>

        {sections.map((section) => (
          <View key={section.label} style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionDot, { backgroundColor: section.color }]} />
              <Text style={[styles.sectionLabel, { color: section.color }]}>{section.label.toUpperCase()}</Text>
            </View>
            <View style={styles.chipsGrid}>
              {section.data.map((ing) => (
                <IngredientChip key={ing.name} ingredient={ing} selected={selected.has(ing.name)} onToggle={() => toggleIngredient(ing.name)} />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: botPad + 12 }]}>
        <Text style={styles.selectedCount}>{selected.size} of {allIngredients.length} ingredients selected</Text>
        <TouchableOpacity onPress={handleContinue} activeOpacity={0.85} style={styles.continueBtn}>
          <Text style={styles.continueBtnText}>Continue to Your Bottle →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: D.bg },
  headerStrip: { position: "absolute", top: 0, left: 0, right: 0, height: 180, backgroundColor: D.bgAlt },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 22, paddingBottom: 8 },
  backText: { fontFamily: "Inter_500Medium", fontSize: 14, color: D.muted },
  skipText: { fontFamily: "Inter_500Medium", fontSize: 14, color: D.faded },
  content: { paddingHorizontal: 22, paddingTop: 20 },
  titleSection: { marginBottom: 32 },
  productLabel: { fontFamily: "Inter_600SemiBold", fontSize: 9, letterSpacing: 2.5, marginBottom: 10 },
  title: { fontFamily: "Fraunces_700Bold", fontSize: 34, color: D.text, lineHeight: 42, letterSpacing: -0.5, marginBottom: 10 },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 14, color: D.muted, lineHeight: 22 },
  section: { marginBottom: 28 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  sectionDot: { width: 6, height: 6, borderRadius: 3 },
  sectionLabel: { fontFamily: "Inter_600SemiBold", fontSize: 9.5, letterSpacing: 1.8 },
  chipsGrid: { gap: 8 },
  chip: { backgroundColor: D.card, borderRadius: 12, borderWidth: 1.5, borderColor: D.border, padding: 13 },
  chipSelected: { backgroundColor: D.sageLight, borderColor: D.sageBorder },
  chipInner: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 4 },
  chipCheck: { width: 20, height: 20, borderRadius: 6, borderWidth: 1.5, borderColor: D.border, alignItems: "center", justifyContent: "center" },
  chipCheckSel: { backgroundColor: D.sage, borderColor: D.sage },
  checkMark: { color: "#FFFFFF", fontSize: 11, fontWeight: "700" },
  chipContent: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  chipName: { fontFamily: "Inter_500Medium", fontSize: 14, color: D.muted, flex: 1 },
  chipNameSel: { color: D.text },
  chipPct: { fontFamily: "Inter_400Regular", fontSize: 11, color: D.faded },
  chipPurpose: { fontFamily: "Inter_400Regular", fontSize: 12, color: D.faded, paddingLeft: 30, lineHeight: 17 },
  bottomBar: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "rgba(250,248,244,0.97)", borderTopWidth: 1, borderTopColor: D.border, paddingTop: 14, paddingHorizontal: 22, gap: 8 },
  selectedCount: { fontFamily: "Inter_400Regular", fontSize: 11, color: D.faded, textAlign: "center" },
  continueBtn: { backgroundColor: D.sage, borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  continueBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: "#FFFFFF" },
});
