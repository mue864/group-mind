import Button from "@/components/Button";
import { db } from "@/services/firebase";
import { useGroupContext } from "@/store/GroupContext";
import { router, useLocalSearchParams } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import Group from "@/assets/icons/grp.svg";

const GroupOnboarding = () => {
  const { user, setGroupOnboardingCompleted, checkGroupOnboardingCompleted, refreshGroups } =
    useGroupContext();
  const { groupId, groupName } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [onboardingText, setOnboardingText] = useState("");
  const [onboardingRules, setOnboardingRules] = useState<string[]>([]);
  const [buttonLoading, setButtonLoading] = useState(false);


  useEffect(() => {
    const fetchData = async () => {
      if (!user || !groupId) return;
      // Check onboarding completion
      const completed = await checkGroupOnboardingCompleted(
        user.uid,
        groupId as string
      );
      if (completed) {
        router.replace(`/app/(groups)/${groupId}`);
        return;
      }
      // Fetch onboarding content
      const groupRef = doc(db, "groups", groupId as string);
      const groupSnap = await getDoc(groupRef);
      if (groupSnap.exists()) {
        const data = groupSnap.data();
        setOnboardingText(data.onboardingText || "");
        setOnboardingRules(data.onboardingRules || []);
      }
      setLoading(false);
    };
    fetchData();
  }, [user, groupId]);

  const handleContinue = async () => {
    if (!user || !groupId) return;
    setButtonLoading(true);
    await setGroupOnboardingCompleted(user.uid, groupId as string);
    setButtonLoading(false);
    refreshGroups();
    router.replace({
        pathname: '/(groups)/[groupId]',
        params: {
            groupId: groupId.toString(),
            groupName: groupName,
        }
    });
  };

  if (loading) return <ActivityIndicator />;

  return (
    <View className="flex-1 bg-white p-6 justify-center">
      <View className="items-center mb-6">
        <Group width={70} height={70} />
      </View>
      <Text className="text-2xl font-bold mb-4 text-center">
        Welcome to {groupName}!
      </Text>
      <Text className="text-base text-gray-700 mb-6 text-center">
        {onboardingText}
      </Text>
      {onboardingRules.length > 0 && (
        <View className="mb-6">
          <Text className="font-semibold mb-2">Group Rules:</Text>
          {onboardingRules.map((rule, idx) => (
            <Text key={idx} className="text-gray-700 mb-1">
              - {rule}
            </Text>
          ))}
        </View>
      )}
      <Button
        title="Continue"
        onPress={handleContinue}
        loading={buttonLoading}
      />
    </View>
  );
};

export default GroupOnboarding;
