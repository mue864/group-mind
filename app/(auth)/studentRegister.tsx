import Button from "@/components/Button";
import DropDown from "@/components/DropDown";
import { subjects } from "@/constants/subjects";
import { zimbabweUniversities } from "@/constants/universities";
import { auth, db } from "@/services/firebase";
import { useGroupContext } from "@/store/GroupContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { doc, updateDoc } from "firebase/firestore";
import React, { useRef, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";

const StudentRegister = () => {
  const { getCurrentUserInfo } = useGroupContext();
  const [university, setUniversity] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([""]);
  const scrollRef = useRef<ScrollView | null>(null);
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState({})


  const saveUserInfo = async () => {
    try {
      const stringfyInfo = JSON.stringify(userInfo);
       await AsyncStorage.setItem("@userProfile", stringfyInfo)
    } catch (error) {
      console.error("Unable to save data: ", error);
    }
  }

  const handleRegister = async () => {
    setSubmitted(true);
    setLoading(true);
    const user = auth.currentUser;
    if (user) {
      try {
        await updateDoc(doc(db, "users", user.uid), {
          subjectsOfInterest: selectedSubjects,
          university: university,
          profileComplete: true,
        });
        setUserInfo({
          profileComplete: true,
        })
        if (getCurrentUserInfo) {
          await getCurrentUserInfo();
        }
        saveUserInfo();
      } catch (error) {
        console.error("Update error:", error);
        Alert.alert("Error", "Failed to update profile. Please try again.");
        setLoading(false);
      } finally {
        setLoading(false);
      }
      router.replace("/(dashboard)/(tabs)/home");
    }
  };

  return (
    <View className="flex-1  items-center bg-white">
      <View className="mt-10 items-center">
        <Text className="font-poppins-semiBold text-2xl mb-10 text-primary">
          Register as a Student
        </Text>
      </View>
      <ScrollView
        className="mx-10"
        ref={scrollRef}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            width: "100%",
            marginTop: 18,
            marginBottom: 18,
            zIndex: 1000,
          }}
        >
          <DropDown
            data={zimbabweUniversities}
            placeholder="Select Your University"
            zIndex={1000}
            zIndexInverse={3000}
            setValue={setUniversity}
            error={submitted && university === ""}
          />
          {submitted && university === "" && (
            <Text className="font-poppins-semibold text-sm text-[#ef4444] mt-1 ml-1">
              University is required
            </Text>
          )}
        </View>
        {selectedSubjects.map((subjectValue, index) => (
          <View
            key={`subject-${index}`}
            style={{
              width: "100%",
              marginTop: 9,
              marginBottom: 18,
              zIndex: 1000 - index * 10,
            }}
          >
            <DropDown
              data={subjects}
              placeholder={`Select Subject ${index + 1}`}
              zIndex={1000 - index * 10}
              zIndexInverse={3000 - index * 10}
              setValue={(newValue: string) => {
                setSelectedSubjects((prev) => {
                  if (prev[index] === newValue) return prev;
                  const next = [...prev];
                  // Find the label for the selected value
                  const selectedSubject = subjects.find(s => s.value === newValue);
                  next[index] = selectedSubject ? selectedSubject.label : newValue;
                  return next;
                });
              }}
              error={submitted && subjectValue === ""}
            />
          </View>
        ))}
        {submitted && selectedSubjects.some((s) => s === "") && (
          <Text className="font-poppins-semibold text-sm text-[#ef4444] mt-1 ml-1">
            Subjects are required
          </Text>
        )}

        {/* add more subjects */}
        <View
          className="flex-row justify-center items-center gap-2 mb-2"
          style={{ position: "relative", zIndex: 4000 }}
        >
          <TouchableOpacity
            className="flex-row items-center"
            onPress={() => {
              setSelectedSubjects((prev) => [...prev, ""]);
              requestAnimationFrame(() => {
                scrollRef.current?.scrollToEnd({ animated: true });
              });
            }}
          >
            <Text className="font-poppins-semibold text-md text-primary">
              Add More Subjects +
            </Text>
          </TouchableOpacity>
        </View>

        {/* Register Button */}
        <Button
          title="Register"
          onPress={
            university === "" || selectedSubjects.some((s) => s === "")
              ? () => {}
              : handleRegister
          }
          loading={loading}
          disabled={
            submitted &&
            (university === "" || selectedSubjects.some((s) => s === "")) &&
            loading
          }
        />
      </ScrollView>
    </View>
  );
};

export default StudentRegister;
