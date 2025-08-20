import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native'
import React from 'react'
import {router} from "expo-router";
import {Ionicons} from "@expo/vector-icons";
import { auth } from '@/services/firebase';
import { signOut } from 'firebase/auth';

const AccountSettings = () => {
    const settings = [
        {
            title: "Profile",
            description: "Manage your profile settings",
            icon: "person-outline",
            onPress: () => router.push("/(dashboard)/profile"),
            color: "#10B981",
        },
        {
            title: "Delete Account",
            description: "Delete your account",
            icon: "trash-outline",
            onPress: () => Alert.alert("Delete Account", "Are you sure you want to delete your account?"),
            color: "#EF4444",
        },
        {
            title: "Security",
            description: "Manage your security settings",
            icon: "lock-closed-outline",
            onPress: () => Alert.alert("Security", "Your data is secure with us"),
            color: "#8B5CF6",
        },
        {
            title: "Logout",
            description: "Logout from your account",
            icon: "log-out-outline",
            onPress: async () => {
                Alert.alert("Logout", "Are you sure you want to logout?", [
                    {
                        text: "Cancel",
                        onPress: () => console.log("Cancel Pressed"),
                        style: "cancel",
                    },
                    {
                        text: "Logout",
                        onPress: async () => {
                            await signOut(auth)
                            router.replace("/(auth)/signInScreen");
                        },
                        style: "destructive",
                    },
                ]);
            },
            color: "#10B981",
        }
    ]
  return (
    <View className="flex-1 bg-[#F5F6FA]">
      <View className='mt-4 mx-4'>
        <Text className='font-poppins-semibold text-2xl text-gray-900 text-center'>Account Settings</Text>
      </View>

      <ScrollView className='mt-4 mx-4'>
        <View className='gap-3'>
            {settings.map((setting, index) => (
                <TouchableOpacity
                    key={index}
                    onPress={setting.onPress}
                    className='bg-white p-4 rounded-xl shadow-sm border border-gray-100'
                    activeOpacity={0.7}
                >
                    <View className='flex-row items-center'>
                        <View
                            className='w-12 h-12 rounded-full items-center justify-center mr-4'
                            style={{backgroundColor: `${setting.color}20`}}
                        >
                            <Ionicons name={setting.icon} size={24} color={setting.color} />
                        </View>
                        <View className='flex-1'>
                            <Text className='text-lg font-semibold text-gray-800'>
                                {setting.title}
                            </Text>
                            <Text className='text-gray-600 text-sm mt-1'>
                                {setting.description}
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </View>
                </TouchableOpacity>
            ))}
        </View>
      </ScrollView>
    </View>
  )
}

export default AccountSettings