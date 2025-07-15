import ProfileImage from "@/components/ProfileImage";
import { useGroupContext } from "@/store/GroupContext";
import { useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";

const ProfileIcon = () => {
  const router = useRouter();
  const { userInformation } = useGroupContext();

  const handleProfilePress = () => {
    router.push("/(dashboard)/profile");
  };

  return (
    <TouchableOpacity
      onPress={handleProfilePress}
      className="mx-3"
      style={{
        borderRadius: 20,
        overflow: "hidden",
        borderWidth: 2,
        borderColor: "#4169E1",
      }}
    >
      <ProfileImage
        imageLocation={
          userInformation?.profilePicture?.replace(".webp", "") || "avatar1"
        }
        size={40}
      />
    </TouchableOpacity>
  );
};

export default ProfileIcon;
