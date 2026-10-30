import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/lib/themeContext';

export const metadata: Metadata = {
  title: 'CrimeGraph AI — AI-Powered Criminal Network Analysis System',
  description: 'Connecting Evidence. Revealing Patterns. Supporting Investigations. Next-generation graph intelligence platform for transnational criminal network analysis.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('crimegraph-theme');
                  var theme = stored || 'dark';
                  var root = document.documentElement;
                  if (theme === 'light') {
                    root.classList.remove('dark');
                    root.classList.add('light');
                  } else if (theme === 'system') {
                    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    if (prefersDark) {
                      root.classList.add('dark');
                      root.classList.remove('light');
                    } else {
                      root.classList.remove('dark');
                      root.classList.add('light');
                    }
                  } else {
                    root.classList.add('dark');
                    root.classList.remove('light');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="bg-slate-50 dark:bg-[#080706] text-slate-900 dark:text-[#f4ede1] min-h-screen selection:bg-[#dfd5bf]/30 selection:text-[#14120f] dark:selection:text-[#f4ede1] transition-colors duration-200 antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
