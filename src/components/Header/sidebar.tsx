"use client";
import type React from "react";
import { useState } from "react";
import {
  LayoutDashboard,
  Wallet,
  CreditCard,
  PieChart,
  Upload,
  Settings,
  Menu,
  LogIn,
  UserPlus,
  LogOut,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CurrencyToggle } from "@/components/Header/currencyToggle";
import { useSession, signOut } from "next-auth/react";
import { toast } from "sonner";

export function Sidebar({ className }: React.HTMLAttributes<HTMLDivElement>) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
      toast.success("Logged out successfully");
      router.push("/");
      router.refresh();
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed to log out");
      console.error("Logout error:", error);
    }
  };

  const SidebarContent = () => (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <CurrencyToggle compact={true} />
        </div>

        {isAuthenticated && (
          <div className="px-3 py-2">
            <div className="space-y-1">
              <Link href="/" onClick={handleLinkClick}>
                <Button
                  variant={pathname === "/" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/accounts" onClick={handleLinkClick}>
                <Button
                  variant={pathname === "/accounts" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  Accounts
                </Button>
              </Link>
              <Link href="/transactions" onClick={handleLinkClick}>
                <Button
                  variant={pathname === "/transactions" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Transactions
                </Button>
              </Link>
              <Link href="/analytics" onClick={handleLinkClick}>
                <Button
                  variant={pathname === "/analytics" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <PieChart className="mr-2 h-4 w-4" />
                  Analytics
                </Button>
              </Link>
              <Link href="/upload" onClick={handleLinkClick}>
                <Button
                  variant={pathname === "/upload" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Statement
                </Button>
              </Link>
            </div>
          </div>
        )}

        {isAuthenticated && (
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
              Settings
            </h2>
            <div className="space-y-1">
              <Link href="/settings" onClick={handleLinkClick}>
                <Button
                  variant={pathname === "/settings" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Preferences
                </Button>
              </Link>
            </div>
          </div>
        )}

        {isAuthenticated ? (
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
              Account
            </h2>
            <div className="space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-start text-red-500 hover:bg-red-100 hover:text-red-600"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        ) : (
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
              Authentication
            </h2>
            <div className="space-y-1">
              <Link href="/login" onClick={handleLinkClick}>
                <Button
                  variant={pathname === "/login" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Button>
              </Link>
              <Link href="/register" onClick={handleLinkClick}>
                <Button
                  variant={pathname === "/register" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Register
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>

        <SheetContent side="left" className="w-[300px] px-0 sm:w-[400px]">
          <SheetTitle className="sr-only">Finance Tracker</SheetTitle>
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  );
}
