import React, { useState } from "react";
import {
  Alert, KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
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
  sage: "#6B9E7A",
  rose: "#B8706E",
  inputFocus: "#6B9E7A",
  error: "#C44B4B",
};

const PRICES: Record<string, number> = { deodorant: 24.99, shower_gel: 29.99 };

function formatCardNumber(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}
function formatExpiry(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
  return digits;
}

interface InputProps {
  label: string; value: string; onChangeText: (v: string) => void;
  placeholder: string; keyboardType?: any; maxLength?: number;
  focused: boolean; onFocus: () => void; onBlur: () => void;
  half?: boolean;
}

function FormInput({ label, value, onChangeText, placeholder, keyboardType = "default", maxLength, focused, onFocus, onBlur }: InputProps) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={[styles.input, focused && styles.inputFocused]}
        value={value} onChangeText={onChangeText}
        placeholder={placeholder} placeholderTextColor={D.faded}
        keyboardType={keyboardType} maxLength={maxLength}
        onFocus={onFocus} onBlur={onBlur}
        autoCorrect={false} autoCapitalize="words"
      />
    </View>
  );
}

export default function PaymentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { formulations } = useFormulation();
  const formulation = formulations.find((f) => f.id === id);

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [name, setName] = useState("");
  const [focused, setFocused] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const price = PRICES[formulation?.productType ?? "deodorant"] ?? 24.99;
  const isDeodorant = formulation?.productType !== "shower_gel";
  const accent = isDeodorant ? D.sage : D.rose;

  const isFormValid =
    cardNumber.replace(/\s/g, "").length === 16 &&
    expiry.length === 5 && cvv.length >= 3 && name.trim().length >= 3;

  const totalIngredients = formulation
    ? [...formulation.baseFormula.ingredients, ...formulation.odorControl.ingredients, ...formulation.skinCareActives.ingredients, ...formulation.fragranceProfile.ingredients].length
    : 0;

  const handlePay = async () => {
    if (!isFormValid) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace({ pathname: "/formula", params: { id, paid: "true" } });
    } catch {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Payment failed", "Please check your card details and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.headerStrip} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingTop: topPad + 14, paddingBottom: botPad + 40 }]}
          showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled"
        >
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Feather name="arrow-left" size={16} color={D.muted} />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.replace({ pathname: "/formula", params: { id } })}>
              <Text style={styles.viewFormulaText}>View Formula →</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>Complete your{"\n"}order.</Text>
          <Text style={styles.subtitle}>Your personalised formula is ready to ship.</Text>

          {formulation && (
            <View style={[styles.summaryCard, { borderColor: `${accent}45` }]}>
              <View style={[styles.summaryAccentBar, { backgroundColor: accent }]} />
              <View style={styles.summaryBody}>
                <View style={styles.summaryRow}>
                  <View style={[styles.summaryIconBox, { backgroundColor: `${accent}18` }]}>
                    <Text style={styles.summaryIcon}>{isDeodorant ? "◈" : "◎"}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.summaryName}>{formulation.productName}</Text>
                    <Text style={styles.summaryMeta}>{isDeodorant ? "Bespoke Deodorant" : "Ritual Body Wash"} · {totalIngredients} Ingredients</Text>
                    <Text style={styles.summaryTagline} numberOfLines={1}>{formulation.tagline}</Text>
                  </View>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Total</Text>
                  <Text style={[styles.price, { color: accent }]}>€{price.toFixed(2)}</Text>
                </View>
              </View>
            </View>
          )}

          <Text style={styles.sectionLabel}>CARD DETAILS</Text>

          <FormInput label="Cardholder Name" value={name} onChangeText={setName} placeholder="Jane Smith"
            focused={focused === "name"} onFocus={() => setFocused("name")} onBlur={() => setFocused(null)} />
          <FormInput label="Card Number" value={cardNumber}
            onChangeText={(v) => setCardNumber(formatCardNumber(v))}
            placeholder="1234 5678 9012 3456" keyboardType="numeric" maxLength={19}
            focused={focused === "card"} onFocus={() => setFocused("card")} onBlur={() => setFocused(null)} />

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <FormInput label="Expiry" value={expiry}
                onChangeText={(v) => setExpiry(formatExpiry(v))}
                placeholder="MM/YY" keyboardType="numeric" maxLength={5}
                focused={focused === "expiry"} onFocus={() => setFocused("expiry")} onBlur={() => setFocused(null)} />
            </View>
            <View style={{ flex: 1 }}>
              <FormInput label="CVV" value={cvv}
                onChangeText={(v) => setCvv(v.replace(/\D/g, "").slice(0, 4))}
                placeholder="123" keyboardType="numeric" maxLength={4}
                focused={focused === "cvv"} onFocus={() => setFocused("cvv")} onBlur={() => setFocused(null)} />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.payBtn, { backgroundColor: isFormValid && !loading ? accent : D.border }]}
            onPress={handlePay} activeOpacity={0.85} disabled={!isFormValid || loading}
          >
            <Text style={[styles.payBtnText, (!isFormValid || loading) && { color: D.faded }]}>
              {loading ? "Processing…" : `Pay €${price.toFixed(2)}`}
            </Text>
          </TouchableOpacity>

          <View style={styles.securityRow}>
            <Feather name="lock" size={11} color={D.faded} />
            <Text style={styles.securityText}>Secured by Stripe · SSL encrypted</Text>
          </View>

          <TouchableOpacity style={styles.skipPayment} onPress={() => router.replace({ pathname: "/formula", params: { id } })}>
            <Text style={styles.skipPaymentText}>View formula without paying →</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: D.bg },
  headerStrip: { position: "absolute", top: 0, left: 0, right: 0, height: 170, backgroundColor: D.bgAlt },
  content: { paddingHorizontal: 22 },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 28 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  backText: { fontFamily: "Inter_500Medium", fontSize: 14, color: D.muted },
  viewFormulaText: { fontFamily: "Inter_500Medium", fontSize: 13, color: D.faded },
  title: { fontFamily: "Fraunces_700Bold", fontSize: 36, color: D.text, lineHeight: 44, letterSpacing: -0.5, marginBottom: 8 },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 14, color: D.muted, marginBottom: 24, lineHeight: 22 },
  summaryCard: { borderRadius: 16, borderWidth: 1.5, marginBottom: 28, overflow: "hidden", backgroundColor: D.card },
  summaryAccentBar: { height: 4 },
  summaryBody: { padding: 18 },
  summaryRow: { flexDirection: "row", gap: 14, marginBottom: 16 },
  summaryIconBox: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  summaryIcon: { fontSize: 22, lineHeight: 28 },
  summaryName: { fontFamily: "Fraunces_700Bold", fontSize: 17, color: D.text, marginBottom: 2 },
  summaryMeta: { fontFamily: "Inter_400Regular", fontSize: 12, color: D.muted, marginBottom: 2 },
  summaryTagline: { fontFamily: "Inter_400Regular", fontSize: 11, color: D.faded, fontStyle: "italic" },
  priceRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: D.border, paddingTop: 14 },
  priceLabel: { fontFamily: "Inter_500Medium", fontSize: 14, color: D.muted },
  price: { fontFamily: "Fraunces_700Bold", fontSize: 28, letterSpacing: -0.5 },
  sectionLabel: { fontFamily: "Inter_600SemiBold", fontSize: 9.5, color: D.faded, letterSpacing: 2, marginBottom: 16 },
  inputGroup: { marginBottom: 14 },
  inputLabel: { fontFamily: "Inter_500Medium", fontSize: 12, color: D.muted, marginBottom: 6 },
  input: { backgroundColor: D.card, borderRadius: 12, borderWidth: 1.5, borderColor: D.border, paddingHorizontal: 16, paddingVertical: 14, fontFamily: "Inter_400Regular", fontSize: 15, color: D.text },
  inputFocused: { borderColor: D.inputFocus, backgroundColor: "#EBF3ED" },
  row: { flexDirection: "row", gap: 12 },
  payBtn: { borderRadius: 14, paddingVertical: 17, alignItems: "center", marginTop: 8, marginBottom: 16 },
  payBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 16, color: "#FFFFFF" },
  securityRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, marginBottom: 14 },
  securityText: { fontFamily: "Inter_400Regular", fontSize: 12, color: D.faded },
  skipPayment: { alignItems: "center", padding: 8 },
  skipPaymentText: { fontFamily: "Inter_400Regular", fontSize: 13, color: D.faded },
});
