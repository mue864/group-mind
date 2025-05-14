import {View, Text} from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import { TosStrings, PrivacyStrings } from "@/constants";

interface CheckBoxProps {
    isPressed: boolean,
    page: string
}
const CheckBox = ({isPressed, page}: CheckBoxProps) => {
    return (
        <View className="flex-row">
          <View className="w-12">
            <FontAwesome6 name="circle-check" size={20} color={isPressed? "green" : "grey"} />
          </View>
          <View>
            {page === "tos"? <Text>{TosStrings.termsAgreement}</Text> : <Text>{PrivacyStrings.privacyAgreement}</Text>}
          </View>
        </View>
    );
}
 
export default CheckBox;