'use client';

import { useState } from 'react';
import { Button, Input, Textarea, VStack } from '@chakra-ui/react';
import { Plus } from 'lucide-react';
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field } from '@/components/ui/field';
import { useAuth } from '@/contexts/AuthContext';
import { LoginModal } from './LoginModal';

interface IdeaFormProps {
  onSubmit: (title: string, description: string, authorEmail: string) => Promise<void>;
}

export const IdeaForm = ({ onSubmit }: IdeaFormProps) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title || !user?.email) return;
    setIsSubmitting(true);
    await onSubmit(title, description, user.email);
    setTitle('');
    setDescription('');
    setIsSubmitting(false);
    setIsOpen(false);
  };

  const handleOpen = () => {
    if (!user) {
      setIsLoginOpen(true);
    } else {
      setIsOpen(true);
    }
  };

  return (
    <>
      <Button size="lg" colorPalette="blue" borderRadius="full" px={8} gap={2} onClick={handleOpen}>
        <Plus size={20} />
        Submit New Idea
      </Button>

      <DialogRoot open={isOpen} onOpenChange={(e) => setIsOpen(e.open)}>
        <DialogContent borderRadius="2xl">
          <DialogHeader pb={0}>
            <DialogTitle fontSize="2xl">Share your idea</DialogTitle>
          </DialogHeader>
          <DialogBody py={6}>
            <VStack gap={5}>
              <Field label="Title" required helperText="Make it short and catchy">
                <Input 
                  placeholder="What is your idea?" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  bg="bg.subtle"
                />
              </Field>
              <Field label="Description">
                <Textarea 
                  placeholder="Describe it in more detail... why should it exist?" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  bg="bg.subtle"
                  rows={4}
                />
              </Field>
            </VStack>
          </DialogBody>
          <DialogFooter borderTopWidth="1px" pt={4}>
            <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button 
              colorPalette="blue" 
              loading={isSubmitting} 
              onClick={handleSubmit}
              disabled={!title}
              px={8}
              borderRadius="lg"
            >
              Submit Idea
            </Button>
          </DialogFooter>
          <DialogCloseTrigger />
        </DialogContent>
      </DialogRoot>

      <LoginModal 
        isOpen={isLoginOpen} 
        onOpenChange={setIsLoginOpen} 
        onLoginSuccess={() => {
            // We do not auto-open the form here to avoid popup blocking or confusion, 
            // but we could. For now, user is logged in, they can click again.
            // Actually, let's open it for better UX.
            setIsOpen(true);
        }} 
      />
    </>
  );
};
