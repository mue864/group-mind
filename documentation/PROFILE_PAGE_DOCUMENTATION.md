# Profile Page (`profile.tsx`) Documentation

## Overview

The `profile.tsx` file implements the user profile screen for the Group Mind app. It provides a modern, full-page scrollable interface where users can view and edit their profile information, see their group memberships, and log out. The page updates in real time when the user’s profile data changes in Firestore.

---

## Key Features

- **Profile Display:**

  - Shows user’s avatar, name, email, and bio.
  - Displays user stats (groups joined, posts made).
  - Lists all groups the user is a member of.

- **Edit Profile:**

  - Users can edit their username, bio, purpose, and level.
  - Avatar can be changed via a modal image picker.
  - All changes are saved to Firestore and reflected in real time.

- **Logout:**

  - Secure logout with confirmation dialog.
  - Redirects to the sign-in screen after logout.

- **Real-Time Updates:**
  - Uses Firestore’s `onSnapshot` to listen for changes to the user’s profile document.
  - UI updates instantly when profile data changes.

---

## Component Structure

- **Header:**

  - Title (“Profile”) and logout button (red icon).
  - Styled with a semi-transparent gray background and rounded corners.

- **Profile Section:**

  - Large, tappable avatar (opens avatar picker modal).
  - User’s name and email.
  - Optional bio (if set).

- **Statistics Section:**

  - Number of groups joined.
  - Number of posts made (placeholder, can be enhanced).

- **Profile Details:**

  - Username, purpose, level, and “can explain to others” status.
  - Edit button opens a modal for editing profile fields.

- **Groups Section:**

  - Lists all groups the user has joined, with group name, description, and member count.
  - If no groups, shows a friendly message and a “Browse Groups” button.

- **Edit Profile Modal:**

  - Allows editing of username, bio, purpose, and level.
  - Save and cancel actions, with loading state.

- **Avatar Picker Modal:**
  - Lets user select a new avatar from a set of images.

---

## State Management

- **`localUserInfo`:**

  - Stores the current user’s profile data, updated in real time from Firestore.

- **`editForm`:**

  - Holds the values for the edit profile modal.

- **`editModalVisible`, `avatarModalVisible`, `loading`:**
  - Control modal visibility and loading state.

---

## Data Flow

1. **On Mount:**

   - Sets up a Firestore `onSnapshot` listener for the user’s profile document.
   - Updates `localUserInfo` whenever the document changes.

2. **Editing Profile:**

   - User opens the edit modal, modifies fields, and saves.
   - Changes are written to Firestore and reflected in the UI via the real-time listener.

3. **Changing Avatar:**

   - User taps avatar, selects a new image, and it’s saved to Firestore.

4. **Logging Out:**
   - User taps logout, confirms, and is signed out and redirected.

---

## Styling & Theming

- Uses Tailwind-style class names for layout and color.
- Follows the app’s design system (primary color, rounded cards, modern fonts).
- Responsive and accessible.

---

## Extensibility & Customization

- **Add More Stats:**
  - You can enhance the stats section to show more user activity (e.g., answers, helpful votes).
- **Profile Fields:**
  - Add more fields to the profile as needed (e.g., location, interests).
- **Group Actions:**
  - Add actions to leave groups or view group details directly from the profile.

---

## Dependencies

- **Firebase Auth & Firestore:** For authentication and real-time data.
- **Expo Router:** For navigation.
- **Custom Components:** `ProfileImage`, `ImageModal`, `TextBox`, `Button`.

---

## Best Practices

- All Firestore updates are handled with error handling and loading states.
- Real-time updates ensure the UI is always in sync with the backend.
- Modals are used for editing and avatar selection for a clean UX.
- All user-facing actions (edit, logout) have confirmation and feedback.

---

## File Location

```
app/(dashboard)/profile.tsx
```
