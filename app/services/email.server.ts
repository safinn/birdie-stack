import type { SendEmailCommandInput } from '@aws-sdk/client-ses'
import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses'
import invariant from 'tiny-invariant'

const { AWS_REGION } = process.env

invariant(AWS_REGION, 'AWS_REGION must be set')

const client = new SESClient({ region: AWS_REGION })

export async function sendEmail(to: string, subject: string, htmlBody: string) {
  // Don't send emails outside of production
  // TODO
  if (process.env.NODE_ENV !== 'production') {
    return
  }

  const params: SendEmailCommandInput = {
    Source: 'no-reply@domain.com',
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Subject: {
        Data: subject,
      },
      Body: {
        Html: {
          Data: htmlBody,
        },
      },
    },
    ConfigurationSetName: 'bounce-complaint-configuration-set',
  }
  const command = new SendEmailCommand(params)

  await client.send(command)
}
