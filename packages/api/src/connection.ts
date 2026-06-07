import mongoose from 'mongoose';

// Handle both Node.js and Edge runtime environments
let cached: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
} = { conn: null, promise: null };

// Only use global in Node.js environment (not in Edge runtime)
if (typeof global !== 'undefined') {
    // Define mongoose on global if it doesn't exist
    if (!(global as any).mongoose) {
        (global as any).mongoose = { conn: null, promise: null };
    }
    cached = (global as any).mongoose;
}

export async function connectDB() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!process.env.MONGODB_URI) {
        throw new Error('Please define the MONGODB_URI environment variable');
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(process.env.MONGODB_URI, opts);
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

export default connectDB;