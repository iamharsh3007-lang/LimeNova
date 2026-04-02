import React from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useFormulation } from "@/context/FormulationContext";

const D = {
  bg: "#FAF8F4",
  bgAlt: "#F2EDE6",
  card: "#FFFFFF",
  border: "#E4DDD5",
  text: "#1A1614",
  muted: "#7C6F65",
  faded: "#B5A99E",
  rose: "#B8706E",
  roseLight: "#F5ECEA",
  sage: "#6B9E7A",
};

export default function ErrorScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { generationError, resetQuestionnaire } = useFormulation();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { paddingTop: topPad + 60 }]}>
      <View style={styles.iconBox}>
        <Feather name="alert-circle" size={30} color={D.rose} />
      </View>
      <Text style={styles.title}>Something went wrong</Text>
      <Text style={styles.message}>
        {generationError ?? "We couldn't generate your formula. Please try again."}
      </Text>
      <TouchableOpacity
        style={styles.btn}
        onPress={() => { resetQuestionnaire(); router.replace("/"); }}
        activeOpacity={0.85}
      >
        <Text style={styles.btnText}>Start Over</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: D.bg, alignItems: "center", paddingHorizontal: 32 },
  iconBox: { width: 72, height: 72, borderRadius: 36, backgroundColor: D.roseLight, borderWidth: 1, borderColor: "#E8C0BB", alignItems: "center", justifyContent: "center", marginBottom: 22 },
  title: { fontFamily: "Fraunces_700Bold", fontSize: 26, color: D.text, textAlign: "center", marginBottom: 12, letterSpacing: -0.3 },
  message: { fontFamily: "Inter_400Regular", fontSize: 15, color: D.muted, textAlign: "center", lineHeight: 23, marginBottom: 36 },
  btn: { backgroundColor: D.sage, borderRadius: 14, paddingVertical: 16, paddingHorizontal: 44 },
  btnText: { fontFamily: "Inter_600SemiBold", fontSize: 16, color: "#FFFFFF" },
});
