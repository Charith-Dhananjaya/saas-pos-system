import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogFooter } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Printer, Loader2, AlertCircle } from 'lucide-react';
import { orderAPI } from '../lib/api';
import { format } from 'date-fns';

export function ReceiptModal({ orderId, open, onClose }) {
    const [receipt, setReceipt] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const printRef = useRef();

    useEffect(() => {
        if (open && orderId) {
            fetchReceipt();
        } else {
            setReceipt(null);
            setError(null);
        }
    }, [open, orderId]);

    const fetchReceipt = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await orderAPI.getReceipt(orderId);
            setReceipt(response.data);
        } catch (err) {
            console.error('Error fetching receipt:', err);
            setError('Failed to load receipt details.');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto print:shadow-none print:border-none print:p-0 bg-white">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                        <p className="text-sm text-muted-foreground">Loading receipt...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center p-8 text-red-500">
                        <AlertCircle className="h-8 w-8 mb-2" />
                        <p className="text-sm">{error}</p>
                        <Button variant="outline" size="sm" onClick={fetchReceipt} className="mt-4">
                            Retry
                        </Button>
                    </div>
                ) : receipt ? (
                    <div className="receipt-container" ref={printRef}>
                        <div className="p-6 font-mono text-sm print:p-0">
                            {/* Store Header */}
                            <div className="text-center border-b border-dashed border-gray-300 pb-4 mb-4">
                                <h2 className="text-xl font-bold uppercase">{receipt.storeName}</h2>
                                {receipt.storeAddress && <p className="text-xs text-gray-600 mt-1">{receipt.storeAddress}</p>}
                                {receipt.storePhone && <p className="text-xs text-gray-600">Tel: {receipt.storePhone}</p>}
                            </div>

                            {/* Order Info */}
                            <div className="mb-4 text-xs space-y-1">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Order ID:</span>
                                    <span className="font-bold">{receipt.receiptNumber || receipt.orderId}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Date:</span>
                                    <span>{receipt.orderDate && format(new Date(receipt.orderDate), 'dd/MM/yyyy HH:mm')}</span>
                                </div>
                                {receipt.cashierName && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Cashier:</span>
                                        <span>{receipt.cashierName}</span>
                                    </div>
                                )}
                                {receipt.customerName && (
                                    <div className="flex justify-between border-t border-dashed border-gray-200 pt-1 mt-1">
                                        <span className="text-gray-600">Customer:</span>
                                        <span>{receipt.customerName}</span>
                                    </div>
                                )}
                            </div>

                            {/* Items Table */}
                            <div className="border-t border-b border-dashed border-gray-300 py-3 mb-4">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="text-gray-600 border-b border-gray-200">
                                            <th className="text-left py-1">Item</th>
                                            <th className="text-center py-1">Qty</th>
                                            <th className="text-right py-1">Price</th>
                                            <th className="text-right py-1">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {receipt.items.map((item, idx) => (
                                            <tr key={idx} className="align-top">
                                                <td className="py-2 pr-2">
                                                    <div className="font-medium">{item.productName}</div>
                                                    {item.productSku && <div className="text-[10px] text-gray-500">{item.productSku}</div>}
                                                    {item.discountAmount > 0 && (
                                                        <div className="text-[10px] text-emerald-600 italic">
                                                            -{item.discountPercentage}% (${item.discountAmount.toFixed(2)})
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="text-center py-2">{item.quantity}</td>
                                                <td className="text-right py-2">
                                                    {item.discountAmount > 0 ? (
                                                        <>
                                                            <div className="line-through text-gray-400 text-[10px]">${item.originalPrice.toFixed(2)}</div>
                                                            <div>${item.finalPrice.toFixed(2)}</div>
                                                        </>
                                                    ) : (
                                                        <div>${item.finalPrice.toFixed(2)}</div>
                                                    )}
                                                </td>
                                                <td className="text-right py-2 font-medium">${item.lineTotal.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Totals */}
                            <div className="space-y-1 text-xs">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal:</span>
                                    <span>${receipt.subtotal?.toFixed(2) || '0.00'}</span>
                                </div>

                                {receipt.totalDiscount > 0 && (
                                    <div className="flex justify-between text-emerald-600 font-medium">
                                        <span>Total Discount:</span>
                                        <span>-${receipt.totalDiscount.toFixed(2)}</span>
                                    </div>
                                )}

                                <div className="flex justify-between font-bold text-lg border-t border-dashed border-gray-300 pt-2 mt-2">
                                    <span>TOTAL:</span>
                                    <span>${receipt.totalAmount?.toFixed(2) || '0.00'}</span>
                                </div>

                                <div className="flex justify-between mt-4 pt-2 border-t border-gray-100">
                                    <span className="text-gray-600">Payment Method:</span>
                                    <span className="font-bold uppercase">{receipt.paymentType}</span>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="text-center mt-8 pt-4 border-t border-dashed border-gray-300 text-xs text-gray-500">
                                <p className="font-medium mb-1">Thank you for your purchase!</p>
                                <p>Please visit us again.</p>
                                <div className="mt-4 text-[10px] text-gray-400">
                                    {receipt.receiptNumber}
                                </div>
                            </div>
                        </div>

                        {/* Print Styles */}
                        <style jsx global>{`
              @media print {
                body * {
                  visibility: hidden;
                }
                .receipt-container, .receipt-container * {
                  visibility: visible;
                }
                .receipt-container {
                  position: absolute;
                  left: 0;
                  top: 0;
                  width: 80mm; /* Standard receipt width */
                  padding: 10px;
                }
                @page {
                    size: auto;
                    margin: 0;
                }
              }
            `}</style>
                    </div>
                ) : null}

                <DialogFooter className="print:hidden sm:justify-between px-6 pb-6">
                    <Button variant="outline" onClick={onClose}>Close</Button>
                    {receipt && (
                        <Button onClick={handlePrint}>
                            <Printer className="mr-2 h-4 w-4" /> Print Receipt
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
