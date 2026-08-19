import './globals.css';
import { CareerProvider } from '@/context/CareerContext';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
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
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#09090b" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var saved = localStorage.getItem('catalyst-theme');
                var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                var theme = saved || (prefersDark ? 'dark' : 'light');
                document.documentElement.setAttribute('data-theme', theme);
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <CareerProvider>
          <div className="app-layout">
            <Sidebar />
            <main className="main-content">
              {children}
            </main>
          </div>
          <MobileNav />
          <CommandPalette />
          <ToastContainer />
        </CareerProvider>
      </body>
    </html>
  );
}
