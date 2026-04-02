import React, { useEffect, useRef } from "react";
import {
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFormulation } from "@/context/FormulationContext";

const D = {
  bg: "#FAF8F4",
  bgAlt: "#F2EDE6",
  card: "#FFFFFF",
  border: "#E4DDD5",
  borderLight: "#EDE8E0",
  text: "#1A1614",
  muted: "#7C6F65",
  faded: "#B5A99E",
  sage: "#6B9E7A",
  sageLight: "#EBF3ED",
  sageBorder: "#C0D9C6",
  gold: "#B8882A",
  goldLight: "#F5EDDB",
  goldBorder: "#D4B97A",
  rose: "#B8706E",
  roseLight: "#F5EAEA",
  roseBorder: "#D4A0A0",
  cream: "#EDE4D8",
};

const products = [
  {
    type: "deodorant" as const,
    name: "Bespoke Deodorant",
    tagline: "SKIN-FIRST FORMULA",
    description: "Tailored actives that work with your skin's natural chemistry. All-day freshness, without compromise.",
    icon: "◈",
    accent: D.sage,
    bg: D.sageLight,
    border: D.sageBorder,
    priceFull: "€24.99",
    priceNote: "Free delivery",
  },
  {
    type: "shower_gel" as const,
    name: "Ritual Body Wash",
    tagline: "MINERAL BALANCE RITUAL",
    description: "Designed to counteract hard water's harsh minerals. Leaves skin nourished, balanced, and alive.",
    icon: "◉",
    accent: D.rose,
    bg: D.roseLight,
    border: D.roseBorder,
    priceFull: "€29.99",
    priceNote: "Free delivery",
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { formulations } = useFormulation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  useEffect(() => {
    AsyncStorage.getItem("@limenova_onboarded").then((v) => {
      if (!v) router.replace("/onboarding");
    });
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.root}>
      {/* Top warm gradient strip */}
      <View style={styles.topStrip} />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: topPad + 8, paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 60 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Nav bar */}
        <View style={styles.nav}>
          <View>
            <Text style={styles.navBrand}>FORMULAB</Text>
            <View style={styles.navTagRow}>
              <View style={styles.navDot} />
              <Text style={styles.navTag}>Personalised skin care</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.profileBtn} onPress={() => router.push("/profile")}>
            <Feather name="user" size={16} color={D.muted} />
          </TouchableOpacity>
        </View>

        {/* Hero */}
        <Animated.View style={[styles.hero, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.heroEyebrow}>BESPOKE · BOTANICAL · INTELLIGENT</Text>
          <Text style={styles.heroTitle}>Your formula,{"\n"}perfected.</Text>
          <Text style={styles.heroSub}>
            Skin care formulated precisely for you — by AI, inspired by nature, crafted for your climate.
          </Text>
        </Animated.View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>Choose your formula</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Product Cards */}
        {products.map((p) => (
          <TouchableOpacity
            key={p.type}
            activeOpacity={0.88}
            testID={`product-${p.type}`}
            onPress={() => router.push({ pathname: "/fragrance-picker", params: { productType: p.type } })}
            style={styles.productCardWrap}
          >
            <View style={[styles.productCard, { borderColor: p.border }]}>
              {/* Tinted top area */}
              <View style={[styles.productCardTop, { backgroundColor: p.bg, borderBottomColor: p.border }]}>
                <View style={styles.productIconCircle}>
                  <Text style={[styles.productIconText, { color: p.accent }]}>{p.icon}</Text>
                </View>
                <View style={styles.productCardTopRight}>
                  <Text style={[styles.productTagline, { color: p.accent }]}>{p.tagline}</Text>
                  <Text style={styles.productName}>{p.name}</Text>
                </View>
                <View style={[styles.priceTag, { borderColor: p.border }]}>
                  <Text style={[styles.priceTagNum, { color: p.accent }]}>{p.priceFull}</Text>
                  <Text style={styles.priceTagNote}>{p.priceNote}</Text>
                </View>
              </View>

              {/* Card body */}
              <View style={styles.productCardBody}>
                <Text style={styles.productDesc}>{p.description}</Text>
                <View style={styles.productCTA}>
                  <Text style={[styles.ctaText, { color: p.accent }]}>Begin formulation →</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {/* How it works */}
        <View style={styles.process}>
          <Text style={styles.processLabel}>THE PROCESS</Text>
          <View style={styles.processSteps}>
            {[
              { n: "I", label: "Select your scent" },
              { n: "II", label: "Skin intelligence" },
              { n: "III", label: "Choose ingredients" },
              { n: "IV", label: "Your virtual bottle" },
            ].map((s, i, arr) => (
              <View key={s.n} style={styles.processStep}>
                <View style={styles.processStepContent}>
                  <View style={styles.processNum}>
                    <Text style={styles.processNumText}>{s.n}</Text>
                  </View>
                  <Text style={styles.processLabel2}>{s.label}</Text>
                </View>
                {i < arr.length - 1 && <View style={styles.processConnector} />}
              </View>
            ))}
          </View>
        </View>

        {/* Trust bar */}
        <View style={styles.trustBar}>
          {[
            { label: "Botanically pure" },
            { label: "European standard" },
            { label: "Dermatologist tested" },
          ].map((b) => (
            <View key={b.label} style={styles.trustItem}>
              <View style={styles.trustDot} />
              <Text style={styles.trustLabel}>{b.label}</Text>
            </View>
          ))}
        </View>

        {/* Quote */}
        <View style={styles.quoteCard}>
          <Text style={styles.quoteText}>
            "Skin care should adapt to you — not the other way around."
          </Text>
        </View>
      </ScrollView>
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
    height: 280,
    backgroundColor: D.bgAlt,
  },
  content: { paddingHorizontal: 22 },

  nav: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 36,
  },
  navBrand: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: D.text,
    letterSpacing: 3.5,
    marginBottom: 4,
  },
  navTagRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  navDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: D.sage },
  navTag: { fontFamily: "Inter_400Regular", fontSize: 11, color: D.muted },
  profileBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: D.card,
    borderWidth: 1,
    borderColor: D.border,
    alignItems: "center",
    justifyContent: "center",
  },

  hero: { marginBottom: 40 },
  heroEyebrow: {
    fontFamily: "Inter_500Medium",
    fontSize: 9,
    color: D.faded,
    letterSpacing: 2.5,
    marginBottom: 16,
  },
  heroTitle: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 50,
    lineHeight: 56,
    letterSpacing: -1.5,
    color: D.text,
    marginBottom: 14,
  },
  heroSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: D.muted,
    lineHeight: 24,
  },

  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 18,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: D.border },
  dividerText: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: D.faded,
    letterSpacing: 0.5,
  },

  productCardWrap: { marginBottom: 14 },
  productCard: {
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: D.card,
    overflow: "hidden",
  },
  productCardTop: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  productIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  productIconText: { fontSize: 22 },
  productCardTopRight: { flex: 1 },
  productTagline: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 8.5,
    letterSpacing: 1.8,
    marginBottom: 3,
  },
  productName: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 18,
    color: D.text,
    letterSpacing: -0.2,
  },
  priceTag: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  priceTagNum: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 14,
  },
  priceTagNote: {
    fontFamily: "Inter_400Regular",
    fontSize: 9,
    color: D.faded,
  },
  productCardBody: { padding: 16 },
  productDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: D.muted,
    lineHeight: 20,
    marginBottom: 12,
  },
  productCTA: { alignSelf: "flex-start" },
  ctaText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    letterSpacing: 0.2,
  },

  process: {
    marginTop: 32,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: D.border,
    borderRadius: 18,
    backgroundColor: D.card,
    padding: 20,
  },
  processLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 9,
    color: D.faded,
    letterSpacing: 2.5,
    marginBottom: 16,
  },
  processSteps: { gap: 0 },
  processStep: { flexDirection: "row", alignItems: "center" },
  processStepContent: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 6 },
  processConnector: { display: "none" },
  processNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: D.border,
    backgroundColor: D.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  processNumText: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 10,
    color: D.muted,
    letterSpacing: 0.5,
  },
  processLabel2: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: D.text,
  },

  trustBar: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 24,
  },
  trustItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderWidth: 1,
    borderColor: D.border,
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 8,
    backgroundColor: D.card,
  },
  trustDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: D.sage },
  trustLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: D.muted,
  },

  quoteCard: {
    borderWidth: 1,
    borderColor: D.border,
    borderRadius: 18,
    backgroundColor: D.bgAlt,
    padding: 22,
    marginBottom: 8,
  },
  quoteText: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 16,
    color: D.muted,
    lineHeight: 26,
    letterSpacing: -0.2,
    fontStyle: "italic",
    textAlign: "center",
  },
});
