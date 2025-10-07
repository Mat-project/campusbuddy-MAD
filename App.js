/**
 * Campus Buddy - Semester Sub Task Manager
 * A React Native + Expo mobile app for managing academic tasks across semesters
 */

import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';

// Import screen components
import SemesterScreen from './src/screens/SemesterScreen';
import SubjectScreen from './src/screens/SubjectScreen';
import TaskScreen from './src/screens/TaskScreen';

const Stack = createStackNavigator();

// Custom theme configuration for Campus Buddy
// Extends the default Material Design 3 Light Theme with custom colors
const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6C63FF',
    primaryContainer: '#E8E6FF',
    secondary: '#6C63FF',
    secondaryContainer: '#E8E6FF',
    background: '#F9FAFB',
    surface: '#FFFFFF',
    surfaceVariant: '#F9FAFB',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onBackground: '#1E293B',
    onSurface: '#1E293B',
  },
};

/**
 * Main App Component
 * Sets up navigation and theme for the entire application
 */
export default function App() {
  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <StatusBar style="auto" />
        {/* Stack Navigator for hierarchical navigation */}
        <Stack.Navigator
          initialRouteName="Semesters"
          screenOptions={{
            headerStyle: {
              backgroundColor: theme.colors.primary,
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen 
            name="Semesters" 
            component={SemesterScreen}
            options={{ title: 'Campus Buddy - Semesters' }}
          />
          <Stack.Screen 
            name="Subjects" 
            component={SubjectScreen}
            options={({ route }) => ({ title: route.params.semester })}
          />
          <Stack.Screen 
            name="Tasks" 
            component={TaskScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
