import React, { useState, useEffect, useRef, MouseEventHandler } from 'react';
import { TreeUser } from '@/types/network-tree';
import { ChevronDown, ChevronRight, User, Phone, Mail, Calendar, X } from 'lucide-react';

interface TreeNodeProps {
  user: TreeUser;
  level: number;
  position: number;
  onNodeClick: (user: TreeUser) => void;

}

const TreeNode: React.FC<TreeNodeProps> = ({ 
  user, 
  level, 
  position, 
  onNodeClick 
}) => {
  const nodeRef = useRef<HTMLDivElement>(null);

  const joinDate = new Date(user.created_at).toLocaleDateString('en-GB');

  const handleClick: MouseEventHandler<HTMLDivElement> = (e) => {
    e.stopPropagation();
    onNodeClick(user);
  };

  return (
    <div 
      ref={nodeRef}
      className="group relative 
      bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-lg hover:shadow-xl hover:border-brand-400 transition-all duration-300 min-w-[50px] mx-auto cursor-pointer flex-shrink-0"
      style={{ 
        marginTop: '40px',
        transform: `translateX(${position * 320}px)`
      }}
      onClick={handleClick}
    >
      {/* Vertical line connector from parent */}
      <div className="absolute top-[-40px] left-1/2 w-0.5 bg-gray-300 dark:bg-gray-600 h-10 transform -translate-x-1/2 z-0" />
      
      {/* Node Content */}
      <div className="flex items-start justify-between mb-3 relative z-10">
        <div className=" ">
          <div className="w-12 h-12 bg-gradient-to-br mx-auto from-brand-500 to-brand-600 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-lg flex-shrink-0">
            {user.username.slice(-4)}
          </div>
          <div className="">
            <p className="font-bold text-base text-gray-900 dark:text-white truncate leading-tight">
              {user.username}
            </p>
            <p className="text-sm font-mono text-gray-700 dark:text-gray-300 truncate">{user.phone}</p>
            <p className="text-sm font-mono text-gray-700 dark:text-gray-300 truncate">{user.referral_code}</p>
          </div>
        </div>

      </div>

      {/* Details */}
      {/* <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
        <div className="flex items-center gap-1.5">
          <Mail className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{user.email || 'No email'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{joinDate}</span>
        </div>
        <div className="flex items-center gap-1.5 truncate">
          <span className="font-mono text-gray-500 text-[10px]">Path:</span>
          <span className="font-mono truncate">{user.node_path}</span>
        </div>
      </div> */}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-brand-500/10 to-brand-600/10 opacity-0 group-hover:opacity-100 rounded-2xl backdrop-blur-sm 
      transition-all duration-300 flex items-center justify-center pointer-events-none border-2 border-transparent group-hover:border-brand-400">
        <span className="text-brand-700 font-semibold text-xs px-3 py-1 bg-white/80 dark:bg-gray-900/80 rounded-xl shadow-sm">
          Click for details
        </span>
      </div>
    </div>
  );
};

interface NetworkTreeProps {
  treeData: TreeUser[];
}

const NetworkTree: React.FC<NetworkTreeProps> = ({ treeData }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<TreeUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);



  const handleNodeSelect = (user: TreeUser) => {
    setSelectedNode(user);
  };

  const closeModal = () => setSelectedNode(null);



  const renderLevel = (users: TreeUser[], level = 0): React.ReactNode => {
    if (users.length === 0) return null;

    return (
      <div className="flex items-start justify-center relative mb-12 min-h-[160px]">
        {/* Horizontal connector line for this level */}
        <div className="absolute top-12 left-0 right-0 h-1 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 dark:from-gray-600 dark:via-gray-500 dark:to-gray-600 opacity-50" />
        
        <div className="flex gap-4 flex-wrap justify-center items-start w-full px-8">
          {users.map((user, index) => {
            const leftChild = user.children?.[0];
            const rightChild = user.children?.[1] || user.children?.slice(1)[0]; // Binary preference
            
            return (
              <div key={user.id} className="flex flex-col items-center relative group/level">
                <TreeNode
                  user={user}
                  level={level}
                  position={index - users.length / 2}
                  onNodeClick={handleNodeSelect}
                />
                {/* Always show branch connectors */}
                <div className="absolute top-[calc(100%+8px)] left-1/2 w-0.5 bg-brand-300 dark:bg-brand-500 h-4 transform -translate-x-1/2 z-10" />
                <div className="absolute top-[calc(100%+12px)] w-24 h-0.5 bg-brand-300 dark:bg-brand-500 -translate-x-1/2 left-1/2 transform -rotate-0 z-10 rounded-full" />
                
                {/* Branch connectors to children */}

                
                {/* Children level */}
                {user.children && user.children.length > 0 && (
                  <div className="mt-12 w-full flex justify-center">
                    <div className="flex gap-16">
                      {leftChild && renderLevel([leftChild], level + 1)}
                      {rightChild && !leftChild && renderLevel([rightChild], level + 1)}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-screen max-h-[80vh] overflow-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-slate-900 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl">
      <div ref={containerRef} className="min-w-max mx-auto">
        {treeData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-gray-500 dark:text-gray-400">
            <User className="w-24 h-24 mb-6 opacity-40" strokeWidth={1} />
            <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-gray-600 to-gray-400 bg-clip-text text-transparent">
              Network Tree
            </h2>
            <p className="text-xl mb-8 opacity-70">No downline data found</p>
            <p className="text-sm opacity-60">Your binary genealogy tree will appear here</p>
          </div>
        ) : (
          <>
            <h6 className="text-4xl font-black mb-12 text-center bg-gradient-to-r from-brand-600 via-brand-500 to-indigo-600 bg-clip-text text-transparent drop-shadow-lg">
              Binary Network Tree
            </h6>
            <div className="max-w-7xl mx-auto">
              {renderLevel(treeData)}
            </div>
          </>
        )}
      </div>

      {/* Enhanced Modal */}
      {selectedNode && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6 animate-in fade-in zoom-in duration-200"
          onClick={closeModal}
        >
          <div 
            className="bg-white/90 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl p-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-3xl border border-white/20 dark:border-gray-700/50 animate-in slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-3xl font-black bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                  Member Profile
                </h2>
                <p className="text-sm text-gray-500 mt-1">Click node to view details</p>
              </div>
              <button 
                onClick={closeModal}
                className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl transition-all hover:scale-105 shadow-lg"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="space-y-8">
              <div className="flex items-start gap-6 p-8 bg-gradient-to-r from-brand-50 to-indigo-50 dark:from-brand-500/10 dark:to-indigo-500/10 rounded-3xl border-2 border-brand-100 dark:border-brand-800/50">
                <div className="w-24 h-24 bg-gradient-to-br from-brand-500 via-brand-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-2xl flex-shrink-0 ring-4 ring-white/50 -rotate-6">
                  {selectedNode.username.slice(-4)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-3 mb-2">
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white">{selectedNode.username}</h3>
                    <div className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 rounded-full text-xs font-semibold uppercase tracking-wide">
                      Active
                    </div>
                  </div>
                  <p className="text-3xl font-mono font-bold text-brand-600 mb-6 tracking-tight">{selectedNode.phone}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <span className="text-sm text-gray-500 font-medium uppercase tracking-wide mb-2 block">Node Path</span>
                      <code className="font-mono text-sm bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-xl block truncate">
                        {selectedNode.node_path}
                      </code>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 font-medium uppercase tracking-wide mb-2 block">Referrer</span>
                      <span className="font-semibold text-lg">{selectedNode.referrer_id}</span>
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
                      <Calendar className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        {new Date(selectedNode.created_at).toLocaleString('en-GB', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
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
                        Lv. {levelFromPath(selectedNode.node_path)}
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
        </div>
      )}
    </div>
  );
};

// Helper function
function levelFromPath(path: string): number {
  return (path.match(/\./g) || []).length + 1;
}

NetworkTree.displayName = 'NetworkTree';

export default NetworkTree;

