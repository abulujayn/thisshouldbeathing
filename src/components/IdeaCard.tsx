
'use client';

import { Box, Button, Heading, HStack, Text, VStack, IconButton } from '@chakra-ui/react';
import { ThumbsUp, MessageSquare } from 'lucide-react';
import { Idea, Comment } from '@/lib/store';
import { useState } from 'react';
import { CommentSection } from './CommentSection';
import { Tooltip } from '@/components/ui/tooltip';
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
      borderRadius="lg" 
      bg="bg.panel" 
      shadow="sm"
      transition="all 0.2s"
      _hover={{ shadow: "md" }}
    >
      <VStack align="stretch" gap={4}>
        <HStack justify="space-between" align="flex-start">
          <VStack align="start" gap={1} flex={1}>
            <Heading size="md">{idea.title}</Heading>
            <Text color="fg.muted">{idea.description}</Text>
          </VStack>
          <VStack gap={1} align="center">
            {!isAdmin && (
              <>
                <IconButton
                  aria-label={hasVoted ? "Undo upvote" : "Upvote"}
                  variant={hasVoted ? "solid" : "ghost"}
                  colorPalette="blue"
                  onClick={handleVote}
                  loading={isVoting}
                >
                  <ThumbsUp />
                </IconButton>
                <Text fontWeight="bold" color={hasVoted ? "blue.500" : "inherit"}>{idea.votes}</Text>
              </>
            )}
            {isAdmin && (
              <VStack gap={2}>
                <Button size="xs" colorPalette="orange" onClick={() => onResetVotes?.(idea.id)}>
                  Reset Votes ({idea.votes})
                </Button>
                <Button size="xs" colorPalette="red" onClick={() => onDelete?.(idea.id)}>
                  Delete Idea
                </Button>
              </VStack>
            )}
          </VStack>
        </HStack>
        
        <HStack gap={4}>
          <Button 
            variant="ghost" 
            size="sm" 
            gap={1} 
            color="fg.muted"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageSquare size={16} />
            <Text fontSize="sm">{idea.comments.length} comments</Text>
          </Button>
          <Tooltip content={getFullTimestamp(idea.createdAt)}>
            <Text fontSize="xs" color="fg.subtle" cursor="help">
              {getRelativeTime(idea.createdAt)}
            </Text>
          </Tooltip>
        </HStack>

        {showComments && (
          <CommentSection 
            ideaId={idea.id} 
            comments={idea.comments} 
            onCommentAdded={(c) => onCommentAdded(idea.id, c)}
            isAdmin={isAdmin}
            onDeleteComment={(commentId) => onDeleteComment?.(idea.id, commentId)}
          />
        )}
      </VStack>
    </Box>
  );
};
