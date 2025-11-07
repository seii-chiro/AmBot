import React from "react";
import { TextInput, useColorScheme, type TextInputProps } from "react-native";

type ThemedTextInputProps = TextInputProps & {};

const ThemedTextInput = ({ style, placeholderTextColor, ...props }: ThemedTextInputProps) => {
    const colorScheme = useColorScheme();

  return (
    <TextInput
      style={[{ backgroundColor: colorScheme === 'light' ? "#EFEFEF" : "white", width: "80%", borderRadius: 6 }, style]}
      placeholderTextColor={placeholderTextColor ?? (colorScheme === 'light' ? '#666' : '#999')}
      {...props}
    />
  );
};

export default ThemedTextInput;
