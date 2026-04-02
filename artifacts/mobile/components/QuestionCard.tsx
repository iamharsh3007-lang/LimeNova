import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const D = {
  card: "#FFFFFF",
  border: "#E4DDD5",
  text: "#1A1614",
  muted: "#7C6F65",
  faded: "#B5A99E",
  sage: "#6B9E7A",
  sageLight: "#EBF3ED",
  sageBorder: "#B8D4BE",
};

interface Option<T> { value: T; label: string; description?: string; }
interface QuestionCardProps<T> {
  question: string; subtitle?: string;
  options: Option<T>[]; selected: T | T[] | null;
  multiSelect?: boolean; onSelect: (value: T) => void;
}

export function QuestionCard<T>({ question, subtitle, options, selected, multiSelect = false, onSelect }: QuestionCardProps<T>) {
  const isSelected = (value: T) => {
    if (multiSelect && Array.isArray(selected)) return selected.includes(value);
    return selected === value;
  };
  return (
    <View style={styles.container}>
      <Text style={styles.question}>{question}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      <View style={styles.options}>
        {options.map((opt, i) => {
          const sel = isSelected(opt.value);
          return (
            <TouchableOpacity key={i} style={[styles.option, sel && styles.optionSelected]}
              onPress={() => onSelect(opt.value)} activeOpacity={0.8} testID={`option-${String(opt.value)}`}>
              <View style={styles.optionRow}>
                <View style={[styles.indicator, sel && styles.indicatorSelected]}>
                  {sel && <View style={styles.indicatorDot} />}
                </View>
                <View style={styles.optionContent}>
                  <Text style={[styles.optionLabel, sel && styles.optionLabelSelected]}>{opt.label}</Text>
                  {opt.description && <Text style={styles.optionDesc}>{opt.description}</Text>}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  question: { fontFamily: "Fraunces_700Bold", fontSize: 28, color: D.text, lineHeight: 35, letterSpacing: -0.4, marginBottom: 6 },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 14, color: D.muted, lineHeight: 21, marginBottom: 20 },
  options: { gap: 8, marginTop: 8 },
  option: { backgroundColor: D.card, borderRadius: 14, borderWidth: 1.5, borderColor: D.border, padding: 15 },
  optionSelected: { backgroundColor: D.sageLight, borderColor: D.sage },
  optionRow: { flexDirection: "row", alignItems: "center", gap: 13 },
  indicator: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: D.border, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  indicatorSelected: { borderColor: D.sage, backgroundColor: D.sage },
  indicatorDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#FFFFFF" },
  optionContent: { flex: 1 },
  optionLabel: { fontFamily: "Inter_500Medium", fontSize: 15, color: D.text, marginBottom: 1 },
  optionLabelSelected: { color: "#3A6E48", fontFamily: "Inter_600SemiBold" },
  optionDesc: { fontFamily: "Inter_400Regular", fontSize: 12, color: D.faded, lineHeight: 17 },
});
