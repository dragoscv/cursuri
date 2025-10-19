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
} from '../icons/tech';

export interface TechItem {
    name: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    description: string;
    color: string;
}

export const technologies: TechItem[] = [
    {
        name: 'Python',
        icon: JavaScriptIcon, // Placeholder - can be updated with Python icon
        description: 'Master AI, data science, and automation with Python programming',
        color: '#3776AB'
    },
    {
        name: 'AI & ML',
        icon: TypeScriptIcon, // Placeholder - can be updated with AI icon
        description: 'Learn Machine Learning, Deep Learning, and Generative AI',
        color: '#FF6B6B'
    },
    {
        name: 'Data Science',
        icon: MongoDBIcon, // Placeholder - can be updated with Data icon
        description: 'Analyze data, build visualizations, and extract insights',
        color: '#4ECDC4'
    },
    {
        name: 'Digital Marketing',
        icon: FirebaseIcon, // Placeholder - can be updated with Marketing icon
        description: 'Master SEO, social media, content marketing, and analytics',
        color: '#FF9F1C'
    },
    {
        name: 'React',
        icon: ReactIcon,
        description: 'Build interactive UIs with the most popular frontend library',
        color: '#61DAFB'
    },
    {
        name: 'Cloud Computing',
        icon: NodeJsIcon, // Placeholder - can be updated with Cloud icon
        description: 'Deploy and scale applications on AWS, Azure, and Google Cloud',
        color: '#00A8E8'
    },
    {
        name: 'Cybersecurity',
        icon: NoSQLIcon, // Placeholder - can be updated with Security icon
        description: 'Learn ethical hacking, network security, and risk management',
        color: '#E63946'
    },
    {
        name: 'Business Strategy',
        icon: TailwindCssIcon, // Placeholder - can be updated with Business icon
        description: 'Develop leadership, project management, and strategic thinking',
        color: '#9B51E0'
    }
];
