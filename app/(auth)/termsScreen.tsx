import Button from "@/components/Button";
import EnhancedCheckBox from "@/components/CheckBox";
import { Strings, TosStrings } from "@/constants";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Dimensions, ScrollView, Text, View } from "react-native";

const TermsScreen = () => {
  const screenHeight = Dimensions.get("window").height;
  const scrollViewHeight = screenHeight * 0.1;
  const router = useRouter();
  const styleParagraph = "font-inter pt-5";
  const styleHeading = "pt-5 font-bold text-xl font-inter";
  const [isPressed, setIsPressed] = useState(false);
  return (
    <View className="flex-1 bg-white">
      <Text className="text-primary font-poppins-semiBold text-2xl pt-8 mx-5">
        {TosStrings.termsOfServiceHeading}
      </Text>
      <ScrollView className="flex-1 mx-5 pt-1">
        <Text className="font-inter font-bold text-xl">
          {TosStrings.effectiveDate}
        </Text>
        <Text className="pt-2">{TosStrings.termsIntro}</Text>

        {/* Description of Service */}
        <Text className={styleHeading}>{TosStrings.dosHeading}</Text>
        <Text className={styleParagraph}>{TosStrings.dosParagraph}</Text>

        {TosStrings.dosList.map((item, index) => (
          <Text key={index}> • {item}</Text>
        ))}
        <Text className="pt-2">{TosStrings.dosLastParagraph}</Text>

        {/* Account Registration */}
        <Text className={styleHeading}>{TosStrings.accRegHeading}</Text>
        <Text className={styleParagraph}>{TosStrings.accRegParagraph}</Text>

        {TosStrings.accRegList.map((item, index) => (
          <Text key={index}> • {item}</Text>
        ))}
        <Text className="pt-2">{TosStrings.accRegLastParagraph}</Text>

        {/* Data Privacy */}
        <Text className={styleHeading}>{TosStrings.dataPrivacyHeading}</Text>
        <Text className={styleParagraph}>
          {TosStrings.dataPrivacyParagraph}
        </Text>

        {/* User Conduct */}
        <Text className={styleHeading}>{TosStrings.userConductHeading}</Text>
        <Text className={styleParagraph}>
          {TosStrings.userConductParagraph}
        </Text>
        {TosStrings.userConductList.map((item, index) => (
          <Text key={index}> • {item}</Text>
        ))}

        <Text className="pt-2">{TosStrings.userConductLastParagraph}</Text>

        {/* Report Abuse */}
        <Text className={styleHeading}>{TosStrings.reportAbuseHeading}</Text>
        <Text className={styleParagraph}>
          {TosStrings.reportAbuseParagraph}
        </Text>

        {/* Limitation of Liability */}

        <Text className={styleHeading}>
          {TosStrings.limitationOfLiabilityHeading}
        </Text>
        <Text className={styleParagraph}>
          {TosStrings.limitationOfLiabilityParagraph}
        </Text>

        {/* change of terms */}
        <Text className={styleHeading}>{TosStrings.cotHeading}</Text>
        <Text className={styleParagraph}>{TosStrings.cotParagraph}</Text>
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
          page="tos"
        />
        <View style={{ height: 16 }} />
        <Button
          onPress={() => {
            if (isPressed) router.push("/(auth)/privacyScreen");
          }}
          title={Strings.continueButton}
          disabled={!isPressed}
          fullWidth
        />
      </View>
    </View>
  );
};

export default TermsScreen;
