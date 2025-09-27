import {
    User,
    getAuth,
    onAuthStateChanged
} from 'firebase/auth';
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    collection,
    query,
    where,
    getDocs
} from 'firebase/firestore';
import { firestoreDB } from './firebase.config';
import { UserProfile } from '../../types/index.d';

// User roles enum
export enum UserRole {
    USER = 'user',
    ADMIN = 'admin',
    SUPER_ADMIN = 'super_admin'
}

// User permissions interface
export interface UserPermissions {
    canManageCourses: boolean;
    canManageUsers: boolean;
    canManagePayments: boolean;
    canViewAnalytics: boolean;
    canManageSettings: boolean;
}

// Default permissions for each role
const DEFAULT_PERMISSIONS: Record<UserRole, UserPermissions> = {
    [UserRole.USER]: {
        canManageCourses: false,
        canManageUsers: false,
        canManagePayments: false,
        canViewAnalytics: false,
        canManageSettings: false,
    },
    [UserRole.ADMIN]: {
        canManageCourses: true,
        canManageUsers: true,
        canManagePayments: true,
        canViewAnalytics: true,
        canManageSettings: false,
    },
    [UserRole.SUPER_ADMIN]: {
        canManageCourses: true,
        canManageUsers: true,
        canManagePayments: true,
        canViewAnalytics: true,
        canManageSettings: true,
    }
};

/**
 * Get user profile from Firestore
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
        const userDoc = await getDoc(doc(firestoreDB, 'users', uid));

        if (userDoc.exists()) {
            const data = userDoc.data();
            const role = data.role || UserRole.USER;
            return {
                id: data.uid || uid,
                email: data.email,
                displayName: data.displayName,
                photoURL: data.photoURL,
                bio: data.bio,
                role: role,
                isActive: data.isActive !== false, // Default to true if not specified
                permissions: data.permissions || DEFAULT_PERMISSIONS[role as UserRole],
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
                emailVerified: data.emailVerified || false,
                metadata: data.metadata,
                enrollments: data.enrollments,
            };
        }

        return null;
    } catch (error) {
        console.error('Error getting user profile:', error);
        return null;
    }
}

/**
 * Create or update user profile
 */
export async function createOrUpdateUserProfile(
    user: User,
    role: UserRole = UserRole.USER,
    customPermissions?: Partial<UserPermissions>
): Promise<UserProfile> {
    const permissions = customPermissions
        ? { ...DEFAULT_PERMISSIONS[role], ...customPermissions }
        : DEFAULT_PERMISSIONS[role];

    const userProfile: UserProfile = {
            id: user.uid,
            email: user.email || '',
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
            role,
            isActive: true,
            permissions,
            createdAt: new Date(),
            updatedAt: new Date(),
            emailVerified: user.emailVerified,
        };

    try {
        // Check if user profile already exists
        const existingProfile = await getUserProfile(user.uid);

        if (existingProfile) {
            // Update existing profile, preserving creation date and role (unless explicitly changing it)
            const updatedProfile = {
                ...userProfile,
                createdAt: existingProfile.createdAt,
                role: role !== UserRole.USER ? role : existingProfile.role, // Don't downgrade role unless explicit
            };

            await updateDoc(doc(firestoreDB, 'users', user.uid), updatedProfile);
            return updatedProfile;
        } else {
            // Create new profile
            await setDoc(doc(firestoreDB, 'users', user.uid), userProfile);
            return userProfile;
        }
    } catch (error) {
        console.error('Error creating/updating user profile:', error);
        throw error;
    }
}

/**
 * Check if user has specific permission
 */
export function hasPermission(userProfile: UserProfile | null, permission: keyof UserPermissions): boolean {
    if (!userProfile || !userProfile.isActive) return false;
    return userProfile.permissions[permission];
}

/**
 * Check if user is admin (has any admin privileges)
 */
export function isAdmin(userProfile: UserProfile | null): boolean {
    if (!userProfile || !userProfile.isActive) return false;
    return userProfile.role === UserRole.ADMIN || userProfile.role === UserRole.SUPER_ADMIN;
}

/**
 * Check if user is super admin
 */
export function isSuperAdmin(userProfile: UserProfile | null): boolean {
    if (!userProfile || !userProfile.isActive) return false;
    return userProfile.role === UserRole.SUPER_ADMIN;
}

/**
 * Update user role (admin only)
 */
export async function updateUserRole(
    targetUserId: string,
    newRole: UserRole,
    currentUserProfile: UserProfile
): Promise<boolean> {
    // Only super admins can change roles
    if (!isSuperAdmin(currentUserProfile)) {
        throw new Error('Insufficient permissions to change user roles');
    }

    try {
        const targetProfile = await getUserProfile(targetUserId);
        if (!targetProfile) {
            throw new Error('Target user not found');
        }

        const updatedProfile = {
            ...targetProfile,
            role: newRole,
            permissions: DEFAULT_PERMISSIONS[newRole],
            updatedAt: new Date(),
        };

        await updateDoc(doc(firestoreDB, 'users', targetUserId), updatedProfile);
        return true;
    } catch (error) {
        console.error('Error updating user role:', error);
        throw error;
    }
}

/**
 * Get all admin users
 */
export async function getAdminUsers(): Promise<UserProfile[]> {
    try {
        const adminQuery = query(
            collection(firestoreDB, 'users'),
            where('role', 'in', [UserRole.ADMIN, UserRole.SUPER_ADMIN]),
            where('isActive', '==', true)
        );

        const querySnapshot = await getDocs(adminQuery); return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: data.uid || doc.id,
                email: data.email,
                displayName: data.displayName,
                photoURL: data.photoURL,
                bio: data.bio,
                role: data.role,
                isActive: data.isActive,
                permissions: data.permissions,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
                emailVerified: data.emailVerified || false,
                metadata: data.metadata,
                enrollments: data.enrollments,
            };
        });
    } catch (error) {
        console.error('Error getting admin users:', error);
        return [];
    }
}

/**
 * Initialize admin system - create super admin if none exists
 */
export async function initializeAdminSystem(): Promise<void> {
    try {
        // Check if any super admin exists
        const adminQuery = query(
            collection(firestoreDB, 'users'),
            where('role', '==', UserRole.SUPER_ADMIN),
            where('isActive', '==', true)
        );

        const querySnapshot = await getDocs(adminQuery);

        if (querySnapshot.empty) {
            console.log('No super admin found. Please create one through the admin interface.');
            // Note: Super admin creation should be done through secure admin interface
            // or server-side initialization scripts
        }
    } catch (error) {
        console.error('Error initializing admin system:', error);
    }
}

/**
 * Migrate hardcoded admin to new role system
 * @deprecated This function is deprecated for security reasons. 
 * Admin roles should be assigned through secure server-side processes.
 */
export async function migrateHardcodedAdmin(_user: User): Promise<UserProfile | null> {
    console.warn('migrateHardcodedAdmin is deprecated for security reasons');
    return null;
}
