import './globals.css';
import Sidebar from '@/components/Sidebar';
import CommandPalette from '@/components/CommandPalette';
import ToastContainer from '@/components/Toast';

export const metadata = {
  title: 'Catalyst OS — Career Operating System for ML & Data Systems',
  description: 'Plan, track, and optimize your Machine Learning career. Track certifications, benchmark algorithms, build your portfolio, and accelerate technical hiring.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#09090b" />
      </head>
      <body suppressHydrationWarning>
        <div className="app-layout">
          <Sidebar />
          <main className="main-content">
            {children}
          </main>
        </div>
        <CommandPalette />
        <ToastContainer />
      </body>
    </html>
  );
}
