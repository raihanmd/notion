import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "~/_components/ui/button";

export default function NotFound() {
  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col items-center justify-center">
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-foreground mb-2 text-9xl font-bold tracking-tighter">
          404
        </h1>
        <p className="text-foreground mb-8 text-xl font-medium">
          The page you're looking for doesn't exist.
        </p>
        <p className="text-foreground mb-12">
          The page might have been moved or deleted, or perhaps you mistyped the
          URL.
        </p>
        <Button asChild>
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft size={16} />
            <span>Back to home</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
