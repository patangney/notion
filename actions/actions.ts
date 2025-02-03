"use server"; //any data fetching should be server side
import { adminDb } from "@/firebase-admin";
import { auth } from "@clerk/nextjs/server";

export async function createNewDocument() {
  const { sessionClaims } = await auth();

  const docCollectionRef = adminDb.collection("documents");
  const docRef = await docCollectionRef.add({
    title: "New Document",
  });

  if (sessionClaims?.email) {
    adminDb
      .collection("users")
      .doc(sessionClaims.email!)
      .collection("rooms")
      .doc(docRef.id)
      .set({
        userId: sessionClaims.email,
        role: "owner",
        createdAt: new Date(),
        roomId: docRef.id,
      });
  } else {
    throw new Error("Email is undefined");
  }

  return { docId: docRef.id };
}
