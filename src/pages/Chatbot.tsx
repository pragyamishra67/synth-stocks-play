import { Layout } from '@/components/Layout';
import { Bot } from 'lucide-react';

const Chatbot = () => (
  <Layout>
    <div className="max-w-3xl mx-auto flex flex-col items-center justify-center min-h-[50vh]">
      <div className="card-cyber text-center">
        <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse-glow" />
        <h2 className="font-display text-xl tracking-wider text-primary mb-2">AI Chatbot</h2>
        <p className="font-mono text-xs text-muted-foreground">Your AI trading assistant is under development.</p>
      </div>
    </div>
  </Layout>
);

export default Chatbot;
