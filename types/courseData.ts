import { StripeProduct } from "./stripe";

// Interface for course data when creating or updating a course
export interface CourseData {
    name: string;
    description: string;
    price: string;
    priceProduct?: StripeProduct | null;
    priceProductId?: string | null;
    repoUrl: string;
    status: string;
    prerequisites: string[];
    benefits?: string[]; // Maps to courseObjectives in the UI
    requirements?: string[];
    level?: string;
    duration?: string;
    instructor?: string | { name: string; photoUrl?: string; bio?: string; title?: string; };
    tags?: string[];
    imageUrl?: string;
    metadata: {
        level: string;
        category?: string; // Legacy single category (optional for backward compatibility)
        categories?: string[]; // New multiple categories array
        tags: string[];
        requirements: string[];
        objectives: string[];
        instructorName: string;
        estimatedDuration: string;
        certificateEnabled: boolean;
        allowPromoCodes: boolean;
        [key: string]: any;
    };
    createdAt?: string;
    updatedAt: string;
}
