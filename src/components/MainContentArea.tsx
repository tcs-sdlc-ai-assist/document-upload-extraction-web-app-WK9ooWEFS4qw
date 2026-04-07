import React from 'react';

interface MainContentAreaProps {
  children: React.ReactNode;
}

export function MainContentArea({ children }: MainContentAreaProps) {
  return (
    <main
      id="main-content"
      role="main"
      aria-label="Main content"
      className="flex-1 overflow-y-auto bg-secondary-50 px-4 py-6 sm:px-6 md:px-8 lg:px-10"
    >
      <div className="mx-auto max-w-7xl">
        {children}
      </div>
    </main>
  );
}

export default MainContentArea;