import { NextRequest, NextResponse } from 'next/server';
import liveblocks from '@/lib/liveblocks';
import { auth } from '@clerk/nextjs/server';
import { adminDb } from '@/firebase-admin';

export async function POST(request: NextRequest) {
  console.log('POST request received');

  // Check if the Liveblocks private key is set
  if (!process.env.LIVEBLOCKS_PRIVATE_KEY) {
    console.error('LIVEBLOCKS_PRIVATE_KEY is not set');
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }

  // Get the session claims from Clerk authentication
  const { sessionClaims } = await auth();
  console.log('Session claims:', sessionClaims);

  // Parse the room ID from the request body
  const { room } = await request.json();
  console.log('Requested room:', room);

  // Ensure the user's email is available in session claims
  if (!sessionClaims?.email) {
    console.error('Email is required');
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  // Prepare a Liveblocks session for the user
  const session = liveblocks.prepareSession(sessionClaims.email, {
    userInfo: {
      name: sessionClaims?.fullName,
      email: sessionClaims?.email,
      avatar: sessionClaims?.image,
    },
  });
  console.log('Session prepared for user:', sessionClaims.email);

  // Get the user document from Firestore
  const userDocRef = adminDb.collection('users').doc(sessionClaims.email);
  const userDoc = await userDocRef.get();
  console.log('User document reference:', userDocRef.path);
  console.log(
    'User document data:',
    userDoc.exists ? userDoc.data() : 'Document does not exist'
  );

  // Query the rooms collection to check if the user has access to the requested room
  const roomsCollection = adminDb.collection(
    `users/${sessionClaims.email}/rooms`
  );
  const usersInRoom = await roomsCollection.where('roomId', '==', room).get();
  console.log('Users in room query result:', usersInRoom.docs);

  // Log each room document for debugging
  usersInRoom.docs.forEach((doc) => {
    console.log('Room document:', doc.id, doc.data());
  });

  // Check if the user is allowed in the requested room
  const userInRoom = usersInRoom.docs.find((doc) => doc.id === room);
  console.log('User in room document:', userInRoom);

  if (userInRoom) {
    // If the user is allowed, grant full access to the room
    console.log('User in room, allowing access');
    session.allow(room, session.FULL_ACCESS);
    const { body, status } = await session.authorize();
    console.log('Session authorized with status:', status);

    // Return the authorized session response
    return new Response(body, { status });
  } else {
    // If the user is not allowed, return a JSON response with a redirect URL
    console.error('User not allowed to access this room');
    const redirectUrl = `${request.nextUrl.origin}/`;
    return NextResponse.json(
      {
        error: 'Not authorized',
        redirectUrl: redirectUrl,
      },
      { status: 403 }
    );
  }
}