import Avatar from "@/assets/icons/Avatar.svg";
import Button from "@/components/Button";
import DropDown from "@/components/DropDown";
import ImageModal from "@/components/ImageModal";
import ProfileImage from "@/components/ProfileImage";
import TextBox from "@/components/TextBox";
import { Strings } from "@/constants";
import { ageInfo, levelInfo, userPurpose } from "@/constants/accSetupInfo";
import { auth, db } from "@/services/firebase";
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
  View,
} from "react-native";
import Toast from "react-native-toast-message";

const CreateProfile = () => {
  const router = useRouter();
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

  const handleSubmit = () => {
    setSubmitted(true);
    if (userName === "" || level === "" || age === "" || purpose === "") {
      Toast.show({
        type: "info",
        text1: "Required",
        text2: "Fill in all required fields to continue",
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
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: "#fff" }}
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
            width: 100,
            height: 100,
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
            <Avatar
              width={100}
              height={100}
              style={{
                borderWidth: 1,
                borderColor: "#9EADD9",
                borderRadius: 50,
              }}
            />
          )}
        </Pressable>

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
            <Text
              style={{
                color: "#ef4444",
                fontSize: 13,
                marginTop: 4,
                marginLeft: 2,
                fontFamily: "Poppins-SemiBold",
              }}
            >
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
            <Text
              style={{
                color: "#ef4444",
                fontSize: 13,
                marginTop: 4,
                marginLeft: 2,
                fontFamily: "Poppins-SemiBold",
              }}
            >
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
            <Text
              style={{
                color: "#ef4444",
                fontSize: 13,
                marginTop: 4,
                marginLeft: 2,
                fontFamily: "Poppins-SemiBold",
              }}
            >
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
          }}
          onPress={() => setIsChecked(!isChecked)}
        >
          <CheckBox
            value={isChecked}
            onValueChange={setIsChecked}
            color={isChecked ? "#4169E1" : "#9EADD9"}
          />
          <Text
            style={{
              marginLeft: 12,
              fontSize: 15,
              color: "#222",
              fontFamily: "Poppins-SemiBold",
            }}
          >
            {Strings.userProfile.userConfident}
          </Text>
        </Pressable>

        <Button
          title={Strings.continueButton}
          onPress={handleSubmit}
          fullWidth
          style={{ marginTop: 8, marginBottom: 24 }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default CreateProfile;
