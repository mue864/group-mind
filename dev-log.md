
# 🛠️ Developer Log

## 📅 Date: [YYYY-MM-DD]

### ✅ What I worked on
- 
- 

### 🧠 What I learned
- 

### ❌ Problems I faced
- 

### 🔧 How I solved (or plan to solve) them
- 

### 🗓️ Next steps
- 


---

## 📅 Date: 2025-06-03

### ✅ What I worked on
- Fixed "group context must be used within a group provider" error in RootLayout.
- Started working on fetching posts per group using Firestore and context API.
- Started working on sending posts per group using Firestore and context API.
- Started working on retrieving group data using Firestore and context API.
- Started working on the card UI for showing recent posts
- Searched and came up with a list of images to use for group icons. saved them in `assets/images/group_icons`
- Added a method that checks for the group name from group ID in posts, if groupName is not in groupNames object, it loops through all posts to check if group name exists with the id

### 🧠 What I learned
- Providers must wrap all components that use their context, or else `useContext` breaks.
- Firestore collections like "groups/groupId/posts" create new documents for each post — makes data scalable.
- Each context I create must be consumed within the provider that created it.
- I learned that I can't render a promise directly in the render method. It's not allowed in React.
- A `Record<string, string>` is just an object with string keys and values. It's the same as saying `[key: string]: string`.
- You can import interfaces as Types `import type { Group } from "./GroupContext";`
-

### ❌ Problems I faced
- Got confused between how messages and posts should be structured.
- Wasn't sure whether to overwrite or create new documents for posts/messages.
- Was in trouble for not checking if a user exists before doing an operation i.e. fetching group data
- Was having an issue in consuming the `Messages context`, I wanted to consume it as imported, but I had to create a seperate function, fetch group data from `useGroupContext` and then pass the group info to the MessagesProvider
- `Unable to render data from usePostContext` onto the cards for recent posts. The issue I think is coming from type mismatch from the data required by the PostCard and the data I'm getting from usePostContext
- Rerendering (flickering) of the screen if I use getGroupNameFromId value in the PostCard which is a promise that gets an id, fetches group data from useGroupContext and returns the group name. `I was trying to render a promise directly in the render method. It's not allowed in React.
- Had a maximum update depth exceeded error

### 🔧 How I solved (or plan to solve) them
- Asked ChatGPT to clarify Firestore structure — learned that each post/message should be a new document.
- Will make sure `useEffect` listeners are unsubscribed properly.
- I created an AppContext that consumes the groupContext and pass the group data to the `MessagesProvider` to solve the groupContext must be used in a groupProvider only error

### 🗓️ Next steps
- Display posts by group in the UI.
- Add loading and empty state indicators.
