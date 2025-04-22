import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../FirebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../App';

type AdminNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ManageUsers'>;

const ManageUsers = () => {
  const navigation = useNavigation<AdminNavigationProp>();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const fetchedUsers = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(fetchedUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const renderUser = ({ item }: { item: any }) => (
    <View style={styles.userCard}>
      <View>
        <Text style={styles.userName}>{`${item.firstName} ${item.lastName} | ${item.role}`}</Text>
        <Text style={styles.userSection}>{item.section}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate("EditUser", { user: item })}>
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity style={styles.deleteBtn}>
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity> */}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Users</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#1E90FF" />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={renderUser}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

export default ManageUsers;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 24,
    backgroundColor: '#F9FAFB',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 24,
  },
  userCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  userSection: {
    fontSize: 14,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  editBtn: {
    backgroundColor: '#4CAF50',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  deleteBtn: {
    backgroundColor: '#FF5252',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  actionText: {
    color: '#fff',
    fontWeight: '600',
  },
});