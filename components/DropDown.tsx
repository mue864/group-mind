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

  return (
    <View style={{ zIndex: open ? zIndex : 1 }}>
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
        style={{
          backgroundColor: error ? "#fff" : "rgba(158, 173, 217, 0.1)",
          borderColor: error ? "#ef4444" : "#9EADD9",
        }}
        placeholderStyle={{ color: "rgb(107, 114, 128)", fontWeight: "bold" }}
        textStyle={{ fontSize: 16 }}
        listItemLabelStyle={{ color: "rgb(107, 114, 128)", fontWeight: "bold" }}
        dropDownContainerStyle={{
          borderColor: error ? "#ef4444" : "#9EADD9",
          backgroundColor: error ? "#fff" : "rgba(158, 173, 217, 0.1)",
        }}
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
