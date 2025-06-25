import Chevron from "@/assets/icons/right-circle.svg";
import { TouchableOpacity, View, Text } from "react-native";

interface GroupButtonProps {
  openGroup: (groupId: string) => void;
  groupType: string | undefined // either a string with Invite or Yours
}

function GroupButton({ openGroup, groupType }: GroupButtonProps) {
  return (
    <TouchableOpacity
      className="bg-primary rounded-xl w-24 h-9 justify-center items-center"
      onPress={openGroup}
      activeOpacity={0.8}
    >
      <View>
        {groupType === "Invite" ? <Text className="font-poppins-semiBold text-white font-medium">Join</Text> : <Chevron width={25} height={25} /> }
      </View>
    </TouchableOpacity>
  );
}

export default GroupButton;
