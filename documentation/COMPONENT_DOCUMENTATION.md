# GroupMind Component Documentation

## Table of Contents

1. [Authentication Components](#authentication-components)
2. [Dashboard Components](#dashboard-components)
3. [Group Components](#group-components)
4. [UI Components](#ui-components)
5. [Video Call Components](#video-call-components)
6. [Utility Components](#utility-components)

## Authentication Components

### SignInScreen

**Location**: `app/(auth)/signInScreen.tsx`

**Purpose**: Handles user authentication with email and password.

**Props**: None (uses context for state management)

**Features**:

- Email/password input validation
- Error handling and display
- Navigation to sign up and forgot password
- Loading states during authentication

**Usage Example**:

```typescript
// Automatically rendered by navigation
<SignInScreen />
```

**Key Methods**:

- `handleSignIn()`: Processes sign-in form submission
- `validateForm()`: Validates email and password inputs
- `handleGoogleSignIn()`: Google OAuth integration

### SignUpScreen

**Location**: `app/(auth)/signUpScreen.tsx`

**Purpose**: New user registration with email verification.

**Props**: None

**Features**:

- Email/password registration
- Password strength validation
- Email verification requirement
- Terms and privacy policy acceptance

**Usage Example**:

```typescript
<SignUpScreen />
```

### CreateProfile

**Location**: `app/(auth)/createProfile.tsx`

**Purpose**: User profile setup after registration.

**Props**: None

**Features**:

- Profile picture upload
- User information collection
- Academic level selection
- Learning preferences

## Dashboard Components

### Home

**Location**: `app/(dashboard)/(tabs)/home.tsx`

**Purpose**: Main dashboard showing recent posts and suggested groups.

**Props**: None

**Features**:

- Scheduled group sessions carousel
- Recent posts from joined groups
- Suggested groups for discovery
- Auto-scrolling scheduled sessions
- "Show More" pagination

**Key State**:

```typescript
const [morePosts, setMorePosts] = useState(1);
const [currentIndex, setCurrentIndex] = useState(0);
const [isAutoScrolling, setIsAutoScrolling] = useState(true);
```

**Usage Example**:

```typescript
<Home />
```

### Groups

**Location**: `app/(dashboard)/(tabs)/groups.tsx`

**Purpose**: Group management and exploration interface.

**Props**: None

**Features**:

- Tab navigation (My Groups / Explore)
- Group creation and exploration
- FAB (Floating Action Button) for quick actions
- Empty states with helpful messaging

**Key State**:

```typescript
const [activeTab, setActiveTab] = useState<"joined" | "all">("joined");
const [open, setOpen] = useState(false);
```

## Group Components

### GroupCard

**Location**: `components/GroupCard.tsx`

**Purpose**: Displays individual group information in a card format.

**Props**:

```typescript
interface GroupCardProps {
  id: string;
  imageUrl: string;
  members: string[];
  description: string;
  name: string;
  createdBy: string;
  groupType: string;
}
```

**Features**:

- Group image display
- Member count badge
- Creator information
- Gradient overlays
- Touch interaction for navigation

**Usage Example**:

```typescript
<GroupCard
  id="group123"
  name="Study Group Alpha"
  description="Advanced mathematics study group"
  imageUrl="groupImage1"
  members={["user1", "user2", "user3"]}
  createdBy="user1"
  groupType="Mathematics"
/>
```

### RandomGroupCard

**Location**: `components/RandomGroupCard.tsx`

**Purpose**: Displays suggested groups with enhanced styling.

**Props**:

```typescript
interface GroupCardProps {
  group: {
    id: string;
    name: string;
    description?: string;
    createdBy: string;
    members: string[];
    imageUrl?: string;
    type?: string;
  };
  groupType: string;
  userId: string;
}
```

**Features**:

- Enhanced visual design
- Creator avatar and information
- Join/Manage button
- Member count display
- Gradient backgrounds

**Usage Example**:

```typescript
<RandomGroupCard
  group={suggestedGroup}
  groupType="Join"
  userId={currentUser.uid}
/>
```

### GroupChat

**Location**: `app/(settings)/(group_chat)/[groupId].tsx`

**Purpose**: Real-time group messaging interface.

**Props**: None (uses route params)

**Features**:

- Real-time message synchronization
- Message types (text, questions, responses)
- File attachments
- Offline message caching
- Message reactions

**Key Methods**:

- `sendMessage()`: Sends new messages
- `loadMessages()`: Loads message history
- `handleMessagePress()`: Handles message interactions

## UI Components

### Button

**Location**: `components/Button.tsx`

**Purpose**: Reusable button component with consistent styling.

**Props**:

```typescript
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  loading?: boolean;
}
```

**Usage Example**:

```typescript
<Button
  title="Join Group"
  onPress={handleJoinGroup}
  variant="primary"
  size="medium"
/>
```

### InputField

**Location**: `components/InputField.tsx`

**Purpose**: Form input component with validation.

**Props**:

```typescript
interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: string;
  required?: boolean;
}
```

**Usage Example**:

```typescript
<InputField
  label="Email"
  value={email}
  onChangeText={setEmail}
  placeholder="Enter your email"
  error={emailError}
  required
/>
```

### MessageBubble

**Location**: `components/MessageBubble.tsx`

**Purpose**: Displays individual chat messages.

**Props**:

```typescript
interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
}
```

**Features**:

- Different styles for own vs. others' messages
- Message type indicators
- Timestamp display
- User avatar
- Message actions (reply, helpful, etc.)

### PostCard

**Location**: `components/PostCard.tsx`

**Purpose**: Displays group posts and discussions.

**Props**:

```typescript
interface PostCardProps {
  post: Post;
  groupId: string;
  timeSent: string;
  userName: string;
  userAvatar: string;
}
```

**Features**:

- Post content display
- User information
- Timestamp
- Interaction buttons
- Image attachments

## Video Call Components

### VideoCall

**Location**: `components/VideoCall.tsx`

**Purpose**: Main video calling interface using Agora SDK.

**Props**:

```typescript
interface VideoCallProps {
  channelName: string;
  onEndCall: () => void;
  callType: "audio" | "video";
  groupName?: string;
}
```

**Features**:

- Local and remote video rendering
- Audio/video controls
- Participant management
- Connection status display
- Call invitation integration

**Key Methods**:

- `handleToggleVideo()`: Toggle camera on/off
- `handleToggleAudio()`: Toggle microphone on/off
- `handleSwitchCamera()`: Switch between cameras
- `handleEndCall()`: End the current call

**Usage Example**:

```typescript
<VideoCall
  channelName="study-group-123"
  onEndCall={handleEndCall}
  callType="video"
  groupName="Math Study Group"
/>
```

### CallInvitation

**Location**: `components/CallInvitation.tsx`

**Purpose**: Modal for inviting others to join calls.

**Props**:

```typescript
interface CallInvitationProps {
  visible: boolean;
  onClose: () => void;
  channelName: string;
  callType: "audio" | "video";
  groupName: string;
}
```

**Features**:

- Share call link
- Copy invitation text
- Call type indication
- Group information display

## Utility Components

### ActionButton

**Location**: `components/ActionButton.tsx`

**Purpose**: Call-to-action button for empty states.

**Props**: None (uses context for navigation)

**Features**:

- Consistent styling
- Navigation to groups tab
- Empty state messaging

### FloatingButton

**Location**: `components/FloatingButton.tsx`

**Purpose**: Floating action button for quick actions.

**Props**:

```typescript
interface FloatingButtonProps {
  onPress: () => void;
  icon: string;
  label?: string;
}
```

### SearchBar

**Location**: `components/SearchBar.tsx`

**Purpose**: Search functionality for groups and content.

**Props**:

```typescript
interface SearchBarProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  onSearch?: () => void;
}
```

### PaginationDots

**Location**: `components/PaginationDots.tsx`

**Purpose**: Visual indicators for carousel/slider components.

**Props**:

```typescript
interface PaginationDotsProps {
  total: number;
  current: number;
  onDotPress?: (index: number) => void;
}
```

## Component Best Practices

### 1. Props Interface

Always define TypeScript interfaces for component props:

```typescript
interface ComponentProps {
  // Required props
  title: string;
  onPress: () => void;

  // Optional props with defaults
  variant?: "primary" | "secondary";
  disabled?: boolean;
}
```

### 2. Default Props

Use default props for optional values:

```typescript
const Component: React.FC<ComponentProps> = ({
  variant = "primary",
  disabled = false,
  ...props
}) => {
  // Component implementation
};
```

### 3. Error Boundaries

Wrap components that might fail:

```typescript
<ErrorBoundary fallback={<ErrorComponent />}>
  <ComplexComponent />
</ErrorBoundary>
```

### 4. Performance Optimization

Use React.memo for expensive components:

```typescript
const ExpensiveComponent = React.memo(({ data }) => {
  // Component implementation
});
```

### 5. Accessibility

Include accessibility props:

```typescript
<TouchableOpacity
  accessibilityLabel="Join group button"
  accessibilityRole="button"
  accessibilityHint="Double tap to join this study group"
  onPress={handleJoin}
>
  <Text>Join Group</Text>
</TouchableOpacity>
```

## Component Testing

### Unit Tests

Test individual component behavior:

```typescript
describe("Button Component", () => {
  it("should render with correct title", () => {
    render(<Button title="Test Button" onPress={jest.fn()} />);
    expect(screen.getByText("Test Button")).toBeInTheDocument();
  });

  it("should call onPress when pressed", () => {
    const onPress = jest.fn();
    render(<Button title="Test" onPress={onPress} />);
    fireEvent.press(screen.getByText("Test"));
    expect(onPress).toHaveBeenCalled();
  });
});
```

### Integration Tests

Test component interactions:

```typescript
describe("GroupCard Integration", () => {
  it("should navigate to group details when pressed", () => {
    const mockNavigate = jest.fn();
    render(
      <GroupCard
        id="test-group"
        name="Test Group"
        // ... other props
      />
    );
    fireEvent.press(screen.getByText("Test Group"));
    expect(mockNavigate).toHaveBeenCalledWith("/group/test-group");
  });
});
```

---

**Last Updated**: December 2024
**Maintainer**: GroupMind Development Team
