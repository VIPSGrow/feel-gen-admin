"use client";
import serverCallFuction from '@/lib/constantFunction';
import { TreeUser } from '@/types/network-tree';
import React, { useEffect, useState } from 'react'
import GenealogyTree from './GenealogyTree';
import { Calendar, CopyIcon, Mail, Phone, RefreshCw, X } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import { useSearchParams } from 'next/navigation';
const TreeConnector = () => {

    const [treeData, setTreeData] = React.useState<TreeUser[]>([]);
    const [loading, setLoading] = React.useState(true);


    // 1. Get the search params from the URL
    const searchParams = useSearchParams();
    const urlSelectedId = searchParams.get('selectd_id');

    const [selectedNode, setSelectedNode] = React.useState<TreeUser | null>(null);

    const fetchTreeData = async () => {
        try {
            setLoading(true);
            const endpoint = urlSelectedId
                ? `api/users/tree-by-id/${urlSelectedId}`
                : 'api/users/tree';
            const res = await serverCallFuction('GET', endpoint);
            setLoading(false);
            if (res.status) {
                setTreeData(res.data);
            }
        } catch (error) {
            setLoading(false);
            console.error('Error fetching tree data:', error);
        }
    }
    // 2. Fetch data whenever the URL ID changes
    useEffect(() => {
        fetchTreeData();
    }, [urlSelectedId]);



    const handleNodeSelect = (user: TreeUser) => {
        setSelectedNode(user);
    };

    const closeModal = () => setSelectedNode(null);
    const handleRefresh = () => {
        fetchTreeData()
    }

    const [copied, setCopied] = useState(false);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    const referralLink = `${baseUrl.replace(/\/$/, '')}/signup?ref=${selectedNode?.referral_code}`;
    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <>
            <div className="p-6  mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black bg-gradient-to-r from-gray-900 via-brand-600 to-indigo-700 dark:from-gray-300 bg-clip-text text-transparent mb-1 drop-shadow-lg">
                            Network Tree
                        </h1>
                        <p className=" text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed">
                            View your sponsor-based referral genealogy through Generation 7.
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


                <GenealogyTree data={treeData} onSelect={handleNodeSelect} />
                {selectedNode &&
                    <Modal
                        // className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6 animate-in fade-in zoom-in duration-200"
                        isOpen={!!selectedNode}
                        onClose={closeModal}
                        className='max-w-xl mx-auto'
                    >

                        <div
                            className='p-6'
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className='mb-6'>
                                <h2 className="text-lg font-bold ">
                                    Member Profile
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">Click node to view details</p>
                            </div>


                            <div className="space-y-8">
                                <div className="flex items-start gap-6 p-8 bg-gradient-to-r from-brand-50 to-indigo-50 dark:from-brand-500/10 dark:to-indigo-500/10 rounded-3xl border-2 border-brand-100 dark:border-brand-800/50">
                                    {/* <div className="w-24 h-24 bg-gradient-to-br from-brand-500 via-brand-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-2xl flex-shrink-0 ring-4 ring-white/50 -rotate-6">
                                        {selectedNode.username.slice(-4)}
                                    </div> */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-baseline gap-3 mb-2">
                                            <h3 className="text-2xl font-black text-gray-900 dark:text-white">Name : {selectedNode.full_name}</h3>
                                            <div className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 rounded-full text-xs font-semibold uppercase tracking-wide">
                                                Active
                                            </div>
                                            <div className="px-3 py-1 bg-warning-100 dark:bg-warning-900/50 text-warning-800 dark:text-warning-200 rounded-full text-xs font-semibold uppercase tracking-wide">
                                                {selectedNode?.kyc_status === true ? "Verified" : "Pending"}
                                            </div>
                                        </div>
                                        <p className="text-3xl font-mono font-bold text-brand-600 mb-6 tracking-tight">Ph.: {selectedNode.phone}
                                            <span className='text-lg'> ( {selectedNode.team_size === 0 ? 'Sakhi' : selectedNode.level_name} )</span>
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* <div>
                                                <span className="text-sm text-gray-500 font-medium uppercase tracking-wide mb-2 block">Node Path</span>
                                                <code className="font-mono text-sm bg-gray-100 dark:bg-gray-400 px-3 py-2 rounded-xl block truncate">
                                                    {selectedNode.node_path}
                                                </code>
                                            </div> */}
                                            <div>
                                                <span className="text-sm text-gray-500 font-medium uppercase tracking-wide mb-2 block">Upline</span>
                                                <span className="font-semibold text-lg dark:text-gray-300 me-2">
                                                    {selectedNode.referrer ? <>{selectedNode.referrer?.full_name}</> : "N/A"}
                                                </span>
                                                <span className="font-semibold text-md dark:text-gray-300 ">
                                                    ({selectedNode.referrer ? <>{selectedNode.referrer?.phone}</> : "N/A"})
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-sm text-gray-500 font-medium uppercase tracking-wide mb-2 block">Referral Code</span>
                                                <div className="flex items-center gap-3 bg-gray-100 rounded-xl dark:bg-gray-300/50 px-2">
                                                    <span className="font-semibold text-lg">{selectedNode.referral_code}</span>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={handleCopy}
                                                        className="h-9 px-3"
                                                    >
                                                        <CopyIcon className="size-4 mr-1" />
                                                        {copied ? "Copied!" : "Copy"}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div>
                                        <h4 className="font-bold text-lg mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                                            Contact Info
                                        </h4>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                                <Mail className="w-5 h-5 text-brand-500 flex-shrink-0" />
                                                <span className="text-gray-700 dark:text-gray-300">{selectedNode.email || 'Not provided'}</span>
                                            </div>
                                            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                                {/* <Phone className="w-5 h-5 text-indigo-500 flex-shrink-0" /> */}
                                                <svg className="w-5 h-5 text-indigo-500 flex-shrink-0" viewBox="0 0 24 24" role="img" xmlns="http://www.w3.org/2000/svg"><title>WhatsApp icon</title><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                                                <span className="text-gray-700 dark:text-gray-300 font-medium">
                                                    {selectedNode.phone}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-bold text-lg mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                                            Network Stats
                                        </h4>
                                        <div className="grid grid-cols-2 gap-4 p-6 bg-gradient-to-b from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/20 rounded-2xl border border-emerald-200/50 dark:border-emerald-700/50">
                                            <div className="text-center">
                                                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mb-1">
                                                    {selectedNode.children?.length || 0}
                                                </div>
                                                <div className="text-xs uppercase text-emerald-700 dark:text-emerald-300 font-semibold tracking-wide">
                                                    Direct Children
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mb-1">
                                                    {/* Lv. {levelFromPath(selectedNode.node_path)} */}
                                                    Lv. {getRelativeLevel(selectedNode.node_path, treeData[0].node_path)}
                                                </div>
                                                <div className="text-xs uppercase text-blue-700 dark:text-blue-300 font-semibold tracking-wide">
                                                    Depth Level
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>


                    </Modal>}
            </div >
        </>
    )
}
function levelFromPath(path: string): number {
    return (path.match(/\./g) || []).length + 1;
}

function getRelativeLevel(nodePath: string, rootPath: string): number {
    const nodeDepth = (nodePath.match(/\./g) || []).length + 1;
    const rootDepth = (rootPath.match(/\./g) || []).length + 1;

    // Result: Root is Level 1, children are Level 2, etc.
    return (nodeDepth - rootDepth) + 1;
}
export default TreeConnector
