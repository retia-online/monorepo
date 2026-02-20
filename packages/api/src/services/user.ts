import User, { IUser, UserRole } from '../models/User';
import Account from '../models/Account';
import Session from '../models/Session';
import { connectDB } from '../connection';
import mongoose from 'mongoose';

export interface UserBackupData {
    user: {
        id: string;
        name: string;
        email: string;
        role: UserRole;
        emailVerified?: Date;
        image?: string;
        approved: boolean;
        approvedAt?: Date;
        approvedBy?: string;
        invitedBy?: string;
        createdAt: Date;
        updatedAt: Date;
    };
    accounts: Array<{
        id: string;
        type: string;
        provider: string;
        providerAccountId: string;
        expires_at?: number;
        token_type?: string;
        scope?: string;
    }>;
    sessions: Array<{
        id: string;
        sessionToken: string;
        expires: Date;
    }>;
}

/**
 * Get complete backup data for a user including accounts and sessions
 */
export async function getUserBackup(userId: string | mongoose.Types.ObjectId): Promise<UserBackupData | null> {
    await connectDB();

    const objectId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;

    // Get user data
    const user = await User.findById(objectId).select('-password -resetPasswordToken -resetPasswordExpires -inviteToken');
    if (!user) {
        return null;
    }

    // Get user accounts
    const accounts = await Account.find({ userId: objectId }).select('-refresh_token -access_token -id_token');

    // Get user sessions
    const sessions = await Session.find({ userId: objectId });

    return {
        user: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            emailVerified: user.emailVerified,
            image: user.image,
            approved: user.approved,
            approvedAt: user.approvedAt,
            approvedBy: user.approvedBy?.toString(),
            invitedBy: user.invitedBy?.toString(),
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        },
        accounts: accounts.map(account => ({
            id: account._id.toString(),
            type: account.type,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            expires_at: account.expires_at,
            token_type: account.token_type,
            scope: account.scope,
        })),
        sessions: sessions.map(session => ({
            id: session._id.toString(),
            sessionToken: session.sessionToken,
            expires: session.expires,
        })),
    };
}

/**
 * Create a new user
 */
export async function createUser(userData: {
    name: string;
    email: string;
    password?: string;
    role?: UserRole;
    approved?: boolean;
    invitedBy?: string | mongoose.Types.ObjectId;
}): Promise<IUser> {
    await connectDB();

    const user = new User({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role || UserRole.USER,
        approved: userData.approved !== undefined ? userData.approved : true,
        invitedBy: userData.invitedBy,
    });

    return await user.save();
}

/**
 * Update user data
 */
export async function updateUser(
    userId: string | mongoose.Types.ObjectId,
    updateData: Partial<{
        name: string;
        email: string;
        role: UserRole;
        approved: boolean;
        approvedAt: Date;
        approvedBy: string | mongoose.Types.ObjectId;
        emailVerified: Date;
        image: string;
    }>
): Promise<IUser | null> {
    await connectDB();

    const objectId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;

    const updatedUser = await User.findByIdAndUpdate(
        objectId,
        {
            ...updateData,
            updatedAt: new Date(),
        },
        { new: true, select: '-password' }
    );

    return updatedUser;
}

/**
 * Find user by email
 */
export async function findUserByEmail(email: string): Promise<IUser | null> {
    await connectDB();
    return await User.findOne({ email }).select('-password');
}

/**
 * Find user by ID
 */
export async function findUserById(userId: string | mongoose.Types.ObjectId): Promise<IUser | null> {
    await connectDB();
    const objectId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;
    return await User.findById(objectId).select('-password');
}

/**
 * Get all users (admin function)
 */
export async function getAllUsers(): Promise<IUser[]> {
    await connectDB();
    return await User.find({})
        .select('name email role approved approvedAt createdAt')
        .sort({ createdAt: -1 });
}

/**
 * Delete user and all associated data
 */
export async function deleteUser(userId: string | mongoose.Types.ObjectId): Promise<boolean> {
    await connectDB();

    const objectId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;

    try {
        // Delete user accounts
        await Account.deleteMany({ userId: objectId });
        
        // Delete user sessions
        await Session.deleteMany({ userId: objectId });
        
        // Delete the user
        await User.findByIdAndDelete(objectId);

        return true;
    } catch (error) {
        console.error('Error deleting user:', error);
        return false;
    }
}