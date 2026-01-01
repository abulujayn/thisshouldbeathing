'use client';

import { useState } from 'react';
import { Button, Input, VStack, Text, Box } from '@chakra-ui/react';
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field } from '@/components/ui/field';
import { PinInput } from '@/components/ui/pin-input';
import { toaster } from '@/components/ui/toaster';

interface LoginModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onLoginSuccess: (user: { email: string }) => void;
}

export const LoginModal = ({ isOpen, onOpenChange, onLoginSuccess }: LoginModalProps) => {
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendCode = async () => {
    if (!email) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep('code');
        toaster.create({ description: 'Verification code sent to your email', type: 'success' });
      } else {
        toaster.create({ description: data.error || 'Failed to send code', type: 'error' });
      }
    } catch {
      toaster.create({ description: 'An error occurred', type: 'error' });
    }
    setIsLoading(false);
  };

  const handleVerify = async () => {
    if (!code) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (res.ok) {
        onLoginSuccess(data.user);
        onOpenChange(false);
        toaster.create({ description: 'Logged in successfully', type: 'success' });
        // Reset state
        setStep('email');
        setEmail('');
        setCode('');
      } else {
        toaster.create({ description: data.error || 'Invalid code', type: 'error' });
      }
    } catch {
      toaster.create({ description: 'An error occurred', type: 'error' });
    }
    setIsLoading(false);
  };

  return (
    <DialogRoot open={isOpen} onOpenChange={(e) => onOpenChange(e.open)}>
      <DialogContent borderRadius="2xl">
        <DialogHeader>
          <DialogTitle fontSize="2xl">
            {step === 'email' ? 'Login' : 'Verify Email'}
          </DialogTitle>
        </DialogHeader>
        <DialogBody py={6}>
          <VStack gap={5}>
            {step === 'email' ? (
              <>
                <Field label="Email Address" required>
                  <Input 
                    type="email"
                    placeholder="email@example.com" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendCode()}
                    autoFocus
                  />
                </Field>
                <Button 
                  width="full" 
                  colorPalette="blue" 
                  loading={isLoading} 
                  onClick={handleSendCode}
                >
                  Send Code
                </Button>
              </>
            ) : (
              <>
                <Text color="fg.muted" fontSize="sm">
                  Enter the code sent to {email}
                </Text>
                <Box display="flex" justifyContent="center" width="full">
                    <PinInput 
                        value={code.split('')} 
                        onValueChange={(e) => setCode(e.value.join(''))} 
                        count={6} 
                        attached={false}
                        size="lg"
                    />
                </Box>
                <Button 
                  width="full" 
                  colorPalette="blue" 
                  loading={isLoading} 
                  onClick={handleVerify}
                  disabled={code.length !== 6}
                >
                  Verify
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setStep('email')}
                >
                  Back to Email
                </Button>
              </>
            )}
          </VStack>
        </DialogBody>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  );
};
