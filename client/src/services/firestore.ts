import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { Transaction } from '../types/transaction';
import { Budget } from '../types/budget';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

interface SharedGroup {
  id: string;
  name: string;
  members: string[];
  expenses: SharedExpense[];
}

interface SharedExpense {
  id: string;
  name: string;
  amount: number;
  paidBy: string;
  split: number[];
}

class FirestoreService {
  // Transaction Operations
  async addTransaction(userId: string, transaction: Omit<Transaction, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'users', userId, 'transactions'), {
      ...transaction,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  }

  async getTransactions(userId: string): Promise<Transaction[]> {
    const q = query(
      collection(db, 'users', userId, 'transactions'),
      orderBy('date', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Transaction));
  }

  async updateTransaction(userId: string, transactionId: string, data: Partial<Transaction>): Promise<void> {
    const docRef = doc(db, 'users', userId, 'transactions', transactionId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  }

  async deleteTransaction(userId: string, transactionId: string): Promise<void> {
    const docRef = doc(db, 'users', userId, 'transactions', transactionId);
    await deleteDoc(docRef);
  }

  // Budget Operations
  async addBudget(userId: string, budget: Omit<Budget, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'users', userId, 'budgets'), {
      ...budget,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  }

  async getBudgets(userId: string): Promise<Budget[]> {
    const snapshot = await getDocs(collection(db, 'users', userId, 'budgets'));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Budget));
  }

  async updateBudget(userId: string, budgetId: string, data: Partial<Budget>): Promise<void> {
    const docRef = doc(db, 'users', userId, 'budgets', budgetId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  }

  async deleteBudget(userId: string, budgetId: string): Promise<void> {
    const docRef = doc(db, 'users', userId, 'budgets', budgetId);
    await deleteDoc(docRef);
  }

  // Shared Groups Operations
  async addSharedGroup(userId: string, group: Omit<SharedGroup, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'users', userId, 'sharedGroups'), {
      ...group,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  }

  async getSharedGroups(userId: string): Promise<SharedGroup[]> {
    const snapshot = await getDocs(collection(db, 'users', userId, 'sharedGroups'));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as SharedGroup));
  }

  async updateSharedGroup(userId: string, groupId: string, data: Partial<SharedGroup>): Promise<void> {
    const docRef = doc(db, 'users', userId, 'sharedGroups', groupId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  }

  async deleteSharedGroup(userId: string, groupId: string): Promise<void> {
    const docRef = doc(db, 'users', userId, 'sharedGroups', groupId);
    await deleteDoc(docRef);
  }

  async addSharedExpense(userId: string, groupId: string, expense: Omit<SharedExpense, 'id'>): Promise<string> {
    const groupRef = doc(db, 'users', userId, 'sharedGroups', groupId);
    const expensesRef = collection(groupRef, 'expenses');
    const docRef = await addDoc(expensesRef, {
      ...expense,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  }

  async deleteSharedExpense(userId: string, groupId: string, expenseId: string): Promise<void> {
    const docRef = doc(db, 'users', userId, 'sharedGroups', groupId, 'expenses', expenseId);
    await deleteDoc(docRef);
  }

  // Real-time listeners
  subscribeToTransactions(userId: string, callback: (transactions: Transaction[]) => void) {
    const q = query(
      collection(db, 'users', userId, 'transactions'),
      orderBy('date', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const transactions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Transaction));
      callback(transactions);
    });
  }

  subscribeToBudgets(userId: string, callback: (budgets: Budget[]) => void) {
    const q = query(collection(db, 'users', userId, 'budgets'));
    return onSnapshot(q, (snapshot) => {
      const budgets = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Budget));
      callback(budgets);
    });
  }

  subscribeToSharedGroups(userId: string, callback: (groups: SharedGroup[]) => void) {
    const q = query(collection(db, 'users', userId, 'sharedGroups'));
    return onSnapshot(q, async (snapshot) => {
      const groups = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const groupData = doc.data() as Omit<SharedGroup, 'id'>;
          const expensesSnapshot = await getDocs(collection(doc.ref, 'expenses'));
          const expenses = expensesSnapshot.docs.map(expenseDoc => ({
            id: expenseDoc.id,
            ...expenseDoc.data(),
          } as SharedExpense));
          
          return {
            id: doc.id,
            ...groupData,
            expenses,
          } as SharedGroup;
        })
      );
      callback(groups);
    });
  }
}

export const firestoreService = new FirestoreService(); 