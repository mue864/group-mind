import { Image} from "react-native";

type ImageLocationProps = {
    imageLocation: string 
};

const ProfileImage = ({imageLocation}: ImageLocationProps) => {
    const avatars = {
      "avatar1.webp": require("@/assets/images/avatars/avatar1.webp"),
      "avatar2.webp": require("@/assets/images/avatars/avatar2.webp"),
      "avatar3.webp": require("@/assets/images/avatars/avatar3.webp"),
      "avatar4.webp": require("@/assets/images/avatars/avatar4.webp"),
      "avatar5.webp": require("@/assets/images/avatars/avatar5.webp"),
      "avatar6.webp": require("@/assets/images/avatars/avatar6.webp"),
      "avatar7.webp": require("@/assets/images/avatars/avatar7.webp"),
      "avatar8.webp": require("@/assets/images/avatars/avatar8.webp"),
      "avatar9.webp": require("@/assets/images/avatars/avatar9.webp"),
    };
    return ( 
            <Image source={avatars[imageLocation]} style={{width: 150, height: 150 }} className="rounded-full border border-muted" />
     );
}
 
export default ProfileImage;