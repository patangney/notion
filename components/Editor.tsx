'use client';
import { useRoom, useSelf } from '@liveblocks/react/suspense';
import { useEffect, useState, useMemo } from 'react';
import * as Y from 'yjs';
import { LiveblocksYjsProvider } from '@liveblocks/yjs';
import { Button } from './ui/button';
import { MoonIcon, SunIcon } from 'lucide-react';
import { BlockNoteView } from '@blocknote/shadcn';
import { BlockNoteEditor } from '@blocknote/core';
import { useCreateBlockNote } from '@blocknote/react';

import '@blocknote/core/fonts/inter.css';
import '@blocknote/shadcn/style.css';
import stringToColor from '@/lib/stringToColor';

type EditorProps = {
  doc: Y.Doc;
  provider: LiveblocksYjsProvider;
  darkMode: boolean;
};

function BlockNote({ doc, provider, darkMode }: EditorProps) {
  const userInfo = useSelf((me) => me.info);

  // Memoize user info with proper fallbacks
  const userConfig = useMemo(
    () => ({
      name: userInfo?.name || 'Anonymous',
      color: stringToColor(userInfo?.email || 'default'),
    }),
    [userInfo?.name, userInfo?.email]
  );

  // Ensure fragment exists before creating editor
  const fragment = useMemo(() => {
    return doc.getXmlFragment('document-store') || doc.getXmlFragment();
  }, [doc]);

  const editor = useCreateBlockNote({
    collaboration: {
      provider,
      fragment,
      user: userConfig,
    },
  });

  return (
    <div className="relative max-w-6xl mx-auto">
      {editor && (
        <BlockNoteView
          className="min-h-screen"
          editor={editor}
          theme={darkMode ? 'dark' : 'light'}
        />
      )}
    </div>
  );
}

function Editor() {
  const room = useRoom();
  const [doc, setDoc] = useState<Y.Doc | null>(null);
  const [provider, setProvider] = useState<LiveblocksYjsProvider | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  // Stable room reference
  const stableRoom = useMemo(() => room, [room.id]);

  useEffect(() => {
    let isMounted = true;
    const yDoc = new Y.Doc();
    const yProvider = new LiveblocksYjsProvider(stableRoom, yDoc);

    // Initialize default content structure
    const initContent = () => {
      if (!yDoc.getXmlFragment('document-store')) {
        yDoc.getXmlFragment('document-store');
      }
    };

    if (isMounted) {
      initContent();
      setDoc(yDoc);
      setProvider(yProvider);
    }

    return () => {
      isMounted = false;
      yDoc.destroy();
      yProvider.destroy();
    };
  }, [stableRoom]);

  if (!doc || !provider) {
    return null;
  }

  const style = `hover:text-white ${
    darkMode
      ? 'text-gray-300 bg-gray-800 hover:bg-gray-100 hover:text-gray-800'
      : 'text-gray-800 bg-gray-100 hover:bg-gray-800 hover:text-gray-100'
  }`;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-2 justify-end mb-10">
        <Button className={style} onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? <SunIcon /> : <MoonIcon />}
        </Button>
      </div>
      <BlockNote doc={doc} provider={provider} darkMode={darkMode} />
    </div>
  );
}

export default Editor;
