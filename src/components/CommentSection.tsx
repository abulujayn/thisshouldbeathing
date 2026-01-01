
'use client';

import { useState } from 'react';
import { VStack, Text, Input, Button, HStack, Box, Separator } from '@chakra-ui/react';
import { Comment } from '@/lib/store';
import { Tooltip } from '@/components/ui/tooltip';
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!text) return;
    setIsSubmitting(true);
    const res = await fetch(`/api/ideas/${ideaId}/comment`, {
      method: 'POST',
      body: JSON.stringify({ text }),
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      const newComment = await res.json();
      onCommentAdded(newComment);
      setText('');
    }
    setIsSubmitting(false);
  };

  return (
    <VStack align="stretch" gap={4} pt={4}>
      <Separator />
      <Text fontWeight="medium" fontSize="sm">Comments</Text>
      <VStack align="stretch" gap={2}>
        {comments.map((comment) => (
          <Box key={comment.id} p={2} bg="bg.muted" borderRadius="md">
            <HStack justify="space-between" align="start">
              <VStack align="start" gap={0} flex={1}>
                <Text fontSize="sm">{comment.text}</Text>
                <Tooltip content={getFullTimestamp(comment.createdAt)}>
                  <Text fontSize="xs" color="fg.subtle" cursor="help" width="fit-content">
                    {getRelativeTime(comment.createdAt)}
                  </Text>
                </Tooltip>
              </VStack>
              {isAdmin && onDeleteComment && (
                <Button 
                  size="xs" 
                  variant="ghost" 
                  colorPalette="red" 
                  onClick={() => onDeleteComment(comment.id)}
                >
                  Delete
                </Button>
              )}
            </HStack>
          </Box>
        ))}
        {comments.length === 0 && (
          <Text fontSize="sm" color="fg.muted">No comments yet.</Text>
        )}
      </VStack>
      <HStack>
        <Input 
          size="sm" 
          placeholder="Add a comment..." 
          value={text} 
          onChange={(e) => setText(e.target.value)}
        />
        <Button 
          size="sm" 
          colorPalette="blue" 
          loading={isSubmitting}
          onClick={handleSubmit}
        >
          Post
        </Button>
      </HStack>
    </VStack>
  );
};
