'use server'; //any data fetching should be server side
import { adminDb } from '@/firebase-admin';
import liveblocks from '@/lib/liveblocks';
import { auth } from '@clerk/nextjs/server';

export async function createNewDocument() {
  const authObj = await auth();
  if (!authObj) {
    throw new Error('User is not authenticated');
  }
  const { sessionClaims, redirectToSignIn } = authObj;

  if (!sessionClaims?.email) {
    return redirectToSignIn();
  }

  const docCollectionRef = adminDb.collection('documents');
  const docRef = await docCollectionRef.add({
    title: 'New Document',
  });

  adminDb
    .collection('users')
    .doc(sessionClaims.email!)
    .collection('rooms')
    .doc(docRef.id)
    .set({
      userId: sessionClaims.email,
      role: 'owner',
      createdAt: new Date(),
      roomId: docRef.id,
    });

  return { docId: docRef.id };
}

export async function deleteDocument(roomId: string) {
  console.log('deleteDocument', roomId);

  try {
    await adminDb.collection('documents').doc(roomId).delete();
    const query = await adminDb.collectionGroup('rooms').where('roomId', '==', roomId).get(); // get all rooms with roomId
    const batch = adminDb.batch();

    //delete the room reference in the user's collection for every user in the room
    query.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    await liveblocks.deleteRoom(roomId);

    return { success: true };

  } catch (error) {
    console.error('Error deleting document', error);
    return { success: false };
  }
}

export async function inviteUserToRoom(roomId: string, email: string) {
  console.log('inviteUserToRoom', roomId, email);
  try {
    await adminDb.collection('users').doc(email).collection('rooms').doc(roomId).set({
      userId: email,
      role: 'editor',
      createdAt: new Date(),
      roomId,
    });

    return { success: true };

  } catch (error) {
    console.error('Error adding user to document', error);
    return { success: false };

  }

};

export async function removeUserFromDocument(roomId: string, userId: string) {
  console.log('removeUserFromDocument', roomId, userId);

  try {
    await adminDb.collection('users').doc(userId).collection('rooms').doc(roomId).delete();
    return { success: true };
  } catch (error) {
    console.error('Error removing user from document', error);
    return { success: false };
  }
} 
