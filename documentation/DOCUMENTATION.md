# GroupMind - Comprehensive Documentation

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Setup & Installation](#setup--installation)
5. [Project Structure](#project-structure)
6. [Core Components](#core-components)
7. [State Management](#state-management)
8. [Navigation](#navigation)
9. [Authentication](#authentication)
10. [Group Management](#group-management)
11. [Messaging System](#messaging-system)
12. [Video Calling](#video-calling)
13. [Recent Improvements](#recent-improvements)
14. [API Reference](#api-reference)
15. [Troubleshooting](#troubleshooting)
16. [Contributing](#contributing)

## Overview

GroupMind is a comprehensive study group management application built with React Native and Expo. It enables students to create, join, and participate in study groups with features like real-time messaging, video calling, resource sharing, and collaborative learning tools.

### Key Technologies

- **Frontend**: React Native with Expo
- **Backend**: Firebase (Firestore, Authentication, Storage)
- **Video Calling**: Agora SDK
- **State Management**: React Context API
- **Styling**: Tailwind CSS (NativeWind)
- **Navigation**: Expo Router

## Features

### Core Features

- **User Authentication**: Sign up, sign in, profile management
- **Group Management**: Create, join, leave, and manage study groups
- **Real-time Messaging**: Text messages, questions, and responses
- **Video Calling**: Audio and video calls with screen sharing
- **Resource Sharing**: File uploads and downloads
- **Scheduled Sessions**: Plan and join study sessions
- **Group Discovery**: Explore and find relevant study groups

### Advanced Features

- **Reply System**: Threaded conversations with helpful responses
- **Moderation Tools**: Admin and moderator controls
- **Offline Support**: Cached data for offline access
- **Push Notifications**: Real-time updates and alerts
- **Accessibility**: Screen reader support and keyboard navigation

## Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Native  │    │   Expo Router   │    │   Firebase      │
│   Components    │◄──►│   Navigation    │◄──►│   Backend       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Context API   │    │   Agora SDK     │    │   Firestore     │
│   State Mgmt    │    │   Video Calls   │    │   Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Data Flow

1. **User Actions** → React Native Components
2. **State Updates** → Context API
3. **API Calls** → Firebase Services
4. **Real-time Updates** → Firestore Listeners
5. **UI Updates** → Component Re-renders

## Setup & Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Firebase account
- Agora account (for video calling)

### Installation Steps

1. **Clone the repository**

```bash
git clone <repository-url>
cd group-mind
```

2. **Install dependencies**

```bash
npm install
```

3. **Environment Setup**
   Create a `.env` file with your Firebase and Agora credentials:

```env
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id

AGORA_APP_ID=your_agora_app_id
AGORA_APP_CERTIFICATE=your_agora_certificate
```

4. **Firebase Configuration**

- Create a Firebase project
- Enable Authentication, Firestore, and Storage
- Set up security rules
- Add your app to Firebase

5. **Agora Configuration**

- Create an Agora account
- Create a project
- Get your App ID and certificate

6. **Run the application**

```bash
npm start
```

## Project Structure

```
group-mind/
├── app/                          # Main application screens
│   ├── (auth)/                   # Authentication screens
│   ├── (dashboard)/              # Dashboard and main app
│   │   ├── (tabs)/               # Tab navigation
│   │   └── settings/             # Settings screens
│   ├── (groups)/                 # Group-related screens
│   └── (onboarding)/             # Onboarding flow
├── components/                   # Reusable components
├── constants/                    # App constants and strings
├── hooks/                        # Custom React hooks
├── navigation/                   # Navigation configuration
├── services/                     # External service integrations
├── store/                        # State management
├── types/                        # TypeScript type definitions
├── utils/                        # Utility functions
└── assets/                       # Images, icons, fonts
```

## Core Components

### Authentication Components

- `SignInScreen`: User login interface
- `SignUpScreen`: User registration
- `CreateProfile`: Profile setup
- `PrivacyScreen`: Privacy policy
- `TermsScreen`: Terms of service

### Dashboard Components

- `Home`: Main dashboard with posts and suggestions
- `Groups`: Group management and exploration
- `LiveSession`: Active video call interface
- `Resources`: File and resource management
- `Profile`: User profile management

### Group Components

- `GroupCard`: Individual group display
- `RandomGroupCard`: Suggested group display
- `GroupChat`: Group messaging interface
- `GroupResources`: Group file management
- `GroupSettings`: Group configuration

### UI Components

- `Button`: Reusable button component
- `InputField`: Form input component
- `MessageBubble`: Chat message display
- `PostCard`: Post display component
- `VideoCall`: Video calling interface

## State Management

### Context Providers

#### GroupContext

Manages group-related state and operations:

```typescript
interface GroupContextType {
  groups: Group[];
  allGroups: Group[];
  loading: boolean;
  user: User | null;
  joinGroup: (groupId: string) => Promise<void>;
  leaveGroup: (groupId: string) => Promise<void>;
  createGroup: (groupData: GroupData) => Promise<void>;
  // ... other methods
}
```

#### PostContext

Manages posts and messages:

```typescript
interface PostContextType {
  posts: Post[];
  postByGroup: Record<string, Post[]>;
  sendMessage: (messageData: MessageData) => Promise<void>;
  // ... other methods
}
```

#### MessagesProvider

Handles real-time messaging:

```typescript
interface MessagesContextType {
  messagesByGroup: Record<string, Message[]>;
  sendMessage: (groupId: string, text: string) => Promise<void>;
}
```

### State Flow

1. **User Actions** trigger context methods
2. **Context Methods** update Firebase
3. **Firebase Listeners** update local state
4. **Components** re-render with new data

## Navigation

### Navigation Structure

```
App Navigator
├── Auth Navigator
│   ├── Sign In
│   ├── Sign Up
│   ├── Create Profile
│   ├── Privacy
│   └── Terms
├── Dashboard Navigator
│   ├── Tab Navigator
│   │   ├── Home
│   │   ├── Groups
│   │   ├── Live Session
│   │   └── Resources
│   ├── Profile
│   └── Settings
└── Group Navigator
    ├── Group Details
    ├── Group Chat
    ├── Group Resources
    └── Group Settings
```

### Navigation Implementation

- Uses Expo Router for file-based routing
- Tab navigation for main app sections
- Stack navigation for detailed views
- Modal navigation for overlays

## Authentication

### Authentication Flow

1. **Sign Up**: Email/password registration
2. **Profile Creation**: User information setup
3. **Email Verification**: Account confirmation
4. **Sign In**: Secure login
5. **Session Management**: Persistent authentication

### Security Features

- Email verification required
- Password strength validation
- Secure token storage
- Automatic session refresh
- Logout functionality

### User Data Structure

```typescript
interface UserInfo {
  userName: string;
  profilePicture: string;
  purpose: string;
  level: string;
  joinedGroups: string[];
  canExplainToPeople: boolean;
  userID: string;
}
```

## Group Management

### Group Creation

```typescript
const createGroup = async (
  name: string,
  description: string,
  imageUrl: string | null,
  category: string,
  maxGradeLevel: string,
  onboardingText: string
) => Promise<void>;
```

### Group Operations

- **Join Group**: Add user to group members
- **Leave Group**: Remove user from group
- **Update Group**: Modify group information
- **Delete Group**: Remove group (admin only)

### Group Data Structure

```typescript
interface Group {
  id: string;
  name: string;
  description: string;
  members: string[];
  admins: string[];
  moderators: string[];
  createdBy: string;
  imageUrl: string;
  callScheduled?: {
    CallTime: Timestamp;
    callType: string;
    scheduled: boolean;
    sessionTitle: string;
  };
}
```

### Suggested Groups System

- Fetches all available groups
- Filters out user's joined groups
- Shows up to 3 suggestions
- Updates in real-time

## Messaging System

### Message Types

- **Text Messages**: Regular chat messages
- **Questions**: Q&A format messages
- **Responses**: Threaded responses to questions
- **System Messages**: Administrative notifications

### Message Features

- **Real-time Updates**: Live message synchronization
- **Threaded Conversations**: Reply system for questions
- **Helpful Responses**: Mark responses as helpful
- **File Attachments**: Image and document sharing
- **Offline Support**: Cached message history

### Message Data Structure

```typescript
interface Message {
  id: string;
  message: string;
  sentBy: string;
  timeSent: Timestamp;
  isAdmin: boolean;
  isMod: boolean;
  imageUrl?: string;
  userName: string;
  purpose: string;
  type: "message" | "question" | "response";
  parentMessageId?: string;
  isHelpful?: boolean;
  helpfulCount?: number;
  helpfulUsers?: string[];
}
```

## Video Calling

### Video Call Features

- **Audio/Video Calls**: Full multimedia support
- **Screen Sharing**: Present content to group
- **Participant Management**: View and manage participants
- **Call Controls**: Mute, camera toggle, camera switch
- **Call Invitations**: Invite others to join calls

### Video Call Implementation

- Uses Agora SDK for real-time communication
- Supports both audio and video modes
- Handles connection states and errors
- Provides call quality indicators

### Video Call Components

- `VideoCall`: Main video calling interface
- `CallInvitation`: Invitation modal
- `CallControls`: Call control buttons
- `ParticipantList`: Participant management

## Recent Improvements

### Suggested Groups Enhancement

**Problem**: New accounts weren't seeing suggested groups
**Solution**:

- Added `allGroups` state to fetch all available groups
- Implemented smart filtering to exclude joined groups
- Show multiple suggestions instead of single random group
- Added "Explore More Groups" button

### UI/UX Improvements

- Removed redundant dashboard header
- Added tab navigation to groups screen
- Improved empty states with helpful messaging
- Enhanced visual design and spacing
- Better loading states and error handling

### Performance Optimizations

- Used `useMemo` for expensive computations
- Implemented proper component memoization
- Optimized re-renders with dependency arrays
- Added loading states for better UX

### Code Quality

- Fixed TypeScript errors
- Improved type safety
- Better error handling
- Cleaner component structure

## API Reference

### Firebase Services

#### Authentication

```typescript
// Sign up
const signUp = async (email: string, password: string) =>
  Promise<UserCredential>;

// Sign in
const signIn = async (email: string, password: string) =>
  Promise<UserCredential>;

// Sign out
const signOut = async () => Promise<void>;
```

#### Firestore Operations

```typescript
// Create document
const createDoc = async (collection: string, data: any) =>
  Promise<DocumentReference>;

// Read document
const readDoc = async (collection: string, id: string) =>
  Promise<DocumentSnapshot>;

// Update document
const updateDoc = async (collection: string, id: string, data: any) =>
  Promise<void>;

// Delete document
const deleteDoc = async (collection: string, id: string) => Promise<void>;

// Query documents
const queryDocs = async (collection: string, constraints: QueryConstraint[]) =>
  Promise<QuerySnapshot>;
```

#### Real-time Listeners

```typescript
// Listen to document changes
const listenToDoc = (
  collection: string,
  id: string,
  callback: (doc: DocumentSnapshot) => void
) => Unsubscribe;

// Listen to collection changes
const listenToCollection = (
  collection: string,
  callback: (snapshot: QuerySnapshot) => void
) => Unsubscribe;
```

### Agora SDK

#### Video Call Operations

```typescript
// Join channel
const joinChannel = async (channelName: string) => Promise<void>;

// Leave channel
const leaveChannel = async () => Promise<void>;

// Enable/disable local video
const enableLocalVideo = async (enabled: boolean) => Promise<void>;

// Enable/disable local audio
const enableLocalAudio = async (enabled: boolean) => Promise<void>;

// Switch camera
const switchCamera = async () => Promise<void>;
```

## Troubleshooting

### Common Issues

#### Authentication Problems

**Issue**: User can't sign in
**Solution**:

- Check Firebase configuration
- Verify email verification
- Clear app cache and restart

#### Group Loading Issues

**Issue**: Groups not appearing
**Solution**:

- Check internet connection
- Verify Firestore rules
- Clear local storage
- Check user authentication status

#### Video Call Problems

**Issue**: Can't join video calls
**Solution**:

- Verify Agora credentials
- Check microphone/camera permissions
- Ensure stable internet connection
- Restart the app

#### Performance Issues

**Issue**: App is slow or unresponsive
**Solution**:

- Clear app cache
- Check device storage
- Update to latest version
- Restart device

### Debug Mode

Enable debug logging by setting:

```typescript
console.log("Debug mode enabled");
```

### Error Reporting

All errors are logged to console and can be viewed in development mode.

## Contributing

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Style

- Use TypeScript for all new code
- Follow React Native best practices
- Use functional components with hooks
- Implement proper error handling
- Add JSDoc comments for complex functions

### Testing

- Test on both iOS and Android
- Verify all user flows
- Check accessibility features
- Test offline functionality

### Deployment

1. Update version numbers
2. Run build tests
3. Create release notes
4. Deploy to app stores

---

## Version History

### v1.0.0 (Current)

- Initial release with core features
- Authentication and group management
- Real-time messaging
- Video calling
- Recent improvements to suggested groups

### Planned Features

- Advanced search and filtering
- Group analytics and insights
- Integration with learning management systems
- Mobile app for iOS and Android
- Web dashboard for administrators

---

**Last Updated**: December 2024
**Maintainer**: GroupMind Development Team
**License**: MIT License
