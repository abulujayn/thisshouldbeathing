'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Sparkles, TrendingUp, Clock, Shield, ShieldCheck } from 'lucide-react';
import IdeaCard from '@/components/IdeaCard';
import SubmitModal from '@/components/SubmitModal';
import LoginModal from '@/components/LoginModal';
import ConfirmModal from '@/components/ConfirmModal';

const API_BASE = '/api';

export default function Home() {
  const [ideas, setIdeas] = useState([]);
  const [votedIds, setVotedIds] = useState(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState('trending'); // trending | new
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isClient, setIsClient] = useState(false);

  // Confirm Modal State
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { }
  });

  const pollInterval = useRef(null);

  // Handle Hydration
  useEffect(() => {
    setIsClient(true);
    const savedVotes = localStorage.getItem('tsbt_votes');
    if (savedVotes) setVotedIds(new Set(JSON.parse(savedVotes)));

    const savedEmail = localStorage.getItem('tsbt_email');
    if (savedEmail) setUserEmail(savedEmail);
  }, []);

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
    if (isClient) {
      fetchIdeas();
      pollInterval.current = setInterval(fetchIdeas, 5000); // Poll every 5 seconds
      return () => clearInterval(pollInterval.current);
    }
  }, [isClient]);

  // Sync local votes to localStorage
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('tsbt_votes', JSON.stringify([...votedIds]));
    }
  }, [votedIds, isClient]);

  // Sync email to localStorage
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('tsbt_email', userEmail);
    }
  }, [userEmail, isClient]);

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

  if (!isClient) return null;

  return (
    <div className="app-container" style={{ minHeight: '100vh', paddingBottom: '6rem' }}>

      {/* Header */}
      <header style={{
        padding: '2.5rem 0',
        marginBottom: '4rem',
        background: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        borderBottom: '1px solid var(--glass-border)',
        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.3)'
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{
              background: 'var(--accent-gradient)',
              padding: '0.75rem',
              borderRadius: '14px',
              color: 'white',
              boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)'
            }}>
              <Sparkles size={28} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.8rem', margin: 0, letterSpacing: '-0.02em' }}>This Should Be A Thing</h1>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Public idea board for simple ideas that really should exist</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <button
              onClick={handleToggleAdmin}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                color: isAdmin ? '#ec4899' : 'var(--text-muted)',
                padding: '0.6rem',
                borderRadius: '8px',
                background: isAdmin ? 'rgba(236, 72, 153, 0.1)' : 'transparent',
              }}
              title={isAdmin ? "Exit Admin Mode" : "Enter Admin Mode"}
            >
              {isAdmin ? <ShieldCheck size={22} /> : <Shield size={22} />}
            </button>

            <button onClick={() => setIsModalOpen(true)} className="btn-primary">
              <Plus size={22} />
              Submit Idea
            </button>
          </div>
        </div>
      </header>

      <main className="container">
        {/* Filter Bar */}
        <div style={{
          display: 'flex',
          gap: '1.25rem',
          marginBottom: '3rem',
          background: 'rgba(255,255,255,0.03)',
          padding: '0.5rem',
          borderRadius: '16px',
          width: 'fit-content',
          border: '1px solid var(--glass-border)'
        }}>
          <button
            onClick={() => setSortBy('trending')}
            className={sortBy === 'trending' ? 'btn-secondary' : ''}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.6rem 1.25rem',
              borderRadius: '12px',
              opacity: sortBy === 'trending' ? 1 : 0.6,
              background: sortBy === 'trending' ? 'rgba(255,255,255,0.1)' : 'transparent',
              border: sortBy === 'trending' ? '1px solid var(--glass-border)' : '1px solid transparent'
            }}
          >
            <TrendingUp size={20} />
            Trending
          </button>
          <button
            onClick={() => setSortBy('new')}
            className={sortBy === 'new' ? 'btn-secondary' : ''}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.6rem 1.25rem',
              borderRadius: '12px',
              opacity: sortBy === 'new' ? 1 : 0.6,
              background: sortBy === 'new' ? 'rgba(255,255,255,0.1)' : 'transparent',
              border: sortBy === 'new' ? '1px solid var(--glass-border)' : '1px solid transparent'
            }}
          >
            <Clock size={20} />
            Newest
          </button>
        </div>

        {/* Ideas Grid/List */}
        <div style={{ display: 'grid', gap: '2rem' }}>
          {sortedIdeas.map((idea, index) => (
            <div key={idea.id} style={{ animationDelay: `${index * 0.05}s` }} className="animate-fade-in">
              <IdeaCard
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
            </div>
          ))}

          {sortedIdeas.length === 0 && (
            <div style={{ textAlign: 'center', padding: '6rem', color: 'var(--text-muted)' }}>
              <div style={{ marginBottom: '1.5rem', opacity: 0.3 }}>
                <Sparkles size={64} />
              </div>
              <p style={{ fontSize: '1.2rem' }}>No ideas yet. Be the first to start the trend!</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="btn-primary"
                style={{ marginTop: '2rem' }}
              >
                Submit the First Idea
              </button>
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
