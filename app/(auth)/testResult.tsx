import Button from "@/components/Button";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

interface TestResultProps {
  passed: boolean;
  subject: string;
  score: number;
  totalQuestions: number;
}

const TestResult = () => {
  const router = useRouter();
  const { passed, subject, score, totalQuestions } = useLocalSearchParams<{
    passed: string;
    subject: string;
    score: string;
    totalQuestions: string;
  }>();

  const isPassed = passed === "true";
  const scoreNum = parseInt(score || "0");
  const totalNum = parseInt(totalQuestions || "0");
  const percentage = totalNum > 0 ? Math.round((scoreNum / totalNum) * 100) : 0;

  return (
    <View className="flex-1 bg-white justify-center items-center px-6">
      <View className="items-center mb-8">
        {/* Result Icon */}
        <View
          className={`w-32 h-32 rounded-full items-center justify-center mb-6 ${
            isPassed ? "bg-green-100" : "bg-red-100"
          }`}
        >
          <Ionicons
            name={isPassed ? "checkmark-circle" : "close-circle"}
            size={80}
            color={isPassed ? "#22c55e" : "#ef4444"}
          />
        </View>

        {/* Result Title */}
        <Text
          className={`text-3xl font-poppins-semiBold text-center mb-3 ${
            isPassed ? "text-green-600" : "text-red-600"
          }`}
        >
          {isPassed ? "Congratulations!" : "Test Not Passed"}
        </Text>

        {/* Subject */}
        <Text className="text-xl font-poppins-semiBold text-gray-800 text-center mb-2">
          {subject} Verification
        </Text>

        {/* Score */}
        <Text className="text-lg font-poppins text-gray-600 text-center mb-6">
          You scored {scoreNum} out of {totalNum} ({percentage}%)
        </Text>

        {/* Result Message */}
        <View className="bg-gray-50 rounded-2xl p-6 mb-8">
          <Text className="text-base font-poppins text-gray-700 text-center leading-6">
            {isPassed
              ? `🎉 You have successfully passed the ${subject} verification test! You can now help students in ${subject} groups and access ${subject} study communities.`
              : `📚 You need to score higher to pass the ${subject} verification. Review the material and try again when you're ready.`}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="w-full space-y-4">
        {isPassed ? (
          <>
            <Button
              title="Continue to Dashboard"
              onPress={() => router.replace("/(dashboard)/(tabs)/home")}
              fullWidth
              style={{ marginBottom: 12 }}
            />
            <Button
              title="Take Another Test"
              onPress={() => router.replace("/(auth)/volunteerVerify")}
              fullWidth
              style={{
                backgroundColor: "transparent",
                borderWidth: 2,
                borderColor: "#4169E1",
              }}
              textStyle={{ color: "#4169E1" }}
            />
          </>
        ) : (
          <>
            <Button
              title="Try Again"
              onPress={() => router.back()}
              fullWidth
              style={{ marginBottom: 12 }}
            />
            <Button
              title="Back to Verification"
              onPress={() => router.replace("/(auth)/volunteerVerify")}
              fullWidth
              style={{
                backgroundColor: "transparent",
                borderWidth: 2,
                borderColor: "#4169E1",
              }}
              textStyle={{ color: "#4169E1" }}
            />
          </>
        )}
      </View>
    </View>
  );
};

export default TestResult;
