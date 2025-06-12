import { Timestamp } from "firebase/firestore";
import { Text, View } from "react-native";
import Call from "../assets/icons/Callz.svg";
import Group from "../assets/icons/groupUsers.svg";
import Time from "../assets/icons/time.svg";
import Video from "../assets/icons/Video.svg";
import ScheduleButton from "./ScheduleButton";

interface ScheduledCardProps {
    title?: string,
    time?: Timestamp | null,
    type: string,
    groupName: string
}

const ScheduledCard = ({title, time, type, groupName}: ScheduledCardProps) => {
   
    // time formatting
    const now = new Date();
    const isScheduled = time && time.toDate() > now;
    const dateString = now.toDateString();
    const splitNow = dateString.split(" 2025");
    const scheduleTime = time?.toDate().toDateString().split(" 2025");
    const timeString = time?.toDate().toTimeString().split(' ')[0]; // Gets '18:30:52'
    const hoursAndMinutes = timeString?.substring(0, 5); // Takes first 5 characters '18:30'
    const formattedSchedule = scheduleTime?.[0].substring(4, 10)
    const formattedTime = timeString?.substring(0, 5)
    const trueDate = scheduleTime?.[0] === splitNow[0];

    // call type formatting
    const callType = type === "video" ? <Video width={25} height={25} /> : <Call width={23} height={23} />
    return (
      <View className="bg-primary rounded-2xl flex flex-col p-4  justify-center mx-7 mt-5 gap-1">
        <Text className="text-background font-inter text-2xl text-center font-bold">
          Upcoming Live Session
        </Text>
        <View className="flex flex-row items-center justify-center gap-4">
          <View className="flex flex-row items-center justify-center gap-1">
            {callType}
            <Text className="text-background font-inter text-md font-bold w-24">
              {title}
            </Text>
          </View>

          <View className="flex flex-row items-center justify-center gap-1">
            <Time width={25} height={25} />
            <Text className="text-background font-inter text-md font-bold">
              {isScheduled
                ? trueDate
                  ? "Today" + ", " + hoursAndMinutes
                  : formattedSchedule + ", " + formattedTime
                : "No time scheduled"}
            </Text>
          </View>
        </View>

        <View className="flex flex-row items-center justify-center gap-5">
            <ScheduleButton buttonText="Remind Me" buttonIcon="clock" />
            <ScheduleButton buttonText="Join" buttonIcon="call" />
        </View>

        <View className="flex flex-row items-center justify-center gap-2 mt-2">
            <Group width={25} height={25} />
            <Text className="text-background/90 font-inter text-xl font-bold">{groupName}</Text>
        </View>
      </View>
    );
}
 
export default ScheduledCard;