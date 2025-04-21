// screens/DashboardScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { auth, db } from '../../FirebaseConfig'; 
import { doc, getDoc } from 'firebase/firestore';
import { Calendar, DateData } from 'react-native-calendars';

type UserData = {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  role: string;
  section: string;
  createdAt: Date;
};

const AttendanceCalendar: React.FC = () => {
  const [markedDates, setMarkedDates] = useState({});
  const [streakCount, setStreakCount] = useState(0);
  const [attendanceWithTime, setAttendanceWithTime] = useState<Record<string, string>>({});
  
  const toGMT8 = (date: Date): Date => {
    const utc = date.getTime() + date.getTimezoneOffset() * 60000;
    return new Date(utc + 8 * 60 * 60000);
  };

  const fetchAttendance = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const ref = doc(db, 'attendance', uid);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      const data = snap.data();
      const rawDates: any[] = data.dates || [];
      const timeMap: Record<string, string> = {};

      let formattedDates: any[string] = [];

      rawDates.forEach((d: any) => {
        const dateObj = d.toDate ? d.toDate() : new Date(d);

        const dateStr = dateObj.toLocaleDateString('en-CA'); // 'YYYY-MM-DD'
        const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        formattedDates.push(dateStr);
        timeMap[dateStr] = timeStr;
      });

      const streak = calculateStreak(formattedDates); 
      setStreakCount(streak);
      setAttendanceWithTime(timeMap);

      // Mark dates on calendar
      const marked = formattedDates.reduce((acc: any, date: string) => {
        acc[date] = { marked: true, dotColor: '#4CAF50' };
        return acc;
      }, {});

      setMarkedDates(marked);
    }
  };

  const calculateStreak = (dates: string[]): number => {
    if (dates.length === 0) return 0;

    const today = toGMT8(new Date());
    today.setHours(0, 0, 0, 0);

    let streak = 0;
    for (let i = dates.length - 1; i >= 0; i--) {
      const currentDate = new Date(dates[i]);
      currentDate.setHours(0, 0, 0, 0);

      const expectedDate = new Date();
      expectedDate.setDate(today.getDate() - streak);
      expectedDate.setHours(0, 0, 0, 0);

      if (currentDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.streakText}>🔥 Current Streak: {streakCount} day(s)</Text>
      <Calendar
        markedDates={markedDates}
        theme={{
          selectedDayBackgroundColor: '#4CAF50',
          todayTextColor: '#FF5722',
        }}
        onDayPress={(day: DateData) => {
          const clickedDate = new Date(day.dateString);
          const today = new Date();
        
          // Normalize both dates to ignore time differences
          clickedDate.setHours(0, 0, 0, 0);
          today.setHours(0, 0, 0, 0);
        
          if (clickedDate > today) {
            // If the clicked date is in the future, show an alert
            Alert.alert("Oh no!", "You cannot choose the future...");
          } else {
            // Otherwise, proceed to check attendance
            const date = day.dateString;
            const time = attendanceWithTime[date];
        
            if (time) {
              Alert.alert("Attendance Info", `You were present at ${time}`);
            } else {
              Alert.alert("Attendance Info", "You were absent on this day.");
            }
          }
        }}
      />
    </View>
  );
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
          <Text style={styles.subtitle}>Welcome back, {user?.firstName}!</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>My Section</Text>
            <Text>{user?.section}</Text>
          </View>

          <AttendanceCalendar />
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
    marginTop: 4,
  },
  streakText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
});