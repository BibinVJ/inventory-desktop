import { renderToString } from 'react-dom/server';
import { createElement } from 'react';

export const printComponent = (component: React.ComponentType<any>, props: any, filename?: string) => {
  const html = renderToString(createElement(component, props));
  const documentTitle = filename || 'Print';
  
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>${documentTitle}</title>
          <meta name="filename" content="${documentTitle}.pdf">
          <style>
            body { margin: 0; padding: 0; }
            @media print {
              body { -webkit-print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `);
    printWindow.document.close();
    
    // Set the document title after content is loaded
    printWindow.document.title = documentTitle;
    
    printWindow.print();
    printWindow.close();
  }
};