import * as React from 'react'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import { BrandFooter, BrandHeader, styles } from './_brand'

interface EmailChangeEmailProps {
  siteName: string
  oldEmail: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({
  siteName,
  oldEmail,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Confirm your email change for {siteName}</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <BrandHeader />
        <Heading style={styles.h1}>Confirm your email change</Heading>
        <Text style={styles.text}>
          You requested to change your {siteName} email from{' '}
          <Link href={`mailto:${oldEmail}`} style={styles.link}>
            {oldEmail}
          </Link>{' '}
          to{' '}
          <Link href={`mailto:${newEmail}`} style={styles.link}>
            {newEmail}
          </Link>
          .
        </Text>
        <Section style={styles.buttonWrap}>
          <Button style={styles.button} href={confirmationUrl}>
            Confirm Email Change
          </Button>
        </Section>
        <Text style={styles.text}>
          If you didn't request this change, please secure your account right
          away.
        </Text>
        <BrandFooter />
      </Container>
    </Body>
  </Html>
)

export default EmailChangeEmail
