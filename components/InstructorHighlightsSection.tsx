import React from 'react';
import Card from './ui/Card';
import Avatar from './ui/Avatar';
import Chip from './ui/Chip';
import { motion } from 'framer-motion';

// DEBUG: Throw error if any import is undefined
if (!Card) throw new Error('Card is undefined in InstructorHighlightsSection');
if (!Avatar) throw new Error('Avatar is undefined in InstructorHighlightsSection');
if (!Chip) throw new Error('Chip is undefined in InstructorHighlightsSection');

// Example instructor data (replace with dynamic data if available)
const instructors = [
    {
        name: 'Dr. Andreea Popescu',
        title: 'AI Researcher & Lead Instructor',
        photoUrl: '/placeholder-instructor-1.png',
        bio: 'PhD in Machine Learning, 10+ years teaching experience, published author, passionate about democratizing AI education.',
        specialties: ['Deep Learning', 'NLP', 'Ethics'],
    },
    {
        name: 'Mihai Ionescu',
        title: 'Senior Software Engineer',
        photoUrl: '/placeholder-instructor-2.png',
        bio: 'Full-stack developer, course creator, and mentor. Focused on practical AI and scalable web apps.',
        specialties: ['Web Development', 'AI Integration', 'Cloud'],
    },
    {
        name: 'Elena Dumitrescu',
        title: 'Data Scientist',
        photoUrl: '/placeholder-instructor-3.png',
        bio: 'Data science educator, Kaggle competitor, and advocate for women in tech.',
        specialties: ['Data Science', 'Visualization', 'Python'],
    },
];

export default function InstructorHighlightsSection() {
    return (
        <section className="w-full py-16 bg-gradient-to-b from-[color:var(--ai-background)]/80 to-white dark:to-gray-900">
            <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-[color:var(--ai-foreground)] mb-8 text-center">
                    Meet Our Instructors
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {instructors.map((instructor, idx) => (
                        <motion.div
                            key={instructor.name}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                        >
                            <Card className="flex flex-col items-center p-8 bg-[color:var(--ai-card-bg)] dark:bg-[color:var(--ai-card-bg)] shadow-lg rounded-2xl border border-[color:var(--ai-card-border)] hover:shadow-xl transition-all duration-300">
                                <Avatar src={instructor.photoUrl} alt={instructor.name} size="xl" className="mb-4 shadow-md" />
                                <h3 className="text-xl font-semibold text-[color:var(--ai-foreground)] mb-1 text-center">{instructor.name}</h3>
                                <p className="text-sm text-[color:var(--ai-primary)] mb-2 text-center">{instructor.title}</p>
                                <div className="flex flex-wrap gap-2 mb-3 justify-center">
                                    {instructor.specialties.map((spec) => (
                                        <Chip key={spec} color="primary" variant="flat" size="sm">{spec}</Chip>
                                    ))}
                                </div>
                                <p className="text-[color:var(--ai-muted)] text-center text-sm">{instructor.bio}</p>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
