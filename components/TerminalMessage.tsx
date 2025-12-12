import React from 'react';
import { Message, Sender, LanguageCode, TranslationDictionary } from '../types';
import { Terminal, User, Bot, AlertTriangle, Check, Copy, ShieldAlert } from 'lucide-react';

interface Props {
  message: Message;
  onConfirm?: (id: string) => void;
  onCancel?: (id: string) => void;
  currentLang?: LanguageCode;
  translations?: TranslationDictionary;
}

export const TerminalMessage: React.FC<Props> = ({ 
  message, 
  onConfirm, 
  onCancel,
  translations 
}) => {
  const isUser = message.sender === Sender.USER;
  const isSystem = message.sender === Sender.SYSTEM;

  // Fallback defaults if translations aren't passed immediately (though App.tsx handles this)
  const t = {
    copy: translations?.copy || "Copy",
    destructiveAction: translations?.destructiveAction || "DESTRUCTIVE ACTION",
    cancelAction: translations?.cancelAction || "Cancel",
    confirmAction: translations?.confirmAction || "Confirm",
    commandConfirmed: translations?.commandConfirmed || "Command confirmed"
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (isSystem) {
    return (
      <div className="flex justify-center my-4 opacity-70">
        <span className="text-xs bg-slate-800 text-slate-400 px-3 py-1 rounded-full border border-slate-700">
          {message.text}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] md:max-w-[70%] ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isUser ? 'bg-indigo-600' : 'bg-emerald-600'}`}>
          {isUser ? <User size={20} className="text-white" /> : <Bot size={20} className="text-white" />}
        </div>

        {/* Content Bubble */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`px-5 py-3 rounded-2xl text-sm md:text-base shadow-md ${
            isUser 
              ? 'bg-indigo-600 text-white rounded-tr-none' 
              : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-none'
          }`}>
            <p className="whitespace-pre-wrap">{message.text}</p>
          </div>

          {/* Git Command Card (Only for Bot) */}
          {message.gitCommand && !isUser && (
            <div className="mt-3 w-full bg-black rounded-lg border border-slate-700 overflow-hidden shadow-lg">
              {/* Header */}
              <div className="bg-slate-900 px-4 py-2 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                  <Terminal size={14} />
                  <span>bash</span>
                </div>
                {message.gitCommand.isDestructive && (
                  <div className="flex items-center gap-1 text-xs text-amber-500 font-bold uppercase tracking-wider">
                    <ShieldAlert size={14} />
                    <span>{t.destructiveAction}</span>
                  </div>
                )}
              </div>

              {/* Command Body */}
              <div className="p-4 font-mono text-sm text-green-400 break-all relative group">
                {`$ ${message.gitCommand.command}`}
                <button 
                  onClick={() => handleCopy(message.gitCommand!.command)}
                  className="absolute top-2 right-2 p-2 bg-slate-800 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-700"
                  title={t.copy}
                >
                  <Copy size={14} className="text-slate-300" />
                </button>
              </div>

              {/* Explanation */}
              <div className="px-4 pb-4 text-xs text-slate-400 italic">
                # {message.gitCommand.explanation}
              </div>

              {/* Action Buttons for Destructive/Confirmation */}
              {message.gitCommand.isDestructive && !message.isConfirmed && (
                <div className="bg-slate-900/50 p-3 flex gap-3 border-t border-slate-800">
                  <button 
                    onClick={() => onCancel?.(message.id)}
                    className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm transition-colors"
                  >
                    {t.cancelAction}
                  </button>
                  <button 
                    onClick={() => onConfirm?.(message.id)}
                    className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white rounded text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <AlertTriangle size={16} />
                    {t.confirmAction}
                  </button>
                </div>
              )}
              
              {message.isConfirmed && (
                <div className="bg-emerald-900/20 p-2 text-emerald-400 text-xs text-center border-t border-emerald-900/50">
                   <Check size={12} className="inline mr-1"/> {t.commandConfirmed}
                </div>
              )}
            </div>
          )}
          
          <span className="text-xs text-slate-500 mt-1 px-1">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};
