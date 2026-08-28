import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import {
  Calendar,
  Lightbulb,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Loader2,
  Bookmark,
  Award,
  RotateCcw,
  BookOpen,
  Code2,
  Check,
  X,
} from 'lucide-react';
import { studyApi, bookmarkApi } from '../services/api';
import {
  StudyPlanResponse,
  ConceptExplanationResponse,
  QuizResponse,
  ImportantQuestionsResponse,
} from '../types';
import { useNotification } from '../context/NotificationContext';

export const StudyToolsPage: React.FC = () => {
  const { showToast } = useNotification();
  const [activeSubTab, setActiveSubTab] = useState<'plan' | 'explain' | 'quiz' | 'questions'>('plan');

  // Study Plan Form State
  const [planSubject, setPlanSubject] = useState('Data Structures & Algorithms');
  const [planExamDate, setPlanExamDate] = useState('In 3 weeks');
  const [planHours, setPlanHours] = useState(3);
  const [planLevel, setPlanLevel] = useState('Intermediate');
  const [planTopics, setPlanTopics] = useState('Trees, Graphs, Dynamic Programming, Sorting');
  const [planResult, setPlanResult] = useState<StudyPlanResponse | null>(null);
  const [completedDays, setCompletedDays] = useState<Record<number, boolean>>({});
  const [isPlanLoading, setIsPlanLoading] = useState(false);

  // Concept Explainer Form State
  const [conceptQuery, setConceptQuery] = useState('Pointers and Dynamic Memory in C');
  const [conceptDepth, setConceptDepth] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [includeCode, setIncludeCode] = useState(true);
  const [conceptResult, setConceptResult] = useState<ConceptExplanationResponse | null>(null);
  const [isConceptLoading, setIsConceptLoading] = useState(false);

  // Quiz Studio State
  const [quizTopic, setQuizTopic] = useState('C Programming & Pointers');
  const [quizCount] = useState(5);
  const [quizDifficulty, setQuizDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [quizResult, setQuizResult] = useState<QuizResponse | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isQuizLoading, setIsQuizLoading] = useState(false);
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);

  // Important Questions State
  const [questionsSubject, setQuestionsSubject] = useState('Operating Systems');
  const [questionsExamType, setQuestionsExamType] = useState('End Semester Theory Examination');
  const [questionsResult, setQuestionsResult] = useState<ImportantQuestionsResponse | null>(null);
  const [isQuestionsLoading, setIsQuestionsLoading] = useState(false);

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planSubject.trim()) return;

    setIsPlanLoading(true);
    try {
      const res = await studyApi.generatePlan({
        subject: planSubject,
        examDate: planExamDate,
        availableHoursPerDay: planHours,
        currentLevel: planLevel,
        topics: planTopics,
      });
      setPlanResult(res);
      setCompletedDays({});
      showToast('Study roadmap generated', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to generate study plan.', 'error');
    } finally {
      setIsPlanLoading(false);
    }
  };

  const handleExplainConcept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conceptQuery.trim()) return;

    setIsConceptLoading(true);
    try {
      const res = await studyApi.explainConcept({
        concept: conceptQuery,
        targetDepth: conceptDepth,
        includeCode,
      });
      setConceptResult(res);
      showToast('Concept explanation generated', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to explain concept.', 'error');
    } finally {
      setIsConceptLoading(false);
    }
  };

  const handleGenerateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizTopic.trim()) return;

    setIsQuizLoading(true);
    try {
      const res = await studyApi.generateQuiz({
        topic: quizTopic,
        questionCount: quizCount,
        difficulty: quizDifficulty,
      });
      setQuizResult(res);
      setSelectedAnswers({});
      setIsQuizSubmitted(false);
      showToast('Practice quiz ready', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to generate quiz.', 'error');
    } finally {
      setIsQuizLoading(false);
    }
  };

  const handleSelectQuizAnswer = (questionIndex: number, optionIndex: number) => {
    if (isQuizSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }));
  };

  const handleSubmitQuiz = () => {
    setIsQuizSubmitted(true);
    if (!quizResult) return;

    let score = 0;
    quizResult.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswerIndex) {
        score++;
      }
    });

    const percentage = (score / quizResult.questions.length) * 100;
    if (percentage >= 70) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
      showToast(`Great work! You scored ${score}/${quizResult.questions.length} (${percentage}%) 🎉`, 'success');
    } else {
      showToast(`Quiz completed! You scored ${score}/${quizResult.questions.length}.`, 'info');
    }
  };

  const handleGenerateQuestions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionsSubject.trim()) return;

    setIsQuestionsLoading(true);
    try {
      const res = await studyApi.generateQuestions({
        subject: questionsSubject,
        examType: questionsExamType,
      });
      setQuestionsResult(res);
      showToast('Exam questions generated', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to generate questions.', 'error');
    } finally {
      setIsQuestionsLoading(false);
    }
  };

  const handleBookmarkContent = async (title: string, category: any, content: string) => {
    try {
      await bookmarkApi.create({
        title,
        category,
        content,
      });
      showToast('Saved to your vault', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Login required to bookmark.', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Studio Header & Pill Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h2 className="text-2xl sm:text-3xl font-medium text-white tracking-tight">
            Study & Exam Studio
          </h2>
          <p className="text-xs text-[#8e918f] mt-1">
            Personalized study plans, concept breakdowns, practice quizzes, and predicted exam questions.
          </p>
        </div>

        {/* Gemini Material Tabs */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-[#1e1f20] rounded-full border border-[#333538] shrink-0">
          {[
            { id: 'plan', label: 'Study Plan', icon: Calendar },
            { id: 'explain', label: 'Concept Explainer', icon: Lightbulb },
            { id: 'quiz', label: 'Practice Quiz', icon: Award },
            { id: 'questions', label: 'Exam Questions', icon: HelpCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#004a77] text-[#c2e7ff] font-semibold'
                    : 'text-[#c4c7c5] hover:text-white hover:bg-[#282a2c]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SUBTAB 1: STUDY PLAN GENERATOR */}
      {activeSubTab === 'plan' && (
        <div className="space-y-6">
          <form
            onSubmit={handleGeneratePlan}
            className="p-6 rounded-3xl bg-[#1e1f20] border border-[#333538] space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#c4c7c5] mb-1.5">Subject Name</label>
                <input
                  type="text"
                  value={planSubject}
                  onChange={(e) => setPlanSubject(e.target.value)}
                  placeholder="e.g. Data Structures, Operating Systems"
                  className="w-full bg-[#131314] border border-[#333538] focus:border-[#4285f4] rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#c4c7c5] mb-1.5">Target Date / Timeline</label>
                <input
                  type="text"
                  value={planExamDate}
                  onChange={(e) => setPlanExamDate(e.target.value)}
                  placeholder="e.g. In 2 weeks, May 15th"
                  className="w-full bg-[#131314] border border-[#333538] focus:border-[#4285f4] rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#c4c7c5] mb-1.5">
                  Available Study Hours / Day ({planHours} hrs)
                </label>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={planHours}
                  onChange={(e) => setPlanHours(Number(e.target.value))}
                  className="w-full accent-[#4285f4]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#c4c7c5] mb-1.5">Proficiency Level</label>
                <select
                  value={planLevel}
                  onChange={(e) => setPlanLevel(e.target.value)}
                  className="w-full bg-[#131314] border border-[#333538] focus:border-[#4285f4] rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none"
                >
                  <option value="Beginner">Beginner (Starting from scratch)</option>
                  <option value="Intermediate">Intermediate (Know basics)</option>
                  <option value="Advanced">Advanced (Revision)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#c4c7c5] mb-1.5">
                Key Topics (Optional)
              </label>
              <input
                type="text"
                value={planTopics}
                onChange={(e) => setPlanTopics(e.target.value)}
                placeholder="e.g. Binary Search Trees, Dynamic Programming, Graphs"
                className="w-full bg-[#131314] border border-[#333538] focus:border-[#4285f4] rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isPlanLoading}
              className="w-full py-3 rounded-full bg-[#e3e3e3] hover:bg-white text-[#131314] font-medium text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isPlanLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Study Schedule...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#4285f4]" />
                  <span>Generate Study Plan</span>
                </>
              )}
            </button>
          </form>

          {/* Study Plan Output */}
          {planResult && (
            <div className="p-6 rounded-3xl bg-[#1e1f20] border border-[#333538] space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-[#282a2c]">
                <div>
                  <h3 className="text-lg font-semibold text-white">{planResult.subject} Study Plan</h3>
                  <p className="text-xs text-[#8e918f] mt-0.5">{planResult.overview}</p>
                </div>
                <button
                  onClick={() =>
                    handleBookmarkContent(
                      `${planResult.subject} Study Plan`,
                      'study_plan',
                      JSON.stringify(planResult, null, 2)
                    )
                  }
                  className="px-3.5 py-1.5 rounded-full bg-[#131314] hover:bg-[#282a2c] text-[#c4c7c5] hover:text-white text-xs flex items-center gap-1.5"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              </div>

              {/* High Yield Tips */}
              {planResult.highYieldTips && (
                <div className="p-4 rounded-2xl bg-[#131314] border border-[#282a2c] space-y-2">
                  <span className="text-xs font-semibold text-[#a8c7fa] block">High-Yield Exam Tips:</span>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-[#c4c7c5]">
                    {planResult.highYieldTips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#4285f4] shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Weekly Milestones */}
              <div className="space-y-3.5">
                {planResult.weeklyMilestones?.map((week) => (
                  <div key={week.weekNumber} className="p-4 rounded-2xl bg-[#131314] border border-[#282a2c] space-y-3">
                    <div className="text-xs font-semibold text-[#c2e7ff]">
                      Week {week.weekNumber}: {week.theme}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {week.days?.map((day) => {
                        const isDone = completedDays[day.dayNumber];
                        return (
                          <div
                            key={day.dayNumber}
                            onClick={() =>
                              setCompletedDays((prev) => ({ ...prev, [day.dayNumber]: !prev[day.dayNumber] }))
                            }
                            className={`p-3.5 rounded-2xl cursor-pointer transition-all border ${
                              isDone
                                ? 'bg-[#14321d] border-[#235832] text-[#a8dab5]'
                                : 'bg-[#1e1f20] border-[#282a2c] hover:border-[#333538] text-[#c4c7c5]'
                            }`}
                          >
                            <div className="flex items-center justify-between text-xs mb-1 font-medium">
                              <span>Day {day.dayNumber}: {day.focusTopic}</span>
                              <span className="text-[10px] text-[#8e918f]">{day.studyHours}h</span>
                            </div>
                            <ul className="text-[11px] text-[#8e918f] list-disc pl-4 space-y-0.5 mb-2">
                              {day.tasks?.map((t, tidx) => (
                                <li key={tidx}>{t}</li>
                              ))}
                            </ul>
                            <div className="text-[10px] text-[#a8c7fa] flex items-center justify-between">
                              <span>Check: {day.reviewCheck}</span>
                              {isDone && <Check className="w-3.5 h-3.5 text-[#34a853]" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: CONCEPT EXPLAINER */}
      {activeSubTab === 'explain' && (
        <div className="space-y-6">
          <form
            onSubmit={handleExplainConcept}
            className="p-6 rounded-3xl bg-[#1e1f20] border border-[#333538] space-y-4"
          >
            <div>
              <label className="block text-xs font-medium text-[#c4c7c5] mb-1.5">
                Concept or Academic Topic
              </label>
              <input
                type="text"
                value={conceptQuery}
                onChange={(e) => setConceptQuery(e.target.value)}
                placeholder="e.g. Pointers in C, Dijkstra's Algorithm, Virtual Memory"
                className="w-full bg-[#131314] border border-[#333538] focus:border-[#4285f4] rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none"
                required
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-[#8e918f]">Depth:</label>
                {(['beginner', 'intermediate', 'advanced'] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setConceptDepth(d)}
                    className={`px-3 py-1.5 rounded-full text-xs capitalize transition-all ${
                      conceptDepth === d
                        ? 'bg-[#004a77] text-[#c2e7ff] font-semibold'
                        : 'bg-[#131314] text-[#c4c7c5] hover:text-white'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>

              <label className="flex items-center gap-2 text-xs text-[#c4c7c5] cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeCode}
                  onChange={(e) => setIncludeCode(e.target.checked)}
                  className="rounded accent-[#4285f4]"
                />
                <span>Include Code Examples</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isConceptLoading}
              className="w-full py-3 rounded-full bg-[#e3e3e3] hover:bg-white text-[#131314] font-medium text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isConceptLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Explaining Concept...</span>
                </>
              ) : (
                <>
                  <Lightbulb className="w-4 h-4 text-[#9b72cb]" />
                  <span>Explain Step-by-Step</span>
                </>
              )}
            </button>
          </form>

          {/* Concept Output */}
          {conceptResult && (
            <div className="p-6 rounded-3xl bg-[#1e1f20] border border-[#333538] space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-[#282a2c]">
                <div>
                  <h3 className="text-xl font-semibold text-white">{conceptResult.concept}</h3>
                  <p className="text-xs text-[#a8c7fa] mt-1 font-medium">
                    "{conceptResult.oneSentenceSummary}"
                  </p>
                </div>
                <button
                  onClick={() =>
                    handleBookmarkContent(
                      conceptResult.concept,
                      'concept',
                      conceptResult.detailedExplanation
                    )
                  }
                  className="px-3.5 py-1.5 rounded-full bg-[#131314] hover:bg-[#282a2c] text-[#c4c7c5] hover:text-white text-xs flex items-center gap-1.5"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              </div>

              {/* Analogy Box */}
              {conceptResult.simpleAnalogy && (
                <div className="p-4 rounded-2xl bg-[#131314] border border-[#282a2c]">
                  <span className="text-xs font-semibold text-[#c2e7ff] block mb-1">
                    ✦ Intuitive Analogy:
                  </span>
                  <p className="text-xs text-[#e3e3e3] leading-relaxed">{conceptResult.simpleAnalogy}</p>
                </div>
              )}

              {/* Detailed Markdown */}
              <div className="text-[#e3e3e3] markdown-body text-xs leading-relaxed">
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                  {conceptResult.detailedExplanation}
                </ReactMarkdown>
              </div>

              {/* Code Snippet */}
              {conceptResult.codeOrFormula && (
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-[#8e918f] flex items-center gap-1">
                    <Code2 className="w-3.5 h-3.5" />
                    <span>Illustration Code Snippet:</span>
                  </span>
                  <pre className="p-4 rounded-2xl bg-[#131314] border border-[#282a2c] overflow-x-auto text-xs font-mono text-[#e3e3e3]">
                    <code>{conceptResult.codeOrFormula}</code>
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 3: PRACTICE QUIZ ARENA */}
      {activeSubTab === 'quiz' && (
        <div className="space-y-6">
          <form
            onSubmit={handleGenerateQuiz}
            className="p-6 rounded-3xl bg-[#1e1f20] border border-[#333538] space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-[#c4c7c5] mb-1.5">Quiz Topic</label>
                <input
                  type="text"
                  value={quizTopic}
                  onChange={(e) => setQuizTopic(e.target.value)}
                  placeholder="e.g. C Programming Pointers, Operating Systems Scheduling"
                  className="w-full bg-[#131314] border border-[#333538] focus:border-[#4285f4] rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#c4c7c5] mb-1.5">Difficulty</label>
                <select
                  value={quizDifficulty}
                  onChange={(e) => setQuizDifficulty(e.target.value as any)}
                  className="w-full bg-[#131314] border border-[#333538] focus:border-[#4285f4] rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none"
                >
                  <option value="easy">Easy (Fundamentals)</option>
                  <option value="medium">Medium (Standard Exam)</option>
                  <option value="hard">Hard (Advanced)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isQuizLoading}
              className="w-full py-3 rounded-full bg-[#e3e3e3] hover:bg-white text-[#131314] font-medium text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isQuizLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Drafting Practice Questions...</span>
                </>
              ) : (
                <>
                  <Award className="w-4 h-4 text-[#d96570]" />
                  <span>Generate Practice Quiz</span>
                </>
              )}
            </button>
          </form>

          {/* Interactive Quiz UI */}
          {quizResult && (
            <div className="p-6 rounded-3xl bg-[#1e1f20] border border-[#333538] space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#282a2c]">
                <div>
                  <h3 className="text-lg font-semibold text-white">{quizResult.title}</h3>
                  <span className="text-xs text-[#8e918f]">
                    {quizResult.questions?.length} Questions • {quizResult.difficulty}
                  </span>
                </div>
                {isQuizSubmitted && (
                  <button
                    onClick={() => {
                      setSelectedAnswers({});
                      setIsQuizSubmitted(false);
                    }}
                    className="px-3.5 py-1.5 rounded-full bg-[#131314] hover:bg-[#282a2c] text-[#c4c7c5] hover:text-white text-xs flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retake</span>
                  </button>
                )}
              </div>

              <div className="space-y-5">
                {quizResult.questions?.map((q, qIndex) => {
                  const selectedOpt = selectedAnswers[qIndex];
                  const isCorrect = selectedOpt === q.correctAnswerIndex;

                  return (
                    <div
                      key={q.id || qIndex}
                      className={`p-4 rounded-2xl transition-all border ${
                        isQuizSubmitted
                          ? isCorrect
                            ? 'bg-[#14321d]/40 border-[#235832]'
                            : 'bg-[#3b1c1c]/40 border-[#682424]'
                          : 'bg-[#131314] border-[#282a2c]'
                      }`}
                    >
                      <div className="text-sm font-medium text-white mb-3 flex items-start gap-2">
                        <span className="text-[#a8c7fa]">Q{qIndex + 1}.</span>
                        <span>{q.question}</span>
                      </div>

                      {/* 4 Options */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options?.map((opt, optIndex) => {
                          const isSelected = selectedOpt === optIndex;
                          let btnStyle = 'bg-[#1e1f20] border-[#282a2c] text-[#c4c7c5] hover:bg-[#282a2c]';

                          if (isSelected) {
                            btnStyle = 'bg-[#004a77] border-[#4285f4] text-white';
                          }

                          if (isQuizSubmitted) {
                            if (optIndex === q.correctAnswerIndex) {
                              btnStyle = 'bg-[#14321d] border-[#34a853] text-[#a8dab5] font-semibold';
                            } else if (isSelected && !isCorrect) {
                              btnStyle = 'bg-[#3b1c1c] border-[#ea4335] text-[#f8b4bb]';
                            }
                          }

                          return (
                            <button
                              key={optIndex}
                              type="button"
                              onClick={() => handleSelectQuizAnswer(qIndex, optIndex)}
                              className={`p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${btnStyle}`}
                            >
                              <span>{opt}</span>
                              {isQuizSubmitted && optIndex === q.correctAnswerIndex && (
                                <Check className="w-4 h-4 text-[#34a853] shrink-0" />
                              )}
                              {isQuizSubmitted && isSelected && !isCorrect && (
                                <X className="w-4 h-4 text-[#ea4335] shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      {isQuizSubmitted && (
                        <div className="mt-3 pt-3 border-t border-[#282a2c] text-xs text-[#c4c7c5]">
                          <strong className="text-[#a8c7fa]">Explanation: </strong>
                          <span>{q.explanation}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {!isQuizSubmitted && (
                <button
                  type="button"
                  onClick={handleSubmitQuiz}
                  className="w-full py-3 rounded-full bg-[#e3e3e3] hover:bg-white text-[#131314] font-medium text-xs transition-all"
                >
                  Submit & View Score
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 4: IMPORTANT QUESTIONS */}
      {activeSubTab === 'questions' && (
        <div className="space-y-6">
          <form
            onSubmit={handleGenerateQuestions}
            className="p-6 rounded-3xl bg-[#1e1f20] border border-[#333538] space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#c4c7c5] mb-1.5">Subject</label>
                <input
                  type="text"
                  value={questionsSubject}
                  onChange={(e) => setQuestionsSubject(e.target.value)}
                  placeholder="e.g. Operating Systems, Database Management Systems"
                  className="w-full bg-[#131314] border border-[#333538] focus:border-[#4285f4] rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#c4c7c5] mb-1.5">Exam Format</label>
                <input
                  type="text"
                  value={questionsExamType}
                  onChange={(e) => setQuestionsExamType(e.target.value)}
                  placeholder="e.g. End Semester Theory Exam"
                  className="w-full bg-[#131314] border border-[#333538] focus:border-[#4285f4] rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isQuestionsLoading}
              className="w-full py-3 rounded-full bg-[#e3e3e3] hover:bg-white text-[#131314] font-medium text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isQuestionsLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Forecasting Exam Questions...</span>
                </>
              ) : (
                <>
                  <HelpCircle className="w-4 h-4 text-[#4285f4]" />
                  <span>Generate Predicted Questions</span>
                </>
              )}
            </button>
          </form>

          {/* Questions Output */}
          {questionsResult && (
            <div className="p-6 rounded-3xl bg-[#1e1f20] border border-[#333538] space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-[#282a2c]">
                <div>
                  <h3 className="text-lg font-semibold text-white">{questionsResult.subject} - Predicted Questions</h3>
                  <p className="text-xs text-[#8e918f] mt-0.5">{questionsResult.examType}</p>
                </div>
                <button
                  onClick={() =>
                    handleBookmarkContent(
                      `${questionsResult.subject} Questions`,
                      'note',
                      JSON.stringify(questionsResult, null, 2)
                    )
                  }
                  className="px-3.5 py-1.5 rounded-full bg-[#131314] hover:bg-[#282a2c] text-[#c4c7c5] hover:text-white text-xs flex items-center gap-1.5"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              </div>

              {questionsResult.categories?.map((cat, cidx) => (
                <div key={cidx} className="space-y-3">
                  <h4 className="text-sm font-semibold text-[#c2e7ff] flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#4285f4]" />
                    <span>{cat.sectionName}</span>
                  </h4>

                  <div className="space-y-3">
                    {cat.questions?.map((q, qidx) => (
                      <div key={qidx} className="p-4 rounded-2xl bg-[#131314] border border-[#282a2c] space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="text-xs font-medium text-white">
                            <span className="text-[#a8c7fa] mr-1.5">Q{qidx + 1}.</span>
                            <span>{q.question}</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="px-2.5 py-0.5 rounded-full bg-[#1e1f20] text-[#a8c7fa] text-[10px] font-semibold">
                              {q.marks} Marks
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full bg-[#1e1f20] text-[#d7bdf5] text-[10px] font-semibold">
                              {q.frequency}
                            </span>
                          </div>
                        </div>

                        {q.keyPointsToInclude && (
                          <div className="text-[11px] text-[#c4c7c5]">
                            <strong className="text-[#a8c7fa]">Key points: </strong>
                            {q.keyPointsToInclude.join(' • ')}
                          </div>
                        )}

                        {q.modelAnswerOutline && (
                          <div className="p-3 rounded-xl bg-[#1e1f20] text-[11px] text-[#8e918f]">
                            <strong className="text-[#e3e3e3]">Structure: </strong>
                            <span>{q.modelAnswerOutline}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
