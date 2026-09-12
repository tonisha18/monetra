import { GoogleGenAI } from '@google/genai';
import { getDashboardSummary, getDashboardCharts } from './dashboardService.js';
import { getTransactions } from './transactionService.js';

let geminiClient = null;

async function callGeminiWithTimeout(ai, params, timeoutMs = 6000) {
  let timer;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('AI generation timed out')), timeoutMs);
  });
  try {
    const result = await Promise.race([
      ai.models.generateContent(params),
      timeoutPromise,
    ]);
    return result;
  } finally {
    clearTimeout(timer);
  }
}

function getGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

// Compute deterministic financial baseline metrics
function computeFinancialMetrics(summary, charts, transactions) {
  const income = Number(summary?.totalIncome) || 0;
  const expenses = Number(summary?.totalExpenses) || 0;
  const savings = Math.max(0, income - expenses);
  const netBalance = Number(summary?.totalBalance) || (income - expenses);

  const savingsRate = income > 0 ? Math.round((savings / income) * 100) : 0;
  const expenseRatio = income > 0 ? Math.round((expenses / income) * 100) : 0;

  // Salary to Savings Ratio
  // If income is ₹100,000 and savings is ₹35,000 -> "100 : 35"
  const salaryToSavingsRatioText = income > 0 ? `100 : ${savingsRate}` : '0 : 0';

  // Benchmark vs 50/30/20 standard
  const benchmarkStatus =
    savingsRate >= 20
      ? expenseRatio <= 70
        ? 'Healthy & Balanced'
        : 'Good Savings, High Expense Ratio'
      : income === 0
      ? 'No Income Recorded'
      : 'Below 20% Savings Target';

  // Category analysis
  const categories = charts?.expensesByCategory || [];
  const topCategories = [...categories]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)
    .map((c) => ({
      category: c.category,
      amount: c.amount,
      percentage: expenses > 0 ? Math.round((c.amount / expenses) * 100) : 0,
      shareOfIncome: income > 0 ? Math.round((c.amount / income) * 100) : 0,
    }));

  // Discretionary vs Non-discretionary estimation
  const wantsKeywords = ['entertainment', 'dining', 'shopping', 'leisure', 'personal', 'travel', 'subscriptions'];
  let estimatedWants = 0;
  let estimatedNeeds = 0;

  for (const cat of categories) {
    const isWant = wantsKeywords.some((w) => cat.category.toLowerCase().includes(w));
    if (isWant) {
      estimatedWants += cat.amount;
    } else {
      estimatedNeeds += cat.amount;
    }
  }

  // Calculate Base Financial Score (0-100)
  let score = 50; // base

  // Factor 1: Savings Rate (0 to 35 pts)
  if (savingsRate >= 30) score += 35;
  else if (savingsRate >= 20) score += 25;
  else if (savingsRate >= 10) score += 15;
  else if (savingsRate > 0) score += 5;
  else score -= 15;

  // Factor 2: Expense-to-Income control (0 to 25 pts)
  if (expenseRatio <= 50) score += 25;
  else if (expenseRatio <= 65) score += 18;
  else if (expenseRatio <= 80) score += 10;
  else if (expenseRatio <= 100) score += 0;
  else score -= 20;

  // Factor 3: Transaction depth & diversity (0 to 15 pts)
  if (transactions.length >= 8) score += 15;
  else if (transactions.length >= 3) score += 10;
  else if (transactions.length >= 1) score += 5;

  // Clamp score
  score = Math.max(10, Math.min(98, score));

  let scoreGrade = 'Moderate';
  let scoreColor = '#f59e0b';
  if (score >= 80) {
    scoreGrade = 'Excellent';
    scoreColor = '#10b981';
  } else if (score >= 65) {
    scoreGrade = 'Strong';
    scoreColor = '#3b82f6';
  } else if (score >= 50) {
    scoreGrade = 'Moderate';
    scoreColor = '#f59e0b';
  } else {
    scoreGrade = 'Needs Attention';
    scoreColor = '#f43f5e';
  }

  // Investable Surplus Calculation (Recommended 60-75% of savings, retaining liquidity)
  const recommendedMonthlyInvestment =
    savings > 0 ? Math.round(savings * 0.65) : 0;
  const liquidEmergencyBuffer =
    savings > 0 ? Math.round(savings * 0.35) : 0;

  return {
    income,
    expenses,
    savings,
    netBalance,
    savingsRate,
    expenseRatio,
    salaryToSavingsRatioText,
    benchmarkStatus,
    topCategories,
    estimatedNeeds,
    estimatedWants,
    financialScore: score,
    scoreGrade,
    scoreColor,
    recommendedMonthlyInvestment,
    liquidEmergencyBuffer,
  };
}

// Generate complete AI Financial Report
export const generateFinancialReport = async (user) => {
  const [summary, charts, transactions] = await Promise.all([
    getDashboardSummary(user),
    getDashboardCharts(user),
    getTransactions(user, { sortBy: 'transaction_date', sortOrder: 'desc' }),
  ]);

  const metrics = computeFinancialMetrics(summary, charts, transactions);

  // Fallback / Rule-based structure ready in case Gemini is not configured or errors
  const fallbackReport = {
    financialScore: metrics.financialScore,
    scoreGrade: metrics.scoreGrade,
    scoreColor: metrics.scoreColor,
    scoreSummary: `Your financial profile currently reflects a ${metrics.savingsRate}% savings rate with an expense-to-income ratio of ${metrics.expenseRatio}%. ${
      metrics.savingsRate >= 20
        ? 'You maintain a strong disciplined surplus each month.'
        : 'Adjusting discretionary lifestyle expenses can rapidly lift your savings into the optimal 20-30% range.'
    }`,
    ratioAnalysis: {
      salaryToSavingsRatioText: metrics.salaryToSavingsRatioText,
      savingsRatePercent: metrics.savingsRate,
      expenseRatioPercent: metrics.expenseRatio,
      benchmarkComparison: `50/30/20 Rule: Current Needs+Wants are ${metrics.expenseRatio}% vs benchmark 80%, Savings is ${metrics.savingsRate}% vs benchmark 20%.`,
      status: metrics.benchmarkStatus,
      verdict:
        metrics.savingsRate >= 20
          ? `Healthy surplus! For every ₹100 of income, you save ₹${metrics.savingsRate}.`
          : `Tight margin. For every ₹100 of income, ₹${metrics.expenseRatio} is spent, leaving ₹${metrics.savingsRate} for savings.`,
    },
    controlAndManageLevers: [
      {
        area: metrics.topCategories[0]?.category || 'Primary Expenses',
        impact: `Accounts for ${metrics.topCategories[0]?.percentage || 0}% of your total outflow (₹${(metrics.topCategories[0]?.amount || 0).toLocaleString('en-IN')}).`,
        action: `Review high-ticket bills and establish a monthly cap of ₹${Math.round((metrics.topCategories[0]?.amount || 0) * 0.85).toLocaleString('en-IN')} to unlock extra monthly capital.`,
      },
      {
        area: metrics.topCategories[1]?.category || 'Secondary Outflow',
        impact: `Represents ${metrics.topCategories[1]?.percentage || 0}% of expenses (₹${(metrics.topCategories[1]?.amount || 0).toLocaleString('en-IN')}).`,
        action: 'Track micro-expenses in this category weekly to curb non-essential impulse spending.',
      },
      {
        area: 'Fixed vs Discretionary Balance',
        impact: `Discretionary expenses account for approximately ₹${metrics.estimatedWants.toLocaleString('en-IN')}.`,
        action: 'Implement a 48-hour cooling-off rule for non-essential purchases exceeding ₹2,000.',
      },
    ],
    investmentPlan: {
      recommendedMonthlyInvestment: metrics.recommendedMonthlyInvestment,
      liquidEmergencyBuffer: metrics.liquidEmergencyBuffer,
      guidance: `With a monthly surplus of ₹${metrics.savings.toLocaleString('en-IN')}, we advise deploying ₹${metrics.recommendedMonthlyInvestment.toLocaleString('en-IN')} into compounding assets while allocating ₹${metrics.liquidEmergencyBuffer.toLocaleString('en-IN')} toward liquid emergency reserves.`,
      allocations: [
        {
          assetClass: 'Broad Index & Flexi-Cap Mutual Funds',
          percentage: 50,
          amount: Math.round(metrics.recommendedMonthlyInvestment * 0.5),
          purpose: 'Long-term capital growth beating inflation (11-13% historical CAGR).',
        },
        {
          assetClass: 'Liquid Funds / High-Yield Savings FD',
          percentage: 30,
          amount: Math.round(metrics.recommendedMonthlyInvestment * 0.3),
          purpose: 'Safe emergency liquidity buffer covering 3-6 months of expenses.',
        },
        {
          assetClass: 'PPF / Sovereign Gold / Fixed Income',
          percentage: 20,
          amount: Math.round(metrics.recommendedMonthlyInvestment * 0.2),
          purpose: 'Capital preservation and guaranteed low-volatility stability.',
        },
      ],
    },
    actionableSteps: [
      `Automate ₹${metrics.recommendedMonthlyInvestment.toLocaleString('en-IN')} SIP investment immediately on salary credit day.`,
      `Set a strict weekly ceiling on ${metrics.topCategories[0]?.category || 'discretionary items'} of ₹${Math.round((metrics.topCategories[0]?.amount || 0) / 4).toLocaleString('en-IN')}.`,
      `Maintain a 3-month emergency fund target of ₹${Math.round(metrics.expenses * 3).toLocaleString('en-IN')} before aggressive equity allocation.`,
      'Conduct a 5-minute Sunday spending audit using Monetra to keep category allocations within bounds.',
    ],
    quickWins: [
      `Canceling 1-2 underused recurring subscriptions saves up to ₹1,500/month.`,
      `Setting a dedicated dining/delivery weekly budget saves ~₹3,000/month.`,
      `Transferring savings on day 1 rather than spending remainder increases retention by 22%.`,
    ],
    generatedBy: 'Monetra Heuristic Engine',
    timestamp: new Date().toISOString(),
    metrics,
  };

  const ai = getGemini();
  if (!ai) {
    return fallbackReport;
  }

  try {
    const prompt = `
You are AI FinSight, an expert personal financial strategist for Indian consumers inside the Monetra app.
Analyze the user's financial profile and generate a comprehensive, highly customized Financial Health Report.
All monetary values must be calibrated in Indian Rupees (₹ INR).

User Financial Data:
- Total Income: ₹${metrics.income.toLocaleString('en-IN')}
- Total Expenses: ₹${metrics.expenses.toLocaleString('en-IN')}
- Net Savings: ₹${metrics.savings.toLocaleString('en-IN')}
- Current Savings Rate: ${metrics.savingsRate}%
- Expense to Income Ratio: ${metrics.expenseRatio}%
- Salary to Savings Ratio: ${metrics.salaryToSavingsRatioText}
- Number of Transactions: ${transactions.length}
- Top Expense Categories:
${metrics.topCategories
  .map(
    (c) =>
      `  * ${c.category}: ₹${c.amount.toLocaleString('en-IN')} (${c.percentage}% of expenses, ${c.shareOfIncome}% of income)`
  )
  .join('\n')}

Required Task:
Generate a valid JSON object matching the exact schema below:
{
  "financialScore": number (between 10 and 100 based on savings discipline, expense ratio, and income coverage),
  "scoreGrade": string (one of "Excellent", "Strong", "Moderate", "Needs Attention"),
  "scoreSummary": string (concise 1-2 sentence executive summary of financial health),
  "ratioAnalysis": {
    "salaryToSavingsRatioText": string (e.g. "${metrics.salaryToSavingsRatioText}"),
    "savingsRatePercent": number,
    "expenseRatioPercent": number,
    "benchmarkComparison": string (comparison against standard 50/30/20 rule: 50% Needs, 30% Wants, 20% Savings),
    "status": string,
    "verdict": string (analytical paragraph on whether their current ratio builds sustainable wealth or risks financial strain)
  },
  "controlAndManageLevers": [
    {
      "area": string (name of specific expense category or leak to control),
      "impact": string (concise explanation of outflow drain in ₹ and %),
      "action": string (concrete, realistic action the user should take to rein in this expense)
    }
  ],
  "investmentPlan": {
    "recommendedMonthlyInvestment": number (safe amount in ₹ that can be invested monthly without starving cash flow),
    "liquidEmergencyBuffer": number (amount in ₹ to keep liquid for emergencies),
    "guidance": string (explanation of how this investment plan fits their savings),
    "allocations": [
      {
        "assetClass": string (e.g. Index Mutual Funds, Liquid FD, Gold/PPF),
        "percentage": number,
        "amount": number,
        "purpose": string
      }
    ]
  },
  "actionableSteps": [
    string (3 to 5 prioritized, high-impact financial steps to implement this month)
  ],
  "quickWins": [
    string (2 to 3 immediate actions to save money this week)
  ]
}

Return ONLY valid JSON. No markdown formatting, no backticks, just raw JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are AI FinSight in Monetra. Always respond with strictly valid JSON without code blocks or markdown.',
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text;
    if (responseText) {
      let cleaned = responseText.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const parsed = JSON.parse(cleaned);

      let scoreColor = '#f59e0b';
      if (parsed.financialScore >= 80) scoreColor = '#10b981';
      else if (parsed.financialScore >= 65) scoreColor = '#3b82f6';
      else if (parsed.financialScore >= 50) scoreColor = '#f59e0b';
      else scoreColor = '#f43f5e';

      return {
        ...parsed,
        scoreColor,
        generatedBy: 'Gemini 3.5 AI Engine',
        timestamp: new Date().toISOString(),
        metrics,
      };
    }
  } catch (err) {
    console.error('Error generating AI report with Gemini:', err.message);
  }

  return fallbackReport;
};

// Answer interactive financial questions via chat
export const answerFinancialQuestion = async (user, question, history = []) => {
  const [summary, charts, transactions] = await Promise.all([
    getDashboardSummary(user),
    getDashboardCharts(user),
    getTransactions(user, { sortBy: 'transaction_date', sortOrder: 'desc' }),
  ]);

  const metrics = computeFinancialMetrics(summary, charts, transactions);

  const ai = getGemini();
  if (!ai) {
    // Intelligent contextual fallback
    const qLower = (question || '').toLowerCase();
    let reply = `Based on your Monetra records, your total income is ₹${metrics.income.toLocaleString('en-IN')} with total expenses of ₹${metrics.expenses.toLocaleString('en-IN')}, leaving a monthly surplus of ₹${metrics.savings.toLocaleString('en-IN')} (savings rate of ${metrics.savingsRate}%). `;

    if (qLower.includes('invest') || qLower.includes('stock') || qLower.includes('mutual fund')) {
      reply += `You can safely invest approximately ₹${metrics.recommendedMonthlyInvestment.toLocaleString('en-IN')} every month (65% of your net savings). Consider putting 50% in low-cost broad market index funds, 30% in short-term liquid funds, and 20% in fixed income instruments like PPF.`;
    } else if (qLower.includes('ratio') || qLower.includes('salary') || qLower.includes('savings')) {
      reply += `Your current Salary-to-Savings ratio is ${metrics.salaryToSavingsRatioText}. Under the standard 50/30/20 rule, your target is at least 20% savings. With your current ${metrics.savingsRate}%, you are ${metrics.savingsRate >= 20 ? 'already meeting the benchmark!' : 'a bit under the benchmark. Trimming your top expense (' + (metrics.topCategories[0]?.category || 'General') + ') will immediately boost your ratio.'}`;
    } else if (qLower.includes('cut') || qLower.includes('reduce') || qLower.includes('control') || qLower.includes('manage')) {
      reply += `Your highest expense category is ${metrics.topCategories[0]?.category || 'General'} at ₹${(metrics.topCategories[0]?.amount || 0).toLocaleString('en-IN')} (${metrics.topCategories[0]?.percentage || 0}% of all spending). We recommend setting a 15% reduction target on this category to free up ₹${Math.round((metrics.topCategories[0]?.amount || 0) * 0.15).toLocaleString('en-IN')} monthly.`;
    } else if (qLower.includes('emergency') || qLower.includes('fund')) {
      const emergencyTarget = Math.round(metrics.expenses * 3);
      reply += `An optimal emergency fund covers 3 to 6 months of living expenses. For your current monthly spending level of ₹${metrics.expenses.toLocaleString('en-IN')}, your 3-month target is ₹${emergencyTarget.toLocaleString('en-IN')}.`;
    } else {
      reply += `To optimize your financial health score (${metrics.financialScore}/100), focus on maintaining an automated savings transfer right after salary day, and check your ${metrics.topCategories[0]?.category || 'discretionary'} outflow weekly. Feel free to ask specific questions about budgeting, investments, or category spending!`;
    }

    return {
      answer: reply,
      metrics,
      engine: 'Monetra Intelligence Engine',
    };
  }

  try {
    const contextPrompt = `
You are AI FinSight, a warm, professional, and sharp personal financial advisor inside the Monetra app.
The user is asking you a question about their finances.
All monetary amounts are in Indian Rupees (₹ INR). Use the user's real financial numbers to give precise, actionable, and encouraging financial guidance.

User Real Financial Snapshot:
- Total Income / Salary: ₹${metrics.income.toLocaleString('en-IN')}
- Total Expenses: ₹${metrics.expenses.toLocaleString('en-IN')}
- Net Surplus / Savings: ₹${metrics.savings.toLocaleString('en-IN')}
- Current Savings Rate: ${metrics.savingsRate}%
- Expense Ratio: ${metrics.expenseRatio}%
- Salary to Savings Ratio: ${metrics.salaryToSavingsRatioText}
- Financial Health Score: ${metrics.financialScore}/100 (${metrics.scoreGrade})
- Recommended Monthly Investment Surplus: ₹${metrics.recommendedMonthlyInvestment.toLocaleString('en-IN')}
- Top Spending Categories:
${metrics.topCategories.map((c) => `  * ${c.category}: ₹${c.amount.toLocaleString('en-IN')} (${c.percentage}%)`).join('\n')}

Recent Conversation History:
${(history || [])
  .slice(-6)
  .map((m) => `${m.role === 'user' ? 'User' : 'AI FinSight'}: ${m.content}`)
  .join('\n')}

User's New Question: "${question}"

Instructions:
- Address the user's question directly with concise, punchy, high-value advice.
- Cite their actual figures (e.g. income, expenses, category spending, investable surplus in ₹) where relevant.
- Keep responses within 2-4 well-structured paragraphs or bullet points for effortless reading.
- Do not give generic platitudes; provide clear numerical clarity.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contextPrompt,
      config: {
        systemInstruction:
          'You are AI FinSight, an astute personal finance AI assistant inside Monetra. Respond cleanly in helpful text, incorporating Indian Rupees (₹) and actual user metrics.',
      },
    });

    const answer = response.text || 'I analyzed your financial records and can help you optimize your savings and investment strategy.';

    return {
      answer,
      metrics,
      engine: 'Gemini 3.5 AI',
    };
  } catch (err) {
    console.error('Error in answerFinancialQuestion:', err.message);
    return {
      answer: `Based on your Monetra records (Income: ₹${metrics.income.toLocaleString('en-IN')}, Expenses: ₹${metrics.expenses.toLocaleString('en-IN')}, Savings: ₹${metrics.savings.toLocaleString('en-IN')}), your savings rate is ${metrics.savingsRate}%. You can comfortably invest up to ₹${metrics.recommendedMonthlyInvestment.toLocaleString('en-IN')} monthly while maintaining your liquid buffer.`,
      metrics,
      engine: 'Monetra Fallback Engine',
    };
  }
};
