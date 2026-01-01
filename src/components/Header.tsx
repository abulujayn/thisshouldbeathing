
'use client';

import { Box, Container, HStack, Heading, Spacer } from '@chakra-ui/react';
import { ColorModeButton } from '@/components/ui/color-mode';

export const Header = () => {
  return (
    <Box borderBottomWidth="1px" bg="bg.panel" position="sticky" top={0} zIndex="docked">
      <Container maxW="4xl" py={4}>
        <HStack>
          <Heading size="md" letterSpacing="tight">This should be a thing</Heading>
          <Spacer />
          <ColorModeButton />
        </HStack>
      </Container>
    </Box>
  );
};
