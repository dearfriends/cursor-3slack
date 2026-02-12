import * as readline from 'readline';
import { TodoManager } from './todoManager';
import { TodoStatus, TodoPriority } from './types';

/**
 * CLI interface for the Todo application
 */
export class TodoCLI {
  private todoManager: TodoManager;
  private rl: readline.Interface;

  constructor(todoManager: TodoManager) {
    this.todoManager = todoManager;
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  /**
   * Start the CLI application
   */
  async start(): Promise<void> {
    console.log('\n=================================');
    console.log('   Welcome to Todo App (TS)');
    console.log('=================================\n');

    let running = true;
    while (running) {
      await this.showMenu();
      const choice = await this.prompt('Enter your choice: ');

      switch (choice.trim()) {
        case '1':
          await this.createTodo();
          break;
        case '2':
          this.listAllTodos();
          break;
        case '3':
          await this.listTodosByStatus();
          break;
        case '4':
          await this.updateTodo();
          break;
        case '5':
          await this.deleteTodo();
          break;
        case '6':
          await this.completeTodo();
          break;
        case '7':
          await this.searchTodos();
          break;
        case '8':
          this.showStats();
          break;
        case '9':
          console.log('\nGoodbye! 👋\n');
          running = false;
          break;
        default:
          console.log('\n❌ Invalid choice. Please try again.\n');
      }
    }

    this.rl.close();
  }

  /**
   * Show the main menu
   */
  private async showMenu(): Promise<void> {
    console.log('--- Main Menu ---');
    console.log('1. Create a new todo');
    console.log('2. List all todos');
    console.log('3. List todos by status');
    console.log('4. Update a todo');
    console.log('5. Delete a todo');
    console.log('6. Mark todo as completed');
    console.log('7. Search todos');
    console.log('8. Show statistics');
    console.log('9. Exit');
    console.log('');
  }

  /**
   * Create a new todo
   */
  private async createTodo(): Promise<void> {
    console.log('\n--- Create New Todo ---');
    const title = await this.prompt('Title: ');
    const description = await this.prompt('Description: ');
    
    console.log('\nPriority: 1=Low, 2=Medium, 3=High');
    const priorityChoice = await this.prompt('Priority: ');
    const priority = this.parsePriority(priorityChoice);

    console.log('\nStatus: 1=Pending, 2=In Progress, 3=Completed');
    const statusChoice = await this.prompt('Status (default: Pending): ');
    const status = this.parseStatus(statusChoice) || TodoStatus.PENDING;

    const dueDateStr = await this.prompt('Due date (YYYY-MM-DD, optional): ');
    const dueDate = dueDateStr.trim() ? new Date(dueDateStr) : undefined;

    const todo = this.todoManager.createTodo({
      title,
      description,
      priority,
      status,
      dueDate
    });

    console.log(`\n✅ Todo created successfully! (ID: ${todo.id})\n`);
  }

  /**
   * List all todos
   */
  private listAllTodos(): void {
    const todos = this.todoManager.getAllTodos();
    
    if (todos.length === 0) {
      console.log('\n📭 No todos found.\n');
      return;
    }

    console.log('\n--- All Todos ---');
    todos.forEach(todo => {
      this.printTodo(todo);
    });
    console.log('');
  }

  /**
   * List todos by status
   */
  private async listTodosByStatus(): Promise<void> {
    console.log('\n--- Filter by Status ---');
    console.log('1. Pending');
    console.log('2. In Progress');
    console.log('3. Completed');
    
    const choice = await this.prompt('Choose status: ');
    const status = this.parseStatus(choice);

    if (!status) {
      console.log('\n❌ Invalid status.\n');
      return;
    }

    const todos = this.todoManager.getTodosByStatus(status);
    
    if (todos.length === 0) {
      console.log(`\n📭 No ${status} todos found.\n`);
      return;
    }

    console.log(`\n--- ${status.toUpperCase()} Todos ---`);
    todos.forEach(todo => {
      this.printTodo(todo);
    });
    console.log('');
  }

  /**
   * Update a todo
   */
  private async updateTodo(): Promise<void> {
    const id = await this.prompt('\nEnter todo ID: ');
    const todo = this.todoManager.getTodoById(id);

    if (!todo) {
      console.log('\n❌ Todo not found.\n');
      return;
    }

    console.log('\nCurrent todo:');
    this.printTodo(todo);

    console.log('\nLeave blank to keep current value.');
    const title = await this.prompt('New title: ');
    const description = await this.prompt('New description: ');
    
    console.log('\nStatus: 1=Pending, 2=In Progress, 3=Completed');
    const statusChoice = await this.prompt('New status: ');
    const status = this.parseStatus(statusChoice);

    console.log('\nPriority: 1=Low, 2=Medium, 3=High');
    const priorityChoice = await this.prompt('New priority: ');
    const priority = this.parsePriority(priorityChoice);

    const updates: any = {};
    if (title.trim()) updates.title = title;
    if (description.trim()) updates.description = description;
    if (status) updates.status = status;
    if (priority) updates.priority = priority;

    const updated = this.todoManager.updateTodo(id, updates);
    
    if (updated) {
      console.log('\n✅ Todo updated successfully!\n');
    } else {
      console.log('\n❌ Failed to update todo.\n');
    }
  }

  /**
   * Delete a todo
   */
  private async deleteTodo(): Promise<void> {
    const id = await this.prompt('\nEnter todo ID to delete: ');
    const todo = this.todoManager.getTodoById(id);

    if (!todo) {
      console.log('\n❌ Todo not found.\n');
      return;
    }

    console.log('\nTodo to delete:');
    this.printTodo(todo);

    const confirm = await this.prompt('\nAre you sure? (yes/no): ');
    
    if (confirm.toLowerCase() === 'yes' || confirm.toLowerCase() === 'y') {
      const success = this.todoManager.deleteTodo(id);
      if (success) {
        console.log('\n✅ Todo deleted successfully!\n');
      } else {
        console.log('\n❌ Failed to delete todo.\n');
      }
    } else {
      console.log('\n❌ Deletion cancelled.\n');
    }
  }

  /**
   * Mark a todo as completed
   */
  private async completeTodo(): Promise<void> {
    const id = await this.prompt('\nEnter todo ID to complete: ');
    const updated = this.todoManager.completeTodo(id);

    if (updated) {
      console.log('\n✅ Todo marked as completed!\n');
    } else {
      console.log('\n❌ Todo not found.\n');
    }
  }

  /**
   * Search todos
   */
  private async searchTodos(): Promise<void> {
    const query = await this.prompt('\nEnter search query: ');
    const todos = this.todoManager.searchTodos(query);

    if (todos.length === 0) {
      console.log('\n📭 No matching todos found.\n');
      return;
    }

    console.log(`\n--- Search Results (${todos.length}) ---`);
    todos.forEach(todo => {
      this.printTodo(todo);
    });
    console.log('');
  }

  /**
   * Show statistics
   */
  private showStats(): void {
    const stats = this.todoManager.getStats();
    
    console.log('\n--- Todo Statistics ---');
    console.log(`Total todos: ${stats.total}`);
    console.log(`Pending: ${stats.pending}`);
    console.log(`In Progress: ${stats.inProgress}`);
    console.log(`Completed: ${stats.completed}`);
    console.log('');
  }

  /**
   * Print a single todo
   */
  private printTodo(todo: any): void {
    const statusIcon = this.getStatusIcon(todo.status);
    const priorityIcon = this.getPriorityIcon(todo.priority);
    
    console.log(`\n${statusIcon} [${todo.id}] ${todo.title}`);
    console.log(`   ${todo.description}`);
    console.log(`   Priority: ${priorityIcon} ${todo.priority} | Status: ${todo.status}`);
    if (todo.dueDate) {
      console.log(`   Due: ${new Date(todo.dueDate).toLocaleDateString()}`);
    }
    console.log(`   Created: ${new Date(todo.createdAt).toLocaleString()}`);
  }

  /**
   * Get status icon
   */
  private getStatusIcon(status: TodoStatus): string {
    switch (status) {
      case TodoStatus.PENDING:
        return '⏳';
      case TodoStatus.IN_PROGRESS:
        return '🔄';
      case TodoStatus.COMPLETED:
        return '✅';
      default:
        return '📝';
    }
  }

  /**
   * Get priority icon
   */
  private getPriorityIcon(priority: TodoPriority): string {
    switch (priority) {
      case TodoPriority.LOW:
        return '🟢';
      case TodoPriority.MEDIUM:
        return '🟡';
      case TodoPriority.HIGH:
        return '🔴';
      default:
        return '⚪';
    }
  }

  /**
   * Parse priority from user input
   */
  private parsePriority(input: string): TodoPriority {
    switch (input.trim()) {
      case '1':
        return TodoPriority.LOW;
      case '2':
        return TodoPriority.MEDIUM;
      case '3':
        return TodoPriority.HIGH;
      default:
        return TodoPriority.MEDIUM;
    }
  }

  /**
   * Parse status from user input
   */
  private parseStatus(input: string): TodoStatus | undefined {
    switch (input.trim()) {
      case '1':
        return TodoStatus.PENDING;
      case '2':
        return TodoStatus.IN_PROGRESS;
      case '3':
        return TodoStatus.COMPLETED;
      default:
        return undefined;
    }
  }

  /**
   * Prompt user for input
   */
  private prompt(question: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer);
      });
    });
  }
}
