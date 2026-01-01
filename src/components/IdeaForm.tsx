'use client';

import { useState, useEffect } from 'react';
import { Button, Input, Textarea, VStack, HStack } from '@chakra-ui/react';
import { Plus } from 'lucide-react';
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Field } from '@/components/ui/field';

interface IdeaFormProps {
  onSubmit: (title: string, description: string, authorEmail: string) => Promise<void>;
  initialEmail?: string;
}

export const IdeaForm = ({ onSubmit, initialEmail }: IdeaFormProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [authorEmail, setAuthorEmail] = useState(initialEmail || '');
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialEmail) {
      setAuthorEmail(initialEmail);
    }
  }, [initialEmail]);

  const handleSubmit = async () => {
    if (!title || !authorEmail) return;
    setIsSubmitting(true);
    await onSubmit(title, description, authorEmail);
    setTitle('');
    setDescription('');
    setAuthorEmail('');
    setIsSubmitting(false);
    setIsOpen(false);
  };

  return (
    <DialogRoot open={isOpen} onOpenChange={(e) => setIsOpen(e.open)}>
      <DialogTrigger asChild>
        <Button size="lg" colorPalette="blue" borderRadius="full" px={8} gap={2}>
          <Plus size={20} />
          Submit New Idea
        </Button>
      </DialogTrigger>
      <DialogContent borderRadius="2xl">
        <DialogHeader pb={0}>
          <DialogTitle fontSize="2xl">Share your idea</DialogTitle>
        </DialogHeader>
        <DialogBody py={6}>
          <VStack gap={5}>
            <Field label="Your Email" required>
              <Input 
                type="email"
                placeholder="email@example.com" 
                value={authorEmail} 
                onChange={(e) => setAuthorEmail(e.target.value)} 
                bg="bg.subtle"
              />
            </Field>
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
            disabled={!title || !authorEmail}
            px={8}
            borderRadius="lg"
          >
            Submit Idea
          </Button>
        </DialogFooter>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  );
};