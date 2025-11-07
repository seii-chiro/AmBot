import { useThemeColor } from "@/hooks/use-theme-color";
import React from "react";
import { DimensionValue, Pressable, type PressableProps } from "react-native";

export type ThemedPressableProps = PressableProps & {
  width?: DimensionValue;
  height?: DimensionValue;
  lightColor?: string;
  darkColor?: string;
  type?: "DELETE" | "PRIMARY";
};

const ThemedPressable = ({
  style,
  width = 120,
  height = 40,
  lightColor,
  darkColor,
  type,
  ...props
}: ThemedPressableProps) => {
  const active = useThemeColor(
    { light: lightColor, dark: darkColor },
    "pressableActive"
  );
  const inactive = useThemeColor(
    { light: lightColor, dark: darkColor },
    "pressable"
  );

  const getTypeColor = () => {
    switch (type) {
      case "DELETE":
        return "#ff4d4f";
      case "PRIMARY":
        return inactive;
      default:
        return inactive;
    }
  };

  return (
    <Pressable
      style={(state) => [
        {
          width,
          height,
          borderRadius: 8,
          padding: 2,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: state.pressed ? active : getTypeColor(),
        },
        typeof style === "function" ? style(state) : style,
      ]}
      {...props}
    />
  );
};

export default ThemedPressable;
