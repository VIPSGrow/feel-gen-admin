"use client";
import serverCallFuction from '@/lib/constantFunction';
import { ApiTreeResponse, TreeUser } from '@/types/network-tree';
import React from 'react'
import { RefreshCw } from 'lucide-react';
import NetworkTree from './NetworkTree';
interface PageProps {
    searchParams: { refresh?: string };
}

const TreeCompo = () => {
    const [treeData, setTreeData] = React.useState<TreeUser[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [refreshKey, setRefreshKey] = React.useState(0);

    React.useEffect(() => {
        fetchTreeData();
    }, [refreshKey]);

    const fetchTreeData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await serverCallFuction('GET', 'api/users/tree') as ApiTreeResponse;

            if (response.status) {
                setTreeData(response.data || []);
            } else {
                setError('Failed to fetch network tree: ' + (response.message || 'Server error'));
            }
        } catch (err) {
            setError('Network error. Please check your connection.');
            console.error('Tree fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1);
    };
    if (loading) {
        return (
            <div className="p-12 space-y-8">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl" />
                    <div className="space-y-3">
                        <div className="h-8 w-64" />
                        <div className="h-4 w-48" />
                    </div>
                </div>
                <div className="h-96 w-full rounded-3xl" />
            </div>
        );
    }
    return (
        <div className="p-6  mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black bg-gradient-to-r from-gray-900 via-brand-600 to-indigo-700 bg-clip-text text-transparent mb-3 drop-shadow-lg">
                        Network Tree
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed">
                        View your complete binary genealogy tree. Click nodes to expand and view detailed member profiles.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleRefresh}
                        className="flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        Refresh Tree
                    </button>
                </div>
            </div>

            {error ? (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-3xl p-12 text-center">
                    <div className="max-w-md mx-auto">
                        <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <RefreshCw className="w-12 h-12 text-red-500 opacity-60 rotate-12" />
                        </div>
                        <h3 className="text-2xl font-bold text-red-900 dark:text-red-300 mb-4">Failed to load network</h3>
                        <p className="text-lg text-red-700 dark:text-red-200 mb-8 opacity-90">{error}</p>
                        <button
                            onClick={handleRefresh}
                            className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center gap-2"
                        >
                            <RefreshCw className="w-5 h-5" />
                            Try Again
                        </button>
                    </div>
                </div>
            ) : (
                <NetworkTree treeData={treeData} />
            )}

            {treeData.length > 0 && (
                <div className="mt-12 pt-12 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500 dark:text-gray-400">
                    <p>Showing {treeData.length} direct downline members. Expand nodes to view deeper levels.</p>
                    <p className="mt-2 text-xs opacity-75">Data fetched from api/users/tree • Last refresh: {new Date().toLocaleTimeString()}</p>
                </div>
            )}
        </div>
    )
}

export default TreeCompo
