import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';

interface EducationalTooltipProps {
  message: string;
  visible: boolean;
  onDismiss: () => void;
  type?: 'warning' | 'info' | 'tip';
}

const EducationalTooltip: React.FC<EducationalTooltipProps> = ({
  message,
  visible,
  onDismiss,
  type = 'info'
}) => {
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  const getBackgroundColor = () => {
    switch (type) {
      case 'warning': return 'bg-orange-50 border-orange-200';
      case 'tip': return 'bg-blue-50 border-blue-200';
      default: return 'bg-green-50 border-green-200';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'warning': return 'text-orange-800';
      case 'tip': return 'text-blue-800';
      default: return 'text-green-800';
    }
  };

  return (
    <Animated.View
      style={{ opacity: fadeAnim }}
      className={`mx-4 mb-3 p-4 rounded-lg border ${getBackgroundColor()}`}
    >
      <View className="flex-row justify-between items-start">
        <Text className={`flex-1 text-sm leading-5 ${getTextColor()}`}>
          {message}
        </Text>
        <TouchableOpacity
          onPress={onDismiss}
          className="ml-3 mt-1"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text className={`text-lg font-bold ${getTextColor()}`}>×</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

export default EducationalTooltip;
