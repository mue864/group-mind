import { View, Text, TouchableOpacity, Alert } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { ScrollView } from 'react-native-gesture-handler'

const Support = () => {
  const FAQ = [
    {
      title: "What is GroupMind?",
      description:
        "GroupMind is a study group platform for students to connect, share ideas and resources. It makes it easier for students to connect with their peers and share ideas and resources.",
      icon: "help-circle-outline",
      color: "#06B6D4",
    },
    {
      title: "How do I create a group?",
      description:
        "To create a group, navigate to the Groups tab, click on the + button and fill in the required information.",
      icon: "add-circle-outline",
      color: "#F59E0B",
    },
    {
      title: "How do I join a group?",
      description:
        "To join a group, navigate to the Groups tab, click on the group you want to join and click on the join button.",
      icon: "add-circle-outline",
      color: "#800080",
    },
    {
      title: "How do I leave a group?",
      description:
        "To leave a group, open the Group you want to leave, click on the group name and click on the leave button.",
      icon: "exit-outline",
      color: "#FF0000",
    },
    {
      title: "How do I delete a group?",
      description:
        "To delete a group, open the Group you want to delete, click on the group name and click on the delete button. Only group owners can delete groups.",
      icon: "trash-outline",
      color: "#FF6347",
    },
    {
      title: "How do I initiate a group call",
      description:
        "To initiate a group call, open the Group you want to initiate a call in, click the live tab and then choose either you want to create a video or audio call.",
      icon: "call-outline",
      color: "#10B981",
    },
    {
      title: "How do I report a group?",
      description:
        "To report a group, open the Group you want to report, click on the group name and click on the report button.",
      icon: "flag-outline",
      color: "#FF6347",
    },
    {
      title: "How do I report a user?",
      description:
        "To report a user, open the user you want to report, click on the user name and click on the report button.",
      icon: "flag-outline",
      color: "#FF6347",
    },
  ];
  return (
    <View className="flex-1 bg-[#F5F6FA]">
      <View className="mt-12 mx-4 mb-4">
        <Text className="font-poppins-semibold text-2xl text-gray-900 text-center">
          Support
        </Text>
        <Text className="text-gray-600 mt-1 text-center">
          Get help and contact support
        </Text>
      </View>

      <ScrollView className="mt-5">
        {FAQ.map((faq, index) => (
          <View
            key={index}
            className="mx-4 mt-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100"
          >
            <View className="flex-row items-center">
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: `${faq.color}20` }}
              >
                <Ionicons name={faq.icon} size={24} color={faq.color} />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-800">
                  {faq.title}
                </Text>
                <Text className="text-gray-600 text-sm mt-1">
                  {faq.description}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity className="my-5 border border-blue-400 p-4 rounded-md mx-12"
      onPress={() => Alert.alert("Developer Information", "Developer: Mutsa Murapa \nEmail: mumurapa@gmail.com")}
      >
        <Text className="text-center font-poppins text-gray-600">Contact Developer</Text>
      </TouchableOpacity>
    </View>
  );
}

export default Support