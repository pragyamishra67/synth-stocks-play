import { useUser } from '@/contexts/UserContext';
import { Layout } from '@/components/Layout';
import { motion } from 'framer-motion';
import { Award, Star, Shield, Zap, BookOpen, TrendingUp } from 'lucide-react';

const badgeIcons: Record<string, typeof Award> = {
  Newcomer: Star, Veteran: Shield, Elite: Zap, Scholar: BookOpen, Trader: TrendingUp, 'Day Trader': TrendingUp,
};

const ranks = ['Rookie', 'Apprentice', 'Trader', 'Analyst', 'Strategist', 'Expert', 'Master', 'Legend'];

const Profile = () => {
  const { user } = useUser();
  if (!user) return null;

  const rank = ranks[Math.min(user.level - 1, ranks.length - 1)];
  const daysSinceJoin = Math.max(1, Math.floor((Date.now() - user.joinedAt) / 86400000));

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-cyber text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-muted border-2 border-primary flex items-center justify-center mb-3 border-glow-cyan">
            <span className="font-display text-2xl text-primary">{user.username[0].toUpperCase()}</span>
          </div>
          <h2 className="font-display text-xl tracking-wider text-foreground">{user.username}</h2>
          <p className="font-mono text-xs text-primary mt-1">{rank} • Level {user.level}</p>
          <p className="font-mono text-xs text-muted-foreground mt-0.5">Member for {daysSinceJoin} day{daysSinceJoin !== 1 ? 's' : ''}</p>
        </motion.div>

        <div className="card-cyber">
          <h3 className="font-display text-sm tracking-wider text-primary mb-4">Stats</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
            <div><p className="text-muted-foreground">Coins</p><p className="text-foreground text-lg">{user.coins.toLocaleString()}</p></div>
            <div><p className="text-muted-foreground">XP</p><p className="text-foreground text-lg">{user.xp}</p></div>
            <div><p className="text-muted-foreground">Trades</p><p className="text-foreground text-lg">{user.trades}</p></div>
            <div><p className="text-muted-foreground">Modules</p><p className="text-foreground text-lg">{user.modules.filter(m => m.completed).length}/5</p></div>
          </div>
        </div>

        <div className="card-cyber">
          <h3 className="font-display text-sm tracking-wider text-primary mb-4">Badges</h3>
          <div className="flex flex-wrap gap-3">
            {user.badges.map(badge => {
              const Icon = badgeIcons[badge] || Award;
              return (
                <motion.div key={badge} initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="flex items-center gap-2 bg-muted rounded-full px-3 py-1.5 border border-border">
                  <Icon className="h-3.5 w-3.5 text-secondary" />
                  <span className="font-mono text-xs text-foreground">{badge}</span>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="card-cyber">
          <h3 className="font-display text-sm tracking-wider text-primary mb-4">Level Progress</h3>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((user.xp % 500) / 500) * 100}%` }}
              className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
            />
          </div>
          <p className="font-mono text-xs text-muted-foreground mt-2">{user.xp % 500}/500 XP to Level {user.level + 1}</p>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
