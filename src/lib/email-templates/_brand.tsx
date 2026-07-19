import * as React from 'react'
import { Img, Section, Hr, Text, Link } from '@react-email/components'

export const BRAND = {
  name: 'OJEX',
  primary: '#2563eb',
  logoUrl: 'https://www.ojexoilandgasservices.com/ojex-logo.png',
  supportEmail: 'support@ojexoilandgasservices.com',
  siteUrl: 'https://www.ojexoilandgasservices.com',
}

export const styles = {
  main: { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' },
  container: { padding: '24px 28px', maxWidth: '560px' },
  logoWrap: { padding: '4px 0 20px' },
  logo: { height: '40px', width: 'auto' },
  h1: {
    fontSize: '22px',
    fontWeight: 'bold' as const,
    color: '#2563eb',
    margin: '0 0 16px',
  },
  text: {
    fontSize: '14px',
    color: '#334155',
    lineHeight: '1.6',
    margin: '0 0 16px',
  },
  button: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 'bold' as const,
    borderRadius: '8px',
    padding: '12px 22px',
    textDecoration: 'none',
    display: 'inline-block',
  },
  buttonWrap: { margin: '4px 0 24px' },
  link: { color: '#2563eb', textDecoration: 'underline' },
  hr: { borderColor: '#e2e8f0', margin: '32px 0 16px' },
  footer: { fontSize: '12px', color: '#64748b', lineHeight: '1.6', margin: 0 },
  code: {
    fontFamily: 'Courier, monospace',
    fontSize: '24px',
    fontWeight: 'bold' as const,
    color: '#2563eb',
    letterSpacing: '4px',
    margin: '0 0 24px',
  },
}

export const BrandHeader = () => (
  <Section style={styles.logoWrap}>
    <Img src={BRAND.logoUrl} alt={`${BRAND.name} logo`} style={styles.logo} />
  </Section>
)

export const BrandFooter = () => (
  <>
    <Hr style={styles.hr} />
    <Text style={styles.footer}>
      Questions? Reach us at{' '}
      <Link href={`mailto:${BRAND.supportEmail}`} style={styles.link}>
        {BRAND.supportEmail}
      </Link>
      .
    </Text>
    <Text style={styles.footer}>
      © {new Date().getFullYear()} {BRAND.name} Oil and Gas Services.
    </Text>
  </>
)
