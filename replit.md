# Overview

This is a React Native mobile application built with Expo called "Semester Sub Task Manager Buddy" that helps students manage academic tasks across multiple semesters (Semester 1 through 8). The app provides a hierarchical navigation structure where users can select a semester, view subjects within that semester, and manage tasks for each subject. It's designed as a cross-platform solution targeting iOS, Android, and web platforms.

# Recent Changes

**October 7, 2025:**
- Initial implementation of Semester Sub Task Manager Buddy
- Created complete app structure with semester selection, subject management, and task tracking
- Implemented AsyncStorage for local data persistence
- Added duplicate subject name validation with user-friendly error messages
- Set up Expo web server workflow running on port 5000

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Framework Choice: React Native with Expo**
- Uses Expo SDK (~54.0.12) for managed workflow and cross-platform deployment
- Enables development for iOS, Android, and web from a single codebase
- New Architecture enabled for improved performance
- Simplifies deployment and eliminates need for native build configuration

**Navigation Pattern: Stack-based Navigation**
- Implements `@react-navigation/stack` for hierarchical screen flow
- Three-level navigation hierarchy: Semesters → Subjects → Tasks
- Each screen passes context (semester, subject, colorTag) through route parameters
- Uses `useFocusEffect` hook to refresh data when screens regain focus

**UI Component Library: React Native Paper**
- Material Design components for consistent cross-platform UI
- Custom theme with primary color (#6200ee) and accent color (#03dac6)
- Provides Cards, FABs, Dialogs, TextInputs, and other pre-styled components
- Eliminates need for extensive custom styling

**State Management: Local Component State**
- Uses React hooks (useState, useEffect, useCallback) for state management
- No global state management library (Redux, MobX, etc.)
- Data flows unidirectionally from storage → component state → UI
- Each screen independently manages its own state and data loading

## Data Storage

**Storage Solution: AsyncStorage**
- Uses `@react-native-async-storage/async-storage` for persistent local storage
- Key-value store pattern with single storage key (`@semester_task_manager`)
- All data stored as stringified JSON under one root object
- No remote database or cloud sync capabilities

**Data Structure:**
```
{
  "Semester 1": {
    "Subject Name": {
      "tasks": [...],
      "colorTag": "#6200ee"
    }
  },
  "Semester 2": { ... }
}
```

**Storage Utilities Architecture:**
- Centralized storage functions in `src/utils/storage.js`
- Provides CRUD operations: load, save, add, delete, update, toggle
- Handles JSON parsing/serialization and error handling
- All screens interact with storage through these utility functions

**Pros:**
- Simple implementation without backend infrastructure
- Works offline by default
- Fast read/write operations for small datasets
- No authentication or network dependencies

**Cons:**
- Data limited to single device (no cross-device sync)
- No data backup or recovery mechanism
- Storage capacity limitations on mobile devices
- Data lost if app is uninstalled

## Feature Architecture

**Date Management:**
- Uses `@react-native-community/datetimepicker` for native date selection
- Platform-specific implementations (iOS/Android have different UIs)
- Dates stored as serializable values in task objects
- Date picker visibility controlled through component state

**Task Completion Tracking:**
- Checkbox-based completion toggle using React Native Paper
- Completion state stored as boolean in task object
- Visual feedback through checked/unchecked state
- Dedicated toggle function in storage utilities

**Subject Color Coding:**
- Predefined color palette (8 colors) for subject identification
- Color stored as hex string with each subject
- Passed through navigation params to maintain context
- Used for visual differentiation in task screens

**Form Handling:**
- Dialog-based forms for adding/editing subjects and tasks
- Reuses same dialog component for add and edit modes
- Form state managed separately from list data
- Validation and snackbar notifications for user feedback

# External Dependencies

**React Native Ecosystem:**
- `react-native-gesture-handler` - Touch gesture system for navigation
- `react-native-reanimated` - Animation library for smooth transitions
- `react-native-safe-area-context` - Handles device notches and safe areas
- `react-native-screens` - Native screen optimization for navigation
- `react-native-vector-icons` - Icon set for UI components

**Platform Support:**
- `react-native-web` - Enables web platform deployment
- `react-dom` - React DOM rendering for web
- Platform-specific configurations in app.json for iOS/Android

**No External Services:**
- No backend API integration
- No authentication service
- No cloud storage or database
- No analytics or crash reporting
- No push notifications

**Development Tools:**
- Expo CLI for development server and builds
- Metro bundler for JavaScript bundling
- No additional build tools or preprocessors required