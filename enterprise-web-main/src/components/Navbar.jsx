'use client';

import React from 'react';

const Navbar = ({ children }) => (
  <nav className="bg-neutral-200 dark:bg-neutral-800/40 shadow-md p-4 flex justify-between items-center">
    {children}
  </nav>
);

export default Navbar;