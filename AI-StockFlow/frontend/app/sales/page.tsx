"use client";

import { useMemo, useState } from "react";
import PageLayout from "../../components/layout/PageLayout";

type Product = {
  id: number;
  name: string;
  sku: string;
  price: number;
  stock: number;
};

type CartItem = Product & {
  quantity: number;
};

const products: Product[] = [
  {
    id: 1,
    name: "Hot Wheels Track Set",
    sku: "TOY-HW-002",
    price: 899,
    stock: 1,
  },
  {
    id: 2,
    name: "Bluetooth Speaker",
    sku: "ELEC-BT-600",
    price: 1299,
    stock: 2,
  },
  {
    id: 3,
    name: "Football Size 5",
    sku: "SPT-BL-500",
    price: 899,
    stock: 3,
  },
  {
    id: 4,
    name: "Christmas Tree 4ft",
    sku: "SEA-XMAS-060",
    price: 1899,
    stock: 81,
  },
  {
    id: 5,
    name: "Fashion Doll Set",
    sku: "TOY-DL-410",
    price: 699,
    stock: 56,
  },
  {
    id: 6,
    name: "Ceramic Planter",
    sku: "HOME-PL-810",
    price: 499,
    stock: 53,
  },
  {
    id: 7,
    name: "Wireless Keyboard",
    sku: "ELEC-KB-220",
    price: 1499,
    stock: 32,
  },
  {
    id: 8,
    name: "USB-C Fast Charger",
    sku: "ELEC-CH-450",
    price: 799,
    stock: 8,
  },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export default function SalesPage() {
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [showSuccess, setShowSuccess] = useState(false);

  const filteredProducts = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) {
      return products;
    }

    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(value) ||
        product.sku.toLowerCase().includes(value)
    );
  }, [search]);

  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + tax;

  function addToCart(product: Product) {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);

      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: Math.min(item.quantity + 1, product.stock),
              }
            : item
        );
      }

      return [
        ...current,
        {
          ...product,
          quantity: 1,
        },
      ];
    });
  }

  function decreaseQuantity(id: number) {
    setCart((current) =>
      current
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function increaseQuantity(id: number) {
    setCart((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Math.min(item.quantity + 1, item.stock),
            }
          : item
      )
    );
  }

  function removeItem(id: number) {
    setCart((current) => current.filter((item) => item.id !== id));
  }

  function clearCart() {
    setCart([]);
    setCustomer("");
    setShowSuccess(false);
  }

  function completeSale() {
    if (cart.length === 0) {
      alert("Please add at least one product.");
      return;
    }

    setShowSuccess(true);
  }

  return (
    <PageLayout>
    <main className="min-h-screen bg-[#f8fafc] p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Point of Sale
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Create sales, manage cart items and process payments.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm">
              <span className="text-slate-500">Store:</span>{" "}
              <span className="font-semibold text-slate-900">
                Main Store — Bengaluru
              </span>
            </div>

            <button
              onClick={clearCart}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Clear Cart
            </button>
          </div>
        </div>

        {/* Success message */}
        {showSuccess && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-5 py-4">
            <div>
              <p className="font-semibold text-green-800">
                Sale completed successfully.
              </p>

              <p className="mt-1 text-sm text-green-700">
                Total amount: {formatCurrency(total)} via {paymentMethod}.
              </p>
            </div>

            <button
              onClick={clearCart}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
            >
              New Sale
            </button>
          </div>
        )}

        {/* KPI cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Today's Sales
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              ₹0
            </p>

            <p className="mt-1 text-xs text-slate-400">
              0 completed orders
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Orders Today
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              0
            </p>

            <p className="mt-1 text-xs text-slate-400">
              All sales channels
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Cart Items
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Current transaction
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Cart Value
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {formatCurrency(total)}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Including 18% GST
            </p>
          </div>
        </div>

        {/* Main POS */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
          {/* Products */}
          <section className="rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Products
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Select products to add them to the current sale.
                  </p>
                </div>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                  {filteredProducts.length} products
                </span>
              </div>

              <div className="mt-4">
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search product or SKU..."
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="rounded-xl border border-slate-200 p-4 transition hover:border-blue-300 hover:shadow-sm"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-lg font-bold text-slate-600">
                    {product.name.charAt(0)}
                  </div>

                  <h3 className="mt-4 text-sm font-semibold text-slate-900">
                    {product.name}
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    SKU: {product.sku}
                  </p>

                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <p className="text-lg font-bold text-slate-900">
                        {formatCurrency(product.price)}
                      </p>

                      <p
                        className={`mt-1 text-xs ${
                          product.stock <= 5
                            ? "text-orange-600"
                            : "text-green-600"
                        }`}
                      >
                        {product.stock} in stock
                      </p>
                    </div>

                    <button
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0}
                      className="rounded-lg bg-[#12213a] px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      Add
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="p-10 text-center text-sm text-slate-500">
                No products found.
              </div>
            )}
          </section>

          {/* Cart */}
          <aside className="rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Current Sale
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Review items before checkout.
                  </p>
                </div>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  {cart.length} items
                </span>
              </div>
            </div>

            <div className="max-h-[420px] overflow-y-auto p-5">
              {cart.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl">
                    🛒
                  </div>

                  <h3 className="mt-4 font-semibold text-slate-800">
                    Cart is empty
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Add products from the list.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-lg border border-slate-200 p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {item.name}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {formatCurrency(item.price)} each
                          </p>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center rounded-lg border border-slate-200">
                          <button
                            onClick={() => decreaseQuantity(item.id)}
                            className="px-3 py-1.5 text-slate-600 hover:bg-slate-50"
                          >
                            −
                          </button>

                          <span className="min-w-8 text-center text-sm font-semibold">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() => increaseQuantity(item.id)}
                            className="px-3 py-1.5 text-slate-600 hover:bg-slate-50"
                          >
                            +
                          </button>
                        </div>

                        <p className="text-sm font-bold text-slate-900">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Checkout */}
            <div className="border-t border-slate-200 p-5">
              <label className="text-xs font-medium text-slate-600">
                Customer
              </label>

              <input
                value={customer}
                onChange={(event) => setCustomer(event.target.value)}
                placeholder="Customer name (optional)"
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              />

              <label className="mt-4 block text-xs font-medium text-slate-600">
                Payment Method
              </label>

              <select
                value={paymentMethod}
                onChange={(event) => setPaymentMethod(event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              >
                <option>Cash</option>
                <option>UPI</option>
                <option>Card</option>
                <option>Bank Transfer</option>
              </select>

              <div className="mt-5 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Subtotal</span>

                  <span className="font-medium">
                    {formatCurrency(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">GST (18%)</span>

                  <span className="font-medium">
                    {formatCurrency(tax)}
                  </span>
                </div>

                <div className="my-3 border-t border-slate-200" />

                <div className="flex justify-between">
                  <span className="font-semibold text-slate-900">
                    Total
                  </span>

                  <span className="text-xl font-bold text-slate-900">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>

              <button
                onClick={completeSale}
                disabled={cart.length === 0}
                className="mt-5 w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Complete Sale
              </button>
            </div>
          </aside>
        </div>
      </div>
    </main>
    </PageLayout>
  );
}