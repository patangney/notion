import { FormEvent, useState, useTransition } from 'react';
import Markdown from 'react-markdown';
import * as Y from 'yjs';
import { Input } from '@/components/ui/input';
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

import { Button } from './ui/button';
import {
  BotIcon,
  CheckCircle,
  LanguagesIcon,
  MessageCircleCode,
} from 'lucide-react';
import { toast } from 'sonner';

function TranslateDocument({ doc }: { doc: Y.Doc }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [summary, setSummary] = useState('');
  const [question, setQuestion] = useState('');
  const [input, setInput] = useState('');

  const handleAskQuestion = async (e: FormEvent) => {
    e.preventDefault();
    setQuestion(input);
    startTransition(async () => {
      // get the data from the document
      const fragment = doc.getXmlFragment('document-store');
      const documentData = fragment.toString();

      const id = toast.loading('Thinking...');

      try {
        // make request to cloudflare backend
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/chatToDocument`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              documentData,
              question: input,
            }),
          }
        );

        if (!res.ok) {
          throw new Error('Api request failed');
        }

        const responseData = await res.json();
        console.log('Response data:', responseData); // Add logging here
        const message = responseData.message || responseData; // Adjusted to handle different response structures
        console.log('Response message:', message); // Add logging here
        setSummary(message);
        toast.success('Complete', { id });
      } catch (error) {
        console.error('Error:', error); // Add logging here
        toast.error('Failed to access OpenAI', { id });
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
            <MessageCircleCode className="mr-2" />
            Chat To Document
          </DialogTrigger>
        </Button>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Have a question about this document?</DialogTitle>
            <DialogDescription>Ask a question using AI</DialogDescription>

            <hr className="mt-5" />
            {
              /* Ask Question */
              question && <p className="mt-5 text-gray-500">Q: {question}</p>
            }
          </DialogHeader>

          {/* render out open ai summary from translate */}
          {summary && (
            <>
              <div className="flex justify-end mb-2">
                <Button variant="outline" size="sm" onClick={handleClear}>
                  <BotIcon className="w-4 h-4 mr-2" />
                  New Question
                </Button>
              </div>
              <div className="flex flex-col items-start max-h-96 overflow-y-scroll gap-2 p-5 bg-gray-100 rounded-lg w-full">
                <div className="flex items-center gap-2 mb-2">
                  <BotIcon className="w-5 h-5" />
                  <p className="font-bold">
                    Response {isPending ? 'in progress...' : ''}
                  </p>
                </div>
                <div className="w-full">
                  {isPending ? (
                    'Translating...'
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
            <Input
              type="text"
              placeholder="What would you like to ask?"
              className="w-full"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />

            <Button type="submit" disabled={input.length < 15 || isPending}>
              {isPending ? 'Asking...' : 'Ask Question'}
            </Button>
          </form>
          {input.length < 15 ? (
            <p className="flex flex-1 justify-start text-red-700 mt-1">
              Min character length is 15.
            </p>
          ) : (
            <p className="flex flex-1 justify-start text-green-700 mt-1">
              <CheckCircle className="mr-1" />
            </p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TranslateDocument;
