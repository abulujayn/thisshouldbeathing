'use client';

import { toaster } from '@/components/ui/toaster';
import { Comment, Idea } from '@/lib/store';
import { Box, Center, Container, Heading, SimpleGrid, Spinner, Text, VStack, HStack } from '@chakra-ui/react';
import { Lightbulb, Clock, TrendingUp } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { IdeaCard } from './IdeaCard';
import { IdeaForm } from './IdeaForm';
import { SegmentedControl } from './ui/segmented-control';
import { useAuth } from '@/contexts/AuthContext';

interface IdeaBoardProps {
  isAdmin?: boolean;
}

export const IdeaBoard = ({ isAdmin }: IdeaBoardProps) => {
  const { user } = useAuth();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [votedIdeas, setVotedIdeas] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'newest' | 'votes'>('newest');

  const userEmail = user?.email || '';

  const fetchIdeas = async () => {
    try {
      const res = await fetch('/api/ideas');
      const data = await res.json();
      setIdeas(data);
    } catch (error) {
      console.error('Failed to fetch ideas:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortedIdeas = useMemo(() => {
    return [...ideas].sort((a, b) => {
      if (sortBy === 'votes') {
        if (b.votes !== a.votes) {
          return b.votes - a.votes;
        }
        return b.createdAt - a.createdAt;
      }
      return b.createdAt - a.createdAt;
    });
  }, [ideas, sortBy]);

  useEffect(() => {
    fetchIdeas();
    const storedVotes = localStorage.getItem('votedIdeas');
    if (storedVotes) {
      setVotedIdeas(new Set(JSON.parse(storedVotes)));
    }
  }, []);

  const handleVote = async (id: string, action: 'vote' | 'unvote') => {
    const res = await fetch(`/api/ideas/${id}/vote`, { 
      method: 'POST',
      body: JSON.stringify({ action }),
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      const updatedIdea = await res.json();
      setIdeas(ideas.map(i => i.id === id ? { ...i, votes: updatedIdea.votes } : i));
      
      const newVotedIdeas = new Set(votedIdeas);
      if (action === 'vote') {
        newVotedIdeas.add(id);
      } else {
        newVotedIdeas.delete(id);
      }
      setVotedIdeas(newVotedIdeas);
      localStorage.setItem('votedIdeas', JSON.stringify(Array.from(newVotedIdeas)));
    }
  };

  const handleCommentAdded = (ideaId: string, comment: Comment) => {
    setIdeas(ideas.map(i => 
      i.id === ideaId ? { ...i, comments: [...i.comments, comment] } : i
    ));
    toaster.create({
      title: "Comment posted",
      type: "success",
    });
  };

  const handleDeleteIdea = async (id: string) => {
    if (!confirm('Are you sure you want to delete this idea?')) return;
    const res = await fetch(`/api/ideas/${id}`, { 
      method: 'DELETE',
      body: JSON.stringify({ authorEmail: userEmail }),
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      setIdeas(ideas.filter(i => i.id !== id));
      toaster.create({ title: "Idea deleted", type: "success" });
    }
  };

  const handleResetVotes = async (id: string) => {
    const res = await fetch(`/api/ideas/${id}/reset-votes`, { method: 'POST' });
    if (res.ok) {
      const updatedIdea = await res.json();
      setIdeas(ideas.map(i => i.id === id ? { ...i, votes: updatedIdea.votes } : i));
      toaster.create({ title: "Votes reset", type: "success" });
    }
  };

  const handleDeleteComment = async (ideaId: string, commentId: string) => {
    const res = await fetch(`/api/ideas/${ideaId}/comment/${commentId}`, { 
      method: 'DELETE',
      body: JSON.stringify({ authorEmail: userEmail }),
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      setIdeas(ideas.map(i => 
        i.id === ideaId ? { ...i, comments: i.comments.filter(c => c.id !== commentId) } : i
      ));
      toaster.create({ title: "Comment deleted", type: "success" });
    }
  };

  const handleSubmit = async (title: string, description: string, authorEmail: string) => {
    const res = await fetch('/api/ideas', {
      method: 'POST',
      body: JSON.stringify({ title, description, authorEmail }),
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      const newIdea = await res.json();
      setIdeas([newIdea, ...ideas]);
      toaster.create({
        title: "Idea submitted!",
        description: "Your idea has been shared with everyone.",
        type: "success",
      });
    }
  };

  const handleUpdateIdea = async (id: string, title: string, description: string) => {
    const res = await fetch(`/api/ideas/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ title, description, authorEmail: userEmail }),
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      const updatedIdea = await res.json();
      setIdeas(ideas.map(i => i.id === id ? { ...i, ...updatedIdea } : i));
      toaster.create({ title: "Idea updated", type: "success" });
    }
  };

  const handleUpdateComment = async (ideaId: string, commentId: string, text: string) => {
    const res = await fetch(`/api/ideas/${ideaId}/comment/${commentId}`, {
      method: 'PATCH',
      body: JSON.stringify({ text, authorEmail: userEmail }),
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      const updatedComment = await res.json();
      setIdeas(ideas.map(i => 
        i.id === ideaId ? { 
          ...i, 
          comments: i.comments.map(c => c.id === commentId ? updatedComment : c) 
        } : i
      ));
      toaster.create({ title: "Comment updated", type: "success" });
    }
  };

  if (loading) {
    return (
      <Center minH="50vh">
        <VStack gap={4}>
          <Spinner size="xl" color="blue.500" />
          <Text color="fg.muted" fontWeight="medium">Loading ideas...</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Container maxW="3xl" py={16}>
      <VStack gap={16} align="stretch">
        <VStack gap={6} align="center">
          <Box p={3} bg="blue.50" borderRadius="2xl" color="blue.600">
            <Lightbulb size={40} />
          </Box>
          <VStack gap={2}>
            <Heading size="4xl" textAlign="center" letterSpacing="tight">This should be a thing</Heading>
            <Text fontSize="xl" color="fg.muted" textAlign="center" maxW="md">
              Share and colloborate on simple ideas which really should exist already.
            </Text>
          </VStack>
          <IdeaForm onSubmit={handleSubmit} />
        </VStack>

        <VStack align="stretch" gap={8}>
          <HStack justify="space-between" align="center">
            <Text fontWeight="bold" fontSize="lg">Ideas</Text>
            <SegmentedControl
              value={sortBy}
              onValueChange={(e) => setSortBy(e.value as 'newest' | 'votes')}
              items={[
                { 
                  value: 'newest', 
                  label: (
                    <HStack gap={2}>
                      <Clock size={14} />
                      <Text>Newest</Text>
                    </HStack>
                  ) 
                },
                { 
                  value: 'votes', 
                  label: (
                    <HStack gap={2}>
                      <TrendingUp size={14} />
                      <Text>Most Upvoted</Text>
                    </HStack>
                  ) 
                },
              ]}
            />
          </HStack>

          <SimpleGrid columns={1} gap={8}>
            {sortedIdeas.map((idea) => (
              <IdeaCard 
                key={idea.id} 
                idea={idea} 
                hasVoted={votedIdeas.has(idea.id)}
                onVote={handleVote} 
                onCommentAdded={handleCommentAdded}
                isAdmin={isAdmin}
                userEmail={userEmail}
                onDelete={handleDeleteIdea}
                onResetVotes={handleResetVotes}
                onDeleteComment={handleDeleteComment}
                onUpdateIdea={handleUpdateIdea}
                onUpdateComment={handleUpdateComment}
              />
            ))}
          </SimpleGrid>

          {ideas.length === 0 && (
            <Center py={20} flexDirection="column" gap={4}>
              <Box color="gray.300">
                <Lightbulb size={64} />
              </Box>
              <Text color="fg.muted" fontSize="lg">No ideas yet. Be the first to share one!</Text>
            </Center>
          )}
        </VStack>
      </VStack>
    </Container>
  );
};