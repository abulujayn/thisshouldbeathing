
'use client';

import { Box, Container, HStack, Heading, Spacer } from '@chakra-ui/react';
import { ColorModeButton } from '@/components/ui/color-mode';
import { useRouter } from 'next/navigation';
import { useState, useRef } from 'react';

interface HeaderProps {
  onAdminTrigger?: () => void;
  isAdmin?: boolean;
  onLogout?: () => void;
}

export const Header = ({ onAdminTrigger, isAdmin, onLogout }: HeaderProps) => {
  const [clickCount, setClickCount] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleTitleClick = (e: React.MouseEvent<HTMLHeadingElement>) => {
    if (isAdmin) {
      onLogout?.();
      return;
    }

    let offset = -1;
    let textNode: Node | null = null;
    
    if (typeof document !== 'undefined') {
      // @ts-expect-error - caretRangeFromPoint
      if (document.caretRangeFromPoint) {
        // @ts-expect-error - caretRangeFromPoint
        const range = document.caretRangeFromPoint(e.clientX, e.clientY);
        if (range) {
          offset = range.startOffset;
          textNode = range.startContainer;
        }
      } 
      // @ts-expect-error - caretPositionFromPoint
      else if (document.caretPositionFromPoint) {
        // @ts-expect-error - caretPositionFromPoint
        const position = document.caretPositionFromPoint(e.clientX, e.clientY);
        if (position) {
          offset = position.offset;
          textNode = position.offsetNode;
        }
      }
    }

    if (textNode) {
      const text = textNode.textContent || '';
      const charAtOffset = text[offset];
      const charBeforeOffset = text[offset - 1];
      
      const isO = (charAtOffset === 'o' || charBeforeOffset === 'o') && (offset >= 6 && offset <= 9);
      
      if (isO) {
        const nextCount = clickCount + 1;
        setClickCount(nextCount);

        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }

        if (nextCount === 5) {
          onAdminTrigger?.();
          setClickCount(0);
        } else {
          timerRef.current = setTimeout(() => {
            setClickCount(0);
          }, 2000);
        }
        return;
      }
    }
    
    setClickCount(0);
  };

  return (
    <Box borderBottomWidth="1px" bg="bg.panel" position="sticky" top={0} zIndex="docked">
      <Container maxW="4xl" py={4}>
        <HStack>
          <Heading 
            size="md" 
            letterSpacing="tight" 
            onClick={handleTitleClick}
            cursor="default"
            pointerEvents="all"
            color={isAdmin ? "red.600" : "inherit"}
            transition="color 0.2s"
          >
            This should be a thing
          </Heading>
          <Spacer />
          <ColorModeButton />
        </HStack>
      </Container>
    </Box>
  );
};
