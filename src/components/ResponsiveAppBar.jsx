import * as React from 'react';
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/mode-toggle'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu } from "lucide-react"

const pages = ['Home','Services','Skills','Projects','About'];

const ResponsiveAppBar = () => {
  return (
    <div className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">

          {/* Logo / Brand - Desktop */}
          <div className="hidden md:flex">
             <a href="#" className="mr-6 flex items-center space-x-2">
                <img src="@/img/logo.png" alt="AT Logo" className="h-10 w-auto" />
             </a>
          </div>

          {/* Mobile Menu */}
          <div className="flex md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="-ml-2">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[200px]">
                {pages.map((page) => (
                  <DropdownMenuItem key={page} asChild>
                    <a href={`#${page.toLowerCase()}`}>{page}</a>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Logo / Brand - Mobile Center */}
          <div className="flex md:hidden flex-1 justify-center">
             <a href="#" className="flex items-center">
                <img src="@/img/logo.png" alt="AT Logo" className="h-8 w-auto" />
             </a>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex flex-1 items-center justify-center gap-6">
             <nav className="flex items-center gap-6 text-sm font-medium">
                {pages.map((page) => (
                    <a
                        key={page}
                        href={`#${page.toLowerCase()}`}
                        className="transition-colors hover:text-foreground/80 text-foreground/60 hover:text-yellow-400"
                    >
                        {page}
                    </a>
                ))}
             </nav>
          </div>

          {/* Actions (Mode Toggle) */}
          <div className="flex items-center justify-end">
            <ModeToggle/>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ResponsiveAppBar;
