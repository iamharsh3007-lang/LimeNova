import React from "react";
import { FlatList, Platform, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useFormulation, Formulation } from "@/context/FormulationContext";

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

export default function HistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { formulations, isSyncing } = useFormulation();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const renderItem = ({ item }: { item: Formulation }) => {
    const isDeodorant = item.productType === "deodorant";
    const accent = isDeodorant ? D.sage : D.rose;
    const formattedDate = (() => {
      try { return new Date(item.createdAt).toLocaleDateString("en-IE", { day: "numeric", month: "long", year: "numeric" }); }
      catch { return ""; }
    })();

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push({ pathname: "/formula", params: { id: item.id } })}
        activeOpacity={0.8}
      >
        <View style={[styles.cardIconBox, { backgroundColor: `${accent}14`, borderColor: `${accent}35` }]}>
          <Text style={[styles.cardGlyph, { color: accent }]}>{isDeodorant ? "◈" : "◎"}</Text>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.cardName}>{item.productName}</Text>
          <Text style={styles.cardType}>{isDeodorant ? "Bespoke Deodorant" : "Ritual Body Wash"}</Text>
          {formattedDate ? <Text style={styles.cardDate}>{formattedDate}</Text> : null}
        </View>
        <Feather name="chevron-right" size={15} color={D.faded} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.headerStrip} />

      <View style={styles.nav}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={18} color={D.muted} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>My Formulas</Text>
        {isSyncing
          ? <ActivityIndicator size="small" color={D.sage} />
          : <View style={{ width: 36 }} />
        }
      </View>

      <FlatList
        data={formulations}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[styles.list, { paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 20 }]}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIconBox}>
              <Feather name="inbox" size={26} color={D.faded} />
            </View>
            <Text style={styles.emptyTitle}>No formulas yet</Text>
            <Text style={styles.emptyText}>
              Complete the questionnaire to create your first personalised formula.
            </Text>
            <TouchableOpacity style={[styles.startBtn, { backgroundColor: D.sage }]} onPress={() => router.replace("/")}>
              <Text style={styles.startBtnText}>Get Started →</Text>
            </TouchableOpacity>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: D.bg },
  headerStrip: { position: "absolute", top: 0, left: 0, right: 0, height: 140, backgroundColor: D.bgAlt },
  nav: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 12, justifyContent: "space-between" },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: D.card, borderWidth: 1, borderColor: D.border, alignItems: "center", justifyContent: "center" },
  navTitle: { fontFamily: "Fraunces_700Bold", fontSize: 17, color: D.text, letterSpacing: -0.2 },
  list: { paddingHorizontal: 20, paddingTop: 8 },
  card: { backgroundColor: D.card, borderRadius: 14, borderWidth: 1, borderColor: D.border, padding: 16, flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 10 },
  cardIconBox: { width: 44, height: 44, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  cardGlyph: { fontSize: 22, lineHeight: 28 },
  cardBody: { flex: 1 },
  cardName: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: D.text, marginBottom: 2 },
  cardType: { fontFamily: "Inter_400Regular", fontSize: 13, color: D.muted, marginBottom: 1 },
  cardDate: { fontFamily: "Inter_400Regular", fontSize: 11, color: D.faded },
  empty: { alignItems: "center", paddingTop: 80, paddingHorizontal: 32, gap: 10 },
  emptyIconBox: { width: 64, height: 64, borderRadius: 20, backgroundColor: D.bgAlt, borderWidth: 1, borderColor: D.border, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  emptyTitle: { fontFamily: "Fraunces_700Bold", fontSize: 22, color: D.text, marginTop: 8, letterSpacing: -0.3 },
  emptyText: { fontFamily: "Inter_400Regular", fontSize: 14, color: D.muted, textAlign: "center", lineHeight: 21 },
  startBtn: { borderRadius: 14, paddingVertical: 14, paddingHorizontal: 28, marginTop: 16 },
  startBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: "#FFFFFF" },
});
