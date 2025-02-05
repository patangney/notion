"use client";
import { FormEvent, useState, useTransition } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { useUser } from "@clerk/nextjs";
import useOwner from "@/lib/useOwner";
import { useRoom } from "@liveblocks/react/suspense";
import { useCollection } from "react-firebase-hooks/firestore";
import { collectionGroup, doc, query, where } from "firebase/firestore";
import { db } from "@/firebase";
import { start } from "repl";
import { removeUserFromDocument } from "@/actions/actions";

function ManageUsers() {
  const { user } = useUser();
  const room = useRoom();
  const isOwner = useOwner();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [usersInRoom] = useCollection(
    user &&
    query(
      collectionGroup(db, "rooms"),
      where("roomId", "==", room.id)
    )
  );

  const handleDelete = async (userId: string) => {
    // Handle delete user logic here
    startTransition(async () => {
      if (!user) return;
      const { success } = await removeUserFromDocument(room.id, userId);
      if (success) {
        console.log("User removed successfully");
      } else {
        console.log("Error removing user");
      }
    });
  };

  const otherUsersCount = usersInRoom?.docs.filter(
    (doc) => doc.data().userId !== user?.emailAddresses[0].toString()
  ).length;

  // Sort users so that the owner is always listed first, followed by editors
  const sortedUsers = usersInRoom?.docs.sort((a, b) => {
    if (a.data().role === "owner") return -1;
    if (b.data().role === "owner") return 1;
    return 0;
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button asChild variant="outline">
        <DialogTrigger>
          {otherUsersCount === 0 ? "Document Control" : `Shared with (${otherUsersCount}) Users`}
        </DialogTrigger>
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {otherUsersCount === 0 ? "Not Shared" : `Users with Access (${otherUsersCount})`}
          </DialogTitle>
          <DialogDescription>
            Below is a list of users with access to this document.
          </DialogDescription>
        </DialogHeader>
        <hr className="my-4" />
        <div className="flex flex-col space-y-2" >
          {/* map through users */}
          {sortedUsers?.map((doc) => (
            <div key={`${doc.id}-${doc.data().userId}`} className="flex justify-between items-center">
              <p className="font-light">
                {doc.data().userId === user?.emailAddresses[0].toString() ? (
                  <>
                    <span className="font-bold mb-2">You</span> ({doc.data().userId}) - {user?.fullName || "No name"}
                  </>
                ) : (
                  <>
                    {doc.data().userId} - {doc.data().fullName || "No name"}
                  </>
                )}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline">{doc.data().role}</Button>

                {isOwner && doc.data().userId !== user?.emailAddresses[0].toString() && (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      startTransition(() => handleDelete(doc.data().userId));
                    }}
                    disabled={isPending}
                    size={"sm"}
                  >
                    {isPending ? "Removing..." : "X"}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ManageUsers;