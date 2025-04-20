import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, Button } from 'react-native';
import { auth, db } from '../../../FirebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import QRCode from 'react-native-qrcode-svg';

type UserData = {
  fullname: string;
  email: string;
  role: string;
  section: string;
  createdAt: Date;
};

const StudentView: React.FC<{ user: UserData | null }> = ({ user }) => {
  const [qrCode, setQrCode] = useState<string>('');
  const [alreadyAttended, setAlreadyAttended] = useState<boolean>(false);
  const [attendanceTime, setAttendanceTime] = useState<string | null>(null);

  const toGMT8 = (date: Date): Date => {
    const utc = date.getTime() + date.getTimezoneOffset() * 60000;
    return new Date(utc + 8 * 60 * 60000);
  };

  const checkIfAttendedAlready = async (uid: string): Promise<boolean> => {
    const attendanceRef = doc(db, "attendance", uid);
    const today = toGMT8(new Date());
    today.setHours(0, 0, 0, 0); // Normalize
  
    try {
      const docSnap = await getDoc(attendanceRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const dates: any[] = data.dates || [];
  
        const match = dates.find((date: any) => {
          const attendedDate = date.toDate ? date.toDate() : new Date(date);
          attendedDate.setHours(0, 0, 0, 0); // Normalize
          return attendedDate.getTime() === today.getTime();
        });
  
        if (match) {
          const attendedDate = match.toDate ? match.toDate() : new Date(match);
          const timeStr = attendedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          setAttendanceTime(timeStr); // <- update state here
          return true;
        }
      }
  
      setAttendanceTime(null); // Clear if not found
      return false;
    } catch (error) {
      console.error("Error checking attendance:", error);
      setAttendanceTime(null);
      return false;
    }
  };

  const generateQRCode = async (uid: string) => {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
  
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const lastSessionId = userData.lastSessionId;
        const currentSessionId = userData.currentSessionId;
  
        // If currentSessionId === lastSessionId, it means the QR has already been used
        // if (currentSessionId && currentSessionId === lastSessionId) {
        //   console.log("QR Code already used. Not generating new one.");
        //   // return;
        // }
  
        // If QR is still valid and not yet used, reuse it
        if (currentSessionId && currentSessionId !== lastSessionId) {
          console.log("Reusing current unused QR Code " + currentSessionId);
          setQrCode(currentSessionId);
          return;
        }
      }
  
      // Otherwise, generate a new one
      const newSessionId = `${uid}_${new Date().getTime()}`;
      setQrCode(newSessionId);
  
      await setDoc(userRef, { currentSessionId: newSessionId }, { merge: true });
      console.log("New QR Code generated:", newSessionId);
      
    } catch (err) {
      console.error("Error checking/generating QR code:", err);
    }
  };

  useEffect(() => {    
    const run = async () => {
      const uid = auth.currentUser?.uid;
      
      if (uid) {
        const hasAttended = await checkIfAttendedAlready(uid);

        setAlreadyAttended(hasAttended);

        if(!hasAttended)
          generateQRCode(uid);
      }
    };

    run();
  }, [user]);
  
  return (
    <View style={styles.container}>

      {alreadyAttended ? (
        <View style={styles.resultContainer}>
          <Text style={styles.message}>You have already been marked attended at {attendanceTime}</Text>
        </View>
      ) : qrCode !== '' ? (
        <>
          <Text style={styles.title}>Your Attendance QR Code</Text>

          <View style={styles.qrContainer}>
            <QRCode value={qrCode} size={250} />
          </View>
          <Text style={styles.note}>
            Let your teacher or secretary scan this QR code to mark your attendance.
          </Text>
        </>
      ) : (
        <ActivityIndicator size="large" color="#1E90FF" />
      )}

    </View>
  );
}

export default StudentView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 24,
    color: '#333',
    textAlign: 'center',
  },
  qrContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    elevation: 5, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    marginBottom: 24,
  },
  note: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  resultContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    marginTop: 20,
  },
  message: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
});
