import { MongoClient } from 'mongodb';
import { mongoConfig } from '../config';
export const mongoClient = new MongoClient(mongoConfig.uri);

export async function connectToMongo(): Promise<unknown> {
  try {
    return await mongoClient.connect();
  } catch (err) {
    console.log(err);
  }
}
