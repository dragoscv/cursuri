import React from 'react';
import { motion } from 'framer-motion';

interface ProfileHeaderProps {
    title: string;
    description?: string;
    actions?: React.ReactNode;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
    title,
    description,
    actions
}) => {
    return (
        <div className="mb-8">
            <div className="bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-pink-600/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 dark:border-gray-800/50 shadow-xl">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-4"
                >
                    <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        {title}
                    </h1>

                    {description && (
                        <p className="text-gray-600 dark:text-gray-300 max-w-2xl">
                            {description}
                        </p>
                    )}
                </motion.div>

                {/* Optional action buttons */}
                {actions && (
                    <div className="flex flex-wrap gap-3">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileHeader;