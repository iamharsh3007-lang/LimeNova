import React, { useEffect, useRef, useState } from "react";
import {
  Alert, Animated, Easing, Platform, StyleSheet,
  Text, TouchableOpacity, View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";
import { useFormulation } from "@/context/FormulationContext";
import { analyseSkinFromImage, generateFormulation } from "@/lib/gemini";

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
  rose: "#B8706E",
  roseLight: "#F5ECEA",
};

type Stage = "idle" | "analysing" | "done" | "error";

const ANALYSIS_STEPS = [
  "Reading skin tone",
  "Detecting hydration levels",
  "Identifying skin concerns",
  "Building your profile",
  "Preparing your formula",
];

export default function CameraAnalysisScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { productType, fragranceId } = useLocalSearchParams<{ productType: string; fragranceId: string }>();
  const { updateQuestionnaire, addFormulation, setIsGenerating, setGenerationError } = useFormulation();

  const [stage, setStage] = useState<Stage>("idle");
  const [activeStep, setActiveStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const pulseAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 1800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (stage !== "analysing") return;
    const loop = Animated.loop(
      Animated.timing(rotateAnim, { toValue: 1, duration: 2400, easing: Easing.linear, useNativeDriver: true })
    );
    loop.start();
    const interval = setInterval(() => {
      setActiveStep((s) => (s < ANALYSIS_STEPS.length - 1 ? s + 1 : s));
    }, 1600);
    return () => { loop.stop(); clearInterval(interval); };
  }, [stage]);

  const runAnalysis = async (base64: string) => {
    setStage("analysing");
    setActiveStep(0);
    try {
      const skinData = await analyseSkinFromImage(base64, productType ?? "deodorant");
      updateQuestionnaire({ ...skinData, productType: (productType ?? "deodorant") as any });
      setIsGenerating(true);
      setGenerationError(null);
      router.replace("/generating");
      const formulation = await generateFormulation({ ...skinData, productType: (productType ?? "deodorant") as any });
      addFormulation(formulation);
      router.replace({ pathname: "/ingredient-picker", params: { id: formulation.id, fragranceId } });
    } catch (e: any) {
      setGenerationError(e?.message ?? "Analysis failed");
      setIsGenerating(false);
      setStage("error");
      // Use the API's specific error message — it already explains what went wrong
      setErrorMsg(e?.message ?? "We couldn't analyse your skin from that image. Please try again with better lighting, or use the questionnaire instead.");
    }
  };

  const handleTakePhoto = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Camera Access Required", "Please allow camera access in your device settings, or use 'Upload Photo' instead.", [{ text: "OK" }]);
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: "images", allowsEditing: true, aspect: [1, 1], quality: 0.35, base64: true });
    if (result.canceled || !result.assets?.[0]) return;
    const base64 = result.assets[0].base64;
    if (!base64) { setErrorMsg("Could not read image."); setStage("error"); return; }
    await runAnalysis(base64);
  };

  const handleUploadPhoto = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: "images", allowsEditing: true, aspect: [1, 1], quality: 0.35, base64: true });
    if (result.canceled || !result.assets?.[0]) return;
    const base64 = result.assets[0].base64;
    if (!base64) { setErrorMsg("Could not read image."); setStage("error"); return; }
    await runAnalysis(base64);
  };

  const pulseScale = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.93, 1.07] });
  const pulseOpacity = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.55] });
  const rotate = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  return (
    <View style={styles.root}>
      <View style={styles.headerStrip} />
      <View style={[styles.container, { paddingTop: topPad + 12, paddingBottom: botPad + 20 }]}>

        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={16} color={D.muted} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push({ pathname: "/questionnaire", params: { productType } })}>
            <Text style={styles.skipText}>Use Questionnaire →</Text>
          </TouchableOpacity>
        </View>

        {/* ── IDLE ─────────────────────────────────────────────── */}
        {stage === "idle" && (
          <>
            <View style={styles.titleSection}>
              <View style={styles.accentBar} />
              <Text style={styles.title}>AI Skin{"\n"}Analysis</Text>
              <Text style={styles.subtitle}>
                Take or upload a photo of your face, arm, or the area you want formulated for. Our AI reads your skin type and concerns instantly.
              </Text>
            </View>

            <View style={styles.cameraFrame}>
              <Animated.View style={[styles.cameraGlow, { opacity: pulseOpacity, transform: [{ scale: pulseScale }] }]} />
              <View style={styles.ovalGuide}>
                <View style={[styles.cornerTL, { borderColor: D.sage }]} />
                <View style={[styles.cornerTR, { borderColor: D.sage }]} />
                <View style={[styles.cornerBL, { borderColor: D.sage }]} />
                <View style={[styles.cornerBR, { borderColor: D.sage }]} />
                <View style={styles.ovalInner}>
                  <Text style={styles.faceGlyph}>◎</Text>
                  <Text style={styles.faceHint}>Position skin area here</Text>
                </View>
              </View>
            </View>

            <View style={styles.btnStack}>
              <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: D.sage }]} onPress={handleTakePhoto} activeOpacity={0.85}>
                <Feather name="camera" size={17} color="#FFFFFF" />
                <Text style={styles.primaryBtnText}>Take a Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryBtn} onPress={handleUploadPhoto} activeOpacity={0.8}>
                <Feather name="upload" size={15} color={D.muted} />
                <Text style={styles.secondaryBtnText}>Upload from Gallery</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.privacyRow}>
              <Feather name="lock" size={11} color={D.faded} />
              <Text style={styles.privacyNote}>Photo is analysed instantly and never stored</Text>
            </View>
          </>
        )}

        {/* ── ANALYSING ─────────────────────────────────────────── */}
        {stage === "analysing" && (
          <View style={styles.analysingSection}>
            <View style={styles.orbWrapper}>
              <Animated.View style={[styles.orbRing, { transform: [{ rotate }] }]} />
              <View style={styles.orbCore}>
                <View style={styles.orbInner} />
              </View>
            </View>

            <Text style={styles.analysingTitle}>Analysing{"\n"}your skin.</Text>
            <Text style={styles.analysingSubtitle}>AI is reading your skin profile</Text>

            <View style={styles.stepsList}>
              {ANALYSIS_STEPS.map((step, i) => (
                <View key={i} style={styles.stepRow}>
                  <View style={[styles.stepDot, i < activeStep && styles.stepDone, i === activeStep && styles.stepActive]} />
                  <Text style={[styles.stepText, i === activeStep && styles.stepTextActive, i < activeStep && styles.stepTextDone]}>{step}</Text>
                  {i < activeStep && <Text style={styles.checkMark}>✓</Text>}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── ERROR ─────────────────────────────────────────────── */}
        {stage === "error" && (
          <View style={styles.errorSection}>
            <View style={styles.errorIconBox}>
              <Feather name="alert-circle" size={32} color={D.rose} />
            </View>
            <Text style={styles.errorTitle}>Photo Not Recognised</Text>
            <Text style={styles.errorMsg}>{errorMsg}</Text>

            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: D.sage }]} onPress={() => setStage("idle")} activeOpacity={0.85}>
              <Feather name="refresh-cw" size={16} color="#FFFFFF" />
              <Text style={styles.primaryBtnText}>Try Again</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.manualBtn} onPress={() => router.replace({ pathname: "/questionnaire", params: { productType } })}>
              <Text style={styles.manualBtnText}>Use Manual Questionnaire instead →</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: D.bg },
  headerStrip: { position: "absolute", top: 0, left: 0, right: 0, height: 180, backgroundColor: D.bgAlt },
  container: { flex: 1, paddingHorizontal: 22 },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 24 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  backText: { fontFamily: "Inter_500Medium", fontSize: 14, color: D.muted },
  skipText: { fontFamily: "Inter_500Medium", fontSize: 13, color: D.faded },
  titleSection: { marginBottom: 28 },
  accentBar: { width: 28, height: 3, backgroundColor: D.rose, borderRadius: 2, marginBottom: 16 },
  title: { fontFamily: "Fraunces_700Bold", fontSize: 36, color: D.text, lineHeight: 44, letterSpacing: -0.6, marginBottom: 12 },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 14, color: D.muted, lineHeight: 22 },
  cameraFrame: { alignItems: "center", justifyContent: "center", marginBottom: 28, height: 250 },
  cameraGlow: { position: "absolute", width: 240, height: 240, borderRadius: 120, backgroundColor: D.sage },
  ovalGuide: { width: 190, height: 230, borderRadius: 95, borderWidth: 1.5, borderColor: D.sageBorder, alignItems: "center", justifyContent: "center", position: "relative", backgroundColor: "rgba(235,243,237,0.4)" },
  cornerTL: { position: "absolute", top: -2, left: -2, width: 22, height: 22, borderTopWidth: 2.5, borderLeftWidth: 2.5, borderTopLeftRadius: 6 },
  cornerTR: { position: "absolute", top: -2, right: -2, width: 22, height: 22, borderTopWidth: 2.5, borderRightWidth: 2.5, borderTopRightRadius: 6 },
  cornerBL: { position: "absolute", bottom: -2, left: -2, width: 22, height: 22, borderBottomWidth: 2.5, borderLeftWidth: 2.5, borderBottomLeftRadius: 6 },
  cornerBR: { position: "absolute", bottom: -2, right: -2, width: 22, height: 22, borderBottomWidth: 2.5, borderRightWidth: 2.5, borderBottomRightRadius: 6 },
  ovalInner: { alignItems: "center", gap: 8 },
  faceGlyph: { fontSize: 52, color: D.sage, lineHeight: 60 },
  faceHint: { fontFamily: "Inter_400Regular", fontSize: 11, color: D.faded, fontStyle: "italic" },
  btnStack: { gap: 10, marginBottom: 14 },
  primaryBtn: { borderRadius: 14, paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9 },
  primaryBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: "#FFFFFF" },
  secondaryBtn: { borderWidth: 1.5, borderColor: D.border, borderRadius: 14, paddingVertical: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: D.card },
  secondaryBtnText: { fontFamily: "Inter_500Medium", fontSize: 14, color: D.muted },
  privacyRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 },
  privacyNote: { fontFamily: "Inter_400Regular", fontSize: 11, color: D.faded },
  analysingSection: { flex: 1, alignItems: "center", justifyContent: "center" },
  orbWrapper: { width: 100, height: 100, alignItems: "center", justifyContent: "center", marginBottom: 32 },
  orbRing: { position: "absolute", width: 100, height: 100, borderRadius: 50, borderWidth: 1.5, borderColor: D.sage, borderStyle: "dashed", borderTopColor: "transparent" },
  orbCore: { width: 60, height: 60, borderRadius: 30, backgroundColor: D.sageLight, borderWidth: 1, borderColor: D.sageBorder, alignItems: "center", justifyContent: "center" },
  orbInner: { width: 22, height: 22, borderRadius: 11, backgroundColor: D.sage },
  analysingTitle: { fontFamily: "Fraunces_700Bold", fontSize: 32, color: D.text, textAlign: "center", lineHeight: 40, letterSpacing: -0.4, marginBottom: 8 },
  analysingSubtitle: { fontFamily: "Inter_400Regular", fontSize: 13, color: D.muted, marginBottom: 36 },
  stepsList: { alignSelf: "stretch", gap: 14 },
  stepRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  stepDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: D.border, flexShrink: 0 },
  stepActive: { backgroundColor: D.sage, width: 9, height: 9 },
  stepDone: { backgroundColor: D.sage },
  stepText: { fontFamily: "Inter_400Regular", fontSize: 14, color: D.faded, flex: 1 },
  stepTextActive: { fontFamily: "Inter_600SemiBold", color: D.text },
  stepTextDone: { fontFamily: "Inter_500Medium", color: D.sage },
  checkMark: { fontFamily: "Inter_600SemiBold", fontSize: 12, color: D.sage },
  errorSection: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 8 },
  errorIconBox: { width: 72, height: 72, borderRadius: 36, backgroundColor: D.roseLight, borderWidth: 1, borderColor: "#E8C0BB", alignItems: "center", justifyContent: "center", marginBottom: 20 },
  errorTitle: { fontFamily: "Fraunces_700Bold", fontSize: 26, color: D.text, marginBottom: 12, textAlign: "center" },
  errorMsg: { fontFamily: "Inter_400Regular", fontSize: 14, color: D.muted, textAlign: "center", lineHeight: 23, marginBottom: 28, paddingHorizontal: 8 },
  manualBtn: { padding: 12 },
  manualBtnText: { fontFamily: "Inter_500Medium", fontSize: 14, color: D.faded, textAlign: "center" },
});
