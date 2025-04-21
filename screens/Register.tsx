import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { auth, db } from '../FirebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore'; 

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

const Register: React.FC<Props> = ({ navigation }) => {
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [section, setSection] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); 
  
  const handleRegister = async () => {
    try {
      const user = await createUserWithEmailAndPassword(auth, email, password);

      if (!user) return;
      
      await setDoc(doc(db, 'users', user.user.uid), {
        firstName,
        middleName,
        lastName,
        email,
        role: 'Student',
        section,
        createdAt: new Date(),
      });
      
      alert('Registered successfully!');

      navigation.navigate('MainTabs');

      console.log('Created a new user with email of ' + email);
    } catch (error: any) {
      console.log(error);
      alert('Register failed: ' + error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>

      {/* Personal Info Section */}
      <Text style={styles.sectionHeader}>Personal Information</Text>
      <View style={styles.nameRow}>
        <TextInput
          style={[styles.input, styles.halfInput, { marginRight: 8 }]}
          placeholder="First Name"
          value={firstName}
          onChangeText={setFirstName}
          autoCapitalize="none"
        />
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="Middle Name"
          value={middleName}
          onChangeText={setMiddleName}
          autoCapitalize="none"
        />
      </View>

      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={lastName}
        onChangeText={setLastName}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Section"
        value={section}
        onChangeText={setSection}
        autoCapitalize="none"
      />

      {/* System Info Section */}
      <Text style={styles.sectionHeader}>Account Details</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Register;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 1,
  },
  title: {
    fontSize: 32,
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
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});