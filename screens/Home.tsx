import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App'; // Adjust path if needed

// 👇 Your HomeScreen stays here for now
type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const Home: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sacred Heart College: Attendance Application</Text>  
      <View style={styles.buttonContainer}>
        <Button title="Log In" color="#d1d1d1" onPress={() => navigation.navigate('Login')} />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Register" onPress={() => navigation.navigate('Register')} />
      </View>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 20,
  },
  colorBlack: {
    color: 'black',
  }
});