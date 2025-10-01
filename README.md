# FlexiDB
[![GitHub](https://img.shields.io/github/license/TariQ-2/FlexiDB)](https://github.com/TariQ-2/FlexiDB/blob/master/LICENSE) [![GitHub last commit](https://img.shields.io/github/last-commit/TariQ-2/FlexiDB)](https://github.com/TariQ-2/FlexiDB/commits/master) [![GitHub issues](https://img.shields.io/github/issues-raw/TariQ-2/FlexiDB)](https://github.com/TariQ-2/FlexiDB/issues) [![GitHub closed issues](https://img.shields.io/github/issues-closed-raw/TariQ-2/FlexiDB)](https://github.com/TariQ-2/FlexiDB/issues) [![GitHub repo size](https://img.shields.io/github/repo-size/TariQ-2/FlexiDB)](https://github.com/TariQ-2/FlexiDB) [![npm downloads](https://img.shields.io/npm/dt/flexi-db.svg?maxAge=3600)](https://github.com/TariQ-2/FlexiDB) [![npm version](https://img.shields.io/npm/v/flexi-db.svg?maxAge=3600)](https://github.com/TariQ-2/FlexiDB) ![Visitors](https://visitor-badge.laobi.icu/badge?page_id=TariQ-2/FlexiDB)

**FlexiDB** is a lightweight, flexible JSON-based database for Node.js projects. It offers in-memory caching, async operations, atomic transactions, and zero dependencies.

## Features

* **High Performance** – In-memory caching and debounced disk writes
* **Async API** – All methods are promise-based
* **Custom Storage** – Use any directory for data and backups
* **Auto Backups** – Optional periodic file backups
* **Atomic Transactions** – Grouped operations with rollback
* **Type Safety** – Auto conversion for numeric operations
* **Zero Dependencies** – Uses Node.js core only

## Installation

```bash
npm install flexi-db
```

## Quick Example

```js
const FlexiDB = require('flexi-db');
const db = new FlexiDB('mydb.json', { dataDir: 'data', autoBackup: true });

(async () => {
  await db.set('user1', { name: 'Ali', age: 25 });
  await db.add('score', 10);
  await db.push('items', 'apple');

  await db.transaction([
    { type: 'set', key: 'user2', value: { name: 'Sara' } },
    { type: 'add', key: 'score', value: 5 }
  ]);

  console.log(db.all());
})();
```

## API Overview

### Core Methods

| Method            | Description                              |
| ----------------- | ---------------------------------------- |
| `set(key, value)` | Store a value                            |
| `get(key)`        | Retrieve a value                         |
| `has(key)`        | Check key existence                      |
| `delete(key)`     | Remove a key                             |
| `all(limit?)`     | Get all key-value pairs (optional limit) |

### Math Operations

| Method                       | Notes                            |
| ---------------------------- | -------------------------------- |
| `add(key, number)`           | Auto-converts non-numbers to 0   |
| `subtract(key, number)`      | Subtract from number             |
| `math(key, operator, value)` | Supports `+`, `-`, `*`, `/`, `%` |

### Array Utilities

| Method           | Description                      |
| ---------------- | -------------------------------- |
| `push(key, val)` | Push value to array at given key |

### Advanced

| Method               | Description                        |
| -------------------- | ---------------------------------- |
| `transaction([...])` | Run multiple operations atomically |
| `backup(fileName)`   | Create a manual backup             |
| `reset()`            | Clear all data                     |
| `destroy()`          | Save data and stop auto-backups    |

## Options

You can pass options in the constructor:

```js
new FlexiDB('file.json', {
  dataDir: 'data',      // default: 'FlexiDB'
  autoBackup: true      // default: false
});
```

## File Structure

All data and backups are stored in the specified `dataDir`, helping you keep your project organized.

```
my-project/
  └── data/              # or 'FlexiDB' by default
      ├── mydb.json
      └── backup-2025.json
```

## License

MIT – Free to use, modify, and distribute.

## Contributing

Feel free to open issues or submit PRs. All contributions are welcome!
