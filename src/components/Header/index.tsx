import { Sidebar } from "@/components/Header/sidebar";
import { CurrencyToggle } from "@/components/Header/currencyToggle";
import { auth } from "@/server/auth";

export async function Header() {
  const session = await auth();
  const isAuthenticated = session?.user;
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {isAuthenticated && (
        <div className="flex h-14 w-full items-center justify-between px-4 md:px-6">
          <div className="flex items-center">
            <Sidebar />
          </div>
          <div className="hidden items-center space-x-4 md:flex">
            <CurrencyToggle />
          </div>
        </div>
      )}
    </header>
  );
}
