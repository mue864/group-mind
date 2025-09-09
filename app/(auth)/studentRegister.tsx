import { View, Text } from 'react-native'
import React, {useState} from 'react'
import TextBox from '@/components/TextBox';
import Button from '@/components/Button';
import { db, auth } from '@/services/firebase';
import { updateDoc } from 'firebase/firestore';
import DropDown from '@/components/DropDown';
import { zimbabweUniversities } from '@/constants/universities';
import { subjects } from '@/constants/subjects';
import { Strings } from '@/constants';

const StudentRegister = () => {

    const [university, setUniversity] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [selectedSubjectGroups, setSubjectGroups] = useState("")

  return (
    <View className="flex-1  items-center bg-white">
      <View className="mt-10 items-center">
        <Text className="font-poppins-semiBold text-2xl mb-10 text-primary">
          Student Register
        </Text>
      </View>
      <View className='mx-10'>
        <View
          style={{
            width: "100%",
            marginTop: 18,
            marginBottom: 18,
            zIndex: 1000,
          }}
        >
          <DropDown
            data={zimbabweUniversities}
            placeholder="Select Your University"
            zIndex={1000}
            zIndexInverse={3000}
            setValue={setUniversity}
            error={submitted && university === ""}
          />
          {submitted && university === "" && (
            <Text className="font-poppins-semibold text-sm text-[#ef4444] mt-1 ml-1">
              University is required
            </Text>
          )}
        </View>
        <View
          style={{
            width: "100%",
            marginTop: 9,
            marginBottom: 18,
            zIndex: 1000,
          }}
        >
          <DropDown
            data={subjects}
            placeholder="Select Subjects"
            zIndex={1000}
            zIndexInverse={3000}
            setValue={setSubjectGroups}
            error={submitted && selectedSubjectGroups === ""}
          />
          {submitted && university === "" && (
            <Text className="font-poppins-semibold text-sm text-[#ef4444] mt-1 ml-1">
              Purpose is required
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

export default StudentRegister
