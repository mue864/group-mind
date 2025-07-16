# Firestore Resources Structure Documentation

## Overview

This document outlines the Firestore database structure for managing group resources in the GroupMind app. Resources are stored as subcollections within each group document, allowing for scalable and organized file management.

## Database Structure

### 1. Group Document Structure

```
/groups/{groupId}
├── name: string
├── description: string
├── createdBy: string (userId)
├── members: string[] (userIds)
├── admins: string[] (userIds)
├── moderators: string[] (userIds)
├── isPrivate: boolean
├── imageUrl: string
├── createdAt: timestamp
└── resources/ (subcollection)
    └── {resourceId}
        ├── name: string
        ├── url: string (Cloudinary link)
        ├── type: string
        ├── uploadedBy: string (userId)
        ├── uploadedByUserName: string
        ├── uploadedAt: timestamp
        ├── fileSize: number (optional)
        └── groupId: string (reference back to parent group)
```

### 2. Resource Document Fields

#### Required Fields

- **name**: The display name of the file (e.g., "Math Notes.pdf")
- **url**: The Cloudinary URL where the file is stored
- **type**: File type category (PDF, Document, Image, Video, Audio, etc.)
- **uploadedBy**: User ID of the person who uploaded the file
- **uploadedByUserName**: Display name of the uploader
- **uploadedAt**: Timestamp when the file was uploaded
- **groupId**: Reference to the parent group (for easier querying)

#### Optional Fields

- **fileSize**: Size of the file in bytes (for display purposes)
- **description**: Optional description of the resource
- **tags**: Array of tags for better organization

### 3. File Type Classification

The `type` field uses the following categories:

- **PDF**: PDF documents
- **Document**: Word documents (.doc, .docx)
- **Spreadsheet**: Excel files (.xls, .xlsx)
- **Presentation**: PowerPoint files (.ppt, .pptx)
- **Image**: Image files (.jpg, .jpeg, .png, .gif)
- **Video**: Video files (.mp4, .avi, .mov)
- **Audio**: Audio files (.mp3, .wav)
- **File**: Other file types

## Implementation Notes

### 1. Subcollection Benefits

- **Scalability**: Can handle thousands of resources per group without hitting document size limits
- **Performance**: Efficient queries for group-specific resources
- **Organization**: Clear separation of resources by group
- **Real-time Updates**: Firestore listeners work seamlessly with subcollections

### 2. Query Patterns

#### Fetch Resources for a Specific Group

```javascript
// In groupResources.tsx
const resourcesRef = collection(db, "groups", groupId, "resources");
const unsubscribe = onSnapshot(resourcesRef, (snapshot) => {
  const resources = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  setResources(resources);
});
```

#### Fetch All Resources for User's Groups (Dashboard)

```javascript
// In dashboard resources tab
const fetchAllUserResources = async (userGroups) => {
  const allResources = [];

  for (const group of userGroups) {
    const resourcesRef = collection(db, "groups", group.id, "resources");
    const resourcesSnapshot = await getDocs(resourcesRef);

    const groupResources = resourcesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      groupName: group.name, // Add group context
      groupId: group.id,
    }));

    allResources.push(...groupResources);
  }

  return allResources.sort((a, b) => b.uploadedAt - a.uploadedAt);
};
```

### 3. Upload Flow

1. User selects file in ShareModal
2. File is uploaded to Cloudinary
3. On successful upload, create new document in `/groups/{groupId}/resources`
4. Update UI with new resource

### 4. Security Rules

```javascript
// Firestore security rules for resources
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /groups/{groupId}/resources/{resourceId} {
      allow read: if request.auth != null &&
        request.auth.uid in resource.data.groupId.members;
      allow create: if request.auth != null &&
        request.auth.uid in resource.data.groupId.members;
      allow delete: if request.auth != null &&
        (request.auth.uid == resource.data.uploadedBy ||
         request.auth.uid in resource.data.groupId.admins);
    }
  }
}
```

## Integration with Existing Code

### 1. Current Implementation

The `groupResources.tsx` file already implements this structure correctly:

- Uses subcollection: `collection(db, "groups", groupId.toString(), "resources")`
- Real-time updates with `onSnapshot`
- Proper resource document structure

### 2. Dashboard Resources Tab

The dashboard resources tab needs to be updated to:

- Fetch all groups the user is a member of
- Aggregate resources from all groups
- Display with group context
- Use consistent ResourceCard component

### 3. ResourceCard Component

Create a unified ResourceCard component that:

- Displays file type icon
- Shows file name, uploader, date
- Handles download/view actions
- Uses NativeWind styling for consistency

## Performance Considerations

### 1. Pagination

For groups with many resources, implement pagination:

```javascript
const resourcesQuery = query(
  collection(db, "groups", groupId, "resources"),
  orderBy("uploadedAt", "desc"),
  limit(20)
);
```

### 2. Caching

- Use Firestore offline persistence for better performance
- Implement resource caching for frequently accessed files

### 3. File Size Limits

- Set reasonable file size limits (e.g., 50MB per file)
- Implement file type restrictions if needed

## Migration Strategy

If migrating from an existing structure:

1. Create new subcollection structure
2. Migrate existing resources to new format
3. Update all queries to use new structure
4. Test thoroughly before removing old structure

## Future Enhancements

### 1. Resource Categories

- Add support for resource categories/tags
- Implement filtering by file type or category

### 2. Resource Analytics

- Track download counts
- Monitor popular resources

### 3. Advanced Search

- Implement full-text search across resource names
- Add search by uploader or date range

### 4. Resource Sharing

- Allow sharing resources between groups
- Implement resource duplication across groups
