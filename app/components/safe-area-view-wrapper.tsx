import {
  SafeAreaProvider,
  SafeAreaView,
  type SafeAreaViewProps,
} from "react-native-safe-area-context";

const SafeAreaViewWrapper = (props: SafeAreaViewProps) => {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }} {...props} />
    </SafeAreaProvider>
  );
};

export default SafeAreaViewWrapper;
