import ProfileImage from "@/components/ProfileImage";
import { db } from "@/services/firebase";
import { useGroupContext } from "@/store/GroupContext";
import { useRouter } from "expo-router";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { TouchableOpacity } from "react-native";

const ProfileIcon = () => {
  const router = useRouter();
  const { user, userInformation } = useGroupContext();
  const [currentProfileImage, setCurrentProfileImage] = useState(
    userInformation?.profilePicture?.replace(".webp", "") || "avatar1"
  );

  // Real-time listener for user profile updates
  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(
      userRef,
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          const profileImage =
            data.profileImage?.replace(".webp", "") || "avatar1";
          setCurrentProfileImage(profileImage);
        }
      },
      (error) => {
        console.error(
          "Error listening to user profile updates in ProfileIcon:",
          error
        );
      }
    );

    return () => unsubscribe();
  }, [user]);

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
      <ProfileImage imageLocation={currentProfileImage} size={40} />
    </TouchableOpacity>
  );
};

export default ProfileIcon;
