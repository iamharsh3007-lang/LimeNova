import React from "react";
import { StyleSheet, View, Text } from "react-native";

export function ProgressBar({ current, total }: { current: number; total: number }) {
  const progress = (current / total) * 100;
  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress}%` as any }]} />
      </View>
      <Text style={styles.label}>{current}/{total}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  track: { flex: 1, height: 2, backgroundColor: "#E4DDD5", borderRadius: 2, overflow: "hidden" },
  fill: { height: "100%", backgroundColor: "#6B9E7A", borderRadius: 2 },
  label: { fontFamily: "Inter_400Regular", fontSize: 11, color: "#B5A99E", minWidth: 28, textAlign: "right" },
});
