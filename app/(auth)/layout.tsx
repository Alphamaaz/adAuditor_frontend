import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f7f4ef]">
      <nav className="mx-auto flex w-full max-w-7xl items-center px-6 py-5">
        <Link href="/" className="flex items-center">
          <Image
            src="/adadviser_logo.svg"
            alt="Ad Adviser"
            height={64}
            width={240}
            className="h-16 object-contain"
            style={{ width: "auto" }}
            unoptimized
            priority
          />
        </Link>
      </nav>
      <main className="flex flex-1 items-center justify-center px-4 pb-16">
        {children}
      </main>
    </div>
  );
}
