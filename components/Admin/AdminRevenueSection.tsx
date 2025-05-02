import React from 'react';
import { Card, CardBody } from '@heroui/react';
import { AdminAnalytics } from '@/types';

interface AdminRevenueSectionProps {
  analytics: AdminAnalytics | null;
}

export default function AdminRevenueSection({ analytics }: AdminRevenueSectionProps) {
  if (!analytics) return null;
  return (
    <Card className="shadow-md mb-8">
      <CardBody>
        <h2 className="text-xl font-semibold mb-4">Monthly Revenue</h2>
        {analytics.monthlyRevenue && Object.keys(analytics.monthlyRevenue).length > 0 ? (
          <div className="space-y-2">
            {Object.entries(analytics.monthlyRevenue)
              .sort(([monthA], [monthB]) => {
                const [monthA_num, yearA] = monthA.split('/').map(Number);
                const [monthB_num, yearB] = monthB.split('/').map(Number);
                if (yearA !== yearB) return yearB - yearA;
                return monthB_num - monthA_num;
              })
              .slice(0, 6)
              .map(([month, revenue]) => (
                <div key={month} className="flex items-center justify-between py-2">
                  <div className="font-medium text-gray-800 dark:text-gray-200">
                    {month}
                  </div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {revenue.toLocaleString('ro-RO', { style: 'currency', currency: 'RON' })}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            No revenue data available yet
          </p>
        )}
      </CardBody>
    </Card>
  );
}
