import { View, Text, TouchableOpacity } from 'react-native'
import React, {useState} from 'react'
import {FontAwesome6} from "@expo/vector-icons";


const VerifyEmail = () => {
 
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
      <TouchableOpacity className="bg-blue-700 w-56 h-16 items-center justify-center rounded-md shadow-sm shadow-black"
      activeOpacity={0.7}
      >
        <Text className="font-poppins text-white font-3xl font-bold">
          Verify
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default VerifyEmail