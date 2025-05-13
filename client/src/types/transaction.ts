export interface Transaction {
  id: string;
  amount: number;
  category: string;
  date: Date;
  description: string;
  type: 'income' | 'expense';
  createdAt?: Date;
  updatedAt?: Date;
} 