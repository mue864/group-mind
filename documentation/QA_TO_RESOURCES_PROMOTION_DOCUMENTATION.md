# Q&A to Resources Promotion Documentation

## Overview

This document outlines how to implement a "Save to Resources" feature that allows users to promote files (images, documents) from Q&A posts to the group's main resources collection. This bridges the gap between contextual Q&A attachments and the organized resources system.

---

## 1. Feature Purpose

- Allow users to save important files from Q&A discussions to the group's resources
- Prevent valuable files from being buried in old Q&A threads
- Maintain context while improving discoverability
- Give users control over what becomes a "group resource"

---

## 2. Implementation Strategy

### **2.1 Data Flow**

1. User views a Q&A post with an attachment
2. User clicks "Save to Resources" button
3. System copies file metadata to `/groups/{groupId}/resources`
4. File appears in group resources tab and dashboard
5. User gets confirmation feedback

### **2.2 File Metadata Structure**

```typescript
interface QAAttachment {
  url: string; // Cloudinary URL
  fileName: string; // Original file name
  fileType: string; // PDF, Image, etc.
  uploadedAt: Timestamp; // When it was uploaded to Q&A
  uploadedBy: string; // User ID who uploaded to Q&A
  uploadedByUserName: string; // Display name
  qaPostId: string; // Reference to original Q&A post
  qaContext: string; // Brief context (e.g., "From Q&A: How to solve this problem?")
}
```

---

## 3. Implementation Steps

### **Step 1: Update Q&A Post Interface**

```typescript
// In your Q&A post interface
interface QAPost {
  id: string;
  message: string;
  timeSent: Timestamp;
  // ... existing fields
  attachments?: {
    url: string;
    fileName: string;
    fileType: string;
    uploadedAt: Timestamp;
    uploadedBy: string;
    uploadedByUserName: string;
  }[];
}
```

### **Step 2: Create Promotion Function**

```typescript
// In GroupContext or a separate service
const promoteQAAttachmentToResources = async ({
  groupId,
  attachment,
  qaPostId,
  qaContext,
}: {
  groupId: string;
  attachment: QAAttachment;
  qaPostId: string;
  qaContext: string;
}) => {
  try {
    await saveGroupResource({
      groupId,
      name: attachment.fileName,
      url: attachment.url,
      type: attachment.fileType,
      uploadedBy: attachment.uploadedBy,
      uploadedByUserName: attachment.uploadedByUserName,
      uploadedAt: attachment.uploadedAt,
      fileSize: 0, // Can be calculated if needed
      // Additional metadata for tracking
      promotedFrom: "qa",
      qaPostId,
      qaContext,
    });

    Toast.show({
      type: "success",
      text1: "File saved to resources!",
      text2: "The file is now available in the group resources.",
    });
  } catch (error) {
    console.error("Error promoting file to resources:", error);
    Toast.show({
      type: "error",
      text1: "Failed to save file",
      text2: "Please try again.",
    });
  }
};
```

### **Step 3: Update Q&A Post Component**

```typescript
// In your Q&A post component (e.g., QApostCard.tsx)
import { useGroupContext } from "@/store/GroupContext";
import { Ionicons } from "@expo/vector-icons";

const QApostCard = ({ post, groupId }) => {
  const { promoteQAAttachmentToResources } = useGroupContext();

  const handleSaveToResources = async (attachment) => {
    await promoteQAAttachmentToResources({
      groupId,
      attachment,
      qaPostId: post.id,
      qaContext: `From Q&A: ${post.message.substring(0, 50)}...`,
    });
  };

  return (
    <View className="bg-white rounded-lg p-4 mb-3">
      {/* Existing Q&A post content */}
      <Text className="text-gray-800 mb-2">{post.message}</Text>

      {/* Attachments section */}
      {post.attachments && post.attachments.length > 0 && (
        <View className="mt-3">
          <Text className="text-sm font-semibold text-gray-600 mb-2">
            Attachments:
          </Text>
          {post.attachments.map((attachment, index) => (
            <View
              key={index}
              className="flex-row items-center justify-between bg-gray-50 p-3 rounded-lg mb-2"
            >
              <View className="flex-row items-center flex-1">
                <Ionicons
                  name={getFileIcon(attachment.fileType)}
                  size={20}
                  color="#6B7280"
                />
                <Text className="ml-2 text-sm text-gray-700 flex-1">
                  {attachment.fileName}
                </Text>
              </View>

              <View className="flex-row">
                {/* Download button */}
                <TouchableOpacity
                  onPress={() =>
                    handleDownload(attachment.url, attachment.fileName)
                  }
                  className="mr-2 p-2"
                >
                  <Ionicons name="download-outline" size={16} color="#2563EB" />
                </TouchableOpacity>

                {/* Save to Resources button */}
                <TouchableOpacity
                  onPress={() => handleSaveToResources(attachment)}
                  className="p-2 bg-blue-50 rounded-lg"
                >
                  <Ionicons name="bookmark-outline" size={16} color="#2563EB" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};
```

### **Step 4: Update Resources Display**

```typescript
// In your resources screens, show promotion context
const ResourceCard = ({ resource }) => {
  return (
    <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
      <View className="flex-row items-center mb-3">
        <Ionicons name={getFileIcon(resource.type)} size={24} color="#2563EB" />
        <View className="flex-1 ml-3">
          <Text className="text-base font-poppins-semiBold text-gray-800 mb-1">
            {resource.name}
          </Text>
          <Text className="text-sm font-inter text-gray-600">
            {resource.type} • {resource.uploadedByUserName}
          </Text>

          {/* Show promotion context if applicable */}
          {resource.promotedFrom === "qa" && (
            <View className="mt-1 flex-row items-center">
              <Ionicons name="chatbubble-outline" size={12} color="#9CA3AF" />
              <Text className="text-xs font-inter text-gray-500 ml-1">
                Promoted from Q&A
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Rest of the card */}
    </View>
  );
};
```

---

## 4. UI/UX Considerations

### **4.1 Button Placement**

- Place "Save to Resources" button next to each attachment
- Use a bookmark icon to indicate "saving for later"
- Make it visually distinct from download button

### **4.2 User Feedback**

- Show success toast when file is promoted
- Show error toast if promotion fails
- Consider showing a "Saved" state for already promoted files

### **4.3 Visual Indicators**

- Show promotion context in resources list
- Use different styling for promoted vs. directly uploaded files
- Add badges or icons to distinguish file sources

---

## 5. Advanced Features

### **5.1 Duplicate Prevention**

```typescript
const checkIfAlreadyPromoted = async (
  groupId: string,
  qaPostId: string,
  fileName: string
) => {
  const resourcesSnapshot = await getDocs(
    collection(db, "groups", groupId, "resources")
  );

  return resourcesSnapshot.docs.some((doc) => {
    const data = doc.data();
    return data.qaPostId === qaPostId && data.name === fileName;
  });
};
```

### **5.2 Bulk Promotion**

```typescript
const promoteAllAttachments = async (post) => {
  if (!post.attachments) return;

  for (const attachment of post.attachments) {
    await promoteQAAttachmentToResources({
      groupId,
      attachment,
      qaPostId: post.id,
      qaContext: `From Q&A: ${post.message.substring(0, 50)}...`,
    });
  }
};
```

### **5.3 Permission Control**

```typescript
const canPromoteToResources = (userRole: string) => {
  return ["admin", "moderator", "groupOwner"].includes(userRole);
};
```

---

## 6. Best Practices

### **6.1 Data Integrity**

- Always include original Q&A context when promoting
- Maintain audit trail of promotion actions
- Handle duplicate promotions gracefully

### **6.2 Performance**

- Use optimistic updates for better UX
- Batch operations for bulk promotions
- Cache promotion status to avoid repeated checks

### **6.3 User Experience**

- Provide clear visual feedback
- Allow users to undo promotions (if needed)
- Show promotion history in user profile

---

## 7. Error Handling

```typescript
const handlePromotionError = (error: any) => {
  if (error.code === "permission-denied") {
    Toast.show({
      type: "error",
      text1: "Permission denied",
      text2: "You don't have permission to save files to resources.",
    });
  } else if (error.code === "already-exists") {
    Toast.show({
      type: "info",
      text1: "File already saved",
      text2: "This file is already in the group resources.",
    });
  } else {
    Toast.show({
      type: "error",
      text1: "Failed to save file",
      text2: "Please try again later.",
    });
  }
};
```

---

## 8. Testing Scenarios

1. **Basic Promotion:** User promotes a single file from Q&A
2. **Duplicate Prevention:** Try to promote the same file twice
3. **Permission Testing:** Test with different user roles
4. **Network Issues:** Test behavior when offline
5. **Large Files:** Test with files of various sizes
6. **Bulk Operations:** Test promoting multiple files at once

---

## 9. Future Enhancements

- **Smart Suggestions:** AI-powered suggestions for which files to promote
- **Promotion Analytics:** Track which files get promoted most
- **Auto-Promotion Rules:** Automatically promote files based on criteria
- **Resource Categories:** Organize promoted files by topic/type
- **Promotion Workflow:** Multi-step approval process for important files

---

## 10. References

- [Firestore Subcollections](https://firebase.google.com/docs/firestore/data-model)
- [React Native Toast Message](https://github.com/calintamas/react-native-toast-message)
- [Expo Icons](https://docs.expo.dev/guides/icons/)

---

# End of Q&A to Resources Promotion Documentation
