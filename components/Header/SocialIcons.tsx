import React from 'react';
import GitHubIcon from '@/components/icons/GitHubIcon';
import WebsiteIcon from '@/components/icons/WebsiteIcon';
import TikTokIcon from '@/components/icons/TikTokIcon';
import InstagramIcon from '@/components/icons/InstagramIcon';

/**
 * SocialIcons component that displays social media links
 */
export default function SocialIcons() {
    return (
        <div className="flex flex-row flex-wrap justify-between gap-2 p-2">
            <a
                href="https://github.com/dragoscv"
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer p-2 rounded-lg hover:bg-[color:var(--ai-card-border)]/30 dark:hover:bg-[color:var(--ai-card-border)]/20 transition-colors"
                aria-label="GitHub"
            >
                <GitHubIcon className="text-[color:var(--ai-primary)]" size={20} />
            </a>
            <a
                href="https://dragoscatalin.ro"
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer p-2 rounded-lg hover:bg-[color:var(--ai-card-border)]/30 dark:hover:bg-[color:var(--ai-card-border)]/20 transition-colors"
                aria-label="Website"
            >
                <WebsiteIcon className="text-[color:var(--ai-primary)]" size={20} />
            </a>
            <a
                href="https://tiktok.com/@dragoscatalin.ro"
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer p-2 rounded-lg hover:bg-[color:var(--ai-card-border)]/30 dark:hover:bg-[color:var(--ai-card-border)]/20 transition-colors"
                aria-label="TikTok"
            >
                <TikTokIcon className="text-[color:var(--ai-primary)]" size={20} />
            </a>
            <a
                href="https://instagram.com/dragoscatalin.ro"
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer p-2 rounded-lg hover:bg-[color:var(--ai-card-border)]/30 dark:hover:bg-[color:var(--ai-card-border)]/20 transition-colors"
                aria-label="Instagram"
            >
                <InstagramIcon className="text-[color:var(--ai-primary)]" size={20} />
            </a>
        </div>
    );
}