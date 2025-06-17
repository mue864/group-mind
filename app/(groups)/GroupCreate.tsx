import Camera from "@/assets/icons/camera.svg";
import groupImages from "@/assets/images/group_images";
import GroupImageModal from "@/components/GroupImageModal";
import { useGroupContext } from "@/store/GroupContext";
import { useEffect, useState } from "react";
import { Image, Pressable, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Button, TextInput, HelperText } from "react-native-paper";

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
  const { groupCreating, createGroup } = useGroupContext();

  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [groupDescription, setGroupDescription] = useState("");
  const [groupName, setGroupName] = useState("");
  const [category, setCategory] = useState("");
  const [grade, setGrade] = useState("");
  const [onboardingText, setOnboardingText] = useState("");
  const [hasGroupNameErrors, setHasGroupNameErrors] = useState(false);
  const [hasGroupDescriptionErrors, setHasGroupDescriptionErrors] = useState(false);
  const [groupNameTouched, setGroupNameTouched] = useState(false);
  const [groupDescriptionTouched, setGroupDescriptionTouched] = useState(false);

  useEffect(() => {
    if (groupNameTouched)
    {
      setHasGroupNameErrors(groupName.length < 3);
    }
  }, [groupName, groupNameTouched]);

  useEffect(() => {
    if(groupDescriptionTouched) {
      setHasGroupDescriptionErrors(groupDescription.length < 7);
    }
  }, [groupDescription, groupDescriptionTouched]);

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: "#F8F8F8" }} // or bg-background
      contentContainerStyle={{ alignItems: "center" }}
      enableOnAndroid={true}
      keyboardShouldPersistTaps="handled"
      extraScrollHeight={100} // This helps push focused inputs fully into view
    >
      <>
        <Pressable
          className="items-center mt-6 mb-4 justify-center mx-auto"
          onPress={() => setModalVisible(true)}
          style={{ width: 150, height: 150 }}
        >
          {selectedImage ? (
            <Image
              source={groupImages[selectedImage as keyof GroupImagesProp]}
              style={{ width: 200, height: 150, borderRadius: 100 }}
              resizeMode="contain"
            />
          ) : (
            <View
              className="rounded-md border border-muted bg-secondary/50 justify-center items-center"
              style={{ width: 150, height: 150 }}
            >
              <Camera width={50} height={50} />
            </View>
          )}
        </Pressable>

        <GroupImageModal
          show={isModalVisible}
          onDismiss={() => setModalVisible(false)}
          onImageSelect={setSelectedImage}
        />
      </>

      <TextInput
        label="Group Name"
        value={groupName}
        onChangeText={(text) => {
          setGroupNameTouched(true);
          setGroupName(text);
        }}
        style={{ width: "85%", margin: 10, height: 60 }}
        mode="outlined"
        error={hasGroupNameErrors}
      />

      <TextInput
        label="Group Description"
        value={groupDescription}
        onChangeText={(text) => {
          setGroupDescriptionTouched(true);
          setGroupDescription(text);
        }}
        mode="outlined"
        style={{ width: "85%", margin: 10, height: 60 }}
        error={hasGroupDescriptionErrors}
      />

      <View className="flex flex-row justify-between w-[85%]">
        <TextInput
          label="Category"
          value={category}
          onChangeText={setCategory}
          mode="outlined"
          style={{ width: "48%", marginVertical: 10, height: 60 }}
        />

        <TextInput
          label="Grade Level"
          value={grade}
          onChangeText={setGrade}
          mode="outlined"
          style={{ width: "48%", marginVertical: 10, height: 60 }}
        />
      </View>

      <TextInput
        label="Onboarding Text"
        value={onboardingText}
        onChangeText={setOnboardingText}
        mode="outlined"
        style={{ width: "85%", marginVertical: 10, height: 60 }}
      />

      <Button
        onPress={() => {
          console.log("Create Group");
        }}
        loading={groupCreating}
        mode="contained"
        icon="plus"
        disabled={true}
        style={{
          width: "85%",
          margin: 10,
          height: 60,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        Create Group
      </Button>
    </KeyboardAwareScrollView>
  );
};

export default GroupCreate;
