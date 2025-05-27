import { View, TouchableOpacity } from "react-native";
import Plus from "@/assets/icons/plus.svg"

interface ActionButtonProps {
    action: () => void;
}

const FloatingButton = ({action}: ActionButtonProps) => {
    return ( 
        <TouchableOpacity className="absolute bottom-20 right-8 bg-secondary rounded-full p-5" style={{elevation: 6}}
        onPress={action}
        >
            <Plus width={20} height={20} />
        </TouchableOpacity> 
     );
}
 
export default FloatingButton;