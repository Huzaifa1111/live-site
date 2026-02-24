import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      secure: this.configService.get<number>('SMTP_PORT') === 465, // true for 465, false for other ports
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });

    // Verify connection on startup
    this.transporter.verify((error) => {
      if (error) {
        this.logger.error('SMTP Connection Error:', error);
      } else {
        this.logger.log('SMTP Server is ready to take messages');
      }
    });
  }

  async sendOtpEmail(to: string, name: string, otp: string) {
    const from = this.configService.get<string>('SMTP_FROM');
    try {
      const info = await this.transporter.sendMail({
        from,
        to,
        subject: 'Your OTP Code',
        html: `<p>Hi ${name},</p><p>Your OTP code is: <strong>${otp}</strong></p>`,
      });
      this.logger.log(`OTP sent to ${to}: ${info.messageId}`);
      return { sent: true, messageId: info.messageId };
    } catch (error) {
      this.logger.error(`Failed to send OTP to ${to}`, error.stack);
      return { sent: false, error };
    }
  }

  async sendOrderConfirmation(to: string, name: string, order: any) {
    const from = this.configService.get<string>('SMTP_FROM');

    // Create item rows for HTML table
    const itemRows = order.items.map((item: any) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">
          <div style="font-weight: bold; color: #333;">${item.product.name}</div>
          <div style="font-size: 12px; color: #666;">Quantity: ${item.quantity}</div>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; color: #333;">
          $${(item.price * item.quantity).toFixed(2)}
        </td>
      </tr>
    `).join('');

    const html = `
      <div style="font-family: 'Plus Jakarta Sans', sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
        <div style="background: #ffffff; border: 1px solid #f0f0f0; border-radius: 24px; padding: 40px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="display: inline-block; padding: 8px 16px; border: 2px solid #000; font-weight: 800; font-size: 24px; border-radius: 8px; margin-bottom: 16px;">
              EStore<span style="color: #10b981;">.</span>
            </div>
            <h1 style="font-size: 28px; font-weight: 800; margin: 0; letter-spacing: -0.02em;">Order Confirmed!</h1>
            <p style="color: #666; margin-top: 8px;">Hi ${name}, thank you for your purchase.</p>
          </div>

          <!-- Order Summary -->
          <div style="background: #f9fafb; border-radius: 16px; padding: 24px; margin-bottom: 32px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
              <span style="font-size: 12px; font-weight: 800; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.1em;">Order Number</span>
              <span style="font-size: 14px; font-weight: 700;">#${order.orderNumber}</span>
            </div>
            
            <table style="width: 100%; border-collapse: collapse;">
              ${itemRows}
            </table>

            <div style="margin-top: 24px; border-top: 2px solid #eee; pt: 16px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #666;">Subtotal</span>
                <span style="font-weight: 600;">$${order.subtotal}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #666;">Shipping</span>
                <span style="font-weight: 600;">$${order.shippingFee}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
                <span style="color: #666;">Tax</span>
                <span style="font-weight: 600;">$${order.tax}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding-top: 16px; border-top: 1px dashed #ddd;">
                <span style="font-size: 18px; font-weight: 800;">Total</span>
                <span style="font-size: 18px; font-weight: 800; color: #10b981;">$${order.total}</span>
              </div>
            </div>
          </div>

          <!-- Shipping Details -->
          <div style="margin-bottom: 32px;">
            <h3 style="font-size: 14px; font-weight: 800; text-transform: uppercase; color: #9ca3af; letter-spacing: 0.1em; margin-bottom: 12px;">Delivery Address</h3>
            <p style="background: #fff; border: 1px solid #eee; border-radius: 12px; padding: 16px; font-size: 14px; line-height: 1.6; color: #4b5563;">
              ${order.shippingAddress}
            </p>
          </div>

          <!-- Footer -->
          <div style="text-align: center; border-top: 1px solid #f0f0f0; pt: 32px;">
            <p style="font-size: 12px; color: #9ca3af; margin-bottom: 16px;">
              If you have any questions, reply to this email or contact support.
            </p>
            <div style="font-size: 10px; color: #d1d5db; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700;">
              &copy; ${new Date().getFullYear()} EStore. All Rights Reserved.
            </div>
          </div>
        </div>
      </div>
    `;

    try {
      const info = await this.transporter.sendMail({
        from,
        to,
        subject: `Order Confirmation #${order.orderNumber}`,
        html,
      });
      this.logger.log(`Order confirmation sent to ${to}: ${info.messageId}`);
      return { sent: true, messageId: info.messageId };
    } catch (error) {
      this.logger.error(`Failed to send order confirmation to ${to}`, error.stack);
      return { sent: false, error };
    }
  }
}