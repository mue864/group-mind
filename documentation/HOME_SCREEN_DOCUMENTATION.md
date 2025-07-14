# Home Screen Documentation

## Overview

The Home screen (`app/(dashboard)/(tabs)/home.tsx`) is the main dashboard of the GroupMind application. It serves as the primary interface where users can view their scheduled study sessions, recent posts from their groups, and discover new groups to join.

## Table of Contents

1. [Purpose & Functionality](#purpose--functionality)
2. [Component Structure](#component-structure)
3. [State Management](#state-management)
4. [Key Features](#key-features)
5. [Data Flow](#data-flow)
6. [UI Components](#ui-components)
7. [Recent Improvements](#recent-improvements)
8. [Performance Optimizations](#performance-optimizations)
9. [Troubleshooting](#troubleshooting)
10. [Future Enhancements](#future-enhancements)

## Purpose & Functionality

### Primary Functions

- **Dashboard Overview**: Central hub for user activity and group information
- **Scheduled Sessions**: Display upcoming study sessions with auto-scrolling carousel
- **Recent Posts**: Show latest posts from user's joined groups
- **Group Discovery**: Suggest new groups for users to join
- **Quick Navigation**: Easy access to other app sections

### User Experience

- **At-a-glance Information**: Users can quickly see what's happening in their groups
- **Discovery**: New users can find and join relevant study groups
- **Engagement**: Encourages participation through suggested content
- **Accessibility**: Screen reader support and keyboard navigation

## Component Structure

### Main Component: `Home`

```typescript
const Home: React.FC = () => {
  // State management
  // Data processing
  // UI rendering
};
```

### Key Imports

```typescript
import { useGroupContext } from "@/store/GroupContext";
import { usePostContext } from "@/store/PostContext";
import { useRouter } from "expo-router";
import { useInterval } from "@/hooks/useInterval";
```

### Component Dependencies

- **GroupContext**: Access to user's groups and all available groups
- **PostContext**: Access to posts and messages
- **Expo Router**: Navigation functionality
- **Custom Hooks**: Interval management for auto-scrolling

## State Management

### Local State

```typescript
const [groupNames, setGroupNames] = useState<Record<string, string>>({});
const [currentIndex, setCurrentIndex] = useState(0);
const [isAutoScrolling, setIsAutoScrolling] = useState(true);
const [morePosts, setMorePosts] = useState(1);
```

### Context State

```typescript
const { groups, allGroups, loading, user } = useGroupContext();
const { posts, postByGroup, getGroupNameFromId } = usePostContext();
```

### Computed State (useMemo)

```typescript
const recentPosts = useMemo(() => {
  return Object.values(postByGroup).flatMap((group) => group as Post[]);
}, [postByGroup]);

const scheduledGroups = useMemo(() => {
  return groups.filter((group) => group.callScheduled);
}, [groups]);

const suggestedGroups = useMemo(() => {
  if (!userID || !allGroups.length) return [];

  const userJoinedGroupIds = groups.map((group) => group.id);
  return allGroups
    .filter((group) => !userJoinedGroupIds.includes(group.id))
    .slice(0, 3);
}, [allGroups, groups, userID]);
```

## Key Features

### 1. Scheduled Sessions Carousel

**Purpose**: Display upcoming study sessions in an auto-scrolling carousel

**Implementation**:

```typescript
useInterval(() => {
  if (!isAutoScrolling || scheduledGroups.length <= 1) return;

  const index = (currentIndex + 1) % scheduledGroups.length;
  flatListRef.current?.scrollToIndex({ index, animated: true });
  setCurrentIndex(index);
}, 5000);
```

**Features**:

- Auto-scrolls every 5 seconds
- Pauses on user interaction
- Resumes after 7 seconds of inactivity
- Visual pagination dots
- Smooth animations

### 2. Recent Posts Section

**Purpose**: Show latest posts from user's joined groups

**Implementation**:

```typescript
const recentPosts = useMemo(() => {
  return Object.values(postByGroup).flatMap((group) => group as Post[]);
}, [postByGroup]);
```

**Features**:

- Pagination with "Show More" button
- Displays up to 6 posts initially
- Loads additional posts on demand
- Shows user information and timestamps

### 3. Suggested Groups System

**Purpose**: Help users discover new groups to join

**Implementation**:

```typescript
const suggestedGroups = useMemo(() => {
  if (!userID || !allGroups.length) return [];

  const userJoinedGroupIds = groups.map((group) => group.id);
  return allGroups
    .filter((group) => !userJoinedGroupIds.includes(group.id))
    .slice(0, 3);
}, [allGroups, groups, userID]);
```

**Features**:

- Shows up to 3 suggested groups
- Filters out groups user has already joined
- Updates in real-time
- "Explore More Groups" button for additional discovery

### 4. Auto-scrolling Management

**Purpose**: Provide smooth user experience with scheduled sessions

**Implementation**:

```typescript
const handleUserScroll = useCallback(
  (event: any) => {
    const newIndex = Math.round(
      event.nativeEvent.contentOffset.x / screenWidth
    );
    setCurrentIndex(newIndex);
    setIsAutoScrolling(false);

    setTimeout(() => {
      setIsAutoScrolling(true);
    }, 7000);
  },
  [screenWidth]
);
```

## Data Flow

### 1. Initial Load

```
User opens app → Home component mounts → Context providers load data →
Groups and posts fetched → UI renders with loading states →
Data populated → Full UI displayed
```

### 2. Real-time Updates

```
Firebase listeners → Context state updates → Home component re-renders →
UI reflects changes automatically
```

### 3. User Interactions

```
User scrolls scheduled sessions → Auto-scroll paused →
User stops interacting → Auto-scroll resumes after 7 seconds
```

### 4. Group Discovery

```
User joins group → GroupContext updates → Suggested groups recalculated →
New suggestions displayed
```

## UI Components

### Main Layout Structure

```typescript
return (
  <View className="bg-white flex-1">
    <StatusBar barStyle={"dark-content"} backgroundColor={"white"} />

    {/* Background decorations */}
    <View className="absolute bottom-0" pointerEvents="box-none">
      <Rect width={150} height={200} />
    </View>
    <View className="absolute top-0 right-0" pointerEvents="box-none">
      <Elipse width={150} height={200} />
    </View>

    {/* Main content */}
    {loading ? (
      <LoadingState />
    ) : groups.length === 0 && suggestedGroups.length === 0 ? (
      <EmptyState />
    ) : (
      <MainContent />
    )}
  </View>
);
```

### Content Sections

#### 1. Scheduled Sessions

```typescript
if (item.type === "scheduledCards") {
  return (
    <View>
      <FlatList
        ref={flatListRef}
        data={scheduledGroups}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleUserScroll}
        renderItem={renderScheduledCard}
      />
      {renderScheduledCardDots}
    </View>
  );
}
```

#### 2. Recent Posts

```typescript
if (item.type === "recentPostsHeader") {
  return (
    <View className="mx-4">
      <Text className="font-inter font-semibold text-lg mt-3">
        Recent Posts
      </Text>
    </View>
  );
}
```

#### 3. Suggested Groups

```typescript
if (item.type === "suggestedHeader") {
  return (
    <View className="mx-4">
      <Text className="font-inter font-bold text-xl mt-3">
        Groups You May be Interested In
      </Text>
      <Text className="font-inter text-gray-500 text-sm mt-1">
        Discover and join new study groups
      </Text>
    </View>
  );
}
```

#### 4. Explore More Button

```typescript
if (item.type === "exploreMoreButton") {
  return (
    <TouchableOpacity
      onPress={() => router.push("/(dashboard)/(tabs)/groups")}
      className="mx-4 mb-8 bg-blue-50 rounded-xl p-4 border border-blue-200"
    >
      <View className="flex-row items-center justify-center">
        <Ionicons name="search" size={20} color="#4169E1" />
        <Text className="text-blue-600 font-inter font-semibold text-lg ml-2">
          Explore More Groups
        </Text>
      </View>
    </TouchableOpacity>
  );
}
```

## Recent Improvements

### 1. Suggested Groups Enhancement

**Problem**: New accounts weren't seeing suggested groups
**Solution**:

- Added `allGroups` state to GroupContext
- Implemented smart filtering logic
- Show multiple suggestions instead of single random group

**Before**:

```typescript
const [suggestedGroup, setSuggestedGroup] = useState(0);

useEffect(() => {
  const getRandomId = () => {
    const randomIndex = Math.floor(Math.random() * groups.length);
    return randomIndex;
  };
  setSuggestedGroup(getRandomId());
}, [groups]);
```

**After**:

```typescript
const suggestedGroups = useMemo(() => {
  if (!userID || !allGroups.length) return [];

  const userJoinedGroupIds = groups.map((group) => group.id);
  return allGroups
    .filter((group) => !userJoinedGroupIds.includes(group.id))
    .slice(0, 3);
}, [allGroups, groups, userID]);
```

### 2. UI Improvements

- **Removed redundant header**: Eliminated settings gear and "Dashboard" title
- **Better empty states**: More helpful messaging for new users
- **Enhanced navigation**: Added "Explore More Groups" button
- **Improved spacing**: Better visual hierarchy and layout

### 3. Performance Optimizations

- **useMemo for expensive computations**: Prevents unnecessary recalculations
- **useCallback for event handlers**: Prevents unnecessary re-renders
- **Optimized re-renders**: Proper dependency arrays
- **Loading states**: Better user experience during data loading

## Performance Optimizations

### 1. Memoization

```typescript
// Memoize expensive computations
const recentPosts = useMemo(() => {
  return Object.values(postByGroup).flatMap((group) => group as Post[]);
}, [postByGroup]);

// Memoize event handlers
const handleUserScroll = useCallback(
  (event: any) => {
    // Handler implementation
  },
  [screenWidth]
);
```

### 2. FlatList Optimization

```typescript
<FlatList
  data={mainData}
  keyExtractor={(item) => item.id}
  renderItem={renderMainContent}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  initialNumToRender={5}
  windowSize={5}
  showsVerticalScrollIndicator={false}
/>
```

### 3. Conditional Rendering

```typescript
// Only render sections when data is available
if (recentPosts.length !== 0) {
  data.push({ type: "recentPostsHeader", id: "recentHeader" });
  // Add posts...
}

if (suggestedGroups.length > 0) {
  data.push({ type: "suggestedHeader", id: "suggestedHeader" });
  // Add suggested groups...
}
```

## Troubleshooting

### Common Issues

#### 1. Suggested Groups Not Appearing

**Symptoms**: New users see empty suggested groups section
**Causes**:

- `allGroups` not loaded from GroupContext
- User authentication issues
- Network connectivity problems

**Solutions**:

```typescript
// Check if allGroups is loaded
console.log("allGroups:", allGroups);
console.log("suggestedGroups:", suggestedGroups);

// Verify user authentication
console.log("user:", user);
console.log("userID:", userID);
```

#### 2. Auto-scrolling Not Working

**Symptoms**: Scheduled sessions don't auto-scroll
**Causes**:

- `scheduledGroups` array is empty
- `isAutoScrolling` state is false
- Timer interval issues

**Solutions**:

```typescript
// Check scheduled groups
console.log("scheduledGroups:", scheduledGroups);
console.log("isAutoScrolling:", isAutoScrolling);

// Verify interval is working
useEffect(() => {
  console.log("Auto-scroll interval set up");
}, []);
```

#### 3. Performance Issues

**Symptoms**: Slow scrolling or laggy UI
**Causes**:

- Too many re-renders
- Large data sets
- Memory leaks

**Solutions**:

```typescript
// Add performance monitoring
const renderCount = useRef(0);
renderCount.current += 1;
console.log("Home component rendered:", renderCount.current, "times");

// Use React DevTools Profiler
// Monitor component re-renders
```

### Debug Mode

Enable debug logging by adding:

```typescript
const DEBUG = true;

if (DEBUG) {
  console.log("Home component state:", {
    groups: groups.length,
    allGroups: allGroups.length,
    suggestedGroups: suggestedGroups.length,
    recentPosts: recentPosts.length,
    scheduledGroups: scheduledGroups.length,
  });
}
```

## Future Enhancements

### 1. Advanced Filtering

```typescript
// Add filters for suggested groups
const filteredSuggestedGroups = useMemo(() => {
  return suggestedGroups.filter((group) => {
    // Filter by user interests
    // Filter by group size
    // Filter by activity level
    return true;
  });
}, [suggestedGroups, userPreferences]);
```

### 2. Personalized Recommendations

```typescript
// Implement recommendation algorithm
const getPersonalizedSuggestions = (userProfile, allGroups) => {
  // Analyze user behavior
  // Match with group characteristics
  // Return personalized suggestions
};
```

### 3. Enhanced Analytics

```typescript
// Track user engagement
const trackUserInteraction = (action, data) => {
  // Log user interactions
  // Send analytics data
  // Improve recommendations
};
```

### 4. Offline Support

```typescript
// Cache data for offline access
const cacheHomeData = async () => {
  await AsyncStorage.setItem(
    "homeData",
    JSON.stringify({
      groups,
      posts,
      suggestedGroups,
      timestamp: Date.now(),
    })
  );
};
```

### 5. Accessibility Improvements

```typescript
// Enhanced accessibility
<TouchableOpacity
  accessibilityLabel="Join suggested group"
  accessibilityHint="Double tap to join this study group"
  accessibilityRole="button"
  onPress={handleJoinGroup}
>
  {/* Group content */}
</TouchableOpacity>
```

## Code Examples

### Complete Component Structure

```typescript
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useGroupContext } from "@/store/GroupContext";
import { usePostContext } from "@/store/PostContext";

const Home: React.FC = () => {
  // State management
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [morePosts, setMorePosts] = useState(1);

  // Context data
  const { groups, allGroups, loading, user } = useGroupContext();
  const { posts, postByGroup } = usePostContext();

  // Computed data
  const recentPosts = useMemo(() => {
    return Object.values(postByGroup).flatMap((group) => group as Post[]);
  }, [postByGroup]);

  const scheduledGroups = useMemo(() => {
    return groups.filter((group) => group.callScheduled);
  }, [groups]);

  const suggestedGroups = useMemo(() => {
    if (!user?.uid || !allGroups.length) return [];

    const userJoinedGroupIds = groups.map((group) => group.id);
    return allGroups
      .filter((group) => !userJoinedGroupIds.includes(group.id))
      .slice(0, 3);
  }, [allGroups, groups, user?.uid]);

  // Event handlers
  const handleUserScroll = useCallback(
    (event: any) => {
      const newIndex = Math.round(
        event.nativeEvent.contentOffset.x / screenWidth
      );
      setCurrentIndex(newIndex);
      setIsAutoScrolling(false);

      setTimeout(() => {
        setIsAutoScrolling(true);
      }, 7000);
    },
    [screenWidth]
  );

  // Auto-scroll effect
  useInterval(() => {
    if (!isAutoScrolling || scheduledGroups.length <= 1) return;

    const index = (currentIndex + 1) % scheduledGroups.length;
    flatListRef.current?.scrollToIndex({ index, animated: true });
    setCurrentIndex(index);
  }, 5000);

  // Render methods
  const renderMainContent = useCallback(
    ({ item }) => {
      // Render different content types
    },
    [
      /* dependencies */
    ]
  );

  const mainData = useMemo(() => {
    const data = [];

    // Add scheduled cards
    data.push({ type: "scheduledCards", id: "scheduled" });

    // Add recent posts if available
    if (recentPosts.length !== 0) {
      data.push({ type: "recentPostsHeader", id: "recentHeader" });
      // Add posts...
    }

    // Add suggested groups if available
    if (suggestedGroups.length > 0) {
      data.push({ type: "suggestedHeader", id: "suggestedHeader" });
      // Add suggested groups...
    }

    return data;
  }, [recentPosts, morePosts, suggestedGroups]);

  return (
    <View className="bg-white flex-1">
      <StatusBar barStyle={"dark-content"} backgroundColor={"white"} />

      {loading ? (
        <LoadingState />
      ) : groups.length === 0 && suggestedGroups.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={mainData}
          keyExtractor={(item) => item.id}
          renderItem={renderMainContent}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          initialNumToRender={5}
          windowSize={5}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default Home;
```

---

**Last Updated**: December 2024
**Maintainer**: GroupMind Development Team
**File**: `app/(dashboard)/(tabs)/home.tsx`
