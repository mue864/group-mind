import Logo from "@/assets/icons/logo/logo.svg";
import { auth } from "@/services/firebase";
import { useGroupContext } from "@/store/GroupContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import "../global.css";

interface UserInfo {
  userName: string;
  profilePicture: string;
  purpose: string;
  level: string;
  joinedGroups: [];
  canExplainToPeople: boolean;
  userID: string;
  bio?: string;
  profileComplete: boolean;
  university: string;
  volunteerVerified: boolean;
  volunteerSubjects: string[];
  volunteerAvailability: {
    day: string;
    start: string;
    end: string;
  }[];
  volunteerVerification: {
    [key: string]: {
      status: string;
      score: number;
      attempts: number;
      updatedAt: number;
    };
  };
}

const Entry = () => {
  const { userInformation, getCurrentUserInfo } = useGroupContext();
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [profileStep, setProfileStep] = useState(0);
  const [profilePurpose, setProfilePurpose] = useState("");
  const profileStepRef = useRef(profileStep);
  const profilePurposeRef = useRef(profilePurpose);
  const profileCompletedRef = useRef(profileCompleted);
  const userInfoRef = useRef(userInformation);
  const [localUserInfo, setLocalUserInfo] = useState<UserInfo>();
  const localUserInfoRef = useRef(localUserInfo);

  const router = useRouter();
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  const fetchState = async () => {

    // await getCurrentUserInfo();

    // if (userInformation) {
    //   setProfileCompleted(userInformation?.profileComplete);
    //   profileCompletedRef.current = userInformation?.profileComplete;
    //   console.log("Profile completed:", userInformation?.profileComplete);
    // }
    // userInfoRef.current = userInformation;
    // console.log("userInfoRef: ", userInfoRef);

    try {
      const userInfo = await AsyncStorage.getItem("@localUserInfo");
      
      if (userInfo) {
        console.log(userInfo)
        const parsedUserInfo = JSON.parse(userInfo);
        setLocalUserInfo(parsedUserInfo);
        console.log(parsedUserInfo)
        localUserInfoRef.current = parsedUserInfo;

        console.log("User infoRef: ", localUserInfoRef.current?.profileComplete);
      }
    } catch (error) {
      console.error("Unable to fetch user data: ", error);
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    };
  });

  const fetchProfileStep = async () => {
    try {
      const profileStep = await AsyncStorage.getItem("@profileStep");
      console.log("Fetched profile step from AsyncStorage:", profileStep);
      if (profileStep !== null) {
        const parsedStep = JSON.parse(profileStep);
        setProfileStep(parsedStep.profileStep);
        setProfilePurpose(parsedStep.profilePurpose);
        profileStepRef.current = parsedStep.profileStep;
        profilePurposeRef.current = parsedStep.profilePurpose;

        console.log("Parsed profile step:", parsedStep.profileStep);
      } else {
        setProfileStep(0);
        setProfilePurpose("");
        profileStepRef.current = 0;
        profilePurposeRef.current = "";
      }
    } catch (error) {
      console.error("Error fetching profile step from AsyncStorage:", error);
    }
  };

  useEffect(() => {
    fetchState();
    fetchProfileStep();
  }, []);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 1000 });
    scale.value = withTiming(1, { duration: 1000 });
  }, []);

  useEffect(() => {
    // firebase auth
    const unsubscribe = onAuthStateChanged(auth, (userState) => {
      const timeout = setTimeout(async () => {
        // Refresh latest user info right before routing
        await getCurrentUserInfo?.();
        userInfoRef.current = userInformation;
        profileCompletedRef.current = userInformation?.profileComplete ?? false;

        if (profileStepRef.current === 0) {
          if (userState?.emailVerified) {
            // all of these are not even working at all
            const isVolunteer = userInfoRef.current?.purpose === "Volunteer";
            const isVerified = userInfoRef.current?.volunteerVerified;
            console.log("Is Verified", isVerified);
            if (isVolunteer && !isVerified) {
              router.replace("/verifyGate");
            } else {
              router.replace("/(dashboard)/(tabs)/home");
            }
          } else if (userState?.emailVerified === false) {
            console.log("Profile Completed: ", profileCompletedRef);
            router.replace("/(auth)/verifyEmail");
          } else {
            router.replace("/(onboarding)/welcome");
          }
        } else if (profileStepRef.current === 1) {
          if (profilePurposeRef.current === "Student") {
            router.replace("/(auth)/studentRegister");
          } else if (profilePurposeRef.current === "Volunteer") {
            router.replace("/(auth)/volunteerRegister");
          }
        }
      }, 2000);

      return () => clearTimeout(timeout);
    });
    return () => unsubscribe();
  }, []);

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Animated.View className="gap-4" style={animatedStyle}>
        <View>
          <Logo width={150} height={150} />
        </View>
        <View>
          <Text className="text-3xl text-[#1C274C] font-poppins-semiBold text-center ">
            Group<Text className="text-[#84DBFF]">Mind</Text>
          </Text>
        </View>
      </Animated.View>
    </View>
  );
};

export default Entry;
