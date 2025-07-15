import ImageModal from "@/components/ImageModal";
import ProfileImage from "@/components/ProfileImage";
import TextBox from "@/components/TextBox";
import Colors from "@/constants/colors";
import { auth, db } from "@/services/firebase";
import { useGroupContext } from "@/store/GroupContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const Profile = () => {
  const router = useRouter();
  const { user, userInformation, groups } = useGroupContext();
  const [isEditing, setIsEditing] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localUserInfo, setLocalUserInfo] = useState(userInformation);

  // Edit form state
  const [editForm, setEditForm] = useState({
    userName: "",
    bio: "",
    purpose: "",
    level: "",
  });

  // Real-time listener for user profile updates
  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(
      userRef,
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          const updatedUserInfo = {
            userName: data.userName || "",
            profilePicture: data.profileImage || "avatar1",
            purpose: data.purpose || "",
            level: data.level || "",
            joinedGroups: data.joinedGroups || [],
            canExplainToPeople: data.canExplainToPeople || false,
            userID: user.uid,
            bio: data.bio || "",
          };
          setLocalUserInfo(updatedUserInfo);
        }
      },
      (error) => {
        console.error("Error listening to user profile updates:", error);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Initialize edit form when user info is available
  useEffect(() => {
    if (localUserInfo) {
      setEditForm({
        userName: localUserInfo.userName || "",
        bio: localUserInfo.bio || "",
        purpose: localUserInfo.purpose || "",
        level: localUserInfo.level || "",
      });
    }
  }, [localUserInfo]);

  // Calculate stats
  const stats = {
    groupsJoined: groups.length,
    postsCount: 0, // This would need to be calculated from actual posts data
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut(auth);
            router.replace("/(auth)/signInScreen");
          } catch (error) {
            console.error("Logout error:", error);
            Alert.alert("Error", "Failed to logout. Please try again.");
          }
        },
      },
    ]);
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        userName: editForm.userName,
        bio: editForm.bio,
        purpose: editForm.purpose,
        level: editForm.level,
      });

      setEditModalVisible(false);
      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      console.error("Update error:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (newAvatar: string | null) => {
    if (!user || !newAvatar) return;

    setLoading(true);
    const userRef = doc(db, "users", user.uid);
    updateDoc(userRef, {
      profileImage: newAvatar,
    })
      .then(() => {
        setAvatarModalVisible(false);
        Alert.alert("Success", "Avatar updated successfully!");
      })
      .catch((error) => {
        console.error("Avatar update error:", error);
        Alert.alert("Error", "Failed to update avatar. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  if (!user || !localUserInfo) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <Text className="text-gray-500">Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-gray-500/50 rounded-md mx-5 pt-12 pb-6 px-6">
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-white text-2xl font-poppins-semiBold">
            Profile
          </Text>
          <TouchableOpacity onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="red" />
          </TouchableOpacity>
        </View>

        {/* Profile Picture and Basic Info */}
        <View className="items-center">
          <TouchableOpacity
            onPress={() => setAvatarModalVisible(true)}
            className="relative"
          >
            <ProfileImage
              imageLocation={
                localUserInfo.profilePicture?.replace(".webp", "") || "avatar1"
              }
            />
            <View className="absolute bottom-0 right-0 bg-primary rounded-full p-2">
              <Ionicons name="camera" size={16} color="white" />
            </View>
          </TouchableOpacity>

          <Text className="text-white text-xl font-poppins-semiBold mt-4">
            {localUserInfo.userName}
          </Text>
          <Text className="text-white/80 text-sm mt-1 font-poppins">{user.email}</Text>

          {localUserInfo.bio && (
            <Text className="text-white/90 text-center mt-3 max-w-xs">
              {localUserInfo.bio}
            </Text>
          )}
        </View>
      </View>

      {/* Stats Section */}
      <View className="px-6 py-6">
        <Text className="text-gray-800 text-lg font-poppins-semiBold mb-4">
          Statistics
        </Text>
        <View className="flex-row gap-4">
          <View className="flex-1 bg-gray-100 rounded-xl p-4">
            <Text className="text-2xl font-poppins-semiBold text-primary">
              {stats.groupsJoined}
            </Text>
            <Text className="text-gray-600 font-poppins text-sm mt-1">Groups Joined</Text>
          </View>
          <View className="flex-1 bg-gray-100 rounded-xl p-4">
            <Text className="text-2xl font-poppins-semiBold text-primary">
              {stats.postsCount}
            </Text>
            <Text className="text-gray-600 font-poppins text-sm mt-1">Posts Made</Text>
          </View>
        </View>
      </View>

      {/* Profile Details */}
      <View className="px-6 py-4">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-gray-800 text-lg font-poppins-semiBold">
            Profile Details
          </Text>
          <TouchableOpacity
            onPress={() => setEditModalVisible(true)}
            className="flex-row items-center"
          >
            <Ionicons name="pencil" size={16} color={Colors.primary} />
            <Text className="text-primary font-poppins-semiBold ml-1">
              Edit
            </Text>
          </TouchableOpacity>
        </View>

        <View className="bg-gray-100 rounded-xl p-4 space-y-4">
          <View>
            <Text className="text-gray-500 text-sm font-poppins">Username</Text>
            <Text className="text-gray-800 font-poppins-semiBold">
              {localUserInfo.userName}
            </Text>
          </View>

          <View>
            <Text className="text-gray-500 text-sm font-poppins">Purpose</Text>
            <Text className="text-gray-800 font-poppins-semiBold">
              {localUserInfo.purpose || "Not specified"}
            </Text>
          </View>

          <View>
            <Text className="text-gray-500 text-sm font-poppins">Level</Text>
            <Text className="text-gray-800 font-poppins-semiBold">
              {localUserInfo.level || "Not specified"}
            </Text>
          </View>

          <View>
            <Text className="text-gray-500 text-sm font-poppins">Can Explain to Others</Text>
            <Text className="text-gray-800 font-poppins-semiBold">
              {localUserInfo.canExplainToPeople ? "Yes" : "No"}
            </Text>
          </View>
        </View>
      </View>

      {/* Groups Section */}
      <View className="px-6 py-4">
        <Text className="text-gray-800 text-lg font-poppins-semiBold mb-4">
          My Groups
        </Text>
        {groups.length > 0 ? (
          <View className="gap-3">
            {groups.map((group) => (
              <View key={group.id} className="bg-gray-100 rounded-xl p-4">
                <Text className="text-gray-800 font-poppins-semiBold">
                  {group.name}
                </Text>
                <Text className="text-gray-600 text-sm mt-1 font-poppins">
                  {group.description}
                </Text>
                <View className="flex-row items-center mt-2">
                  <Ionicons name="people" size={16} color={Colors.primary} />
                  <Text className="text-gray-600 text-sm ml-1">
                    {group.members?.length || 0} members
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className="bg-gray-50 rounded-xl p-6 items-center">
            <Ionicons name="people-outline" size={48} color={Colors.muted} />
            <Text className="text-gray-600 text-center mt-2">
              You haven&apos;t joined any groups yet
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(dashboard)/(tabs)/groups")}
              className="mt-3"
            >
              <Text className="text-primary font-poppins-semiBold">
                Browse Groups
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Bottom Spacing */}
      <View className="h-20" />

      {/* Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View className="flex-1 bg-white">
          {/* Modal Header */}
          <View className="flex-row items-center justify-between p-6 border-b border-gray-200">
            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
              <Text className="text-gray-600 font-poppins-semiBold">
                Cancel
              </Text>
            </TouchableOpacity>
            <Text className="text-lg font-poppins-semiBold">Edit Profile</Text>
            <TouchableOpacity onPress={handleSaveProfile} disabled={loading}>
              <Text
                className={`font-poppins-semiBold ${
                  loading ? "text-gray-400" : "text-primary"
                }`}
              >
                {loading ? "Saving..." : "Save"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Edit Form */}
          <ScrollView className="flex-1 p-6">
            <View className="space-y-6">
              <View>
                <Text className="text-gray-700 font-poppins-semiBold mb-2">
                  Username
                </Text>
                <TextBox
                  placeholder="Enter username"
                  value={editForm.userName}
                  onChangeText={(text) =>
                    setEditForm({ ...editForm, userName: text })
                  }
                />
              </View>

              <View>
                <Text className="text-gray-700 font-poppins-semiBold mb-2">
                  Bio
                </Text>
                <TextInput
                  placeholder="Tell us about yourself..."
                  value={editForm.bio}
                  onChangeText={(text) =>
                    setEditForm({ ...editForm, bio: text })
                  }
                  multiline
                  numberOfLines={4}
                  className="border border-gray-300 rounded-xl p-4 text-gray-800 font-poppins-regular"
                  textAlignVertical="top"
                />
              </View>

              <View>
                <Text className="text-gray-700 font-poppins-semiBold mb-2">
                  Purpose
                </Text>
                <TextBox
                  placeholder="What's your purpose?"
                  value={editForm.purpose}
                  onChangeText={(text) =>
                    setEditForm({ ...editForm, purpose: text })
                  }
                />
              </View>

              <View>
                <Text className="text-gray-700 font-poppins-semiBold mb-2">
                  Level
                </Text>
                <TextBox
                  placeholder="Your level"
                  value={editForm.level}
                  onChangeText={(text) =>
                    setEditForm({ ...editForm, level: text })
                  }
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Avatar Selection Modal */}
      <ImageModal
        modalVisible={avatarModalVisible}
        changeModalVisibility={() => setAvatarModalVisible(false)}
        selectedImage={handleAvatarChange}
      />
    </ScrollView>
  );
};

export default Profile;
