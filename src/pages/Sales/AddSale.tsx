
import { useState, useEffect } from 'react';
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
import ButtonGroupRadio from '../../components/form/ButtonGroupRadio';
import EditCustomerModal from '../../components/customer/EditCustomerModal';

import AddCustomerModal from '../../components/customer/AddCustomerModal';
import { useModal } from '../../hooks/useModal';
import { Customer, Item } from '../../types';
import { Plus, Pencil } from 'lucide-react';
import { isApiError } from '../../utils/errors';

interface SaleItem {
  item_id: string;
  quantity: number;
  unit_price: number;
  description: string;
  stock_on_hand: number;
  unit_code?: string;
}

interface ApiError {
  [key: string]: string[];
}

export default function AddSale() {
  const { isOpen: isCustomerModalOpen, openModal: openCustomerModal, closeModal: closeCustomerModal } = useModal();
  const { isOpen: isEditCustomerModalOpen, openModal: openEditCustomerModal, closeModal: closeEditCustomerModal } = useModal();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [customerId, setCustomerId] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [saleDate, setSaleDate] = useState(formatDate(new Date()));
  const [saleItems, setSaleItems] = useState<SaleItem[]>([
    { item_id: '', quantity: 1, unit_price: 0, description: '', stock_on_hand: 0, unit_code: '' }
  ]);
  const [errors, setErrors] = useState<ApiError>({});
  const navigate = useNavigate();
  const [selectKey, setSelectKey] = useState(Date.now());
  const [paymentMethod, setPaymentMethod] = useState('cash');

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

  const handleAddItem = async (itemId: string) => {
    if (!itemId) return;

    if (saleItems.some(item => item.item_id === itemId)) {
      toast.info('Item is already in the list.');
      return;
    }

    try {
      const itemDetails = await getItem(itemId);
      const newItem: SaleItem = {
        item_id: itemId,
        quantity: 1,
        unit_price: itemDetails.selling_price || 0,
        description: '',
        stock_on_hand: (itemDetails.is_expired_sale_enabled
          ? itemDetails.stock_on_hand
          : itemDetails.non_expired_stock) || 0,
        unit_code: itemDetails.unit.code,
      };

      if (saleItems.length === 1 && saleItems[0].item_id === '') {
        setSaleItems([newItem]);
      } else {
        setSaleItems(prevItems => [...prevItems, newItem]);
      }
    } catch (error) {
      console.error('Error fetching item details:', error);
      toast.error('Failed to add item.');
    }
  };

  const handleItemChange = async (index: number, field: keyof SaleItem, value: string | number) => {
    const newItems = [...saleItems];
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === 'item_id' && value) {
      // Clear previous errors for this line item
      const newErrors = { ...errors };
      Object.keys(newErrors).forEach(key => {
        if (key.startsWith(`items.${index}.`)) {
          delete newErrors[key as keyof ApiError];
        }
      });
      setErrors(newErrors);

      try {
        const itemDetails = await getItem(String(value));
        newItems[index].stock_on_hand = (itemDetails.is_expired_sale_enabled
          ? itemDetails.stock_on_hand
          : itemDetails.non_expired_stock) || 0;
        newItems[index].unit_code = itemDetails.unit.code;
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
    
    // Clear all item-related errors and reindex them
    const newErrors = { ...errors };
    Object.keys(newErrors).forEach(key => {
      if (key.startsWith('items.')) {
        delete newErrors[key as keyof ApiError];
      }
    });
    setErrors(newErrors);
    
    if (newItems.length === 0) {
      setSaleItems([{ item_id: '', quantity: 1, unit_price: 0, description: '', stock_on_hand: 0, unit_code: '' }]);
    } else {
      setSaleItems(newItems);
    }
  };

  const validateForm = () => {
    const newErrors: ApiError = {};

    if (!customerId) newErrors.customer_id = ['Customer is required.'];
    if (!invoiceNumber.trim()) newErrors.invoice_number = ['Invoice number is required.'];
    if (!saleDate) newErrors.sale_date = ['Sale date is required.'];
    if (saleItems.length === 0 || (saleItems.length === 1 && !saleItems[0].item_id)) {
      newErrors.items = ['At least one item is required.'];
    }

    saleItems.forEach((item, index) => {
      if (!item.item_id) newErrors[`items.${index}.item_id`] = ['Item is required.'];
      if (item.quantity <= 0) newErrors[`items.${index}.quantity`] = ['Quantity must be greater than 0.'];
      if (item.quantity > item.stock_on_hand) newErrors[`items.${index}.quantity`] = [`Available stock ${item.stock_on_hand}.`];
      if (item.unit_price < 0) newErrors[`items.${index}.unit_price`] = ['Unit price cannot be negative.'];
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please correct the errors');
      return;
    }

    try {
      await addSale({
        customer_id: customerId,
        invoice_number: invoiceNumber,
        sale_date: saleDate,
        payment_status: 'paid',
        payment_method: paymentMethod,
        items: saleItems.map(({ unit_code, ...item }) => item),
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

  const handleCustomerUpdated = () => {
    fetchInitialData();
    closeEditCustomerModal();
  };

  useEffect(() => {
    if (customerId) {
      const customer = customers.find(c => String(c.id) === customerId);
      setSelectedCustomer(customer || null);
    } else {
      setSelectedCustomer(null);
    }
  }, [customerId, customers]);

  return (
    <>
      <PageMeta
        title="Add Sale"
        description="Add a new sale"
      />
      <div className="px-6 py-5">
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-6">

          {/* LEFT SECTION (Items) */}
          <div className="flex-1 overflow-y-auto max-h-[80vh] pr-2">
            {/* Search bar */}
            <Select
              key={selectKey}
              options={items.map(i => ({ value: String(i.id), label: i.name }))}
              placeholder="Search and add an item..."
              onChange={(value) => {
                if (value) {
                  handleAddItem(value);
                  setSelectKey(Date.now());
                }
              }}
              className="mb-4"
            />

            {getErrorMessage('items') && (
              <p className="text-sm text-red-500 mb-4">{getErrorMessage('items')}</p>
            )}

            {/* Scrollable Item List */}
            <div className="space-y-4">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="p-2 text-left w-2/5">Item</th>
                    <th className="p-2 text-left w-1/5">Quantity</th>
                    <th className="p-2 text-left w-1/5">Unit Price</th>
                    <th className="p-2 text-left">Total</th>
                    <th className="p-2 text-left"></th>
                  </tr>
                </thead>
                <tbody>
                  {saleItems.map((item, index) => (
                    item.item_id && ( // Only render row if item_id is present
                      <tr key={index}>
                        <td className="p-2">
                          <Input
                            type="text"
                            value={items.find(i => String(i.id) === item.item_id)?.name || ''}
                            disabled
                            className="bg-gray-100 dark:bg-gray-800 text-black opacity-100"
                          />
                        </td>
                        <td className="p-2">
                          <p className={`text-xs mb-1 ${item.stock_on_hand === 0 ? 'text-red-500' :
                            item.stock_on_hand < 20 ? 'text-orange-500' : 'text-gray-500'
                            }`}>
                            Stock: {item.stock_on_hand}
                          </p>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                            error={!!getErrorMessage(`items.${index}.quantity`)}
                            hint={getErrorMessage(`items.${index}.quantity`)}
                            suffix={item.unit_code}
                          />
                        </td>
                        <td className="p-2">
                          <p className="text-xs mb-1">&nbsp;</p>
                          <Input
                            type="number"
                            value={item.unit_price}
                            onChange={(e) => handleItemChange(index, 'unit_price', Number(e.target.value))}
                            error={!!getErrorMessage(`items.${index}.unit_price`)}
                            hint={getErrorMessage(`items.${index}.unit_price`)}
                          />
                        </td>
                        <td className="p-2 text-right">
                          <p className="text-xs mb-1">&nbsp;</p>
                          <span className="font-bold">
                            {(item.quantity * item.unit_price).toFixed(2)}
                          </span>
                        </td>
                        <td className="p-2">
                          <p className="text-xs mb-1">&nbsp;</p>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="p-1 text-red-500 rounded-full hover:bg-red-100"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    )
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT SECTION (Customer + Totals + Actions) */}
          <div className="w-full md:w-1/3 flex flex-col sticky top-4 self-start space-y-12">

            {/* Customer + Invoice */}
            <div className="space-y-4">
              <div>
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
                  {selectedCustomer && (
                    <Button type="button" onClick={openEditCustomerModal} size="xs">
                      <Pencil />
                    </Button>
                  )}
                  <Button type="button" onClick={openCustomerModal} size="xs">
                    <Plus />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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

            {/* Totals */}
            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between">
                <span>Total Items:</span>
                <span className="font-bold">{saleItems.filter(i => i.item_id).length}</span>
              </div>
              <div className="flex justify-between">
                <span>Net Total:</span>
                <span className="font-bold">
                  {saleItems.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tax (0%):</span>
                <span className="font-bold">
                  {(saleItems.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0) * 0.00).toFixed(2)}
                </span>
              </div>
              {/* <div className="flex justify-between">
                <span>Discount:</span>
                <Input type="number" placeholder="0" className="w-20" />
              </div> */}
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Grand Total:</span>
                <span>
                  {(saleItems.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0) * 1.00).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Payment + Actions */}
            <div className="space-y-4">
              <Label>Payment Method</Label>
              <ButtonGroupRadio
                options={[
                  { value: 'cash', label: 'Cash' },
                  { value: 'upi', label: 'UPI' },
                  { value: 'card', label: 'Card' }
                ]}
                selectedValue={paymentMethod}
                onChange={setPaymentMethod}
              />
              <div className="flex justify-end gap-3 w-full">
                <Button type="button" variant="outline" className='w-full'>
                  Save
                </Button>
                <Button type="submit" className='w-full'>
                  Save & Print
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
      <AddCustomerModal isOpen={isCustomerModalOpen} onClose={closeCustomerModal} onCustomerAdded={handleCustomerAdded} />
      {selectedCustomer && (
        <EditCustomerModal
          isOpen={isEditCustomerModalOpen}
          onClose={closeEditCustomerModal}
          onCustomerUpdated={handleCustomerUpdated}
          customer={selectedCustomer}
        />
      )}
    </>
  );
}
