import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { auth, db } from '../../../FirebaseConfig';
import { doc, getDoc} from 'firebase/firestore';
import StudentView from './StudentView';
import TeacherSecretaryView from './TeacherSecretaryView';

type UserData = {
  fullname: string;
  email: string;
  role: string;
  section: string;
  createdAt: Date;
};

const QRScreen: React.FC = () => {
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
    <>
      {user?.role === 'Teacher' || user?.role === 'Secretary' ? (
        <TeacherSecretaryView />
      ) : (
        <StudentView user={user} />
      )}
    </>
  )
};

export default QRScreen;
