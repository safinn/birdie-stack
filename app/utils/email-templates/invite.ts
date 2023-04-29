export function invite(
  appName: string = 'Birdie App',
  fromEmail: string = 'birdie@stack.com',
  organisationName: string = 'Birdie Stack',
  inviteLink: string = 'http://localhost:3000/emails',
  baseUrl: string = 'http://localhost:3000'
) {
  return `
  <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
  <meta http-equiv="Content-Type" content="text/html charset=UTF-8" />
  <html lang="en">

    <head></head>
    <div id="preview" style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0">Join ${organisationName} on ${appName}</div>

    <body style="background-color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,&quot;Segoe UI&quot;,Roboto,Oxygen-Sans,Ubuntu,Cantarell,&quot;Helvetica Neue&quot;,sans-serif">
      <table align="center" role="presentation" cellSpacing="0" cellPadding="0" border="0" width="100%" style="max-width:37.5em;margin:0 auto;padding:20px 0 48px;width:560px;display: block">
        <tr style="width:100%">
          <td><img alt="${appName}" src="${baseUrl}/favicon.ico" width="42" height="42" style="display:block;outline:none;border:none;text-decoration:none;border-radius:21px;width:42px;height:42px" />
            <h1 style="font-size:24px;letter-spacing:-0.5px;line-height:1.3;font-weight:400;color:#484848;padding:17px 0 0">Join <strong>${organisationName}</strong> on <strong>${appName}</strong></h1>
            <p style="font-size:15px;line-height:1.4;margin:15px 0 15px;color:#3c4149">Hello,</p>
            <p style="font-size:15px;line-height:1.4;color:#3c4149"><a href="mailto:${fromEmail}">${fromEmail}</a> has invited you to the <strong>${organisationName}</strong> team on <strong>${appName}</strong>.</p>
            <table style="padding:27px 0 27px; display:block" align="center" border="0" cellPadding="0" cellSpacing="0" role="presentation" width="100%">
              <tbody>
                <tr>
                  <td><a href="${inviteLink}" target="_blank" style="background-color:#171717;border-radius:3px;font-weight:600;color:#fff;font-size:15px;text-decoration:none;text-align:center;display:inline-block;p-x:23px;p-y:11px;line-height:100%;max-width:100%;padding:11px 23px"><span><!--[if mso]><i style="letter-spacing: 23px;mso-font-width:-100%;mso-text-raise:16.5" hidden>&nbsp;</i><![endif]--></span><span style="background-color:#171717;border-radius:3px;font-weight:600;color:#fff;font-size:15px;text-decoration:none;text-align:center;display:inline-block;p-x:23px;p-y:11px;max-width:100%;line-height:120%;text-transform:none;mso-padding-alt:0px;mso-text-raise:8.25px">Join the team</span><span><!--[if mso]><i style="letter-spacing: 23px;mso-font-width:-100%" hidden>&nbsp;</i><![endif]--></span></a></td>
                </tr>
              </tbody>
            </table>
            <p style="font-size:15px;line-height:1.4;color:#3c4149">or copy and paste this URL into your browser: <a href="${inviteLink}">${inviteLink}</a></p>
            <hr style="width:100%;border:none;border-top:1px solid #eaeaea;border-color:#dfe1e4;margin:42px 0 26px" />
            <a target="_blank" style="color:#b4becc;text-decoration:none;font-size:14px" href="${baseUrl}">${appName}</a>
          </td>
        </tr>
      </table>
    </body>

  </html>
  `
}
