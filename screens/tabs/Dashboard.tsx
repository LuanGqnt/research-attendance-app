// screens/DashboardScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { auth, db } from '../../FirebaseConfig'; 
import { doc, getDoc } from 'firebase/firestore';

type UserData = {
  fullname: string;
  email: string;
  role: string;
  section: string;
  createdAt: Date;
};

const DashboardScreen: React.FC = () => {
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
    <View style={styles.container}>
      { user ? (
        <>
          <Text style={styles.title}>📊 Dashboard</Text>
          <Text style={styles.subtitle}>Welcome back, {user?.fullname}!</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Today's Attendance</Text>
            <Text>Status: Present ✅</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>My Section</Text>
            <Text>BSCS 3A</Text>
          </View>
        </>
      ) : (
        <ActivityIndicator size="large" color="#1E90FF" />
      )}
    </View>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 50,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 24,
    color: '#666',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
});