import Done from "@/assets/icons/Done_round.svg";
import Left from "@/assets/icons/Expand_left.svg";
import Right from "@/assets/icons/Expand_right.svg";
import { useRef } from "react";
import { TouchableOpacity, View } from "react-native";

type MiniButtonProps = {
  direction: string;
  onPress: () => void;
  disabled?: boolean;
  size?: "small" | "medium" | "large";
};

const MiniButton = ({
  direction,
  onPress,
  disabled = false,
  size = "medium",
}: MiniButtonProps) => {
  const isPressed = useRef(false);

  const sizeConfig = {
    small: { padding: 12, iconSize: 16 },
    medium: { padding: 18, iconSize: 20 },
    large: { padding: 24, iconSize: 24 },
  };

  const { padding, iconSize } = sizeConfig[size];

  const handlePress = () => {
    if (disabled) return;
    onPress();
  };

  const getIcon = () => {
    const iconProps = { width: iconSize, height: iconSize };

    switch (direction) {
      case "left":
        return <Left {...iconProps} />;
      case "right":
        return <Right {...iconProps} />;
      default:
        return <Done {...iconProps} />;
    }
  };

  const getBackgroundColor = () => {
    if (disabled) return "#ccc";
    if (direction === "left") return "#6B7280"; // gray for back
    if (direction === "right") return "#3B82F6"; // blue for next
    return "#10B981"; // green for done
  };

  return (
    <View style={{ opacity: disabled ? 0.5 : 1 }}>
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.8}
        style={{
          backgroundColor: getBackgroundColor(),
          padding,
          borderRadius: 16,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        {getIcon()}
      </TouchableOpacity>
    </View>
  );
};

export default MiniButton;
