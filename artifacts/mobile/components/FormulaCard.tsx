import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { FormulaSection } from "@/context/FormulationContext";

const D = {
  card: "rgba(255,255,255,0.06)",
  cardBorder: "rgba(255,255,255,0.10)",
  white: "#FFFFFF",
  muted: "rgba(255,255,255,0.55)",
  faded: "rgba(255,255,255,0.25)",
  green: "#4CAF6E",
};

interface FormulaCardProps {
  section: FormulaSection;
  accentColor?: string;
}

export function FormulaCard({ section, accentColor = D.green }: FormulaCardProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded((v) => !v)}
        activeOpacity={0.8}
      >
        <View style={[styles.accent, { backgroundColor: accentColor + "18" }]}>
          <View style={[styles.accentDot, { backgroundColor: accentColor }]} />
        </View>
        <Text style={styles.title}>{section.title}</Text>
        <Feather
          name={expanded ? "chevron-up" : "chevron-down"}
          size={16}
          color={D.muted}
        />
      </TouchableOpacity>
      {expanded && (
        <View style={styles.body}>
          {section.description && (
            <Text style={styles.description}>{section.description}</Text>
          )}
          <View style={styles.ingredients}>
            {section.ingredients.map((ing, i) => (
              <View key={i} style={styles.ingredient}>
                <View style={styles.ingredientHeader}>
                  <Text style={styles.ingredientName}>{ing.name}</Text>
                  {ing.percentage && (
                    <Text style={styles.percentage}>{ing.percentage}</Text>
                  )}
                </View>
                <Text style={styles.ingredientPurpose}>{ing.purpose}</Text>
                {i < section.ingredients.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: D.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: D.cardBorder,
    overflow: "hidden",
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 10,
  },
  accent: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  accentDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  title: {
    flex: 1,
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: D.white,
  },
  body: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  description: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: D.muted,
    lineHeight: 19,
    paddingTop: 12,
    paddingBottom: 4,
    fontStyle: "italic",
  },
  ingredients: {
    marginTop: 8,
  },
  ingredient: {
    paddingVertical: 8,
  },
  ingredientHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ingredientName: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: D.white,
    flex: 1,
  },
  percentage: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: D.faded,
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  ingredientPurpose: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: D.muted,
    marginTop: 2,
    lineHeight: 17,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginTop: 8,
  },
});
