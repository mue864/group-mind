import { TouchableOpacity } from "react-native";
import Left from "@/assets/icons/Expand_left.svg";
import Right from "@/assets/icons/Expand_right.svg";
import Done from "@/assets/icons/Done_round.svg";

type miniButtonProps = {
    direction: string,
    onPress: () => void,
}

const MiniButton = ({direction,onPress}: miniButtonProps) => {
    return ( 
        <TouchableOpacity
        onPress={onPress}
        className="bg-primary p-5 rounded-xl shadow-lg"
        style={{
            elevation: 4,
            shadowColor: "black",
            shadowRadius: 10,
            shadowOffset: {width: 0, height: 2}
        }}
        >
            {direction === "left" ? <Left width={20} height={20}/> : direction === "right" ? <Right width={20} height={20} /> : <Done width={20} height={20} /> }
        </TouchableOpacity>
     );
}
 
export default MiniButton;