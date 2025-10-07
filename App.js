import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';

import SemesterScreen from './src/screens/SemesterScreen';
import SubjectScreen from './src/screens/SubjectScreen';
import TaskScreen from './src/screens/TaskScreen';

const Stack = createStackNavigator();

const theme = {
  colors: {
    primary: '#6200ee',
    accent: '#03dac6',
    background: '#f5f5f5',
    surface: '#ffffff',
    text: '#000000',
  },
};

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <StatusBar style="auto" />
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
            options={{ title: 'Select Semester' }}
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
