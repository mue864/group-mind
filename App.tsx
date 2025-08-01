import { View } from "react-native";
import FlashMessage from "react-native-flash-message";

// entry point
const App = () => {
  return (
    <View style={{ flex: 1 }}>
      {/* Your existing app content */}
      <FlashMessage position="top" />
    </View>
  );
};

export default App;
