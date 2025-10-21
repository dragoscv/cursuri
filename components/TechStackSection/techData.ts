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
    key: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    color: string;
}

export const technologies: TechItem[] = [
    {
        key: 'python',
        icon: JavaScriptIcon, // Placeholder - can be updated with Python icon
        color: '#3776AB'
    },
    {
        key: 'aiml',
        icon: TypeScriptIcon, // Placeholder - can be updated with AI icon
        color: '#FF6B6B'
    },
    {
        key: 'dataScience',
        icon: MongoDBIcon, // Placeholder - can be updated with Data icon
        color: '#4ECDC4'
    },
    {
        key: 'marketing',
        icon: FirebaseIcon, // Placeholder - can be updated with Marketing icon
        color: '#FF9F1C'
    },
    {
        key: 'react',
        icon: ReactIcon,
        color: '#61DAFB'
    },
    {
        key: 'cloud',
        icon: NodeJsIcon, // Placeholder - can be updated with Cloud icon
        color: '#00A8E8'
    },
    {
        key: 'security',
        icon: NoSQLIcon, // Placeholder - can be updated with Security icon
        color: '#E63946'
    },
    {
        key: 'business',
        icon: TailwindCssIcon, // Placeholder - can be updated with Business icon
        color: '#9B51E0'
    }
];
