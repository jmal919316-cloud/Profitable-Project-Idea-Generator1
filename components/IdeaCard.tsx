
import React from 'react';
import type { ProjectIdea } from '../types';

interface IdeaCardProps {
  idea: ProjectIdea;
}

const IdeaCard: React.FC<IdeaCardProps> = ({ idea }) => {
  return (
    <div className="bg-slate-800 rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-purple-500/20 border border-slate-700">
      <h3 className="text-2xl font-bold text-purple-400 mb-3">{idea.title}</h3>
      <p className="text-slate-300 leading-relaxed">{idea.description}</p>
    </div>
  );
};

export default IdeaCard;
