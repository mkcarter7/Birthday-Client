/* eslint-disable jsx-a11y/anchor-is-valid */

'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar, Container, Nav, Button } from 'react-bootstrap';
import { PARTY_CONFIG } from '@/config/party';
import { useAuth } from '@/utils/context/authContext';
import { isAdmin } from '@/utils/admin';
import { signOut } from '../utils/auth';

export default function NavBar() {
  const { user } = useAuth();
  const userIsAdmin = isAdmin(user);
  const router = useRouter();

  const handleAdminClick = (e) => {
    e.preventDefault();
    router.push('/admin');
  };

  const handleHomeClick = (e) => {
    e.preventDefault();
    router.push('/');
  };

  return (
    <Navbar
      collapseOnSelect
      expand="lg"
      variant="dark"
      style={{
        background: 'linear-gradient(135deg, var(--party-secondary), var(--party-accent))',
      }}
    >
      <Container>
        <Link passHref href="/" className="navbar-brand">
          {PARTY_CONFIG.name}
        </Link>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link onClick={handleHomeClick} style={{ color: '#fff', cursor: 'pointer' }}>
              Home
            </Nav.Link>
            {userIsAdmin && (
              <Nav.Link onClick={handleAdminClick} style={{ color: '#fff', cursor: 'pointer' }}>
                Admin Dashboard
              </Nav.Link>
            )}
          </Nav>

          <Button
            onClick={signOut}
            style={{
              backgroundColor: '#8b5cf6',
              borderColor: '#8b5cf6',
              color: '#fff',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#7c3aed';
              e.currentTarget.style.borderColor = '#7c3aed';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#8b5cf6';
              e.currentTarget.style.borderColor = '#8b5cf6';
            }}
          >
            Sign Out
          </Button>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
