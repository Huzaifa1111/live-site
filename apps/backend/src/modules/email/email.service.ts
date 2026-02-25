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

  async sendOrderConfirmation(to: string, name: string, order: any, attachments?: any[]) {
    const from = this.configService.get<string>('SMTP_FROM');

    // Create item rows for HTML table with improved styling
    const itemRows = order.items.map((item: any) => `
      <tr>
<<<<<<< HEAD
        <td style="padding: 12px; border-bottom: 1px solid #eee;">
          <div style="font-weight: bold; color: #333;">${item.product?.name || 'Unknown Product'}</div>
          <div style="font-size: 12px; color: #666;">Quantity: ${item.quantity}</div>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; color: #333;">
=======
        <td style="padding: 16px 12px; border-bottom: 1px solid #f1f5f9;">
          <div style="font-weight: 600; color: #1e293b; font-size: 15px;">${item.product.name}</div>
          <div style="font-size: 13px; color: #64748b; margin-top: 4px;">Quantity: ${item.quantity}</div>
        </td>
        <td style="padding: 16px 12px; border-bottom: 1px solid #f1f5f9; text-align: right; color: #1e293b; font-weight: 600;">
>>>>>>> 7a3f24e5908fb1c170403cd1d42cfe67da3359a1
          $${(Number(item.price) * item.quantity).toFixed(2)}
        </td>
      </tr>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
        </style>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; color: #1e293b; -webkit-font-smoothing: antialiased;">
        <div style="max-width: 600px; margin: 40px auto; padding: 0 20px;">
          <div style="background-color: #ffffff; border-radius: 24px; padding: 48px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 40px;">
              <div style="display: inline-block; padding: 12px 24px; background-color: #f1f5f9; border-radius: 12px; font-weight: 800; font-size: 24px; margin-bottom: 24px; color: #0f172a;">
                EStore<span style="color: #10b981;">.</span>
              </div>
              <h1 style="font-size: 32px; font-weight: 800; margin: 0; letter-spacing: -0.025em; color: #0f172a;">Order Confirmed!</h1>
              <p style="color: #64748b; font-size: 16px; margin-top: 12px; line-height: 1.6;">Hi ${name}, your order has been successfully placed. We're working on getting it to you!</p>
            </div>

            <!-- Order Status Badge -->
            <div style="text-align: center; margin-bottom: 40px;">
              <span style="display: inline-block; padding: 8px 16px; background-color: #ecfdf5; color: #065f46; font-size: 14px; font-weight: 700; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em;">
                ${order.status.toUpperCase()}
              </span>
            </div>

<<<<<<< HEAD
            <div style="margin-top: 24px; border-top: 2px solid #eee; pt: 16px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #666;">Subtotal</span>
                <span style="font-weight: 600;">$${Number(order.subtotal).toFixed(2)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #666;">Shipping</span>
                <span style="font-weight: 600;">$${Number(order.shippingFee).toFixed(2)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
                <span style="color: #666;">Tax</span>
                <span style="font-weight: 600;">$${Number(order.tax).toFixed(2)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding-top: 16px; border-top: 1px dashed #ddd;">
                <span style="font-size: 18px; font-weight: 800;">Total</span>
                <span style="font-size: 18px; font-weight: 800; color: #10b981;">$${Number(order.total).toFixed(2)}</span>
=======
            <!-- Order Details -->
            <div style="background-color: #f8fafc; border-radius: 20px; padding: 32px; margin-bottom: 40px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #e2e8f0;">
                <div>
                  <div style="font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px;">Order Number</div>
                  <div style="font-size: 16px; font-weight: 800; color: #0f172a;">#${order.orderNumber}</div>
                </div>
                <div style="text-align: right;">
                  <div style="font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px;">Order Date</div>
                  <div style="font-size: 16px; font-weight: 800; color: #0f172a;">${new Date(order.createdAt).toLocaleDateString()}</div>
                </div>
              </div>

              <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                <thead>
                  <tr>
                    <th style="padding: 0 12px 12px; text-align: left; font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; border-bottom: 2px solid #e2e8f0;">Items</th>
                    <th style="padding: 0 12px 12px; text-align: right; font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; border-bottom: 2px solid #e2e8f0;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemRows}
                </tbody>
              </table>

              <!-- Financial Breakdown -->
              <div style="padding-top: 16px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                  <span style="color: #64748b; font-size: 15px;">Subtotal</span>
                  <span style="font-weight: 600; font-size: 15px; color: #1e293b;">$${Number(order.subtotal).toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                  <span style="color: #64748b; font-size: 15px;">Shipping</span>
                  <span style="font-weight: 600; font-size: 15px; color: #1e293b;">$${Number(order.shippingFee).toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                  <span style="color: #64748b; font-size: 15px;">Tax</span>
                  <span style="font-weight: 600; font-size: 15px; color: #1e293b;">$${Number(order.tax).toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding-top: 20px; border-top: 2px solid #e2e8f0;">
                  <span style="font-size: 20px; font-weight: 800; color: #0f172a;">Amount Paid</span>
                  <span style="font-size: 20px; font-weight: 800; color: #10b981;">$${Number(order.total).toFixed(2)}</span>
                </div>
>>>>>>> 7a3f24e5908fb1c170403cd1d42cfe67da3359a1
              </div>
            </div>

            <!-- Shipping Information -->
            <div style="margin-bottom: 40px;">
              <h3 style="font-size: 14px; font-weight: 800; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.1em; margin-bottom: 16px;">Delivery Details</h3>
              <div style="background-color: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px;">
                <div style="font-size: 15px; line-height: 1.6; color: #475569;">
                  ${order.shippingAddress}
                </div>
              </div>
            </div>

<<<<<<< HEAD
          <!-- Tracking -->
          <div style="margin-bottom: 32px; text-align: center;">
             <p style="font-size: 14px; color: #4b5563;">
                Your Order Tracking ID is: <strong>${order.orderNumber}</strong>
             </p>
          </div>

          <!-- Footer -->
          <div style="text-align: center; border-top: 1px solid #f0f0f0; pt: 32px;">
            <p style="font-size: 12px; color: #9ca3af; margin-bottom: 16px;">
              If you have any questions, reply to this email or contact support.
            </p>
            <div style="font-size: 10px; color: #d1d5db; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700;">
              &copy; ${new Date().getFullYear()} EStore. All Rights Reserved.
=======
            <!-- Action Button -->
            <div style="text-align: center; margin-bottom: 48px;">
              <a href="${this.configService.get('FRONTEND_URL')}/account/orders" style="display: inline-block; padding: 16px 32px; background-color: #0f172a; color: #ffffff; font-weight: 700; font-size: 16px; text-decoration: none; border-radius: 12px; transition: background-color 0.2s;">
                View Your Order
              </a>
            </div>

            <!-- Footer -->
            <div style="text-align: center; border-top: 1px solid #f1f5f9; padding-top: 40px;">
              <p style="font-size: 14px; color: #94a3b8; margin-bottom: 24px;">
                Need help with your order? <a href="mailto:support@estore.com" style="color: #0f172a; font-weight: 600; text-decoration: none;">Contact Support</a>
              </p>
              <div style="font-size: 11px; color: #cbd5e1; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700;">
                &copy; ${new Date().getFullYear()} EStore. All Rights Reserved.
              </div>
>>>>>>> 7a3f24e5908fb1c170403cd1d42cfe67da3359a1
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      const info = await this.transporter.sendMail({
        from,
        to,
        subject: `Successful Purchase - Order #${order.orderNumber}`,
        html,
        attachments,
      });
      this.logger.log(`Order confirmation email sent successfully to ${to}. MessageID: ${info.messageId}`);
      return { sent: true, messageId: info.messageId };
    } catch (error) {
      this.logger.error(`Failed to send order confirmation to ${to}: ${error.message}`, error.stack);
      return { sent: false, error: error.message };
    }
  }
}