import Button from "@/components/Button";
import { MCQ_PASS_THRESHOLD, SUBJECT_MCQS } from "@/constants/mcq";
import { auth, db } from "@/services/firebase";
import CheckBox from "expo-checkbox";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useMemo, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";

const VerifySubject = () => {
  const { subject } = useLocalSearchParams<{ subject: string }>();
  const router = useRouter();
  const questions = useMemo(() => {
    // Convert readable subject label back to value key for MCQ lookup
    const subjectKey = subject === "Computer Science" ? "computer_science" :
                      subject === "Software Engineering" ? "software_engineering" :
                      subject === "Mathematics" ? "mathematics" :
                      subject === "Accounting" ? "accounting" :
                      subject === "Economics" ? "economics" :
                      subject === "Business Studies" ? "business_studies" :
                      String(subject).toLowerCase().replace(/\s+/g, '_');
    
    return SUBJECT_MCQS[subjectKey] || [];
  }, [subject]);
  const [selected, setSelected] = useState<number[]>(
    Array(questions.length).fill(-1)
  );
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    const score = selected.reduce(
      (acc, s, i) => (s === questions[i].correctIndex ? acc + 1 : acc),
      0
    );
    const passed = score >= MCQ_PASS_THRESHOLD;
    const isVerified = false;
    setSubmitting(true);
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "No authenticated user.");
      setSubmitting(false);
      return;
    }
    try {
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      const data = snap.data() || {};
      const verification = data.volunteerVerification || {};
      verification[subject as string] = {
        status: passed ? "passed" : "failed",
        score,
        attempts: (verification[subject as string]?.attempts || 0) + 1,
        updatedAt: Date.now(),
      };
      const passedCount = Object.values(verification).filter(
        (v: any) => v?.status === "passed"
      ).length;
      await updateDoc(userRef, {
        volunteerVerification: verification,
        volunteerVerified: passedCount > 0,
      });
      // Navigate to result page with test details
      router.replace({
        pathname: "/(auth)/testResult",
        params: {
          passed: passed.toString(),
          subject: subject as string,
          score: score.toString(),
          totalQuestions: questions.length.toString(),
        },
      });
    } catch (e) {
      Alert.alert("Error", "Could not submit verification.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <View className="px-6 pt-8 pb-2">
        <Text className="font-poppins-semiBold text-2xl text-primary mb-1">
          {subject}
        </Text>
        <Text className="font-poppins-semibold text-sm text-gray-500">
          Answer all questions by selecting one option per question
        </Text>
      </View>

      <ScrollView
        className="px-6"
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {questions.map((item, i) => (
          <View
            key={i}
            className="mb-4 rounded-2xl"
            style={{
              borderWidth: 1,
              borderColor: "#E5E7EB",
              backgroundColor: "#FFFFFF",
            }}
          >
            <View
              className="px-4 py-3"
              style={{ borderBottomWidth: 1, borderBottomColor: "#E5E7EB" }}
            >
              <Text className="font-poppins-semiBold text-[#1F2937]">
                Question {i + 1} of {questions.length}
              </Text>
            </View>
            <View className="px-4 py-4">
              <Text className="font-poppins-semibold text-[16px] text-[#111827] mb-3">
                {item.text}
              </Text>
              <View className="gap-3">
                {item.options.map((opt, idx) => {
                  const isSelected = selected[i] === idx;
                  return (
                    <TouchableOpacity
                      key={idx}
                      activeOpacity={0.8}
                      onPress={() =>
                        setSelected((prev) => {
                          const next = [...prev];
                          next[i] = idx;
                          return next;
                        })
                      }
                      className={`flex-row items-center rounded-xl px-3 py-3 ${
                        isSelected ? "bg-[#EEF2FF]" : "bg-white"
                      }`}
                      style={{
                        borderWidth: 1,
                        borderColor: isSelected ? "#9AA7F0" : "#E5E7EB",
                      }}
                    >
                      <CheckBox
                        value={isSelected}
                        onValueChange={() =>
                          setSelected((prev) => {
                            const next = [...prev];
                            next[i] = idx;
                            return next;
                          })
                        }
                        color={isSelected ? "#4169E1" : undefined}
                      />
                      <Text
                        className={`ml-3 font-poppins-semibold ${
                          isSelected ? "text-primary" : "text-gray-700"
                        }`}
                      >
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        ))}
        <Button title="Submit" onPress={submit} loading={submitting} />
      </ScrollView>
    </View>
  );
};

export default VerifySubject;
