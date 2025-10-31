/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import Link from 'next/link';
import { Navbar, Container, Nav, Button } from 'react-bootstrap';
import { PARTY_CONFIG } from '@/config/party';
import { signOut } from '../utils/auth';

export default function NavBar() {
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
          <Nav className="me-auto">{/* Navigation links can be added here */}</Nav>

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
