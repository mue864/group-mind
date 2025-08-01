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
import Ionicons from "@expo/vector-icons/Ionicons";
import { levelInfo } from "@/constants/accSetupInfo";
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
  const { groupCreating, createGroup, groupCreated, groupID, setGroupCreated } =
    useGroupContext();

  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [groupDescription, setGroupDescription] = useState("");
  const [groupName, setGroupName] = useState("");
  const [category, setCategory] = useState("");
  const [grade, setGrade] = useState("");
  const [onboardingText, setOnboardingText] = useState("");
  const [onboardingRules, setOnboardingRules] = useState<string[]>([]);
  const [newRule, setNewRule] = useState("");
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
    { label: "Social Studies", value: "Social Studies" },
    { label: "Geography", value: "Geography" },
    { label: "Life Sciences", value: "Life Sciences" },
    { label: "Physical Sciences", value: "Physical Sciences" },
    { label: "Accounting", value: "Accounting" },
    { label: "Economics", value: "Economics" },
    { label: "Business Studies", value: "Business Studies" },
    { label: "Computer Science", value: "Computer Science" },
    { label: "Art", value: "Art" },
  ];


  const privacyOptions = [
    { label: "Private", value: "Private" },
    { label: "Public", value: "Public" },
  ];

  const router = useRouter();

  const formValid =
    groupName.length >= 3 &&
    groupDescription.length >= 7 &&
    category &&
    grade &&
    onboardingText &&
    selectedImage &&
    onboardingRules.length > 0;

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

  const handleAddRule = () => {
    if (newRule.trim().length > 0) {
      setOnboardingRules([...onboardingRules, newRule.trim()]);
      setNewRule("");
    }
  };
  const handleRemoveRule = (idx: number) => {
    setOnboardingRules(onboardingRules.filter((_, i) => i !== idx));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    if (
      groupName.length < 3 ||
      groupDescription.length < 7 ||
      !category ||
      !grade ||
      !onboardingText ||
      !selectedImage ||
      !privacy ||
      onboardingRules.length === 0
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
      privacy === "Private" ? true : false,
      onboardingRules
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
      <View className="mt-5">
        <Text className="text-2xl font-bold font-poppins">Create a Group</Text>
      </View>
      {/* Avatar Picker */}
      <Pressable
        style={{
          alignItems: "center",
          marginTop: 20,
          marginBottom: 20,
          justifyContent: "center",
          width: 150,
          height: 150,
          borderRadius: 100,
          }}
          onPress={() => setModalVisible(true)}
      >
        {selectedImage ? (
          <Image
            source={groupImages[selectedImage as keyof GroupImagesProp]}
            style={{
              width: 150,
              height: 150,
              borderRadius: 100,
            }}
            resizeMode="cover"
          />
        ) : (
          <View
            style={{
              borderRadius: 100,
              width: 150,
              height: 150,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#F6F8FE",
            }}
          >
            <View className="bg-[#4169E1] rounded-full p-4 w-full h-full justify-center items-center">
              <Ionicons name="image-outline" size={50} color="#fff" />
            </View>
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
          data={levelInfo}
          placeholder="Level"
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
      {/* Onboarding Rules Input */}
      <View style={{ width: "100%", marginTop: 18 }}>
        <Text
          style={{
            fontFamily: "Poppins-SemiBold",
            fontSize: 16,
            marginBottom: 6,
            color: "#4169E1",
          }}
        >
          Group Rules
        </Text>
        {onboardingRules.map((rule, idx) => (
          <View
            key={idx}
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 4,
            }}
          >
            <Text style={{ flex: 1, color: "#374151", fontSize: 15 }}>
              {idx + 1}. {rule}
            </Text>
            <Pressable
              onPress={() => handleRemoveRule(idx)}
              style={{ marginLeft: 8 }}
            >
              <Text style={{ color: "#ef4444", fontSize: 15 }}>Remove</Text>
            </Pressable>
          </View>
        ))}
        <View
          style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}
        >
          <TextBox
            placeholder="Add a rule..."
            value={newRule}
            onChangeText={setNewRule}
            style={{ flex: 1, marginRight: 8 }}
          />
          <Button
            title="Add"
            onPress={handleAddRule}
            disabled={newRule.trim().length === 0}
            style={{ paddingHorizontal: 12, height: 40 }}
            textStyle={{ fontSize: 15 }}
          />
        </View>
        {submitted && onboardingRules.length === 0 && (
          <Text
            style={{
              color: "#ef4444",
              fontSize: 13,
              marginTop: 4,
              marginLeft: 2,
              fontFamily: "Poppins-SemiBold",
            }}
          >
            At least one rule is required
          </Text>
        )}
      </View>
      {/* Create Group Button */}
      <Button
        onPress={handleSubmit}
        title="Create Group"
        fullWidth
        disabled={!formValid || groupCreating}
        loading={groupCreating}
        style={{ marginTop: 30 }}
      />

      {/* Go Back Button */}
      <Button
        onPress={() => router.back()}
        title="Cancel"
        fullWidth
        style={{ marginTop: 10, backgroundColor: "red" }}
        textStyle={{ fontWeight: "bold", color: "#fff" }}
      />
    </KeyboardAwareScrollView>
  );
};

export default GroupCreate;
