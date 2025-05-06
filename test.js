const FlexiDB = require('./index');
const db = new FlexiDB();

(async () => {
  try {
    console.log('Database initialized successfully.');

    try {
      await db.set('test', 'success');
      console.log('Data added: "test" => "success"');
    } catch (err) {
      console.error('Error while adding data: ', err);
      process.exit(1);
    }

    try {
      const value = await db.get('test');
      if (value === 'success') {
        console.log('Data retrieved: "test" => "success"');
      } else {
        console.error('Error: Data retrieved is not as expected');
        process.exit(1);
      }
    } catch (err) {
      console.error('Error while retrieving data: ', err);
      process.exit(1);
    }

    try {
      await db.set('test', 'updated');
      const updatedValue = await db.get('test');
      if (updatedValue === 'updated') {
        console.log('Data updated: "test" => "updated"');
      } else {
        console.error('Error: Data update failed');
        process.exit(1);
      }
    } catch (err) {
      console.error('Error while updating data: ', err);
      process.exit(1);
    }

    try {
      await db.delete('test');
      const deletedValue = await db.get('test');
      if (!deletedValue) {
        console.log('Data deleted: "test"');
      } else {
        console.error('Error: Data deletion failed');
        process.exit(1);
      }
    } catch (err) {
      console.error('Error while deleting data: ', err);
      process.exit(1);
    }

    try {
      const nonexistentValue = await db.get('nonexistentKey');
      if (nonexistentValue === undefined || nonexistentValue === null) {
        console.log('Correctly handled nonexistent key');
      } else {
        console.error('Error: Should have thrown an error for nonexistent key');
        process.exit(1);
      }
    } catch (err) {
      console.log('Correctly caught error for nonexistent key');
    }

    process.exit(0);
  } catch (err) {
    console.error('FlexiDB test failed: ', err);
    process.exit(1);
  }
})();
