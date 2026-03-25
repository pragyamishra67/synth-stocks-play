import { useUser } from '@/contexts/UserContext';
import { Layout } from '@/components/Layout';
import { motion } from 'framer-motion';
import { TrendingUp, Award, Coins, BarChart3 } from 'lucide-react';

const Dashboard = () => {
  const { user } = useUser();
  if (!user) return null;

  const stats = [
    { label: 'Coins', value: user.coins.toLocaleString(), icon: Coins, color: 'text-primary' },
    { label: 'Level', value: user.level, icon: TrendingUp, color: 'text-neon-green' },
    { label: 'XP', value: user.xp, icon: BarChart3, color: 'text-neon-purple' },
    { label: 'Badges', value: user.badges.length, icon: Award, color: 'text-secondary' },
  ];

  const portfolioValue = user.holdings.reduce((sum, h) => sum + h.shares * h.avgPrice, 0);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h2 className="font-display text-2xl tracking-wider text-primary text-glow-cyan mb-1">
            Dashboard
          </h2>
          <p className="font-mono text-xs text-muted-foreground">Welcome back, {user.username}</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="card-cyber"
            >
              <s.icon className={`h-5 w-5 ${s.color} mb-2`} />
              <p className={`font-display text-xl ${s.color}`}>{s.value}</p>
              <p className="font-mono text-xs text-muted-foreground mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="card-cyber">
            <h3 className="font-display text-sm tracking-wider text-primary mb-4">Portfolio</h3>
            {user.holdings.length === 0 ? (
              <p className="font-mono text-xs text-muted-foreground">No holdings yet. Start trading!</p>
            ) : (
              <div className="space-y-2">
                {user.holdings.map(h => (
                  <div key={h.symbol} className="flex justify-between items-center font-mono text-xs">
                    <span className="text-foreground">{h.symbol}</span>
                    <span className="text-muted-foreground">{h.shares} shares</span>
                    <span className="text-primary">{(h.shares * h.avgPrice).toLocaleString()} coins</span>
                  </div>
                ))}
                <div className="border-t border-border pt-2 flex justify-between font-mono text-xs">
                  <span className="text-muted-foreground">Total Value</span>
                  <span className="text-primary">{portfolioValue.toLocaleString()} coins</span>
                </div>
              </div>
            )}
          </div>

          <div className="card-cyber">
            <h3 className="font-display text-sm tracking-wider text-primary mb-4">Progress</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between font-mono text-xs mb-1">
                  <span className="text-muted-foreground">Modules Completed</span>
                  <span className="text-foreground">{user.modules.filter(m => m.completed).length}/5</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${(user.modules.filter(m => m.completed).length / 5) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between font-mono text-xs mb-1">
                  <span className="text-muted-foreground">Total Trades</span>
                  <span className="text-foreground">{user.trades}</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between font-mono text-xs mb-1">
                  <span className="text-muted-foreground">XP to Next Level</span>
                  <span className="text-foreground">{500 - (user.xp % 500)}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-neon-purple rounded-full transition-all"
                    style={{ width: `${((user.xp % 500) / 500) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
