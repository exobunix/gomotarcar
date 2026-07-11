const { MongoMemoryServer } = require('mongodb-memory-server');
const fs = require('fs');
const path = require('path');

async function start() {
  const dbPath = path.join(__dirname, 'mongodb_data');
  if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(dbPath, { recursive: true });
  }

  const mongod = await MongoMemoryServer.create({
    instance: {
      port: 27017,
      dbPath: dbPath,
      storageEngine: 'ephemeralForTest', // in-memory engine to bypass WiredTiger limitations
    },
    binary: {
      version: '4.2.24',
    }
  });

  console.log(`\n==================================================`);
  console.log(`MongoDB Memory Server started on: ${mongod.getUri()}`);
  console.log(`Port: 27017`);
  console.log(`Storage Path: ${dbPath}`);
  console.log(`==================================================\n`);

  process.on('SIGINT', async () => {
    console.log('Stopping MongoDB Memory Server...');
    await mongod.stop();
    process.exit(0);
  });
}

start().catch(console.error);
