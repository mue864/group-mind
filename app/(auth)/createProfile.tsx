import Button from "@/components/Button";
import DropDown from "@/components/DropDown";
import ImageModal from "@/components/ImageModal";
import ProfileImage from "@/components/ProfileImage";
import TextBox from "@/components/TextBox";
import { Strings } from "@/constants";
import { ageInfo, levelInfo, userPurpose } from "@/constants/accSetupInfo";
import { auth, db } from "@/services/firebase";
import { useGroupContext } from "@/store/GroupContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CheckBox from "expo-checkbox";
import { useRouter } from "expo-router";
import { doc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

const CreateProfile = () => {
  const router = useRouter();
  const { getCurrentUserInfo } = useGroupContext();
  // text input value
  const [userName, setUserName] = useState("");
  const [isVolunteer, setIsVolunteer] = useState(false);
  // rn dropdown value
  const [level, setLevel] = useState("");
  const [age, setAge] = useState("");
  const [purpose, setPurpose] = useState("");

  const [isChecked, setIsChecked] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsVolunteer(purpose === "Volunteer");
  }, [purpose]);

  const isFormValid =
    userName.trim().length > 0 &&
    (isVolunteer || level.trim().length > 0) &&
    age.trim().length > 0 &&
    purpose.trim().length > 0;

  const handleNext = () => {
    setSubmitted(true);
    if (!isFormValid) {
      Toast.show({
        type: "info",
        text1: "Required",
        text2: "Please fill in all fields to continue",
      });
      return;
    }
    setLoading(true);
    dataSave();
  };

  // save step
  const localSave = async () => {
    const saveData = {
      profileStep: 1,
      profilePurpose: purpose,
    };
    const newValue = JSON.stringify(saveData);
    try {
      await AsyncStorage.setItem("@profileStep", newValue);
    } catch (error) {
      console.error("Error saving profile step to AsyncStorage:", error);
    }
  };

  const dataSave = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        await updateDoc(doc(db, "users", user.uid), {
          userName: userName,
          level: level,
          age: age,
          purpose: purpose,
          profileImage: selectedImage,
          canExplainToPeople: isChecked,
          // profileComplete: true,
        });
        // Refresh context before navigating
        if (getCurrentUserInfo) {
          await getCurrentUserInfo();
        }
        await localSave();
        if (purpose === "Volunteer") {
          router.replace("/(auth)/volunteerRegister");
        } else {
          router.replace("/(auth)/studentRegister");
        }
      } catch (error) {
        console.error("Profile update error:", error);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to update profile. Please try again.",
        });
        setLoading(false);
      }
    } else {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "An error occured, please signup in again.",
      });
      router.replace("/(auth)/signInScreen");
    }
  };
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fff" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 40,
          flexGrow: 1,
          alignItems: "center",
          paddingHorizontal: 20,
        }}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
      >
        {/* Header */}
        <Text
          style={{
            fontFamily: "Poppins-SemiBold",
            fontSize: 24,
            color: "#4169E1",
            textAlign: "center",
            marginTop: 32,
          }}
        >
          {Strings.userProfile.profileCreationHeading}
        </Text>

        {/* Avatar */}
        <Pressable
          style={{
            alignItems: "center",
            marginTop: 24,
            marginBottom: 16,
            justifyContent: "center",
            width: 150,
            height: 150,
            borderWidth: submitted && !selectedImage ? 2 : 0,
            borderColor: submitted && !selectedImage ? "#ef4444" : undefined,
            borderRadius: 50,
          }}
          onPress={() => setModalVisible(!isModalVisible)}
        >
          <ImageModal
            modalVisible={isModalVisible}
            changeModalVisibility={setModalVisible}
            selectedImage={setSelectedImage}
          />
          {selectedImage !== null ? (
            <ProfileImage imageLocation={selectedImage} />
          ) : (
            <View className="bg-[#4169E1] rounded-full p-4 w-full h-full justify-center items-center">
              <Ionicons
                name="person-circle-outline"
                size={150}
                color="#fff"
                style={{
                  width: 150,
                  height: 150,
                }}
              />
            </View>
          )}
        </Pressable>
        {submitted && !selectedImage && !isVolunteer && (
          <Text
            style={{
              color: "#ef4444",
              fontSize: 13,
              marginBottom: 8,
              fontFamily: "Poppins-SemiBold",
            }}
          >
            Profile image is required
          </Text>
        )}

        {/* Username */}
        <TextBox
          onChangeText={setUserName}
          value={userName}
          errorText={
            submitted && userName.length === 0
              ? "Username is required"
              : undefined
          }
          secureTextEntry={false}
          placeholder={Strings.userProfile.userName}
          style={{ marginTop: 20 }}
        />

        <View
          style={{
            width: "100%",
            marginTop: 18,
            marginBottom: 18,
            zIndex: 1000,
          }}
        >
          <DropDown
            data={userPurpose}
            placeholder={Strings.userProfile.userPurpose}
            zIndex={1000}
            zIndexInverse={3000}
            setValue={setPurpose}
            error={submitted && purpose === ""}
          />
          {submitted && purpose === "" && (
            <Text className="font-poppins-semibold text-sm text-[#ef4444] mt-1 ml-1">
              Purpose is required
            </Text>
          )}
        </View>

        {/* DropDowns */}
        {!isVolunteer && (
          <View style={{ width: "100%", zIndex: 3000 }}>
            <DropDown
              data={levelInfo}
              placeholder={Strings.userProfile.userLevel}
              zIndex={3000}
              zIndexInverse={1000}
              setValue={setLevel}
              error={submitted && level === ""}
            />
            {submitted && level === "" && (
              <Text className="font-poppins-semibold text-sm text-[#ef4444] mt-1 ml-1">
                Level is required
              </Text>
            )}
          </View>
        )}
        <View style={{ width: "100%", zIndex: 2000, marginTop: 18 }}>
          <DropDown
            data={ageInfo}
            placeholder={Strings.userProfile.userAge}
            zIndex={2000}
            zIndexInverse={2000}
            setValue={setAge}
            error={submitted && age === ""}
          />
          {submitted && age === "" && (
            <Text className="font-poppins-semibold text-sm text-[#ef4444] mt-1 ml-1">
              Age is required
            </Text>
          )}
        </View>

        <Button
          title="Next"
          onPress={handleNext}
          fullWidth
          loading={loading}
          style={{
            marginTop: 8,
            marginBottom: 24,
            opacity: isFormValid ? 1 : 0.6,
          }}
          disabled={!isFormValid || loading}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default CreateProfile;
