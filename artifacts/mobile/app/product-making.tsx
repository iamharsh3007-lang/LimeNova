import React, { useEffect, useRef, useState } from "react";
import {
  Animated, Easing, Platform, StyleSheet, Text, TouchableOpacity, View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useFormulation } from "@/context/FormulationContext";

const ND = false; // all animations JS-driven to avoid native driver conflict

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

const FRAGRANCE_MAP: Record<string, { name: string; symbol: string; color: string; notes: string }> = {
  pure:     { name: "Crystal Pure",   symbol: "◌", color: "#5C7A8A", notes: "Unscented · Hypoallergenic" },
  atlantic: { name: "Atlantic Mist",  symbol: "◎", color: "#3A8E82", notes: "Sea salt · Clean rain" },
  citrus:   { name: "Citrus Surge",   symbol: "◑", color: "#A07428", notes: "Bergamot · Grapefruit" },
  emerald:  { name: "Emerald Forest", symbol: "◈", color: "#4E8C5C", notes: "Irish moss · Cedar" },
  bloom:    { name: "Bloom Ritual",   symbol: "◇", color: "#A05C6A", notes: "Rose · Jasmine" },
  midnight: { name: "Midnight Oak",   symbol: "◆", color: "#5C4E8A", notes: "Sandalwood · Vetiver" },
};

const PHASES = ["Preparing container", "Adding base formula", "Mixing actives", "Adding fragrance", "Sealing formula", "Formula ready!"];

export default function ProductMakingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id, fragranceId } = useLocalSearchParams<{ id: string; fragranceId: string }>();
  const { formulations } = useFormulation();

  const formulation = formulations.find((f) => f.id === id);
  const fragrance = FRAGRANCE_MAP[fragranceId ?? ""] ?? FRAGRANCE_MAP["emerald"];
  const isDeodorant = formulation?.productType !== "shower_gel";
  const accent = isDeodorant ? D.sage : D.rose;

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [phase, setPhase] = useState(0);
  const [done, setDone] = useState(false);

  const containerScale = useRef(new Animated.Value(0.25)).current;
  const fillHeight = useRef(new Animated.Value(0)).current;
  const capY = useRef(new Animated.Value(-50)).current;
  const capOpacity = useRef(new Animated.Value(0)).current;
  const glowOpacityVal = useRef(new Animated.Value(0.15)).current;
  const doneScale = useRef(new Animated.Value(0)).current;
  const labelOpacity = useRef(new Animated.Value(0)).current;
  const labelSlide = useRef(new Animated.Value(20)).current;
  const shimmerX = useRef(new Animated.Value(-100)).current;
  const bubble1Y = useRef(new Animated.Value(0)).current;
  const bubble2Y = useRef(new Animated.Value(0)).current;
  const bubble3Y = useRef(new Animated.Value(0)).current;
  const bubble1Op = useRef(new Animated.Value(0)).current;
  const bubble2Op = useRef(new Animated.Value(0)).current;
  const bubble3Op = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Glow breathe
    Animated.loop(Animated.sequence([
      Animated.timing(glowOpacityVal, { toValue: 0.45, duration: 1600, useNativeDriver: ND }),
      Animated.timing(glowOpacityVal, { toValue: 0.15, duration: 1600, useNativeDriver: ND }),
    ])).start();

    // Shimmer loop
    Animated.loop(Animated.sequence([
      Animated.timing(shimmerX, { toValue: 120, duration: 1100, useNativeDriver: ND }),
      Animated.timing(shimmerX, { toValue: -100, duration: 0, useNativeDriver: ND }),
      Animated.delay(2200),
    ])).start();

    // Bubble loops
    const makeBubble = (yVal: Animated.Value, opVal: Animated.Value, delay: number) =>
      Animated.loop(Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(opVal, { toValue: 0.7, duration: 250, useNativeDriver: ND }),
          Animated.timing(yVal, { toValue: -60, duration: 1700, useNativeDriver: ND, easing: Easing.out(Easing.quad) }),
        ]),
        Animated.timing(opVal, { toValue: 0, duration: 150, useNativeDriver: ND }),
        Animated.timing(yVal, { toValue: 0, duration: 0, useNativeDriver: ND }),
      ])).start();
    makeBubble(bubble1Y, bubble1Op, 600);
    makeBubble(bubble2Y, bubble2Op, 1300);
    makeBubble(bubble3Y, bubble3Op, 2000);

    // Main sequence
    const TOTAL = 7000;
    Animated.sequence([
      Animated.spring(containerScale, { toValue: 1, tension: 55, friction: 9, useNativeDriver: ND }),
      Animated.timing(fillHeight, { toValue: 1, duration: 3200, useNativeDriver: ND, easing: Easing.out(Easing.cubic) }),
      Animated.parallel([
        Animated.timing(capOpacity, { toValue: 1, duration: 300, useNativeDriver: ND }),
        Animated.timing(capY, { toValue: 0, duration: 600, useNativeDriver: ND, easing: Easing.out(Easing.back(1.4)) }),
      ]),
      Animated.delay(300),
      Animated.parallel([
        Animated.spring(doneScale, { toValue: 1, tension: 90, friction: 8, useNativeDriver: ND }),
        Animated.timing(labelOpacity, { toValue: 1, duration: 500, useNativeDriver: ND }),
        Animated.timing(labelSlide, { toValue: 0, duration: 500, useNativeDriver: ND }),
      ]),
    ]).start(() => setDone(true));

    // Phase timer
    const phaseInterval = setInterval(() => setPhase((p) => p < PHASES.length - 1 ? p + 1 : p), TOTAL / PHASES.length);
    const doneTimer = setTimeout(() => { clearInterval(phaseInterval); setPhase(PHASES.length - 1); }, TOTAL);
    return () => { clearInterval(phaseInterval); clearTimeout(doneTimer); };
  }, []);

  const handleContinue = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace({ pathname: "/payment", params: { id } });
  };

  const ingredientCount = formulation
    ? [...formulation.baseFormula.ingredients, ...formulation.odorControl.ingredients, ...formulation.skinCareActives.ingredients, ...formulation.fragranceProfile.ingredients].length
    : 18;

  return (
    <View style={styles.root}>
      <View style={styles.headerStrip} />

      <View style={[styles.container, { paddingTop: topPad + 8, paddingBottom: botPad + 20 }]}>
        <View style={styles.topBar}>
          <Text style={styles.navLabel}>Virtual Preview</Text>
          <TouchableOpacity onPress={handleContinue}>
            <Text style={styles.skipText}>Skip →</Text>
          </TouchableOpacity>
        </View>

        {/* Bottle stage */}
        <View style={styles.stage}>
          {/* Soft oval spotlight */}
          <Animated.View style={[styles.spotlight, { backgroundColor: fragrance.color, opacity: glowOpacityVal }]} />

          <Animated.View style={{ transform: [{ scale: containerScale }] }}>
            {isDeodorant ? (
              <DeodorantBottle
                fragranceColor={fragrance.color} accent={accent}
                fillHeight={fillHeight} shimmerX={shimmerX}
                capY={capY} capOpacity={capOpacity}
                b1Y={bubble1Y} b1Op={bubble1Op}
                b2Y={bubble2Y} b2Op={bubble2Op}
                b3Y={bubble3Y} b3Op={bubble3Op}
                symbol={fragrance.symbol}
              />
            ) : (
              <ShowerGelBottle
                fragranceColor={fragrance.color} accent={accent}
                fillHeight={fillHeight} shimmerX={shimmerX}
                capY={capY} capOpacity={capOpacity}
                b1Y={bubble1Y} b1Op={bubble1Op}
                b2Y={bubble2Y} b2Op={bubble2Op}
                b3Y={bubble3Y} b3Op={bubble3Op}
                symbol={fragrance.symbol}
              />
            )}
          </Animated.View>

          {done && (
            <Animated.View style={[styles.readyBadge, { backgroundColor: accent, transform: [{ scale: doneScale }] }]}>
              <Text style={styles.readyBadgeText}>✦ Formula Sealed</Text>
            </Animated.View>
          )}
        </View>

        {/* Info panel */}
        <View style={styles.infoPanel}>
          {formulation && <Text style={[styles.formulaName, { color: accent }]}>{formulation.productName.toUpperCase()}</Text>}

          <Animated.View style={[styles.fragranceRow, { opacity: labelOpacity, transform: [{ translateY: labelSlide }] }]}>
            <Text style={[styles.fragranceSymbol, { color: fragrance.color }]}>{fragrance.symbol}</Text>
            <View>
              <Text style={[styles.fragranceName, { color: fragrance.color }]}>{fragrance.name}</Text>
              <Text style={styles.fragranceNotes}>{fragrance.notes}</Text>
            </View>
          </Animated.View>

          <Text style={[styles.phaseText, { color: phase === PHASES.length - 1 ? D.sage : D.muted }]}>{PHASES[phase]}</Text>

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { backgroundColor: accent, width: `${((phase + 1) / PHASES.length) * 100}%` as any }]} />
          </View>

          <Text style={styles.ingredientText}>{ingredientCount} ingredients combined</Text>
        </View>

        {done && (
          <TouchableOpacity onPress={handleContinue} activeOpacity={0.85} style={[styles.ctaBtn, { backgroundColor: accent }]}>
            <Text style={styles.ctaBtnText}>Proceed to Checkout →</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ─── Deodorant Stick ─────────────────────────────────────────────────────────
// Looks like a real oval-cross-section deodorant stick: cap + body + dial base
function DeodorantBottle({ fragranceColor, accent, fillHeight, shimmerX, capY, capOpacity, b1Y, b1Op, b2Y, b2Op, b3Y, b3Op, symbol }: any) {
  const fillPx = fillHeight.interpolate({ inputRange: [0, 1], outputRange: [0, 175] });

  return (
    <View style={ds.wrap}>
      {/* Cap */}
      <Animated.View style={[ds.cap, { backgroundColor: accent, transform: [{ translateY: capY }], opacity: capOpacity }]}>
        <View style={[ds.capTop, { backgroundColor: `${accent}CC` }]} />
        <View style={[ds.capRidge, { backgroundColor: `${accent}80` }]} />
        <View style={[ds.capRidge, { backgroundColor: `${accent}50` }]} />
        <View style={[ds.capHighlight]} />
      </Animated.View>

      {/* Neck connector */}
      <View style={[ds.neck, { backgroundColor: `${accent}50` }]} />

      {/* Shoulder */}
      <View style={[ds.shoulder, { backgroundColor: `${accent}20`, borderColor: `${accent}40` }]}>
        <View style={ds.shoulderHighlight} />
      </View>

      {/* Main body */}
      <View style={ds.body}>
        {/* Background glass/plastic material */}
        <View style={ds.bodyBg} />

        {/* Left highlight strip (light reflection) */}
        <View style={ds.highlightL} />
        {/* Right shadow strip */}
        <View style={ds.shadowR} />

        {/* Fill level */}
        <Animated.View style={[ds.fill, { height: fillPx, backgroundColor: fragranceColor + "90" }]}>
          <View style={[ds.fillHighlight, { backgroundColor: fragranceColor + "30" }]} />
        </Animated.View>

        {/* Bubbles */}
        {[{ y: b1Y, op: b1Op, x: 22 }, { y: b2Y, op: b2Op, x: 48 }, { y: b3Y, op: b3Op, x: 72 }].map((b, i) => (
          <Animated.View key={i} style={[ds.bubble, { left: b.x, opacity: b.op, backgroundColor: fragranceColor + "A0", transform: [{ translateY: b.y }] }]} />
        ))}

        {/* Shimmer sweep */}
        <Animated.View style={[ds.shimmer, { left: shimmerX }]} />

        {/* Label band */}
        <View style={[ds.labelBand, { borderColor: `${accent}25` }]}>
          <Text style={[ds.labelBrandName, { color: accent }]}>FORMULAB</Text>
          <Text style={[ds.labelSymbol, { color: fragranceColor }]}>{symbol}</Text>
          <Text style={ds.labelProduct}>DÉODORANT</Text>
        </View>

        {/* Body border overlay */}
        <View style={ds.bodyBorder} />
      </View>

      {/* Dial / twist base */}
      <View style={[ds.dial, { backgroundColor: `${accent}30`, borderColor: `${accent}50` }]}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={[ds.dialRib, { backgroundColor: `${accent}40` }]} />
        ))}
        <View style={[ds.dialCenter, { backgroundColor: `${accent}20` }]} />
      </View>
    </View>
  );
}

// ─── Shower Gel Pump Bottle ───────────────────────────────────────────────────
// Looks like a real pump dispenser: tall frosted-glass bottle + pump head + nozzle
function ShowerGelBottle({ fragranceColor, accent, fillHeight, shimmerX, capY, capOpacity, b1Y, b1Op, b2Y, b2Op, b3Y, b3Op, symbol }: any) {
  const fillPx = fillHeight.interpolate({ inputRange: [0, 1], outputRange: [0, 185] });

  return (
    <View style={pg.wrap}>
      {/* Pump assembly */}
      <Animated.View style={[pg.pumpAssembly, { transform: [{ translateY: capY }], opacity: capOpacity }]}>
        {/* Nozzle arm (horizontal) */}
        <View style={[pg.nozzleArm, { backgroundColor: accent }]}>
          <View style={[pg.nozzleTip, { backgroundColor: `${accent}CC` }]} />
        </View>
        {/* Pump disc */}
        <View style={[pg.pumpDisc, { backgroundColor: accent }]}>
          <View style={[pg.pumpDiscHighlight]} />
          <View style={[pg.pumpDiscCenter, { backgroundColor: `${accent}AA` }]} />
        </View>
      </Animated.View>

      {/* Pump stem */}
      <View style={[pg.stem, { backgroundColor: `${accent}60` }]} />

      {/* Wide shoulder */}
      <View style={[pg.shoulder, { backgroundColor: `${accent}18`, borderColor: `${accent}35` }]}>
        <View style={pg.shoulderHighlight} />
      </View>

      {/* Main bottle body */}
      <View style={pg.body}>
        {/* Frosted glass base */}
        <View style={pg.bodyBg} />

        {/* Left highlight edge */}
        <View style={pg.highlightL} />
        {/* Right shadow edge */}
        <View style={pg.shadowR} />
        {/* Inner center glow edge */}
        <View style={pg.innerGlow} />

        {/* Gel fill */}
        <Animated.View style={[pg.fill, { height: fillPx, backgroundColor: fragranceColor + "80" }]}>
          <View style={[pg.fillHighlight, { backgroundColor: fragranceColor + "25" }]} />
        </Animated.View>

        {/* Bubbles */}
        {[{ y: b1Y, op: b1Op, x: 18 }, { y: b2Y, op: b2Op, x: 44 }, { y: b3Y, op: b3Op, x: 70 }].map((b, i) => (
          <Animated.View key={i} style={[pg.bubble, { left: b.x, opacity: b.op, backgroundColor: fragranceColor + "90", transform: [{ translateY: b.y }] }]} />
        ))}

        {/* Shimmer */}
        <Animated.View style={[pg.shimmer, { left: shimmerX }]} />

        {/* Label */}
        <View style={[pg.label, { borderColor: `${accent}20`, backgroundColor: `${accent}08` }]}>
          <Text style={[pg.labelBrand, { color: accent }]}>FORMULAB</Text>
          <Text style={[pg.labelSymbol, { color: fragranceColor }]}>{symbol}</Text>
          <Text style={pg.labelProduct}>SHOWER GEL</Text>
        </View>

        {/* Glass border */}
        <View style={pg.bodyBorder} />
      </View>

      {/* Curved base */}
      <View style={[pg.base, { backgroundColor: `${accent}28`, borderColor: `${accent}45` }]}>
        <View style={pg.baseHighlight} />
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: D.bg },
  headerStrip: { position: "absolute", top: 0, left: 0, right: 0, height: 120, backgroundColor: D.bgAlt },
  container: { flex: 1, paddingHorizontal: 22 },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  navLabel: { fontFamily: "Inter_400Regular", fontSize: 12, color: D.faded, letterSpacing: 0.5 },
  skipText: { fontFamily: "Inter_500Medium", fontSize: 13, color: D.faded },
  stage: { flex: 1, alignItems: "center", justifyContent: "center", position: "relative" },
  spotlight: { position: "absolute", width: 260, height: 260, borderRadius: 130 },
  readyBadge: { position: "absolute", bottom: 10, borderRadius: 20, paddingHorizontal: 20, paddingVertical: 10 },
  readyBadgeText: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: "#FFFFFF", letterSpacing: 0.5 },
  infoPanel: { alignItems: "center", gap: 7, paddingBottom: 12 },
  formulaName: { fontFamily: "Inter_600SemiBold", fontSize: 8.5, letterSpacing: 3 },
  fragranceRow: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: D.card, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1, borderColor: D.border },
  fragranceSymbol: { fontSize: 22, lineHeight: 28 },
  fragranceName: { fontFamily: "Fraunces_700Bold", fontSize: 15, letterSpacing: -0.2 },
  fragranceNotes: { fontFamily: "Inter_400Regular", fontSize: 11, color: D.faded, fontStyle: "italic" },
  phaseText: { fontFamily: "Inter_400Regular", fontSize: 13, textAlign: "center" },
  progressTrack: { width: 160, height: 2, backgroundColor: D.border, borderRadius: 2, overflow: "hidden" },
  progressFill: { height: 2, borderRadius: 2 },
  ingredientText: { fontFamily: "Inter_400Regular", fontSize: 11, color: D.faded },
  ctaBtn: { borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 6 },
  ctaBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: "#FFFFFF" },
});

// Deodorant stick styles
const ds = StyleSheet.create({
  wrap: { alignItems: "center" },
  cap: {
    width: 66, height: 42, borderRadius: 14, overflow: "hidden",
    alignItems: "center", justifyContent: "center", gap: 4,
  },
  capTop: { position: "absolute", top: 0, left: 0, right: 0, height: 10, borderRadius: 14 },
  capRidge: { width: 44, height: 3, borderRadius: 2 },
  capHighlight: { position: "absolute", left: 8, top: 8, bottom: 8, width: 5, backgroundColor: "rgba(255,255,255,0.35)", borderRadius: 3 },
  neck: { width: 54, height: 8, borderTopLeftRadius: 3, borderTopRightRadius: 3 },
  shoulder: {
    width: 106, height: 14, borderTopLeftRadius: 6, borderTopRightRadius: 6,
    borderWidth: 1, borderBottomWidth: 0, overflow: "hidden",
  },
  shoulderHighlight: { position: "absolute", top: 0, left: 0, right: 0, height: 4, backgroundColor: "rgba(255,255,255,0.25)" },
  body: {
    width: 106, height: 210, borderRadius: 16, overflow: "hidden",
    borderWidth: 0, position: "relative",
  },
  bodyBg: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(240,236,230,0.7)", borderRadius: 16 },
  highlightL: { position: "absolute", left: 0, top: 0, bottom: 0, width: 14, backgroundColor: "rgba(255,255,255,0.55)", borderTopLeftRadius: 16, borderBottomLeftRadius: 16 },
  shadowR: { position: "absolute", right: 0, top: 0, bottom: 0, width: 8, backgroundColor: "rgba(0,0,0,0.08)", borderTopRightRadius: 16, borderBottomRightRadius: 16 },
  fill: { position: "absolute", bottom: 0, left: 2, right: 2, borderTopLeftRadius: 8, borderTopRightRadius: 8, overflow: "hidden" },
  fillHighlight: { position: "absolute", left: 0, top: 0, bottom: 0, width: "30%", borderTopLeftRadius: 8 },
  bubble: { position: "absolute", bottom: 12, width: 7, height: 7, borderRadius: 4 },
  shimmer: { position: "absolute", top: 0, bottom: 0, width: 14, backgroundColor: "rgba(255,255,255,0.50)", borderRadius: 7 },
  labelBand: {
    position: "absolute", top: "30%", left: 6, right: 6, paddingVertical: 12,
    borderTopWidth: 1, borderBottomWidth: 1, alignItems: "center", gap: 3,
    backgroundColor: "rgba(250,248,244,0.55)",
  },
  labelBrandName: { fontFamily: "Inter_600SemiBold", fontSize: 9, letterSpacing: 4 },
  labelSymbol: { fontSize: 22, lineHeight: 26 },
  labelProduct: { fontFamily: "Inter_400Regular", fontSize: 7.5, color: "rgba(28,22,20,0.4)", letterSpacing: 2.5 },
  bodyBorder: { ...StyleSheet.absoluteFillObject, borderRadius: 16, borderWidth: 1.5, borderColor: "rgba(200,190,182,0.55)" },
  dial: {
    width: 110, height: 24, borderRadius: 8, borderWidth: 1,
    flexDirection: "row", alignItems: "center", justifyContent: "space-around",
    paddingHorizontal: 14, overflow: "hidden",
  },
  dialRib: { width: 2, height: 10, borderRadius: 1 },
  dialCenter: { position: "absolute", left: "30%", right: "30%", top: 0, bottom: 0 },
});

// Shower gel pump styles
const pg = StyleSheet.create({
  wrap: { alignItems: "center" },
  pumpAssembly: { alignItems: "center", position: "relative", width: 100, height: 60, justifyContent: "flex-end" },
  nozzleArm: {
    position: "absolute", right: 0, top: 10, height: 10, width: 46,
    borderTopRightRadius: 5, borderBottomRightRadius: 5,
  },
  nozzleTip: { position: "absolute", right: -8, top: 0, bottom: 0, width: 10, borderRadius: 3 },
  pumpDisc: {
    width: 52, height: 30, borderRadius: 8, alignSelf: "center",
    alignItems: "center", justifyContent: "center", overflow: "hidden",
  },
  pumpDiscHighlight: { position: "absolute", left: 6, top: 4, width: 10, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.5)" },
  pumpDiscCenter: { width: 14, height: 14, borderRadius: 7 },
  stem: { width: 12, height: 20, borderRadius: 4 },
  shoulder: {
    width: 116, height: 18, borderTopLeftRadius: 14, borderTopRightRadius: 14,
    borderWidth: 1, borderBottomWidth: 0, overflow: "hidden",
  },
  shoulderHighlight: { position: "absolute", top: 0, left: 0, right: 0, height: 5, backgroundColor: "rgba(255,255,255,0.3)" },
  body: { width: 116, height: 220, overflow: "hidden", borderRadius: 0, position: "relative" },
  bodyBg: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(238,232,224,0.65)" },
  highlightL: { position: "absolute", left: 0, top: 0, bottom: 0, width: 16, backgroundColor: "rgba(255,255,255,0.6)" },
  shadowR: { position: "absolute", right: 0, top: 0, bottom: 0, width: 9, backgroundColor: "rgba(0,0,0,0.07)" },
  innerGlow: { position: "absolute", left: 16, top: 0, bottom: 0, width: 5, backgroundColor: "rgba(255,255,255,0.2)" },
  fill: { position: "absolute", bottom: 0, left: 2, right: 2, overflow: "hidden" },
  fillHighlight: { position: "absolute", left: 0, top: 0, bottom: 0, width: "28%" },
  bubble: { position: "absolute", bottom: 10, width: 7, height: 7, borderRadius: 4 },
  shimmer: { position: "absolute", top: 0, bottom: 0, width: 15, backgroundColor: "rgba(255,255,255,0.45)", borderRadius: 8 },
  label: {
    position: "absolute", top: "28%", left: 7, right: 7,
    paddingVertical: 14, alignItems: "center", gap: 3,
    borderTopWidth: 1, borderBottomWidth: 1,
  },
  labelBrand: { fontFamily: "Inter_600SemiBold", fontSize: 9, letterSpacing: 4 },
  labelSymbol: { fontSize: 22, lineHeight: 26 },
  labelProduct: { fontFamily: "Inter_400Regular", fontSize: 7, color: "rgba(28,22,20,0.4)", letterSpacing: 2.5 },
  bodyBorder: { ...StyleSheet.absoluteFillObject, borderWidth: 1.5, borderColor: "rgba(195,185,175,0.55)" },
  base: {
    width: 106, height: 14, borderRadius: 8, borderWidth: 1, borderTopWidth: 0, overflow: "hidden",
  },
  baseHighlight: { position: "absolute", top: 0, left: "20%", right: "20%", height: 3, backgroundColor: "rgba(255,255,255,0.4)" },
});
