const NexlifyDB = require('./index');
const db = new NexlifyDB();

(async () => {
  try {
    await db.init();
    await db.set('test', 'success');
    console.log('✅ FlexiDB is working correctly.');
    process.exit(0);
  } catch (err) {
    console.error('❌ FlexiDB test failed:', err);
    process.exit(1);
  }
})();
