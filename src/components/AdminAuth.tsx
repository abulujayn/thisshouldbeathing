'use client';

import { useState, useEffect, useCallback } from 'react';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import { VStack, Heading, Text, Button, Center, Spinner, Box } from '@chakra-ui/react';
import { toaster } from '@/components/ui/toaster';

interface AdminAuthProps {
  onAuthenticated: () => void;
}

export function AdminAuth({ onAuthenticated }: AdminAuthProps) {
  const [loading, setLoading] = useState(true);
  const [isSetup, setIsSetup] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);

  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/status');
      const data = await res.json();
      setIsSetup(data.isSetup);
      
      // Check if already authenticated
      const verifyRes = await fetch('/api/admin/verify');
      if (verifyRes.ok) {
        onAuthenticated();
      }
    } catch (error) {
      console.error('Failed to check admin status:', error);
    } finally {
      setLoading(false);
    }
  }, [onAuthenticated]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const handleSetup = async () => {
    setAuthenticating(true);
    try {
      const optionsRes = await fetch('/api/admin/setup/generate-options', { method: 'POST' });
      const options = await optionsRes.json();

      if (options.error) throw new Error(options.error);

      const attResp = await startRegistration({ optionsJSON: options });

      const verifyRes = await fetch('/api/admin/setup/verify', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(attResp),
      });

      const verification = await verifyRes.json();
      if (verification.verified) {
        toaster.create({ title: "Admin setup successful", type: "success" });
        onAuthenticated();
      } else {
        throw new Error('Verification failed');
      }
    } catch (error: unknown) {
      console.error(error);
      const message = error instanceof Error ? error.message : 'Setup failed';
      toaster.create({ title: "Setup failed", description: message, type: "error" });
    } finally {
      setAuthenticating(false);
    }
  };

  const handleLogin = async () => {
    setAuthenticating(true);
    try {
      const optionsRes = await fetch('/api/admin/login/generate-options', { method: 'POST' });
      const options = await optionsRes.json();

      if (options.error) throw new Error(options.error);

      const asseResp = await startAuthentication({ optionsJSON: options });

      const verifyRes = await fetch('/api/admin/login/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(asseResp),
      });

      const verification = await verifyRes.json();
      if (verification.verified) {
        toaster.create({ title: "Authenticated", type: "success" });
        onAuthenticated();
      } else {
        throw new Error('Verification failed');
      }
    } catch (error: unknown) {
      console.error(error);
      const message = error instanceof Error ? error.message : 'Authentication failed';
      toaster.create({ title: "Authentication failed", description: message, type: "error" });
    } finally {
      setAuthenticating(false);
    }
  };

  if (loading) {
    return (
      <Center minH="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Center minH="100vh" bg="bg.canvas">
      <Box p={8} bg="bg.panel" borderRadius="lg" shadow="md" maxW="md" w="full">
        <VStack gap={6}>
          <Heading size="xl">Admin Access</Heading>
          <Text textAlign="center" color="fg.muted">
            {isSetup 
              ? "Use your passkey to access the admin interface." 
              : "No admin passkey found. You are about to set up the primary admin passkey."}
          </Text>
          <Button 
            colorScheme="blue" 
            size="lg" 
            w="full" 
            onClick={isSetup ? handleLogin : handleSetup}
            loading={authenticating}
          >
            {isSetup ? "Authenticate with Passkey" : "Setup Admin Passkey"}
          </Button>
        </VStack>
      </Box>
    </Center>
  );
}
