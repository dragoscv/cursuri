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
            <div className="relative">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-secondary-600 opacity-10 rounded-lg -z-10" />

                {/* Content */}
                <div className="py-6 px-6 rounded-lg">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">
                            {title}
                        </h1>

                        {description && (
                            <p className="mt-2 text-gray-600 dark:text-gray-300 max-w-2xl">
                                {description}
                            </p>
                        )}
                    </motion.div>

                    {/* Optional action buttons */}
                    {actions && (
                        <div className="mt-4 flex flex-wrap gap-3">
                            {actions}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileHeader;