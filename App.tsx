
import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import IdeaCard from './components/IdeaCard';
import LoadingSpinner from './components/LoadingSpinner';
import Footer from './components/Footer';
import { generateProjectIdeas } from './services/geminiService';
import type { ProjectIdea } from './types';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [ideas, setIdeas] = useState<ProjectIdea[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState<boolean>(false);
  const [isApiKeyMissing, setIsApiKeyMissing] = useState<boolean>(false);

  useEffect(() => {
    // Proactively check for the API key on initial load.
    if (!process.env.API_KEY) {
      setIsApiKeyMissing(true);
    }
  }, []);

  const handleAddApiKey = async () => {
    try {
      // This function is provided by the execution environment (e.g., AI Studio).
      await (window as any).aistudio.openSelectKey();
      // After the dialog, we optimistically assume a key has been selected.
      // The environment will inject the new key, and subsequent API calls will use it.
      setIsApiKeyMissing(false);
      setError(null); // Clear any previous errors.
    } catch (e) {
      console.error("Error opening API key dialog:", e);
      setError("حدث خطأ أثناء محاولة فتح مربع حوار إعداد مفتاح API.");
    }
  };
  
  const handleGenerateIdeas = useCallback(async () => {
    if (!prompt.trim() || isLoading || isApiKeyMissing) return;

    setIsLoading(true);
    setError(null);
    setHasGenerated(true);
    try {
      const generatedIdeas = await generateProjectIdeas(prompt);
      setIdeas(generatedIdeas);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("حدث خطأ غير متوقع.");
      }
      setIdeas([]);
    } finally {
      setIsLoading(false);
    }
  }, [prompt, isLoading, isApiKeyMissing]);

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerateIdeas();
    }
  };
  
  const examplePrompts = [
    "الطبخ الصحي والحلويات النباتية",
    "تطوير تطبيقات الموبايل للأطفال",
    "التسويق الرقمي وإدارة الشبكات الاجتماعية",
    "إعادة تدوير المواد وصناعة منتجات صديقة للبيئة"
  ];

  const handleExampleClick = (example: string) => {
    setPrompt(example);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center p-4 sm:p-6 transition-colors duration-300">
      <main className="w-full max-w-5xl flex flex-col flex-grow">
        <Header />
        
        {isApiKeyMissing && (
            <div className="w-full max-w-3xl mx-auto mb-6 p-4 bg-yellow-900/50 backdrop-blur-sm border border-yellow-700 rounded-lg text-center animate-fade-in">
                <div className="flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400 ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h3 className="text-lg font-bold text-yellow-300">إجراء مطلوب</h3>
                </div>
                <p className="text-yellow-200 mt-2 mb-4">
                    مفتاح واجهة برمجة التطبيقات (API Key) غير موجود. الرجاء إضافة مفتاحك لتمكين الذكاء الاصطناعي من توليد الأفكار.
                </p>
                <button
                  onClick={handleAddApiKey}
                  className="bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold py-2 px-6 rounded-lg transition-colors"
                >
                  إعداد مفتاح الـ API
                </button>
            </div>
        )}

        <div className="w-full max-w-3xl mx-auto bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-slate-700">
          <textarea
            value={prompt}
            onChange={handlePromptChange}
            onKeyDown={handleKeyDown}
            placeholder="اكتب هنا عن اهتماماتك، مهاراتك، أو شغفك... (مثال: أحب البرمجة والسفر)"
            className="w-full bg-slate-700 text-white text-lg p-4 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none transition-all duration-300"
            rows={4}
            disabled={isApiKeyMissing}
          />
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
             <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
              {examplePrompts.slice(0, 2).map(ex => (
                <button key={ex} onClick={() => handleExampleClick(ex)} className="text-xs bg-slate-600 hover:bg-slate-500 text-slate-300 py-1 px-3 rounded-full transition-colors disabled:opacity-50" disabled={isApiKeyMissing}>
                  {ex}
                </button>
              ))}
            </div>
            <button
              onClick={handleGenerateIdeas}
              disabled={isLoading || !prompt.trim() || isApiKeyMissing}
              className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2"
            >
              {isLoading ? 'جاري التفكير...' : 'ولّد الأفكار'}
              {!isLoading && (
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                  </svg>
              )}
            </button>
          </div>
        </div>

        <div className="w-full mt-10">
          {isLoading && <LoadingSpinner />}
          {error && <div className="text-center text-red-400 bg-red-900/50 p-4 rounded-lg">{error}</div>}
          {!isLoading && !error && hasGenerated && ideas.length === 0 && (
            <div className="text-center text-slate-400 p-4">لم يتم العثور على أفكار. حاول مرة أخرى بوصف مختلف.</div>
          )}
          {!isLoading && ideas.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              {ideas.map((idea, index) => (
                <IdeaCard key={index} idea={idea} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
      <style>
      {`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}
      </style>
    </div>
  );
};

export default App;
