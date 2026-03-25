import { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Layout } from '@/components/Layout';
import { motion } from 'framer-motion';
import { CheckCircle, Lock } from 'lucide-react';

interface Quiz { question: string; options: string[]; correct: number; }

const modulesData = [
  {
    id: 1, title: 'Stock Market Basics', desc: 'Learn what stocks are and how markets work.',
    content: 'A stock represents ownership in a company. When you buy a stock, you own a small piece of that company. Stock prices are determined by supply and demand in the market.',
    quiz: [
      { question: 'What does a stock represent?', options: ['A loan to a company', 'Ownership in a company', 'A bond', 'A derivative'], correct: 1 },
      { question: 'What determines stock prices?', options: ['The government', 'Supply and demand', 'Company CEO', 'Random'], correct: 1 },
    ] as Quiz[],
    reward: 200,
  },
  {
    id: 2, title: 'Reading Charts', desc: 'Understand candlestick charts and trends.',
    content: 'Candlestick charts show the open, high, low, and close prices for a time period. Green candles mean the price went up, red means it went down. Trends can be identified by connecting highs or lows.',
    quiz: [
      { question: 'What does a green candle mean?', options: ['Price went down', 'Price stayed same', 'Price went up', 'Market closed'], correct: 2 },
      { question: 'What do candlesticks show?', options: ['Only close price', 'Open, high, low, close', 'Volume only', 'Market cap'], correct: 1 },
    ] as Quiz[],
    reward: 300,
  },
  {
    id: 3, title: 'Risk Management', desc: 'Learn to protect your portfolio from big losses.',
    content: 'Never risk more than 2% of your portfolio on a single trade. Use stop-losses to limit downside. Diversification across sectors reduces overall risk.',
    quiz: [
      { question: 'Max risk per trade rule of thumb?', options: ['10%', '50%', '2%', '25%'], correct: 2 },
      { question: 'What is diversification?', options: ['Buying one stock', 'Spreading investments', 'Selling everything', 'Day trading'], correct: 1 },
    ] as Quiz[],
    reward: 300,
  },
  {
    id: 4, title: 'Order Types', desc: 'Market orders, limit orders, and stop orders.',
    content: 'Market orders execute immediately at current price. Limit orders only execute at your specified price or better. Stop orders trigger when a price level is reached.',
    quiz: [
      { question: 'Which executes immediately?', options: ['Limit order', 'Stop order', 'Market order', 'None'], correct: 2 },
      { question: 'A limit buy order executes at?', options: ['Any price', 'Your price or lower', 'Your price or higher', 'Random price'], correct: 1 },
    ] as Quiz[],
    reward: 250,
  },
  {
    id: 5, title: 'Portfolio Strategy', desc: 'Build a balanced long-term portfolio.',
    content: 'A balanced portfolio includes stocks, bonds, and cash. Rebalance periodically. Growth stocks offer higher returns but more risk. Value stocks are more stable.',
    quiz: [
      { question: 'What should a balanced portfolio include?', options: ['Only stocks', 'Stocks, bonds, cash', 'Only crypto', 'Only bonds'], correct: 1 },
      { question: 'Growth stocks are?', options: ['Low risk low return', 'Higher risk higher return', 'Always profitable', 'Government bonds'], correct: 1 },
    ] as Quiz[],
    reward: 400,
  },
];

const Modules = () => {
  const { user, completeModule, addCoins, addXp } = useUser();
  const [activeModule, setActiveModule] = useState<number | null>(null);
  const [quizMode, setQuizMode] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);

  if (!user) return null;

  const mod = activeModule !== null ? modulesData.find(m => m.id === activeModule) : null;
  const isCompleted = (id: number) => user.modules.some(m => m.moduleId === id && m.completed);

  const handleSubmitQuiz = () => {
    if (!mod) return;
    const score = mod.quiz.reduce((s, q, i) => s + (answers[i] === q.correct ? 1 : 0), 0);
    const pct = Math.round((score / mod.quiz.length) * 100);
    if (pct >= 50) {
      completeModule(mod.id, pct);
      addCoins(mod.reward);
      addXp(mod.reward);
    }
    setSubmitted(true);
  };

  if (mod) {
    const completed = isCompleted(mod.id);
    const score = mod.quiz.reduce((s, q, i) => s + (answers[i] === q.correct ? 1 : 0), 0);

    return (
      <Layout>
        <div className="max-w-3xl mx-auto">
          <button onClick={() => { setActiveModule(null); setQuizMode(false); setAnswers([]); setSubmitted(false); }}
            className="font-mono text-xs text-muted-foreground hover:text-primary mb-4 inline-block">
            ← Back to Modules
          </button>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-cyber">
            <h2 className="font-display text-lg tracking-wider text-primary mb-1">{mod.title}</h2>
            {completed && <span className="font-mono text-xs text-neon-green">✓ Completed</span>}

            {!quizMode ? (
              <div className="mt-4 space-y-4">
                <p className="text-sm text-foreground leading-relaxed">{mod.content}</p>
                {!completed && (
                  <button onClick={() => { setQuizMode(true); setAnswers([]); setSubmitted(false); }}
                    className="btn-cyber-primary text-xs">
                    Take Quiz
                  </button>
                )}
              </div>
            ) : (
              <div className="mt-4 space-y-6">
                {mod.quiz.map((q, qi) => (
                  <div key={qi}>
                    <p className="font-mono text-sm text-foreground mb-2">{qi + 1}. {q.question}</p>
                    <div className="space-y-1.5">
                      {q.options.map((opt, oi) => (
                        <button key={oi}
                          onClick={() => !submitted && setAnswers(a => { const n = [...a]; n[qi] = oi; return n; })}
                          className={`block w-full text-left px-3 py-2 rounded text-xs font-mono border transition-colors ${
                            submitted
                              ? oi === q.correct ? 'border-neon-green text-neon-green bg-neon-green/10'
                                : answers[qi] === oi ? 'border-destructive text-destructive bg-destructive/10'
                                : 'border-border text-muted-foreground'
                              : answers[qi] === oi ? 'border-primary text-primary bg-primary/10'
                              : 'border-border text-muted-foreground hover:border-muted-foreground'
                          }`}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {!submitted ? (
                  <button onClick={handleSubmitQuiz} disabled={answers.length < mod.quiz.length}
                    className="btn-cyber-primary text-xs disabled:opacity-40">
                    Submit
                  </button>
                ) : (
                  <div className="card-cyber border-primary/30">
                    <p className="font-mono text-sm">
                      Score: <span className="text-primary">{score}/{mod.quiz.length}</span>
                      {score / mod.quiz.length >= 0.5
                        ? <span className="text-neon-green ml-2">+{mod.reward} coins & XP!</span>
                        : <span className="text-destructive ml-2">Need 50% to pass. Try again.</span>}
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <h2 className="font-display text-2xl tracking-wider text-primary text-glow-cyan">Modules</h2>
        <div className="space-y-3">
          {modulesData.map((m, i) => {
            const done = isCompleted(m.id);
            return (
              <motion.button key={m.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setActiveModule(m.id)}
                className="card-cyber w-full text-left flex items-center gap-4 hover:border-primary/50 transition-colors"
              >
                {done ? <CheckCircle className="h-5 w-5 text-neon-green flex-shrink-0" />
                  : <Lock className="h-5 w-5 text-muted-foreground flex-shrink-0" />}
                <div className="flex-1">
                  <p className="font-display text-sm tracking-wider text-foreground">{m.title}</p>
                  <p className="font-mono text-xs text-muted-foreground mt-0.5">{m.desc}</p>
                </div>
                <span className="font-mono text-xs text-primary">{m.reward} coins</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default Modules;
