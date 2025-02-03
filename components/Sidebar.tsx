"use client";
import { useEffect, useState } from "react";
import { useCollection } from "react-firebase-hooks/firestore";
import {
  collectionGroup,
  query,
  where,
  DocumentData,
} from "firebase/firestore";
import { useUser } from "@clerk/nextjs";
import { db } from "@/firebase";
import NewDocumentButton from "@/components/ui/NewDocumentButton";
import { MenuIcon } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import SidebarOption from "./SidebarOption";

interface RoomDocument extends DocumentData {
  createdAt: string;
  role: "owner" | "editor";
  roomId: string;
  userId: string;
}

function Sidebar() {
  const { user } = useUser(); //use user from clerk
  const [groupedData, setGroupedData] = useState<{
    owner: RoomDocument[];
    editor: RoomDocument[];
  }>({ owner: [], editor: [] });
  const [data, loading, error] = useCollection(
    user &&
      query(
        collectionGroup(db, "rooms"),
        where("userId", "==", user.emailAddresses[0].toString())
      )
  ); //useCollection from react-firebase-hooks

  useEffect(() => {
    if (loading) {
      console.log("Loading data...");
      return;
    }
    if (error) {
      console.error("Error fetching data:", error);
      return;
    }
    if (!data) {
      console.log("No data found");
      return;
    }
    // [doc1, doc2 doc3] -> { owner: [doc1], editor: [doc2, doc3] } etc
    const grouped = data.docs.reduce<{
      owner: RoomDocument[];
      editor: RoomDocument[];
    }>(
      (acc, current) => {
        const roomData = current.data() as RoomDocument;
        if (roomData.role === "owner") {
          acc.owner.push({
            id: current.id,
            ...roomData,
          });
        } else {
          acc.editor.push({
            id: current.id,
            ...roomData,
          });
        }
        return acc;
      },
      { owner: [], editor: [] }
    );
    console.log(grouped, "grouped");
    setGroupedData(grouped);
  }, [data, loading, error]);

  const menuOptions = (
    <>
      <NewDocumentButton />
      {/* My Documents */}
      <div className="flex py-4 flex-col space-y-4 md:max-w-36">
        {groupedData.owner.length === 0 ? (
          <h2 className="text-gray-500 font-semibold text-sm">
            You don&apos;t have any documents
          </h2>
        ) : (
          <>
            <h2 className="text-gray-500 font-semibold text-sm">
              My Documents
            </h2>
            {groupedData.owner.map((doc) => (
              <SidebarOption
                key={doc.id}
                id={doc.id}
                href={`/documents/${doc.id}`}
              />
            ))}
          </>
        )}
      </div>

      {/* List */}
      {/* Shared Documents */}
      {/* List */}
      {/* Trash */}
      {/* List */}
    </>
  );

  return (
    <div className="p-2 md:p-5 lg:p-10 xl:p-15 bg-gray-200 relative">
      <div className="hidden md:block">{menuOptions}</div>
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger>
            <MenuIcon className="p-2 hover:opacity-30 rounded-lg" size={40} />
          </SheetTrigger>
          <SheetContent side={"left"}>
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
              {/* <SheetDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </SheetDescription> */}
              <div>{menuOptions}</div>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
export default Sidebar;
