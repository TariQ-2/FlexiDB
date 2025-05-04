const fs = require('fs').promises; // Use Node.js file system with promises
const path = require('path'); // Helps with file paths

// Debounce function to delay saving data
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout); // Clear any existing timeout
    timeout = setTimeout(() => func.apply(this, args), wait); // Call function after delay
  };
}

// FlexiDB class for managing a JSON-based database
class FlexiDB {
  // Constructor to set up the database
  constructor(fileName = 'database.json', options = {}) {
    this.dataDir = path.resolve(options.dataDir || 'FlexiDB'); // Custom or default folder for data
    this.filePath = path.join(this.dataDir, fileName); // Path to the database file
    this.cache = new Map(); // In-memory storage for fast access
    this.isDirty = false; // Tracks if data has changed
    this.autoBackupEnabled = options.autoBackup !== true; // Option to enable/disable auto-backup
    this.saveDataDebounced = debounce(this.saveData.bind(this), 500); // Delay saving data by 500ms
    if (this.autoBackupEnabled) {
      this.autoBackupInterval = setInterval(() => this.autoBackup(), 60000); // Auto-backup every minute
    }
  }

  // Initialize the database (must be called before using)
  async init() {
    await this.ensureDataDir(); // Create data folder if it doesn't exist
    await this.loadData(); // Load data from file
  }

  // Create the data folder if it doesn't exist
  async ensureDataDir() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true }); // Create folder, including parent folders
    } catch (error) {
      throw new Error(`Failed to create data directory: ${error.message}`);
    }
  }

  // Load data from the JSON file into memory
  async loadData() {
    try {
      const exists = await fs.access(this.filePath).then(() => true).catch(() => false); // Check if file exists
      if (!exists) {
        await fs.writeFile(this.filePath, '{}', 'utf8'); // Create empty file if it doesn't exist
      }
      const data = await fs.readFile(this.filePath, 'utf8'); // Read file content
      const json = JSON.parse(data); // Parse JSON
      for (const [key, value] of Object.entries(json)) {
        this.cache.set(key, value); // Load data into cache
      }
    } catch (error) {
      throw new Error(`Failed to load database: ${error.message}`);
    }
  }

  // Save data from memory to the JSON file
  async saveData() {
    if (!this.isDirty) return; // Skip if no changes
    try {
      const data = Object.fromEntries(this.cache); // Convert cache to object
      await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), 'utf8'); // Write to file with formatting
      this.isDirty = false; // Mark as saved
    } catch (error) {
      throw new Error(`Failed to save database: ${error.message}`);
    }
  }

  // Set a key-value pair in the database
  async set(key, value) {
    if (!key) throw new TypeError('Key is not defined!'); // Check for valid key
    this.cache.set(key, value); // Store in cache
    this.isDirty = true; // Mark as changed
    await this.saveDataDebounced(); // Save data after delay
    return value; // Return the value
  }

  // Get the value for a key
  get(key) {
    if (!key) throw new TypeError('Key is not defined!'); // Check for valid key
    return this.cache.get(key); // Return value from cache
  }

  // Check if a key exists
  has(key) {
    if (!key) throw new TypeError('Key is not defined!'); // Check for valid key
    return this.cache.has(key); // Return true if key exists
  }

  // Delete a key from the database
  async delete(key) {
    if (!key) throw new TypeError('Key is not defined!'); // Check for valid key
    if (!this.cache.has(key)) throw new TypeError('Key does not exist!'); // Check if key exists
    const result = this.cache.delete(key); // Delete from cache
    this.isDirty = true; // Mark as changed
    await this.saveDataDebounced(); // Save data after delay
    return result; // Return true if deleted
  }

  // Get all key-value pairs (with optional limit)
  all(limit = 0) {
    const entries = Array.from(this.cache.entries()).map(([key, value]) => ({
      data: key,
      value
    })); // Convert cache to array of objects
    return limit > 0 ? entries.slice(0, limit) : entries; // Return limited or full list
  }

  // Add a number to a key's value
  async add(key, value) {
    if (!key) throw new TypeError('Key is not defined!'); // Check for valid key
    if (isNaN(value)) throw new TypeError('Value must be a number!'); // Check for valid number
    const current = Number(this.get(key) || 0); // Convert current value to number (default 0)
    const newValue = current + value; // Add value
    return this.set(key, newValue); // Save and return new value
  }

  // Subtract a number from a key's value
  async subtract(key, value) {
    if (!key) throw new TypeError('Key is not defined!'); // Check for valid key
    if (isNaN(value)) throw new TypeError('Value must be a number!'); // Check for valid number
    const current = Number(this.get(key) || 0); // Convert current value to number (default 0)
    if (!this.has(key) && current === 0) throw new TypeError('Key does not exist!'); // Check if key exists
    const newValue = current - value; // Subtract value
    return this.set(key, newValue); // Save and return new value
  }

  // Perform a math operation on a key's value
  async math(key, operator, value) {
    if (!key) throw new TypeError('Key is not defined!'); // Check for valid key
    if (!operator) throw new TypeError('Operator is not defined!'); // Check for valid operator
    if (isNaN(value)) throw new TypeError('Value must be a number!'); // Check for valid number
    const current = Number(this.get(key) || 0); // Convert current value to number (default 0)
    if (!this.has(key) && current === 0) throw new TypeError('Key does not exist!'); // Check if key exists
    let newValue;
    switch (operator) {
      case '+': newValue = current + value; break; // Addition
      case '-': newValue = current - value; break; // Subtraction
      case '*': newValue = current * value; break; // Multiplication
      case '/':
        if (value === 0) throw new TypeError('Cannot divide by zero!'); // Prevent division by zero
        newValue = current / value; // Division
        break;
      case '%': newValue = current % value; break; // Modulus
      default: throw new TypeError('Invalid operator!'); // Invalid operator
    }
    return this.set(key, newValue); // Save and return new value
  }

  // Add a value to an array at a key
  async push(key, value) {
    if (!key) throw new TypeError('Key is not defined!'); // Check for valid key
    const current = this.get(key) || []; // Get array or empty array
    if (!Array.isArray(current)) throw new TypeError('Value at key is not an array!'); // Check if array
    current.push(value); // Add value to array
    return this.set(key, current); // Save and return array
  }

  // Create a backup of the database
  async backup(fileName) {
    if (!fileName) throw new TypeError('Filename is not defined!'); // Check for valid filename
    try {
      const backupPath = path.join(this.dataDir, `${fileName}.json`); // Path for backup file
      const data = Object.fromEntries(this.cache); // Convert cache to object
      await fs.writeFile(backupPath, JSON.stringify(data, null, 2), 'utf8'); // Write backup file
      return true; // Return success
    } catch (error) {
      throw new Error(`Failed to create backup: ${error.message}`);
    }
  }

  // Create an automatic backup
  async autoBackup() {
    if (!this.autoBackupEnabled) return; // Skip if auto-backup is disabled
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-'); // Create timestamp
    await this.backup(`backup-${timestamp}`); // Save backup with timestamp
  }

  // Clear all data in the database
  async reset() {
    this.cache.clear(); // Clear cache
    this.isDirty = true; // Mark as changed
    await this.saveDataDebounced(); // Save data after delay
  }

  // Close the database and save data
  async destroy() {
    if (this.autoBackupEnabled) {
      clearInterval(this.autoBackupInterval); // Stop auto-backup
    }
    await this.saveData(); // Save data immediately
  }

  // Run multiple operations as a single transaction
  async transaction(operations) {
    const backup = new Map(this.cache); // Backup current cache
    try {
      for (const op of operations) {
        if (op.type === 'set') await this.set(op.key, op.value); // Set operation
        else if (op.type === 'delete') await this.delete(op.key); // Delete operation
        else if (op.type === 'add') await this.add(op.key, op.value); // Add operation
        else if (op.type === 'subtract') await this.subtract(op.key, op.value); // Subtract operation
        else if (op.type === 'push') await this.push(op.key, op.value); // Push operation
        else if (op.type === 'math') await this.math(op.key, op.operator, op.value); // Math operation
      }
    } catch (error) {
      this.cache = backup; // Restore cache if transaction fails
      throw new Error(`Transaction failed: ${error.message}`);
    }
  }
}

module.exports = FlexiDB; // Export the FlexiDB class
