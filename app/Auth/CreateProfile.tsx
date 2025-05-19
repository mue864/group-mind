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

const CreateProfile = () => {
  const [userName, setUserName] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

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
                width={100}
                height={100}
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
            />
          </View>

          {/* DropDowns */}
          <View className="mx-10 mt-4" style={{ zIndex: 3000 }}>
            <DropDown
              data={levelInfo}
              placeholder={Strings.userProfile.userLevel}
              zIndex={3000}
              zIndexInverse={1000}
            />
          </View>

          <View className="mx-10 mt-4" style={{ zIndex: 2000 }}>
            <DropDown
              data={ageInfo}
              placeholder={Strings.userProfile.userAge}
              zIndex={2000}
              zIndexInverse={2000}
            />
          </View>

          <View className="mx-10 mt-4 mb-6" style={{ zIndex: 1000 }}>
            <DropDown
              data={userPurpose}
              placeholder={Strings.userProfile.userPurpose}
              zIndex={1000}
              zIndexInverse={3000}
            />
          </View>

          {/* Checkbox */}
          <View className="mx-10 flex-row items-center">
            <CheckBox
              value={isChecked}
              onValueChange={setIsChecked}
              color={isChecked ? "#4169E1" : "#9EADD9"}
            />
            <Text className="ml-3">{Strings.userProfile.userConfident}</Text>
          </View>

          <View className="mx-10 absolute bottom-20 right-16 left-16">
            <Button 
            buttonText={Strings.continueButton}
            onPress={() => console.log("Data: ")}
            />
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

export default CreateProfile;
