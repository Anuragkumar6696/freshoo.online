import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://officialanurag6696_db_user:mNUYxPlpowMEyM8K@cluster0.k0nuuy8.mongodb.net/freshoo?retryWrites=true&w=majority&appName=Cluster0";

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in .env");
}

type CachedMongoose = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var mongoose: CachedMongoose | undefined;
}

const cached: CachedMongoose = global.mongoose || {
  conn: null,
  promise: null,
};

if (!global.mongoose) {
  global.mongoose = cached;
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((m) => {
        console.log(
          `[MongoDB] Connected to DB: ${
            m.connection.name || "(default)"
          } at ${m.connection.host}`
        );
        return m;
      })
      .catch((err) => {
        console.error("[MongoDB] Connection error:", err);
        cached.promise = null;
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn as typeof mongoose;
}

export async function disconnectDB() {
  if (cached.conn) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
    console.log("[MongoDB] Disconnected");
  }
}

export default mongoose;
