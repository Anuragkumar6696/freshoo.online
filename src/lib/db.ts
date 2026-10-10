import mongoose from "mongoose";

type CachedMongoose = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
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
  if (cached.conn && cached.conn.connection.readyState === 1) {
    return cached.conn;
  }

  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    throw new Error(
      "Missing MONGODB_URI. Please set MONGODB_URI in Vercel Project Settings (Settings > Environment Variables) or .env.local file."
    );
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
      family: 4,
    };

    cached.promise = mongoose
      .connect(uri, opts)
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
        throw new Error(
          `MongoDB connection failed (${err?.message || "unreachable"}). Ensure Network Access in MongoDB Atlas allows 0.0.0.0/0 (anywhere) and MONGODB_URI is valid in Vercel.`
        );
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
