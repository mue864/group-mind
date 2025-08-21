import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { doc, getDoc, deleteDoc, updateDoc, arrayRemove } from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

import groupImages from "@/assets/images/group_images";
import GroupImageModal from "@/components/GroupImageModal";
import ProfileImage from "@/components/ProfileImage";
import { db } from "@/services/firebase";
import { useGroupContext } from "@/store/GroupContext";

const ROLE_CONFIG = {
  groupOwner: {
    label: "Admin",
    color: "#059669",
    bgColor: "#ECFDF5",
    icon: "shield-checkmark" as const,
    priority: 1,
  },
  admins: {
    label: "Admins",
    color: "#2563EB",
    bgColor: "#EFF6FF",
    icon: "people" as const,
    priority: 2,
  },
  moderators: {
    label: "Moderators",
    color: "#7C3AED",
    bgColor: "#F3F4F6",
    icon: "hammer" as const,
    priority: 3,
  },
  members: {
    label: "Members",
    color: "#6B7280",
    bgColor: "#F9FAFB",
    icon: "person" as const,
    priority: 4,
  },
  blockedUsers: {
    label: "Blocked",
    color: "#DC2626",
    bgColor: "#FEF2F2",
    icon: "ban" as const,
    priority: 5,
  },
  joinRequests: {
    label: "Join Requests",
    color: "#D97706",
    bgColor: "#FFFBEB",
    icon: "time" as const,
    priority: 6,
  },
};

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

interface GroupData {
  id?: string;
  name?: string;
  description?: string;
  imageUrl?: string;
  groupOwner: string;
  admins: string[];
  moderators: string[];
  members: string[];
  blockedUsers: string[];
  joinRequests: string[];
}

interface MenuOption {
  label: string;
  icon: string;
  action: () => void;
  destructive?: boolean;
}

const GroupSettings = () => {
  const { groupId } = useLocalSearchParams();
  const [groupData, setGroupData] = useState<GroupData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuOptions, setMenuOptions] = useState<MenuOption[]>([]);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExiting, setIsExiting] = useState(false);


  const handleCloseMenu = () => {
    setMenuVisible(false);
    setSelectedUser(null);
    setMenuOptions([]);
  };
  useEffect(() => {
    // Open the modal only when a user has been selected and there are options to show.
    if (selectedUser && menuOptions.length > 0) {
      setMenuVisible(true);
    }
  }, [selectedUser, menuOptions]); // This effect runs when these states change

  const scrollY = useSharedValue(0);

  const {
    user,
    userInformation,
    promoteToAdmin,
    promoteToModerator,
    demoteModerator,
    removeMember,
    blockMember,
    unblockMember,
    approveJoinRequest,
    rejectJoinRequest,
    transferOwnership,
    refreshGroups,
    deleteOnboardingCompleted
  } = useGroupContext();

  const [userProfiles, setUserProfiles] = useState<
    Record<string, { userName: string; profileImage: string }>
  >({});

  // Fetch group data
  useEffect(() => {
    if (!groupId) return;

    const fetchGroup = async () => {
      try {
        const groupRef = doc(db, "groups", groupId.toString());
        const groupSnapshot = await getDoc(groupRef);

        if (groupSnapshot.exists()) {
          setGroupData({
            ...groupSnapshot.data(),
            id: groupSnapshot.id,
          } as GroupData);
        } else {
          setLoadingError("Group not found");
        }
      } catch (error) {
        console.error("Error fetching group:", error);
        setLoadingError("Failed to load group");
      }
    };

    fetchGroup();
  }, [groupId]);

  const handleDeleteGroup = async () => {
    if (!groupId) return;
    setIsDeleting(true);
    try {
      const groupRef = doc(db, "groups", groupId.toString());
      const groupSnap = await getDoc(groupRef);

      if (groupSnap.exists()) {
        // get userlist
        const data = groupSnap.data();
        const userList = data.members?.concat(data.admins).concat(data.moderators);
        // delete all users
        userList.map((userId: string) => {
          arrayRemove(userId)
        })
      }
      refreshGroups();

      await deleteDoc(groupRef);
      router.replace("/(dashboard)/groups");
    } catch (error) {
      console.error("Error deleting group:", error);
    } finally {
      setIsDeleting(false);
    }
  }

    const handleExitGroup = async (userId: string) => {
      if (!groupId) return;
      setIsExiting(true);
      try {
        const groupRef = doc(db, "groups", groupId.toString());
        const groupSnap = await getDoc(groupRef);
        if (groupSnap.exists()) {
          const data = groupSnap.data();
          if (data.members?.includes(userId)) {
            const newMembers = data.members.filter(
              (id: string) => id !== userId
            );
            await updateDoc(groupRef, { members: newMembers });
          }
          if (data.admins?.includes(userId)) {
            const newAdmins = data.admins.filter((id: string) => id !== userId);
            await updateDoc(groupRef, { admins: newAdmins });
          }
          if (data.moderators?.includes(userId)) {
            const newModerators = data.moderators.filter(
              (id: string) => id !== userId
            );
            await updateDoc(groupRef, { moderators: newModerators });
          }

          deleteOnboardingCompleted(user?.uid as string, groupId as string);

          refreshGroups();
          router.replace("/(dashboard)/groups");
        }
      } catch (error) {
        console.error("Error exiting group:", error);
        }
        finally {
          setIsExiting(false);
        }
    };

  // Memoized computations
  const currentUserId = user?.uid;

  const currentRole = useMemo(() => {
    if (!groupData || !currentUserId) return null;

    if (groupData.groupOwner === currentUserId) return "groupOwner";
    if (groupData.admins?.includes(currentUserId)) return "admins";
    if (groupData.moderators?.includes(currentUserId)) return "moderators";
    if (groupData.members?.includes(currentUserId)) return "members";
    if (groupData.blockedUsers?.includes(currentUserId)) return "blockedUsers";
    if (groupData.joinRequests?.includes(currentUserId)) return "joinRequests";

    return null;
  }, [groupData, currentUserId]);

  const getUsersByRole = useMemo(() => {
    if (!groupData) return {} as Record<string, string[]>;

    const result: Record<string, string[]> = {};
    const allUsers = new Set<string>();

    // Initialize all roles with empty arrays
    Object.keys(ROLE_CONFIG).forEach((role) => {
      result[role] = [];
    });

    // Add group owner first (highest priority)
    if (groupData.groupOwner) {
      result.groupOwner = [groupData.groupOwner];
      allUsers.add(groupData.groupOwner);
    }

    // Add admins (excluding group owner)
    if (groupData.admins) {
      result.admins = groupData.admins.filter(
        (userId) => !allUsers.has(userId)
      );
      groupData.admins.forEach((userId) => allUsers.add(userId));
    }

    // Add moderators (excluding group owner and admins)
    if (groupData.moderators) {
      result.moderators = groupData.moderators.filter(
        (userId) => !allUsers.has(userId)
      );
      groupData.moderators.forEach((userId) => allUsers.add(userId));
    }

    // Add members (excluding group owner, admins, and moderators)
    if (groupData.members) {
      result.members = groupData.members.filter(
        (userId) => !allUsers.has(userId)
      );
      groupData.members.forEach((userId) => allUsers.add(userId));
    }

    // Add blocked users (excluding all above)
    if (groupData.blockedUsers) {
      result.blockedUsers = groupData.blockedUsers.filter(
        (userId) => !allUsers.has(userId)
      );
      groupData.blockedUsers.forEach((userId) => allUsers.add(userId));
    }

    // Add join requests (excluding all above)
    if (groupData.joinRequests) {
      result.joinRequests = groupData.joinRequests.filter(
        (userId) => !allUsers.has(userId)
      );
      groupData.joinRequests.forEach((userId) => allUsers.add(userId));
    }

    return result;
  }, [groupData]);

  const totalMembers = useMemo(() => {
    return Object.values(getUsersByRole).flat().length;
  }, [getUsersByRole]);

  // Add a hook to fetch user profiles for all user IDs in the group
  useEffect(() => {
    // Gather all unique user IDs from all roles
    if (!groupData) return;
    const allUserIds = [
      groupData.groupOwner,
      ...(groupData.admins || []),
      ...(groupData.moderators || []),
      ...(groupData.members || []),
      ...(groupData.blockedUsers || []),
      ...(groupData.joinRequests || []),
    ];
    const uniqueUserIds = Array.from(new Set(allUserIds));

    const fetchProfiles = async () => {
      const newProfiles: Record<
        string,
        { userName: string; profileImage: string }
      > = {};
      for (const userId of uniqueUserIds) {
        if (!userId) continue;
        try {
          const userRef = doc(db, "users", userId);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const data = userSnap.data();
            newProfiles[userId] = {
              userName: data.userName || userId,
              profileImage: data.profileImage || "avatar1",
            };
          } else {
            newProfiles[userId] = {
              userName: userId,
              profileImage: "avatar1",
            };
          }
        } catch (e) {
          newProfiles[userId] = {
            userName: userId,
            profileImage: "avatar1",
          };
        }
      }
      setUserProfiles(newProfiles);
    };
    fetchProfiles();
  }, [groupData]);

  // Helper functions
  const getDisplayName = (userId: string) => {
    if (!userProfiles[userId]) return "loading...";
    const name = userProfiles[userId].userName;
    if (userInformation?.userID === userId) {
      return `${name} (You)`;
    }
    return name;
  };

  const getUserRole = (userId: string) => {
    if (!groupData) return null;

    if (groupData.groupOwner === userId) return "groupOwner";
    if (groupData.admins?.includes(userId)) return "admins";
    if (groupData.moderators?.includes(userId)) return "moderators";
    if (groupData.members?.includes(userId)) return "members";
    if (groupData.blockedUsers?.includes(userId)) return "blockedUsers";
    if (groupData.joinRequests?.includes(userId)) return "joinRequests";

    return null;
  };



  const buildMenuOptions = (
    targetId: string,
    targetRole: string | null
  ): MenuOption[] => {
    const isSelf = targetId === currentUserId;
    if (isSelf) return [];

    const options: MenuOption[] = [];

    if (currentRole === "groupOwner") {
      if (targetRole === "admins") {
        options.push({
          label: "Transfer Ownership",
          icon: "swap-horizontal",
          action: () =>
            transferOwnership(
              groupData?.id || "",
              groupData?.groupOwner || "",
              targetId
            ),
          destructive: true,
        });
      }

      if (targetRole !== "groupOwner" && targetRole !== "admins") {
        options.push({
          label: "Make Admin",
          icon: "shield-checkmark",
          action: () => promoteToAdmin(groupData?.id || "", targetId),
        });
      }

      if (targetRole !== "moderators" && targetRole !== "groupOwner") {
        options.push({
          label: "Promote to Moderator",
          icon: "hammer",
          action: () => promoteToModerator(groupData?.id || "", targetId),
        });
      }

      if (targetRole === "moderators") {
        options.push({
          label: "Revoke Mod Rights",
          icon: "remove-circle",
          action: () => demoteModerator(groupData?.id || "", targetId),
          destructive: true,
        });
      }

      if (targetRole !== "groupOwner") {
        options.push({
          label: "Remove Member",
          icon: "person-remove",
          action: () => removeMember(groupData?.id || "", targetId),
          destructive: true,
        });

        options.push({
          label: "Block Member",
          icon: "ban",
          action: () => blockMember(groupData?.id || "", targetId),
          destructive: true,
        });
      }

      if (targetRole === "blockedUsers") {
        options.push({
          label: "Unblock",
          icon: "checkmark-circle",
          action: () => unblockMember(groupData?.id || "", targetId),
        });
      }

      if (targetRole === "joinRequests") {
        options.push({
          label: "Approve Request",
          icon: "checkmark-circle",
          action: () => approveJoinRequest(groupData?.id || "", targetId),
        });

        options.push({
          label: "Reject Request",
          icon: "close-circle",
          action: () => rejectJoinRequest(groupData?.id || "", targetId),
          destructive: true,
        });
      }
    } else if (currentRole === "admins") {
      // Admin permissions (similar structure but limited)
      if (targetRole !== "groupOwner" && targetRole !== "admins") {
        options.push({
          label: "Promote to Moderator",
          icon: "hammer",
          action: () => promoteToModerator(groupData?.id || "", targetId),
        });
      }

      if (targetRole === "moderators") {
        options.push({
          label: "Revoke Mod Rights",
          icon: "remove-circle",
          action: () => demoteModerator(groupData?.id || "", targetId),
          destructive: true,
        });
      }

      if (targetRole !== "groupOwner" && targetRole !== "admins") {
        options.push({
          label: "Remove Member",
          icon: "person-remove",
          action: () => removeMember(groupData?.id || "", targetId),
          destructive: true,
        });

        options.push({
          label: "Block Member",
          icon: "ban",
          action: () => blockMember(groupData?.id || "", targetId),
          destructive: true,
        });
      }

      if (targetRole === "blockedUsers") {
        options.push({
          label: "Unblock",
          icon: "checkmark-circle",
          action: () => unblockMember(groupData?.id || "", targetId),
        });
      }

      if (targetRole === "joinRequests") {
        options.push({
          label: "Approve Request",
          icon: "checkmark-circle",
          action: () => approveJoinRequest(groupData?.id || "", targetId),
        });

        options.push({
          label: "Reject Request",
          icon: "close-circle",
          action: () => rejectJoinRequest(groupData?.id || "", targetId),
          destructive: true,
        });
      }
    } else if (currentRole === "moderators") {
      // Moderator permissions (limited)
      if (targetRole === "members") {
        options.push({
          label: "Remove Member",
          icon: "person-remove",
          action: () => removeMember(groupData?.id || "", targetId),
          destructive: true,
        });

        options.push({
          label: "Block Member",
          icon: "ban",
          action: () => blockMember(groupData?.id || "", targetId),
          destructive: true,
        });
      }

      if (targetRole === "joinRequests") {
        options.push({
          label: "Approve Request",
          icon: "checkmark-circle",
          action: () => approveJoinRequest(groupData?.id || "", targetId),
        });

        options.push({
          label: "Reject Request",
          icon: "close-circle",
          action: () => rejectJoinRequest(groupData?.id || "", targetId),
          destructive: true,
        });
      }
    }

    return options;
  };

  const handleMenuAction = (action: () => void) => {
    action();
    handleCloseMenu();
  };

  // Animated styles
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(scrollY.value, [0, 100], [1, 0.8]),
      transform: [
        {
          translateY: interpolate(scrollY.value, [0, 100], [0, -20]),
        },
      ],
    };
  });

  // Render components
  const renderMemberCard = (userId: string, index: number) => {
    const role = getUserRole(userId);
    const isSelf = userId === currentUserId;
    const roleConfig = role ? ROLE_CONFIG[role] : null;
    const profile = userProfiles[userId];

    return (
      <AnimatedTouchableOpacity
        key={userId}
        entering={FadeInDown.delay(index * 100)}
        activeOpacity={0.7}
        className="mb-2"
        onPress={() => {
          if (!isSelf) {
            setSelectedUser(userId);
            setMenuOptions(buildMenuOptions(userId, role));
          }
        }}
      >
        <View className="bg-white rounded-xl border border-gray-200 p-3">
          <View className="flex-row items-center">
            {/* Profile avatar */}
            <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3 overflow-hidden">
              {profile ? (
                <ProfileImage imageLocation={profile.profileImage} size={40} />
              ) : (
                <Ionicons name="person" size={20} color="#6B7280" />
              )}
            </View>
            {/* User info */}
            <View className="flex-1">
              <Text className="font-poppins-medium text-gray-900 text-base">
                {getDisplayName(userId)}
              </Text>
              {roleConfig && (
                <View className="flex-row items-center mt-1">
                  <View
                    className="px-2 py-1 rounded-full mr-2"
                    style={{ backgroundColor: roleConfig.bgColor }}
                  >
                    <Text
                      className="font-poppins text-xs"
                      style={{ color: roleConfig.color }}
                    >
                      {roleConfig.label}
                    </Text>
                  </View>
                </View>
              )}
            </View>
            {/* Action button */}
            {!isSelf &&
              (currentRole === "admins" ||
                currentRole === "moderators" ||
                currentRole === "groupOwner") && (
                <Pressable
                  onPress={() => {
                    setSelectedUser(userId);
                    setMenuOptions(buildMenuOptions(userId, role));
                    setMenuVisible(true);
                  }}
                  style={{ padding: 8, marginLeft: 8 }}
                  accessibilityLabel="Open member actions menu"
                >
                  <Ionicons
                    name="ellipsis-horizontal-circle"
                    size={22}
                    color="#6B7280"
                  />
                </Pressable>
              )}
          </View>
        </View>
      </AnimatedTouchableOpacity>
    );
  };

  const renderRoleSection = (role: string, index: number) => {
    const users = getUsersByRole[role];
    const roleConfig = ROLE_CONFIG[role as keyof typeof ROLE_CONFIG];

    if (!users || users.length === 0) return null;

    return (
      <Animated.View
        key={role}
        entering={FadeInUp.delay(index * 200)}
        className="mb-4"
      >
        {/* Role header */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <View
              className="w-8 h-8 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: roleConfig.bgColor }}
            >
              <Ionicons
                name={roleConfig.icon as any}
                size={16}
                color={roleConfig.color}
              />
            </View>
            <Text className="font-poppins-semiBold text-lg text-gray-900">
              {roleConfig.label}
            </Text>
            <View
              className="ml-2 px-2 py-1 rounded-full"
              style={{ backgroundColor: roleConfig.bgColor }}
            >
              <Text
                className="font-poppins-medium text-xs"
                style={{ color: roleConfig.color }}
              >
                {users.length}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() =>
              setActiveSection(activeSection === role ? null : role)
            }
            className="p-2"
          >
            <Ionicons
              name={activeSection === role ? "chevron-up" : "chevron-down"}
              size={20}
              color="#6B7280"
            />
          </TouchableOpacity>
        </View>

        {/* Members list */}
        {(activeSection === role || activeSection === null) && (
          <View className="space-y-2">
            {users.map((userId, userIndex) =>
              renderMemberCard(userId, userIndex)
            )}
          </View>
        )}
      </Animated.View>
    );
  };

  if (!groupData) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <View className="bg-white rounded-2xl p-8 shadow-sm">
          {loadingError ? (
            <>
              <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
              <Text className="font-poppins-medium text-red-600 mt-4 text-center">
                {loadingError}
              </Text>
              <TouchableOpacity
                onPress={() => router.back()}
                className="mt-4 bg-blue-500 px-6 py-3 rounded-full"
              >
                <Text className="font-poppins-medium text-white">Go Back</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View className="items-center justify-center">
              <Ionicons name="hourglass-outline" size={48} color="#6B7280" />
              <Text className="font-poppins-medium text-gray-600 mt-4">
                Loading group...
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Clean Header */}
      <Animated.View
        style={headerAnimatedStyle}
        className="bg-white border-b border-gray-100"
      >
        <View className="flex-row items-center justify-between px-6 py-4 pt-12">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
          >
            <Ionicons name="arrow-back" size={20} color="#374151" />
          </TouchableOpacity>

          <Text className="font-poppins-bold text-gray-900 text-xl">
            Group Settings
          </Text>

          {currentRole === "groupOwner" && (
            <TouchableOpacity
              onPress={() => setShowModal(true)}
              className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
            >
              <Ionicons name="create-outline" size={20} color="#374151" />
            </TouchableOpacity>
          )}

          {currentRole !== "groupOwner" && <View className="w-10 h-10" />}
        </View>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={(event) => {
          scrollY.value = event.nativeEvent.contentOffset.y;
        }}
        scrollEventThrottle={16}
        className="flex-1"
      >
        {/* Group Info Card */}
        <Animated.View entering={FadeIn.delay(300)} className="px-6 pt-6">
          <View className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <View className="items-center">
              <View className="relative">
                <Image
                  source={
                    groupImages[
                      groupData.imageUrl as keyof typeof groupImages
                    ] || groupImages.groupImage1
                  }
                  style={{ width: 100, height: 100 }}
                  className="rounded-full"
                  resizeMode="cover"
                />
                <View className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full items-center justify-center border-2 border-white">
                  <Ionicons name="checkmark" size={12} color="white" />
                </View>
              </View>

              <Text className="font-poppins-bold text-2xl text-gray-900 mt-4">
                {groupData.name || "Group Name"}
              </Text>

              <View className="flex-row items-center mt-2 bg-gray-50 px-4 py-2 rounded-full">
                <Ionicons name="people" size={16} color="#6B7280" />
                <Text className="font-poppins-medium text-gray-600 ml-2">
                  {totalMembers} {totalMembers === 1 ? "member" : "members"}
                </Text>
              </View>

              {groupData.description && (
                <Text className="font-poppins text-gray-600 text-center mt-4 leading-6">
                  {groupData.description}
                </Text>
              )}
            </View>
          </View>
        </Animated.View>

        {/* Members Section */}
        <View className="px-6 mt-8">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="font-poppins-bold text-xl text-gray-900">
              Members
            </Text>
            <View className="bg-blue-50 px-3 py-1 rounded-full">
              <Text className="font-poppins-medium text-blue-600 text-sm">
                {totalMembers} total
              </Text>
            </View>
          </View>

          {Object.keys(ROLE_CONFIG)
            .sort(
              (a, b) =>
                ROLE_CONFIG[a as keyof typeof ROLE_CONFIG].priority -
                ROLE_CONFIG[b as keyof typeof ROLE_CONFIG].priority
            )
            .map((role, index) => renderRoleSection(role, index))}
        </View>

        {/* Destructive action */}
        <View className="px-6 mt-6 flex-col gap-4">
          <View className="mb-2 flex-row items-center gap-2">
            <Ionicons name="close-circle-outline" size={24} color="#FF6347" />
            <Text className="font-poppins font-bold text-xl text-gray-900">
              Destructive Actions
            </Text>
          </View>

          <TouchableOpacity className="flex-row items-center justify-center bg-primary gap-2 p-4 rounded-md shadow-sm shadow-black"
          onPress={() => {
            Alert.alert("Exit Group", "Are you sure to exit this group", [
              {
                text: "Cancel",
                onPress: () => {},
                style: "cancel",
              },
              {
                text: "Exit",
                onPress: () => {
                  handleExitGroup(user?.uid as string);
                },
                style: "destructive",
              },
            ])
          }}
          >
            <Ionicons name="log-out-outline" size={24} color="#FF6347" />
            <Text className="font-poppins font-bold text-xl text-white">
             {isExiting ? "Exiting..." : "Exit Group"}
            </Text>
          </TouchableOpacity>

          {currentRole === "groupOwner" && (
            <TouchableOpacity className="flex-row items-center justify-center bg-red-500 gap-2 p-4 rounded-md shadow-sm shadow-black"
            onPress={() => {
              Alert.alert("Delete Group", "Are you sure to delete this group", [
                {
                  text: "Cancel",
                  onPress: () => {},
                  style: "cancel",
                },
                {
                  text: "Delete",
                  onPress: () => {
                    handleDeleteGroup();
                  },
                  style: "destructive",
                },
              ])
            }}
          >
            <Ionicons name="trash-outline" size={24} color="#FFF" />
            <Text className="font-poppins font-bold text-xl text-white">
             {isDeleting ? "Deleting..." : "Delete Group"}
            </Text>
          </TouchableOpacity>
          )}
          
        </View>

        {/* Bottom padding */}
        <View className="h-20" />
      </ScrollView>

      {/* Edit Group Modal */}
      <GroupImageModal
        show={showModal}
        onDismiss={() => setShowModal(false)}
        onImageSelect={() => setShowModal(false)}
      />

      {/* Member Actions Menu */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCloseMenu}
        presentationStyle="overFullScreen"
        statusBarTranslucent={true}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={() => setMenuVisible(false)}
          >
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                padding: 20,
              }}
            >
              <TouchableOpacity
                activeOpacity={1}
                onPress={(e) => e.stopPropagation()}
                style={{
                  backgroundColor: "white",
                  borderRadius: 24,
                  minWidth: 300,
                  maxWidth: "90%",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.12,
                  shadowRadius: 16,
                  elevation: 12,
                }}
              >
                <View className="p-6">
                  {/* User Info Header */}
                  <View className="flex-row items-center mb-4">
                    <View className="w-12 h-12 bg-gray-100 rounded-full items-center justify-center mr-3 overflow-hidden">
                      {selectedUser && userProfiles[selectedUser] ? (
                        <ProfileImage
                          imageLocation={
                            userProfiles[selectedUser].profileImage
                          }
                        />
                      ) : (
                        <Ionicons
                          name="person-circle"
                          size={32}
                          color="#6B7280"
                        />
                      )}
                    </View>
                    <View className="flex-1">
                      <Text className="font-poppins-semiBold text-lg text-gray-900">
                        {selectedUser && getDisplayName(selectedUser)}
                      </Text>
                      <Text className="font-poppins text-sm text-gray-500">
                        {selectedUser && getUserRole(selectedUser)
                          ? ROLE_CONFIG[
                              getUserRole(
                                selectedUser
                              ) as keyof typeof ROLE_CONFIG
                            ]?.label
                          : "Member"}
                      </Text>
                    </View>
                  </View>

                  {/* Menu Options */}
                  {menuOptions.length > 0 ? (
                    menuOptions.map((option, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => handleMenuAction(option.action)}
                        className="flex-row items-center py-4"
                        style={{
                          borderBottomWidth:
                            index < menuOptions.length - 1 ? 1 : 0,
                          borderBottomColor: "#F3F4F6",
                        }}
                      >
                        <View
                          className="w-10 h-10 rounded-full items-center justify-center mr-3"
                          style={{
                            backgroundColor: option.destructive
                              ? "#FEF2F2"
                              : "#F3F4F6",
                          }}
                        >
                          <Ionicons
                            name={option.icon as any}
                            size={18}
                            color={option.destructive ? "#EF4444" : "#6B7280"}
                          />
                        </View>
                        <Text
                          className="font-poppins-medium text-base"
                          style={{
                            color: option.destructive ? "#EF4444" : "#374151",
                          }}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <View className="py-4 items-center">
                      <Text className="font-poppins text-gray-500">
                        No actions available
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default GroupSettings;
