# ShareModal Component Documentation

## Overview

The `ShareModal` component provides a user-friendly interface for uploading files to Cloudinary. It supports both images and documents, with preview functionality and proper error handling.

## Features

- **File Selection**: Choose between images and documents
- **File Preview**: See image previews or document icons before upload
- **Cloudinary Integration**: Direct upload to Cloudinary CDN
- **Progress Feedback**: Loading states and success/error messages
- **Responsive Design**: Works on both iOS and Android

## Props Interface

```typescript
interface ShareModalProps {
  visible: boolean; // Controls modal visibility
  onDismiss: () => void; // Callback when modal is dismissed
  onFileUploaded?: (fileUrl: string, fileName: string) => void; // Optional callback after successful upload
}
```

## Usage Example

```typescript
import ShareModal from "@/components/ShareModal";

const MyComponent = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleFileUploaded = (fileUrl: string, fileName: string) => {
    console.log("File uploaded:", fileName, fileUrl);
    // Handle the uploaded file (save to database, etc.)
  };

  return (
    <ShareModal
      visible={isModalVisible}
      onDismiss={() => setIsModalVisible(false)}
      onFileUploaded={handleFileUploaded}
    />
  );
};
```

## Component States

### 1. File Selection State

- **UI**: Shows two buttons (Images and Documents)
- **Functionality**: User selects file type to upload
- **Styling**: Colored backgrounds (blue for images, green for documents)

### 2. File Preview State

- **UI**: Shows file preview/info with Send/Cancel buttons
- **Functionality**: User can review file before uploading
- **Styling**: Larger modal with file preview area

### 3. Upload State

- **UI**: Shows "Uploading..." on Send button
- **Functionality**: Disables buttons during upload
- **Styling**: Grayed out buttons with loading text

## File Upload Process

### 1. File Selection

```typescript
// Image picker - supports all image formats
const imagePicker = async () => {
  const result = await DocumentPicker.getDocumentAsync({
    type: "image/*",
    copyToCacheDirectory: true,
    multiple: false,
  });
  // Sets selectedFile state with image data
};

// Document picker - supports PDF, Word, Excel, PowerPoint, etc.
const filePicker = async () => {
  const result = await DocumentPicker.getDocumentAsync({
    type: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      // ... more document types
    ],
    copyToCacheDirectory: true,
    multiple: false,
  });
  // Sets selectedFile state with document data
};
```

### 2. Cloudinary Upload

```typescript
const uploadToCloudinary = async (file: DocumentPicker.DocumentPickerAsset) => {
  // Create FormData with file
  const formData = new FormData();
  formData.append("file", {
    uri: file.uri,
    type: file.mimeType || "application/octet-stream",
    name: file.name || "file",
  } as any);

  // Add Cloudinary configuration
  formData.append("upload_preset", "groupmind_uploads");
  formData.append("folder", "groupmind-files");

  // Upload to Cloudinary
  const response = await fetch(
    "https://api.cloudinary.com/v1_1/dwb9tz5ok/auto/upload",
    { method: "POST", body: formData }
  );

  // Return secure URL
  const data = await response.json();
  return data.secure_url;
};
```

## Styling Classes

### Modal Container

- `bg-white p-6 rounded-lg w-80` - Main modal styling
- `items-center flex-col justify-center` - Centered content

### File Selection Buttons

- `bg-blue-50 p-4 rounded-lg` - Image button styling
- `bg-green-50 p-4 rounded-lg` - Document button styling

### Preview Area

- `bg-gray-50 rounded-lg p-4 mb-4` - File preview container
- `w-full h-40 rounded-lg` - Image preview dimensions

### Action Buttons

- `bg-gray-300 py-3 rounded-lg` - Cancel button
- `bg-blue-500 py-3 rounded-lg` - Send button (normal)
- `bg-gray-400 py-3 rounded-lg` - Send button (loading)

## Error Handling

### Upload Errors

- Network failures
- Invalid file types
- Cloudinary API errors
- File size limits

### User Feedback

- Alert dialogs for errors
- Loading states during upload
- Success confirmation
- Graceful fallbacks

## Cloudinary Configuration

### Required Setup

1. **Cloudinary Account**: Sign up at cloudinary.com
2. **Upload Preset**: Create unsigned upload preset named `groupmind_uploads`
3. **Cloud Name**: Use your cloud name in the upload URL
4. **Folder Structure**: Files are organized in `groupmind-files` folder

### Upload Preset Settings

- **Signing Mode**: Unsigned (for client-side uploads)
- **Folder**: groupmind-files
- **Allowed Formats**: All (auto-detection)
- **Transformation**: None (original files)

## Security Considerations

### Client-Side Uploads

- Uses unsigned uploads (no API key exposure)
- File type validation on client
- Size limits enforced by Cloudinary

### URL Security

- Cloudinary provides HTTPS URLs
- No authentication required for downloads
- CDN protection against abuse

## Performance Optimizations

### File Handling

- Files copied to cache directory
- Automatic format detection
- Cloudinary optimization on upload

### UI Performance

- Lazy loading of previews
- Debounced upload triggers
- Efficient state management

## Browser Compatibility

### Supported Platforms

- iOS (React Native)
- Android (React Native)
- Expo managed workflow
- Expo bare workflow

### File System Access

- Uses expo-document-picker
- Supports all major file types
- Handles permissions automatically

## Troubleshooting

### Common Issues

1. **Upload Fails**

   - Check Cloudinary upload preset
   - Verify network connectivity
   - Check file size limits

2. **Preview Not Showing**

   - Ensure file is valid image
   - Check file permissions
   - Verify URI format

3. **Modal Not Opening**
   - Check visible prop
   - Verify onDismiss callback
   - Check for conflicting modals

### Debug Information

- Console logs for upload progress
- Error details in catch blocks
- Network request monitoring

## Future Enhancements

### Planned Features

- Multiple file uploads
- Progress bars
- File compression
- Custom upload presets
- Drag and drop support

### Integration Opportunities

- Image editing before upload
- File type conversion
- Automatic tagging
- Analytics tracking
