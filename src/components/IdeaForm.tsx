
'use client';

import { useState } from 'react';
import { Button, Input, Textarea, VStack } from '@chakra-ui/react';
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
  onSubmit: (title: string, description: string) => Promise<void>;
}

export const IdeaForm = ({ onSubmit }: IdeaFormProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title) return;
    setIsSubmitting(true);
    await onSubmit(title, description);
    setTitle('');
    setDescription('');
    setIsSubmitting(false);
    setIsOpen(false);
  };

  return (
    <DialogRoot open={isOpen} onOpenChange={(e) => setIsOpen(e.open)}>
      <DialogTrigger asChild>
        <Button size="lg" colorPalette="blue">Submit New Idea</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share your idea</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <VStack gap={4}>
            <Field label="Title" required>
              <Input 
                placeholder="What is your idea?" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
              />
            </Field>
            <Field label="Description">
              <Textarea 
                placeholder="Describe it in more detail..." 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Field>
          </VStack>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button 
            colorPalette="blue" 
            loading={isSubmitting} 
            onClick={handleSubmit}
            disabled={!title}
          >
            Submit
          </Button>
        </DialogFooter>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  );
};
