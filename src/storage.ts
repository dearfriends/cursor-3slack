import * as fs from 'fs';
import * as path from 'path';
import { Todo } from './types';

/**
 * Storage class for persisting todos to a JSON file
 */
export class TodoStorage {
  private filePath: string;

  constructor(filePath: string = 'todos.json') {
    this.filePath = path.resolve(filePath);
  }

  /**
   * Load todos from the JSON file
   */
  load(): Todo[] {
    try {
      if (!fs.existsSync(this.filePath)) {
        return [];
      }

      const data = fs.readFileSync(this.filePath, 'utf-8');
      const todos = JSON.parse(data);

      // Convert date strings back to Date objects
      return todos.map((todo: any) => ({
        ...todo,
        createdAt: new Date(todo.createdAt),
        updatedAt: new Date(todo.updatedAt),
        dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined
      }));
    } catch (error) {
      console.error('Error loading todos:', error);
      return [];
    }
  }

  /**
   * Save todos to the JSON file
   */
  save(todos: Todo[]): void {
    try {
      const data = JSON.stringify(todos, null, 2);
      fs.writeFileSync(this.filePath, data, 'utf-8');
    } catch (error) {
      console.error('Error saving todos:', error);
      throw error;
    }
  }
}
