import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Modal } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { arrayRemove, arrayUnion, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../FirebaseConfig';
import { RootStackParamList } from '../../../App';
import { Calendar } from 'react-native-calendars';

type EditUserRouteProp = RouteProp<RootStackParamList, 'EditUser'>;

  const EditUser = () => {
    const route = useRoute<EditUserRouteProp>();
    const navigation = useNavigation();
    const { user } = route.params;

    const [firstName, setFirstName] = useState(user.firstName || '');
    const [middleName, setMiddleName] = useState(user.middleName || '');
    const [lastName, setLastName] = useState(user.lastName || '');
    const [email, setEmail] = useState(user.email || '');
    const [role, setRole] = useState(user.role || '');

    const [attendance, setAttendance] = useState<any[]>([]);
    const [markedDates, setMarkedDates] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [attendanceTime, setAttendanceTime] = useState<string>('');
    const [isDatePresent, setIsDatePresent] = useState(false);
    const [timeInput, setTimeInput] = useState<any>();

    useEffect(() => {
      // Fetch user attendance data from Firestore
      const fetchAttendance = async () => {
        const attendanceRef = doc(db, 'attendance', user.id);
        const attendanceSnap = await getDoc(attendanceRef);
        
        if (attendanceSnap.exists()) {
          const data = attendanceSnap.data();
          const dates = data?.dates || [];
  
          // Format the attendance dates for the calendar (marked dates)
          const formattedMarkedDates = dates.reduce((acc: any, date: any) => {
            const dateObj = date.toDate ? date.toDate() : new Date(date);

            const dateStr = dateObj.toLocaleDateString('en-CA'); // 'YYYY-MM-DD'

            setAttendance((prev: any) => [...prev, dateStr]);
            acc[dateStr] = { marked: true, dotColor: '#4CAF50' }; // Green dot for present
            return acc;
          }, {});
  
          setMarkedDates(formattedMarkedDates);
        }
        setLoading(false);
      };
  
      fetchAttendance();
    }, [user]);

    const handleDayPress = (day: any) => {
      const selectedDate = day.dateString;
      setSelectedDate(selectedDate);

      const present = attendance.includes(selectedDate);
      setIsDatePresent(present);

      setModalVisible(true);
    };
  
    const markPresent = async () => {
      if (!attendanceTime) {
        Alert.alert('Error', 'Please enter a time for the attendance.');
        return;
      }
  
      const selectedAttendanceDate = selectedDate!;
      const timeFormatted = new Date(`${selectedAttendanceDate} ${attendanceTime}`).toISOString();  // Combine date and time
  
      console.log();

      // Mark the user as present by adding the date and time to the attendance array
      const attendanceRef = doc(db, 'attendance', user.id);
      await updateDoc(attendanceRef, {
        dates: arrayUnion(selectedAttendanceDate),
        [`attendanceTimes.${selectedAttendanceDate}`]: timeFormatted,  // Add time to the specific date
      });
  
      // Update the calendar marked dates
      setMarkedDates((prev: any) => ({
        ...prev,
        [selectedAttendanceDate]: { marked: true, dotColor: '#4CAF50' },
      }));
  
      setAttendance((prev) => [...prev, selectedAttendanceDate]);
      setModalVisible(false);
      Alert.alert('Attendance Updated', 'The user has been marked as present for this day.');
    };
  
    const markAbsent = async () => {
      if(!selectedDate)
        return;

      const attendanceRef = doc(db, 'attendance', user.id);

      // Remove the date from the attendance array
      await updateDoc(attendanceRef, {
        dates: arrayRemove(selectedDate),
      });
  
      // Update the calendar marked dates
      const updatedMarkedDates = { ...markedDates };
      delete updatedMarkedDates[selectedDate];
  
      setMarkedDates(updatedMarkedDates);
      setAttendance((prev) => prev.filter((d) => d !== selectedDate));
  
      Alert.alert('Attendance Updated', 'The user has been marked as absent for this day.');
    };

    const handleSave = async () => {
      try {
        const userRef = doc(db, 'users', user.id);
        await updateDoc(userRef, {
          firstName,
          middleName,
          lastName,
          email,
          role,
        });
        Alert.alert('Success', 'User updated successfully!');
        navigation.goBack();
      } catch (error) {
        Alert.alert('Error', 'Failed to update user.');
        console.error(error);
      }
    };

    const AttendanceModal = () => {
      return(
        <Modal visible={modalVisible} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {isDatePresent ? 'Mark as Absent?' : 'Mark as Present'}
              </Text>

              {!isDatePresent && (
                <>
                  <Text style={styles.modalLabel}>Enter Time (HH:MM):</Text>
                  <TextInput
                    style={styles.timeInput}
                    value={timeInput} 
                    onChangeText={setTimeInput}
                    placeholder="e.g. 08:30"
                  />
                </>
              )}

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={() => {
                    if (isDatePresent) {
                      markAbsent();
                    } else {
                      markPresent();
                    }
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.buttonText}>
                    {isDatePresent ? 'Mark Absent' : 'Mark Present'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      );
    }

    if (loading) {
      return <Text>Loading...</Text>;
    }  

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Edit User</Text>

        <TextInput
          style={styles.input}
          placeholder="First Name"
          value={firstName}
          onChangeText={setFirstName}
        />
        <TextInput
          style={styles.input}
          placeholder="Middle Name"
          value={middleName}
          onChangeText={setMiddleName}
        />
        <TextInput
          style={styles.input}
        placeholder="Last Name"
        value={lastName}
        onChangeText={setLastName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Role"
        value={role}
        onChangeText={setRole}
      />

      {/* <Calendar
        markedDates={markedDates}
        onDayPress={handleDayPress}
        markingType="custom"
      />

      <AttendanceModal /> */}

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
};

export default EditUser;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#F9FAFB',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#1E90FF',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 8,
    width: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    backgroundColor: '#1E90FF',
    paddingVertical: 10,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFF',
    fontSize: 16,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    elevation: 5,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#ccc',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#1E90FF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 20,
  },
});
