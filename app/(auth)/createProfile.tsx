import SquareBottom from "@/assets/icons/acc_squareBottom.svg";
import SquareTop from "@/assets/icons/acc_squareTop.svg";
import Avatar from "@/assets/icons/Avatar.svg";
import DropDown from "@/components/DropDown";
import TextBox from "@/components/TextBox";
import { Strings } from "@/constants";
import { ageInfo, levelInfo, userPurpose } from "@/constants/accSetupInfo";
import CheckBox from "expo-checkbox";
import { useState } from "react";
import {
  Text,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import ImageModal from "@/components/ImageModal";
import ProfileImage from "@/components/ProfileImage";
import Button from "@/components/Button";
import Toast from "react-native-toast-message";
import { auth, db } from "@/services/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useRouter } from "expo-router";

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


  const handleSubmit = () => {
    if (level === "") {
      Toast.show({
        type: 'info',
        text1: 'Required',
        text2: 'Fill in your current level',
      });
    }
    if (age === "") {
      Toast.show({
        type: 'info',
        text1: 'Required',
        text2: 'Fill in your Age'
      });
    }
    if (purpose === "") {
      Toast.show({
        type: 'info',
        text1: 'Required',
        text2: 'Select what you came for'
      })
    }

    if(purpose === "" && userName === "" && age === "" && level === "") {
      Toast.show({
        type: 'info',
        text1: 'Required',
        text2: 'Fill in the blanks to continue'
      });
    }

    dataSave();
  }

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
      router.replace('/(dashboard)/(tabs)/home')
    } else {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: "An error occured, please log in again."
      });
      router.replace('/(auth)/signInScreen');
    }
  }
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <View className="flex-1 relative">
        {/* Background shapes */}
        <View className="absolute -z-10 left-0">
          <SquareTop width={160} height={150} />
        </View>
        <View className="absolute bottom-0 right-0 -z-10">
          <SquareBottom width={200} height={200} />
        </View>

        <ScrollView
          contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
        >
          {/* Header */}
          <Text className="font-poppins-semiBold text-2xl text-primary text-center mt-10">
            {Strings.userProfile.profileCreationHeading}
          </Text>

          {/* Avatar */}
          <Pressable
            className="items-center mt-6 mb-4 justify-center mx-auto"
            onPress={() => setModalVisible(!isModalVisible)}
            style={{ width: 100, height: 100 }}
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
                width={150}
                height={150}
                className="border border-muted"
              />
            )}
          </Pressable>

          {/* Username */}
          <View className="mx-10">  
            <TextBox
              onChangeText={setUserName}
              value={userName}
              borderColor={true}
              secureTextEntry={false}
              placeholder={Strings.userProfile.userName}
              method={"default"}
              setValue={setUserName}
            />
          </View>

          {/* DropDowns */}
          <View className="mx-10 mt-4" style={{ zIndex: 3000 }}>
            <DropDown
              data={levelInfo}
              placeholder={Strings.userProfile.userLevel}
              zIndex={3000}
              zIndexInverse={1000}
              setValue={setLevel}
            />
          </View>

          <View className="mx-10 mt-4" style={{ zIndex: 2000 }}>
            <DropDown
              data={ageInfo}
              placeholder={Strings.userProfile.userAge}
              zIndex={2000}
              zIndexInverse={2000}
              setValue={setAge}
            />
          </View>

          <View className="mx-10 mt-4 mb-6" style={{ zIndex: 1000 }}>
            <DropDown
              data={userPurpose}
              placeholder={Strings.userProfile.userPurpose}
              zIndex={1000}
              zIndexInverse={3000}
              setValue={setPurpose}
            />
          </View>

          {/* Checkbox */}
          <Pressable className="mx-10 flex-row items-center"
          onPress={() => setIsChecked(!isChecked)}
          >
            <CheckBox
              value={isChecked}
              onValueChange={setIsChecked}
              color={isChecked ? "#4169E1" : "#9EADD9"}
            />
            <Text className="ml-3">{Strings.userProfile.userConfident}</Text>
          </Pressable>

          <View className="mx-10 absolute bottom-20 right-16 left-16">
            <Button 
            buttonText={Strings.continueButton}
            onPress={handleSubmit}
            />
          </View>

        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

export default CreateProfile;
