import {Text, TouchableOpacity } from "react-native";

type buttonProps = {
    buttonText: string,
    onPress: () => void
}
const Button = ({buttonText, onPress}: buttonProps) => {
    return ( 
        <TouchableOpacity 
        style={{
            elevation: 4,
            shadowColor: "black",
            shadowOffset: {width: 0, height: 2},
            shadowRadius: 10,
            
        }}
        onPress={onPress}
        className="bg-primary p-5 rounded-xl shadow-2xl">
            <Text className="text-background text-center font-bold text-xl font-inter">{buttonText}</Text>
        </TouchableOpacity>
     );
}
 
export default Button;