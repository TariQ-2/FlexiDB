const fs = require('fs').promises;
const path = require('path');

class FlexiDB {
  constructor(fileName = 'database.json', options = {}) {
    this.dataDir = path.resolve(options.dataDir || 'FlexiDB');
    this.filePath = path.join(this.dataDir, fileName);
    this.autoBackupEnabled = false;
    if (this.autoBackupEnabled) {
      this.autoBackupInterval = setInterval(() => this.autoBackup(), 60000);
    }
    this.ready = this.init();
  }

  async init() {
    await this.ensureDataDir();
    await this.ensureFile();
  }

  async ensureDataDir() {
    await fs.mkdir(this.dataDir, { recursive: true });
  }

  async ensureFile() {
    const exists = await fs.access(this.filePath).then(() => true).catch(() => false);
    if (!exists) await fs.writeFile(this.filePath, '{}', 'utf8');
  }

  async readData() {
    const data = await fs.readFile(this.filePath, 'utf8');
    try {
      return JSON.parse(data);
    } catch {
      return {};
    }
  }

  async writeData(data) {
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), 'utf8');
  }

  async set(key, value) {
    await this.ready;
    if (!key) throw new TypeError('Key is not defined!');
    const data = await this.readData();
    data[key] = value;
    await this.writeData(data);
    return value;
  }

  async get(key) {
    await this.ready;
    if (!key) throw new TypeError('Key is not defined!');
    const data = await this.readData();
    return data[key];
  }

  async has(key) {
    await this.ready;
    if (!key) throw new TypeError('Key is not defined!');
    const data = await this.readData();
    return Object.prototype.hasOwnProperty.call(data, key);
  }

  async delete(key) {
    await this.ready;
    if (!key) throw new TypeError('Key is not defined!');
    const data = await this.readData();
    if (!Object.prototype.hasOwnProperty.call(data, key)) return false;
    delete data[key];
    await this.writeData(data);
    return true;
  }

  async all(limit = 0) {
    await this.ready;
    const data = await this.readData();
    const entries = Object.entries(data).map(([k, v]) => ({ data: k, value: v }));
    return limit > 0 ? entries.slice(0, limit) : entries;
  }

  async add(key, value) {
    await this.ready;
    if (!key) throw new TypeError('Key is not defined!');
    if (isNaN(value)) throw new TypeError('Value must be a number!');
    const data = await this.readData();
    const current = Number(data[key] || 0);
    const newValue = current + value;
    data[key] = newValue;
    await this.writeData(data);
    return newValue;
  }

  async subtract(key, value) {
    await this.ready;
    if (!key) throw new TypeError('Key is not defined!');
    if (isNaN(value)) throw new TypeError('Value must be a number!');
    const data = await this.readData();
    if (!Object.prototype.hasOwnProperty.call(data, key)) throw new TypeError('Key does not exist!');
    const current = Number(data[key] || 0);
    const newValue = current - value;
    data[key] = newValue;
    await this.writeData(data);
    return newValue;
  }

  async math(key, operator, value) {
    await this.ready;
    if (!key) throw new TypeError('Key is not defined!');
    if (!operator) throw new TypeError('Operator is not defined!');
    if (isNaN(value)) throw new TypeError('Value must be a number!');
    const data = await this.readData();
    if (!Object.prototype.hasOwnProperty.call(data, key)) throw new TypeError('Key does not exist!');
    const current = Number(data[key] || 0);
    let result;
    switch (operator) {
      case '+': result = current + value; break;
      case '-': result = current - value; break;
      case '*': result = current * value; break;
      case '/':
        if (value === 0) throw new TypeError('Cannot divide by zero!');
        result = current / value;
        break;
      case '%': result = current % value; break;
      default: throw new TypeError('Invalid operator!');
    }
    data[key] = result;
    await this.writeData(data);
    return result;
  }

  async push(key, value) {
    await this.ready;
    if (!key) throw new TypeError('Key is not defined!');
    const data = await this.readData();
    const arr = Array.isArray(data[key]) ? data[key] : [];
    arr.push(value);
    data[key] = arr;
    await this.writeData(data);
    return arr;
  }

  async backup(fileName) {
    await this.ready;
    if (!fileName) throw new TypeError('Filename is not defined!');
    const backupPath = path.join(this.dataDir, `${fileName}.json`);
    const data = await this.readData();
    await fs.writeFile(backupPath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  }

  async autoBackup() {
    if (!this.autoBackupEnabled) return;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await this.backup(`backup-${timestamp}`);
  }

  async reset() {
    await this.ready;
    await this.writeData({});
  }

  async destroy() {
    await this.ready;
    if (this.autoBackupEnabled) clearInterval(this.autoBackupInterval);
  }

  async transaction(operations) {
    await this.ready;
    const original = await this.readData();
    const data = { ...original };
    try {
      for (const op of operations) {
        if (op.type === 'set') data[op.key] = op.value;
        else if (op.type === 'delete') delete data[op.key];
        else if (op.type === 'add') data[op.key] = Number(data[op.key] || 0) + op.value;
        else if (op.type === 'subtract') data[op.key] = Number(data[op.key] || 0) - op.value;
        else if (op.type === 'push') {
          const arr = Array.isArray(data[op.key]) ? data[op.key] : [];
          arr.push(op.value);
          data[op.key] = arr;
        }
      }
      await this.writeData(data);
    } catch (err) {
      await this.writeData(original);
      throw new Error(`Transaction failed: ${err.message}`);
    }
  }
}

module.exports = FlexiDB;
