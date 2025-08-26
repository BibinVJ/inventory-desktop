import { FC } from 'react';
import { Customer, Sale, SaleItem } from '../../src/types';


interface InvoiceData {
  sale: Sale;
  customer?: Customer;
  items: SaleItem[];
}

interface InvoiceA4Props {
  data: InvoiceData;
}

const InvoiceA4: FC<InvoiceA4Props> = ({ data }) => {
  const total = data.sale.total_amount || data.items.reduce((acc, item) => acc + (item.quantity * Number(item.unit_price)), 0);

  return (
    <div style={{ width: '210mm', minHeight: '297mm', padding: '20mm', fontFamily: 'Arial, sans-serif', fontSize: '12px' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>INVOICE</h1>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
        <div>
          <div><strong>Invoice Number:</strong> {data.sale.invoice_number}</div>
          <div><strong>Date:</strong> {data.sale.sale_date}</div>
        </div>
        <div>
          <div><strong>Customer Name:</strong> {data.customer?.name || 'Walk-in Customer'}</div>
          <div><strong>Email:</strong> {data.customer?.email || ''}</div>
          <div><strong>Phone:</strong> {data.customer?.phone || ''}</div>
          <div><strong>Address:</strong> {data.customer?.address || ''}</div>


        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f5f5f5' }}>
            <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Item</th>
            <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center' }}>Quantity</th>
            <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'right' }}>Unit Price</th>
            <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'right' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, index) => (
            <tr key={index}>
              <td style={{ border: '1px solid #ddd', padding: '10px' }}>{item.item.name}</td>
              <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center' }}>{item.quantity}</td>
              <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'right' }}>{Number(item.unit_price).toFixed(2)}</td>
              <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'right' }}>{(item.quantity * Number(item.unit_price)).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ textAlign: 'right', marginTop: '20px' }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold', padding: '10px', backgroundColor: '#f5f5f5', border: '1px solid #ddd' }}>
          Grand Total: {total.toFixed(2)}
        </div>
      </div>

      <div style={{ marginTop: '40px', textAlign: 'center', fontSize: '10px', color: '#666' }}>
        Thank you for your business!
      </div>
    </div>
  );
};

export default InvoiceA4;