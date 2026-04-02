import React, { useRef, useState } from "react";
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
import { Feather } from "@expo/vector-icons";
import { useFormulation, SkinType, SweatLevel, SkinIssue, Allergy, Lifestyle, FragranceStyle, TexturePreference } from "@/context/FormulationContext";
import { QuestionCard } from "@/components/QuestionCard";
import { ProgressBar } from "@/components/ProgressBar";
import { generateFormulation } from "@/lib/gemini";

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
};

const STEPS_DEODORANT = ["product","skinType","sweatLevel","skinIssues","allergies","lifestyle","fragranceStyle","texturePreference"] as const;
const STEPS_SHOWER_GEL = ["product","skinType","skinIssues","allergies","lifestyle","fragranceStyle","texturePreference"] as const;

export default function QuestionnaireScreen() {
  const { productType, fragranceId } = useLocalSearchParams<{ productType: string; fragranceId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const { questionnaire, updateQuestionnaire, setIsGenerating, setGenerationError, addFormulation } = useFormulation();

  const STEPS = productType === "shower_gel" ? STEPS_SHOWER_GEL : STEPS_DEODORANT;
  const [step, setStep] = useState(1);
  const currentStepKey = STEPS[step - 1];
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const isDeodorant = productType !== "shower_gel";
  const accent = isDeodorant ? D.sage : D.rose;

  React.useEffect(() => {
    updateQuestionnaire({ productType: productType as any });
  }, [productType]);

  const canProceed = () => {
    switch (currentStepKey) {
      case "product": return true;
      case "skinType": return !!questionnaire.skinType;
      case "sweatLevel": return !!questionnaire.sweatLevel;
      case "skinIssues": return true;
      case "allergies": return true;
      case "lifestyle": return !!questionnaire.lifestyle;
      case "fragranceStyle": return !!questionnaire.fragranceStyle;
      case "texturePreference": return !!questionnaire.texturePreference;
    }
  };

  const handleNext = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    if (step < STEPS.length) {
      setStep((s) => s + 1);
    } else {
      await handleGenerate();
    }
  };

  const handleBack = () => {
    if (step === 1) router.back();
    else setStep((s) => s - 1);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerationError(null);
    router.replace("/generating");
    try {
      const formulation = await generateFormulation(questionnaire);
      addFormulation(formulation);
      router.replace({ pathname: "/ingredient-picker", params: { id: formulation.id, fragranceId } });
    } catch (e: any) {
      setGenerationError(e?.message ?? "Something went wrong");
      setIsGenerating(false);
      router.replace("/error");
    }
  };

  const renderStep = () => {
    switch (currentStepKey) {
      case "product":
        return (
          <View style={styles.welcomeBlock}>
            <View style={[styles.welcomeAccentBar, { backgroundColor: accent }]} />
            <Text style={styles.welcomeTitle}>Your formula{"\n"}begins here.</Text>
            <Text style={styles.welcomeSubtitle}>
              A few questions helps us understand your skin precisely — so we can build something that actually works for you.
            </Text>
            <View style={[styles.productPill, { borderColor: accent + "60", backgroundColor: accent + "12" }]}>
              <View style={[styles.productPillDot, { backgroundColor: accent }]} />
              <Text style={[styles.productPillText, { color: accent }]}>
                {productType === "deodorant" ? "Bespoke Deodorant" : "Ritual Body Wash"}
              </Text>
            </View>
          </View>
        );

      case "skinType":
        return <QuestionCard question="What's your skin type?" subtitle="This determines your base formula."
          selected={questionnaire.skinType} onSelect={(v) => updateQuestionnaire({ skinType: v as SkinType })}
          options={[
            { value: "normal", label: "Normal", description: "Balanced — rarely oily or dry" },
            { value: "dry", label: "Dry", description: "Often tight or flaky" },
            { value: "oily", label: "Oily", description: "Shiny, prone to breakouts" },
            { value: "combination", label: "Combination", description: "Oily T-zone, dry elsewhere" },
            { value: "sensitive", label: "Sensitive", description: "Reacts easily to products" },
          ]} />;

      case "sweatLevel":
        return <QuestionCard question="How much do you sweat?" subtitle="Calibrates your odour control strength."
          selected={questionnaire.sweatLevel} onSelect={(v) => updateQuestionnaire({ sweatLevel: v as SweatLevel })}
          options={[
            { value: "light", label: "Light", description: "Rarely sweat unless exercising heavily" },
            { value: "moderate", label: "Moderate", description: "Regular sweating throughout the day" },
            { value: "heavy", label: "Heavy", description: "Sweat frequently, need strong protection" },
          ]} />;

      case "skinIssues":
        return <QuestionCard question="Any specific skin concerns?" subtitle="Select all that apply — we'll add targeted actives."
          selected={questionnaire.skinIssues} multiSelect
          onSelect={(v) => {
            const issues = questionnaire.skinIssues; const val = v as SkinIssue;
            updateQuestionnaire({ skinIssues: issues.includes(val) ? issues.filter(i => i !== val) : [...issues, val] });
          }}
          options={[
            { value: "redness", label: "Redness", description: "Niacinamide targets this" },
            { value: "itching", label: "Itching / Irritation", description: "Allantoin & colloidal oat" },
            { value: "dryness", label: "Dryness", description: "Ceramides & hyaluronic acid" },
            { value: "darkening", label: "Darkening", description: "Alpha-arbutin & Vitamin C" },
            { value: "acne", label: "Acne-prone", description: "Salicylic acid & zinc PCA" },
            { value: "irritation", label: "Post-shave irritation", description: "Bisabolol & allantoin" },
          ]} />;

      case "allergies":
        return <QuestionCard question="Any known allergies?" subtitle="Select all that apply — these will be excluded."
          selected={questionnaire.allergies} multiSelect
          onSelect={(v) => {
            const allergies = questionnaire.allergies; const val = v as Allergy;
            updateQuestionnaire({ allergies: allergies.includes(val) ? allergies.filter(a => a !== val) : [...allergies, val] });
          }}
          options={[
            { value: "fragrances", label: "Synthetic fragrances" },
            { value: "alcohol", label: "Alcohol (ethanol)" },
            { value: "parabens", label: "Parabens" },
            { value: "sulfates", label: "Sulfates (SLS/SLES)" },
            { value: "lanolin", label: "Lanolin / wool derivatives" },
            { value: "propylene_glycol", label: "Propylene glycol" },
          ]} />;

      case "lifestyle":
        return <QuestionCard question="How would you describe your lifestyle?" subtitle="We'll calibrate for your activity level."
          selected={questionnaire.lifestyle} onSelect={(v) => updateQuestionnaire({ lifestyle: v as Lifestyle })}
          options={[
            { value: "office", label: "Office / Indoor", description: "Mostly seated, air-conditioned environments" },
            { value: "active", label: "Active / Sport", description: "Daily exercise, gym, outdoor sports" },
            { value: "outdoor", label: "Outdoor Worker", description: "Physical work in varying weather" },
            { value: "mixed", label: "Mixed", description: "Varies day to day" },
          ]} />;

      case "fragranceStyle":
        return <QuestionCard question="What fragrance style do you prefer?"
          selected={questionnaire.fragranceStyle} onSelect={(v) => updateQuestionnaire({ fragranceStyle: v as FragranceStyle })}
          options={[
            { value: "unscented", label: "Unscented", description: "Zero fragrance, pure efficacy" },
            { value: "fresh", label: "Fresh & Clean", description: "Light aquatic, clean cotton" },
            { value: "citrus", label: "Citrus", description: "Bergamot, lemon, grapefruit" },
            { value: "herbal", label: "Herbal / Green", description: "Sage, eucalyptus, fern" },
            { value: "floral", label: "Floral", description: "Rose, jasmine, soft white flowers" },
            { value: "woody", label: "Woody / Earthy", description: "Cedarwood, vetiver, sandalwood" },
          ]} />;

      case "texturePreference":
        return <QuestionCard
          question="What texture do you prefer?"
          subtitle={productType === "deodorant" ? "Choose your deodorant format." : "Choose your shower gel consistency."}
          selected={questionnaire.texturePreference} onSelect={(v) => updateQuestionnaire({ texturePreference: v as TexturePreference })}
          options={productType === "deodorant" ? [
            { value: "stick", label: "Stick", description: "Classic, easy to apply, no mess" },
            { value: "cream", label: "Cream", description: "Soft, moisturising application" },
            { value: "spray", label: "Spray", description: "Quick-dry, refreshing mist" },
            { value: "gel", label: "Clear Gel", description: "Lightweight, invisible finish" },
          ] : [
            { value: "gel", label: "Lightweight Gel", description: "Rinses clean, no residue" },
            { value: "cream", label: "Creamy Lather", description: "Rich, moisturising foam" },
            { value: "foam", label: "Airy Foam", description: "Dense, spa-like experience" },
          ]} />;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      {/* Warm header strip */}
      <View style={styles.headerStrip} />

      <View style={styles.nav}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Feather name="arrow-left" size={18} color={D.muted} />
        </TouchableOpacity>
        <ProgressBar current={step} total={STEPS.length} />
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 100 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {renderStep()}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 12 }]}>
        <TouchableOpacity
          style={[styles.nextBtn, { backgroundColor: canProceed() ? accent : D.border }]}
          onPress={handleNext}
          disabled={!canProceed()}
          activeOpacity={0.85}
          testID="next-btn"
        >
          <Text style={[styles.nextBtnText, !canProceed() && { color: D.faded }]}>
            {step === STEPS.length ? "Generate My Formula" : "Continue"}
          </Text>
          <Feather name="arrow-right" size={16} color={canProceed() ? "#FFFFFF" : D.faded} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: D.bg },
  headerStrip: { position: "absolute", top: 0, left: 0, right: 0, height: 160, backgroundColor: D.bgAlt },
  nav: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 14, gap: 14 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: D.card, borderWidth: 1, borderColor: D.border, alignItems: "center", justifyContent: "center" },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 16 },
  welcomeBlock: { paddingTop: 8 },
  welcomeAccentBar: { width: 32, height: 3, borderRadius: 2, marginBottom: 20 },
  welcomeTitle: { fontFamily: "Fraunces_700Bold", fontSize: 38, color: D.text, lineHeight: 46, letterSpacing: -0.8, marginBottom: 14 },
  welcomeSubtitle: { fontFamily: "Inter_400Regular", fontSize: 15, color: D.muted, lineHeight: 24, marginBottom: 28 },
  productPill: { flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 9, alignSelf: "flex-start" },
  productPillDot: { width: 6, height: 6, borderRadius: 3 },
  productPillText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  footer: { paddingHorizontal: 24, paddingTop: 12, backgroundColor: D.bg, borderTopWidth: 1, borderTopColor: D.border },
  nextBtn: { borderRadius: 14, paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  nextBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 16, color: "#FFFFFF" },
});
