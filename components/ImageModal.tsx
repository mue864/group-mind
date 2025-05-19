import { Text, View, Modal, TouchableOpacity, Image } from "react-native";
import Button from "./Button";
import { useState } from "react";

interface ImageModalProps {
    modalVisible: boolean,
    changeModalVisibility: (modalVisible: boolean) => void,
    selectedImage: (selectedImage: number | null) => void,
}
const ImageModal = ({modalVisible, changeModalVisibility, selectedImage}: ImageModalProps) => {
    const avatars = [
        require('@/assets/images/avatars/avatar1.jpg'),
        require('@/assets/images/avatars/avatar2.jpg'),
        require('@/assets/images/avatars/avatar3.jpg'),
        require('@/assets/images/avatars/avatar4.jpg'),
        require('@/assets/images/avatars/avatar5.jpg'),
        require('@/assets/images/avatars/avatar6.jpg'),
        require('@/assets/images/avatars/avatar7.jpg'),
        require('@/assets/images/avatars/avatar8.jpg'),
        require('@/assets/images/avatars/avatar9.jpg'),
    ];
    const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null);
    
    const handleContinue = () => {
      if (selectedAvatar !== null) {
        const image = avatars[selectedAvatar];
        selectedImage(image);
        changeModalVisibility(!modalVisible);
        
      }
    }
    return (
      <Modal animationType="slide" visible={modalVisible} transparent={true}>
        <View className="flex-1 justify-center items-center bg-black/30">
          <View
            className="w-5/6 rounded-2xl bg-white p-4"
            style={{ maxHeight: 700 }}
            
          >
            <Text className="text-primary text-xl font-poppins-semiBold text-center mb-10">
              Choose an avatar
            </Text>

            <View className="flex-row flex-wrap justify-center gap-3">
              {avatars.map((avatar, id) => (
                <TouchableOpacity
                  key={id}
                  onPress={() => setSelectedAvatar(id)}
                >
                  <Image source={avatar} className={`w-20 h-20 rounded-full ${selectedAvatar === id ? "border-4 border-primary" : "" } `} />
                </TouchableOpacity>
              ))}
            </View>

            <View className="mt-10">
              <Button
                buttonText="Continue"
                onPress={handleContinue}
              />
            </View>
          </View>
        </View>
      </Modal>
    );
}
 
export default ImageModal;