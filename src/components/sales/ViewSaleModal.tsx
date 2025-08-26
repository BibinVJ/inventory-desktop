import { useState, useEffect } from 'react';
import { Sale } from '../../types';
import { getSale } from '../../services/SaleService';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../ui/table';
import Badge from '../ui/badge/Badge';
import Button from '../ui/button/Button';
import { Printer } from 'lucide-react';

interface ViewSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  saleId: number;
}

export default function ViewSaleModal({ isOpen, onClose, saleId }: ViewSaleModalProps) {
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSaleDetails = async () => {
      setLoading(true);
      try {
        const response = await getSale(String(saleId));
        setSale(response.data);
      } catch (error) {
        console.error('Error fetching sale details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && saleId) {
      fetchSaleDetails();
    }
  }, [isOpen, saleId]);



  const handlePrint = (sale: Sale) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>Sale Receipt</title></head>
          <body>
            <h2>Sale Receipt</h2>
            <p>Invoice: ${sale.invoice_number}</p>
            <p>Customer: ${sale.customer?.name}</p>
            <p>Date: ${sale.sale_date}</p>
            <hr>
            ${sale.items?.map((item: any) => 
              `<p>${item.item?.name || item.name} - Qty: ${item.quantity} - Price: ${item.unit_price} - Total: ${(item.quantity * item.unit_price).toFixed(2)}</p>`
            ).join('') || ''}
            <hr>
            <p><strong>Grand Total: ${sale.total_amount}</strong></p>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
      printWindow.close();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            {sale ? `Sale #${sale.invoice_number}` : 'Sale Details'}
          </h2>
          <div className="flex items-center gap-2">
            {sale && (
              <Button
                size="sm"
                onClick={() => handlePrint(sale)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : sale ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2 dark:text-gray-400">Customer Details</h3>
                    <p className="dark:text-gray-400">Name: <strong>{sale.customer.name}</strong></p>
                    <p className="dark:text-gray-400">Email: <strong>{sale.customer.email}</strong></p>
                    <p className="dark:text-gray-400">Phone: <strong>{sale.customer.phone}</strong></p>
                    <p className="dark:text-gray-400">Address: <strong>{sale.customer.address}</strong></p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 dark:text-gray-400">Sale Details</h3>
                    <p className="dark:text-gray-400">Invoice #: <strong>{sale.invoice_number}</strong></p>
                    <p className="dark:text-gray-400">Sale Date: <strong>{sale.sale_date}</strong></p>
                    <p className="dark:text-gray-400">Status: <strong>
                      <Badge size="sm" color={sale.status === 'completed' ? 'success' : (sale.status === 'voided' ? 'error' : 'primary')}>
                        {sale.status}
                      </Badge>
                    </strong></p>
                    <p className="dark:text-gray-400">Payment Method: <strong>{sale.payment_method}</strong></p>
                    <p className="dark:text-gray-400">Note: <strong>{sale.note}</strong></p>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="max-w-full overflow-x-auto">
                  <Table>
                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                      <TableRow>
                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Item</TableCell>
                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">Quantity</TableCell>
                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">Unit Price</TableCell>
                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">Total Price</TableCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                      {sale.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="px-5 py-4 text-gray-800 text-start text-theme-sm dark:text-gray-400">{item.item.name}</TableCell>
                          <TableCell className="px-5 py-4 text-gray-800 text-end text-theme-sm dark:text-gray-400">{item.quantity}</TableCell>
                          <TableCell className="px-5 py-4 text-gray-800 text-end text-theme-sm dark:text-gray-400">{item.unit_price}</TableCell>
                          <TableCell className="px-5 py-4 text-gray-800 text-end text-theme-sm dark:text-gray-400">{item.quantity * item.unit_price}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <tfoot className="border-t border-gray-100 dark:border-white/[0.05]">
                      <TableRow className="font-semibold">
                        <TableCell colSpan={3} className="px-5 py-4 text-end text-gray-800 dark:text-white/90">Total Amount:</TableCell>
                        <TableCell className="px-5 py-4 text-end text-gray-800 dark:text-white/90">{sale.total_amount}</TableCell>
                      </TableRow>
                    </tfoot>
                  </Table>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">Sale not found</div>
          )}
        </div>
      </div>
    </div>
  );
}