export interface Task {
  id?: number;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  completed: boolean;
  dueDate?: string;
}
