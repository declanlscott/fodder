import {
  Code2,
  Github,
  IceCream,
  Locate,
  Menu,
  Moon,
  Sun,
  X,
} from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";

import Logo from "~/components/Logo";
import { useTheme } from "~/components/ThemeProvider";
import { Button } from "~/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/DropdownMenu";
import { useLockBody } from "~/lib/hooks";
import { NavLinkItem } from "~/lib/types";
import { cn } from "~/lib/utils";

const navLinkItems: NavLinkItem[] = [
  {
    title: "Locate",
    path: "/",
    icon: <Locate />,
  },
  {
    title: "Flavors",
    path: "/flavors",
    icon: <IceCream />,
  },
];

export function Layout() {
  const [showMobileNav, setShowMobileNav] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4">
          <Button
            className="sm:hidden"
            size="icon"
            variant="outline"
            onClick={() => setShowMobileNav((show) => !show)}
          >
            {showMobileNav ? <X /> : <Menu />}
          </Button>

          {showMobileNav ? (
            <MobileNav
              isVisible={showMobileNav}
              setIsVisible={setShowMobileNav}
            />
          ) : null}

          <nav className="flex sm:gap-12">
            <Link to="/">
              <Logo />
            </Link>

            <ul className="hidden items-center gap-6 sm:flex">
              {navLinkItems.map(({ title, path, icon }, index) => (
                <li key={index}>
                  <NavLink
                    to={path}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
                        !isActive && "text-muted-foreground",
                      )
                    }
                  >
                    {icon}
                    {title}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <ModeToggle />
        </div>
      </header>

      <main className="container flex-grow p-8">
        <Outlet />
      </main>

      <footer className="border-t">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Code2 />
            <p>
              {"Developed by "}
              <a
                href="https://github.com/dscott1008"
                className="font-semibold hover:underline"
                target="_blank"
              >
                Declan L. Scott
              </a>
            </p>
          </div>

          <Button
            asChild
            variant="ghost"
            size="icon"
            aria-label="GitHub repository"
            className="text-muted-foreground"
          >
            <a href="https://github.com/dscott1008/fodder" target="_blank">
              <Github />
            </a>
          </Button>
        </div>
      </footer>
    </div>
  );
}

type MobileNavProps = {
  isVisible: boolean;
  setIsVisible: Dispatch<SetStateAction<boolean>>;
};

function MobileNav({ setIsVisible }: MobileNavProps) {
  useLockBody();

  return (
    <div className="fixed inset-0 top-16 z-50 grid h-[calc(100vh-4rem)] grid-flow-row auto-rows-max overflow-auto p-6 pb-32 animate-in slide-in-from-top-9 sm:hidden">
      <nav className="relative z-20 rounded-md border border-border bg-popover shadow-2xl">
        <ul className="rid-flow-row grid auto-rows-max py-1">
          {navLinkItems.map(({ title, path, icon }, index) => (
            <li key={index}>
              <NavLink
                to={path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors hover:text-primary",
                    !isActive && "text-muted-foreground",
                  )
                }
                onClick={() => setIsVisible(false)}
              >
                {icon}
                {title}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

function ModeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
