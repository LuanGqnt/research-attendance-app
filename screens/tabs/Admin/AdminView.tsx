import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { RootStackParamList } from '../../../App';

type AdminNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ManageUsers'>;

const AdminView = () => {
  const navigation = useNavigation<AdminNavigationProp>();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Manage Users</Text>
        <Text style={styles.cardDescription}>View, edit, or remove student accounts.</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("ManageUsers")}>
          <Text style={styles.buttonText}>Go to User Management</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Attendance Overview</Text>
        <Text style={styles.cardDescription}>Check daily, weekly, and monthly attendance reports.</Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>View Reports</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Section Settings</Text>
        <Text style={styles.cardDescription}>Manage sections.</Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Go to Sections</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default AdminView;

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#F9FAFB',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#1E90FF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
