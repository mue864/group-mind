import { Text, View } from "react-native";
import Rect from "@/assets/icons/introduceRect.svg";
import Check from "@/assets/icons/chat-check.svg";
import Elipse from "@/assets/icons/introduceEllipse.svg";
import MiniButton from "@/components/MiniButton";

const IntroduceScreen_1 = () => {
    return ( 
       
        <View className="flex-1">
            <View className="absolute">
                <Rect width={350} height={200} />
            </View>
            
            <View className="absolute left-40 bottom-0">
                <Elipse width={250} height={300} />
            </View>

            <View className="justify-center items-center pt-20 h-64">
                <Check width={200} height={200} />
            </View>

            <View className="absolute right-16 left-0 bottom-20">
                <MiniButton 
                onPress={() => console.log("test")}
                direction="right"
                />
            </View>
        </View>
     );
}
 
export default IntroduceScreen_1;