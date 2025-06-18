import { Timestamp } from "firebase/firestore";
import React from "react";
import { Text, View, Dimensions, TouchableOpacity } from "react-native";
import Comment from "@/assets/icons/comment_duotone.svg"
import Time from "@/assets/icons/time-qa.svg"
import HR from "@/assets/icons/hr.svg"
import Button from "@/assets/icons/Arrow-Right.svg"
interface QaProps {
  post: string;
  timeSent: Timestamp;
  responseTo: [];
  responseFrom: [];
}

function QApostCard({ post, timeSent, responseTo, responseFrom }: QaProps) {
    const deviceWidth = Dimensions.get('window').width;
    const time = new Date();
    const timeNow = time.getTime().toString();

    return (
      <TouchableOpacity activeOpacity={0.7} className="mt-5">
        <View className="flex flex-row">
          <View className="flex mx-3" style={{ width: 290 }}>
            <Text className="text-qaText font-inter font-semibold">{post}</Text>
            <View className="flex flex-row mt-2">
              {/* comment icon */}
              <View className="flex flex-row justify-center items-center">
                <Comment width={20} height={20} />
                <Text className="font-inter text-qaText ">
                  {responseFrom.length}
                </Text>
              </View>
              {/* Time sent */}
              <View
                className="flex flex-row justify-center items-center"
                style={{ marginLeft: 100 }}
              >
                <Time width={20} height={20} />
                <Text className="text-qaText font-inter">10 min ago</Text>
              </View>
            </View>
          </View>

          <View className="flex justify-center items-center mb-2">
            <Button width={30} height={30} />
          </View>
        </View>

        <View className="mt-2">
          <HR width={deviceWidth} height={2} />
        </View>
      </TouchableOpacity>
    );
}

export default QApostCard;
