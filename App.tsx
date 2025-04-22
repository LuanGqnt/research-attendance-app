import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './FirebaseConfig';

import Home from './screens/Home';
import Login from './screens/Login';
import Register from './screens/Register';
import MainTabs from './screens/tabs/MainTabs';
import ManageUsers from './screens/tabs/Admin/ManageUsers';
import EditUser from './screens/tabs/Admin/EditUser';

type UserData = {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  role: string;
  section: string;
  createdAt: Date;
  id: string;
};


export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
  MainTabs: undefined;
  ManageUsers: undefined;
  EditUser: { user: UserData }; 
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // If the user is logged in, set the user data
        setUser(user);
      } else {
        // If no user is logged in, reset user data to null
        setUser(null);
      }
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={user ? 'MainTabs' : 'Home'}>
        <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="ManageUsers" component={ManageUsers} options={{ headerTitle: '' }} />
        <Stack.Screen name="EditUser" component={EditUser} options={{ headerTitle: '' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}