import Camera from "@/assets/icons/camera.svg";
import groupImages from "@/assets/images/group_images";
import GroupImageModal from "@/components/GroupImageModal";
import { useGroupContext } from "@/store/GroupContext";
import { useEffect, useState } from "react";
import { Image, Pressable, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Button, TextInput, Menu } from "react-native-paper";
import { useRouter } from "expo-router";

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
  const { groupCreating, createGroup, groupCreated } = useGroupContext();

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

  const categoryOptions = ["Math", "Science", "History", "English"];
  const gradeOptions = ["Grade 8", "Grade 9", "Grade 10", "Grade 11"];
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);
  const [gradeMenuVisible, setGradeMenuVisible] = useState(false);

  const router = useRouter();


  const formValid =
    groupName.length >= 3 &&
    groupDescription.length >= 7 &&
    category &&
    grade &&
    onboardingText &&
    selectedImage

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
              style={{ width: 150, height: 150, borderRadius: 75 }}
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

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          width: "85%",
        }}
      >
        <View style={{ width: "48%" }}>
          <Menu
            visible={categoryMenuVisible}
            onDismiss={() => setCategoryMenuVisible(false)}
            anchor={
              <Pressable onPress={() => setCategoryMenuVisible(true)}>
                <TextInput
                  label="Category"
                  value={category}
                  mode="outlined"
                  editable={false}
                  right={<TextInput.Icon icon="menu-down" />}
                  pointerEvents="none" // prevents native tap handling so Pressable works
                />
              </Pressable>
            }
          >
            {categoryOptions.map((option, index) => (
              <Menu.Item
                key={index}
                onPress={() => {
                  setCategory(option);
                  setCategoryMenuVisible(false);
                }}
                title={option}
              />
            ))}
          </Menu>
        </View>

        <View style={{ width: "48%" }}>
          <Menu
            visible={gradeMenuVisible}
            onDismiss={() => setGradeMenuVisible(false)}
            anchor={
              <Pressable onPress={() => setGradeMenuVisible(true)}>
                <TextInput
                  label="Grade Level"
                  value={grade}
                  mode="outlined"
                  editable={false}
                  right={<TextInput.Icon icon="menu-down" />}
                  pointerEvents="none"
                />
              </Pressable>
            }
          >
            {gradeOptions.map((option, index) => (
              <Menu.Item
                key={index}
                onPress={() => {
                  setGrade(option);
                  setGradeMenuVisible(false);
                }}
                title={option}
              />
            ))}
          </Menu>
        </View>
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
          createGroup(
            groupName,
            groupDescription,
            selectedImage,
            category,
            grade,
            onboardingText
          );
        }}
        loading={groupCreating}
        mode="contained"
        icon="plus"
        disabled={!formValid || groupCreating}
        style={{
          width: "85%",
          margin: 10,
          height: 60,
          
        }}
        contentStyle={{ height: 60, justifyContent: "center", alignItems: 'center' }}
      >
        Create Group
      </Button>
    </KeyboardAwareScrollView>
  );
};

export default GroupCreate;
