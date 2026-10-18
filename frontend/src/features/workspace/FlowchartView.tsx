import React, { useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  Node,
  Edge,
  MarkerType,
} from '@xyflow/react';
import {
  GitFork,
  ArrowRight,
  ExternalLink,
  PlayCircle,
  HelpCircle,
  CheckCircle
} from 'lucide-react';
import { FlowchartData, FlowchartStepData } from '../../types';

interface FlowchartViewProps {
  data: FlowchartData;
  onJumpToPage?: (page: number) => void;
}

// Custom Process Node
const CustomProcessNode = ({ data }: { data: FlowchartStepData }) => {
  const isStart = data.step_type === 'start';
  const isDecision = data.step_type === 'decision';
  const isEnd = data.step_type === 'end';

  return (
    <div
      className={`px-4 py-3 shadow-md border transition-all hover:shadow-lg max-w-[240px] text-left ${
        isStart
          ? 'rounded-full bg-emerald-500 text-white border-emerald-400 font-bold px-6 text-center'
          : isEnd
          ? 'rounded-full bg-indigo-600 text-white border-indigo-500 font-bold px-6 text-center'
          : isDecision
          ? 'rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
          : 'rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-indigo-400 !w-2 !h-2" />

      <div className="flex items-start gap-2">
        {isStart && <PlayCircle className="w-4 h-4 shrink-0 mt-0.5" />}
        {isDecision && <HelpCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />}
        {isEnd && <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />}

        <div>
          <h4 className="text-xs font-bold leading-snug">{data.label}</h4>
          {!isStart && !isEnd && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {data.description}
            </p>
          )}
          {data.page_reference && !isStart && !isEnd && (
            <span className="inline-block mt-2 text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
              Page {data.page_reference}
            </span>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-indigo-400 !w-2 !h-2" />
    </div>
  );
};

export const FlowchartView: React.FC<FlowchartViewProps> = ({ data, onJumpToPage }) => {
  const nodeTypes = useMemo(() => ({ processNode: CustomProcessNode }), []);

  // Compute clean vertical pipeline positions
  const initialNodes: Node[] = useMemo(() => {
    if (!data.steps || data.steps.length === 0) return [];

    return data.steps.map((step, idx) => {
      let x = 400;
      let y = 60 + idx * 160;

      // If branch alternate step
      if (step.id.includes('alt')) {
        x = 640;
        y = y - 100;
      }

      return {
        id: step.id,
        type: 'processNode',
        position: { x, y },
        data: step,
      };
    });
  }, [data]);

  const initialEdges: Edge[] = useMemo(() => {
    if (!data.steps) return [];
    const edgesList: Edge[] = [];

    data.steps.forEach((step) => {
      // Direct next steps
      if (step.next_steps) {
        step.next_steps.forEach((targetId, tIdx) => {
          let label = undefined;
          if (step.step_type === 'decision' && step.decision_outcomes) {
            const entry = Object.entries(step.decision_outcomes).find(([_, dest]) => dest === targetId);
            if (entry) label = entry[0];
          }

          edgesList.push({
            id: `e_${step.id}_${targetId}_${tIdx}`,
            source: step.id,
            target: targetId,
            label,
            type: 'smoothstep',
            animated: true,
            markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' },
            style: { stroke: '#6366f1', strokeWidth: 2 },
          });
        });
      }
    });

    return edgesList;
  }, [data]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="relative w-full h-[calc(100vh-8rem)] flex flex-col bg-slate-50 dark:bg-slate-950">
      {/* Flowchart Header */}
      <div className="p-4 sm:px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between z-10">
        <div>
          <div className="flex items-center gap-2">
            <GitFork className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
              {data.title || 'Process Workflow Diagram'}
            </h2>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {data.description || 'Sequential logic, validation checkpoints, and outcomes.'}
          </p>
        </div>
      </div>

      {/* React Flow Canvas */}
      <div className="flex-1 w-full h-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.3}
          maxZoom={2.0}
        >
          <Background color="#cbd5e1" gap={20} size={1} />
          <Controls position="bottom-right" />
        </ReactFlow>
      </div>
    </div>
  );
};
