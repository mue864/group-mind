import { Image} from "react-native";

type ImageLocationProps = {
    imageLocation: number 
};

const ProfileImage = ({imageLocation}: ImageLocationProps) => {
    return ( 
            <Image source={imageLocation} style={{width: 100, height: 100 }} className="rounded-full border border-muted" />
     );
}
 
export default ProfileImage;