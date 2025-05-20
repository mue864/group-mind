import Elipse from "@/assets/icons/termsElipse.svg";
import Rect from "@/assets/icons/termsRect.svg";
import Button from "@/components/Button";
import CheckBox from "@/components/CheckBox";
import { PrivacyStrings, Strings } from "@/constants";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

const PrivacyScreen = () => {
  const router = useRouter();
  const styleParagraph = "font-inter pt-5";
  const styleHeading = "pt-5 font-bold text-xl font-inter";
  const [isPressed, setIsPressed] = useState(false);
  return (
    <View className="flex-1 relative">
      <Text className="text-primary font-poppins-semiBold text-2xl pt-4 mx-5">
        {PrivacyStrings.mainHeading}
      </Text>

      <ScrollView className="mx-5 pt-1 flex-[0.80]">
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

      <View className="absolute bottom-0 -z-10" pointerEvents="box-none">
        <Elipse width={360} height={250} />
      </View>
      <View className="absolute left-16 top-12 -z-10" pointerEvents="box-none">
        <Rect width={250} height={250} />
      </View>

      <Pressable
        className="absolute bottom-28 left-1/2 -translate-x-1/2"
        onPress={() => setIsPressed(!isPressed)}
      >
        <CheckBox isPressed={isPressed} page="privacy" />
      </Pressable>

      <View className="absolute right-8 left-8 bottom-5">
        <Button
          onPress={() => {
            isPressed && router.replace("/Auth/signInScreen");
          }}
          buttonText={Strings.continueButton}
        />
      </View>
    </View>
  );
};

export default PrivacyScreen;
