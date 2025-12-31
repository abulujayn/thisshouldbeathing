import React, { useState, useEffect, useRef } from 'react';
import { Plus, Sparkles, TrendingUp, Clock, Shield, ShieldCheck } from 'lucide-react';
import IdeaCard from './components/IdeaCard';
import SubmitModal from './components/SubmitModal';
import LoginModal from './components/LoginModal';
import ConfirmModal from './components/ConfirmModal';
import './App.css';

const API_BASE = 'http://localhost:3001/api';

function App() {
  const [ideas, setIdeas] = useState([]);
  const [votedIds, setVotedIds] = useState(() => {
    const saved = localStorage.getItem('tsbt_votes');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState('trending'); // trending | new
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('tsbt_email') || '');

  useEffect(() => {
    localStorage.setItem('tsbt_email', userEmail);
  }, [userEmail]);

  // Confirm Modal State
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { }
  });

  const pollInterval = useRef(null);

  const fetchIdeas = async () => {
    try {
      const resp = await fetch(`${API_BASE}/ideas`);
      const data = await resp.json();
      setIdeas(data);
    } catch (err) {
      console.error('Failed to fetch ideas:', err);
    }
  };

  // Initial Load & Polling
  useEffect(() => {
    fetchIdeas();
    pollInterval.current = setInterval(fetchIdeas, 5000); // Poll every 5 seconds
    return () => clearInterval(pollInterval.current);
  }, []);

  // Sync local votes to localStorage (only local state)
  useEffect(() => {
    localStorage.setItem('tsbt_votes', JSON.stringify([...votedIds]));
  }, [votedIds]);

  const handleToggleAdmin = () => {
    if (isAdmin) {
      setIsAdmin(false);
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const handleAdminLogin = () => {
    setIsAdmin(true);
  };

  const handleVote = async (id) => {
    const direction = votedIds.has(id) ? -1 : 1;

    // Optimistic Update
    setIdeas(prev => prev.map(idea =>
      idea.id === id ? { ...idea, votes: Math.max(0, idea.votes + direction) } : idea
    ));

    const nextVotes = new Set(votedIds);
    if (direction === 1) nextVotes.add(id);
    else nextVotes.delete(id);
    setVotedIds(nextVotes);

    try {
      await fetch(`${API_BASE}/ideas/${id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction })
      });
      fetchIdeas(); // Refetch to confirm
    } catch (err) {
      console.error('Vote failed:', err);
      // Rollback? Usually omitted for simplicity in basic apps
    }
  };

  const handleComment = async (ideaId, text, author) => {
    try {
      await fetch(`${API_BASE}/ideas/${ideaId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, author })
      });
      fetchIdeas();
    } catch (err) {
      console.error('Comment failed:', err);
    }
  };

  const handleSubmitIdea = async ({ title, description, author }) => {
    try {
      const resp = await fetch(`${API_BASE}/ideas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, author })
      });
      const newIdea = await resp.json();

      // Auto-vote for own idea
      const nextVotes = new Set(votedIds);
      nextVotes.add(newIdea.id);
      setVotedIds(nextVotes);

      fetchIdeas();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Submit failed:', err);
    }
  };

  // Admin Actions
  const requestDeleteIdea = (id) => {
    setConfirmState({
      isOpen: true,
      title: 'Delete Idea',
      message: 'Are you sure you want to delete this idea? This action cannot be undone.',
      onConfirm: async () => {
        try {
          await fetch(`${API_BASE}/ideas/${id}`, { method: 'DELETE' });
          fetchIdeas();
        } catch (err) {
          console.error('Delete failed:', err);
        }
      }
    });
  };

  const requestDeleteComment = (ideaId, commentId) => {
    setConfirmState({
      isOpen: true,
      title: 'Delete Comment',
      message: 'Are you sure you want to delete this comment?',
      onConfirm: async () => {
        try {
          await fetch(`${API_BASE}/ideas/${ideaId}/comments/${commentId}`, { method: 'DELETE' });
          fetchIdeas();
        } catch (err) {
          console.error('Delete comment failed:', err);
        }
      }
    });
  };

  const requestResetVotes = (id) => {
    setConfirmState({
      isOpen: true,
      title: 'Reset Votes',
      message: 'This will set the vote count for this idea back to zero. Proceed?',
      onConfirm: async () => {
        try {
          await fetch(`${API_BASE}/ideas/${id}/reset-votes`, { method: 'POST' });
          fetchIdeas();
        } catch (err) {
          console.error('Reset votes failed:', err);
        }
      }
    });
  };

  const sortedIdeas = [...ideas].sort((a, b) => {
    if (sortBy === 'trending') return b.votes - a.votes;
    return b.timestamp - a.timestamp;
  });

  return (
    <div className="app-container" style={{ minHeight: '100vh', paddingBottom: '4rem' }}>

      {/* Header */}
      <header style={{
        padding: '2rem 0',
        marginBottom: '2rem',
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        borderBottom: '1px solid var(--glass-border)'
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'var(--accent-gradient)', padding: '0.5rem', borderRadius: '8px', color: 'white' }}>
              <Sparkles size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', margin: 0 }}>This Should Be A Thing</h1>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Public idea board for simple ideas that really should exist</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button
              onClick={handleToggleAdmin}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: isAdmin ? '#ec4899' : 'var(--text-muted)',
                padding: '0.5rem',
                transition: 'color 0.2s'
              }}
              title={isAdmin ? "Exit Admin Mode" : "Enter Admin Mode"}
            >
              {isAdmin ? <ShieldCheck size={20} /> : <Shield size={20} />}
            </button>

            <button onClick={() => setIsModalOpen(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={20} />
              Submit Idea
            </button>
          </div>
        </div>
      </header>

      <main className="container">
        {/* Filter Bar */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <button
            onClick={() => setSortBy('trending')}
            className={sortBy === 'trending' ? 'btn-secondary' : ''}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              opacity: sortBy === 'trending' ? 1 : 0.6,
              background: sortBy === 'trending' ? 'rgba(255,255,255,0.1)' : 'transparent'
            }}
          >
            <TrendingUp size={18} />
            Trending
          </button>
          <button
            onClick={() => setSortBy('new')}
            className={sortBy === 'new' ? 'btn-secondary' : ''}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              opacity: sortBy === 'new' ? 1 : 0.6,
              background: sortBy === 'new' ? 'rgba(255,255,255,0.1)' : 'transparent'
            }}
          >
            <Clock size={18} />
            Newest
          </button>
        </div>

        {/* Ideas Grid/List */}
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {sortedIdeas.map(idea => (
            <IdeaCard
              key={idea.id}
              idea={{ ...idea, userVoted: votedIds.has(idea.id) }}
              onVote={handleVote}
              onComment={handleComment}
              isAdmin={isAdmin}
              onDelete={requestDeleteIdea}
              onDeleteComment={requestDeleteComment}
              onResetVotes={requestResetVotes}
              userEmail={userEmail}
              onEmailChange={setUserEmail}
            />
          ))}

          {sortedIdeas.length === 0 && (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
              No ideas yet. Why not submit the first one?
            </div>
          )}
        </div>
      </main>

      <SubmitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitIdea}
        userEmail={userEmail}
        onEmailChange={setUserEmail}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleAdminLogin}
      />

      <ConfirmModal
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

export default App;
