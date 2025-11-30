import Link from "next/link";
import Image from "next/image";

export function SiteHeader() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border px-6">
      <Link href="/" className="flex items-center gap-3">
        <div className="flex size-8 items-center justify-center overflow-hidden rounded-lg">
          <Image
            src="/logo.jpg"
            alt="AI Employee Logo"
            width={32}
            height={32}
          />
        </div>
        <span className="font-medium">AI Employee</span>
      </Link>
    </header>
  );
}
