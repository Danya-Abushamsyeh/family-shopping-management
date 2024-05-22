import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import TabNavigation from './Navigations/TabNavigation';
import ProfileScreen from './screens/ProfileScreen';
import EditProfile from './screens/EditProfile';
import Signup from './screens/Signup';
import ItemsScreen from './screens/ItemsScreen';
import ShoppingList from './screens/ShoppingList'; 

const Stack = createNativeStackNavigator();

const AuthNavigator = () => (
  <AuthStack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Signup" component={Signup} />
    {/* <AuthStack.Screen name='Items' component={ItemsScreen} options={{ headerShown: false}}/> */}

  </AuthStack.Navigator>
);

const App = () => {
  return (
    <NavigationContainer >
     <Stack.Navigator  initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="signup" component={Signup} />
      <Stack.Screen name="tab" component={TabNavigation} />

    </Stack.Navigator>
    </NavigationContainer>
  );
};


export default App;
