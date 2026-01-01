
'use client';

import { useState } from 'react';
import { VStack, Text, Input, Button, HStack, Box, Stack, IconButton } from '@chakra-ui/react';
import { Trash2, Send } from 'lucide-react';
import { Comment } from '@/lib/store';
import { Tooltip } from '@/components/ui/tooltip';
import { Field } from '@/components/ui/field';
import { getRelativeTime, getFullTimestamp } from '@/lib/utils';

interface CommentSectionProps {
  ideaId: string;
  comments: Comment[];
  onCommentAdded: (newComment: Comment) => void;
  isAdmin?: boolean;
  onDeleteComment?: (commentId: string) => void;
}

export const CommentSection = ({ 
  ideaId, 
  comments, 
  onCommentAdded, 
  isAdmin, 
  onDeleteComment 
}: CommentSectionProps) => {
  const [text, setText] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!text || !authorEmail) return;
    setIsSubmitting(true);
    const res = await fetch(`/api/ideas/${ideaId}/comment`, {
      method: 'POST',
      body: JSON.stringify({ text, authorEmail }),
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      const newComment = await res.json();
      onCommentAdded(newComment);
      setText('');
      // Keep author email for convenience
    }
    setIsSubmitting(false);
  };

  return (
    <VStack align="stretch" gap={6} pt={2}>
      <VStack align="stretch" gap={4}>
        {comments.map((comment) => (
          <Box key={comment.id} flex={1}>
            <Box bg="bg.muted" p={3} borderRadius="lg" position="relative">
              <HStack justify="space-between" align="baseline" mb={1}>
                <Text fontSize="xs" fontWeight="bold">
                  {comment.authorEmail || 'Anonymous'}
                </Text>
                <HStack gap={2}>
                  <Tooltip content={getFullTimestamp(comment.createdAt)}>
                    <Text fontSize="2xs" color="fg.subtle">
                      {getRelativeTime(comment.createdAt)}
                    </Text>
                  </Tooltip>
                  {isAdmin && onDeleteComment && (
                    <IconButton 
                      size="2xs" 
                      variant="ghost" 
                      colorPalette="red" 
                      aria-label="Delete comment"
                      onClick={() => onDeleteComment(comment.id)}
                    >
                      <Trash2 size={12} />
                    </IconButton>
                  )}
                </HStack>
              </HStack>
              <Text fontSize="sm" color="fg.emphasized">{comment.text}</Text>
            </Box>
          </Box>
        ))}
        {comments.length === 0 && (
          <Box py={2} textAlign="center">
            <Text fontSize="sm" color="fg.subtle" fontStyle="italic">No comments yet. Be the first to share your thoughts!</Text>
          </Box>
        )}
      </VStack>

      <VStack 
        as="form" 
        align="stretch" 
        gap={3} 
        p={4} 
        bg="bg.subtle" 
        borderRadius="xl"
        onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
      >
        <Text fontSize="xs" fontWeight="bold" color="fg.muted" textTransform="uppercase" letterSpacing="wider">
          Add a comment
        </Text>
        <Stack direction={{ base: "column", md: "row" }} gap={3}>
          <Field flex={1}>
            <Input 
              size="sm" 
              type="email"
              bg="bg.panel"
              placeholder="Your email" 
              value={authorEmail} 
              onChange={(e) => setAuthorEmail(e.target.value)}
              required
            />
          </Field>
          <Field flex={2}>
            <HStack gap={2} width="full">
              <Input 
                size="sm" 
                bg="bg.panel"
                placeholder="What's on your mind?" 
                value={text} 
                onChange={(e) => setText(e.target.value)}
                required
              />
              <Button 
                size="sm" 
                colorPalette="blue" 
                loading={isSubmitting}
                onClick={handleSubmit}
                disabled={!text || !authorEmail}
                px={4}
              >
                <Send size={14} />
              </Button>
            </HStack>
          </Field>
        </Stack>
      </VStack>
    </VStack>
  );
};
