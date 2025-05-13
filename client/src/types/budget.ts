export interface Budget {
  id: string;
  amount: number;
  category: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
} 