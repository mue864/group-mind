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


const VolunteerRegister = () => {
  const { getCurrentUserInfo } = useGroupContext();
  const [university, setUniversity] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([""]);
  const scrollRef = useRef<ScrollView | null>(null);
  const MAX_PRIMARY_SUBJECTS = 3;
  const [userInfo, setUserInfo] = useState({});
  const userInfoRef = useRef(userInfo);

  // Availability constants
  const days = [
    { label: "Monday", value: "monday" },
    { label: "Tuesday", value: "tuesday" },
    { label: "Wednesday", value: "wednesday" },
    { label: "Thursday", value: "thursday" },
    { label: "Friday", value: "friday" },
    { label: "Saturday", value: "saturday" },
    { label: "Sunday", value: "sunday" },
  ];
  const timeSlots = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
  ].map((t) => ({ label: t, value: t }));

  type Availability = { day: string; start: string; end: string };
  const [availability, setAvailability] = useState<Availability[]>([
    { day: "", start: "", end: "" },
  ]);

  const saveUserInfo = async () => {
    try {
      const strigifyInfo = JSON.stringify(userInfo)
      console.log("User Info: ", userInfo);
      console.log("UserInfo ref: ", userInfoRef);
      await AsyncStorage.setItem("@userProfile", strigifyInfo);
    } catch (error) {
      console.error("Unable to save info: ", error);
    }
  }

  const handleRegister = async () => {
    setSubmitted(true);
    const invalidSubjects = selectedSubjects.some((s) => s === "");
    const nonEmptySubjects = selectedSubjects.filter((s) => s !== "");
    const hasDuplicateSubjects =
      new Set(nonEmptySubjects).size !== nonEmptySubjects.length;
    const hasAtLeastOneCompleteSlot = availability.some(
      (a) => a.day && a.start && a.end
    );
    const anyIncompleteSlot = availability.some(
      (a) => (a.day || a.start || a.end) && !(a.day && a.start && a.end)
    );
    if (
      invalidSubjects ||
      hasDuplicateSubjects ||
      !hasAtLeastOneCompleteSlot ||
      anyIncompleteSlot
    )
      return;
    setLoading(true);
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "No authenticated user.");
      setLoading(false);
      return;
    }
    try {
      const nonEmptySubjects = selectedSubjects.filter((s) => s !== "");
      const initialVerification = nonEmptySubjects.reduce((acc: any, subj) => {
        acc[subj] = {
          status: "pending",
          score: 0,
          attempts: 0,
          updatedAt: Date.now(),
        };
        return acc;
      }, {} as Record<string, { status: string; score: number; attempts: number; updatedAt: number }>);
      await updateDoc(doc(db, "users", user.uid), {
        volunteerSubjects: nonEmptySubjects,
        university: university || null,
        volunteerAvailability: availability.filter(
          (a) => a.day && a.start && a.end
        ),
        volunteerVerification: initialVerification,
        volunteerVerified: false,
        profileComplete: true,
      });
      setUserInfo({
        profileComplete: true,
      });
      userInfoRef.current = {profileComplete: true};
      if (getCurrentUserInfo) {
        await getCurrentUserInfo();
      }
      saveUserInfo();
      router.replace("/verifyGate");
    } catch (error) {
      console.error("Update error:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1  items-center bg-white">
      <View className="mt-10 items-center">
        <Text className="font-poppins-semiBold text-2xl mb-10 text-primary">
          Register as a Volunteer
        </Text>
      </View>

      <ScrollView
        className="mx-10"
        ref={scrollRef}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Optional University */}
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
            placeholder="Select Your University (optional)"
            zIndex={1000}
            zIndexInverse={3000}
            setValue={setUniversity}
          />
        </View>

        {/* Subjects */}
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
            <View style={{ marginTop: 6, alignItems: "flex-end" }}>
              <TouchableOpacity
                onPress={() => {
                  setSelectedSubjects((prev) => {
                    if (prev.length <= 1) {
                      return [""];
                    }
                    const next = [...prev];
                    next.splice(index, 1);
                    return next;
                  });
                }}
              >
                <Text className="font-poppins-semibold text-sm text-[#ef4444]">
                  Remove
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        {submitted && selectedSubjects.some((s) => s === "") && (
          <Text className="font-poppins-semibold text-sm text-[#ef4444] mt-1 ml-1">
            At least one subject is required
          </Text>
        )}
        {submitted &&
          (() => {
            const filled = selectedSubjects.filter((s) => s !== "");
            return new Set(filled).size !== filled.length;
          })() && (
            <Text className="font-poppins-semibold text-sm text-[#ef4444] mt-1 ml-1">
              Duplicate subjects are not allowed
            </Text>
          )}

        {/* Availability */}
        <View style={{ width: "100%", marginTop: 6 }}>
          <Text className="font-poppins-semibold text-md text-primary mb-2">
            Availability (at least one slot)
          </Text>
          {availability.map((slot, index) => (
            <View key={`slot-${index}`} style={{ marginBottom: 12 }}>
              <View style={{ zIndex: 900 - index * 30, marginBottom: 8 }}>
                <DropDown
                  data={days}
                  placeholder={`Day ${index + 1}`}
                  zIndex={900 - index * 30}
                  zIndexInverse={2900 - index * 30}
                  setValue={(val: string) =>
                    setAvailability((prev) => {
                      const next = [...prev];
                      if (next[index].day === val) return prev;
                      next[index] = { ...next[index], day: val };
                      return next;
                    })
                  }
                  error={
                    submitted && (!!slot.start || !!slot.end) && slot.day === ""
                  }
                />
              </View>
              <View style={{ zIndex: 880 - index * 30, marginBottom: 8 }}>
                <DropDown
                  data={timeSlots}
                  placeholder="Start Time"
                  zIndex={880 - index * 30}
                  zIndexInverse={2880 - index * 30}
                  setValue={(val: string) =>
                    setAvailability((prev) => {
                      const next = [...prev];
                      if (next[index].start === val) return prev;
                      next[index] = { ...next[index], start: val };
                      return next;
                    })
                  }
                  error={
                    submitted && (!!slot.day || !!slot.end) && slot.start === ""
                  }
                />
              </View>
              <View style={{ zIndex: 860 - index * 30 }}>
                <DropDown
                  data={timeSlots}
                  placeholder="End Time"
                  zIndex={860 - index * 30}
                  zIndexInverse={2860 - index * 30}
                  setValue={(val: string) =>
                    setAvailability((prev) => {
                      const next = [...prev];
                      if (next[index].end === val) return prev;
                      next[index] = { ...next[index], end: val };
                      return next;
                    })
                  }
                  error={
                    submitted && (!!slot.day || !!slot.start) && slot.end === ""
                  }
                />
              </View>
              <View style={{ marginTop: 6, alignItems: "flex-end" }}>
                <TouchableOpacity
                  onPress={() => {
                    setAvailability((prev) => {
                      if (prev.length <= 1) {
                        return [{ day: "", start: "", end: "" }];
                      }
                      const next = [...prev];
                      next.splice(index, 1);
                      return next;
                    });
                  }}
                >
                  <Text className="font-poppins-semibold text-sm text-[#ef4444]">
                    Remove
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          {/* Availability errors */}
          {submitted &&
            !availability.some((a) => a.day && a.start && a.end) && (
              <Text className="font-poppins-semibold text-sm text-[#ef4444] mt-1 ml-1">
                At least one availability slot is required
              </Text>
            )}
        </View>

        {/* Add more subjects */}
        <View
          className="flex-row justify-center items-center gap-2 mb-2"
          style={{ position: "relative", zIndex: 4000 }}
        >
          <TouchableOpacity
            className="flex-row items-center"
            onPress={() => {
              const currentCount = selectedSubjects.filter(
                (s) => s !== ""
              ).length;
              if (currentCount >= MAX_PRIMARY_SUBJECTS) {
                Alert.alert(
                  "Limit reached",
                  `You can only select up to ${MAX_PRIMARY_SUBJECTS} primary subjects.`
                );
                return;
              }
              setSelectedSubjects((prev) => [...prev, ""]);
              requestAnimationFrame(() => {
                scrollRef.current?.scrollToEnd({ animated: true });
              });
            }}
          >
            <Text className="font-poppins-semibold text-md text-primary">
              Add More Subjects + (max {MAX_PRIMARY_SUBJECTS})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Add availability */}
        <View
          className="flex-row justify-center items-center gap-2 mb-4"
          style={{ position: "relative", zIndex: 3800 }}
        >
          <TouchableOpacity
            className="flex-row items-center"
            onPress={() => {
              setAvailability((prev) => [
                ...prev,
                { day: "", start: "", end: "" },
              ]);
              requestAnimationFrame(() => {
                scrollRef.current?.scrollToEnd({ animated: true });
              });
            }}
          >
            <Text className="font-poppins-semibold text-md text-primary">
              Add Availability Slot +
            </Text>
          </TouchableOpacity>
        </View>

        {/* Register Button */}
        <Button
          title="Register"
          onPress={handleRegister}
          loading={loading}
          disabled={
            submitted &&
            (selectedSubjects.some((s) => s === "") ||
              (() => {
                const filled = selectedSubjects.filter((s) => s !== "");
                return new Set(filled).size !== filled.length;
              })() ||
              !availability.some((a) => a.day && a.start && a.end) ||
              availability.some(
                (a) =>
                  (a.day || a.start || a.end) && !(a.day && a.start && a.end)
              ))
          }
        />
      </ScrollView>
    </View>
  );
};

export default VolunteerRegister;
