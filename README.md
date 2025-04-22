# FlexiDB
[![GitHub](https://img.shields.io/github/license/TariQ-2/FlexiDB)](https://github.com/TariQ-2/FlexiDB/blob/master/LICENSE) [![GitHub last commit](https://img.shields.io/github/last-commit/TariQ-2/FlexiDB)](https://github.com/TariQ-2/FlexiDB/commits/master) [![GitHub issues](https://img.shields.io/github/issues-raw/TariQ-2/FlexiDB)](https://github.com/TariQ-2/FlexiDB/issues) [![GitHub closed issues](https://img.shields.io/github/issues-closed-raw/TariQ-2/FlexiDB)](https://github.com/TariQ-2/FlexiDB/issues) [![GitHub repo size](https://img.shields.io/github/repo-size/TariQ-2/FlexiDB)](https://github.com/TariQ-2/FlexiDB)

A lightweight, flexible JSON-based database designed for simplicity and performance. FlexiDB supports in-memory caching, asynchronous operations, customizable data storage, automatic backups, and atomic transactions.

## Features

- **High Performance**: In-memory caching and debounced writes for efficient data storage.
- **Async Support**: Fully asynchronous API with proper initialization.
- **Flexible Storage**: Store data in a custom directory or the default `FlexiDB` folder.
- **Automatic Backups**: Optional periodic backups to prevent data loss.
- **Atomic Transactions**: Execute multiple operations with rollback support.
- **Type Safety**: Robust input validation with automatic type conversion for numeric operations.
- **Lightweight**: No external dependencies, built with Node.js core modules.

## Installation

```bash
npm install flexi-db
```

## Usage

```javascript
const FlexiDB = require('flexi-db');

// Initialize with custom data directory and options
const db = new FlexiDB('mydb.json', { dataDir: 'myData', autoBackup: false });
await db.init();

(async () => {
  // Set a value
  await db.set('user1', { name: 'Ali', age: 25 });
  console.log(db.get('user1')); // { name: 'Ali', age: 25 }

  // Add a number
  await db.add('score', 10);
  console.log(db.get('score')); // 10

  // Push to an array
  await db.push('items', 'apple');
  console.log(db.get('items')); // ['apple']

  // Perform a transaction
  await db.transaction([
    { type: 'set', key: 'user2', value: { name: 'Sara' } },
    { type: 'add', key: 'score', value: 5 }
  ]);

  // Get all data
  console.log(db.all()); // [{ data: 'user1', value: {...}}, ...]

  // Create a backup
  await db.backup('backup-2025'); // Stored in myData/backup-2025.json

  // Reset database
  await db.reset();

  // Close database
  await db.destroy();
})();
```

## API

- `init()`: Initialize the database (must be called after constructor).
- `set(key, value)`: Set a key-value pair.
- `get(key)`: Get the value for a key.
- `has(key)`: Check if a key exists.
- `delete(key)`: Delete a key.
- `all([limit])`: Get all key-value pairs (optional limit).
- `add(key, value)`: Add a number to a key (converts non-numeric values to 0).
- `subtract(key, value)`: Subtract a number from a key.
- `math(key, operator, value)`: Perform a math operation (+, -, \*, /, %).
- `push(key, value)`: Push a value to an array at key.
- `backup(fileName)`: Create a backup file in the specified data directory.
- `reset()`: Clear all data.
- `transaction(operations)`: Execute multiple operations atomically.
- `destroy()`: Save data and stop auto-backups.

## Options

- `dataDir` (string, default: `'FlexiDB'`): Directory to store database and backup files.
- `autoBackup` (boolean, default: `true`): Enable or disable automatic backups.

## Data Storage

Database and backup files are stored in the specified `dataDir` (default: `FlexiDB`) in your project directory, keeping your project organized.

## License

MIT License
