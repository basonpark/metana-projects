import React from "react";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-gray-100 text-center text-sm text-gray-600 py-4 mt-8 border-t">
      <p>
        &copy; {currentYear} AI Smart Contract Auditor. All rights reserved.
      </p>
      {/* Add other footer links if needed */}
    </footer>
  );
};

export default Footer;
