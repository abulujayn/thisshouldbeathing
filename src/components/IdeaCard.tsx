
'use client';

import { Box, Button, Heading, HStack, Text, VStack, IconButton, Badge } from '@chakra-ui/react';
import { ThumbsUp, MessageSquare, MoreVertical, Trash2, RotateCcw } from 'lucide-react';
import { Idea, Comment } from '@/lib/store';
import { useState } from 'react';
import { CommentSection } from './CommentSection';
import { Tooltip } from '@/components/ui/tooltip';
import { MenuRoot, MenuTrigger, MenuContent, MenuItem } from '@/components/ui/menu';
import { getRelativeTime, getFullTimestamp } from '@/lib/utils';

interface IdeaCardProps {
  idea: Idea;
  hasVoted: boolean;
  onVote: (id: string, action: 'vote' | 'unvote') => void;
  onCommentAdded: (ideaId: string, comment: Comment) => void;
  isAdmin?: boolean;
  onDelete?: (id: string) => void;
  onResetVotes?: (id: string) => void;
  onDeleteComment?: (ideaId: string, commentId: string) => void;
}

export const IdeaCard = ({ 
  idea, 
  hasVoted, 
  onVote, 
  onCommentAdded,
  isAdmin,
  onDelete,
  onResetVotes,
  onDeleteComment
}: IdeaCardProps) => {
  const [isVoting, setIsVoting] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const handleVote = async () => {
    setIsVoting(true);
    await onVote(idea.id, hasVoted ? 'unvote' : 'vote');
    setIsVoting(false);
  };

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
              <Heading size="md" lineHeight="tight">{idea.title}</Heading>
              <Text color="fg.muted" fontSize="md" lineHeight="relaxed">
                {idea.description}
              </Text>
            </VStack>
            
            {isAdmin && (
              <MenuRoot>
                <MenuTrigger asChild>
                  <IconButton variant="ghost" size="sm" aria-label="Admin actions" mt={-1}>
                    <MoreVertical size={18} />
                  </IconButton>
                </MenuTrigger>
                <MenuContent>
                  <MenuItem 
                    value="reset" 
                    onClick={() => onResetVotes?.(idea.id)}
                    color="orange.500"
                  >
                    <RotateCcw size={14} />
                    <Text ms={2}>Reset Votes ({idea.votes})</Text>
                  </MenuItem>
                  <MenuItem 
                    value="delete" 
                    onClick={() => onDelete?.(idea.id)}
                    color="red.500"
                  >
                    <Trash2 size={14} />
                    <Text ms={2}>Delete Idea</Text>
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
                onDeleteComment={(commentId) => onDeleteComment?.(idea.id, commentId)}
              />
            </Box>
          )}
        </VStack>
      </HStack>
    </Box>
  );
};
