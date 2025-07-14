import Button from "@/components/Button";
import EnhancedCheckBox from "@/components/CheckBox";
import { PrivacyStrings, Strings } from "@/constants";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";

const PrivacyScreen = () => {
  const router = useRouter();
  const styleParagraph = "font-inter pt-5";
  const styleHeading = "pt-5 font-bold text-xl font-inter";
  const [isPressed, setIsPressed] = useState(false);
  return (
    <View className="flex-1 bg-white">
      <Text className="text-primary font-poppins-semiBold text-2xl pt-4 mx-5">
        {PrivacyStrings.mainHeading}
      </Text>
      <ScrollView className="flex-1 mx-5 pt-1">
        <Text className="font-inter font-bold text-xl">
          {PrivacyStrings.effectiveDate}
        </Text>
        <Text className="pt-2">{PrivacyStrings.summary}</Text>

        {/* info collected*/}
        <Text className={styleHeading}>
          {PrivacyStrings.infoWeCollectHeading}
        </Text>
        <Text className={styleParagraph}>
          {PrivacyStrings.infoWeCollectText1}
        </Text>

        {PrivacyStrings.infoWeCollectList.map((item, index) => (
          <Text key={index}> • {item}</Text>
        ))}
        <Text className="pt-2">{PrivacyStrings.infoWeCollectText2}</Text>

        {/* Personal Data Storage */}
        <Text className={styleHeading}>
          {PrivacyStrings.personalDataStorageHeading}
        </Text>
        <Text className={styleParagraph}>
          {PrivacyStrings.personalDataStorageText}
        </Text>

        {/* 3rd Party Services */}
        <Text className={styleHeading}>{PrivacyStrings.thirdPartyHeading}</Text>
        <Text className={styleParagraph}>
          {PrivacyStrings.thirdPartyServicesText}
        </Text>

        {/* User responsibility */}
        <Text className={styleHeading}>
          {PrivacyStrings.userResponsibilityHeading}
        </Text>
        <Text className={styleParagraph}>
          {PrivacyStrings.userResponsibilityText}
        </Text>

        {/* Report Abuse */}
        <Text className={styleHeading}>
          {PrivacyStrings.abuseReportingHeading}
        </Text>
        <Text className={styleParagraph}>
          {PrivacyStrings.abuseReportingText}
        </Text>

        {/* Policy changes */}

        <Text className={styleHeading}>
          {PrivacyStrings.policyChangesHeading}
        </Text>
        <Text className={styleParagraph}>
          {PrivacyStrings.policyChangesText}
        </Text>
      </ScrollView>
      <View
        style={{
          paddingHorizontal: 24,
          paddingVertical: 20,
          backgroundColor: "#F6F8FE",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        <EnhancedCheckBox
          isPressed={isPressed}
          onPress={() => setIsPressed(!isPressed)}
          page="privacy"
        />
        <View style={{ height: 16 }} />
        <Button
          onPress={() => {
            if (isPressed) router.replace("/(auth)/signInScreen");
          }}
          title={Strings.continueButton}
          disabled={!isPressed}
          fullWidth
        />
      </View>
    </View>
  );
};

export default PrivacyScreen;
