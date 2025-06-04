import { Text, View, TouchableOpacity } from "react-native";
import TimeDark from "@/assets/icons/time_dark.svg";
import Call from "@/assets/icons/Calling.svg"

interface ScheduleButtonProps {
 buttonText: string,
 buttonIcon: string   
}

const ScheduleButton = ({buttonText, buttonIcon}: ScheduleButtonProps) => {
    return ( 
        <TouchableOpacity className="bg-background rounded-xl p-3 flex flex-row justify-center items-center gap-1 w-32 mt-3">
            {buttonIcon === 'clock' ? <TimeDark width={20} height={20} /> : <Call width={20} height={20} />}
            <Text className="text-black font-inter text-md text-center font-bold">{buttonText}</Text>
        </TouchableOpacity>
     );
}
 
export default ScheduleButton;