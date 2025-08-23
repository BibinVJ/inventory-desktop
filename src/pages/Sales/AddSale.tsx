
import { useState, useEffect } from 'react';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import ComponentCard from '../../components/common/ComponentCard';
import PageMeta from '../../components/common/PageMeta';
import Button from '../../components/ui/button/Button';
import Select from '../../components/form/Select';
import Input from '../../components/form/input/InputField';
import Label from '../../components/form/Label';
import { useNavigate } from 'react-router';
import DatePicker from '../../components/form/date-picker';
import { formatDate } from '../../utils/date';
import { toast } from 'sonner';
import TextArea from '../../components/form/input/TextArea';
import { getCustomers } from '../../services/CustomerService';
import { getItems, getItem } from '../../services/ItemService';
import { getNextInvoiceNumber, addSale } from '../../services/SaleService';

import AddCustomerModal from '../../components/customer/AddCustomerModal';
import { useModal } from '../../hooks/useModal';
import { Customer, Item } from '../../types';
import { Plus } from 'lucide-react';
import { isApiError } from '../../utils/errors';

interface SaleItem {
  item_id: string;
  quantity: number;
  unit_price: number;
  description: string;
  stock_on_hand: number;
}

interface ApiError {
  [key: string]: string[];
}

export default function AddSale() {
  const { isOpen: isCustomerModalOpen, openModal: openCustomerModal, closeModal: closeCustomerModal } = useModal();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [customerId, setCustomerId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [saleDate, setSaleDate] = useState(formatDate(new Date()));
  const [saleItems, setSaleItems] = useState<SaleItem[]>([
    { item_id: '', quantity: 1, unit_price: 0, description: '', stock_on_hand: 0 }
  ]);
  const [errors, setErrors] = useState<ApiError>({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [customerResponse, itemResponse, invoiceResponse] = await Promise.all([
        getCustomers(1, 10, 'created_at', 'desc', true),
        getItems(1, 10, 'created_at', 'desc', true),
        getNextInvoiceNumber()
      ]);
      setCustomers(customerResponse.data || customerResponse);
      setItems(itemResponse.data || itemResponse);
      if (invoiceResponse) {
        setInvoiceNumber(invoiceResponse.data.invoice_number);
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  const handleAddItem = () => {
    setSaleItems([...saleItems, { item_id: '', quantity: 1, unit_price: 0, description: '', stock_on_hand: 0 }]);
  };

  const handleItemChange = async (index: number, field: keyof SaleItem, value: string | number) => {
    const newItems = [...saleItems];
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === 'item_id' && value) {
      try {
        const itemDetails = await getItem(String(value));
        newItems[index].stock_on_hand = (itemDetails.is_expired_sale_enabled
          ? itemDetails.stock_on_hand
          : itemDetails.non_expired_stock) || 0;
      } catch (error) {
        console.error('Error fetching item details:', error);
        newItems[index].stock_on_hand = 0;
      }
    }

    setSaleItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...saleItems];
    newItems.splice(index, 1);
    setSaleItems(newItems);
  };

  const validateForm = () => {
    const newErrors: ApiError = {};

    if (!customerId) newErrors.customer_id = ['Customer is required.'];
    if (!invoiceNumber.trim()) newErrors.invoice_number = ['Invoice number is required.'];
    if (!saleDate) newErrors.sale_date = ['Sale date is required.'];
    if (saleItems.length === 0) newErrors.items = ['At least one item is required.'];

    saleItems.forEach((item, index) => {
      if (!item.item_id) newErrors[`items.${index}.item_id`] = ['Item is required.'];
      if (item.quantity <= 0) newErrors[`items.${index}.quantity`] = ['Quantity must be greater than 0.'];
      if (item.quantity > item.stock_on_hand) newErrors[`items.${index}.quantity`] = [`Quantity cannot exceed available stock of ${item.stock_on_hand}.`];
      if (item.unit_price < 0) newErrors[`items.${index}.unit_price`] = ['Unit price cannot be negative.'];
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please correct the errors in the form');
      return;
    }

    try {
      await addSale({
        customer_id: customerId,
        invoice_number: invoiceNumber,
        sale_date: saleDate,
        items: saleItems.map(({ ...item }) => item),
      });
      toast.success('Sale created successfully');
      navigate('/sales');
    } catch (error: unknown) {
      if (isApiError(error) && error.response?.status === 422) {
        setErrors(error.response.data.errors || {});
        toast.error('Please correct the errors in the form');
      } else {
        console.error('Error creating sale:', error);
        toast.error('Failed to create sale');
      }
    }
  };

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const getErrorMessage = (field: string) => errors[field]?.[0] || '';

  const handleCustomerAdded = (newCustomer: Customer) => {
    setCustomers(prev => [...prev, newCustomer]);
    setCustomerId(String(newCustomer.id));
    closeCustomerModal();
  };

  return (
    <>
      <PageMeta
        title="Add Sale"
        description="Add a new sale"
      />
      <ComponentCard>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            <div className="md:col-span-2">
              <Label>Customer</Label>
              <div className="flex items-center gap-2">
                <Select
                  options={customers.map(c => ({ value: String(c.id), label: c.name }))}
                  onChange={(value) => { setCustomerId(value); clearError('customer_id'); }}
                  defaultValue={customerId}
                  placeholder="Select a customer"
                  error={!!getErrorMessage('customer_id')}
                  hint={getErrorMessage('customer_id')}
                  className="flex-grow"
                />
                <Select
                  options={[
                    { value: 'walk-in', label: 'Walk In' },
                  ]}
                  defaultValue="walk-in"
                  placeholder=""
                  searchable={false}
                  onChange={(val) => console.log("Selected:", val)}
                />
                <Button type="button" onClick={openCustomerModal} className="p-1" size='xs'>
                  <Plus></Plus>
                </Button>
              </div>
            </div>
            <div>
              <Label>Invoice Number</Label>
              <Input
                type="text"
                value={invoiceNumber}
                onChange={(e) => { setInvoiceNumber(e.target.value); clearError('invoice_number'); }}
                error={!!getErrorMessage('invoice_number')}
                hint={getErrorMessage('invoice_number')}
              />
            </div>
            <div>
              <DatePicker
                id="sale_date"
                label="Sale Date"
                onChange={(_, dateStr) => { setSaleDate(dateStr); clearError('sale_date'); }}
                defaultDate={saleDate}
                error={!!getErrorMessage('sale_date')}
                hint={getErrorMessage('sale_date')}
              />
            </div>
          </div>

          {/* Items Section */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold dark:text-gray-400 mb-4">Items</h3>

            {/* Search bar to add items */}
            <Select
              options={items.map(i => ({ value: String(i.id), label: i.name }))}
              placeholder="Search and add an item..."
              onChange={(value) => {
                if (!saleItems.some(item => item.item_id === value)) {
                  setSaleItems([
                    ...saleItems,
                    { item_id: value, quantity: 1, unit_price: 0, description: '', stock_on_hand: 0 }
                  ]);
                }
              }}
              className="mb-4"
            />

            {getErrorMessage('items') && <p className="text-sm text-red-500 mb-4">{getErrorMessage('items')}</p>}

            {/* List of items */}
            {saleItems.map((item, index) => (
              <div key={index} className="relative p-4 mb-4 border rounded-lg">
                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  className="absolute p-1 text-red-500 bg-red-100 rounded-full -top-2 -right-2 hover:bg-red-300"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                  <div className="md:col-span-2">
                    <Label>Item</Label>
                    <Input
                      type="text"
                      value={items.find(i => String(i.id) === item.item_id)?.name || ''}
                      disabled
                      className="bg-gray-100 dark:bg-gray-800"
                    />
                  </div>
                  <div>
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                      error={!!getErrorMessage(`items.${index}.quantity`)}
                      hint={getErrorMessage(`items.${index}.quantity`)}
                    />
                  </div>
                  <div>
                    <Label>Unit Price</Label>
                    <Input
                      type="number"
                      value={item.unit_price}
                      onChange={(e) => handleItemChange(index, 'unit_price', Number(e.target.value))}
                      error={!!getErrorMessage(`items.${index}.unit_price`)}
                      hint={getErrorMessage(`items.${index}.unit_price`)}
                    />
                  </div>
                  <div className="flex flex-col justify-end">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold">
                      {(item.quantity * item.unit_price).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Bottom Section with Totals + Payment + Actions */}
            <div className="flex flex-col md:flex-row justify-between mt-8 border-t pt-6">

              {/* Totals Section (Left) */}
              <div className="space-y-3 w-full md:w-1/2">
                <div className="flex justify-between">
                  <span className="font-semibold dark:text-gray-400">Total Items:</span>
                  <span className="font-bold dark:text-white">{saleItems.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold dark:text-gray-400">Net Total:</span>
                  <span className="font-bold dark:text-white">
                    {saleItems.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold dark:text-gray-400">Tax (5%):</span>
                  <span className="font-bold dark:text-white">
                    {(saleItems.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0) * 0.05).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold dark:text-gray-400">Discount:</span>
                  <Input
                    type="number"
                    placeholder="0"
                    className="w-24"
                    onChange={(e) => console.log("Discount applied:", e.target.value)}
                  />
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span className="dark:text-gray-200">Grand Total:</span>
                  <span className="dark:text-white">
                    {(saleItems.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0) * 1.05).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Payment & Actions (Right) */}
              <div className="flex flex-col w-full md:w-1/3 space-y-4 mt-6 md:mt-0">
                <Label>Payment Method</Label>
                <Select
                  options={[
                    { value: 'cash', label: 'Cash' },
                    { value: 'upi', label: 'UPI' },
                    { value: 'card', label: 'Card' }
                  ]}
                  onChange={(val) => console.log("Selected:", val)}
                  placeholder="Select payment method"
                />

                <div className="flex justify-end gap-3 mt-4">
                  <Button type="button" variant="outline">
                    Save
                  </Button>
                  <Button type="submit">
                    Save & Print
                  </Button>
                </div>
              </div>
            </div>

          </div>

        </form>
      </ComponentCard>
      <AddCustomerModal isOpen={isCustomerModalOpen} onClose={closeCustomerModal} onCustomerAdded={handleCustomerAdded} />
    </>
  );
}
