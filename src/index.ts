import { TodoManager } from './todoManager';
import { TodoStorage } from './storage';
import { TodoCLI } from './cli';

/**
 * Main entry point for the Todo application
 */
async function main() {
  try {
    // Initialize storage and todo manager
    const storage = new TodoStorage('todos.json');
    const todoManager = new TodoManager(storage);

    // Start CLI
    const cli = new TodoCLI(todoManager);
    await cli.start();
  } catch (error) {
    console.error('An error occurred:', error);
    process.exit(1);
  }
}

// Run the application
main();
