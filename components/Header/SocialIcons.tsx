import React from 'react';
import GithubIcon from '@/components/icons/GithubIcon';
import WebsiteIcon from '@/components/icons/WebsiteIcon';

interface SocialIconsProps {
    // Add any props if needed
}

const SocialIcons: React.FC<SocialIconsProps> = () => {
    return (
        <div className='flex flex-row gap-2 p-2 justify-center'>
            <div
                className='cursor-pointer hover:bg-[rgb(59,89,152)]/20 hover:text-[rgb(59,89,152)] rounded-lg p-2'
                onClick={() => window.open('https://github.com/dragoscv', '_blank')}
            >
                <GithubIcon size={20} />
            </div>
            <div
                className='cursor-pointer hover:bg-[rgb(59,89,152)]/20 hover:text-[rgb(59,89,152)] rounded-lg p-2'
                onClick={() => window.open('https://dragoscatalin.ro', '_blank')}
            >
                <WebsiteIcon size={20} />
            </div>
        </div>
    );
};

export default SocialIcons;