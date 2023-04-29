import { Button } from '@react-email/button'
import { Container } from '@react-email/container'
import { Head } from '@react-email/head'
import { Heading } from '@react-email/heading'
import { Hr } from '@react-email/hr'
import { Html } from '@react-email/html'
import { Img } from '@react-email/img'
import { Link } from '@react-email/link'
import { Preview } from '@react-email/preview'
import { Section } from '@react-email/section'
import { Text } from '@react-email/text'

interface EmailProps {
  appName: string
  fromEmail: string
  organisationName: string
  inviteLink: string
  baseUrl?: string
}

export default function Email({
  appName = 'Test App',
  fromEmail = 'email@domain.com',
  organisationName = 'Test Team',
  inviteLink = 'acme.com/invite/123',
  baseUrl = 'acme.com',
}: EmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{`Join ${organisationName} on ${appName}`}</Preview>
      <Section style={main}>
        <Container style={container}>
          <Img
            src={`${baseUrl}/favicon.ico`}
            width="42"
            height="42"
            alt={appName}
            style={logo}
          />
          <Heading style={heading}>
            Join <strong>{organisationName}</strong> on{' '}
            <strong>{appName}</strong>
          </Heading>
          <Text style={paragraph}>Hello,</Text>
          <Text style={paragraph}>
            <Link
              href={`mailto:${fromEmail}`}
              className="text-blue-600 no-underline"
            >
              {fromEmail}
            </Link>{' '}
            has invited you to the <strong>{organisationName}</strong> team on{' '}
            <strong>{appName}</strong>.
          </Text>
          <Section style={buttonContainer}>
            <Button pY={11} pX={23} style={button} href={inviteLink}>
              Join the team
            </Button>
          </Section>
          <Text style={paragraph}>
            or copy and paste this URL into your browser:{' '}
            <Link href={inviteLink} className="text-blue-600 no-underline">
              {inviteLink}
            </Link>
          </Text>
          <Hr style={hr} />
          <Link href={baseUrl} style={reportLink}>
            {appName}
          </Link>
        </Container>
      </Section>
    </Html>
  )
}

const logo = {
  borderRadius: 21,
  width: 42,
  height: 42,
}

const fontFamily =
  '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif'

const main = {
  backgroundColor: '#ffffff',
}

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  width: '560px',
}

const heading = {
  fontFamily,
  fontSize: '24px',
  letterSpacing: '-0.5px',
  lineHeight: '1.3',
  fontWeight: '400',
  color: '#484848',
  padding: '17px 0 0',
}

const paragraph = {
  fontFamily,
  margin: '0 0 15px',
  fontSize: '15px',
  lineHeight: '1.4',
  color: '#3c4149',
}

const buttonContainer = {
  padding: '27px 0 27px',
}

const button = {
  fontFamily,
  backgroundColor: '#5e6ad2',
  borderRadius: '3px',
  fontWeight: '600',
  color: '#fff',
  fontSize: '15px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
}

const reportLink = {
  fontFamily,
  fontSize: '14px',
  color: '#b4becc',
}

const hr = {
  borderColor: '#dfe1e4',
  margin: '42px 0 26px',
}

const code = {
  fontFamily: 'monospace',
  fontWeight: '700',
  padding: '1px 4px',
  backgroundColor: '#dfe1e4',
  letterSpacing: '-0.3px',
  fontSize: '21px',
  borderRadius: '4px',
  color: '#3c4149',
}
