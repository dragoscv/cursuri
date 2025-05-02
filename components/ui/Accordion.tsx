import React, { createContext, useContext, useState } from 'react';

interface AccordionContextProps {
    openItem: string | null;
    toggleItem: (id: string) => void;
}

const AccordionContext = createContext<AccordionContextProps | null>(null);

export interface AccordionProps {
    children: React.ReactNode;
    defaultOpenItem?: string | null;
    className?: string;
}

export default function Accordion({ children, defaultOpenItem = null, className = '' }: AccordionProps) {
    const [openItem, setOpenItem] = useState<string | null>(defaultOpenItem);

    const toggleItem = (id: string) => {
        setOpenItem(prevOpen => (prevOpen === id ? null : id));
    };

    return (
        <AccordionContext.Provider value={{ openItem, toggleItem }}>
            <div className={`divide-y divide-[color:var(--ai-card-border)] ${className}`}>
                {children}
            </div>
        </AccordionContext.Provider>
    );
}

export interface AccordionItemProps {
    id: string;
    title: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    titleClassName?: string;
    bodyClassName?: string;
    disabled?: boolean;
    startContent?: React.ReactNode;
    endContent?: React.ReactNode;
}

export const AccordionItem = ({
    id,
    title,
    children,
    className = '',
    titleClassName = '',
    bodyClassName = '',
    disabled = false,
    startContent,
    endContent,
}: AccordionItemProps) => {
    const accordionContext = useContext(AccordionContext);

    if (!accordionContext) {
        throw new Error("AccordionItem must be used within an Accordion component");
    }

    const { openItem, toggleItem } = accordionContext;
    const isOpen = openItem === id;

    return (
        <div className={`border border-[color:var(--ai-card-border)]/50 rounded-lg mb-3 overflow-hidden ${className}`}>
            <button
                type="button"
                className={`flex items-center justify-between w-full p-4 text-left ${isOpen ? 'bg-[color:var(--ai-primary)]/10' : 'bg-[color:var(--ai-card-bg)]'
                    } hover:bg-[color:var(--ai-primary)]/5 transition-colors ${titleClassName}`}
                onClick={() => !disabled && toggleItem(id)}
                disabled={disabled}
            >
                <div className="flex items-center gap-2">
                    {startContent}
                    <span className="font-medium">{title}</span>
                </div>
                <div className="flex items-center gap-2">
                    {endContent}
                    <svg
                        className={`w-5 h-5 transform transition-transform ${isOpen ? 'rotate-180' : ''
                            }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                        />
                    </svg>
                </div>
            </button>
            {isOpen && (
                <div className={`p-4 bg-[color:var(--ai-card-bg)]/50 ${bodyClassName}`}>
                    {children}
                </div>
            )}
        </div>
    );
};
