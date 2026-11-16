import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PackagePro India | Dynamic Travel Package Customization Platform (INR)',
  description:
    'Customize your dream travel package in Indian Rupees (₹) with real-time hotel tier swapping, dedicated AC transport (Innova Crysta, Vande Bharat), and Gemini Function Calling.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-emerald-700 selection:text-white">
        {children}
      </body>
    </html>
  );
}
