'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';

const mainPages = ['Home', 'Services', 'Skills', 'Projects', 'About'];
const dashboardPages = ['Dashboard'];

const Navbar = ({ isDashboard }) => {
  const [isOpen, setIsOpen] = useState(false);
  const pages = isDashboard ? dashboardPages : mainPages;

  return (
    <nav className="sticky top-0 bg-primary text-primary-foreground z-10">
      <div className="container mx-auto">
        <div className="flex justify-between items-center py-4">
          <div className="text-xl font-bold">
            <Link href="/">AHMED</Link>
          </div>
          <div className="hidden md:flex space-x-4">
            {pages.map((page) => (
              <Button
                key={page}
                asChild
                variant="ghost"
              >
                <Link href={isDashboard ? '/dashboard' : `#${page.toLowerCase()}`}>{page}</Link>
              </Button>
            ))}
          </div>
          <div className="md:hidden">
            <Button variant="ghost" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden">
          <div className="container mx-auto flex flex-col space-y-2 py-4">
            {pages.map((page) => (
              <Button
                key={page}
                asChild
                variant="ghost"
                onClick={() => setIsOpen(false)}
              >
                <Link href={isDashboard ? '/dashboard' : `#${page.toLowerCase()}`}>{page}</Link>
              </Button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
