import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Panel, Group } from 'react-resizable-panels';
import ResizeHandle from '../components/Workspace/ResizeHandle';
import { ChevronDown, Copy, Maximize2, Minimize2, RotateCcw } from 'lucide-react';

import CodeEditor from '../components/Editor/CodeEditor';
import ProblemConsole from '../components/Workspace/ProblemConsole';
import { submitCode, getProblems } from '../services/api';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/cn';

type Problem = {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  starterCode: Record<'java' | 'cpp' | 'typescript', string>;
  testCases: Array<{ id: string; name: string; type: 'structural' | 'ai'; weight: number }>;
};

type Language = 'typescript' | 'java' | 'cpp';

const SolvePage = () => {
  const { id } = useParams();

  const [language, setLanguage] = useState<Language>('java');
  const [code, setCode] = useState('// Loading...');
  const [problem, setProblem] = useState<Problem | null>(null);
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [leftTab, setLeftTab] = useState<'description' | 'constraints'>('description');
  const [editorFullscreen, setEditorFullscreen] = useState(false);

  useEffect(() => {
    const fetchProblem = async () => {
      const allProblems = await getProblems();
      const found = allProblems.find((p: any) => p.id === id) as Problem | undefined;
      if (found) {
        setProblem(found);
      }
    };

    fetchProblem().catch(() => {
      setProblem(null);
    });
  }, [id]);

  useEffect(() => {
    if (!problem) return;
    setCode(problem.starterCode?.[language] ?? '');
  }, [problem, language]);

  const difficultyVariant = useMemo(() => {
    if (!problem) return 'neutral' as const;
    if (problem.difficulty === 'Easy') return 'easy' as const;
    if (problem.difficulty === 'Medium') return 'medium' as const;
    return 'hard' as const;
  }, [problem]);

  const handleRun = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await submitCode(id, code, language);
      if (response.success) setResults(response.data);
    } finally {
      setLoading(false);
    }
  };

  if (!problem) {
    return (
      <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-8 text-[#8b949e]">
        Loading problem…
      </div>
    );
  }

  return (
    <div className="-mx-55 -my-6">
      <div className="h-[calc(100vh-56px)] bg-[#0d1117]">
        {/* Workspace top strip (LeetCode-ish controls) */}
        <div className="border-b border-[#30363d] bg-[#0d1117]">
          <div className="mx-auto max-w-[1850px] px-4">
            <div className="h-12 w-full flex items-center justify-between gap-3">
              <div className="min-w-0 flex items-center gap-3">
                <Link to="/" className="text-sm text-[#8b949e] hover:text-[#c9d1d9]">
                  Problems
                </Link>
                <span className="text-[#30363d]">/</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="font-semibold truncate">{problem.title}</div>
                    <Badge variant={difficultyVariant}>{problem.difficulty}</Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Language dropdown */}
                <div className="relative group">
                  <button
                    className={cn(
                      'h-9 px-3 rounded-md border border-[#30363d] bg-[#161b22] text-sm',
                      'flex items-center gap-2 hover:bg-[#1f2630]'
                    )}
                  >
                    <span className="font-medium text-[#c9d1d9]">
                      {language === 'cpp' ? 'C++' : language === 'typescript' ? 'TypeScript' : 'Java'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-[#8b949e]" />
                  </button>
                  <div className="absolute right-0 top-full mt-1 w-40 rounded-md border border-[#30363d] bg-[#161b22] shadow-lg hidden group-hover:block">
                    {(['java', 'cpp', 'typescript'] as const).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setLanguage(lang)}
                        className={cn(
                          'w-full text-left px-3 py-2 text-sm hover:bg-[#1f2630]',
                          lang === language && 'bg-[#1f2630] font-medium'
                        )}
                      >
                        {lang === 'cpp' ? 'C++' : lang === 'typescript' ? 'TypeScript' : 'Java'}
                      </button>
                    ))}
                  </div>
                </div>

                <Button variant="primary" onClick={handleRun} disabled={loading}>
                  {loading ? 'Running…' : 'Run'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Split workspace */}
        <div className="h-[calc(100vh-56px-48px)]">
          <Group orientation="horizontal">
            {/* LEFT: Problem */}
              <Panel defaultSize={40} minSize={600}>
                <div className="h-full min-w-[280px] bg-[#0d1117] border-r border-[#30363d] flex flex-col">
                  <div className="px-4 pt-3 border-b border-[#30363d]">
                    <div className="flex gap-5 text-sm">
                      <button
                        onClick={() => setLeftTab('description')}
                        className={cn(
                          'pb-2 -mb-px border-b-2 transition-colors',
                          leftTab === 'description'
                            ? 'border-[#ffa116] text-[#c9d1d9]'
                            : 'border-transparent text-[#8b949e] hover:text-[#c9d1d9]'
                        )}
                      >
                        Description
                      </button>
                      <button
                        onClick={() => setLeftTab('constraints')}
                        className={cn(
                          'pb-2 -mb-px border-b-2 transition-colors',
                          leftTab === 'constraints'
                            ? 'border-[#ffa116] text-[#c9d1d9]'
                            : 'border-transparent text-[#8b949e] hover:text-[#c9d1d9]'
                        )}
                      >
                        Notes
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto px-4 py-4">
                    {leftTab === 'description' ? (
                      <div className="space-y-3">
                        <div className="text-sm leading-6 text-[#c9d1d9] whitespace-pre-wrap break-words">
                          {problem.description}
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-[#c9d1d9] space-y-2">
                        <div className="font-medium text-[#c9d1d9]">How to use</div>
                        <ul className="list-disc pl-5">
                          <li>Pick a language and implement the design.</li>
                          <li>Click Run to evaluate structural + AI checks.</li>
                          <li>Iterate until you reach “Accepted”.</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </Panel>

            <ResizeHandle direction="horizontal" />

            {/* RIGHT: Editor + Console */}
            <Panel defaultSize={60} minSize={700}>
              <Group orientation="vertical">
                <Panel defaultSize={62} minSize={25}>
                  <div className="h-full bg-[#0d1117]">
                    <div className="h-full p-3 flex flex-col gap-2">
                      <div className="h-10 flex items-center justify-between rounded-md border border-[#30363d] bg-[#0d1117] px-2">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(code);
                              } catch {
                                // ignore
                              }
                            }}
                            className="h-8 w-8 grid place-items-center rounded hover:bg-[#161b22] text-[#8b949e] hover:text-[#c9d1d9]"
                            title="Copy code"
                            aria-label="Copy code"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setCode(problem.starterCode?.[language] ?? '')}
                            className="h-8 w-8 grid place-items-center rounded hover:bg-[#161b22] text-[#8b949e] hover:text-[#c9d1d9]"
                            title="Reset to starter"
                            aria-label="Reset to starter"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditorFullscreen((v) => !v)}
                            className="h-8 w-8 grid place-items-center rounded hover:bg-[#161b22] text-[#8b949e] hover:text-[#c9d1d9]"
                            title={editorFullscreen ? 'Exit fullscreen' : 'Fullscreen editor'}
                            aria-label={editorFullscreen ? 'Exit fullscreen' : 'Fullscreen editor'}
                          >
                            {editorFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex-1 min-h-0">
                        <CodeEditor code={code} onChange={(v) => setCode(v || '')} language={language} />
                      </div>
                    </div>
                  </div>
                </Panel>

                <ResizeHandle direction="vertical" />

                <Panel defaultSize={38} minSize={12}>
                  <div className="h-full overflow-hidden">
                    <ProblemConsole
                      testCases={problem.testCases}
                      results={results}
                      loading={loading}
                      onRun={handleRun}
                    />
                  </div>
                </Panel>
              </Group>
            </Panel>
          </Group>
        </div>
      </div>

      {editorFullscreen ? (
        <div className="fixed inset-0 z-[100] bg-[#0d1117]">
          <div className="h-full flex flex-col">
            <div className="h-12 border-b border-[#30363d] bg-[#0d1117]">
              <div className="h-full px-2 flex items-center justify-between">
                <div className="text-sm text-[#8b949e] truncate">
                  Fullscreen Editor • {problem.title} • {language === 'cpp' ? 'C++' : language}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" onClick={() => setCode(problem.starterCode?.[language] ?? '')}>
                    Reset
                  </Button>
                  <Button variant="primary" onClick={handleRun} disabled={loading}>
                    {loading ? 'Running…' : 'Run'}
                  </Button>
                  <Button variant="ghost" onClick={() => setEditorFullscreen(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex-1 p-3">
              <CodeEditor code={code} onChange={(v) => setCode(v || '')} language={language} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default SolvePage;