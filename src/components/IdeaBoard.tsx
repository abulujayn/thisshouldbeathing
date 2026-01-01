
'use client';

import { useEffect, useState } from 'react';
import { Container, Heading, HStack, VStack, SimpleGrid, Box, Text, Spinner, Center, Separator } from '@chakra-ui/react';
import { Lightbulb } from 'lucide-react';
import { Idea, Comment } from '@/lib/store';
import { IdeaCard } from './IdeaCard';
import { IdeaForm } from './IdeaForm';
import { toaster, Toaster } from '@/components/ui/toaster';

interface IdeaBoardProps {
  isAdmin?: boolean;
}

export const IdeaBoard = ({ isAdmin }: IdeaBoardProps) => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [votedIdeas, setVotedIdeas] = useState<Set<string>>(new Set());

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
    const res = await fetch(`/api/ideas/${id}`, { method: 'DELETE' });
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
    const res = await fetch(`/api/ideas/${ideaId}/comment/${commentId}`, { method: 'DELETE' });
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
              Collaborate and upvote the best ideas for things that should exist.
            </Text>
          </VStack>
          <IdeaForm onSubmit={handleSubmit} />
        </VStack>

        <VStack align="stretch" gap={8}>
          <SimpleGrid columns={1} gap={8}>
            {ideas.map((idea) => (
              <IdeaCard 
                key={idea.id} 
                idea={idea} 
                hasVoted={votedIdeas.has(idea.id)}
                onVote={handleVote} 
                onCommentAdded={handleCommentAdded}
                isAdmin={isAdmin}
                onDelete={handleDeleteIdea}
                onResetVotes={handleResetVotes}
                onDeleteComment={handleDeleteComment}
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
