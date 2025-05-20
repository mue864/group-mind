import { Text, View, Pressable } from "react-native";
import Elipse from "@/assets/icons/signupElipse.svg";
import Rect from "@/assets/icons/signupRect.svg";
import { Strings } from "@/constants";
import TextBox from "@/components/TextBox";
import Button from "@/components/Button";
import GoogleBtn from "@/assets/icons/google.svg";
import { useRouter } from "expo-router";
import { useState } from "react";
import { validateEmail } from "@/constants/emailValidation";
import Toast from "react-native-toast-message";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/services/firebase";


const SignInScreen = () => {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSignIn = () => {
      const isValidEmail = validateEmail({email});
      if (!isValidEmail) {
        Toast.show(
          {
            type: 'error',
            text1: "Invalid Email",
            text2: "Please enter a valid email"
          }
        )
      } else {
        console.log("in here")
        handhandleData();
      }
    }

    const handhandleData = async () => {
      try {
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        const user = userCred.user;

        Toast.show({
          type: 'success',
          text1: 'Welcome Back!',
        })

        router.replace('/Auth/createProfile');
      } catch(error: any) {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: error.message,
          });
      }
    }

    return (
      <View className="flex-1 relative">
        <View className="absolute left-0">
          <Elipse width={200} height={200} />
        </View>
        <View className="absolute right-0 bottom-20">
          <Rect width={200} height={200} />
        </View>

        <View className="mt-10 mb-4 h-10">
          <Text className="text-primary text-center font-poppins-semiBold text-3xl">
            {Strings.login.signInHeading}
          </Text>
        </View>
        <View className="w-44 flex justify-center items-center mx-auto mb-16">
          <Text className="text-center font-poppins-semiBold">
            {Strings.login.signInSubHeading}
          </Text>
        </View>


        {/* email box */}
        <View className="mx-10">
          <TextBox
            placeholder={Strings.login.emailPlaceholder}
            value={email}
            onChangeText={setEmail}
            method="email"
            secureTextEntry={false}
            borderColor={true}
            setValue={setEmail}
          />
        </View>
        {/* password box */}
        <View className="mx-10 pt-8">
          <TextBox
            placeholder={Strings.login.passwordPlaceholder}
            value={password}
            onChangeText={setPassword}
            method="password"
            secureTextEntry={true}
            borderColor={true}
            setValue={setPassword}
          />
        </View>

        <View className="mx-10 mt-10">
          <Button
            onPress={handleSignIn}
            buttonText={Strings.login.loginButton}
          />
        </View>

        <Pressable
          className="mt-10"
          onPress={() => router.push("/Auth/signUpScreen")}
        >
          <Text className="font-poppins-semiBold text-center">
            {Strings.login.accountDontExtist}
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
 
export default SignInScreen;