import { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Layout } from '@/components/Layout';
import { motion } from 'framer-motion';

const Discussion = () => {
  const { user, forumPosts, addForumPost, addReply } = useUser();
  const [newPost, setNewPost] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  if (!user) return null;

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    addForumPost(newPost.trim());
    setNewPost('');
  };

  const handleReply = (postId: string) => {
    if (!replyText.trim()) return;
    addReply(postId, replyText.trim());
    setReplyText('');
    setReplyTo(null);
  };

  const timeAgo = (ts: number) => {
    const mins = Math.floor((Date.now() - ts) / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
    return `${Math.floor(mins / 1440)}d ago`;
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <h2 className="font-display text-2xl tracking-wider text-primary text-glow-cyan">Discussion</h2>

        <form onSubmit={handlePost} className="card-cyber">
          <textarea value={newPost} onChange={e => setNewPost(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full bg-muted border border-border rounded px-3 py-2 font-mono text-sm text-foreground focus:outline-none focus:border-primary resize-none h-20"
          />
          <button type="submit" className="btn-cyber-primary text-xs mt-2">Post</button>
        </form>

        <div className="space-y-3">
          {forumPosts.length === 0 && (
            <p className="font-mono text-xs text-muted-foreground text-center py-8">No posts yet. Start the discussion!</p>
          )}
          {forumPosts.map((post, i) => (
            <motion.div key={post.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              className="card-cyber"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-mono text-xs text-primary">{post.author}</span>
                <span className="font-mono text-xs text-muted-foreground">{timeAgo(post.timestamp)}</span>
              </div>
              <p className="text-sm text-foreground">{post.content}</p>

              {post.replies.length > 0 && (
                <div className="mt-3 ml-4 space-y-2 border-l border-border pl-3">
                  {post.replies.map((r, ri) => (
                    <div key={ri}>
                      <span className="font-mono text-xs text-secondary">{r.author}</span>
                      <span className="font-mono text-xs text-muted-foreground ml-2">{timeAgo(r.timestamp)}</span>
                      <p className="text-xs text-foreground mt-0.5">{r.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {replyTo === post.id ? (
                <div className="mt-3 flex gap-2">
                  <input value={replyText} onChange={e => setReplyText(e.target.value)}
                    className="flex-1 bg-muted border border-border rounded px-3 py-1.5 font-mono text-xs text-foreground focus:outline-none focus:border-primary"
                    placeholder="Reply..."
                    onKeyDown={e => e.key === 'Enter' && handleReply(post.id)}
                  />
                  <button onClick={() => handleReply(post.id)} className="btn-cyber-primary text-xs py-1.5">Send</button>
                  <button onClick={() => setReplyTo(null)} className="font-mono text-xs text-muted-foreground">Cancel</button>
                </div>
              ) : (
                <button onClick={() => setReplyTo(post.id)} className="font-mono text-xs text-muted-foreground hover:text-primary mt-2">
                  Reply
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Discussion;
