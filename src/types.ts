/**
 * Enum representing the status of a todo item
 */
export enum TodoStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed'
}

/**
 * Enum representing the priority level of a todo item
 */
export enum TodoPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

/**
 * Interface representing a Todo item
 */
export interface Todo {
  id: string;
  title: string;
  description: string;
  status: TodoStatus;
  priority: TodoPriority;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
}

/**
 * Type for creating a new Todo (without auto-generated fields)
 */
export type CreateTodoInput = Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Type for updating a Todo (all fields optional except id)
 */
export type UpdateTodoInput = Partial<Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>>;
