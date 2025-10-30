import {
    PythonIcon,
    AIMLIcon,
    DataAnalysisIcon,
    MarketingIcon,
    ReactIcon,
    CloudIcon,
    SecurityIcon,
    BusinessIcon
} from '../icons/tech';

export interface TechItem {
    key: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    color: string;
}

export const technologies: TechItem[] = [
    {
        key: 'python',
        icon: PythonIcon,
        color: '#3776AB'
    },
    {
        key: 'aiml',
        icon: AIMLIcon,
        color: '#FF6B6B'
    },
    {
        key: 'dataScience',
        icon: DataAnalysisIcon,
        color: '#4ECDC4'
    },
    {
        key: 'marketing',
        icon: MarketingIcon,
        color: '#FF9F1C'
    },
    {
        key: 'react',
        icon: ReactIcon,
        color: '#61DAFB'
    },
    {
        key: 'cloud',
        icon: CloudIcon,
        color: '#00A8E8'
    },
    {
        key: 'security',
        icon: SecurityIcon,
        color: '#E63946'
    },
    {
        key: 'business',
        icon: BusinessIcon,
        color: '#9B51E0'
    }
];
