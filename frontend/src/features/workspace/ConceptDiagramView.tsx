import React from 'react';
import {
  Boxes,
  Layers,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { ConceptDiagramData } from '../../types';
import { Badge } from '../../components/common/Badge';

interface ConceptDiagramViewProps {
  data: ConceptDiagramData;
  onJumpToPage?: (page: number) => void;
}

export const ConceptDiagramView: React.FC<ConceptDiagramViewProps> = ({
  data,
  onJumpToPage,
}) => {
  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Title & Distinction Notice */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Badge variant="lavender" size="sm">
              Concept Architecture
            </Badge>
            <span className="text-xs text-slate-400">• Structural Network</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-full text-[11px] text-amber-700 dark:text-amber-300">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>AI Synthesized Structural Model (Distinguished from original textbook figures)</span>
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          {data.title}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
          {data.overview}
        </p>
      </div>

      {/* Architectural Hierarchy Tiers */}
      {data.hierarchy_levels && data.hierarchy_levels.length > 0 && (
        <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-500" />
            System Architectural Layers
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {data.hierarchy_levels.map((level, idx) => (
              <div
                key={idx}
                className="p-4 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xs"
              >
                <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs mb-2">
                  {idx + 1}
                </div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{level}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Entities Grid */}
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-4">
          <Boxes className="w-5 h-5 text-indigo-500" />
          Structural Components & Entities ({data.entities?.length || 0})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.entities?.map((ent) => (
            <div
              key={ent.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{ent.name}</h4>
                  {onJumpToPage && (
                    <button
                      onClick={() => onJumpToPage(ent.page_reference)}
                      className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <ExternalLink className="w-3 h-3" />
                      p.{ent.page_reference}
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{ent.role}</p>

                {ent.attributes && ent.attributes.length > 0 && (
                  <div className="space-y-1">
                    {ent.attributes.map((attr, aIdx) => (
                      <div
                        key={aIdx}
                        className="text-[11px] px-2.5 py-1 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg truncate"
                      >
                        • {attr}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Relationships */}
      {data.relationships && data.relationships.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Inter-Entity Relationships & Causal Links
          </h3>

          <div className="space-y-3">
            {data.relationships.map((rel, rIdx) => {
              const srcEnt = data.entities.find((e) => e.id === rel.source);
              const tgtEnt = data.entities.find((e) => e.id === rel.target);

              return (
                <div
                  key={rIdx}
                  className="flex flex-wrap items-center gap-2 sm:gap-4 p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs"
                >
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    {srcEnt?.name || rel.source}
                  </span>
                  <div className="flex items-center gap-1 px-2.5 py-0.5 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 font-medium text-[11px] text-slate-500">
                    <span>{rel.relationship}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                  </div>
                  <span className="font-bold text-purple-600 dark:text-purple-400">
                    {tgtEnt?.name || rel.target}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
