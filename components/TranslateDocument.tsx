'use client';
import { useState, useTransition } from 'react';
import * as Y from 'yjs';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from './ui/button';
import { LanguagesIcon } from 'lucide-react';

type Language =
  | 'english'
  | 'spanish'
  | 'french'
  | 'german'
  | 'italian'
  | 'portuguese'
  | 'dutch'
  | 'russian'
  | 'japanese'
  | 'korean'
  | 'chinese'
  | 'arabic'
  | 'hindi'
  | 'turkish'
  | 'vietnamese'
  | 'thai'
  | 'indonesian'
  | 'malay';

const languages: Language[] = [
  'english',
  'spanish',
  'french',
  'german',
  'italian',
  'portuguese',
  'dutch',
  'russian',
  'japanese',
  'korean',
  'chinese',
  'arabic',
  'hindi',
  'turkish',
  'vietnamese',
  'thai',
  'indonesian',
  'malay',
];

function TranslateDocument({ doc }: { doc: Y.Doc }) {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState<Language | null>(null);
  const [summary, setSummary] = useState('');
  const [question, setQuestion] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsOpen(false);
    startTransition(async () => {
      // Translate the document
      // Create a new document with the translated text
      // Add the new document to the database
      // Notify the user that the document has been translated
    });
  };
  return (
    <div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <Button asChild variant="outline">
          <DialogTrigger>
            <LanguagesIcon size={24} />
            Translate
          </DialogTrigger>
        </Button>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Translate Document</DialogTitle>
            <DialogDescription>
              Select a language to translate the document to
            </DialogDescription>

            <hr className="mt-5" />
            {/* Ask Question */}
            {question && <p className="mt-5 text-gray-500">Q: {question}</p>}
          </DialogHeader>
          <form className="flex gap-2" onSubmit={handleAskQuestion}>
            <Select
              value={language ?? undefined}
              onValueChange={(value) => setLanguage(value as Language)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a Language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang} value={lang}>
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button type="submit" disabled={!language || isPending}>
              {isPending ? 'Translating...' : 'Translate'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
export default TranslateDocument;
