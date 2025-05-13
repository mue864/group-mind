import {View, Text} from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import { TosStrings } from "@/constants";

interface CheckBoxProps {
    isPressed: boolean
}
const CheckBox = ({isPressed}: CheckBoxProps) => {
    return (
        <View className="flex-row">
          <View className="w-12">
            <FontAwesome6 name="circle-check" size={20} color={isPressed? "green" : "grey"} />
          </View>
          <View>
            <Text>{TosStrings.termsAgreement}</Text>
          </View>
        </View>
    );
}
 
export default CheckBox;