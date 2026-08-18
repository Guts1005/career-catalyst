import './globals.css';
import Sidebar from '@/components/Sidebar';
import CommandPalette from '@/components/CommandPalette';

export const metadata = {
  title: 'Career Catalyst — DS/ML/AI Resume Dashboard',
  description: 'Plan, track, and optimize your Data Science & Machine Learning career. Track certifications, build your portfolio, analyze your resume, and accelerate your career growth.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0a0a0f" />
      </head>
      <body suppressHydrationWarning>
        <div className="app-layout">
          <Sidebar />
          <main className="main-content">
            {children}
          </main>
        </div>
        <CommandPalette />
      </body>
    </html>
  );
}
