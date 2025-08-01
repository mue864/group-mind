# GroupMind Sequence Diagrams

This directory contains PlantUML sequence diagrams that document the key user flows and system interactions in the GroupMind application.

## 📋 Diagram Overview

### 1. **Authentication Flow** (`01_authentication_flow.puml`)

- **Purpose**: Documents the complete user authentication journey
- **Covers**: App launch, onboarding, signup, profile creation, signin
- **Key Flows**:
  - New user: Welcome → Onboarding → Signup → Profile Creation → Dashboard
  - Existing user: Direct navigation to dashboard
  - Sign in process with validation

### 2. **Group Management Flow** (`02_group_management_flow.puml`)

- **Purpose**: Shows how users discover, join, and manage groups
- **Covers**: Group discovery, joining, creation, navigation, permissions
- **Key Flows**:
  - Group discovery and browsing
  - Joining groups (public/private)
  - Group onboarding process
  - Group creation with detailed setup
  - Group navigation (chat, resources, settings)

### 3. **Video Call Flow** (`03_video_call_flow.puml`)

- **Purpose**: Documents the WebRTC video calling implementation
- **Covers**: Call initiation, signaling, peer connections, media handling
- **Key Flows**:
  - Call setup and peer connection establishment
  - Real-time media streaming
  - Call controls (mute, video toggle, camera switch)
  - Scheduled calls and invitations
  - Call termination and cleanup

### 4. **Messaging & Posts Flow** (`04_messaging_posts_flow.puml`)

- **Purpose**: Shows real-time messaging and Q&A functionality
- **Covers**: Chat initialization, message sending, Q&A posts, real-time updates
- **Key Flows**:
  - Message sending with Firebase sync
  - Q&A post creation and responses
  - Real-time updates across devices
  - File sharing and reactions
  - Message moderation and deletion

### 5. **App Navigation Flow** (`05_app_navigation_flow.puml`)

- **Purpose**: Documents the overall app navigation structure
- **Covers**: Tab navigation, screen transitions, deep linking
- **Key Flows**:
  - Tab-based navigation (Home, Groups, Live Sessions, Resources)
  - Group-specific navigation
  - Settings and profile navigation
  - Modal and error handling

### 6. **Component Architecture** (`06_component_architecture.puml`)

- **Purpose**: Shows the system architecture and component relationships
- **Covers**: Frontend components, backend services, external integrations
- **Key Components**:
  - Mobile app layers (Auth, Dashboard, Group Management, Video Calling)
  - Backend services (Firebase Auth, Firestore, Storage)
  - External services (WebRTC, Agora, Media APIs)
  - State management (GroupContext, PostContext, MessagesProvider)

### 7. **Deployment Architecture** (`07_deployment_architecture.puml`)

- **Purpose**: Documents the infrastructure and deployment setup
- **Covers**: Cloud infrastructure, mobile deployment, external services
- **Key Infrastructure**:
  - Mobile devices (iOS, Android, Web)
  - Cloud infrastructure (Google Cloud/Firebase)
  - Video calling infrastructure (WebRTC, STUN/TURN, Agora)
  - Development & CI/CD pipeline
  - Monitoring & analytics

## 🛠️ How to Use These Diagrams

### Viewing the Diagrams

1. **Online PlantUML Editor**:

   - Copy the `.puml` content
   - Paste into [PlantUML Online Editor](http://www.plantuml.com/plantuml/uml/)
   - View the generated diagram

2. **VS Code Extension**:

   - Install "PlantUML" extension
   - Open `.puml` files
   - Use `Ctrl+Shift+P` → "PlantUML: Preview Current Diagram"

3. **Local PlantUML**:

   ```bash
   # Install PlantUML
   brew install plantuml  # macOS

   # Generate PNG from PUML
   plantuml -tpng 01_authentication_flow.puml
   ```

### Understanding the Diagrams

- **Actors**: Represent users or external systems
- **Participants**: Show different components/screens of the app
- **Messages**: Indicate interactions between components
- **Notes**: Provide additional context about data or processes
- **Alt/Else**: Show conditional flows (if/else scenarios)
- **Loops**: Indicate repetitive processes

### Key Symbols

```
User -> Component: Action
Component -> Database: Query/Update
Database -> Component: Response
Note over Component: Additional information
alt Condition
    Component -> Component: Action A
else Other Condition
    Component -> Component: Action B
end
loop For each item
    Component -> Component: Process item
end
```

## 📊 Technical Architecture

The diagrams reflect the actual technical implementation:

- **Frontend**: React Native with Expo Router
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Real-time**: Firebase Realtime Database & WebSocket signaling
- **Video Calls**: WebRTC with custom signaling server
- **State Management**: React Context (GroupContext, PostContext)

## 🔄 Integration Points

### Firebase Collections

- `users`: User profiles and preferences
- `groups`: Group information and membership
- `posts`: Messages and Q&A posts
- `activeCalls`: Current video call sessions
- `scheduledCalls`: Future call schedules

### Key Services

- `GroupContext`: Manages group-related state and operations
- `PostContext`: Handles posts and messaging
- `WebRTCCall`: Video calling implementation
- `Firebase Service`: Backend communication

## 🏗️ Architecture Diagrams

### Component Architecture

The component diagram shows:

- **Mobile App Layers**: Authentication, Dashboard, Group Management, Video Calling
- **Backend Services**: Firebase Auth, Firestore, Storage, Real-time DB
- **External Services**: WebRTC Signaling, STUN/TURN servers, Agora SDK
- **State Management**: Context providers and data flow
- **Development Tools**: Expo CLI, Metro bundler, TypeScript

### Deployment Architecture

The deployment diagram shows:

- **Mobile Devices**: iOS, Android, and Web platforms
- **Cloud Infrastructure**: Google Cloud Platform with Firebase services
- **Video Calling Infrastructure**: Custom WebRTC signaling server and external services
- **Development Pipeline**: Expo Build Service, GitHub Actions, CI/CD
- **Monitoring**: Firebase Analytics, Sentry error tracking

## 📝 Updating Diagrams

When making changes to the app:

1. **Identify the affected flow** in the relevant diagram
2. **Update the sequence** to reflect new interactions
3. **Add new participants** if new components are introduced
4. **Update notes** to reflect new data structures
5. **Regenerate the diagram** to verify accuracy

## 🎯 Best Practices

- **Keep diagrams focused**: Each diagram covers one main flow
- **Use clear naming**: Participant names should match actual components
- **Include error handling**: Show alternative paths for failures
- **Document data flow**: Use notes to explain what data is exchanged
- **Maintain consistency**: Use similar patterns across diagrams

## 📚 Related Documentation

- [Component Documentation](../documentation/COMPONENT_DOCUMENTATION.md)
- [WebRTC Call Documentation](../documentation/WEBRTC_CALL_DOCUMENTATION.md)
- [Group Management Documentation](../documentation/DOCUMENTATION.md)
- [Firebase Setup Guide](../documentation/DOCUMENTATION.md)

---

_These diagrams serve as living documentation and should be updated as the application evolves._
