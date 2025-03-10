"use server";

import { connect, ConnectOptions, Connection } from "mongoose";
declare global {
  /* eslint-disable-next-line */
  var mongoose: any; // This must be a `var` and not a `let / const`
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect(): Promise<Connection> {
  const MONGODB_URI = process.env.MONGODB_URI!;

  if (!MONGODB_URI) {
    throw new Error(
      "Please define the MONGODB_URI environment variable inside .env.local",
    );
  }

  if (cached.conn) {
    console.log(" -- DB CONNECTED (cached) --");
    return cached.conn;
  }
  if (!cached.promise) {
    const opts: ConnectOptions = {
      bufferCommands: true,
    };
    cached.promise = connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  console.log(" -- DB CONNECTED --");

  return cached.conn;
}

export default dbConnect;
