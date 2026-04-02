import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

const D = {
  bg: "#FAF8F4",
  bgAlt: "#F2EDE6",
  card: "#FFFFFF",
  border: "#E4DDD5",
  text: "#1A1614",
  muted: "#7C6F65",
  faded: "#B5A99E",
  sage: "#6B9E7A",
  gold: "#B8882A",
  rose: "#B8706E",
  slate: "#5C7A8A",
  cream: "#EDE4D8",
};

const SLIDES = [
  {
    id: "1",
    number: "01",
    icon: "✦",
    title: "Skin,\ndecoded.",
    subtitle: "A single selfie reveals your skin type, hydration, and unique needs. No guesswork, no generalisation.",
    accent: D.slate,
    bgColor: "#EFF5F8",
    borderColor: "#C8DCE6",
    features: ["Intelligent skin reading", "Clinically informed AI", "Fully private — never stored"],
  },
  {
    id: "2",
    number: "02",
    icon: "◈",
    title: "Formulas\nthat matter.",
    subtitle: "We source only what works — botanicals chosen for your climate, your water, your life.",
    accent: D.sage,
    bgColor: "#EFF6F1",
    borderColor: "#B8D8BF",
    features: ["Ethically sourced actives", "Climate-adapted botanicals", "Nothing unnecessary"],
  },
  {
    id: "3",
    number: "03",
    icon: "◉",
    title: "See it\nbefore it ships.",
    subtitle: "Watch your formula come alive in a virtual bottle — crafted to your exact specification.",
    accent: D.gold,
    bgColor: "#F8F3EA",
    borderColor: "#DECA9E",
    features: ["Choose your signature scent", "Virtual bottle preview", "Delivered in 3–5 days"],
  },
  {
    id: "4",
    number: "04",
    icon: "◐",
    title: "Yours.\nOnly yours.",
    subtitle: "Precision skin care for the individual. Because your skin deserves more than one-size-fits-all.",
    accent: D.rose,
    bgColor: "#F8EFEF",
    borderColor: "#DDBABA",
    features: ["European-standard formulation", "Your choice, every time", "Ready in 60 seconds"],
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const flatRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems[0]?.index != null) {
        setActiveIndex(viewableItems[0].index);
      }
    }
  ).current;

  const handleNext = async () => {
    if (activeIndex < SLIDES.length - 1) {
      flatRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    } else {
      await AsyncStorage.setItem("@limenova_onboarded", "true");
      router.replace("/");
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem("@limenova_onboarded", "true");
    router.replace("/");
  };

  const current = SLIDES[activeIndex];

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      <View style={styles.skipRow}>
        <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            {/* Art card */}
            <View style={[styles.artCard, { backgroundColor: item.bgColor, borderColor: item.borderColor }]}>
              <Text style={[styles.artIcon, { color: item.accent }]}>{item.icon}</Text>
              <Text style={[styles.artNumber, { color: item.accent }]}>{item.number}</Text>
              <View style={[styles.artLine, { backgroundColor: item.borderColor }]} />
              <Text style={[styles.artAccentWord, { color: item.accent }]}>
                {["INTELLIGENCE", "BOTANICALS", "VIRTUALISED", "PERSONAL"][parseInt(item.number) - 1]}
              </Text>
            </View>

            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>

            <View style={styles.features}>
              {item.features.map((f, i) => (
                <View key={i} style={[styles.featureRow, { borderColor: item.borderColor }]}>
                  <View style={[styles.featureDot, { backgroundColor: item.accent }]} />
                  <Text style={styles.featureText}>{f}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      />

      <View style={[styles.bottom, { paddingBottom: botPad + 20 }]}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === activeIndex && [styles.dotActive, { backgroundColor: current.accent }],
                i < activeIndex && { backgroundColor: D.faded },
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.85}
          style={[styles.nextBtn, { backgroundColor: current.accent }]}
        >
          <Text style={styles.nextBtnText}>
            {activeIndex === SLIDES.length - 1 ? "Begin" : "Continue"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: D.bg },
  skipRow: {
    paddingHorizontal: 24,
    paddingTop: 8,
    alignItems: "flex-end",
  },
  skipBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: D.border,
    backgroundColor: D.card,
  },
  skipText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: D.muted,
    letterSpacing: 0.3,
  },
  slide: {
    width,
    paddingHorizontal: 28,
    paddingTop: 20,
    flex: 1,
  },
  artCard: {
    borderRadius: 24,
    borderWidth: 1,
    height: 190,
    marginBottom: 32,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  artIcon: { fontSize: 36, lineHeight: 44 },
  artNumber: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 11,
    letterSpacing: 3,
  },
  artLine: { width: 40, height: 1, marginVertical: 4 },
  artAccentWord: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 9,
    letterSpacing: 3.5,
  },
  title: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 44,
    lineHeight: 50,
    letterSpacing: -1,
    color: D.text,
    marginBottom: 14,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: D.muted,
    lineHeight: 24,
    marginBottom: 28,
  },
  features: { gap: 10 },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: D.card,
  },
  featureDot: { width: 6, height: 6, borderRadius: 3 },
  featureText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: D.text,
  },
  bottom: {
    paddingHorizontal: 28,
    paddingTop: 16,
    gap: 20,
    alignItems: "center",
  },
  dots: { flexDirection: "row", gap: 8, alignItems: "center" },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: D.border,
  },
  dotActive: {
    width: 24,
    height: 6,
    borderRadius: 3,
  },
  nextBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 56,
    alignItems: "center",
  },
  nextBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
});
