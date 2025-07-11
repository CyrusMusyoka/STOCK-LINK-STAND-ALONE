const fs = require('fs');
const path = require('path');
const { print } = require('pdf-to-printer');
const { generateReceiptPDF } = require('./receipt');

const printReceipt = async ({ saleId, items, total, paymentMethod, storeInfo, userName }) => {
  try {
    // Generate the PDF buffer using the receipt generator function
    const pdfBuffer = await generateReceiptPDF({ saleId, items, total, paymentMethod, storeInfo, userName });
    
    // Define a temporary file path (using the current directory)
    const tempFilePath = path.join(__dirname, `receipt-${saleId}.pdf`);
    
    // Write the generated PDF buffer to a temporary file
    fs.writeFileSync(tempFilePath, pdfBuffer);
    
    // Send the temporary PDF to the printer
    await print(tempFilePath, {
      // If you want to specify a printer, uncomment and replace 'Your Printer Name':
      // printer: 'Your Printer Name',
      
      // Ensure the print dialog is not shown by specifying 'silent: true'
      silent: true
    });
    
    // Delete the temporary file after printing
    fs.unlinkSync(tempFilePath);
    
    // Return the PDF buffer (useful for further processing or storage)
    return pdfBuffer;
  } catch (error) {
    console.error("Printing error:", error);
    throw error; // Rethrow to ensure proper error handling
  }
};

module.exports = { printReceipt };
