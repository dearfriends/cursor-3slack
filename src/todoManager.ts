import { Todo, TodoStatus, TodoPriority, CreateTodoInput, UpdateTodoInput } from './types';
import { TodoStorage } from './storage';

/**
 * TodoManager class for managing todo items
 */
export class TodoManager {
  private todos: Todo[];
  private storage: TodoStorage;

  constructor(storage: TodoStorage) {
    this.storage = storage;
    this.todos = this.storage.load();
  }

  /**
   * Create a new todo item
   */
  createTodo(input: CreateTodoInput): Todo {
    const now = new Date();
    const todo: Todo = {
      id: this.generateId(),
      title: input.title,
      description: input.description,
      status: input.status,
      priority: input.priority,
      createdAt: now,
      updatedAt: now,
      dueDate: input.dueDate
    };

    this.todos.push(todo);
    this.storage.save(this.todos);
    return todo;
  }

  /**
   * Get all todos
   */
  getAllTodos(): Todo[] {
    return [...this.todos];
  }

  /**
   * Get a todo by id
   */
  getTodoById(id: string): Todo | undefined {
    return this.todos.find(todo => todo.id === id);
  }

  /**
   * Get todos by status
   */
  getTodosByStatus(status: TodoStatus): Todo[] {
    return this.todos.filter(todo => todo.status === status);
  }

  /**
   * Get todos by priority
   */
  getTodosByPriority(priority: TodoPriority): Todo[] {
    return this.todos.filter(todo => todo.priority === priority);
  }

  /**
   * Update a todo
   */
  updateTodo(id: string, updates: UpdateTodoInput): Todo | undefined {
    const index = this.todos.findIndex(todo => todo.id === id);
    if (index === -1) {
      return undefined;
    }

    this.todos[index] = {
      ...this.todos[index],
      ...updates,
      updatedAt: new Date()
    };

    this.storage.save(this.todos);
    return this.todos[index];
  }

  /**
   * Delete a todo
   */
  deleteTodo(id: string): boolean {
    const index = this.todos.findIndex(todo => todo.id === id);
    if (index === -1) {
      return false;
    }

    this.todos.splice(index, 1);
    this.storage.save(this.todos);
    return true;
  }

  /**
   * Mark a todo as completed
   */
  completeTodo(id: string): Todo | undefined {
    return this.updateTodo(id, { status: TodoStatus.COMPLETED });
  }

  /**
   * Search todos by title or description
   */
  searchTodos(query: string): Todo[] {
    const lowerQuery = query.toLowerCase();
    return this.todos.filter(todo =>
      todo.title.toLowerCase().includes(lowerQuery) ||
      todo.description.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get statistics about todos
   */
  getStats(): {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
  } {
    return {
      total: this.todos.length,
      pending: this.todos.filter(t => t.status === TodoStatus.PENDING).length,
      inProgress: this.todos.filter(t => t.status === TodoStatus.IN_PROGRESS).length,
      completed: this.todos.filter(t => t.status === TodoStatus.COMPLETED).length
    };
  }

  /**
   * Generate a unique ID for a todo
   */
  private generateId(): string {
    // Simple ID generation - you could use uuid library for production
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
