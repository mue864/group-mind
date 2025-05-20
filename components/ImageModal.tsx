import { Text, View, Modal, TouchableOpacity, Image } from "react-native";
import Button from "./Button";
import { useState } from "react";

interface ImageModalProps {
    modalVisible: boolean,
    changeModalVisibility: (modalVisible: boolean) => void,
    selectedImage: (selectedImage: string | null) => void,
}
const ImageModal = ({modalVisible, changeModalVisibility, selectedImage}: ImageModalProps) => {
    const avatars = {
       'avatar1.jpg': require('@/assets/images/avatars/avatar1.jpg'),
       'avatar2.jpg': require('@/assets/images/avatars/avatar2.jpg'),
       'avatar3.jpg': require('@/assets/images/avatars/avatar3.jpg'),
       'avatar4.jpg': require('@/assets/images/avatars/avatar4.jpg'),
       'avatar5.jpg': require('@/assets/images/avatars/avatar5.jpg'),
       'avatar6.jpg': require('@/assets/images/avatars/avatar6.jpg'),
       'avatar7.jpg': require('@/assets/images/avatars/avatar7.jpg'),
       'avatar8.jpg': require('@/assets/images/avatars/avatar8.jpg'),
       'avatar9.jpg': require('@/assets/images/avatars/avatar9.jpg'),
        
    };
    const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
    
    const handleContinue = () => {
      if (selectedAvatar !== null) {
        selectedImage(selectedAvatar);
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
              {Object.entries(avatars).map(([name, source]) => (
                <TouchableOpacity
                  key={name}
                  onPress={() => setSelectedAvatar(name)}
                  
                >
                  <Image source={source} className={`w-20 h-20 rounded-full ${selectedAvatar === name ? "border-4 border-primary" : "" } `} />
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