import { useLayoutEffect, useState } from "react";
import { SiGithub } from "@icons-pack/react-simple-icons";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui";
import { Link, Outlet } from "@tanstack/react-router";
import { Code2, IceCream, Locate, Menu, Moon, Sun, X } from "lucide-react";

import Logo from "~/components/logo";
import { useTheme } from "~/hooks/theme";
import { initialSearch } from "~/schemas/locate-restaurants";

import type { Dispatch, SetStateAction } from "react";

export function Layout() {
  const [showMobileNav, setShowMobileNav] = useState(false);

  const linkClassNames =
    "flex items-center gap-2 p-3 text-sm font-medium transition-colors hover:text-primary";

  const inactiveLinkClassNames = "text-muted-foreground";

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

          <nav className="flex items-center sm:gap-12">
            <Link
              to="/"
              search={initialSearch}
              activeOptions={{ includeSearch: false }}
            >
              <Logo />
            </Link>

            <ul className="hidden sm:flex">
              <li>
                <Link
                  to="/"
                  search={initialSearch}
                  className={linkClassNames}
                  inactiveProps={{ className: inactiveLinkClassNames }}
                  activeOptions={{ includeSearch: false }}
                >
                  <Locate />
                  <span>Locate</span>
                </Link>
              </li>

              <li>
                <Link
                  to="/flavors"
                  className={linkClassNames}
                  inactiveProps={{ className: inactiveLinkClassNames }}
                >
                  <IceCream />
                  <span>Flavors</span>
                </Link>
              </li>
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
          <div className="text-muted-foreground flex items-center gap-4 text-sm">
            <Code2 />
            <p>
              {"Developed by "}
              <a
                href="https://github.com/declanlscott"
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
            <a href="https://github.com/declanlscott/fodder" target="_blank">
              {/* TODO: Remove this when `@icons-pack/react-simple-icons` resolves this issue: https://github.com/icons-pack/react-simple-icons/issues/215
              @ts-expect-error */}
              <SiGithub />
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
  useLayoutEffect((): (() => void) => {
    const originalStyle = window.getComputedStyle(document.body).overflow;

    document.body.style.overflow = "hidden";

    return () => (document.body.style.overflow = originalStyle);
  }, []);

  const linkClassNames =
    "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors hover:text-primary";

  const inactiveLinkClassNames = "text-muted-foreground";

  return (
    <div className="animate-in slide-in-from-top-9 fixed inset-0 top-16 z-50 grid h-[calc(100vh-4rem)] grid-flow-row auto-rows-max overflow-auto p-6 pb-32 sm:hidden">
      <nav className="border-border bg-popover relative z-20 rounded-md border shadow-2xl">
        <ul className="grid grid-flow-row auto-rows-max py-1">
          <li>
            <Link
              to="/"
              search={initialSearch}
              className={linkClassNames}
              inactiveProps={{ className: inactiveLinkClassNames }}
              activeOptions={{ includeSearch: false }}
              onClick={() => setIsVisible(false)}
            >
              <Locate />
              <span>Locate</span>
            </Link>
          </li>

          <li>
            <Link
              to="/flavors"
              className={linkClassNames}
              inactiveProps={{ className: inactiveLinkClassNames }}
              onClick={() => setIsVisible(false)}
            >
              <IceCream />
              <span>Flavors</span>
            </Link>
          </li>
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
