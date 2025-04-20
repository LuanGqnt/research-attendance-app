import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Alert, Button } from 'react-native';
import { db } from '../../../FirebaseConfig';
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { CameraView, useCameraPermissions } from 'expo-camera';

type UserData = {
  fullname: string;
  email: string;
  role: string;
  section: string;
  createdAt: Date;
};  

const TeacherSecretaryView: React.FC = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState<boolean>(false);

  const scannedRef = useRef(false);

  // Handle QR code scan
    const handleQRCodeScan = async (scannedData: string) => {
      if(scannedRef.current === true) return;
      scannedRef.current = true;
      setScanned(true);
      
      console.log(scannedData);
      
      const parts = scannedData.split('_');

      if (parts.length !== 2) {
        Alert.alert('Error', 'Invalid QR code format.');
        return;
      }
    
      const uid = parts[0];
      const sessionId = scannedData;

      // Check if the QR code session is valid
      if (scannedData && sessionId) {
        const userRef = doc(db, 'users', uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const { lastSessionId, currentSessionId } = userDoc.data() || {};

          if (currentSessionId === sessionId && lastSessionId !== sessionId) {
            // Mark attendance  
            markAttendance(uid);
            
            await setDoc(userRef, { lastSessionId: currentSessionId }, { merge: true });
          } else {
            Alert.alert('Invalid QR Code', 'This QR code has already been used.');
          }
        } else {
          Alert.alert('Error', 'User data not found.');
        }
      } else {
        Alert.alert('Error', 'Invalid QR code data.');
      }

    };

    const toGMT8 = (date: Date): Date => {
      const utc = date.getTime() + date.getTimezoneOffset() * 60000;
      return new Date(utc + 8 * 60 * 60000);
    };

    const markAttendance = async (uid: string) => {
      const attendanceRef = doc(db, "attendance", uid);
      const today = toGMT8(new Date()); // Converts to GMT +8

      try {
        const docSnap = await getDoc(attendanceRef);
    
        if (docSnap.exists()) {
          await updateDoc(attendanceRef, {
            dates: arrayUnion(today)
          });
        } else {
          await setDoc(attendanceRef, {
            dates: [today]
          });
        }
    
        Alert.alert('Success', 'Attendance has been marked');
      } catch (error) {
        console.error("Error marking attendance:", error);
      }
    };

  return (
    <View style={styles.container}>
      {!permission ? (
        <Button title="Request Permissions" onPress={requestPermission} />
      ) : (
        scanned === false ? (
          <CameraView style={StyleSheet.absoluteFillObject} facing="back" barcodeScannerSettings={{barcodeTypes: ["qr"]}} onBarcodeScanned={({ data }) => {
            if(scanned === false)
              setTimeout(() => handleQRCodeScan(data), 500);
          }} />
        ) : (
          <View style={styles.result}>
            <Text style={styles.message}>Let students show their QR Code to mark their attendance.</Text>
            <Button title="Scan" onPress={() => {
              scannedRef.current = false;
              setScanned(false);
            }} />
          </View> 
        )
      )}
    </View>
  );
}

export default TeacherSecretaryView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  result: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
});

