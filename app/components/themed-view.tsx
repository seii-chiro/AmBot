import { useThemeColor } from "@/hooks/use-theme-color";
import { View, type ViewProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  safe?: boolean;
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  safe = false,
  ...otherProps
}: ThemedViewProps) {
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background"
  );

  const insets = useSafeAreaInsets();

  if (!safe) {
    return (
      <View
        style={[
          { backgroundColor },
          {
            flex: 1,
            width: "100%",
          },
          style,
        ]}
        {...otherProps}
      />
    );
  }

  return (
    <View
      style={[
        { backgroundColor },
        {
          flex: 1,
          width: "100%",
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingRight: insets.right,
          paddingLeft: insets.left,
        },
        style,
      ]}
      {...otherProps}
    />
  );
}
