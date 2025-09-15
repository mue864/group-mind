import { fastAIDetector } from './aiDetector';

export interface PasteAnalysis {
  isPasted: boolean;
  aiScore: number;
  aiWarning: 'none' | 'likely' | 'detected';
  isEducationalMoment: boolean;
  educationalMessage?: string;
}

export const analyzePastedContent = (
  newText: string, 
  previousText: string = '',
  timeThreshold: number = 100 // ms threshold for paste detection
): PasteAnalysis => {
  const textDifference = newText.length - previousText.length;
  const isPasted = textDifference > 10; // Assume paste if more than 10 chars added at once
  
  const aiScore = fastAIDetector(newText);
  let aiWarning: 'none' | 'likely' | 'detected' = 'none';
  
  if (aiScore >= 0.6) {
    aiWarning = 'detected';
  } else if (aiScore >= 0.55) {
    aiWarning = 'likely';
  }
  
  const isEducationalMoment = isPasted && aiWarning !== 'none';
  
  let educationalMessage: string | undefined;
  
  if (isEducationalMoment) {
    if (aiWarning === 'detected') {
      educationalMessage = "🎓 Learning Moment: This content appears to be AI-generated. In group study settings, sharing your own thoughts and questions helps everyone learn better. Consider rephrasing in your own words to contribute meaningfully to the discussion.";
    } else if (aiWarning === 'likely') {
      educationalMessage = "💡 Study Tip: This content might be AI-generated. Group learning works best when we share our genuine understanding and questions. Try expressing this idea in your own way!";
    }
  }
  
  return {
    isPasted,
    aiScore,
    aiWarning,
    isEducationalMoment,
    educationalMessage
  };
};

export const getEducationalTooltip = (context: 'group_chat' | 'qa_post' | 'response'): string => {
  const tooltips = {
    group_chat: "💬 Group chats work best with authentic conversations. Share your real thoughts, questions, and insights to help everyone learn together!",
    qa_post: "❓ Great questions come from genuine curiosity. Ask about what you're actually struggling with - it helps everyone learn!",
    response: "💡 The best answers come from your understanding. Share your knowledge in your own words to help others learn effectively."
  };
  
  return tooltips[context];
};
