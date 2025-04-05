'use client'

import { Resource } from '@/types'

interface ResourcesListProps {
    resources: Resource[];
}

export default function ResourcesList({
    resources
}: ResourcesListProps) {
    if (!resources || resources.length === 0) {
        return null;
    }

    return (
        <div className="p-6">
            <h3 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                Lesson Resources
            </h3>
            <ul className="space-y-3">
                {resources.map((resource: Resource, index: number) => (
                    <li key={index} className="group">
                        <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 bg-white/50 dark:bg-gray-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all duration-300 group"
                        >
                            <div className="mr-3 p-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-800/50 transition-colors">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <span className="text-indigo-600 dark:text-indigo-400 font-medium group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">
                                    {resource.name}
                                </span>
                            </div>
                            <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    )
}