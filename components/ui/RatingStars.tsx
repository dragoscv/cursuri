'use client'

import React, { useState } from 'react';
import { FiStar } from '../icons/FeatherIcons';

interface RatingStarsProps {
    defaultValue?: number;
    value?: number;
    initialRating?: number;
    rating?: number;
    maxStars?: number;
    size?: number | 'sm' | 'md' | 'lg';
    onChange?: (rating: number) => void;
    readOnly?: boolean;
    className?: string;
    classNames?: {
        base?: string;
        item?: string;
    };
}

const RatingStars: React.FC<RatingStarsProps> = ({
    defaultValue = 0,
    value,
    initialRating,
    rating: ratingProp,
    maxStars = 5,
    size = 20,
    onChange,
    readOnly = false,
    className = '',
    classNames = { base: '', item: '' },
}) => {
    // Use rating prop if provided, otherwise fall back to value, defaultValue, or initialRating
    const initialValue = ratingProp ?? value ?? defaultValue ?? initialRating ?? 0;
    const [rating, setRating] = useState(initialValue);
    const [hoverRating, setHoverRating] = useState(0);

    const handleClick = (index: number) => {
        if (readOnly) return;
        const newRating = index + 1;
        setRating(newRating);
        if (onChange) onChange(newRating);
    };

    return (
        <div className={`flex ${className}`}>
            {[...Array(maxStars)].map((_, index) => {
                const filled = (hoverRating || rating) > index;

                return (
                    <div
                        key={index}
                        onClick={() => handleClick(index)}
                        onMouseEnter={() => !readOnly && setHoverRating(index + 1)}
                        onMouseLeave={() => !readOnly && setHoverRating(0)}
                        className={`cursor-${readOnly ? 'default' : 'pointer'} mr-1`}                    >
                        <FiStar
                            size={typeof size === 'string' ?
                                (size === 'sm' ? 16 : size === 'md' ? 20 : 24) :
                                size}
                            className={filled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                        />
                    </div>
                );
            })}
        </div>
    );
};

export default RatingStars;
