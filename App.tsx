
import React, { useState, useEffect, useCallback } from 'react';
import { SceneData, PromptEntry } from './types';
import * as C from './constants';
import { FormField } from './components/FormField';
import { PromptOutput } from './components/PromptOutput';
import { HistoryModal } from './components/HistoryModal';
import { Icon } from './components/Icon';

const initialFormData: SceneData = {
  timeOfDay: '', lighting: '', mainLocation: '', locationDetails: '',
  atmosphereMood: '', soundDetails: '', characterGender: '', characterAge: '',
  characterBodyShape: '', characterFeatures: '', characterClothing: '',
  characterProps: '', characterAction: '', characterEmotion: '',
  dialogueTone: '', dialogueScript: '', dialogueAccent: '',
  cameraAngle: '', cameraMovement: '', imageMood: '', imageStyle: '',
};

const HistoryIcon: React.FC<{className?: string}> = ({ className }) => <Icon className={className} path="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />;

function useLocalStorage<T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  const setValue: React.Dispatch<React.SetStateAction<T>> = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
}

const App: React.FC = () => {
  const [formData, setFormData] = useState<SceneData>(initialFormData);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [history, setHistory] = useLocalStorage<PromptEntry[]>('promptHistory', []);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generatePromptText = (data: SceneData): string => {
    let prompt = `สร้าง Prompt ภาษาอังกฤษสำหรับสร้าง VDO ด้วย VEO3\n\n`;

    const sections = [
      { title: "", // Removed "🎬 ฉาก"
        parts: [
          { label: "ช่วงเวลา", value: `${data.timeOfDay}, ${data.lighting}`},
          { label: "สถานที่", value: data.locationDetails ? `${data.mainLocation} (${data.locationDetails})` : data.mainLocation },
          { label: "บรรยากาศ", value: data.atmosphereMood },
          { label: "เสียง", value: data.soundDetails ? `ได้ยินเสียง ${data.soundDetails}` : null },
        ]
      },
      { title: "👤 ตัวละคร",
        parts: [
          { label: "ลักษณะ", value: [data.characterGender, data.characterAge, data.characterBodyShape, data.characterFeatures].filter(Boolean).join(', ') },
          { label: "การแต่งกาย", value: data.characterClothing },
          { label: "อุปกรณ์", value: data.characterProps },
        ]
      },
      { title: "🎭 การกระทำและอารมณ์",
        parts: [
          { label: "การกระทำ", value: data.characterAction },
          { label: "อารมณ์", value: data.characterEmotion },
        ]
      },
      { title: "💬 บทพูด",
        parts: [
          { label: "โทนเสียง", value: data.dialogueAccent ? `${data.dialogueTone} (สำเนียง${data.dialogueAccent})` : data.dialogueTone },
          { label: "บทพูด", value: data.dialogueScript ? `"${data.dialogueScript}"` : null },
        ]
      },
      { title: "🎥 มุมมองภาพ",
        parts: [
          { label: "มุมกล้อง", value: data.cameraAngle },
          { label: "การเคลื่อนกล้อง", value: data.cameraMovement },
          { label: "สไตล์ภาพ", value: data.imageStyle ? `${data.imageStyle}, อารมณ์ภาพ ${data.imageMood}` : null },
        ]
      }
    ];

    sections.forEach(section => {
        const validParts = section.parts.filter(p => p.value && p.value.trim() !== '' && p.value.trim() !== ',');

        // Print the section if it has a title, or if it has content (for the first section)
        if (section.title || validParts.length > 0) {
            if (section.title) {
              prompt += `**${section.title}**\n`;
            }
            if (validParts.length > 0) {
              validParts.forEach(part => {
                  if (part.value) prompt += `- **${part.label}:** ${part.value}\n`;
              });
            }
            prompt += "\n";
        }
    });

    return prompt.trim();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setGeneratedPrompt('');

    const fullPrompt = generatePromptText(formData);
    
    setGeneratedPrompt(fullPrompt);

    const newEntry: PromptEntry = {
      id: new Date().toISOString(),
      name: `${formData.mainLocation || 'ฉาก'}${formData.atmosphereMood ? ` (${formData.atmosphereMood})` : ''}`,
      prompt: fullPrompt,
      data: formData,
    };
    setHistory(prev => [newEntry, ...prev.slice(0, 49)]); // Keep history to 50 items

    setIsGenerating(false);
  };

  const loadPromptFromHistory = useCallback((entry: PromptEntry) => {
      setFormData(entry.data);
      setGeneratedPrompt(entry.prompt);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, [setHistory]);

  const baseInputClasses = "w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm bg-slate-700 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 transition";
  const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} className={baseInputClasses} />;
  const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => <select {...props} className={baseInputClasses} />;
  const TextArea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea {...props} className={baseInputClasses} />;

  const FormCard = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
      <h3 className="text-lg font-semibold text-slate-200 border-b border-slate-600 pb-3 mb-4">{title}</h3>
      {children}
    </div>
  );

  return (
    <>
      <HistoryModal 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        history={history}
        onLoadPrompt={loadPromptFromHistory}
        onClearHistory={clearHistory}
      />
      <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
              <h1 className="text-2xl font-bold text-slate-100">Scene Prompt Generator</h1>
              <button onClick={() => setIsHistoryOpen(true)} className="flex items-center gap-2 px-3 py-2 bg-slate-800 text-slate-300 rounded-md hover:bg-slate-700 transition-colors text-sm font-medium border border-slate-700">
                  <HistoryIcon className="w-5 h-5"/>
                  <span>คลัง Prompt</span>
              </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 lg:gap-8">
          
          <div className="space-y-6">
            <FormCard title="เวลาและแสง">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="ช่วงเวลา"><Select name="timeOfDay" value={formData.timeOfDay} onChange={handleInputChange}><option value="">เลือก...</option>{C.TIME_OF_DAY_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}</Select></FormField>
                  <FormField label="ลักษณะแสง"><Select name="lighting" value={formData.lighting} onChange={handleInputChange}><option value="">เลือก...</option>{C.LIGHTING_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}</Select></FormField>
              </div>
            </FormCard>
            
            <FormCard title="สถานที่และบรรยากาศ">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="สถานที่หลัก"><Select name="mainLocation" value={formData.mainLocation} onChange={handleInputChange}><option value="">เลือก...</option>{C.LOCATION_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}</Select></FormField>
                  <FormField label="รายละเอียดสถานที่"><Input name="locationDetails" value={formData.locationDetails} onChange={handleInputChange} placeholder="เช่น หาดทรายขาว, ป่าดิบชื้น" /></FormField>
                  <FormField label="บรรยากาศ/อารมณ์"><Select name="atmosphereMood" value={formData.atmosphereMood} onChange={handleInputChange}><option value="">เลือก...</option>{C.ATMOSPHERE_MOOD_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}</Select></FormField>
                  <FormField label="รายละเอียดเสียง"><Input name="soundDetails" value={formData.soundDetails} onChange={handleInputChange} placeholder="เช่น เสียงลมพัด, เสียงนก" /></FormField>
              </div>
            </FormCard>

            <FormCard title="ตัวละคร">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="เพศ"><Select name="characterGender" value={formData.characterGender} onChange={handleInputChange}><option value="">เลือก...</option>{C.GENDER_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}</Select></FormField>
                  <FormField label="อายุ"><Input name="characterAge" value={formData.characterAge} onChange={handleInputChange} placeholder="เช่น เด็ก, 35 ปี, สูงอายุ" /></FormField>
                  <FormField label="รูปร่าง"><Input name="characterBodyShape" value={formData.characterBodyShape} onChange={handleInputChange} placeholder="เช่น ผอม, ล่ำ, สูง" /></FormField>
                  <FormField label="ลักษณะใบหน้า/ผิว"><Input name="characterFeatures" value={formData.characterFeatures} onChange={handleInputChange} placeholder="เช่น หน้ากลม, มีริ้วรอย" /></FormField>
              </div>
              <div className="mt-4"><FormField label="เสื้อผ้าและเครื่องแต่งกาย"><Input name="characterClothing" value={formData.characterClothing} onChange={handleInputChange} placeholder="เช่น เสื้อยืดสีขาว, กางเกงยีนส์" /></FormField></div>
              <div className="mt-4"><FormField label="อุปกรณ์ประกอบ"><Input name="characterProps" value={formData.characterProps} onChange={handleInputChange} placeholder="เช่น มือถือ, หนังสือ" /></FormField></div>
            </FormCard>
            
            <FormCard title="การกระทำและอารมณ์">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="การกระทำ"><Select name="characterAction" value={formData.characterAction} onChange={handleInputChange}><option value="">เลือก...</option>{C.ACTION_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}</Select></FormField>
                  <FormField label="อารมณ์"><Select name="characterEmotion" value={formData.characterEmotion} onChange={handleInputChange}><option value="">เลือก...</option>{C.EMOTION_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}</Select></FormField>
              </div>
            </FormCard>

            <FormCard title="บทพูดและโทนเสียง">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="โทนเสียง"><Select name="dialogueTone" value={formData.dialogueTone} onChange={handleInputChange}><option value="">เลือก...</option>{C.TONE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}</Select></FormField>
                  <FormField label="สำเนียง"><Input name="dialogueAccent" value={formData.dialogueAccent} onChange={handleInputChange} placeholder="เช่น อีสาน, ใต้" /></FormField>
              </div>
              <div className="mt-4"><FormField label="บทพูด"><TextArea name="dialogueScript" value={formData.dialogueScript} onChange={handleInputChange} rows={3} placeholder="นาย ก. พูดว่า..." /></FormField></div>
            </FormCard>

            <FormCard title="มุมมองและสไตล์ภาพ">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="มุมกล้อง"><Select name="cameraAngle" value={formData.cameraAngle} onChange={handleInputChange}><option value="">เลือก...</option>{C.CAMERA_ANGLE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}</Select></FormField>
                  <FormField label="การเคลื่อนไหวกล้อง"><Select name="cameraMovement" value={formData.cameraMovement} onChange={handleInputChange}><option value="">เลือก...</option>{C.CAMERA_MOVEMENT_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}</Select></FormField>
                  <FormField label="อารมณ์ของภาพ"><Select name="imageMood" value={formData.imageMood} onChange={handleInputChange}><option value="">เลือก...</option>{C.IMAGE_MOOD_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}</Select></FormField>
                  <FormField label="สไตล์ภาพ"><Select name="imageStyle" value={formData.imageStyle} onChange={handleInputChange}><option value="">เลือก...</option>{C.IMAGE_STYLE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}</Select></FormField>
              </div>
            </FormCard>
          </div>

          <div className="mt-8 lg:mt-0 lg:sticky lg:top-24 h-[calc(100vh-8rem)]">
            <PromptOutput promptText={generatedPrompt} isLoading={isGenerating} />
            <div className="mt-6 lg:mt-0">
              <button type="submit" disabled={isGenerating} className="w-full bg-violet-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-violet-700 transition-colors disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-wait focus:outline-none focus:ring-2 focus:ring-offset-4 focus:ring-offset-slate-900 focus:ring-violet-500">
                {isGenerating ? 'กำลังสร้าง...' : 'สร้าง Prompt'}
              </button>
            </div>
          </div>

        </form>
      </main>
    </>
  );
};

export default App;
