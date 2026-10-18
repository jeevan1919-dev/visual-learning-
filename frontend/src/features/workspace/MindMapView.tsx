import React, { useState, useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  Node,
  Edge,
} from '@xyflow/react';
import {
  Network,
  Maximize2,
  ExternalLink,
  BookOpen,
  X,
  Search,
  Sparkles
} from 'lucide-react';
import { MindMapData, MindMapNodeData } from '../../types';
import { Badge } from '../../components/common/Badge';

interface MindMapViewProps {
  data: MindMapData;
  onJumpToPage?: (page: number) => void;
}

// Custom Mind Map Node Component
const CustomMindMapNode = ({ data }: { data: MindMapNodeData & { onSelect: (node: MindMapNodeData) => void } }) => {
  const isRoot = data.category === 'root';
  const isSubtopic = data.category === 'subtopic';

  return (
    <div
      onClick={() => data.onSelect(data)}
      className={`px-4 py-3 rounded-2xl shadow-md transition-all hover:scale-105 cursor-pointer border ${
        isRoot
          ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white border-indigo-500 font-bold min-w-[180px] text-center'
          : isSubtopic
          ? 'bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-800 text-slate-900 dark:text-slate-100 min-w-[150px]'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 min-w-[140px]'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-indigo-400 !w-2 !h-2" />
      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold truncate">{data.label}</span>
        {data.page_reference && !isRoot && (
          <span className="text-[10px] text-slate-400 dark:text-slate-500">
            Page {data.page_reference}
          </span>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-indigo-400 !w-2 !h-2" />
    </div>
  );
};

export const MindMapView: React.FC<MindMapViewProps> = ({ data, onJumpToPage }) => {
  const [selectedNode, setSelectedNode] = useState<MindMapNodeData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Register custom node type
  const nodeTypes = useMemo(() => ({ mindmapNode: CustomMindMapNode }), []);

  // Compute hierarchical layout coordinates
  const initialNodes: Node[] = useMemo(() => {
    if (!data.nodes || data.nodes.length === 0) return [];

    const root = data.nodes.find((n) => n.id === 'root') || data.nodes[0];
    const subtopics = data.nodes.filter((n) => n.parent_id === root.id || n.category === 'subtopic');
    const leafNodes = data.nodes.filter((n) => n.id !== root.id && !subtopics.includes(n));

    const nodesList: Node[] = [];

    // Place root
    nodesList.push({
      id: root.id,
      type: 'mindmapNode',
      position: { x: 450, y: 50 },
      data: { ...root, onSelect: (n: MindMapNodeData) => setSelectedNode(n) },
    });

    // Place subtopics in a row
    const subCount = subtopics.length || 1;
    const subSpacing = 280;
    const startX = 450 - ((subCount - 1) * subSpacing) / 2;

    subtopics.forEach((sub, i) => {
      const subX = startX + i * subSpacing;
      const subY = 220;

      nodesList.push({
        id: sub.id,
        type: 'mindmapNode',
        position: { x: subX, y: subY },
        data: { ...sub, onSelect: (n: MindMapNodeData) => setSelectedNode(n) },
      });

      // Find children of this subtopic
      const children = leafNodes.filter((l) => l.parent_id === sub.id);
      children.forEach((child, cIdx) => {
        nodesList.push({
          id: child.id,
          type: 'mindmapNode',
          position: {
            x: subX + (cIdx === 0 ? -70 : 70),
            y: subY + 140 + cIdx * 60,
          },
          data: { ...child, onSelect: (n: MindMapNodeData) => setSelectedNode(n) },
        });
      });
    });

    // Add any remaining unconnected nodes
    leafNodes
      .filter((l) => !nodesList.some((nl) => nl.id === l.id))
      .forEach((rem, idx) => {
        nodesList.push({
          id: rem.id,
          type: 'mindmapNode',
          position: { x: 200 + idx * 180, y: 480 },
          data: { ...rem, onSelect: (n: MindMapNodeData) => setSelectedNode(n) },
        });
      });

    return nodesList;
  }, [data]);

  const initialEdges: Edge[] = useMemo(() => {
    return (data.edges || []).map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label,
      animated: true,
      style: { stroke: '#818cf8', strokeWidth: 2 },
    }));
  }, [data]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Filter or highlight matching search
  const filteredNodes = useMemo(() => {
    if (!searchQuery.trim()) return nodes;
    return nodes.map((n) => {
      const matches = (n.data as any).label?.toLowerCase().includes(searchQuery.toLowerCase());
      return {
        ...n,
        style: matches
          ? { border: '2px solid #ec4899', borderRadius: '16px' }
          : { opacity: 0.4 },
      };
    });
  }, [nodes, searchQuery]);

  return (
    <div className="relative w-full h-[calc(100vh-8rem)] flex flex-col bg-slate-50 dark:bg-slate-950">
      {/* Mindmap Toolbar */}
      <div className="p-3 sm:px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
            Interactive Knowledge Graph
          </span>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            ({data.nodes?.length || 0} nodes • Drag, pan & zoom)
          </span>
        </div>

        {/* Search within Mind Map */}
        <div className="relative max-w-xs w-48 sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2 text-slate-400" />
          <input
            type="text"
            placeholder="Find node in map..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-hidden text-slate-800 dark:text-slate-200"
          />
        </div>
      </div>

      {/* React Flow Canvas */}
      <div className="flex-1 w-full h-full relative">
        <ReactFlow
          nodes={filteredNodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.2}
          maxZoom={2.5}
        >
          <Background color="#cbd5e1" gap={20} size={1} />
          <Controls position="bottom-right" />
          <MiniMap
            nodeColor={() => '#818cf8'}
            maskColor="rgba(15, 23, 42, 0.4)"
            className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden"
          />
        </ReactFlow>
      </div>

      {/* Selected Node Details Drawer */}
      {selectedNode && (
        <div className="absolute right-4 top-16 z-20 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-5 animate-in slide-in-from-right duration-200">
          <div className="flex items-start justify-between mb-3">
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-600 dark:text-indigo-400">
                {selectedNode.category || 'Concept Node'}
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {selectedNode.label}
              </h3>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
            {selectedNode.description || 'Core concept extracted from document synthesis.'}
          </p>

          {selectedNode.page_reference && onJumpToPage && (
            <button
              onClick={() => onJumpToPage(selectedNode.page_reference!)}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Inspect Source on Page {selectedNode.page_reference}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
