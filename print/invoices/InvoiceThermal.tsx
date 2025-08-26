import { FC } from 'react';
import { Customer, Sale, SaleItem } from '../../src/types';


interface InvoiceData {
  sale: Sale;
  customer?: Customer;
  items: SaleItem[];
}

interface InvoiceThermalProps {
  data: InvoiceData;
}

const InvoiceThermal: FC<InvoiceThermalProps> = ({ data }) => {
  const total = data.sale.total_amount || data.items.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0);

  return (
    <div style={{ width: '80mm', fontFamily: 'monospace', fontSize: '12px', padding: '10px' }}>
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <h2 style={{ margin: 0, fontSize: '16px' }}>SALE RECEIPT</h2>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <div>Invoice: {data.sale.invoice_number}</div>
        <div>Customer: {data.customer?.name || 'Walk-in'}</div>
        <div>Date: {data.sale.sale_date}</div>
      </div>

      <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '5px 0' }}>
        {data.items.map((item, index) => (
          <div key={index} style={{ marginBottom: '3px' }}>
            <div>{item.item.name}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Qty: {item.quantity} x {item.unit_price.toFixed(2)}</span>
              <span>{(item.quantity * item.unit_price).toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '10px', textAlign: 'right' }}>
        <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
          Total: {total.toFixed(2)}
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '15px', fontSize: '10px' }}>
        Thank you for your business!
      </div>
    </div>
  );
};

export default InvoiceThermal;