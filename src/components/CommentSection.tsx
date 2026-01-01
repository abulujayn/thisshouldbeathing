'use client';

import { useState, useEffect } from 'react';
import { VStack, Text, Input, Button, HStack, Box, Stack, IconButton, Textarea, Separator, Avatar } from '@chakra-ui/react';
import { Trash2, Send, Pencil, Check, X, MessageSquare } from 'lucide-react';
import { Comment } from '@/lib/store';
import { Tooltip } from '@/components/ui/tooltip';
import { Field } from '@/components/ui/field';
import { getRelativeTime, getFullTimestamp } from '@/lib/utils';

interface CommentSectionProps {
  ideaId: string;
  comments: Comment[];
  onCommentAdded: (newComment: Comment) => void;
  isAdmin?: boolean;
  userEmail?: string;
  onDeleteComment?: (commentId: string) => void;
  onUpdateComment?: (commentId: string, text: string) => Promise<void>;
}

export const CommentSection = ({ 
  ideaId, 
  comments, 
  onCommentAdded, 
  isAdmin, 
  userEmail,
  onDeleteComment,
  onUpdateComment
}: CommentSectionProps) => {
  const [text, setText] = useState('');
  const [authorEmail, setAuthorEmail] = useState(userEmail || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleUpdate = async (commentId: string) => {
    setIsUpdating(true);
    await onUpdateComment?.(commentId, editText);
    setIsUpdating(false);
    setEditingCommentId(null);
  };

  useEffect(() => {
    if (userEmail) {
      setAuthorEmail(userEmail);
    }
  }, [userEmail]);

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
      setIsFormOpen(false);
    }
    setIsSubmitting(false);
  };

  return (
    <VStack align="stretch" gap={8} pt={4}>
      <Separator />
      
      <VStack align="stretch" gap={6}>
        <HStack justify="space-between">
          <HStack gap={2} color="fg.muted">
            <MessageSquare size={16} />
            <Text fontSize="sm" fontWeight="bold" textTransform="uppercase" letterSpacing="wider">
              Discussion ({comments.length})
            </Text>
          </HStack>
          
          {!isFormOpen && (
            <Button 
              size="xs" 
              variant="ghost" 
              colorPalette="blue"
              onClick={() => setIsFormOpen(true)}
              fontWeight="bold"
            >
              Add Comment
            </Button>
          )}
        </HStack>

        <VStack align="stretch" gap={0}>
          {comments.map((comment, index) => {
            const isAuthor = userEmail && comment.authorEmail === userEmail;
            const canManage = isAdmin || isAuthor;
            const isEditing = editingCommentId === comment.id;

            return (
              <Box key={comment.id}>
                <HStack align="start" gap={4} py={4}>
                  <Avatar.Root size="sm">
                    <Avatar.Fallback name={comment.authorEmail} />
                  </Avatar.Root>
                  <VStack align="stretch" gap={1} flex={1}>
                    <HStack justify="space-between" align="center">
                      <HStack gap={2}>
                        <Text fontSize="sm" fontWeight="semibold">
                          {comment.authorEmail || 'Anonymous'}
                        </Text>
                        <Text fontSize="xs" color="fg.subtle">•</Text>
                        <Tooltip content={getFullTimestamp(comment.createdAt)}>
                          <Text fontSize="xs" color="fg.subtle">
                            {getRelativeTime(comment.createdAt)}
                          </Text>
                        </Tooltip>
                      </HStack>
                      
                      <HStack gap={0}>
                        {!isEditing && canManage && (
                          <IconButton 
                            size="xs" 
                            variant="ghost" 
                            aria-label="Edit comment"
                            _hover={{ bg: "bg.subtle" }}
                            onClick={() => {
                              setEditingCommentId(comment.id);
                              setEditText(comment.text);
                            }}
                          >
                            <Pencil size={12} />
                          </IconButton>
                        )}
                        {canManage && onDeleteComment && (
                          <IconButton 
                            size="xs" 
                            variant="ghost" 
                            colorPalette="red" 
                            aria-label="Delete comment"
                            _hover={{ bg: "red.50", color: "red.600" }}
                            onClick={() => onDeleteComment(comment.id)}
                          >
                            <Trash2 size={12} />
                          </IconButton>
                        )}
                      </HStack>
                    </HStack>

                    {isEditing ? (
                      <VStack align="stretch" gap={3} mt={2}>
                        <Textarea 
                          size="sm" 
                          value={editText} 
                          onChange={(e) => setEditText(e.target.value)}
                          bg="bg.panel"
                          autoFocus
                          borderRadius="lg"
                        />
                        <HStack gap={2}>
                          <Button size="xs" colorPalette="blue" onClick={() => handleUpdate(comment.id)} loading={isUpdating}>
                            <Check size={12} /> Save Changes
                          </Button>
                          <Button size="xs" variant="ghost" onClick={() => setEditingCommentId(null)}>
                            Cancel
                          </Button>
                        </HStack>
                      </VStack>
                    ) : (
                      <Text fontSize="sm" color="fg.emphasized" lineHeight="relaxed">
                        {comment.text}
                      </Text>
                    )}
                  </VStack>
                </HStack>
                {index < comments.length - 1 && <Separator variant="dashed" opacity={0.5} />}
              </Box>
            );
          })}
          {comments.length === 0 && (
            <Box py={8} textAlign="center" borderStyle="dashed" borderWidth="1px" borderRadius="xl" borderColor="border.subtle">
              <Text fontSize="sm" color="fg.subtle">No comments yet. Start the conversation!</Text>
            </Box>
          )}
        </VStack>
      </VStack>

      {/* Modern Comment Form */}
      {isFormOpen ? (
        <VStack 
          as="form" 
          align="stretch" 
          gap={4} 
          p={5} 
          bg="bg.panel" 
          borderWidth="1px"
          borderColor="border.subtle"
          borderRadius="2xl"
          shadow="sm"
          onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
        >
          <VStack align="stretch" gap={3}>
            <HStack gap={3}>
              <Avatar.Root size="xs">
                <Avatar.Fallback name={authorEmail} />
              </Avatar.Root>
              <Input 
                size="sm" 
                type="email"
                variant="flushed"
                placeholder="Your email address" 
                value={authorEmail} 
                onChange={(e) => setAuthorEmail(e.target.value)}
                required
                px={2}
              />
            </HStack>
            
            <Field>
              <Textarea 
                size="sm" 
                bg="bg.subtle"
                border="none"
                _focus={{ bg: "bg.panel", ring: "1px", ringColor: "blue.500" }}
                placeholder="Write a comment..." 
                value={text} 
                onChange={(e) => setText(e.target.value)}
                required
                rows={3}
                borderRadius="xl"
                autoFocus
              />
            </Field>
            
            <HStack justify="flex-end" gap={3}>
              <Button size="sm" variant="ghost" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button 
                size="sm" 
                colorPalette="blue" 
                loading={isSubmitting}
                onClick={handleSubmit}
                disabled={!text || !authorEmail}
                px={6}
                borderRadius="full"
                gap={2}
              >
                Post Comment
                <Send size={14} />
              </Button>
            </HStack>
          </VStack>
        </VStack>
      ) : null}
    </VStack>
  );
};