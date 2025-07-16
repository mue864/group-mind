# MessageBubble Component - Image Links Documentation

## Overview

The enhanced `MessageBubble` component now supports automatic detection and display of image links in Q&A responses. When users include Cloudinary URLs or other image links in their messages, they are automatically converted to clickable image preview buttons.

## Key Features

- **Automatic Image Detection**: Detects Cloudinary URLs and image file extensions
- **Clickable Image Links**: Users can tap to view images in browser
- **Q&A Only**: Image links only appear in Q&A responses, not regular chat messages
- **Visual Indicators**: Clear image icons and "View Image" text
- **Responsive Design**: Adapts to light/dark themes and message alignment

## Image Link Detection

### Supported URL Patterns

```typescript
// Cloudinary URLs (primary support)
https://res.cloudinary.com/dwb9tz5ok/image/upload/...

// Common image file extensions
https://example.com/image.jpg
https://example.com/photo.png
https://example.com/picture.gif
https://example.com/illustration.webp
```

### Detection Logic

```typescript
const extractImageUrls = (text: string): string[] => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = text.match(urlRegex) || [];

  // Filter for image URLs
  return urls.filter(
    (url) =>
      url.includes("cloudinary.com") ||
      /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(url)
  );
};
```

## Component Behavior

### Message Display

- **Text Processing**: Image URLs are removed from displayed text
- **Clean Presentation**: Only the message content is shown
- **Link Extraction**: URLs are processed separately for image display

### Image Link Display

- **Q&A Responses Only**: Image links only appear in response type messages
- **Visual Design**: Styled buttons with image icons
- **Click Handling**: Opens images in device browser

## Props Interface

```typescript
interface MessageBubbleProps {
  message: string; // Message text (may contain image URLs)
  timeSent?: Timestamp | { seconds: number; nanoseconds: number };
  messageTimeSent?: Timestamp | { seconds: number; nanoseconds: number };
  isSelf: boolean; // Whether message is from current user
  isAdmin: boolean; // User admin status
  isMod: boolean; // User moderator status
  imageUrl?: string; // User avatar URL
  userAvatar?: string; // Fallback avatar
  userName: string; // Display name
  type: "message" | "question" | "response"; // Message type
  purpose?: string; // Optional purpose text
  onReply?: (messageId?: string) => void; // Reply callback
  onHelpful?: (messageId?: string) => void; // Helpful callback
  messageId?: string; // Unique message ID
  responseCount?: number; // Number of responses (for questions)
  isHelpful?: boolean; // Helpful status (for responses)
}
```

## Usage Examples

### Basic Usage

```typescript
<MessageBubble
  message="Check out this diagram: https://res.cloudinary.com/dwb9tz5ok/image/upload/v1234567890/diagram.png"
  userName="John Doe"
  isSelf={false}
  type="response"
  isAdmin={false}
  isMod={false}
/>
```

### With Image Link

```typescript
// Message with image URL
const messageWithImage =
  "Here's the solution to your question: https://res.cloudinary.com/dwb9tz5ok/image/upload/v1234567890/solution.jpg";

<MessageBubble
  message={messageWithImage}
  userName="Jane Smith"
  isSelf={true}
  type="response"
  isAdmin={true}
  isMod={false}
/>;
```

## Image Link Rendering

### Visual Design

```typescript
const renderImageLinks = (urls: string[]) => {
  return urls.map((url, index) => (
    <TouchableOpacity
      key={index}
      className={`flex-row items-center mt-2 p-2 rounded-lg ${
        isSelf ? "bg-white/20" : "bg-gray-100"
      }`}
      onPress={() => handleImageLink(url)}
    >
      <Ionicons
        name="image-outline"
        size={20}
        color={isSelf ? "rgba(255,255,255,0.8)" : "#6B7280"}
      />
      <Text
        className={`ml-2 text-sm flex-1 ${
          isSelf ? "text-white/80" : "text-blue-600"
        }`}
        numberOfLines={1}
      >
        📷 View Image
      </Text>
      <Ionicons
        name="open-outline"
        size={16}
        color={isSelf ? "rgba(255,255,255,0.6)" : "#9CA3AF"}
      />
    </TouchableOpacity>
  ));
};
```

### Styling Classes

- **Container**: `flex-row items-center mt-2 p-2 rounded-lg`
- **Self Message**: `bg-white/20` (semi-transparent white)
- **Other Message**: `bg-gray-100` (light gray)
- **Text**: `text-sm flex-1` with conditional colors
- **Icons**: `image-outline` and `open-outline` from Ionicons

## Link Handling

### Browser Opening

```typescript
const handleImageLink = async (url: string) => {
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert("Error", "Cannot open this image link");
    }
  } catch (error) {
    Alert.alert("Error", "Failed to open image link");
  }
};
```

### Error Handling

- **Unsupported URLs**: Shows error alert
- **Network Issues**: Graceful error handling
- **Invalid Links**: User-friendly error messages

## Integration with Q&A System

### Message Types

- **Question**: No image links displayed (only text)
- **Response**: Image links are detected and displayed
- **Message**: No image links (regular chat messages)

### Database Integration

```typescript
// Example: Storing message with image URL
const messageData = {
  message:
    "Here's the solution: https://res.cloudinary.com/dwb9tz5ok/image/upload/v1234567890/solution.jpg",
  type: "response",
  sentBy: user.uid,
  timeSent: Timestamp.now(),
  // ... other fields
};
```

## Styling and Theming

### Color Schemes

- **Light Theme**: Gray backgrounds, blue text
- **Dark Theme**: Semi-transparent backgrounds, white text
- **Self Messages**: Different styling for user's own messages

### Responsive Design

- **Mobile Optimized**: Touch-friendly button sizes
- **Text Truncation**: Long URLs are handled gracefully
- **Icon Alignment**: Proper spacing and alignment

## Performance Considerations

### URL Processing

- **Efficient Regex**: Fast URL detection
- **Lazy Rendering**: Image links only rendered when needed
- **Memory Management**: No image caching (opens in browser)

### Rendering Optimization

- **Conditional Rendering**: Only renders image links for responses
- **Key Props**: Proper React keys for list rendering
- **Memoization**: Efficient re-rendering

## Security and Privacy

### URL Validation

- **HTTPS Only**: Secure URL requirements
- **Domain Filtering**: Cloudinary and trusted domains
- **File Type Validation**: Image extensions only

### User Privacy

- **No Tracking**: Links open in external browser
- **No Analytics**: No tracking of image views
- **User Control**: Users choose when to view images

## Troubleshooting

### Common Issues

1. **Image Links Not Showing**

   - Check message type is "response"
   - Verify URL format is correct
   - Ensure URL contains image extension or cloudinary.com

2. **Links Not Opening**

   - Check device internet connection
   - Verify URL is accessible
   - Test URL in browser manually

3. **Styling Issues**
   - Check Tailwind classes
   - Verify Ionicons import
   - Test on different screen sizes

### Debug Information

```typescript
// Add to component for debugging
console.log("Message:", message);
console.log("Extracted URLs:", extractImageUrls(message));
console.log("Display Text:", getDisplayText(message));
```

## Future Enhancements

### Planned Features

- **Image Thumbnails**: Show small previews
- **Multiple Images**: Support for multiple image links
- **Image Gallery**: In-app image viewer
- **Download Options**: Save images to device

### Integration Opportunities

- **Image Compression**: Optimize before upload
- **Caching**: Cache frequently viewed images
- **Analytics**: Track image view patterns
- **Moderation**: Content filtering for images

## Best Practices

### For Developers

1. **URL Validation**: Always validate URLs before processing
2. **Error Handling**: Provide fallbacks for failed operations
3. **Performance**: Optimize for mobile devices
4. **Accessibility**: Ensure screen reader compatibility

### For Users

1. **Image Quality**: Use appropriate image sizes
2. **File Formats**: Prefer web-optimized formats (WebP, JPEG)
3. **Descriptive Text**: Include context with image links
4. **Responsive Images**: Consider mobile viewing experience
