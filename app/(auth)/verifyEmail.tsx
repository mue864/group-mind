import { View, Text, TouchableOpacity, Alert } from 'react-native'
import React, {useState} from 'react'
import {FontAwesome6} from "@expo/vector-icons";
import { router } from 'expo-router';
import { getAuth, onAuthStateChanged, reload } from 'firebase/auth';
import Toast from 'react-native-toast-message';


const VerifyEmail = () => {
const auth = getAuth();

  async function refreshUser() {
    if(auth.currentUser) {
      await reload(auth.currentUser);
      console.log("User reloaded, email verified:", auth.currentUser?.emailVerified);
    }
  }
  // this has to be async i think
  const verifyEmailApproved = () => {
    refreshUser();    

    onAuthStateChanged(auth, (user) => {
      if (user?.emailVerified) {
        Toast.show({
          type: "success",
          text1: "Account Verified",
          visibilityTime: 1000,
          onHide() {
              router.replace("/(auth)/createProfile")
          },
        })
      } else {
         Toast.show({
          type: "error",
          text1: "Email Not Verified!",
          text2: "Verify your email to proceed"
         })
      }
    });
  }
 
  return (
    <View className="flex-1 bg-white justify-center items-center gap-16">
      <View className="items-center gap-5">
        <View className="bg-blue-500 w-40 h-40 items-center justify-center rounded-full shadow-sm shadow-black">
          <FontAwesome6 name="envelope" size={70} color="white" />
        </View>
        <View className="w-72">
          <Text className="text-center font-poppins-semiBold text-gray-500">
            An email has been sent. Check your mailbox and follow the steps.
            When done, click the proceed button
          </Text>
        </View>
      </View>

      <View className='gap-5'>
        <TouchableOpacity
          className="bg-blue-700 w-56 h-16 items-center justify-center rounded-md shadow-sm shadow-black"
          activeOpacity={0.7}
          onPress={verifyEmailApproved}
        >
          <Text className="font-poppins text-white font-3xl font-bold">
            Verify
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-red-500 w-56 h-16 items-center justify-center rounded-md shadow-sm shadow-black"
          activeOpacity={0.7}
          onPress={() => router.replace("/(auth)/signInScreen")}
        >
          <Text className="font-poppins text-white font-3xl font-bold">
            Go Back
          </Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

export default VerifyEmail