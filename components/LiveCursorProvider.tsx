'use client';

import { useMyPresence, useOthers } from '@liveblocks/react/suspense';
import { PointerEvent } from 'react';
import FollowPointer from './FollowPointer';

function LiveCursorProvider({ children }: { children: React.ReactNode }) {
  const [myPresence, updatePresence] = useMyPresence();
  const others = useOthers();

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    // update from clientX and clientY to PageX and PageY for full page cursor tracking
    const cursor = { x: Math.floor(e.pageX), y: Math.floor(e.pageY) };
    updatePresence({ cursor });
  }
  function handlePointerLeave() {
    updatePresence({ cursor: null });
  }

  return (
    <div onPointerMove={handlePointerMove} onPointerLeave={handlePointerLeave}>
      {/* render cursors */}
      {others
        .filter((other) => other.presence.cursor != null)
        .map(({ connectionId, presence, info }) => (
          <FollowPointer
            key={connectionId}
            info={info}
            x={presence.cursor!.x}
            y={presence.cursor!.y}
          />
        ))}
      {children}
    </div>
  );
}
export default LiveCursorProvider;
