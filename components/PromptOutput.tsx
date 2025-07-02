import React, { useState } from 'react';
import { Icon } from './Icon';

interface PromptOutputProps {
  promptText: string;
  isLoading: boolean;
}

const ClipboardIcon: React.FC<{className?: string}> = ({ className }) => <Icon className={className} path="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />;
const CheckIcon: React.FC<{className?: string}> = ({ className }) => <Icon className={className} path="M4.5 12.75l6 6 9-13.5" />;

export const PromptOutput: React.FC<PromptOutputProps> = ({ promptText, isLoading }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (promptText) {
      navigator.clipboard.writeText(promptText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg h-full flex flex-col">
      <h2 className="text-base font-semibold text-slate-200 mb-2">Output Prompt</h2>
      <div className="relative flex-grow min-h-0">
        <div className="absolute inset-0 p-2 bg-slate-900 rounded-md whitespace-pre-wrap text-slate-300 text-xs overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-300"></div>
            </div>
          ) : (
            promptText || "กรุณากรอกข้อมูลและกด 'สร้าง Prompt' เพื่อดูผลลัพธ์ที่นี่"
          )}
        </div>
      </div>
      <button
        onClick={handleCopy}
        disabled={!promptText || isLoading}
        className={`mt-3 w-full flex items-center justify-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-150 ${
          copied 
            ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' 
            : 'bg-violet-600 hover:bg-violet-700 focus:ring-violet-500'
        } disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed`}
      >
        {copied ? (
          <>
            <CheckIcon className="w-4 h-4 mr-2" />
            คัดลอกแล้ว!
          </>
        ) : (
          <>
            <ClipboardIcon className="w-4 h-4 mr-2" />
            คัดลอก Prompt
          </>
        )}
      </button>
    </div>
  );
};