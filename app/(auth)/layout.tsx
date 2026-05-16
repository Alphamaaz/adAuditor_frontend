import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f7f4ef]">
      <nav className="mx-auto flex w-full max-w-7xl items-center px-6 py-5">
        <Link href="/" className="text-lg font-semibold text-[#171717]">
          Ad Adviser
        </Link>
      </nav>
      <main className="flex flex-1 items-center justify-center px-4 pb-16">
        {children}
      </main>
    </div>
  );
}
