'use client';
import { FormEvent, useState, useTransition } from 'react';
import Markdown from 'react-markdown';
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
import { BotIcon, LanguagesIcon } from 'lucide-react';
import { toast } from 'sonner';

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

  const handleAskQuestion = async (e: FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      // get the data from the document
      const fragment = doc.getXmlFragment('document-store');
      const documentData = fragment.toString();

      const id = toast.loading("Translating document...");

      try {
        // make request to cloudflare backend
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/translateDocument`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            documentData,
            targetLanguage: language,
          }),
        });

        if (!res.ok) {
          throw new Error('Translation failed');
        }

        const { translated_text } = await res.json();
        setSummary(translated_text);
        toast.success("Document translated successfully", { id });
      } catch (error) {
        toast.error("Failed to translate document", { id });
      }
    });
  };

  const handleClear = () => {
    setSummary('');
    setQuestion('');
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


          {/* render out open ai summary from translate */}
          {summary && (
            <>
              <div className="flex justify-end mb-2">
                <Button variant="outline" size="sm" onClick={handleClear}>
                  <BotIcon className="w-4 h-4 mr-2" />
                  New Translation
                </Button>
              </div>
              <div className="flex flex-col items-start max-h-96 overflow-y-scroll gap-2 p-5 bg-gray-100 rounded-lg w-full">
                <div className="flex items-center gap-2 mb-2">
                  <BotIcon className="w-5 h-5" />
                  <p className="font-bold">
                    Translation {isPending ? "in progress..." : ""}
                  </p>
                </div>
                <div className="w-full">
                  {isPending ? (
                    "Translating..."
                  ) : (
                    <div className="prose max-w-none">
                      <Markdown>{summary}</Markdown>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}



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
