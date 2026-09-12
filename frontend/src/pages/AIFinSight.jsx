import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  AlertCircle,
  PiggyBank,
  CheckCircle2,
  Send,
  Bot,
  User,
  ArrowRight,
  Sliders,
  DollarSign,
  Briefcase,
  HelpCircle,
  IndianRupee,
  ChevronRight,
  Lightbulb,
} from 'lucide-react';
import { fetchAIFinancialReport, sendAIFinancialChat } from '../services/aiApi.js';
import { formatCurrency } from '../utils/formatters.js';

export const AIFinSight = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Chat State
  const [chatMessages, setChatMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Hello! I am your Monetra AI FinSight advisor. Ask me anything about your salary-to-savings ratio, category spending, emergency cushion, or how to invest your monthly surplus.",
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const chatBottomRef = useRef(null);

  const quickPrompts = [
    'How can I improve my savings ratio to 30%?',
    'What is my safe monthly investment amount?',
    'Which expense should I cut first to save more?',
    'How does my budget compare to the 50/30/20 rule?',
    'What should my emergency fund target be?',
  ];

  const loadReport = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const data = await fetchAIFinancialReport();
      setReport(data);
    } catch (err) {
      console.error('Failed to load AI report:', err);
      setError(err.userMessage || 'Unable to generate financial report at this moment. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadReport();

    const handleRefresh = () => loadReport(true);
    window.addEventListener('monetra-refresh', handleRefresh);
    return () => window.removeEventListener('monetra-refresh', handleRefresh);
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAsking]);

  const handleSendMessage = async (customPrompt) => {
    const textToSend = customPrompt || inputQuestion.trim();
    if (!textToSend || isAsking) return;

    const userMsg = {
      id: String(Date.now()),
      role: 'user',
      content: textToSend,
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setIsAsking(true);

    try {
      const history = chatMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await sendAIFinancialChat(textToSend, history);
      const aiReply = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: res.answer,
      };
      setChatMessages((prev) => [...prev, aiReply]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          role: 'assistant',
          content: 'Sorry, I ran into an error processing that question. Please try asking again.',
        },
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-xl w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-44 bg-slate-200 rounded-2xl"></div>
          <div className="h-44 bg-slate-200 rounded-2xl"></div>
          <div className="h-44 bg-slate-200 rounded-2xl"></div>
        </div>
        <div className="h-80 bg-slate-200 rounded-2xl"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="text-base font-semibold text-rose-800">Financial Report Unavailable</h3>
        <p className="text-sm text-rose-600 max-w-md mx-auto">{error}</p>
        <button
          onClick={() => loadReport()}
          className="px-4 py-2 bg-rose-600 text-white rounded-xl text-sm font-medium hover:bg-rose-700 transition-colors"
        >
          Retry Analysis
        </button>
      </div>
    );
  }

  const score = report?.financialScore || 50;
  const scoreGrade = report?.scoreGrade || 'Moderate';
  const scoreColor = report?.scoreColor || '#f59e0b';
  const metrics = report?.metrics || {};
  const ratioAnalysis = report?.ratioAnalysis || {};
  const controlLevers = report?.controlAndManageLevers || [];
  const investmentPlan = report?.investmentPlan || {};
  const actionableSteps = report?.actionableSteps || [];
  const quickWins = report?.quickWins || [];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AI FinSight</h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
              Gemini 3.5
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Intelligent ratio analysis, financial health scoring, and surplus investment optimization in Indian Rupees (₹).
          </p>
        </div>

        <button
          id="re-analyze-btn"
          type="button"
          onClick={() => loadReport(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-medium rounded-xl transition-all shadow-xs disabled:opacity-50 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin text-emerald-400' : ''}`} />
          {refreshing ? 'Analyzing...' : 'Re-analyze'}
        </button>
      </div>

      {/* Financial Health Score & Ratio Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Financial Health Score
              </h2>
              <span
                className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                style={{
                  backgroundColor: `${scoreColor}15`,
                  color: scoreColor,
                  border: `1px solid ${scoreColor}30`,
                }}
              >
                {scoreGrade}
              </span>
            </div>

            {/* Circular / Big Score Display */}
            <div className="my-5 flex items-baseline space-x-2">
              <span className="text-5xl font-extrabold tracking-tight" style={{ color: scoreColor }}>
                {score}
              </span>
              <span className="text-lg font-medium text-slate-400">/ 100</span>
            </div>

            {/* Progress meter bar */}
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-4">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${score}%`, backgroundColor: scoreColor }}
              />
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {report?.scoreSummary}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-center">
            <div className="p-2.5 bg-slate-50 rounded-xl">
              <p className="text-[11px] text-slate-400 font-medium">Monthly Savings</p>
              <p className="text-sm font-bold text-slate-800 mt-0.5">
                {formatCurrency(metrics.savings || 0)}
              </p>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl">
              <p className="text-[11px] text-slate-400 font-medium">Savings Rate</p>
              <p className="text-sm font-bold text-emerald-600 mt-0.5">
                {metrics.savingsRate || 0}%
              </p>
            </div>
          </div>
        </div>

        {/* Salary to Savings to Expense Ratio Card */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                  Salary to Savings to Expense Ratio
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Proportionate outflow and surplus retention per ₹100 of earnings
                </p>
              </div>
              <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold">
                Ratio: {ratioAnalysis.salaryToSavingsRatioText || '100 : 0'}
              </span>
            </div>

            {/* Visual Split Bar */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span className="flex items-center text-rose-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 mr-1.5 inline-block"></span>
                  Expenses ({metrics.expenseRatio || 0}%)
                </span>
                <span className="flex items-center text-emerald-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1.5 inline-block"></span>
                  Savings ({metrics.savingsRate || 0}%)
                </span>
              </div>
              <div className="h-4 w-full bg-slate-100 rounded-full flex overflow-hidden p-0.5">
                <div
                  className="bg-rose-500 h-full rounded-l-full transition-all duration-1000"
                  style={{ width: `${Math.min(100, metrics.expenseRatio || 0)}%` }}
                  title={`Expenses: ${metrics.expenseRatio}%`}
                />
                <div
                  className="bg-emerald-500 h-full rounded-r-full transition-all duration-1000"
                  style={{ width: `${Math.max(0, 100 - (metrics.expenseRatio || 0))}%` }}
                  title={`Savings: ${metrics.savingsRate}%`}
                />
              </div>
            </div>

            {/* Benchmark comparison box */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 mb-4">
              <div className="flex items-start space-x-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Benchmark: The 50/30/20 Standard
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {ratioAnalysis.benchmarkComparison}
                  </p>
                  <p className="text-xs text-slate-700 font-medium mt-2">
                    {ratioAnalysis.verdict}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Metric Trio */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
              <span className="text-[10px] text-emerald-600 font-bold uppercase">Total Income</span>
              <p className="text-sm sm:text-base font-extrabold text-emerald-900 mt-0.5">
                {formatCurrency(metrics.income || 0)}
              </p>
            </div>
            <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-100">
              <span className="text-[10px] text-rose-600 font-bold uppercase">Total Expenses</span>
              <p className="text-sm sm:text-base font-extrabold text-rose-900 mt-0.5">
                {formatCurrency(metrics.expenses || 0)}
              </p>
            </div>
            <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
              <span className="text-[10px] text-indigo-600 font-bold uppercase">Net Surplus</span>
              <p className="text-sm sm:text-base font-extrabold text-indigo-900 mt-0.5">
                {formatCurrency(metrics.savings || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Section: Control & Manage vs Investment Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* What all you need to control and manage */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Sliders className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-slate-900">
              What to Control & Manage
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Key outflow bottlenecks and practical controls to maintain an optimal savings ratio:
          </p>

          <div className="space-y-3.5">
            {controlLevers.map((lever, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-800 flex items-center">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center justify-center mr-2">
                      {idx + 1}
                    </span>
                    {lever.area}
                  </span>
                  <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                    {lever.impact}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-2 pl-7 leading-relaxed">
                  <strong className="text-slate-800">Action:</strong> {lever.action}
                </p>
              </div>
            ))}
          </div>

          {/* Quick Wins */}
          {quickWins.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center">
                <Lightbulb className="w-4 h-4 text-amber-500 mr-1.5" />
                Quick Wins to Save This Week
              </h3>
              <ul className="space-y-1.5">
                {quickWins.map((win, idx) => (
                  <li key={idx} className="text-xs text-slate-600 flex items-start">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mr-2 mt-0.5 shrink-0" />
                    <span>{win}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* What Amount Can Be Invested */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <PiggyBank className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">
              Surplus & Investment Allocation
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Calculated investable surplus to build long-term wealth without starving liquid cash flow:
          </p>

          {/* High Level Investment Numbers */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
                Recommended Monthly Investment
              </span>
              <p className="text-xl sm:text-2xl font-extrabold text-emerald-900 mt-1">
                {formatCurrency(investmentPlan.recommendedMonthlyInvestment || 0)}
              </p>
              <span className="text-[11px] text-emerald-700/80 mt-1 block">
                Safe allocation (~65% of surplus)
              </span>
            </div>

            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">
                Liquid Emergency Buffer
              </span>
              <p className="text-xl sm:text-2xl font-extrabold text-blue-900 mt-1">
                {formatCurrency(investmentPlan.liquidEmergencyBuffer || 0)}
              </p>
              <span className="text-[11px] text-blue-700/80 mt-1 block">
                Retained for liquidity & buffer
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
            {investmentPlan.guidance}
          </p>

          {/* Asset Allocations */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Suggested Portfolio Deployment
            </h3>
            {(investmentPlan.allocations || []).map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between"
              >
                <div className="flex-1 pr-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-800">
                      {item.assetClass}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                      {item.percentage}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {item.purpose}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-900 block">
                    {formatCurrency(item.amount || 0)}
                  </span>
                  <span className="text-[10px] text-slate-400">per month</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actionable Steps Roadmap */}
      {actionableSteps.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 text-emerald-600 mr-2" />
            Priority Financial Action Plan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {actionableSteps.map((step, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-between"
              >
                <div>
                  <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center justify-center mb-2.5">
                    {idx + 1}
                  </span>
                  <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                    {step}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive AI FinSight Q&A Assistant */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center border border-emerald-500/30">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Ask AI FinSight
              </h2>
              <p className="text-xs text-slate-500">
                Ask any questions about your budget, savings targets, or investments
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
            Powered by Gemini
          </span>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-4 bg-slate-50/80 border-b border-slate-100 flex flex-wrap gap-2">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(prompt)}
              disabled={isAsking}
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 transition-colors disabled:opacity-50 cursor-pointer text-left"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Message Stream */}
        <div className="p-6 max-h-96 overflow-y-auto space-y-4">
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                  AI
                </div>
              )}
              <div
                className={`max-w-xl p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-xs'
                    : 'bg-slate-100 text-slate-800 rounded-bl-xs'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}

          {isAsking && (
            <div className="flex items-center space-x-3 justify-start">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 text-xs font-bold">
                AI
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-100 text-slate-500 rounded-bl-xs flex items-center space-x-2 text-xs">
                <span className="animate-pulse">Analyzing your numbers...</span>
              </div>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-2"
          >
            <input
              id="ai-chat-input"
              type="text"
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              placeholder="e.g. Can I afford to invest ₹15,000 this month? What's my biggest leak?"
              disabled={isAsking}
              className="flex-1 px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all disabled:opacity-50"
            />
            <button
              id="ai-chat-send-btn"
              type="submit"
              disabled={!inputQuestion.trim() || isAsking}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium text-sm flex items-center transition-all disabled:opacity-50 cursor-pointer shadow-xs"
            >
              <Send className="w-4 h-4 mr-1.5" />
              <span>Ask</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
