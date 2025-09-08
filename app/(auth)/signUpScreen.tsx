import Button from "@/components/Button";
import TextBox from "@/components/TextBox";
import { Strings } from "@/constants";
import { validateEmail } from "@/constants/emailValidation";
import {
  passwordLength,
  validatePasswords,
} from "@/constants/passwordValidation";
import { auth, db } from "@/services/firebase";
import { FontAwesome6 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";

import Toast from "react-native-toast-message";

const SignUpScreen = () => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordMatch, setPasswordMatch] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignUp = () => {
    const isValidEmail = validateEmail({ email });
    if (!isValidEmail) {
      Toast.show({
        type: "error",
        text1: "Invalid Email",
        text2: "Please enter a valid email address",
      });
      return;
    }
    if (!isPasswordMatch) {
      Toast.show({
        type: "error",
        text1: "Passwords do not match",
        text2: "Double check your password fields",
      });
      return;
    }
    if (!passwordLength(password)) {
      Toast.show({
        type: "error",
        text1: "Weak Password",
        text2: "Password must be at least 6 characters",
      });
      return;
    }

    registerUser();
  };

  const registerUser = async () => {
    // to deal with resource agressive apps, save the user info before verifying the email in to prevent problems
    setLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCred.user;

      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        createdAt: Timestamp.now(),
        userName: "",
        level: "",
        age: "",
        purpose: "",
        profileImage: "",
        subjectsOfInterest: [],
        joinedGroups: [],
        resources: [],
        lastActive: Timestamp.now(),
        isOnline: false,
        notificationsEnabled: false,
        canExplainToPeople: false,
        isFirstLogin: true,
        profileComplete: false,
      });

      Toast.show({
        type: "success",
        text1: "Account Created!",
        text2: "Let’s set up your profile 🧠",
      });

      
      if (user.emailVerified) {
        router.replace("/(auth)/createProfile");
      } else {
        router.replace("/(auth)/verifyEmail");
      }
    } catch (error: any) {
      let message = "";
      switch (error.code) {
        case "auth/email-already-in-use":
          message = "Email is already in use";
          break;
        case "auth/invalid-email":
          message = "Invalid email format";
          break;
        case "auth/weak-password":
          message = "Password should be at least 6 characters";
          break;
        default:
          message = error.message;
      }

      Toast.show({
        type: "error",
        text1: "Signup Failed",
        text2: message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPasswordMatch(validatePasswords(password, confirmPassword));
  }, [password, confirmPassword]);

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
      <View style={{ width: "100%", maxWidth: 380, alignItems: "center" }}>
        <FontAwesome6
          name="brain"
          size={40}
          color="#4169E1"
          style={{ marginBottom: 20 }}
        />

        <Text className="text-primary text-center font-poppins-semiBold text-3xl mb-2">
          {Strings.login.createAccountHeading}
        </Text>

        <Text className="text-center font-poppins-semiBold text-base text-muted mb-8">
          {Strings.login.createAccountSubHeading}
        </Text>

        <TextBox
          placeholder={Strings.login.emailPlaceholder}
          value={email}
          onChangeText={setEmail}
          secureTextEntry={false}
        />

        <View style={{ height: 12 }} />

        <TextBox
          placeholder={Strings.login.passwordPlaceholder}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          textContentType="oneTimeCode"
          errorText={
            password.length > 0 && !isPasswordMatch
              ? "Passwords do not match"
              : undefined
          }
        />

        <View style={{ height: 12 }} />

        <TextBox
          placeholder={Strings.login.confirmPasswordPlaceholder}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          textContentType="oneTimeCode"
          errorText={
            confirmPassword.length > 0 && !isPasswordMatch
              ? "Passwords do not match"
              : undefined
          }
        />

        <Button
          onPress={handleSignUp}
          title={Strings.login.signUpButton}
          fullWidth
          disabled={loading}
          loading={loading}
          style={{
            marginTop: 22,
            marginBottom: 12,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
        />

        <Pressable onPress={() => router.push("/(auth)/signInScreen")}>
          <Text
            className="font-poppins-semiBold text-center text-primary"
            style={{ textDecorationLine: "underline", marginBottom: 18 }}
          >
            {Strings.login.accountExists}
          </Text>
        </Pressable>

        <View
          style={{
            width: "100%",
            flexDirection: "row",
            alignItems: "center",
            marginVertical: 16,
          }}
        >
          <View style={{ flex: 1, height: 1, backgroundColor: "#E5E7EB" }} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default SignUpScreen;
