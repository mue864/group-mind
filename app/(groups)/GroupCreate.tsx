import Camera from "@/assets/icons/camera.svg";
import groupImages from "@/assets/images/group_images";
import Button from "@/components/Button";
import DropDown from "@/components/DropDown";
import GroupImageModal from "@/components/GroupImageModal";
import TextBox from "@/components/TextBox";
import { useGroupContext } from "@/store/GroupContext";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

interface GroupImagesProp {
  groupImage1: string;
  groupImage2: string;
  groupImage3: string;
  groupImage4: string;
  groupImage5: string;
  groupImage6: string;
  groupImage7: string;
  groupImage8: string;
  groupImage9: string;
  groupImage10: string;
  groupImage11: string;
}

const GroupCreate = () => {
  const { groupCreating, createGroup, groupCreated, groupID, setGroupCreated } = useGroupContext();

  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [groupDescription, setGroupDescription] = useState("");
  const [groupName, setGroupName] = useState("");
  const [category, setCategory] = useState("");
  const [grade, setGrade] = useState("");
  const [onboardingText, setOnboardingText] = useState("");
  const [hasGroupNameErrors, setHasGroupNameErrors] = useState(false);
  const [hasGroupDescriptionErrors, setHasGroupDescriptionErrors] =
    useState(false);
  const [groupNameTouched, setGroupNameTouched] = useState(false);
  const [groupDescriptionTouched, setGroupDescriptionTouched] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [privacy, setPrivacy] = useState("");

  const categoryOptions = [
    { label: "Math", value: "Math" },
    { label: "Science", value: "Science" },
    { label: "History", value: "History" },
    { label: "English", value: "English" },
  ];
  const gradeOptions = [
    { label: "Grade 8", value: "Grade 8" },
    { label: "Grade 9", value: "Grade 9" },
    { label: "Grade 10", value: "Grade 10" },
    { label: "Grade 11", value: "Grade 11" },
  ];

  const privacyOptions =[
    {label: "Private", value: "Private"},
    {label: "Public", value: "Public"},
  ]


  const router = useRouter();

  const formValid =
    groupName.length >= 3 &&
    groupDescription.length >= 7 &&
    category &&
    grade &&
    onboardingText &&
    selectedImage;

  useEffect(() => {
    if (groupNameTouched) {
      setHasGroupNameErrors(groupName.length < 3);
    }
  }, [groupName, groupNameTouched]);

  useEffect(() => {
    if (groupDescriptionTouched) {
      setHasGroupDescriptionErrors(groupDescription.length < 7);
    }
  }, [groupDescription, groupDescriptionTouched]);

  const handleSubmit = () => {
    setSubmitted(true);
    if (
      groupName.length < 3 ||
      groupDescription.length < 7 ||
      !category ||
      !grade ||
      !onboardingText ||
      !selectedImage ||
      !privacy
    ) {
      return;
    }
    createGroup(
      groupName,
      groupDescription,
      selectedImage,
      category,
      grade,
      onboardingText,
      privacy === "Private" ? true : false
    );
  };

  useEffect(() => {
    if (groupCreated) {
      setGroupCreated(false);
      router.replace({
        pathname: `/(groups)/[groupId]`,
        params: {
          groupId: groupID,
          groupName: groupName,
        },
      });
    }
  }, [groupCreated, groupID, router, setGroupCreated, groupName]);

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: "#fff" }}
      contentContainerStyle={{
        alignItems: "center",
        paddingBottom: 40,
        paddingHorizontal: 20,
      }}
      enableOnAndroid={true}
      keyboardShouldPersistTaps="handled"
      extraScrollHeight={100}
    >
      {/* Avatar Picker */}
      <Pressable
        style={{
          alignItems: "center",
          marginTop: 32,
          marginBottom: 16,
          justifyContent: "center",
          width: 120,
          height: 120,
        }}
        onPress={() => setModalVisible(true)}
      >
        {selectedImage ? (
          <Image
            source={groupImages[selectedImage as keyof GroupImagesProp]}
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              borderWidth: 1,
              borderColor: "#9EADD9",
            }}
            resizeMode="cover"
          />
        ) : (
          <View
            style={{
              borderWidth: 1,
              borderColor: "#9EADD9",
              borderRadius: 60,
              width: 120,
              height: 120,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#F6F8FE",
            }}
          >
            <Camera width={40} height={40} />
          </View>
        )}
      </Pressable>
      <GroupImageModal
        show={isModalVisible}
        onDismiss={() => setModalVisible(false)}
        onImageSelect={setSelectedImage}
      />
      {/* Group Name */}
      <TextBox
        placeholder="Group Name"
        value={groupName}
        onChangeText={(text) => {
          setGroupNameTouched(true);
          setGroupName(text);
        }}
        errorText={
          submitted && groupName.length < 3
            ? "Group name must be at least 3 characters"
            : undefined
        }
        secureTextEntry={false}
      />
      {/* Group Description */}
      <TextBox
        placeholder="Group Description"
        value={groupDescription}
        onChangeText={(text) => {
          setGroupDescriptionTouched(true);
          setGroupDescription(text);
        }}
        errorText={
          submitted && groupDescription.length < 7
            ? "Description must be at least 7 characters"
            : undefined
        }
        secureTextEntry={false}
        style={{
          marginTop: 18,
          borderColor: groupDescription.length >= 7 ? "#4CAF50" : undefined,
        }}
      />
      {/* Category Dropdown */}
      <View style={{ width: "100%", marginTop: 18, zIndex: 3000 }}>
        <DropDown
          data={categoryOptions}
          placeholder="Category"
          zIndex={3000}
          zIndexInverse={1000}
          setValue={setCategory}
          error={submitted && !category}
        />
        {submitted && !category && (
          <Text
            style={{
              color: "#ef4444",
              fontSize: 13,
              marginTop: 4,
              marginLeft: 2,
              fontFamily: "Poppins-SemiBold",
            }}
          >
            Category is required
          </Text>
        )}
      </View>
      {/* Grade Dropdown */}
      <View style={{ width: "100%", marginTop: 18, zIndex: 2000 }}>
        <DropDown
          data={gradeOptions}
          placeholder="Grade Level"
          zIndex={2000}
          zIndexInverse={2000}
          setValue={setGrade}
          error={submitted && !grade}
        />

        {submitted && !grade && (
          <Text
            style={{
              color: "#ef4444",
              fontSize: 13,
              marginTop: 4,
              marginLeft: 2,
              fontFamily: "Poppins-SemiBold",
            }}
          >
            Grade is required
          </Text>
        )}
      </View>
      {/* Privacy Dropdown */}
      <View style={{ width: "100%", marginTop: 18, zIndex: 2000 }}>
        <DropDown
          data={privacyOptions}
          placeholder="Privacy"
          zIndex={2000}
          zIndexInverse={2000}
          setValue={setPrivacy}
          error={submitted && !privacy}
        />

        {submitted && !privacy && (
          <Text
            style={{
              color: "#ef4444",
              fontSize: 13,
              marginTop: 4,
              marginLeft: 2,
              fontFamily: "Poppins-SemiBold",
            }}
          >
            Privacy Options is required
          </Text>
        )}
      </View>
      {/* Onboarding Text */}
      <TextBox
        placeholder="Onboarding Text"
        value={onboardingText}
        onChangeText={setOnboardingText}
        errorText={
          submitted && onboardingText.length === 0
            ? "Onboarding text is required"
            : undefined
        }
        secureTextEntry={false}
        style={{
          marginTop: 18,
          borderColor: onboardingText.length > 0 ? "#4CAF50" : undefined,
        }}
      />
      {/* Create Group Button */}
      <Button
        onPress={handleSubmit}
        title="Create Group"
        fullWidth
        disabled={!formValid || groupCreating}
        loading={groupCreating}
        style={{ marginTop: 100 }}
      />

      {/* Go Back Button */}
      <Button
        onPress={() => router.back()}
        title="Go Back"
        fullWidth
        style={{ marginTop: 10 }}
      />
    </KeyboardAwareScrollView>
  );
};

export default GroupCreate;
