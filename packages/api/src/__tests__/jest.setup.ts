// Test setup file
import mongoose from 'mongoose';

// Mock environment variables for testing
process.env.MONGODB_URI = 'mongodb://localhost:27017/retia';
process.env.NODE_ENV = 'test';
process.env.SMTP_HOST = 'localhost';
process.env.SMTP_PORT = '587';
process.env.SMTP_USER = 'test@example.com';
process.env.SMTP_PASSWORD = 'testpassword';
process.env.NEXTAUTH_URL = 'http://localhost:3000';
process.env.PRIMARY_COLOR = '#3b82f6';

// Increase timeout for database operations
jest.setTimeout(30000);

// Clean up after all tests
afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
    }
});