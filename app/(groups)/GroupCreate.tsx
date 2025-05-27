import { TouchableOpacity, View } from "react-native";
import Elipse from "@/assets/icons/termsElipse.svg";
import Rect from "@/assets/icons/termsRect.svg";
import {useState} from "react";
import {TextInput} from "react-native";
import Button from "@/components/Button";
import Camera from "@/assets/icons/camera.svg";
import {Strings} from "@/constants";
import ImageModal from "@/components/ImageModal";
import ProfileImage from "@/components/ProfileImage";
import {Pressable} from "react-native";


const GroupCreate = () => {
    const [groupName, setGroupName] = useState("");
    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    return ( 
        <View className="flex-1 items-center bg-background">
            <View className="absolute bottom-0 right-20 left-20">
                <Elipse width={350} height={300} />
            </View>

                     <Pressable
                       className="items-center mt-6 mb-4 justify-center mx-auto"
                       onPress={() => setModalVisible(!isModalVisible)}
                       style={{ width: 150, height: 150 }}
                     >
                       <ImageModal
                         modalVisible={isModalVisible}
                         changeModalVisibility={setModalVisible}
                         selectedImage={setSelectedImage}
                       />
                       {selectedImage !== null ? (
                           <ProfileImage imageLocation={selectedImage} />
                       ) : (
                        <View className="rounded-full border border-muted bg-secondary/50 justify-center items-center"
                        style={{ width: 150, height: 150 }}>
                         <Camera
                           width={50}
                           height={50}
                         />
                        </View>
                       )}
                     </Pressable>

            


        </View>
        
     );
}
 
export default GroupCreate;