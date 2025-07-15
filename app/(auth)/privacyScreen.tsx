import Button from "@/components/Button";
import EnhancedCheckBox from "@/components/CheckBox";
import { PrivacyStrings, Strings } from "@/constants";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";

const PrivacyScreen = () => {
  const router = useRouter();
  const [isPressed, setIsPressed] = useState(false);

  const Section = ({ title, children }) => (
    <View className="mb-6">
      <Text className="text-gray-900 font-inter font-semibold text-lg mb-3 leading-relaxed">
        {title}
      </Text>
      {children}
    </View>
  );

  const Paragraph = ({ children, className = "" }) => (
    <Text
      className={`text-gray-700 font-inter text-base leading-relaxed mb-3 ${className}`}
    >
      {children}
    </Text>
  );

  const BulletList = ({ items }) => (
    <View className="ml-2 mb-3">
      {items.map((item, index) => (
        <View key={index} className="flex-row items-start mb-1">
          <View className="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2.5 mr-3" />
          <Text className="text-gray-700 font-inter text-base leading-relaxed flex-1">
            {item}
          </Text>
        </View>
      ))}
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 pt-6 pb-4 border-b border-gray-100">
        <Text className="text-primary font-poppins-semiBold text-3xl leading-tight">
          {PrivacyStrings.mainHeading}
        </Text>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="bg-white rounded-xl p-6 mb-6 shadow-sm">
          <Text className="text-gray-900 font-inter font-semibold text-lg mb-2">
            {PrivacyStrings.effectiveDate}
          </Text>
          <Paragraph>{PrivacyStrings.summary}</Paragraph>
        </View>

        <View className="bg-white rounded-xl p-6 space-y-6">
          <Section title={PrivacyStrings.infoWeCollectHeading}>
            <Paragraph>{PrivacyStrings.infoWeCollectText1}</Paragraph>
            <BulletList items={PrivacyStrings.infoWeCollectList} />
            <Paragraph>{PrivacyStrings.infoWeCollectText2}</Paragraph>
          </Section>

          <View className="border-t border-gray-100 pt-6">
            <Section title={PrivacyStrings.personalDataStorageHeading}>
              <Paragraph>{PrivacyStrings.personalDataStorageText}</Paragraph>
            </Section>
          </View>

          <View className="border-t border-gray-100 pt-6">
            <Section title={PrivacyStrings.thirdPartyHeading}>
              <Paragraph>{PrivacyStrings.thirdPartyServicesText}</Paragraph>
            </Section>
          </View>

          <View className="border-t border-gray-100 pt-6">
            <Section title={PrivacyStrings.userResponsibilityHeading}>
              <Paragraph>{PrivacyStrings.userResponsibilityText}</Paragraph>
            </Section>
          </View>

          <View className="border-t border-gray-100 pt-6">
            <Section title={PrivacyStrings.abuseReportingHeading}>
              <Paragraph>{PrivacyStrings.abuseReportingText}</Paragraph>
            </Section>
          </View>

          <View className="border-t border-gray-100 pt-6">
            <Section title={PrivacyStrings.policyChangesHeading}>
              <Paragraph>{PrivacyStrings.policyChangesText}</Paragraph>
            </Section>
          </View>
        </View>

        {/* Bottom spacing for footer */}
        <View className="h-24" />
      </ScrollView>

      {/* Footer */}
      <View className="bg-white px-6 py-5 border-t border-gray-100">
        <View className="mb-4">
          <EnhancedCheckBox
            isPressed={isPressed}
            onPress={() => setIsPressed(!isPressed)}
            page="privacy"
          />
        </View>
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
