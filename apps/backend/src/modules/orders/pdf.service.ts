import { Injectable } from '@nestjs/common';
import PDFDocument = require('pdfkit');
import { Order } from './order.entity';

@Injectable()
export class PdfService {
    async generateInvoice(order: Order): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 50 });
            const buffers: Buffer[] = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const result = Buffer.concat(buffers);
                resolve(result);
            });
            doc.on('error', reject);

            // Header
            doc
                .fillColor('#444444')
                .fontSize(20)
                .text('INVOICE', 50, 50)
                .fontSize(10)
                .text(`Order Number: ${order.orderNumber}`, 200, 50, { align: 'right' })
                .text(`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`, 200, 65, { align: 'right' })
                .text(`Track ID: ${order.orderNumber}`, 200, 80, { align: 'right' })
                .moveDown();

            // Horizontal Line
            doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, 100).lineTo(550, 100).stroke();

            // Shipping Details
            doc
                .fontSize(12)
                .text('Shipping Address:', 50, 120)
                .fontSize(10)
                .text(order.shippingAddress || 'N/A', 50, 135)
                .moveDown();

            // Table Header
            const tableTop = 200;
            doc
                .fontSize(10)
                .font('Helvetica-Bold')
                .text('Item', 50, tableTop)
                .text('Quantity', 280, tableTop, { width: 90, align: 'right' })
                .text('Unit Price', 370, tableTop, { width: 90, align: 'right' })
                .text('Total', 480, tableTop, { width: 70, align: 'right' });

            doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

            // Table Items
            let i = 0;
            order.items.forEach((item) => {
                const y = tableTop + 30 + i * 25;
                doc
                    .font('Helvetica')
                    .text(item.product?.name || 'Unknown Product', 50, y)
                    .text(item.quantity.toString(), 280, y, { width: 90, align: 'right' })
                    .text(`$${Number(item.price).toFixed(2)}`, 370, y, { width: 90, align: 'right' })
                    .text(`$${(Number(item.price) * item.quantity).toFixed(2)}`, 480, y, { width: 70, align: 'right' });
                i++;
            });

            // Totals
            const subtotalY = tableTop + 50 + i * 25;
            doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, subtotalY - 10).lineTo(550, subtotalY - 10).stroke();

            doc
                .font('Helvetica')
                .text('Subtotal:', 370, subtotalY, { width: 90, align: 'right' })
                .text(`$${Number(order.subtotal).toFixed(2)}`, 480, subtotalY, { width: 70, align: 'right' })
                .text('Tax:', 370, subtotalY + 15, { width: 90, align: 'right' })
                .text(`$${Number(order.tax).toFixed(2)}`, 480, subtotalY + 15, { width: 70, align: 'right' })
                .text('Shipping Fee:', 370, subtotalY + 30, { width: 90, align: 'right' })
                .text(`$${Number(order.shippingFee).toFixed(2)}`, 480, subtotalY + 30, { width: 70, align: 'right' })
                .font('Helvetica-Bold')
                .fontSize(12)
                .text('Total:', 370, subtotalY + 50, { width: 90, align: 'right' })
                .text(`$${Number(order.total).toFixed(2)}`, 480, subtotalY + 50, { width: 70, align: 'right' });

            // Footer
            doc
                .fontSize(10)
                .font('Helvetica')
                .text('Thank you for your business!', 50, 700, { align: 'center', width: 500 });

            doc.end();
        });
    }
}
