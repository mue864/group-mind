import Button from "@/components/Button";
import { useGroupContext } from "@/store/GroupContext";
import { router } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

const VolunteerVerify = () => {
  const { userInformation } = useGroupContext();
  const subjects: string[] = (userInformation as any)?.volunteerSubjects || [];
  const verification = (userInformation as any)?.volunteerVerification || {};

  const passedCount = Object.values(verification).filter(
    (v: any) => v?.status === "passed"
  ).length;

  return (
    <View className="flex-1 bg-white px-6 pt-8">
      <Text className="font-poppins-semiBold text-2xl text-primary mb-3">
        Verify Your Subjects
      </Text>
      <Text className="font-poppins-semibold text-sm text-gray-600 mb-4">
        Pass at least one MCQ to unlock access.
      </Text>
      <ScrollView>
        {subjects.length === 0 ? (
          <Text className="font-poppins-semibold text-md text-gray-500 mt-4">
            No subjects selected. Go back and add subjects.
          </Text>
        ) : (
          subjects.map((subj) => {
            const status = verification?.[subj]?.status || "pending";
            return (
              <View
                key={subj}
                className="mb-3 flex-row items-center justify-between"
              >
                <View>
                  <Text className="font-poppins-semibold text-md text-gray-800">
                    {subj}
                  </Text>
                  <Text className="font-poppins-semibold text-sm text-gray-500">
                    Status: {status}
                  </Text>
                </View>
                <TouchableOpacity
                  className="px-3 py-2 rounded-md"
                  onPress={() =>
                    router.push({
                      pathname: "/(auth)/volunteerVerify/[subject]",
                      params: { subject: subj },
                    })
                  }
                >
                  <Text className="font-poppins-semibold text-md text-primary">
                    Start
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>

      <Button
        title={passedCount > 0 ? "Continue to App" : "Back to Register"}
        onPress={() => {
          if (passedCount > 0) {
            router.replace("/(dashboard)/(tabs)/home");
          } else {
            router.replace("/(auth)/volunteerRegister");
          }
        }}
      />
    </View>
  );
};

export default VolunteerVerify;
