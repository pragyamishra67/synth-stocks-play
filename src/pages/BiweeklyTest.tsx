import { Layout } from '@/components/Layout';
import { Clock } from 'lucide-react';

const BiweeklyTest = () => (
  <Layout>
    <div className="max-w-3xl mx-auto flex flex-col items-center justify-center min-h-[50vh]">
      <div className="card-cyber text-center">
        <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse-glow" />
        <h2 className="font-display text-xl tracking-wider text-primary mb-2">Bi-weekly Test</h2>
        <p className="font-mono text-xs text-muted-foreground">Coming soon. Check back later for timed challenges.</p>
      </div>
    </div>
  </Layout>
);

export default BiweeklyTest;
