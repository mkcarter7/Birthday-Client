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
          <Nav className="me-auto">
            {/* CLOSE NAVBAR ON LINK SELECTION: https://stackoverflow.com/questions/72813635/collapse-on-select-react-bootstrap-navbar-with-nextjs-not-working */}
            <Link className="nav-link" href="/">
              Home
            </Link>
          </Nav>

          <Button variant="danger" onClick={signOut}>
            Sign Out
          </Button>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
