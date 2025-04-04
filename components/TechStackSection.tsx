'use client';

import React from 'react';
import { motion } from 'framer-motion';
import ScrollAnimationWrapper from './animations/ScrollAnimationWrapper';
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
    ExpoIcon
} from './icons/tech';

interface TechItem {
    name: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    description: string;
    color: string;
}

export default function TechStackSection() {
    const technologies: TechItem[] = [
        {
            name: 'React',
            icon: ReactIcon,
            description: 'Build interactive UIs with the most popular frontend library',
            color: '#61DAFB'
        },
        {
            name: 'TypeScript',
            icon: TypeScriptIcon,
            description: 'Develop with type safety and increased code quality',
            color: '#3178C6'
        },
        {
            name: 'Next.js',
            icon: NextJsIcon,
            description: 'Create full-stack web applications with the React framework',
            color: '#000000'
        },
        {
            name: 'Node.js',
            icon: NodeJsIcon,
            description: 'Build scalable network applications with JavaScript runtime',
            color: '#339933'
        },
        {
            name: 'Firebase',
            icon: FirebaseIcon,
            description: 'Accelerate app development with fully managed backend infrastructure',
            color: '#FFCA28'
        },
        {
            name: 'Tailwind CSS',
            icon: TailwindCssIcon,
            description: 'Design beautiful interfaces with utility-first CSS framework',
            color: '#06B6D4'
        },
        {
            name: 'MongoDB',
            icon: MongoDBIcon,
            description: 'Work with flexible, scalable document databases',
            color: '#47A248'
        },
        {
            name: 'JavaScript',
            icon: JavaScriptIcon,
            description: 'Master the language of the web with modern ES6+ features',
            color: '#F7DF1E'
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100
            }
        }
    };

    return (
        <section className="relative py-20 bg-gray-50 dark:bg-gray-900 overflow-hidden">
            {/* Background circuit pattern */}
            <div className="absolute inset-0 opacity-5 dark:opacity-10">
                <img
                    src="/circuit-pattern.svg"
                    alt=""
                    className="w-full h-full object-cover"
                />
            </div>

            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <ScrollAnimationWrapper>
                    <h2 className="text-4xl font-bold text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400">
                        Master Modern Technologies
                    </h2>
                    <p className="text-xl text-center text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-16">
                        Our curriculum is designed around in-demand skills that employers are looking for today
                    </p>
                </ScrollAnimationWrapper>

                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                >
                    {technologies.map((tech, index) => (
                        <ScrollAnimationWrapper
                            key={tech.name}
                            delay={index * 0.1}
                            direction={index % 2 === 0 ? 'up' : 'down'}
                        >
                            <motion.div
                                className="flex flex-col items-center p-6 rounded-xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 dark:border-gray-700 h-full"
                                whileHover={{
                                    y: -5,
                                    boxShadow: `0 10px 25px -5px ${tech.color}33, 0 8px 10px -6px ${tech.color}33`,
                                    borderColor: tech.color
                                }}
                            >
                                <div className="w-16 h-16 mb-4 flex items-center justify-center">
                                    <tech.icon size={48} className={`text-[${tech.color}]`} />
                                </div>
                                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{tech.name}</h3>
                                <p className="text-gray-600 dark:text-gray-300 text-center">{tech.description}</p>
                            </motion.div>
                        </ScrollAnimationWrapper>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}