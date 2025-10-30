import { Inter } from 'next/font/google';
import PropTypes from 'prop-types';
import ClientProvider from '@/utils/context/ClientProvider';
import { PARTY_CONFIG } from '@/config/party';

import 'bootstrap/dist/css/bootstrap.min.css';
import '@/styles/globals.css';
import '@/styles/theme.css';

export const metadata = {
  title: PARTY_CONFIG.name,
  description: PARTY_CONFIG.welcomeMessage,
};

const inter = Inter({ subsets: ['latin'] });
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientProvider>{children}</ClientProvider>
      </body>
    </html>
  );
}

RootLayout.propTypes = {
  children: PropTypes.node.isRequired,
};
