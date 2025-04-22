import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Dashboard from './Dashboard';
import QRScreen from './QR/QRScreen';
import Profile from './Profile';
import AdminView from './Admin/AdminView';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../FirebaseConfig';

const Tab = createBottomTabNavigator();
type Props = NativeStackScreenProps<RootStackParamList, 'MainTabs'>;

type UserData = {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  role: string;
  section: string;
  createdAt: Date;
};

const MainTabs: React.FC<Props> = ({ navigation }) => {
  const [user, setUser] = useState<UserData | null>(null);
  
    useEffect(() => {
      const fetchUserData = async () => {
        const uid = auth.currentUser?.uid;
  
        if(uid) {
          try {
            const docRef = doc(db, 'users', uid);
            const docSnap = await getDoc(docRef);
  
            if(docSnap.exists()) {
              setUser(docSnap.data() as UserData);
            }
          } catch (error) {
            console.error('Error fetching user data ' + error);
          }
        }
      }
  
      fetchUserData();
    } , []);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName = '';

          if (route.name === 'Dashboard') iconName = 'home';
          else if (route.name === 'QR') iconName = 'qr-code';
          else if (route.name === 'Admin') iconName = 'hammer-outline';
          else if (route.name === 'Profile') iconName = 'person';

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="QR" component={QRScreen} />
      { user?.role === "Teacher" || user?.role === "Secretary" ? <Tab.Screen name="Admin" component={AdminView} /> : <></> }
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
};

export default MainTabs;