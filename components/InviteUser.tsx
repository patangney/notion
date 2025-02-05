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
import { usePathname, useRouter } from "next/navigation";
import { inviteUserToRoom } from "@/actions/actions";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

function InviteUser() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  const handleInvite = async (e: FormEvent) => {
    e.preventDefault();

    const roomId = pathname.split("/").pop();
    if (!roomId) return;

    startTransition(async () => {
      const { success } = await inviteUserToRoom(roomId, email);

      if (success) {
        setIsOpen(false);
        setEmail("");
        router.replace("/");
        toast.success("User Added to Document Successfully");
      } else {
        toast.error("An error occurred while adding user to the document");
      }
    });
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setIsEmailValid(validateEmail(value));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button asChild variant="outline">
        <DialogTrigger>Invite</DialogTrigger>
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite User</DialogTitle>
          <DialogDescription>
            Enter the email address of the user you want to invite to this document.
          </DialogDescription>
        </DialogHeader>
        <form className="flex gap-2" onSubmit={handleInvite}>
          <Input
            type="email"
            placeholder="Email Address"
            className="w-full"
            value={email}
            onChange={handleEmailChange}
          />
          {!isEmailValid && (
            <p className="flex flex-1 justify-end text-red-700 mt-2">Please enter a valid email address.</p>
          )}
          <Button type="submit" disabled={!email || !isEmailValid || isPending}>
            {isPending ? "Inviting..." : "Invite"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default InviteUser;