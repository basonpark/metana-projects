"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { WalletConnect } from "../WalletConnect";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

interface NavigationItem {
  title: string;
  href?: string;
  description?: string;
  items?: {
    title: string;
    href: string;
    description?: string;
  }[];
}

interface PredictionMarketHeaderProps {
  logo?: React.ReactNode;
  navigationItems?: NavigationItem[];
}

export function PredictionMarketHeader({
  logo = <span className="text-xl font-semibold">Prophit</span>,
  navigationItems = [
    {
      title: "Home",
      href: "/",
    },
    {
      title: "Markets",
      href: "/",
    },
    {
      title: "How It Works",
      href: "/how-it-works",
    },
    {
      title: "Create Market",
      href: "/markets/create",
    },
  ],
}: PredictionMarketHeaderProps) {
  const [isOpen, setOpen] = useState(false);

  return (
    <header className="w-full z-40 sticky top-0 left-0 bg-background border-b border-border">
      <div className="container relative mx-auto min-h-16 flex items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <div className="flex items-center">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              {logo}
            </Link>
          </div>

          <nav className="hidden lg:flex">
            <NavigationMenu>
              <NavigationMenuList>
                {navigationItems.map((item) => (
                  <NavigationMenuItem key={item.title}>
                    {item.href ? (
                      <Link href={item.href} legacyBehavior passHref>
                        <NavigationMenuLink
                          className={navigationMenuTriggerStyle()}
                        >
                          {item.title}
                        </NavigationMenuLink>
                      </Link>
                    ) : item.items ? (
                      <>
                        <NavigationMenuTrigger>
                          {item.title}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                            {item.items.map((subItem) => (
                              <li key={subItem.title} className="row-span-1">
                                <NavigationMenuLink asChild>
                                  <Link
                                    href={subItem.href}
                                    className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                  >
                                    <div className="text-base font-medium leading-none">
                                      {subItem.title}
                                    </div>
                                    {subItem.description && (
                                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                        {subItem.description}
                                      </p>
                                    )}
                                  </Link>
                                </NavigationMenuLink>
                              </li>
                            ))}
                          </ul>
                        </NavigationMenuContent>
                      </>
                    ) : (
                      <span className="px-4 py-2">{item.title}</span>
                    )}
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <WalletConnect />
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen(!isOpen)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-background pt-16">
          <div className="container px-4 py-4">
            <ul className="space-y-4">
              {navigationItems.map((item) => (
                <li key={item.title} className="py-2">
                  {item.href ? (
                    <Button
                      variant="ghost"
                      asChild
                      className="w-full justify-start"
                      onClick={() => setOpen(false)}
                    >
                      <Link href={item.href} className="text-lg font-medium">
                        {item.title}
                      </Link>
                    </Button>
                  ) : item.items ? (
                    <div className="space-y-2">
                      <div className="text-lg font-medium text-muted-foreground px-4">
                        {item.title}
                      </div>
                      <ul className="ml-4 space-y-2">
                        {item.items.map((subItem) => (
                          <li key={subItem.title}>
                            <Button
                              variant="ghost"
                              className="h-auto py-1 px-2 w-full justify-start text-base text-muted-foreground hover:text-foreground"
                              asChild
                              onClick={() => setOpen(false)}
                            >
                              <Link href={subItem.href}>{subItem.title}</Link>
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <span className="block px-4 text-lg font-medium text-muted-foreground">
                      {item.title}
                    </span>
                  )}
                </li>
              ))}
            </ul>
            <div className="mt-8 pt-4 border-t border-border">
              <WalletConnect />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
