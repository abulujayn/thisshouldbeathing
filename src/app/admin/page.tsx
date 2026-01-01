
'use client';

import { useEffect, useState } from 'react';
import { Container, Heading, VStack, SimpleGrid, Text, Spinner, Center, Box, Button } from '@chakra-ui/react';
import { Idea } from '@/lib/store';
import { IdeaCard } from '@/components/IdeaCard';
import { Header } from '@/components/Header';
import { toaster, Toaster } from '@/components/ui/toaster';
import { AdminAuth } from '@/components/AdminAuth';

export default function AdminPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
    if (isAuthenticated) {
      fetchIdeas();
    }
  }, [isAuthenticated]);

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

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.href = '/';
  };

  if (!isAuthenticated) {
    return (
      <>
        <Toaster />
        <AdminAuth onAuthenticated={() => setIsAuthenticated(true)} />
      </>
    );
  }

  if (loading) {
    return (
      <Center minH="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Box minH="100vh" bg="bg.canvas">
      <Header />
      <Container maxW="4xl" py={12}>
        <Toaster />
        <VStack gap={8} align="stretch">
          <VStack gap={2} align="start" w="full">
            <Box display="flex" justifyContent="space-between" alignItems="center" w="full">
              <Heading size="2xl">Admin Interface</Heading>
              <Button variant="outline" onClick={handleLogout}>Logout</Button>
            </Box>
            <Text color="fg.muted">Manage ideas, comments, and upvotes.</Text>
          </VStack>

          <SimpleGrid columns={1} gap={6}>
            {ideas.map((idea) => (
              <IdeaCard 
                key={idea.id} 
                idea={idea} 
                hasVoted={false}
                onVote={() => {}} 
                onCommentAdded={(ideaId, comment) => {
                  setIdeas(ideas.map(i => i.id === ideaId ? { ...i, comments: [...i.comments, comment] } : i));
                }}
                isAdmin={true}
                onDelete={handleDeleteIdea}
                onResetVotes={handleResetVotes}
                onDeleteComment={handleDeleteComment}
              />
            ))}
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
}
