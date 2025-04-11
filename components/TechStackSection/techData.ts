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
