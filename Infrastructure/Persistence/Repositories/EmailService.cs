using Microsoft.Extensions.Configuration;
using Queue.Application.Interfaces;
using MimeKit;
using MailKit.Net.Smtp;
using MailKit.Security;

namespace Queue.Infrastructure.Persistence.Repositories;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;

    public EmailService(IConfiguration config)
    {
        _config = config;
    }

    public async Task SendConfirmationEmailAsync(string toEmail, string userName, string confirmationLink)
    {
        string subject = "ยืนยันอีเมลของคุณสำหรับ QueueApp";

        // เน้นการใช้ Inline CSS เพื่อให้แสดงผลถูกต้องในทุก Email Client (Gmail, Outlook)
        string body = $@"
        <div style='background-color: #f9fafb; padding: 50px 10px; font-family: -apple-system, BlinkMacSystemFont, ""Segoe UI"", Roboto, Helvetica, Arial, sans-serif;'>
            <div style='max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);'>
                
                <div style='background-color: #4f46e5; padding: 30px; text-align: center;'>
                    <h1 style='color: #ffffff; margin: 0; font-size: 28px; letter-spacing: -0.5px;'>QueueApp</h1>
                </div>

                <div style='padding: 40px 30px; line-height: 1.6;'>
                    <h2 style='color: #111827; margin-top: 0; font-size: 22px;'>สวัสดีคุณ {userName},</h2>
                    <p style='color: #4b5563; font-size: 16px;'>ยินดีต้อนรับสู่ QueueApp! เราตื่นเต้นมากที่คุณมาร่วมเป็นส่วนหนึ่งกับเรา ขั้นตอนสุดท้ายก่อนเริ่มต้นใช้งาน คือการยืนยันตัวตนของคุณ:</p>
                    
                    <div style='text-align: center; margin: 40px 0;'>
                        <a href='{confirmationLink}' 
                           style='display: inline-block; background-color: #4f46e5; color: #ffffff; padding: 14px 32px; font-weight: 600; text-decoration: none; border-radius: 8px; font-size: 16px; transition: background-color 0.2s;'>
                           ยืนยันบัญชีผู้ใช้
                        </a>
                    </div>

                    <p style='color: #4b5563; font-size: 14px;'>หรือคัดลอกลิงก์นี้ไปวางในเบราว์เซอร์ของคุณ:</p>
                    <p style='color: #6366f1; font-size: 12px; word-break: break-all; background-color: #f3f4f6; padding: 10px; border-radius: 4px;'>{confirmationLink}</p>
                    
                    <p style='color: #9ca3af; font-size: 13px; margin-top: 30px;'>* ลิงก์นี้จะหมดอายุภายใน 24 ชั่วโมง เพื่อความปลอดภัยของบัญชีคุณ</p>
                </div>

                <div style='background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #f3f4f6;'>
                    <p style='color: #9ca3af; font-size: 12px; margin: 0;'>หากคุณไม่ได้สมัครสมาชิก QueueApp โปรดเพิกเฉยต่ออีเมลฉบับนี้</p>
                    <p style='color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;'>© {DateTime.Now.Year} QueueApp Team. All rights reserved.</p>
                </div>
            </div>
        </div>";

        await SendEmailAsync(toEmail, subject, body);
    }
    public async Task SendPasswordEmailAsync(string toEmail, string userName, string password)
    {
        string subject = "รหัสผ่านสำหรับเข้าใช้งานครั้งแรก - QueueApp";

        string body = $@"
        <div style='background-color: #f9fafb; padding: 50px 10px; font-family: -apple-system, BlinkMacSystemFont, ""Segoe UI"", Roboto, Helvetica, Arial, sans-serif;'>
            <div style='max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);'>
                
                <div style='background-color: #4f46e5; padding: 30px; text-align: center;'>
                    <h1 style='color: #ffffff; margin: 0; font-size: 28px; letter-spacing: -0.5px;'>QueueApp</h1>
                </div>

                <div style='padding: 40px 30px; line-height: 1.6;'>
                    <h2 style='color: #111827; margin-top: 0; font-size: 22px;'>ยืนยันตัวตนสำเร็จแล้ว!</h2>
                    <p style='color: #4b5563; font-size: 16px;'>สวัสดีคุณ {userName}, บัญชีของคุณได้รับการเปิดใช้งานเรียบร้อยแล้ว คุณสามารถเข้าสู่ระบบด้วยรหัสผ่านชั่วคราวด้านล่างนี้:</p>
                    
                    <div style='text-align: center; margin: 40px 0;'>
                        <div style='display: inline-block; background-color: #f3f4f6; color: #4f46e5; padding: 16px 40px; font-family: monospace; font-size: 28px; font-weight: bold; letter-spacing: 4px; border-radius: 8px; border: 2px dashed #4f46e5;'>
                            {password}
                        </div>
                    </div>

                    <div style='background-color: #fff7ed; border-left: 4px solid #f97316; padding: 15px; margin-bottom: 25px;'>
                        <p style='color: #9a3412; font-size: 14px; margin: 0;'>
                            <strong>ข้อควรระวัง:</strong> เพื่อความปลอดภัย โปรดเปลี่ยนรหัสผ่านทันทีหลังจากที่คุณเข้าสู่ระบบครั้งแรก
                        </p>
                    </div>

                    <div style='text-align: center;'>
                        <a href='{_config["AppSettings:AppUrl"]}/auth/login' 
                           style='display: inline-block; background-color: #4f46e5; color: #ffffff; padding: 14px 32px; font-weight: 600; text-decoration: none; border-radius: 8px; font-size: 16px;'>
                           เข้าสู่ระบบตอนนี้
                        </a>
                    </div>
                </div>

                <div style='background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #f3f4f6;'>
                    <p style='color: #9ca3af; font-size: 12px; margin: 0;'>หากคุณมีปัญหาในการเข้าใช้งาน โปรดติดต่อฝ่ายสนับสนุนของเรา</p>
                    <p style='color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;'>© {DateTime.Now.Year} QueueApp Team. All rights reserved.</p>
                </div>
            </div>
        </div>";

        await SendEmailAsync(toEmail, subject, body);
    }
    public async Task SendEmailAsync(string toEmail, string subject, string body)
    {
        var email = new MimeMessage();
        email.From.Add(new MailboxAddress("QueueApp Admin", _config["EmailSettings:From"] ?? string.Empty));
        email.To.Add(MailboxAddress.Parse(toEmail));
        email.Subject = subject;

        var builder = new BodyBuilder { HtmlBody = body };
        email.Body = builder.ToMessageBody();

        using var smtp = new SmtpClient();
        try
        {
            await smtp.ConnectAsync(
                _config["EmailSettings:Host"] ?? string.Empty,
                int.Parse(_config["EmailSettings:Port"] ?? "587"),
                SecureSocketOptions.StartTls
            );

            await smtp.AuthenticateAsync(
                _config["EmailSettings:Username"] ?? string.Empty,
                _config["EmailSettings:Password"] ?? string.Empty
            );

            await smtp.SendAsync(email);
        }
        finally
        {
            await smtp.DisconnectAsync(true);
        }
    }
}