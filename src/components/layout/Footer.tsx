import React from 'react';
import { UniversityLogo } from '../common/UniversityLogo.tsx';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white py-4 px-6 text-xs text-slate-500">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <UniversityLogo size="xs" className="w-6 h-6 object-contain" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 text-left">
            <span className="font-semibold text-slate-800">Ghazi University</span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="text-slate-500">Dera Ghazi Khan, Punjab</span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="text-blue-700 font-medium">University Management System</span>
          </div>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-medium text-[11px] border border-slate-200/60">
          <span>Academic Management System Project</span>
        </div>
      </div>
    </footer>
  );
};
