import React, { useEffect, useRef } from "react";
import { Animated, Easing, Platform, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const D = {
  bg: "#FAF8F4",
  bgAlt: "#F2EDE6",
  border: "#E4DDD5",
  text: "#1A1614",
  muted: "#7C6F65",
  faded: "#B5A99E",
  sage: "#6B9E7A",
  sageLight: "#EBF3ED",
};

const steps = [
  "Analysing skin profile",
  "Checking allergen database",
  "Optimising for your climate",
  "Selecting botanical actives",
  "Building fragrance profile",
  "Finalising formula",
];

export default function GeneratingScreen() {
  const insets = useSafeAreaInsets();
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.94)).current;
  const [activeStep, setActiveStep] = React.useState(0);

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, { toValue: 1, duration: 3000, easing: Easing.linear, useNativeDriver: true })
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.04, duration: 1400, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 0.94, duration: 1400, useNativeDriver: true }),
      ])
    ).start();

    const interval = setInterval(() => {
      setActiveStep((s) => (s < steps.length - 1 ? s + 1 : s));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const rotate = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.topStrip} />

      <View style={styles.center}>
        <View style={styles.orbWrapper}>
          <Animated.View style={[styles.orbRing, { transform: [{ rotate }] }]} />
          <Animated.View style={[styles.orbRing2, { transform: [{ rotate }] }]} />
          <Animated.View style={[styles.orbCore, { transform: [{ scale: scaleAnim }] }]}>
            <View style={styles.orbInner} />
          </Animated.View>
        </View>

        <Text style={styles.title}>Building your{"\n"}formula.</Text>
        <Text style={styles.subtitle}>This takes about 30 seconds.</Text>

        <View style={styles.steps}>
          {steps.map((s, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={[
                styles.stepDot,
                i < activeStep && styles.stepDotDone,
                i === activeStep && styles.stepDotActive,
              ]} />
              <Text style={[
                styles.stepText,
                i < activeStep && styles.stepTextDone,
                i === activeStep && styles.stepTextActive,
              ]}>
                {s}
              </Text>
              {i < activeStep && <Text style={styles.checkMark}>✓</Text>}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: D.bg },
  topStrip: { position: "absolute", top: 0, left: 0, right: 0, height: 200, backgroundColor: D.bgAlt },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
  orbWrapper: { width: 110, height: 110, alignItems: "center", justifyContent: "center", marginBottom: 36 },
  orbRing: {
    position: "absolute", width: 110, height: 110, borderRadius: 55,
    borderWidth: 1.5, borderColor: D.sage, borderStyle: "dashed",
    borderTopColor: "transparent",
  },
  orbRing2: {
    position: "absolute", width: 80, height: 80, borderRadius: 40,
    borderWidth: 1, borderColor: D.border,
    borderStyle: "dashed", borderBottomColor: "transparent",
  },
  orbCore: {
    width: 54, height: 54, borderRadius: 27,
    backgroundColor: D.sageLight, borderWidth: 1.5, borderColor: D.sage,
    alignItems: "center", justifyContent: "center",
  },
  orbInner: { width: 20, height: 20, borderRadius: 10, backgroundColor: D.sage },
  title: { fontFamily: "Fraunces_700Bold", fontSize: 34, color: D.text, textAlign: "center", lineHeight: 42, letterSpacing: -0.5, marginBottom: 8 },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 14, color: D.muted, textAlign: "center", marginBottom: 40 },
  steps: { alignSelf: "stretch", gap: 14 },
  stepRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  stepDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: D.border, flexShrink: 0 },
  stepDotActive: { backgroundColor: D.sage, width: 9, height: 9 },
  stepDotDone: { backgroundColor: D.sage },
  stepText: { fontFamily: "Inter_400Regular", fontSize: 14, color: D.faded, flex: 1 },
  stepTextActive: { fontFamily: "Inter_600SemiBold", color: D.text },
  stepTextDone: { color: D.sage, fontFamily: "Inter_500Medium" },
  checkMark: { fontFamily: "Inter_600SemiBold", fontSize: 12, color: D.sage },
});
