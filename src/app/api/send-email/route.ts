import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, subject, messageType, senderName, partnerName } = body;

    const resendApiKey = process.env.RESEND_API_KEY;

    // Email HTML Template
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background-color: #0f172a; color: #f8fafc; padding: 24px; border-radius: 20px; border: 1px solid #e11d48;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #fb7185; font-size: 20px; margin: 0;">💕 UsWeekends • Thông Báo Tình Yêu 💕</h1>
        </div>
        <div style="background-color: #1e293b; padding: 18px; border-radius: 16px; border: 1px solid #334155;">
          <p style="font-size: 14px; color: #f1f5f9; line-height: 1.6; margin: 0;">
            ${senderName || 'Bạn trai'} vừa thực hiện hành động:
          </p>
          <div style="font-size: 18px; font-weight: bold; color: #fda4af; margin: 12px 0; text-align: center; background: rgba(244, 63, 94, 0.1); padding: 12px; border-radius: 12px;">
            ${subject || '🤏 Bóp má em online!'}
          </div>
          <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 12px;">
            Mở app ngay để xem tin nhắn bí mật & chọn quán cho cuối tuần nha!
          </p>
        </div>
        <div style="text-align: center; margin-top: 20px; font-size: 11px; color: #64748b;">
          UsWeekends App • Dành riêng cho 2 bạn
        </div>
      </div>
    `;

    // If Resend API Key is set in environment, send actual email via Resend
    if (resendApiKey) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: 'UsWeekends <onboarding@resend.dev>',
          to: [to || 'nguoiyeu@gmail.com'],
          subject: subject || '💌 Bạn trai vừa gửi thông báo tình yêu!',
          html: htmlContent,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        console.warn('Lỗi gửi email Resend:', errData);
      }
    } else {
      console.log('📌 [EMAIL MOCK SIMULATION]:', {
        to: to || 'banguai@gmail.com',
        subject: subject || '🤏 Bóp má em online!',
        sender: senderName || 'Bạn trai'
      });
    }

    return NextResponse.json({ success: true, message: 'Đã gửi thông báo email thành công!' });
  } catch (error) {
    console.error('Lỗi API gửi email:', error);
    return NextResponse.json({ error: 'Không thể gửi email' }, { status: 500 });
  }
}
