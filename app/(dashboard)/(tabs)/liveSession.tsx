import { Text, View, StatusBar } from "react-native";
import {useEffect, useState} from "react"

const LiveSession = () => {
    const [session, setSession] = useState([]);

    return ( 
        <View className="flex-1 bg-white">
            <StatusBar barStyle={'dark-content'} backgroundColor={'white'}  />
            <Text>Live Session</Text>
        </View>
     );
}
 
export default LiveSession;