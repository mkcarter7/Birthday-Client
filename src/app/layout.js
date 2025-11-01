import { Inter, Fredoka } from 'next/font/google';
import PropTypes from 'prop-types';
import ClientProvider from '@/utils/context/ClientProvider';
import { PARTY_CONFIG } from '@/config/party';

import 'bootstrap/dist/css/bootstrap.min.css';
import '@/styles/globals.css';
import '@/styles/theme.css';

export const metadata = {
  title: PARTY_CONFIG.name,
  description: PARTY_CONFIG.welcomeMessage,
  icons: {
    icon: '/icon.png',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1.0,
  maximumScale: 5.0,
  userScalable: true,
};

const inter = Inter({ subsets: ['latin'] });
export const fredoka = Fredoka({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-fredoka' });
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${fredoka.variable}`}>
        <ClientProvider>{children}</ClientProvider>
      </body>
    </html>
  );
}

RootLayout.propTypes = {
  children: PropTypes.node.isRequired,
};
