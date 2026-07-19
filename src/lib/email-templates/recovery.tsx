import * as React from 'react'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import { BrandFooter, BrandHeader, styles } from './_brand'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({ siteName, confirmationUrl }: RecoveryEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Reset your password for {siteName}</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <BrandHeader />
        <Heading style={styles.h1}>Reset your password</Heading>
        <Text style={styles.text}>
          We received a request to reset your {siteName} password. Choose a new
          one using the button below.
        </Text>
        <Section style={styles.buttonWrap}>
          <Button style={styles.button} href={confirmationUrl}>
            Reset Password
          </Button>
        </Section>
        <Text style={styles.text}>
          If you did not request this, your password will remain unchanged and
          you can safely ignore this message.
        </Text>
        <BrandFooter />
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail
