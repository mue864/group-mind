import Button from "@/components/Button";
import TextBox from "@/components/TextBox";
import { Strings } from "@/constants";
import { validateEmail } from "@/constants/emailValidation";
import { auth } from "@/services/firebase";
import { FontAwesome6 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import Toast from "react-native-toast-message";
import { StatusBar } from "expo-status-bar";

const SignInScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = () => {
    const isValidEmail = validateEmail({ email });
    if (!isValidEmail) {
      Toast.show({
        type: "error",
        text1: "Invalid Email",
        text2: "Please enter a valid email address",
      });
      return;
    }
    processLogin();
  };

  const processLogin = async () => {
    setLoading(true);
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      Toast.show({
        type: "success",
        text1: "Welcome Back!",
        text2: `Let's focus and grow 🚀`,
      });
      router.replace("/(dashboard)/(tabs)/home");
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: error.message || "An error occurred during sign-in.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{
        flex: 1,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
      }}
    >
      <StatusBar style="dark" backgroundColor="#F8FAFF" translucent={false} />
      <Animated.View
        entering={FadeInUp.duration(500)}
        style={{ width: "100%", maxWidth: 360, alignItems: "center" }}
      >
        <FontAwesome6
          name="brain"
          size={42}
          color="#4169E1"
          style={{ marginBottom: 28 }}
        />

        <Text className="text-primary text-center font-poppins-semiBold text-3xl mb-2">
          {Strings.login.signInHeading}
        </Text>

        <Text className="text-center font-poppins-semiBold text-base text-muted mb-10">
          {Strings.login.signInSubHeading}
        </Text>

        <TextBox
          placeholder={Strings.login.emailPlaceholder}
          value={email}
          onChangeText={setEmail}
          method="email"
          secureTextEntry={false}
          borderColor
          setValue={setEmail}
        />

        <View style={{ height: 18 }} />

        <TextBox
          placeholder={Strings.login.passwordPlaceholder}
          value={password}
          onChangeText={setPassword}
          method="password"
          secureTextEntry
          borderColor
          setValue={setPassword}
        />

        <Button
          onPress={handleSignIn}
          title={Strings.login.loginButton}
          fullWidth
          disabled={loading}
          loading={loading}
          style={{
            marginTop: 30,
            marginBottom: 14,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
        />

        <Pressable onPress={() => router.push("/(auth)/signUpScreen")}>
          <Text
            className="font-poppins-semiBold text-center text-primary"
            style={{ textDecorationLine: "underline", marginBottom: 18 }}
          >
            {Strings.login.accountDontExtist}
          </Text>
        </Pressable>

        <Text
          style={{ color: "#9EADD9", fontWeight: "600", marginVertical: 12 }}
        >
          or
        </Text>

        <Pressable style={{ width: "100%" }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 999,
              borderWidth: 1,
              borderColor: "#E5E7EB",
              paddingVertical: 12,
              backgroundColor: "#fff",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 6,
              elevation: 2,
            }}
          >
            <FontAwesome6
              name="google"
              size={18}
              color="#EA4335"
              style={{ marginRight: 8 }}
            />
            <Text style={{ color: "#222", fontWeight: "500", fontSize: 15 }}>
              Continue with Google
            </Text>
          </View>
        </Pressable>
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

export default SignInScreen;
