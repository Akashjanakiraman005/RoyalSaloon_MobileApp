import { useState } from "react";
import {
  Plus,
  Trash2,
  Send,
  Download,
  Mail,
  MessageCircle,
  Smartphone,
  X,
  Check,
} from "lucide-react";

const services = [
  { id: 1, name: "Hair Cut & Styling", price: 120 },
  { id: 2, name: "Hair Coloring", price: 280 },
  { id: 3, name: "Spa Treatment", price: 350 },
  { id: 4, name: "Manicure & Pedicure", price: 80 },
  { id: 5, name: "Facial Treatment", price: 150 },
  { id: 6, name: "Hair Straightening", price: 200 },
];

const products = [
  { id: 1, name: "Moisturizing Shampoo", price: 24.99 },
  { id: 2, name: "Keratin Treatment Serum", price: 89.99 },
  { id: 3, name: "Nail Polish - Rose Gold", price: 12.99 },
  { id: 4, name: "Hair Styling Gel", price: 19.99 },
];

interface BillItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  type: "service" | "product";
}

export default function Billing() {
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(8);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [showInvoice, setShowInvoice] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareMethod, setShareMethod] = useState<"email" | "whatsapp" | "sms">(
    "email"
  );
  const [shareContact, setShareContact] = useState("");
  const [shareSent, setShareSent] = useState(false);

  const addItem = (item: any, type: "service" | "product") => {
    const existing = billItems.find(
      (bi) => bi.id === item.id && bi.type === type
    );
    if (existing) {
      setBillItems(
        billItems.map((bi) =>
          bi.id === item.id && bi.type === type
            ? { ...bi, quantity: bi.quantity + 1 }
            : bi
        )
      );
    } else {
      setBillItems([
        ...billItems,
        { ...item, quantity: 1, type },
      ]);
    }
  };

  const removeItem = (id: number, type: "service" | "product") => {
    setBillItems(billItems.filter((item) => !(item.id === id && item.type === type)));
  };

  const updateQuantity = (id: number, type: "service" | "product", quantity: number) => {
    if (quantity <= 0) {
      removeItem(id, type);
    } else {
      setBillItems(
        billItems.map((item) =>
          item.id === id && item.type === type ? { ...item, quantity } : item
        )
      );
    }
  };

  const subtotal = billItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const discountAmount = (subtotal * discount) / 100;
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = (taxableAmount * taxRate) / 100;
  const total = taxableAmount + taxAmount;

  const generateInvoice = () => {
    setShowInvoice(true);
  };

  const handleShare = () => {
    setShareSent(true);
    setTimeout(() => {
      setShareSent(false);
      setShowShareModal(false);
      setShareContact("");
    }, 2000);
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-[#8b6f47] mb-1">
          Billing System
        </h2>
        <p className="text-sm text-[#9a9a9a]">
          Create bills and generate invoices
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Services & Products */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-white rounded-2xl p-6 border border-[#f0ebe3]">
            <h3 className="font-semibold text-[#8b6f47] mb-4">Services</h3>
            <div className="space-y-2">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => addItem(service, "service")}
                  className="w-full flex items-center justify-between p-3 bg-[#faf8f5] hover:bg-gradient-to-r hover:from-[#f5d5d8] hover:to-[#f8e4d9] rounded-lg transition-all group"
                >
                  <span className="text-sm text-[#8b6f47]">{service.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#8b6f47]">
                      ${service.price}
                    </span>
                    <Plus size={16} className="text-[#d4a574] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[#f0ebe3]">
            <h3 className="font-semibold text-[#8b6f47] mb-4">Products</h3>
            <div className="space-y-2">
              {products.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addItem(product, "product")}
                  className="w-full flex items-center justify-between p-3 bg-[#faf8f5] hover:bg-gradient-to-r hover:from-[#e8d5f5] hover:to-[#f5e8fa] rounded-lg transition-all group"
                >
                  <span className="text-sm text-[#8b6f47]">{product.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#8b6f47]">
                      ${product.price}
                    </span>
                    <Plus size={16} className="text-[#b084cc] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bill */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-[#f0ebe3]">
          <h3 className="font-semibold text-[#8b6f47] mb-4">Current Bill</h3>

          {billItems.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-[#faf8f5] flex items-center justify-center mx-auto mb-4">
                <Plus size={32} className="text-[#9a9a9a]" />
              </div>
              <p className="text-[#9a9a9a]">
                Add services or products to start billing
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3 mb-6">
                {billItems.map((item) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#faf8f5] rounded-xl"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-[#8b6f47]">
                        {item.name}
                      </div>
                      <div className="text-xs text-[#9a9a9a] mt-1">
                        {item.type === "service" ? "Service" : "Product"}
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-[#f0ebe3]">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.type, item.quantity - 1)
                          }
                          className="w-6 h-6 rounded bg-white border border-[#f0ebe3] flex items-center justify-center text-[#8b6f47] hover:bg-[#f5d5d8] transition-colors"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-[#8b6f47]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.type, item.quantity + 1)
                          }
                          className="w-6 h-6 rounded bg-white border border-[#f0ebe3] flex items-center justify-center text-[#8b6f47] hover:bg-[#f5d5d8] transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <div className="w-20 sm:w-24 text-right font-semibold text-[#8b6f47]">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                      <button
                        onClick={() => removeItem(item.id, item.type)}
                        className="p-2 hover:bg-white rounded-lg transition-colors"
                      >
                        <Trash2 size={16} className="text-[#d9534f]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Calculations */}
              <div className="border-t border-[#f0ebe3] pt-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#8b6f47] mb-2">
                      Discount (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={discount}
                      onChange={(e) =>
                        setDiscount(Math.max(0, Math.min(100, Number(e.target.value))))
                      }
                      className="w-full px-4 py-2 bg-[#faf8f5] border border-[#f0ebe3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d4a574]/30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#8b6f47] mb-2">
                      Tax (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={taxRate}
                      onChange={(e) => setTaxRate(Number(e.target.value))}
                      className="w-full px-4 py-2 bg-[#faf8f5] border border-[#f0ebe3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d4a574]/30"
                    />
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-[#9a9a9a]">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-[#d9534f]">
                      <span>Discount ({discount}%)</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#9a9a9a]">
                    <span>Tax ({taxRate}%)</span>
                    <span>${taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-semibold text-[#8b6f47] pt-2 border-t border-[#f0ebe3]">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-[#8b6f47] mb-3">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {["cash", "upi", "card"].map((method) => (
                      <button
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          paymentMethod === method
                            ? "border-[#d4a574] bg-gradient-to-r from-[#f5d5d8] to-[#f8e4d9]"
                            : "border-[#f0ebe3] bg-[#faf8f5] hover:border-[#d4a574]/30"
                        }`}
                      >
                        <span className="text-sm font-medium text-[#8b6f47] capitalize">
                          {method}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={generateInvoice}
                  className="w-full py-3 bg-gradient-to-r from-[#d4a574] to-[#8b6f47] text-white rounded-xl hover:shadow-lg transition-shadow font-medium"
                >
                  Generate Invoice
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Invoice Modal */}
      {showInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-8">
          <div className="bg-white rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-[#8b6f47]">Invoice</h3>
              <button
                onClick={() => setShowInvoice(false)}
                className="p-2 hover:bg-[#faf8f5] rounded-lg transition-colors"
              >
                <X size={20} className="text-[#9a9a9a]" />
              </button>
            </div>

            {/* Invoice Content */}
            <div className="mb-8">
              <div className="flex justify-between items-start mb-8 pb-6 border-b border-[#f0ebe3]">
                <div>
                  <h1 className="text-3xl font-bold text-[#8b6f47] mb-2">
                    Salon<span className="text-[#d4a574]">Elite</span>
                  </h1>
                  <p className="text-sm text-[#9a9a9a]">
                    123 Beauty Street, Suite 100
                    <br />
                    New York, NY 10001
                    <br />
                    Phone: (555) 123-4567
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-[#9a9a9a] mb-1">Invoice #</div>
                  <div className="text-lg font-semibold text-[#8b6f47]">
                    INV-2026-{Math.floor(Math.random() * 10000)}
                  </div>
                  <div className="text-sm text-[#9a9a9a] mt-2">
                    {new Date().toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Items */}
              <table className="w-full mb-6">
                <thead>
                  <tr className="border-b border-[#f0ebe3]">
                    <th className="text-left py-3 text-sm font-semibold text-[#8b6f47]">
                      Item
                    </th>
                    <th className="text-center py-3 text-sm font-semibold text-[#8b6f47]">
                      Qty
                    </th>
                    <th className="text-right py-3 text-sm font-semibold text-[#8b6f47]">
                      Price
                    </th>
                    <th className="text-right py-3 text-sm font-semibold text-[#8b6f47]">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {billItems.map((item, index) => (
                    <tr key={index} className="border-b border-[#f0ebe3]">
                      <td className="py-3 text-[#8b6f47]">{item.name}</td>
                      <td className="py-3 text-center text-[#9a9a9a]">
                        {item.quantity}
                      </td>
                      <td className="py-3 text-right text-[#9a9a9a]">
                        ${item.price.toFixed(2)}
                      </td>
                      <td className="py-3 text-right font-semibold text-[#8b6f47]">
                        ${(item.price * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm text-[#9a9a9a]">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-[#d9534f]">
                      <span>Discount ({discount}%)</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-[#9a9a9a]">
                    <span>Tax ({taxRate}%)</span>
                    <span>${taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-[#8b6f47] pt-3 border-t-2 border-[#f0ebe3]">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="text-sm text-[#9a9a9a] text-right pt-2">
                    Payment: {paymentMethod.toUpperCase()}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => alert("Download functionality would be implemented here")}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-[#f0ebe3] text-[#8b6f47] rounded-xl hover:bg-[#faf8f5] transition-colors"
              >
                <Download size={20} />
                <span>Download PDF</span>
              </button>
              <button
                onClick={() => setShowShareModal(true)}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#d4a574] to-[#8b6f47] text-white rounded-xl hover:shadow-lg transition-shadow"
              >
                <Send size={20} />
                <span>Share Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Invoice Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md">
            {shareSent ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-[#d4edda] flex items-center justify-center mx-auto mb-4">
                  <Check size={32} className="text-[#155724]" />
                </div>
                <h3 className="text-xl font-semibold text-[#8b6f47] mb-2">
                  Invoice Sent!
                </h3>
                <p className="text-sm text-[#9a9a9a]">
                  The invoice has been sent successfully
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-[#8b6f47]">
                    Share Invoice
                  </h3>
                  <button
                    onClick={() => setShowShareModal(false)}
                    className="p-2 hover:bg-[#faf8f5] rounded-lg transition-colors"
                  >
                    <X size={20} className="text-[#9a9a9a]" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#8b6f47] mb-3">
                      Select Method
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => setShareMethod("email")}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          shareMethod === "email"
                            ? "border-[#d4a574] bg-gradient-to-r from-[#f5d5d8] to-[#f8e4d9]"
                            : "border-[#f0ebe3] bg-[#faf8f5]"
                        }`}
                      >
                        <Mail
                          size={24}
                          className={`mx-auto mb-2 ${
                            shareMethod === "email"
                              ? "text-[#d4a574]"
                              : "text-[#9a9a9a]"
                          }`}
                        />
                        <div className="text-xs text-[#8b6f47]">Email</div>
                      </button>
                      <button
                        onClick={() => setShareMethod("whatsapp")}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          shareMethod === "whatsapp"
                            ? "border-[#d4a574] bg-gradient-to-r from-[#f5d5d8] to-[#f8e4d9]"
                            : "border-[#f0ebe3] bg-[#faf8f5]"
                        }`}
                      >
                        <MessageCircle
                          size={24}
                          className={`mx-auto mb-2 ${
                            shareMethod === "whatsapp"
                              ? "text-[#d4a574]"
                              : "text-[#9a9a9a]"
                          }`}
                        />
                        <div className="text-xs text-[#8b6f47]">WhatsApp</div>
                      </button>
                      <button
                        onClick={() => setShareMethod("sms")}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          shareMethod === "sms"
                            ? "border-[#d4a574] bg-gradient-to-r from-[#f5d5d8] to-[#f8e4d9]"
                            : "border-[#f0ebe3] bg-[#faf8f5]"
                        }`}
                      >
                        <Smartphone
                          size={24}
                          className={`mx-auto mb-2 ${
                            shareMethod === "sms"
                              ? "text-[#d4a574]"
                              : "text-[#9a9a9a]"
                          }`}
                        />
                        <div className="text-xs text-[#8b6f47]">SMS</div>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#8b6f47] mb-2">
                      {shareMethod === "email"
                        ? "Email Address"
                        : "Phone Number"}
                    </label>
                    <input
                      type={shareMethod === "email" ? "email" : "tel"}
                      value={shareContact}
                      onChange={(e) => setShareContact(e.target.value)}
                      className="w-full px-4 py-3 bg-[#faf8f5] border border-[#f0ebe3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d4a574]/30"
                      placeholder={
                        shareMethod === "email"
                          ? "email@example.com"
                          : "+1 234 567 8900"
                      }
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowShareModal(false)}
                      className="flex-1 px-6 py-3 border border-[#f0ebe3] text-[#8b6f47] rounded-xl hover:bg-[#faf8f5] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleShare}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-[#d4a574] to-[#8b6f47] text-white rounded-xl hover:shadow-lg transition-shadow"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
