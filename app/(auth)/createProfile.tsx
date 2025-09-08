
import Button from "@/components/Button";
import DropDown from "@/components/DropDown";
import ImageModal from "@/components/ImageModal";
import ProfileImage from "@/components/ProfileImage";
import TextBox from "@/components/TextBox";
import { Strings } from "@/constants";
import { ageInfo, levelInfo, userPurpose } from "@/constants/accSetupInfo";
import { auth, db } from "@/services/firebase";
import { useGroupContext } from "@/store/GroupContext";
import CheckBox from "expo-checkbox";
import { useRouter } from "expo-router";
import { doc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import Ionicons from "@expo/vector-icons/Ionicons";

const CreateProfile = () => {
  const router = useRouter();
  const { getCurrentUserInfo } = useGroupContext();
  // text input value
  const [userName, setUserName] = useState("");

  // rn dropdown value
  const [level, setLevel] = useState("");
  const [age, setAge] = useState("");
  const [purpose, setPurpose] = useState("");

  const [isChecked, setIsChecked] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const isFormValid =
    !!selectedImage &&
    userName.trim().length > 0 &&
    level.trim().length > 0 &&
    age.trim().length > 0 &&
    purpose.trim().length > 0;
  const handleSubmit = () => {
    setSubmitted(true);
    if (!isFormValid) {
      Toast.show({
        type: "info",
        text1: "Required",
        text2: "Please fill in all fields to continue",
      });
      return;
    }
    dataSave();
  };

  const dataSave = async () => {
    const user = auth.currentUser;
    if (user) {
      await updateDoc(doc(db, "users", user.uid), {
        userName: userName,
        level: level,
        age: age,
        purpose: purpose,
        profileImage: selectedImage,
        canExplainToPeople: isChecked,
        profileComplete: true,
      });
      // Refresh context before navigating
      if (getCurrentUserInfo) {
        await getCurrentUserInfo();
      }
      router.replace("/(dashboard)/(tabs)/home");
    } else {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "An error occured, please log in again.",
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
        {submitted && !selectedImage && (
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

        {/* DropDowns */}
        <View style={{ width: "100%", marginTop: 18, zIndex: 3000 }}>
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
        <View style={{ width: "100%", marginTop: 18, zIndex: 2000 }}>
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

        {/* Checkbox */}
        <Pressable
          style={{
            width: "100%",
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 24,
            marginTop: 10
          }}
          onPress={() => setIsChecked(!isChecked)}
        >
          <CheckBox
            value={isChecked}
            onValueChange={setIsChecked}
            color={isChecked ? "#4169E1" : "#9EADD9"}
          />
          <Text className="font-poppins-semiBold text-md text-[#4169E1] ml-3">
            {Strings.userProfile.userConfident}
          </Text>
        </Pressable>

        <Button
          title={Strings.continueButton}
          onPress={handleSubmit}
          fullWidth
          style={{
            marginTop: 8,
            marginBottom: 24,
            opacity: isFormValid ? 1 : 0.6,
          }}
          disabled={!isFormValid}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default CreateProfile;
