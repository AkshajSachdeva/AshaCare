import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import path from 'path';

let memoryServer;

export async function connectDatabase() {
  let uri = process.env.MONGO_URI;
  let mode = 'configured';
  if (!uri) {
    process.env.MONGOMS_DOWNLOAD_DIR ||= path.resolve('.cache', 'mongodb-binaries');
    memoryServer = await MongoMemoryServer.create({ instance: { dbName: 'ashacare' } });
    uri = memoryServer.getUri('ashacare');
    mode = 'embedded';
  }
  await mongoose.connect(uri);
  return { mode, host: mongoose.connection.host, name: mongoose.connection.name };
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
  if (memoryServer) await memoryServer.stop();
}
