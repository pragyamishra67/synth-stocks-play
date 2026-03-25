import { Layout } from '@/components/Layout';
import { LineChart } from 'lucide-react';

const LiveCharts = () => (
  <Layout>
    <div className="max-w-3xl mx-auto flex flex-col items-center justify-center min-h-[50vh]">
      <div className="card-cyber text-center">
        <LineChart className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse-glow" />
        <h2 className="font-display text-xl tracking-wider text-primary mb-2">Live Charts</h2>
        <p className="font-mono text-xs text-muted-foreground">Real-time market data visualization coming soon.</p>
      </div>
    </div>
  </Layout>
);

export default LiveCharts;
