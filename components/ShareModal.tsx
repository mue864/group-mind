import { View, Text, Pressable, TouchableOpacity } from 'react-native'
import { Modal } from 'react-native-paper'
import Image from '@/assets/icons/image.svg'
import File from '@/assets/icons/file.svg'
import * as DocumentPicker from "expo-document-picker";

interface ShareModalProps {
    visible: boolean,
    onDismiss: () => void,
}

const ShareModal = ({visible, onDismiss}: ShareModalProps) => {

const imagePicker = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: "image/*",
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (!result.canceled) {
      const file = result.assets[0];
      console.log("Image picked:", file);
      console.log("URI:", file.uri);
      console.log("Name:", file.name);
      console.log("Size:", file.size);
    } else {
      console.log("User cancelled image picking");
    }
  } catch (err) {
    console.error("Image picking error:", err);
  }
};

const filePicker = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/plain",
      ],
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (!result.canceled) {
      const file = result.assets[0];
      console.log("File picked:", file);
    } else {
      console.log("User cancelled file picking");
    }
  } catch (err) {
    console.error("File picking error:", err);
  }
};

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      contentContainerStyle={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
      dismissable={true}
    >
      <Pressable
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={onDismiss}
      >
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View className="bg-white p-4 rounded-lg  w-56 items-center flex-col justify-center">
            <View className="flex items-center">
              <Text className="text-center font-inter text-gray-400 text-xl font-bold">
                Select Files
              </Text>
            </View>
            <View className="flex-row gap-2">
              <TouchableOpacity className="flex flex-col items-center gap-2"
              onPress={imagePicker}
              >
                <Image width={60} height={60} />
              </TouchableOpacity>
              <TouchableOpacity className="flex flex-col items-center gap-2 "
              onPress={filePicker}
              >
                <File width={60} height={60} />
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default ShareModal