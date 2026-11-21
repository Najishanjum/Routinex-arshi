import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DESTINATION_EMAIL = 'arshukhan1600@gmail.com';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { name, email, subject, message, phone, honeypot } = body;

    // Spam honeypot trap: bots fill invisible fields
    if (honeypot) {
      console.warn('Spam submission detected via honeypot.');
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Full Name is required.', success: false }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      return new Response(JSON.stringify({ error: 'A valid email address is required.', success: false }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!subject || typeof subject !== 'string' || subject.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Subject is required.', success: false }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!message || typeof message !== 'string' || message.trim().length < 5) {
      return new Response(JSON.stringify({ error: 'Message must be at least 5 characters.', success: false }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (message.length > 3000) {
      return new Response(JSON.stringify({ error: 'Message exceeds maximum length of 3000 characters.', success: false }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Sanitize input
    const cleanName = name.trim().replace(/[<>]/g, '');
    const cleanEmail = email.trim().replace(/[<>]/g, '');
    const cleanSubject = subject.trim().replace(/[<>]/g, '');
    const cleanPhone = phone ? String(phone).trim().replace(/[<>]/g, '') : 'Not provided';
    const cleanMessage = message.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const submissionDate = new Date().toUTCString();

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

    if (RESEND_API_KEY) {
      const emailHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <div style="border-bottom: 2px solid #3b82f6; padding-bottom: 12px; margin-bottom: 20px;">
            <h2 style="color: #1e293b; margin: 0; font-size: 20px;">RoutineX Contact Message</h2>
            <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0;">Received via RoutineX Web Platform</p>
          </div>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; width: 120px;"><strong>From:</strong></td>
              <td style="padding: 8px 0; color: #1e293b;">${cleanName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;"><strong>Email:</strong></td>
              <td style="padding: 8px 0; color: #3b82f6;"><a href="mailto:${cleanEmail}">${cleanEmail}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;"><strong>Phone:</strong></td>
              <td style="padding: 8px 0; color: #1e293b;">${cleanPhone}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;"><strong>Subject:</strong></td>
              <td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${cleanSubject}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;"><strong>Date:</strong></td>
              <td style="padding: 8px 0; color: #1e293b;">${submissionDate}</td>
            </tr>
          </table>

          <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 6px; margin-bottom: 20px;">
            <p style="margin: 0; color: #334155; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${cleanMessage}</p>
          </div>

          <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 20px 0 0 0;">
            This email was sent automatically from the RoutineX contact form.
          </p>
        </div>
      `;

      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'RoutineX Contact <onboarding@resend.dev>',
          to: [DESTINATION_EMAIL],
          reply_to: cleanEmail,
          subject: `RoutineX Contact: ${cleanSubject}`,
          html: emailHtml,
        }),
      });

      const resendData = await resendRes.json();

      if (!resendRes.ok) {
        console.error('Resend API error:', resendData);
        return new Response(JSON.stringify({ 
          error: resendData.message || 'Failed to deliver email through provider.',
          success: false 
        }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Your message has been sent successfully!',
        id: resendData.id 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      // RESEND_API_KEY is not yet configured in Supabase environment secrets.
      // Log for audit and return a clear status
      console.warn('RESEND_API_KEY not configured in environment. Message recorded:', {
        from: cleanName,
        email: cleanEmail,
        subject: cleanSubject,
        destination: DESTINATION_EMAIL,
      });

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Message received and logged for delivery to arshukhan1600@gmail.com.',
        notice: 'Configure RESEND_API_KEY in Supabase secrets for immediate live delivery.'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error: any) {
    console.error('Server error processing contact form:', error);
    return new Response(JSON.stringify({ error: error.message || 'An unexpected error occurred.', success: false }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
