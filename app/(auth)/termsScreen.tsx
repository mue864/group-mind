import Button from "@/components/Button";
import EnhancedCheckBox from "@/components/CheckBox";
import { Strings, TosStrings } from "@/constants";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";

const TermsScreen = () => {
  const router = useRouter();
  const [isPressed, setIsPressed] = useState(false);

  const Section = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <View className="mb-6">
      <Text className="text-gray-900 font-inter font-semibold text-lg mb-3 leading-relaxed">
        {title}
      </Text>
      {children}
    </View>
  );

  const Paragraph = ({
    children,
    className = "",
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <Text
      className={`text-gray-700 font-inter text-base leading-relaxed mb-3 ${className}`}
    >
      {children}
    </Text>
  );

  const BulletList = ({ items }: { items: string[] }) => (
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
          {TosStrings.termsOfServiceHeading}
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
            {TosStrings.effectiveDate}
          </Text>
          <Paragraph>{TosStrings.termsIntro}</Paragraph>
        </View>

        <View className="bg-white rounded-xl p-6 shadow-sm">
          <Section title={TosStrings.dosHeading}>
            <Paragraph>{TosStrings.dosParagraph}</Paragraph>
            <BulletList items={TosStrings.dosList} />
            <Paragraph>{TosStrings.dosLastParagraph}</Paragraph>
          </Section>

          <View className="border-t border-gray-100 pt-6">
            <Section title={TosStrings.accRegHeading}>
              <Paragraph>{TosStrings.accRegParagraph}</Paragraph>
              <BulletList items={TosStrings.accRegList} />
              <Paragraph>{TosStrings.accRegLastParagraph}</Paragraph>
            </Section>
          </View>

          <View className="border-t border-gray-100 pt-6">
            <Section title={TosStrings.dataPrivacyHeading}>
              <Paragraph>{TosStrings.dataPrivacyParagraph}</Paragraph>
            </Section>
          </View>

          <View className="border-t border-gray-100 pt-6">
            <Section title={TosStrings.userConductHeading}>
              <Paragraph>{TosStrings.userConductParagraph}</Paragraph>
              <BulletList items={TosStrings.userConductList} />
              <Paragraph>{TosStrings.userConductLastParagraph}</Paragraph>
            </Section>
          </View>

          <View className="border-t border-gray-100 pt-6">
            <Section title={TosStrings.reportAbuseHeading}>
              <Paragraph>{TosStrings.reportAbuseParagraph}</Paragraph>
            </Section>
          </View>

          <View className="border-t border-gray-100 pt-6">
            <Section title={TosStrings.limitationOfLiabilityHeading}>
              <Paragraph>{TosStrings.limitationOfLiabilityParagraph}</Paragraph>
            </Section>
          </View>

          <View className="border-t border-gray-100 pt-6">
            <Section title={TosStrings.cotHeading}>
              <Paragraph>{TosStrings.cotParagraph}</Paragraph>
            </Section>
          </View>
        </View>

        {/* Bottom spacing for footer */}
        <View className="h-24" />
      </ScrollView>

      {/* Footer */}
      <View className="bg-white px-6 pt-6 pb-8 border-t border-gray-100">
        <View className="mb-4">
          <EnhancedCheckBox
            isPressed={isPressed}
            onPress={() => setIsPressed(!isPressed)}
            page="tos"
          />
        </View>
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
