'use client'

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    TypeScriptIcon,
    ReactIcon,
    FirebaseIcon,
    NodeJsIcon,
    TailwindCssIcon,
    JavaScriptIcon,
    NextJsIcon,
    MongoDBIcon,
    CSSIcon,
    HTMLIcon,
    NoSQLIcon,
    ExpoIcon,
    StripeIcon,
    ReactNativeIcon
} from '@/components/icons/tech';

const iconComponents: { [key: string]: React.FC<React.SVGProps<SVGSVGElement>> } = {
    'TypeScript': TypeScriptIcon,
    'React': ReactIcon,
    'Firebase': FirebaseIcon,
    'Node.js': NodeJsIcon,
    'Tailwind CSS': TailwindCssIcon,
    'JavaScript': JavaScriptIcon,
    'Next.js': NextJsIcon,
    'MongoDB': MongoDBIcon,
    'CSS': CSSIcon,
    'HTML': HTMLIcon,
    'NoSQL': NoSQLIcon,
    'Expo': ExpoIcon,
    'Stripe': StripeIcon,
    'React Native': ReactNativeIcon
};

type TechIconsProps = {
    technologies: string[];
};

const TechIcons = React.memo(function TechIcons({ technologies }: TechIconsProps) {
    // Memoize animation variants to prevent recreation
    const containerVariants = useMemo(() => ({
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3
            }
        }
    }), []);

    const itemVariants = useMemo(() => ({
        hidden: { scale: 0, opacity: 0 },
        show: { scale: 1, opacity: 1 }
    }), []);

    return (
        <motion.div
            className="absolute inset-0 pointer-events-none"
            variants={containerVariants}
            initial="hidden"
            animate="show"
        >
            {technologies.map((tech, index) => {
                // Calculate positions using a circle pattern
                const angle = (index / technologies.length) * Math.PI * 2;
                const radius = 35; // % of container
                const x = 50 + radius * Math.cos(angle);
                const y = 50 + radius * Math.sin(angle);

                const IconComponent = iconComponents[tech] || ReactIcon;

                return (
                    <motion.div
                        key={tech}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2"
                        style={{
                            left: `${x}%`,
                            top: `${y}%`,
                        }}
                        variants={itemVariants}
                        transition={{
                            type: "spring",
                            damping: 10,
                            stiffness: 100
                        }}
                    >
                        <div className="bg-white bg-opacity-10 dark:bg-opacity-5 backdrop-blur-sm p-2 rounded-xl">
                            <IconComponent className="w-8 h-8 md:w-12 md:h-12" />
                        </div>
                    </motion.div>
                );
            })}
        </motion.div>
    );
});

export default TechIcons;
