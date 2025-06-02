import { Text, View, Pressable } from "react-native";

interface MiniTabsProps {
    setIndex: (pageIndex: number) => void;
    isActive: boolean;
    tabText: string;
    index: number;
}
const MiniTabs = ({index, tabText, isActive, setIndex}: MiniTabsProps) => {
    const handlePageSwitch = () => {
        if (index === 0) {
            setIndex(1);
        } else {
            setIndex(0);
        }
    }
    return (

        <Pressable className={`rounded-full border justify-center ${isActive ? "bg-primary" : "bg-background"} border-primary w-32 h-7`}
        style={{
            elevation: 4
        }}
        onPress={handlePageSwitch}
        >
          <Text className={`font-inter font-bold ${isActive ? "text-white" : "text-black"} text-center`}>{tabText}</Text>
        </Pressable>
    );
}
 
export default MiniTabs;