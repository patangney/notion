import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
      <h1 className="text-4xl font-bold">Lets build an AI productivity app</h1>
      <p className="text-lg">This is a Next.js app with Tailwind CSS</p>

      <Button>Get started</Button>
    </main>
  );
}
