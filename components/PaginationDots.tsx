import { View } from "react-native";

interface Props {
    total: number,
    currentIndex: number,
}

const PaginationDots = ({total, currentIndex}: Props) => {
    return (
      <View className="flex-row justify-center items-center mt-4 space-x-6">
        {Array.from({ length: total }).map((_, index) => (
          <View
            key={index}
            className={`rounded-full mx-1 ${
              index === currentIndex ? "w-3 h-3 bg-primary" : "w-2 h-2 bg-muted"
            }`}
          />
        ))}
      </View>
    );
}
 
export default PaginationDots;