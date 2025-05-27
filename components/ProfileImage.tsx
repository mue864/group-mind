import { Image} from "react-native";

type ImageLocationProps = {
    imageLocation: string 
};

const ProfileImage = ({imageLocation}: ImageLocationProps) => {
    const avatars = {
      "avatar1.jpg": require("@/assets/images/avatars/avatar1.jpg"),
      "avatar2.jpg": require("@/assets/images/avatars/avatar2.jpg"),
      "avatar3.jpg": require("@/assets/images/avatars/avatar3.jpg"),
      "avatar4.jpg": require("@/assets/images/avatars/avatar4.jpg"),
      "avatar5.jpg": require("@/assets/images/avatars/avatar5.jpg"),
      "avatar6.jpg": require("@/assets/images/avatars/avatar6.jpg"),
      "avatar7.jpg": require("@/assets/images/avatars/avatar7.jpg"),
      "avatar8.jpg": require("@/assets/images/avatars/avatar8.jpg"),
      "avatar9.jpg": require("@/assets/images/avatars/avatar9.jpg"),
    };
    return ( 
            <Image source={avatars[imageLocation]} style={{width: 150, height: 150 }} className="rounded-full border border-muted" />
     );
}
 
export default ProfileImage;