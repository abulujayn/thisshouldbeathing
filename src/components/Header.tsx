
'use client';

import { Box, Container, HStack, Heading, Spacer } from '@chakra-ui/react';
import { ColorModeButton } from '@/components/ui/color-mode';
import { useRouter } from 'next/navigation';
import { useState, useRef } from 'react';

export const Header = () => {
  const router = useRouter();
  const [clickCount, setClickCount] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleTitleClick = () => {
    setClickCount((prev) => prev + 1);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (clickCount + 1 === 5) {
      router.push('/admin');
      setClickCount(0);
    } else {
      timerRef.current = setTimeout(() => {
        setClickCount(0);
      }, 2000);
    }
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
            userSelect="none"
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
