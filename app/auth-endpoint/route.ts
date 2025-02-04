import { NextRequest, NextResponse } from 'next/server';
import liveblocks from '@/lib/liveblocks';
import { auth } from '@clerk/nextjs/server';
import { adminDb } from '@/firebase-admin';

export async function POST(request: NextRequest) {
  console.log('POST request received');

  if (!process.env.LIVEBLOCKS_PRIVATE_KEY) {
    console.error('LIVEBLOCKS_PRIVATE_KEY is not set');
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }

  const { sessionClaims } = await auth();
  console.log('Session claims:', sessionClaims);

  const { room } = await request.json();
  console.log('Requested room:', room);

  // Check if the user is allowed to access this room
  if (!sessionClaims?.email) {
    console.error('Email is required');
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  const session = liveblocks.prepareSession(sessionClaims.email, {
    userInfo: {
      name: sessionClaims?.fullName,
      email: sessionClaims?.email,
      avatar: sessionClaims?.image,
    },
  });
  console.log('Session prepared for user:', sessionClaims.email);

  const userDocRef = adminDb.collection('users').doc(sessionClaims.email);
  const userDoc = await userDocRef.get();
  console.log('User document reference:', userDocRef.path);
  console.log(
    'User document data:',
    userDoc.exists ? userDoc.data() : 'Document does not exist'
  );

  // if (!userDoc.exists) {
  //   console.error("User document not found");
  //   return NextResponse.json({error: 'User not found'}, {status: 404});
  // }

  const roomsCollection = adminDb.collection(
    `users/${sessionClaims.email}/rooms`
  );
  const usersInRoom = await roomsCollection.where('roomId', '==', room).get();
  console.log('Users in room query result:', usersInRoom.docs);

  usersInRoom.docs.forEach((doc) => {
    console.log('Room document:', doc.id, doc.data());
  });

  const userInRoom = usersInRoom.docs.find((doc) => doc.id === room);
  console.log('User in room document:', userInRoom);

  if (userInRoom) {
    console.log('User in room, allowing access');
    session.allow(room, session.FULL_ACCESS);
    const { body, status } = await session.authorize();
    console.log('Session authorized with status:', status);

    return new Response(body, { status });
  } else {
    console.error('User not allowed to access this room');
    return NextResponse.json(
      { error: 'You are not allowed to access this room' },
      { status: 403 }
    );
  }
}
