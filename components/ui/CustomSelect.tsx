/**
 * Custom SelectItem component
 */

import React from 'react';

interface CustomSelectProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    className?: string;
    children: React.ReactNode;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
    value,
    onChange,
    className,
    children
}) => {
    return (
        <select
            value={value}
            onChange={onChange}
            className={`border border-[color:var(--ai-card-border)] rounded-md px-3 py-2 ${className || ''}`}
        >
            {children}
        </select>
    );
};

interface CustomSelectItemProps {
    value: string;
    children: React.ReactNode;
}

export const CustomSelectItem: React.FC<CustomSelectItemProps> = ({
    value,
    children
}) => {
    return <option value={value}>{children}</option>;
};
