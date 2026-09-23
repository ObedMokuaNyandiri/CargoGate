import nodemailer from 'nodemailer';

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, company, volume, use_case } = body;

    if (!name || !email || !company) {
      return new Response(JSON.stringify({ success: false, message: 'Missing required fields' }), { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `CargoGate API System <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send the lead to yourself
      replyTo: email, // If you hit reply, it goes to the customer
      subject: `New Enterprise API Request: ${company}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #0ea5e9;">New CargoGate Enterprise API Lead</h2>
          <p>A new potential customer has requested API access via the CargoGate website.</p>
          
          <table style="width: 100%; max-width: 600px; border-collapse: collapse; margin-top: 20px;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; width: 150px;">Name</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Work Email</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">
                <a href="mailto:${email}" style="color: #0ea5e9;">${email}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Company</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${company}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Expected Volume</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${volume}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Use Case</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${use_case || 'N/A'}</td>
            </tr>
          </table>
          
          <p style="margin-top: 30px; font-size: 0.9em; color: #888;">
            * This email was generated securely by your internal CargoGate server.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Email sending error:', error);
    return new Response(JSON.stringify({ success: false, message: 'Server configuration error' }), { status: 500 });
  }
}
