import type React from "react";

const Header: React.FC = () => {
  return (
    <header className="bg-[#1E2A47] text-white shadow-lg border-b border-[#334A74]">
      <div className="max-w-7xl mx-auto py-6 px-6 sm:px-8 lg:px-12">
        <h1 className="text-4xl font-semibold font-sans tracking-tight">
          Manager Dashboard
        </h1>
        <p className="mt-2 text-lg text-[#A0B1C1] font-medium">
          Efficient management, simplified workflows.
        </p>
      </div>
    </header>
  );
};

export default Header;
