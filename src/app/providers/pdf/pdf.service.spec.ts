import { Injectable } from '@angular/core';
// import * as jsPDF from 'jspdf';
import { jsPDF } from 'jspdf';

@Injectable({
  providedIn: 'root'
})
export class PdfGeneratorService {
  generatePDF(tableHtml: string, fileName: string): void {
    const doc = new jsPDF();
    doc.text('Report Table', 10, 10);
    doc.html(tableHtml);
    doc.save(`${fileName}.pdf`);
  }
}
