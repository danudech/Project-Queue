using Microsoft.Extensions.Configuration;
using Queue.Application.Interfaces;
using MimeKit;
using MailKit.Net.Smtp;
using MailKit.Security;
using System.Text.Encodings.Web;

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

    public async Task SendStaffConfirmationWithPasswordEmailAsync(string toEmail, string userName, string confirmationLink, string initialPassword, string locale)
    {
        bool isThai = locale.Equals("th", StringComparison.OrdinalIgnoreCase);
        string safeName = HtmlEncoder.Default.Encode(userName);
        string safeLink = HtmlEncoder.Default.Encode(confirmationLink);
        string subject = isThai ? "เปิดใช้งานบัญชีพนักงาน EZQueue ของคุณ" : "Activate your EZQueue staff account";

        string body = $@"
        <div style='background-color:#f9fafb;padding:50px 10px;font-family:-apple-system,BlinkMacSystemFont,""Segoe UI"",Roboto,sans-serif;'>
            <div style='max-width:560px;margin:0 auto;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);'>
                <div style='background-color:#087a5b;padding:30px;text-align:center;'>
                    <h1 style='color:#ffffff;margin:0;font-size:28px;'>EZQueue</h1>
                </div>
                <div style='padding:40px 30px;line-height:1.6;'>
                    <h2 style='color:#111827;margin-top:0;font-size:22px;'>{(isThai ? $"สวัสดีคุณ {safeName}," : $"Hello {safeName},")}</h2>
                    <p style='color:#4b5563;font-size:16px;'>{(isThai ? "คุณได้รับการเพิ่มเป็นพนักงานในระบบ EZQueue กรุณายืนยันอีเมลและใช้รหัสผ่านชั่วคราวด้านล่างนี้เพื่อเข้าสู่ระบบ:" : "You have been added as a staff member in EZQueue. Please verify your email and use the initial password below to sign in:")}</p>
                    
                    <div style='background-color:#f3f4f6;padding:16px;border-radius:8px;margin:24px 0;text-align:center;'>
                        <p style='margin:0;color:#6b7280;font-size:14px;'>{(isThai ? "รหัสผ่านเริ่มต้นสำหรับเข้าสู่ระบบ:" : "Initial Password:")}</p>
                        <strong style='font-size:20px;color:#111827;letter-spacing:1px;'>{HtmlEncoder.Default.Encode(initialPassword)}</strong>
                    </div>

                    <div style='text-align:center;margin:30px 0;'>
                        <a href='{safeLink}' style='display:inline-block;background-color:#087a5b;color:#ffffff;padding:14px 32px;font-weight:600;text-decoration:none;border-radius:8px;font-size:16px;'>
                            {(isThai ? "ยืนยันอีเมลและเข้าใช้งาน" : "Confirm Email & Sign In")}
                        </a>
                    </div>
                    <p style='color:#9ca3af;font-size:12px;word-break:break-all;'>{safeLink}</p>
                </div>
            </div>
        </div>";

        await SendEmailAsync(toEmail, subject, body);
    }

    public async Task SendStaffInvitationEmailAsync(string toEmail, string userName, string registrationLink, string locale)
    {
        bool isThai = locale.Equals("th", StringComparison.OrdinalIgnoreCase);
        string safeName = HtmlEncoder.Default.Encode(userName);
        string safeLink = HtmlEncoder.Default.Encode(registrationLink);
        string subject = isThai
            ? "คำเชิญเข้าใช้งาน EZQueue สำหรับพนักงาน"
            : "Your EZQueue staff invitation";
        string heading = isThai ? $"สวัสดีคุณ {safeName}" : $"Hello {safeName}";
        string introduction = isThai
            ? "คุณได้รับคำเชิญให้เข้าใช้งาน EZQueue ในฐานะพนักงาน กรุณาสมัครบัญชีด้วยอีเมลนี้และยอมรับข้อกำหนดด้วยตนเอง"
            : "You have been invited to use EZQueue as a staff member. Please register with this email address and accept the terms yourself.";
        string button = isThai ? "สมัครและยืนยันอีเมล" : "Register and verify email";
        string expiryNote = isThai
            ? "หลังสมัคร ระบบจะส่งลิงก์ยืนยันอีเมลให้คุณอีกครั้งเพื่อเปิดใช้งานบัญชี"
            : "After registration, EZQueue will send you a separate email-verification link to activate your account.";

        string body = $@"
        <div style='background:#f4f7f6;padding:48px 16px;font-family:Arial,sans-serif;color:#17211f'>
          <div style='max-width:560px;margin:auto;background:#fff;border:1px solid #dfe8e5;border-radius:14px;overflow:hidden'>
            <div style='padding:24px 30px;background:#087a5b;color:#fff'>
              <strong style='font-size:22px'>EZQueue</strong>
            </div>
            <div style='padding:34px 30px'>
              <h2 style='margin:0 0 14px;font-size:21px'>{heading}</h2>
              <p style='margin:0;color:#53635f;line-height:1.7'>{introduction}</p>
              <div style='margin:30px 0;text-align:center'>
                <a href='{safeLink}' style='display:inline-block;background:#087a5b;color:#fff;text-decoration:none;padding:13px 24px;border-radius:8px;font-weight:600'>{button}</a>
              </div>
              <p style='margin:0;color:#667773;font-size:13px;line-height:1.6'>{expiryNote}</p>
              <p style='margin:18px 0 0;color:#80908c;font-size:12px;word-break:break-all'>{safeLink}</p>
            </div>
          </div>
        </div>";

        await SendEmailAsync(toEmail, subject, body);
    }

    public async Task SendForgotPasswordEmailAsync(string toEmail, string userName, string resetLink)
    {
        string subject = "รีเซ็ตรหัสผ่านของคุณสำหรับ QueueApp";

        // ใช้การจัดวางที่เน้นความปลอดภัยและกระชับ
        string body = $@"
    <div style='background-color: #f9fafb; padding: 50px 10px; font-family: -apple-system, BlinkMacSystemFont, ""Segoe UI"", Roboto, Helvetica, Arial, sans-serif;'>
            <div style='max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);'>
                
                <div style='background-color: #4f46e5; padding: 30px; text-align: center;'>
                    <h1 style='color: #ffffff; margin: 0; font-size: 28px; letter-spacing: -0.5px;'>QueueApp</h1>
                </div>

            <div style='padding: 40px 30px; line-height: 1.6;'>
                <h2 style='color: #111827; margin-top: 0; font-size: 22px;'>สวัสดีคุณ {userName},</h2>
                <p style='color: #4b5563; font-size: 16px;'>เราได้รับคำขอรีเซ็ตรหัสผ่านสำหรับบัญชีของคุณ หากคุณเป็นผู้ดำเนินการโปรดคลิกปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่:</p>
                
                <div style='text-align: center; margin: 40px 0;'>
                    <a href='{resetLink}' 
                       style='display: inline-block; background-color: #4f46e5; color: #ffffff; padding: 14px 32px; font-weight: 600; text-decoration: none; border-radius: 8px; font-size: 16px;'>
                       ยืนยัน
                    </a>
                </div>

                <div style='background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin-bottom: 25px;'>
                    <p style='color: #92400e; font-size: 14px; margin: 0;'>
                        <strong>ข้อควรระวัง:</strong> ลิงก์นี้จะใช้งานได้เพียงครั้งเดียว และจะหมดอายุภายใน 1 ชั่วโมง เพื่อความปลอดภัยของข้อมูลส่วนตัว
                    </p>
                </div>

                <p style='color: #4b5563; font-size: 14px;'>หากปุ่มใช้งานไม่ได้ ให้คัดลอกลิงก์นี้ไปวางที่เบราว์เซอร์:</p>
                <p style='color: #6366f1; font-size: 12px; word-break: break-all; background-color: #f3f4f6; padding: 10px; border-radius: 4px;'>{resetLink}</p>
            </div>

            <div style='background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #f3f4f6;'>
                <p style='color: #ef4444; font-size: 12px; margin: 0; font-weight: 500;'>หากคุณไม่ได้เป็นผู้ขอรีเซ็ตรหัสผ่าน โปรดเพิกเฉยต่ออีเมลฉบับนี้และตรวจสอบความปลอดภัยของบัญชีคุณ</p>
                <p style='color: #9ca3af; font-size: 12px; margin: 15px 0 0 0;'>© {DateTime.Now.Year} QueueApp Team. All rights reserved.</p>
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
