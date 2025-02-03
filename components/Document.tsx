'use client';

import { useEffect, useState, useTransition } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { db } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useDocumentData } from 'react-firebase-hooks/firestore';
// import useOwner from '@/lib/useOwnerHook';

function Document({ id: _id }: { id: string }) {
  const [data, loading, error] = useDocumentData(doc(db, 'documents', _id));
  const [input, setInput] = useState(_id);
  const [isUpdating, startTransition] = useTransition();
  // const isOwner = useOwner();

  useEffect(() => {
    // fetch document
    if (loading) {
      console.log('Loading data...');
      return;
    }
    if (error) {
      console.error('Error fetching data:', error);
      return;
    }
    if (!data) {
      console.log('No data found');
      return;
    }
    if (data) {
      setInput(data.title);
    }
  }, [data, loading, error]);

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
    <div>
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
        </form>
        <div>
          {/* Manage Users */}
          {/* Avatars */}
        </div>
        {/* Collaborative Editor */}
      </div>
    </div>
  );
}
export default Document;
