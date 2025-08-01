import { FontAwesome6 } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { View } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";

interface DropDownProps {
  data: { label: string; value: string }[];
  placeholder: string;
  zIndex: number;
  zIndexInverse: number;
  setValue: (level: string) => void;
  error?: boolean;
}

const DropDown: React.FC<DropDownProps> = ({
  data,
  placeholder,
  zIndex,
  zIndexInverse,
  setValue,
  error,
}) => {
  // dropdown
  const [open, setOpen] = useState(false);
  const [value, setLocalValue] = useState("");
  const [items, setItems] = useState(data);

  useEffect(() => {
    setValue(value);
  }, [value, setValue]);

  // Style objects for different states
  const pickerStyle = {
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 56,
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
    backgroundColor: "#fff",
    borderColor: error ? "#ef4444" : "#9EADD9",
  };

  const dropDownContainerStyle = {
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 4,
    backgroundColor: error ? "#fff" : "rgba(158,173,217,0.1)",
    borderColor: error ? "#ef4444" : "#9EADD9",
  };

  const placeholderStyle = {
    color: "#9EADD9",
    fontWeight: "bold" as const,
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
  };
         


  const textStyle = {
    fontSize: 16,
    color: "#4B5563",
    fontFamily: "Poppins-SemiBold",
  };

  const listItemLabelStyle = {
    color: "#6B7280",
    fontWeight: "bold" as const,
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
  };

  return (
    <View className={open ? `z-[${zIndex}]` : "z-[1]"}>
      <DropDownPicker
        open={open}
        value={value}
        items={items}
        setOpen={setOpen}
        setValue={setLocalValue}
        setItems={setItems}
        placeholder={placeholder}
        listMode="MODAL"
        modalProps={{
          animationType: "slide",
        }}
        style={pickerStyle}
        placeholderStyle={placeholderStyle}
        textStyle={textStyle}
        listItemLabelStyle={listItemLabelStyle}
        dropDownContainerStyle={dropDownContainerStyle}
        ArrowDownIconComponent={() => (
          <FontAwesome6
            name="chevron-down"
            size={15}
            color="rgb(107, 114, 128)"
          />
        )}
        ArrowUpIconComponent={() => (
          <FontAwesome6 name="angle-up" size={18} color="rgb(107, 114, 128)" />
        )}
        zIndex={zIndex}
        zIndexInverse={zIndexInverse}
      />
    </View>
  );
};

export default DropDown;
