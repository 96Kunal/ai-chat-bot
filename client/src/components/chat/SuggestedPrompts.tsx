import React from 'react';
import { Code2, Compass, Lightbulb, GraduationCap, FileText, Sparkles } from 'lucide-react';

interface SuggestedPromptsProps {
  onSelectPrompt: (prompt: string) => void;
}

export const SuggestedPrompts: React.FC<SuggestedPromptsProps> = ({ onSelectPrompt }) => {
  const suggestions = [
    {
      icon: Lightbulb,
      title: 'Brainstorm ideas',
      subtitle: 'for a new project, startup, or research paper',
      prompt: 'Help me brainstorm 5 innovative software project ideas for my portfolio.',
    },
    {
      icon: Code2,
      title: 'Code & Debug',
      subtitle: 'explain algorithms or write clean code',
      prompt: 'Explain pointers and dynamic memory in C with visual diagrams and clean code.',
    },
    {
      icon: FileText,
      title: 'Summarize & Analyze',
      subtitle: 'distill complex notes or long documents',
      prompt: 'How can I effectively structure and summarize technical study notes for quick revision?',
    },
    {
      icon: GraduationCap,
      title: 'Create a Study Plan',
      subtitle: 'design an efficient study roadmap',
      prompt: 'Create a structured 2-week mastery study plan for Data Structures & Algorithms.',
    },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto my-6 px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {suggestions.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={() => onSelectPrompt(item.prompt)}
              className="p-3.5 rounded-2xl bg-[#212121] hover:bg-[#2f2f2f] text-left transition-all duration-200 border border-[#2f2f2f] hover:border-[#444] shadow-sm flex items-start gap-3 group"
            >
              <div className="w-8 h-8 rounded-xl bg-[#2a2a2a] group-hover:bg-[#ea4335]/15 flex items-center justify-center text-slate-300 group-hover:text-[#ea4335] shrink-0 transition-colors">
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-white group-hover:text-white">
                  {item.title}
                </div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5">
                  {item.subtitle}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
