
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
- FlatList can be used to create a sliding card using `horizontal` prop

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
- Add user and profile picture on post card
- add 


# 🛠️ Developer Log

## 📅 Date: [2025-06-09]

### ✅ What I worked on
- 
- 

### 🧠 What I learned
- When getting time from Timstamp you use `.toDate().toTimeString`
- You can loop over objects using `Object.keys.forEach()` to get the keys of the object
- To get the value of objects use `Objects.values.forEach()`
- `flatMap` flattens a nested array to become 1 i.e. [1, [1]] if [1, [1]].flatMap is used we get [1, 1]
- You do not nest `FlatList` inside a `ScrollView` 
- `SplashScreen.preventAutoHideAsync` is used to prevent the splashscreen from exiting whilst assets are still being loaded
- `SplashScreen.hideAsync()` hides the splashScreen.. make sure that all assets have loaded before hiding the splashScreen.

### ❌ Problems I faced
- Was not able to get data from an `object with keys of array of an object` i.e. {"66wJ2HZlZD26CLT6uhkF": [{"groupId": "66wJ2HZlZD26CLT6uhkF", "id": "X4PIow5wh0lake54eWSs", "post": "This is testing if it works", "timeSent": [Timestamp], "userId": "  1U73kseBwMQC5Fas1uRtzzo5mR82"}] }
- 

### 🔧 How I solved (or plan to solve) them
- I used `Object.values().forEach(value = > { value.forEach })` ... this first extracts the values from the object, and then loop over the objects again to get the the value of the nested objects.
- Then i used `flatMap` to flatten the nested arrays to become 1 array


### 🗓️ Next steps



## 📅 Date: [2025-06-14]

### ✅ What I worked on
- optimizing the home.tsx for performance when loading data
- 

### 🧠 What I learned
- You can use `useMemo` to cache loaded data so that it can not be reloaded on page rerender
- `useMemo` cannot be used inside of a `useEffect` as they save different purposes. `useEffect` is for loading `sideEffects` and `useMemo` is for caching data
- you can combine `useMemo` and `useCallback` together to optimize performance. `useMemo` for caching the data and `useCallback` for only reloading the component when the data actually changes
- A side effect in react is something that affects something outside i.e. data changing or not rendering anything to the user
- Transforming, filtering, calculating averages are not side effects and **should** not be put in a useEffect

### Quick tip

| You want to.. | Use           | Why?          |
|:-------------|:--------------:|--------------:|
| Fetch data from firebase        | `useEffect`         | Async, triggers outside React         |
| Clean, sort, filter already loaded data       | `useMemo`           | Pure data transformation         |
| Update state on button click       | `useEffect`           | Controlled by user         |
| Optimize repeated function definitions       | `useCallback`           | Boosts performance         |
| Call `setState` when something loads       | `useEffect`           | That's a side effect         |
| Avoid state for derived values       | `useMemo`           | Cleaner & more efficient        |


### ❌ Problems I faced
- Was unable to optimize async data fetching with `useMemo` since `useMemo` cannot be used alongside `async()`. `useMemo` only accepts a `syncronous` value and cannot track the `Promise` that is returned by `async`
- 

### 🔧 How I solved (or plan to solve) them
- I used `Object.values().forEach(value = > { value.forEach })` ... this first extracts the values from the object, and then loop over the objects again to get the the value of the nested objects.
- Then i used `flatMap` to flatten the nested arrays to become 1 array



## 📅 Date: [2025-06-16]

### ✅ What I worked on
- Added Group Cards to the groups page
- Integrated `react-native-paper` in the project
- Implemented floating action button (FAB) with `FAB.Group`
- Learned how to use `Provider` and `Portal` from React Native Paper

### 🧠 What I learned
- `PaperProvider` wraps the app (or screen) and provides theming and context for all React Native Paper components
- `Portal` ensures floating components like FAB or modals render above everything else and are not clipped by parent views or tab bars
- To position FAB properly, use `Portal` and place the FAB outside of scrollable containers, with absolute positioning
- Use the Paper theme’s `roundness` property to consistently control border radius on inputs and other components instead of individual `borderRadius` styles
- Active underline or outline color in inputs is controlled by the theme’s `colors.primary` or can be overridden with `activeOutlineColor` prop on `TextInput`
- For consistent theming, set colors and roundness globally in the Paper theme rather than patching individual styles
- React Native Paper’s `TextInput` supports two modes: `flat` (underline) and `outlined` (border outline)
- Customizing individual parts like border radius or active line is easier and more reliable via the theme settings

### ❌ Problems I faced
- FAB disappeared when nested inside certain views or without Portal
- Border radius customization on `TextInput` only affected some corners due to internal component structure
- Active underline/outline color wasn’t obvious how to change initially

### 🔧 How I solved (or plan to solve) them
- Wrapped FAB inside `Portal` and used absolute positioning with zIndex/elevation to keep it visible above the tab bar
- Used the Paper theme’s `roundness` property for consistent corner radius instead of inline styles
- Customized active line color by overriding `colors.primary` in the theme and using `activeOutlineColor` prop for individual inputs when needed

### 🗓️ Next steps
- Explore more React Native Paper components (Buttons, Cards, Dialogs) to build a consistent UI
- Customize theme colors for dark mode and light mode support
- Refactor existing inputs and buttons in the app to use React Native Paper components for uniform styling and behavior
- Experiment with more Portal use cases for modals and snackbars
