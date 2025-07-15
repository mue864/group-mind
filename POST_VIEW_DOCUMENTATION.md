# Q&A Post View Documentation

## Overview

The Q&A Post View screen (`app/(settings)/(create_post)/(view_post)/[postId].tsx`) is a comprehensive interface for viewing and interacting with individual Q&A posts. It displays the original question along with all responses, supports real-time updates, and provides interactive features like replying and marking responses as helpful.

## Features

### Core Functionality

- **Post Display**: Shows the original question with metadata (author, time, content)
- **Response Threading**: Displays all responses in chronological order
- **Real-time Updates**: Live synchronization with Firestore for new responses
- **Reply System**: Users can reply to the original question
- **Helpful Marking**: Users can mark responses as helpful
- **Keyboard Handling**: Optimized keyboard behavior for mobile input

### Interactive Elements

- **Message Bubbles**: Individual message components with user info and actions
- **Reply Interface**: Dedicated reply input with cancel functionality
- **Helpful System**: Toggle helpful status on responses
- **Auto-scroll**: Automatic scrolling to bottom on new messages and keyboard appearance

## Data Structure

### TimelineMessage Type

```typescript
type TimelineMessage = {
  id: string;
  message: string;
  sentBy: string;
  timeSent: Timestamp;
  isSelf: boolean;
  isAdmin: boolean;
  isMod: boolean;
  imageUrl: string | undefined;
  type: "question" | "response";
  userName: string;
  purpose: string;
};
```

### QaResponses Type

```typescript
type QaResponses = {
  message: string;
  sentBy: string;
  timeSent: Timestamp;
  type: string;
  isAdmin: boolean;
  isMod: boolean;
  imageUrl: string | undefined;
  userName: string;
  purpose: string;
  isHelpful?: boolean;
  helpfulCount?: number;
  helpfulUsers?: string[];
  responseId?: string;
};
```

## Component Architecture

### Main Components

1. **ViewPost**: Main component orchestrating the entire view
2. **MessageBubble**: Individual message display component
3. **KeyboardAwareScrollView**: Handles scroll behavior and keyboard interactions
4. **TextInput**: Message input with real-time validation

### State Management

- **timeline**: Array of TimelineMessage objects for display
- **qa_Responses**: Array of QaResponses from Firestore
- **messagesByID**: Cached messages from AsyncStorage
- **keyboardVisible**: Tracks keyboard state for UI adjustments
- **replyingTo**: Tracks reply state and target message
- **showReplyInput**: Controls reply interface visibility

## Data Flow

### Initial Load

1. **AsyncStorage Retrieval**: Load cached messages for the group
2. **Firestore Subscription**: Set up real-time listener for responses
3. **Data Combination**: Merge original post with responses
4. **Timeline Creation**: Create TimelineMessage objects for display

### Real-time Updates

1. **Firestore Listener**: `onSnapshot` for qa_responses collection
2. **Data Processing**: Transform Firestore data to QaResponses
3. **Timeline Update**: Rebuild timeline with new responses
4. **UI Refresh**: Re-render with updated data

### Message Sending

1. **Input Validation**: Check message content and user state
2. **Firestore Write**: Add response to qa_responses collection
3. **Response Count Update**: Update parent post's responseFrom array
4. **UI Update**: Clear input and show success state

## Keyboard Handling

### Implementation

- **KeyboardAvoidingView**: Platform-specific keyboard behavior
- **KeyboardAwareScrollView**: Automatic scroll adjustments
- **Keyboard Listeners**: Manual keyboard state tracking
- **Auto-scroll**: Programmatic scrolling to bottom

### Configuration

```typescript
// iOS Configuration
keyboardVerticalOffset: 120;
extraScrollHeight: 150;
extraHeight: 150;

// Android Configuration
keyboardVerticalOffset: 30;
extraScrollHeight: 50;
extraHeight: 100;
```

## Response Count Logic

### Smart Filtering

The response count excludes:

1. **Original Poster's Messages**: Follow-up questions from the question author
2. **Question Messages**: Only counts actual responses, not follow-up questions
3. **Self-Responses**: Messages from the current user

### Implementation

```typescript
responseCount={
  msg.type === "question"
    ? qa_Responses.filter(
        (response) =>
          response.sentBy !== messagesByID[postId.toString()]?.sentBy &&
          response.type === "response" &&
          !response.message.toLowerCase().includes("?")
      ).length
    : 0
}
```

## Error Handling

### Network Issues

- **Offline Support**: Cached data from AsyncStorage
- **Graceful Degradation**: UI remains functional without real-time updates
- **Error Logging**: Console logging for debugging

### Data Validation

- **Null Checks**: Comprehensive null/undefined checking
- **Type Safety**: TypeScript interfaces for data integrity
- **Fallback Values**: Default values for missing data

## Performance Optimizations

### Caching Strategy

- **AsyncStorage**: Local caching of messages
- **Efficient Updates**: Minimal re-renders with proper state management
- **Memory Management**: Cleanup of listeners and timers

### Rendering Optimization

- **Key Props**: Unique keys for list items
- **Memoization**: useMemo for expensive calculations
- **Conditional Rendering**: Only render visible components

## Accessibility Features

### Screen Reader Support

- **Semantic Labels**: Proper accessibility labels
- **Navigation**: Logical tab order
- **Content Description**: Descriptive text for interactive elements

### Keyboard Navigation

- **Focus Management**: Proper focus handling
- **Keyboard Shortcuts**: Send message with Enter key
- **Escape Functionality**: Cancel reply with escape

## Security Considerations

### Data Validation

- **Input Sanitization**: Clean user input before storage
- **Permission Checks**: Verify user permissions for actions
- **Rate Limiting**: Prevent spam through UI state management

### Authentication

- **User Verification**: Check authentication state before actions
- **Session Management**: Handle expired sessions gracefully
- **Permission-Based UI**: Show/hide features based on user role

## Testing Considerations

### Unit Tests

- **Component Rendering**: Test component with various data states
- **User Interactions**: Test reply, helpful marking, and navigation
- **Error Scenarios**: Test offline mode and error states

### Integration Tests

- **Firestore Integration**: Test real-time updates and data persistence
- **Keyboard Behavior**: Test keyboard interactions across platforms
- **Navigation Flow**: Test navigation to and from the screen

## Known Limitations

### Platform Differences

- **iOS vs Android**: Different keyboard behaviors and offsets
- **Screen Sizes**: Responsive design challenges on various devices
- **Performance**: Different performance characteristics across devices

### Feature Limitations

- **File Attachments**: Limited to text-based messages
- **Rich Text**: No formatting support in messages
- **Media Support**: No image/video embedding in responses

## Future Enhancements

### Planned Features

- **Rich Text Support**: Markdown or basic formatting
- **File Attachments**: Image and document sharing
- **Message Editing**: Edit sent messages
- **Message Deletion**: Remove own messages
- **Advanced Search**: Search within responses
- **Message Reactions**: Emoji reactions to responses

### Technical Improvements

- **Pagination**: Load responses in chunks for better performance
- **Optimistic Updates**: Immediate UI updates before server confirmation
- **Offline Queue**: Queue messages for sending when online
- **Push Notifications**: Notify users of new responses

## Troubleshooting

### Common Issues

1. **Keyboard Overlap**: Adjust keyboardVerticalOffset values
2. **Auto-scroll Issues**: Check KeyboardAwareScrollView configuration
3. **Response Count Errors**: Verify filtering logic and data structure
4. **Real-time Sync Issues**: Check Firestore listener setup

### Debug Tools

- **Console Logging**: Extensive logging for data flow debugging
- **React DevTools**: Component state inspection
- **Firebase Console**: Real-time database monitoring
- **Network Tab**: Monitor API calls and responses

## Dependencies

### Core Dependencies

- **React Native**: Core framework
- **Expo Router**: Navigation
- **Firebase/Firestore**: Backend database
- **AsyncStorage**: Local caching
- **React Native Paper**: UI components

### UI Dependencies

- **KeyboardAwareScrollView**: Keyboard handling
- **React Native Reanimated**: Animations
- **Ionicons**: Icons

## Code Quality

### Standards

- **TypeScript**: Full type safety
- **ESLint**: Code linting and formatting
- **Component Structure**: Consistent component organization
- **Error Boundaries**: Graceful error handling

### Best Practices

- **Separation of Concerns**: Clear separation between UI and logic
- **Reusable Components**: Modular component design
- **Performance Monitoring**: Regular performance audits
- **Documentation**: Comprehensive inline documentation
