import { Text, View, Pressable } from "react-native";
import Elipse from "@/assets/icons/signupElipse.svg";
import Rect from "@/assets/icons/signupRect.svg";
import { Strings } from "@/constants";
import TextBox from "@/components/TextBox";
import Button from "@/components/Button";
import GoogleBtn from "@/assets/icons/google.svg";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { validatePasswords, passwordLength } from "@/constants/passwordValidation";
import { validateEmail } from "@/constants/emailValidation";
import Toast from "react-native-toast-message";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/services/firebase";
import {doc, setDoc} from "firebase/firestore";


const SignUpScreen = () => {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassord, setConfirmPassword] = useState("");
    const [isPasswordMatch, setPasswordMatch] = useState(false);

    const handleSignIn = () => {
      const isValidEmail = validateEmail({ email });
      if (!isValidEmail) {
        Toast.show({
          type: "error",
          text1: "Invalid Email",
          text2: "Please enter a valid email address",
        });
      } else if (!isPasswordMatch) {
        Toast.show({
          type: "error",
          text1: "Passwords do not match",
          text2: "Double check your passwords",
        });
      } else if (!passwordLength(password)) {
        Toast.show({
          type: "info",
          text1: "Short Password",
          text2: "Use 5 or more characters",
        });
      } else {
        // add signup logic
      }
    };



    useEffect(() => {
        setPasswordMatch(validatePasswords(password, confirmPassord))
    }, [password, confirmPassord, isPasswordMatch]);

    return (
      <View className="flex-1 relative">
        <View className="absolute left-0">
          <Elipse width={200} height={200} />
        </View>
        <View className="absolute right-0 bottom-20">
          <Rect width={200} height={200} />
        </View>

        <View className="mt-10 mb-2">
          <Text className="text-primary text-center font-poppins-semiBold text-3xl">
            {Strings.login.createAccountHeading}
          </Text>
        </View>
        <View className="w-44 flex justify-center items-center mx-auto mb-16">
          <Text className="text-center font-poppins-semiBold">
            {Strings.login.createAccountSubHeading}
          </Text>
        </View>

        {/* email box */}
        <View className="mx-10">
          <TextBox
            method={"email"}
            placeholder={Strings.login.emailPlaceholder}
            value={email}
            onChangeText={setEmail}
            secureTextEntry={false}
            borderColor={true}
          />
        </View>
        {/* password box */}
        <View className="mx-10 pt-8">
          <TextBox
            method={"password"}
            placeholder={Strings.login.passwordPlaceholder}
            onChangeText={setPassword}
            value={password}
            secureTextEntry={true}
            borderColor={
              password === "" && passwordLength(password)
                ? true
                : isPasswordMatch
            }
          />
        </View>
        {/* confirm password */}
        <View className="mx-10 pt-8">
          <TextBox
            method={"confirm"}
            placeholder={Strings.login.confirmPasswordPlaceholder}
            value={confirmPassord}
            onChangeText={setConfirmPassword}
            secureTextEntry={true}
            borderColor={
              password === "" && passwordLength(password)
                ? true
                : isPasswordMatch
            }
          />
        </View>

        <View className="mx-10 mt-10">
          <Button
            onPress={handleSignIn}
            buttonText={Strings.login.signUpButton}
          />
        </View>

        <Pressable
          className="mt-10"
          onPress={() => router.push("/Auth/SignInScreen")}
        >
          <Text className="font-poppins-semiBold text-center">
            {Strings.login.accountExists}
          </Text>
        </Pressable>

        <View className=" mt-10">
          <Text className="text-center font-poppins-semiBold font-black text-primary">
            {Strings.login.continue}
          </Text>
        </View>

        <Pressable className="justify-center items-center mt-10">
          <GoogleBtn width={90} />
        </Pressable>
      </View>
    );
}
 
export default SignUpScreen;