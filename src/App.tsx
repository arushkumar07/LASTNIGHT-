import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Moon, 
  Sun, 
  Zap, 
  Copy, 
  Check, 
  RotateCcw, 
  Trash2, 
  Loader2, 
  BookOpen, 
  ListChecks, 
  Flame,
  ArrowRight
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "./lib/utils";
import { compressNotes, type CompressedNotes } from "./services/gemini";

type Tab = "shortNotes" | "bulletPoints" | "lastNightRevision";

export default function App() {
  const [inputText, setInputText] = useState("");
  const [isDark, setIsDark] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<CompressedNotes | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("shortNotes");
  const [copiedTab, setCopiedTab] = useState<Tab | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);

  // Sync dark mode with document
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const handleCompress = async () => {
    if (!inputText.trim()) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const data = await compressNotes(inputText);
      setResults(data);
      // Scroll to results on mobile
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (tab: Tab) => {
    if (!results) return;
    const textToCopy = results[tab];
    await navigator.clipboard.writeText(textToCopy);
    setCopiedTab(tab);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  const handleClear = () => {
    setInputText("");
    setResults(null);
    setError(null);
  };

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "shortNotes", label: "Short Notes", icon: BookOpen },
    { id: "bulletPoints", label: "Bullet Points", icon: ListChecks },
    { id: "lastNightRevision", label: "Last Night", icon: Flame },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-300 font-sans selection:bg-orange-200 dark:selection:bg-orange-900">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-neutral-950/70 border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight leading-none">Last Night</h1>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium uppercase tracking-widest">Notes Compressor AI</p>
            </div>
          </div>
          
          <button 
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-bold tracking-tight mb-4"
          >
            Turn long chapters into <span className="text-orange-500">smart revision notes</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-neutral-600 dark:text-neutral-400 text-lg max-w-2xl mx-auto"
          >
            Paste your notes and let AI compress them into clear explanations, bullet points, and ultra-short revision guides.
          </motion.p>
        </div>

        {/* Input Section */}
        <section className="mb-12">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition duration-1000 group-focus-within:duration-200"></div>
            <div className="relative bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste your chapter, notes, or any long text here..."
                className="w-full h-64 md:h-80 p-6 bg-transparent resize-none focus:outline-none text-lg leading-relaxed placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
              />
              
              <div className="flex items-center justify-between p-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-mono text-neutral-400 dark:text-neutral-500">
                    {inputText.length.toLocaleString()} characters
                  </span>
                  {inputText.length > 0 && (
                    <button 
                      onClick={handleClear}
                      className="text-neutral-400 hover:text-red-500 transition-colors flex items-center gap-1 text-xs font-medium"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Clear
                    </button>
                  )}
                </div>
                
                <button
                  onClick={handleCompress}
                  disabled={isLoading || !inputText.trim()}
                  className={cn(
                    "relative px-6 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2",
                    isLoading || !inputText.trim() 
                      ? "bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed"
                      : "bg-orange-500 text-white hover:bg-orange-600 active:scale-95 shadow-lg shadow-orange-500/20"
                  )}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Compressing...
                    </>
                  ) : (
                    <>
                      Compress Notes
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          {error && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-center text-red-500 text-sm font-medium"
            >
              {error}
            </motion.p>
          )}
        </section>

        {/* Output Section */}
        <AnimatePresence>
          {results && (
            <motion.section 
              ref={resultsRef}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold tracking-tight">Compressed Results</h3>
                <button 
                  onClick={handleCompress}
                  className="text-orange-500 hover:text-orange-600 text-sm font-semibold flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  Regenerate
                </button>
              </div>

              {/* Tabs */}
              <div className="flex p-1 bg-neutral-200 dark:bg-neutral-800 rounded-2xl gap-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all relative",
                      activeTab === tab.id 
                        ? "bg-white dark:bg-neutral-900 text-orange-500 shadow-sm" 
                        : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                    )}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                    {activeTab === tab.id && (
                      <motion.div 
                        layoutId="activeTab"
                        className="absolute inset-0 bg-white dark:bg-neutral-900 rounded-xl -z-10"
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Content Card */}
              <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-xl shadow-neutral-200/50 dark:shadow-none overflow-hidden min-h-[400px]">
                <div className="p-6 md:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                        {(() => {
                          const activeTabData = tabs.find(t => t.id === activeTab);
                          const ActiveIcon = activeTabData?.icon;
                          return ActiveIcon ? <ActiveIcon className="w-5 h-5 text-orange-500" /> : null;
                        })()}
                      </div>
                      <h4 className="font-bold text-lg">{tabs.find(t => t.id === activeTab)?.label}</h4>
                    </div>
                    
                    <button
                      onClick={() => handleCopy(activeTab)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-xs font-bold"
                    >
                      {copiedTab === activeTab ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-green-500" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>

                  <div className="prose prose-neutral dark:prose-invert max-w-none prose-p:leading-relaxed prose-li:my-1 prose-headings:mb-4 prose-headings:mt-8 first:prose-headings:mt-0">
                    <ReactMarkdown>
                      {results[activeTab]}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="mt-20 py-12 border-t border-neutral-200 dark:border-neutral-800 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-orange-500" />
          <span className="font-bold text-lg">Last Night</span>
        </div>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm">
          Built for students who want to study smarter, not harder.
        </p>
      </footer>
    </div>
  );
}
