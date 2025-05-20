import { Text, TouchableOpacity } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";

interface ActionButtonProps {
    action: () => void
}

const ActionButton = ({action}: ActionButtonProps) => {
    return ( 
        <TouchableOpacity
        className="bg-primary rounded-xl flex-row justify-center items-center p-4 absolute bottom-20 right-7"
        style={{elevation: 6}}
        onPress={action}
        >
            <FontAwesome6 name="globe" size={15} color={"#fff"} />
            <Text className="text-background font-poppins-semiBold text-lg mx-1">Explore Groups</Text>
        </TouchableOpacity>
     );
}
 
export default ActionButton;