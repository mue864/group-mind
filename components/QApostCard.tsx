import { Timestamp } from "firebase/firestore";
import React from "react";
import { Text, View, Dimensions, TouchableOpacity } from "react-native";
import Comment from "@/assets/icons/comment_duotone.svg"
import Time from "@/assets/icons/time-qa.svg"
import HR from "@/assets/icons/hr.svg"
import Button from "@/assets/icons/Arrow-Right.svg"
interface QaProps {
  post: string;
  timeSent?: Timestamp;
  responseTo: [];
  responseFrom: [];
}

function QApostCard({ post, timeSent, responseTo, responseFrom }: QaProps) {
    
    let displayTime = ""
    
    const deviceWidth = Dimensions.get('window').width;
    const sentTime = timeSent?.toDate?.() ?? new Date()

    const now = new Date();
    const sentTimeMs = sentTime.getTime();
    const diffMs = now.getTime() - sentTimeMs // difference in milliseconds
    const diffMin = Math.floor(diffMs / 60000);


    if (diffMin < 1) {
        displayTime = "Just Now"
    } else if (diffMin === 1) {
        displayTime = `${diffMin} min ago`;
    } else if (diffMin < 60) {
        displayTime = `${diffMin} mins ago`
    } else {
        const diffHours = Math.floor(diffMin / 60);
        displayTime = `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
    }

    return (
      <TouchableOpacity activeOpacity={0.7} className="mt-5">
        <View className="flex flex-row justify-between items-start mx-3">
          {/* Left section (Text and Meta) */}
          <View className="flex-1 pr-4">
            {/* Takes up remaining space */}
            <Text className="text-qaText font-inter font-semibold">{post}</Text>
            <View className="flex flex-row mt-2 space-x-6">
              {/* Comment Icon + Count */}
              <View className="flex flex-row items-center space-x-1">
                <Comment width={20} height={20} />
                <Text className="text-qaText font-inter">
                  {responseFrom.length}
                </Text>
              </View>

              {/* Time Sent */}
              <View className="flex flex-row items-center mx-10">
                <Time width={20} height={20} />
                <Text className="text-qaText font-inter">{displayTime}</Text>
              </View>
            </View>
          </View>

          {/* Right section (Button) */}
          <View className="justify-start items-center mt-1">
            <Button width={24} height={24} />
          </View>
        </View>

        {/* Separator */}
        <View className="mt-2">
          <HR width={deviceWidth} height={2} />
        </View>
      </TouchableOpacity>
    );
}

export default QApostCard;
