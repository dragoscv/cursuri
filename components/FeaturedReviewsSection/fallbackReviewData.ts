import { Review } from "@/types";

export const fallbackReviews: Review[] = [
    {
        id: "1",
        content: "The AI prediction models taught in this course completely transformed my approach to data analysis. The real-time feedback system makes learning intuitive and effective.",
        author: {
            name: "Alex Johnson",
            role: "AI Research Engineer",
            avatar: "https://i.pravatar.cc/150?img=11"
        },
        rating: 5,
        courseType: "Predictive Analysis"
    },
    {
        id: "2",
        content: "I've taken several programming courses before, but none were as comprehensive and practical as this one. The projects we built are now key pieces in my portfolio.",
        author: {
            name: "Samira Khan",
            role: "Frontend Developer",
            avatar: "https://i.pravatar.cc/150?img=23"
        },
        rating: 5,
        courseType: "React Masterclass"
    },
    {
        id: "3",
        content: "The instructor's attention to detail and real-world examples made complex concepts accessible. I was able to immediately apply what I learned to my current projects.",
        author: {
            name: "Michael Chen",
            role: "Software Architect",
            avatar: "https://i.pravatar.cc/150?img=8"
        },
        rating: 4,
        courseType: "Advanced TypeScript"
    }
];
