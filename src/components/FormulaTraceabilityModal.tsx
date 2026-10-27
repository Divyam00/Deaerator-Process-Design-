import React, { useState } from 'react';
import { FormulaTraceItem } from '../lib/deaeratorTypes';
import { BookOpen, X, Search, CheckCircle2, Bookmark } from 'lucide-react';

interface FormulaTraceabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  formulaTrace: FormulaTraceItem[];
}

export const FormulaTraceabilityModal: React.FC<FormulaTraceabilityModalProps> = ({
  isOpen,
  onClose,
  formulaTrace,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  if (!isOpen) return null;

  const categories = ['All', ...Array.from(new Set(formulaTrace.map((f) => f.category)))];

  const filteredItems = formulaTrace.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.cellId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.standardReference.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[85vh] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-slate-850 bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Engineering Formula Traceability & Audit Trail
              </h2>
              <p className="text-xs text-slate-400">
                Mathematical derivations, numerical substitutions, unit balance, and standard citations.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="px-6 py-3 border-b border-slate-800 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search parameter, code, or cell ID (e.g. UG-27, M_steam, Souders-Brown)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap gap-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition ${
                  selectedCategory === cat
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Items List */}
        <div className="p-6 overflow-y-auto space-y-4 divide-y divide-slate-800/80">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No formulas matching &quot;{searchQuery}&quot; found.
            </div>
          ) : (
            filteredItems.map((item) => (
              <div key={item.cellId} className="pt-4 first:pt-0 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-cyan-300 font-bold text-xs">
                      {item.cellId}
                    </span>
                    <h3 className="font-bold text-white text-sm">{item.name}</h3>
                    <span className="text-[11px] text-slate-400 font-mono">({item.sheetName})</span>
                  </div>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/30">
                    {item.standardReference}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {/* Symbolic Formula */}
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-slate-400 font-semibold mb-1 uppercase tracking-wider">
                      Symbolic Equation:
                    </div>
                    <code className="text-cyan-300 font-mono text-xs block overflow-x-auto">
                      {item.symbolicFormula}
                    </code>
                  </div>

                  {/* Numerical Substitution */}
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-slate-400 font-semibold mb-1 uppercase tracking-wider">
                      Numerical Values Substituted:
                    </div>
                    <code className="text-amber-300 font-mono text-xs block overflow-x-auto">
                      {item.numericalSubstitution}
                    </code>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between text-xs pt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-[11px]">Calculated Output:</span>
                    <strong className="text-emerald-400 font-mono text-sm">{item.resultValue}</strong>
                  </div>
                  <div className="text-[11px] text-slate-400 italic">
                    Assumptions: {item.assumptions}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-950 border-t border-slate-800 px-6 py-3 flex items-center justify-between text-xs text-slate-400">
          <span>Formula Audit Traceability Engine • Complies with ASME PTC 12.3 &amp; HEI</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
