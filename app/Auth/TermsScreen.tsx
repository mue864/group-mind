import Elipse from "@/assets/icons/termsElipse.svg";
import Rect from "@/assets/icons/termsRect.svg";
import Button from "@/components/Button";
import CheckBox from "@/components/CheckBox";
import { Strings, TosStrings } from "@/constants";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View, Dimensions } from "react-native";

const TermsScreen = () => {
  const screenHeight = Dimensions.get("window").height;
  const scrollViewHeight = screenHeight * 0.10;
  const router = useRouter();
  const styleParagraph = "font-inter pt-5";
  const styleHeading = "pt-5 font-bold text-xl font-inter";
  const [isPressed, setIsPressed] = useState(false);
  return (
    <View className="flex-1 relative">
      <Text className="text-primary font-poppins-semiBold text-2xl pt-8 mx-5">
        {TosStrings.termsOfServiceHeading}
      </Text>

      <ScrollView className="flex-[0.80] mx-5 pt-1"
      style={{height: scrollViewHeight}}
      >
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
        <CheckBox isPressed={isPressed} />
      </Pressable>

      <View className="absolute right-8 left-8 bottom-5">
        <Button
          onPress={() => {
            isPressed && router.push("/Auth/PrivacyScreen");
          }}
          buttonText={Strings.continueButton}
        />
      </View>
    </View>
  );
};

export default TermsScreen;
