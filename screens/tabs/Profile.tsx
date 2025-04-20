// screens/Profile.tsx
import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../../FirebaseConfig';
import { CommonActions, useNavigation } from '@react-navigation/native';

const Profile: React.FC = () => {
  const navigation = useNavigation();

  const logout = async () => {
    try {
      await signOut(auth);
      console.log('Logged out successfully');

      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Home' }]
        })
      );

      alert('Successfully logged out!');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }

  return (
    <View style={styles.container}>
        <Button title="Log Out" onPress={() => logout()} />
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
});
