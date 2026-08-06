import React from "react";
import { View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

export type SanadChainProps = {
  total?: number;
  completed?: number;
  size?: number;
  accentColor?: string;
};

export function SanadChain({ total = 6, completed = 0, size = 7, accentColor }: SanadChainProps) {
  const { theme } = useUnistyles();
  const activeColor = accentColor ?? theme.colors.content.primary;
  const inactiveColor = theme.colors.border.subtle;

  const capped = Math.min(Math.max(total, 1), 7);
  const done = total > 0 ? Math.round((completed / total) * capped) : 0;

  return (
    <View style={styles.container} testID="sanad-chain">
      {Array.from({ length: capped }).map((_, i) => {
        const isDone = i < done;
        const isLineDone = i < done - 1;

        return (
          <React.Fragment key={i}>
            <View
              testID={`sanad-dot-${i}`}
              style={[
                styles.dot,
                {
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  backgroundColor: isDone ? activeColor : "transparent",
                  borderColor: isDone ? activeColor : inactiveColor,
                },
              ]}
            />
            {i < capped - 1 ? (
              <View
                testID={`sanad-line-${i}`}
                style={[
                  styles.line,
                  {
                    backgroundColor: isLineDone ? activeColor : inactiveColor,
                  },
                ]}
              />
            ) : null}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    borderWidth: 1.5,
  },
  line: {
    width: 8,
    height: 1.5,
  },
});
