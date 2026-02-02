export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:z-50 
                 focus:p-4 focus:bg-[#0B111A] focus:text-white 
                 focus:ring-2 focus:ring-amber-500 focus:rounded-lg
                 focus:top-4 focus:left-4"
    >
      Skip to main content
    </a>
  );
}
