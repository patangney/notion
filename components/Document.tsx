'use client';

import { useEffect, useState, useTransition } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { db } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import Editor from './Editor';
import useOwner from '@/lib/useOwner';
import DeleteDocument from './DeleteDocument';

function Document({ id: _id }: { id: string }) {
  const [data, loading, error] = useDocumentData(doc(db, 'documents', _id));
  const [input, setInput] = useState(_id);
  const [isUpdating, startTransition] = useTransition();
  const isOwner = useOwner(); // create useOwner hook

  useEffect(() => {
    if (loading || !data) return;
    setInput(data.title);
  }, [data, loading]);

  const updateTitle = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      startTransition(async () => {
        await updateDoc(doc(db, 'documents', _id), { title: input });
        // update document
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      updateTitle(e as unknown as React.FormEvent);
    }
  };

  return (
    <div className="flex-1 h-full bg-white p-5">
      <div className="flex max-w-6xl mx-auto justify-between pb-5">
        <form className="flex flex-1 space-x-2" onSubmit={updateTitle}>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button disabled={isUpdating} type="submit">
            {isUpdating ? 'Updating...' : 'Update'}
          </Button>
          {/* update title... */}
          {/* isOwner && inviteUser, DeleteDocument */}
          {isOwner && (
            <>
            {/* Invite User */}
            {/* Delete Document */}
            <DeleteDocument />
              <p>I own this</p>
            </>
          )}
        </form>
        <div>
          {/* Manage Users */}
          {/* Avatars */}
        </div>
      </div>
      <hr className="pb-10" />
      {/* Collaborative Editor */}
      <Editor />
    </div>
  );
}
export default Document;
