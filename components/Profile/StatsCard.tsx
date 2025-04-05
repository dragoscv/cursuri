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
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="border border-[color:var(--ai-border)] overflow-hidden h-full">
                <div className={`absolute top-0 right-0 w-20 h-20 -mt-8 -mr-8 rounded-full bg-gradient-to-br ${colorClass} opacity-20`}></div>
                <CardBody>
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-[color:var(--ai-card-bg)]/80">
                            {icon}
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-[color:var(--ai-foreground)]">{value}</h3>
                            <p className="text-xs text-[color:var(--ai-muted)]">{title}</p>
                        </div>
                    </div>
                    <div className="mt-4 text-xs text-[color:var(--ai-muted)] font-medium">
                        {footer}
                    </div>
                </CardBody>
            </Card>
        </motion.div>
    );
}