import { StyleSheet, View } from "react-native";
import { COLORS } from "../constants/colors";

export default function Logo({ size = 40 }) {
  const padding = Math.round(size * 0.22);
  const gap = Math.max(2, Math.round(size * 0.08));
  const cell = (size - padding * 2 - gap) / 2;

  return (
    <View
      style={[
        styles.mark,
        {
          width: size,
          height: size,
          borderRadius: Math.round(size * 0.22),
          padding,
          gap,
        },
      ]}
      accessibilityLabel="Civil Registration Tracker logo"
    >
      <View style={[styles.row, { gap }]}>
        <View style={[styles.cell, { width: cell, height: cell, borderRadius: gap }]} />
        <View style={[styles.cell, { width: cell, height: cell, borderRadius: gap }]} />
      </View>
      <View style={[styles.row, { gap }]}>
        <View style={[styles.cell, { width: cell, height: cell, borderRadius: gap }]} />
        <View style={[styles.cell, { width: cell, height: cell, borderRadius: gap }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mark: {
    backgroundColor: COLORS.ACCENT_YELLOW,
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
  },
  cell: {
    backgroundColor: COLORS.PRIMARY_NAVY,
  },
});
