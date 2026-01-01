'use client';

import { Box, Container, HStack, Heading, Spacer, Button, Text } from '@chakra-ui/react';
import { ColorModeButton } from '@/components/ui/color-mode';
import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LoginModal } from '@/components/LoginModal';
import { Avatar } from '@/components/ui/avatar';
import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
} from "@/components/ui/menu"

interface HeaderProps {
  onAdminTrigger?: () => void;
  isAdmin?: boolean;
  onLogout?: () => void;
}

interface CaretAPI {
  caretRangeFromPoint?: (x: number, y: number) => Range | null;
  caretPositionFromPoint?: (x: number, y: number) => { offset: number; offsetNode: Node } | null;
}

export const Header = ({ onAdminTrigger, isAdmin, onLogout: onAdminLogout }: HeaderProps) => {
  const { user, login, logout: userLogout } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleTitleClick = (e: React.MouseEvent<HTMLHeadingElement>) => {
    if (isAdmin) {
      onAdminLogout?.();
      return;
    }

    let offset = -1;
    let textNode: Node | null = null;
    
    if (typeof document !== 'undefined') {
      const doc = document as unknown as CaretAPI;
      if (doc.caretRangeFromPoint) {
        const range = doc.caretRangeFromPoint(e.clientX, e.clientY);
        if (range) {
          offset = range.startOffset;
          textNode = range.startContainer;
        }
      } 
      else if (doc.caretPositionFromPoint) {
        const position = doc.caretPositionFromPoint(e.clientX, e.clientY);
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
          {user ? (
             <MenuRoot>
              <MenuTrigger asChild>
                <Button variant="ghost" size="sm" borderRadius="full" px={0}>
                  <Avatar name={user.email} size="sm" />
                </Button>
              </MenuTrigger>
              <MenuContent>
                <MenuItem value="email" disabled>
                   <Text fontSize="xs" color="fg.muted">{user.email}</Text>
                </MenuItem>
                <MenuItem value="logout" color="red.500" onClick={userLogout}>
                  Logout
                </MenuItem>
              </MenuContent>
            </MenuRoot>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setIsLoginOpen(true)}>
              Login
            </Button>
          )}
          <ColorModeButton />
        </HStack>
      </Container>
      <LoginModal 
        isOpen={isLoginOpen} 
        onOpenChange={setIsLoginOpen} 
        onLoginSuccess={login} 
      />
    </Box>
  );
};