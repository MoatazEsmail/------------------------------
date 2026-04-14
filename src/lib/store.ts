import { ProductivityEntry } from './types';
import { db } from './firebase'; // تأكد أن اسم الملف عندك هو firebase
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';

const COLLECTION_NAME = 'productivity_entries';

export const getEntries = async (): Promise<ProductivityEntry[]> => {
    const q = query(collection(db, COLLECTION_NAME), orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    })) as ProductivityEntry[];
};

export const saveEntry = async (entry: ProductivityEntry) => {
    // إضافة بيانات جديدة لـ Firebase
    await addDoc(collection(db, COLLECTION_NAME), {
        ...entry,
        timestamp: new Date() // عشان الترتيب الزمني
    });
};

export const deleteEntry = async (id: string) => {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
};
