import React, { useState } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import '@/components/admin/GenologyTree/GenealogyTree.css';
import { EyeIcon } from '@/icons';
import { TreeUser } from '@/types/network-tree';

interface Member {
  id: number;
  username: string;
  email: string;
  phone: string;
  node_path: string;
  referrer_id: number;
  referral_code: string;
  created_at: string;
  is_active: boolean;
  kyc_status: boolean;
  children: Member[];
  level_name?: string;
  commission_earned?: string | number;
  total_commission?: string | number;
}

interface TreeNodeProps {
  member: Member;
  onSelect: (member: Member) => void;
  distributorLevel: number;
}

const RANK_ORDER: Record<string, number> = {
  'distributor': 1,
  'silver': 2,
  'gold': 3,
  'platinum': 4,
  'diamond': 5,
};

function getRankLevel(levelName: string): number {
  return RANK_ORDER[levelName.toLowerCase()] || 1;
}

const TreeNode: React.FC<TreeNodeProps> = ({ member, onSelect, distributorLevel }) => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const hasChildren = member.children && member.children.length > 0;
  const nodeRankLevel = getRankLevel(member.level_name || 'distributor');
  const isGreenZone = nodeRankLevel <= distributorLevel;

  return (
    <li className="bg-warning">
      <a href="#" onClick={(e) => e.preventDefault()}>
        <div
          className={`member-view-box ${isGreenZone
            ? 'bg-emerald-100 dark:bg-emerald-900/50 border-2 border-emerald-400'
            : member.kyc_status
              ? member.is_active
                ? 'bg-gray-200 dark:bg-gray-500'
                : 'bg-warning-300 dark:bg-warning-300'
              : 'bg-error-300 dark:bg-error-300'
            }`}
          onClick={toggleOpen}
        >
          <div className="member-header">
            <span>{member.phone}</span>
          </div>
          <div className="member-image" onClick={toggleOpen}>
            <img
              src="https://cdn-icons-png.flaticon.com/512/1077/1077114.png"
              alt={member.username}
            />
          </div>
          <div className="member-footer">
            <div className="name">
                  <span>{member.username}</span>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${member.level_name && getRankLevel(member.level_name) <= distributorLevel ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300' : 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'}`}>
                      {member.level_name || 'N/A'}
                  </span>
              </div>
            <div className="downline">
              <span>{member.referral_code}</span>
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(member);
                }}
                className="cursor-pointer"
              >
                <EyeIcon className="mx-auto" />
              </span>
            </div>
          </div>
        </div>
      </a>

      {hasChildren && isOpen && (
        <ul className="active">
              {member.children.map((child) => (
                <TreeNode key={child.id} member={child} onSelect={onSelect} distributorLevel={distributorLevel} />
              ))}
        </ul>
      )}
    </li>
  );
};

const GenealogyTree: React.FC<{
  data: Member[];
  onSelect: (member: Member) => void;
  distributorLevel: number;
}> = ({ data, onSelect, distributorLevel }) => {
  return (
    <div className="relative w-full h-[65vh] min-h-[500px] overflow-hidden rounded-[10px] shadow-md bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 select-none">
      <TransformWrapper
        initialScale={1}
        minScale={0.1}
        maxScale={2.5}
        centerOnInit={true}
        limitToBounds={false}
        smooth={true}
        wheel={{
          disabled: false,
          step: 0.003, // Small value to prevent sudden huge zoom steps
          smoothStep: 0.001,
        }}
        pinch={{ disabled: false }}
        doubleClick={{ disabled: true }}
        panning={{
          disabled: false,
          velocityDisabled: true, // Prevents unwanted kinetic inertia on pan
        }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            {/* Floating Zoom Controls */}
            <div className="absolute top-4 right-4 z-30 flex items-center gap-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur p-1.5 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => zoomIn(0.15)}
                className="w-8 h-8 flex items-center justify-center font-bold text-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-200 transition-colors"
                title="Zoom In"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => zoomOut(0.15)}
                className="w-8 h-8 flex items-center justify-center font-bold text-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-200 transition-colors"
                title="Zoom Out"
              >
                -
              </button>
              <button
                type="button"
                onClick={() => resetTransform()}
                className="px-3 h-8 text-xs font-semibold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-200 transition-colors"
                title="Reset View"
              >
                Reset
              </button>
            </div>

            {/* Canvas Area */}
            <TransformComponent
              wrapperStyle={{
                width: '100%',
                height: '100%',
                overflow: 'hidden',
              }}
              contentStyle={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
                minWidth: '100%',
                minHeight: '100%',
                padding: '40px',
              }}
            >
              <div className="genealogy-body cursor-grab active:cursor-grabbing">
                <div className="genealogy-tree">
                  <ul>
                    {data && data.length > 0 ? (
                      data.map((rootMember) => (
                        <TreeNode
                          key={rootMember.id}
                          member={rootMember}
                          onSelect={onSelect}
                          distributorLevel={distributorLevel}
                        />
                      ))
                    ) : (
                      <li className="text-gray-500 text-sm">No tree data available.</li>
                    )}
                  </ul>
                </div>
              </div>
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </div>
  );
};

export default GenealogyTree;