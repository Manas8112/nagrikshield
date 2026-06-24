import './globals.css';
import Navbar from './components/Navbar';
import ChatWidget from './components/ChatWidget';
import { AuthProvider } from './lib/authProvider';

export const metadata = {
  title: 'NagrikShield | Hyperlocal Problem Solver',
  description: 'Community issue tracking platform with AI and predictive modeling.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body>
        <AuthProvider>
          <div className="app-shell">
            <Navbar />
            <main className="page-content">
              <div className="container">
                {children}
              </div>
            </main>
            <ChatWidget />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
