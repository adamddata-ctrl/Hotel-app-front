import { Injectable } from '@angular/core';

export interface PrintReceiptPayload {
  orderId: number;
  waiterName: string;
  items: Array<{ itemName: string; quantity: number; price: number }>;
  tenantName: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReceiptPrinterService {

  constructor() { }

  /**    * Translates incoming checkout records into clean monospace columns with 0% tax math blocks.
   */
  generateThermalSlipMarkup(data: PrintReceiptPayload): string {
    const separatorLine = '------------------------------------------\n';
    const doubleLine    = '==========================================\n';
    
    let subtotalAccumulator = 0;
    let receiptBodyText = '';

    // 1. Compile Header Branding Text Elements Layout
    receiptBodyText += doubleLine;
    receiptBodyText += `      ${data.tenantName.toUpperCase()} POS SYSTEM\n`;
    receiptBodyText += `         REGISTER BILL RECEIPT SLIP\n`;
    receiptBodyText += doubleLine;
    receiptBodyText += `TICKET INDEX: #${data.orderId}\n`;
    receiptBodyText += `SERVED BY:   ${data.waiterName}\n`;
    receiptBodyText += `TIMESTAMP:   ${new Date().toLocaleString()}\n`;
    receiptBodyText += separatorLine;

     receiptBodyText += `QTY  ITEM DESCRIPTION          UNIT    TOTAL\n`;
    receiptBodyText += separatorLine;

    // 2. Loop Through Item Matrices and Align Fixed-Width Layout Blocks
    data.items.forEach(item => {
      const lineTotal = item.quantity * item.price;
      subtotalAccumulator += lineTotal;

      const shortName = item.itemName.substring(0, 20).padEnd(21, ' ');
      const qtyText   = item.quantity.toString().padEnd(4, ' ');
      const priceText = `$${item.price.toFixed(2)}`.padEnd(7, ' ');
      const totalText = `$${lineTotal.toFixed(2)}`;

      receiptBodyText += `${qtyText}${shortName}${priceText}${totalText}\n`;
    });

    // 3. Compile Bottom Balancing Summary Blocks (Tax-Free) 

     receiptBodyText += separatorLine;
    receiptBodyText += `CONSOLIDATED BILL TOTAL:       $${subtotalAccumulator.toFixed(2)}\n`;
    receiptBodyText += doubleLine;
    receiptBodyText += `    THANK YOU FOR DINING WITH US OVER FLUIDS!\n`;
    receiptBodyText += '==========================================\n';

    return receiptBodyText;
  }

  /**
   * Spawns an isolated printer sandbox frame to dispatch text data directly to devices.
   */
  dispatchToHardwareSpooler(rawTextSlip: string): void {
    const printFrameWindow = window.open('', '_blank', 'width=400,height=600');
    if (!printFrameWindow) {
      alert('Printer layout blocked by browser popup protection! Allow popups to enable receipt printing.');
      return;
      }

    printFrameWindow.document.write(`
      <html>
        <head>
          <title>Receipt Handout Printer Spoof Canvas</title>
          <style>
            body {
              font-family: 'Courier New', Courier, monospace;
              font-size: 13px;
              white-space: pre;
              background-color: #ffffff;
              color: #000000;
              margin: 10px;
              padding: 0;
            }
          </style>
            </head>
        <body>${rawTextSlip}</body>
      </html>
    `);

    printFrameWindow.document.close();
    printFrameWindow.focus();
    
    setTimeout(() => {
      printFrameWindow.print();
      printFrameWindow.close();
    }, 250);
  }
}