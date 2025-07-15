import { Image } from "react-native";

type ImageLocationProps = {
  imageLocation: string;
  size?: number;
};

const ProfileImage = ({ imageLocation, size = 150 }: ImageLocationProps) => {
  const avatars: { [key: string]: any } = {
    avatar1: require("@/assets/images/avatars/avatar1.webp"),
    avatar2: require("@/assets/images/avatars/avatar2.webp"),
    avatar3: require("@/assets/images/avatars/avatar3.webp"),
    avatar4: require("@/assets/images/avatars/avatar4.webp"),
    avatar5: require("@/assets/images/avatars/avatar5.webp"),
    avatar6: require("@/assets/images/avatars/avatar6.webp"),
    avatar7: require("@/assets/images/avatars/avatar7.webp"),
    avatar8: require("@/assets/images/avatars/avatar8.webp"),
    avatar9: require("@/assets/images/avatars/avatar9.webp"),
  };
  return (
    <Image
      source={avatars[imageLocation]}
      style={{
        width: size,
        height: size,
      }}
      className="rounded-full border border-muted"
    />
  );
};

export default ProfileImage;
