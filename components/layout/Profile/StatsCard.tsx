import React from 'react';
import { Card, CardBody } from '@heroui/react';
import { motion } from 'framer-motion';

interface StatsCardProps {
    icon: React.ReactNode;
    title: string;
    value: number | string;
    footer: string;
    colorClass: string;
}

export default function StatsCard({ icon, title, value, footer, colorClass }: StatsCardProps) {
    return (
        <motion.div
            whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
            transition={{ duration: 0.3 }}
        >            <Card className="border border-[color:var(--ai-card-border)] overflow-hidden h-full rounded-xl shadow-sm bg-[color:var(--ai-card-bg)] dark:bg-[color:var(--ai-card-bg)]">
                <div className={`absolute top-0 right-0 w-24 h-24 -mt-8 -mr-8 rounded-full bg-gradient-to-br ${colorClass} opacity-20 blur-sm`}></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 -mb-6 -ml-6 rounded-full bg-gradient-to-br ${colorClass} opacity-10 blur-sm"></div>

                <CardBody className="p-5">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg bg-gradient-to-br ${colorClass} bg-opacity-10 dark:bg-opacity-25 shadow-inner`}>
                            {icon}
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-[color:var(--ai-foreground)]">{value}</h3>
                            <p className="text-xs text-[color:var(--ai-muted)]">{title}</p>
                        </div>
                    </div>
                    <div className="mt-4 text-xs text-[color:var(--ai-muted)] font-medium flex items-center">
                        <div className="h-1 w-5 rounded-full bg-gradient-to-r ${colorClass} mr-2 opacity-60"></div>
                        {footer}
                    </div>
                </CardBody>
            </Card>
        </motion.div>
    );
}
