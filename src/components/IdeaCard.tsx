
'use client';

import { Box, Button, Heading, HStack, Text, VStack, IconButton, Badge } from '@chakra-ui/react';
import { ThumbsUp, MessageSquare, MoreVertical, Trash2, RotateCcw, Pencil, Check, X } from 'lucide-react';
import { Idea, Comment } from '@/lib/store';
import { useState } from 'react';
import { CommentSection } from './CommentSection';
import { Tooltip } from '@/components/ui/tooltip';
import { MenuRoot, MenuTrigger, MenuContent, MenuItem } from '@/components/ui/menu';
import { getRelativeTime, getFullTimestamp } from '@/lib/utils';
import { Input, Textarea } from '@chakra-ui/react';

interface IdeaCardProps {
  idea: Idea;
  hasVoted: boolean;
  onVote: (id: string, action: 'vote' | 'unvote') => void;
  onCommentAdded: (ideaId: string, comment: Comment) => void;
  isAdmin?: boolean;
  userEmail?: string;
  onDelete?: (id: string) => void;
  onResetVotes?: (id: string) => void;
  onDeleteComment?: (ideaId: string, commentId: string) => void;
  onUpdateIdea?: (id: string, title: string, description: string) => Promise<void>;
  onUpdateComment?: (ideaId: string, commentId: string, text: string) => Promise<void>;
}

export const IdeaCard = ({ 
  idea, 
  hasVoted, 
  onVote, 
  onCommentAdded,
  isAdmin,
  userEmail,
  onDelete,
  onResetVotes,
  onDeleteComment,
  onUpdateIdea,
  onUpdateComment
}: IdeaCardProps) => {
  const [isVoting, setIsVoting] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(idea.title);
  const [editDescription, setEditDescription] = useState(idea.description);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleVote = async () => {
    setIsVoting(true);
    await onVote(idea.id, hasVoted ? 'unvote' : 'vote');
    setIsVoting(false);
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    await onUpdateIdea?.(idea.id, editTitle, editDescription);
    setIsUpdating(false);
    setIsEditing(false);
  };

  const isAuthor = userEmail && idea.authorEmail === userEmail;
  const canManage = isAdmin || isAuthor;

  return (
    <Box 
      p={6} 
      borderWidth="1px" 
      borderRadius="xl" 
      bg="bg.panel" 
      shadow="sm"
      transition="all 0.2s"
      _hover={{ shadow: "md", borderColor: "blue.200" }}
      position="relative"
    >
      <HStack align="start" gap={6}>
        {/* Voting Section (Left) */}
        <VStack gap={1} align="center" pt={1}>
          <IconButton
            aria-label={hasVoted ? "Undo upvote" : "Upvote"}
            variant={hasVoted ? "solid" : "outline"}
            colorPalette="blue"
            onClick={handleVote}
            loading={isVoting}
            rounded="full"
            size="sm"
          >
            <ThumbsUp size={16} />
          </IconButton>
          <Text fontSize="sm" fontWeight="bold" color={hasVoted ? "blue.600" : "fg.muted"}>
            {idea.votes}
          </Text>
        </VStack>

        {/* Main Content (Right) */}
        <VStack align="stretch" gap={4} flex={1}>
          <HStack justify="space-between" align="start">
            <VStack align="start" gap={2} flex={1}>
              {isEditing ? (
                <VStack align="stretch" gap={3} width="full">
                  <Input 
                    value={editTitle} 
                    onChange={(e) => setEditTitle(e.target.value)} 
                    size="sm"
                    bg="bg.subtle"
                    fontWeight="bold"
                  />
                  <Textarea 
                    value={editDescription} 
                    onChange={(e) => setEditDescription(e.target.value)} 
                    size="sm"
                    bg="bg.subtle"
                    rows={3}
                  />
                  <HStack gap={2}>
                    <Button size="xs" colorPalette="blue" onClick={handleUpdate} loading={isUpdating}>
                      <Check size={14} /> Save
                    </Button>
                    <Button size="xs" variant="ghost" onClick={() => {
                      setIsEditing(false);
                      setEditTitle(idea.title);
                      setEditDescription(idea.description);
                    }}>
                      <X size={14} /> Cancel
                    </Button>
                  </HStack>
                </VStack>
              ) : (
                <>
                  <Heading size="md" lineHeight="tight">{idea.title}</Heading>
                  <Text color="fg.muted" fontSize="md" lineHeight="relaxed">
                    {idea.description}
                  </Text>
                </>
              )}
            </VStack>
            
            {canManage && (
              <MenuRoot>
                <MenuTrigger asChild>
                  <IconButton variant="ghost" size="sm" aria-label="Actions" mt={-1}>
                    <MoreVertical size={18} />
                  </IconButton>
                </MenuTrigger>
                <MenuContent>
                  <MenuItem 
                    value="edit" 
                    onClick={() => setIsEditing(true)}
                  >
                    <Pencil size={14} />
                    <Text ms={2}>Edit</Text>
                  </MenuItem>
                  {isAdmin && (
                    <MenuItem 
                      value="reset" 
                      onClick={() => onResetVotes?.(idea.id)}
                      color="orange.500"
                    >
                      <RotateCcw size={14} />
                      <Text ms={2}>Reset Votes ({idea.votes})</Text>
                    </MenuItem>
                  )}
                  <MenuItem 
                    value="delete" 
                    onClick={() => onDelete?.(idea.id)}
                    color="red.500"
                  >
                    <Trash2 size={14} />
                    <Text ms={2}>Delete</Text>
                  </MenuItem>
                </MenuContent>
              </MenuRoot>
            )}
          </HStack>

          <VStack align="start" gap={1} mt={2}>
            <HStack gap={2}>
              <Text fontSize="xs" fontWeight="medium" color="fg.subtle">
                Posted by {idea.authorEmail || 'Anonymous'}
              </Text>
              <Text fontSize="xs" color="fg.subtle">•</Text>
              <Tooltip content={getFullTimestamp(idea.createdAt)}>
                <Text fontSize="xs" color="fg.subtle">
                  {getRelativeTime(idea.createdAt)}
                </Text>
              </Tooltip>
            </HStack>
            
            <HStack gap={4}>
              <Button 
                variant="ghost" 
                size="sm" 
                gap={2} 
                color="blue.600"
                onClick={() => setShowComments(!showComments)}
                px={0}
                _hover={{ bg: "transparent", textDecoration: "underline" }}
              >
                <MessageSquare size={16} />
                <Text fontSize="sm" fontWeight="medium">
                  {idea.comments.length} {idea.comments.length === 1 ? 'comment' : 'comments'}
                </Text>
              </Button>
              
              {idea.votes > 10 && (
                <Badge colorPalette="orange" variant="subtle" size="sm" rounded="full">
                  Trending
                </Badge>
              )}
            </HStack>
          </VStack>

          {showComments && (
            <Box pt={2}>
              <CommentSection 
                ideaId={idea.id} 
                comments={idea.comments} 
                onCommentAdded={(c) => onCommentAdded(idea.id, c)}
                isAdmin={isAdmin}
                userEmail={userEmail}
                onDeleteComment={(commentId) => onDeleteComment?.(idea.id, commentId)}
                onUpdateComment={onUpdateComment ? (commentId, text) => onUpdateComment(idea.id, commentId, text) : undefined}
              />
            </Box>
          )}
        </VStack>
      </HStack>
    </Box>
  );
};
