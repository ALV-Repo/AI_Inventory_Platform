"use client";

import { useEffect, useMemo, useState } from "react";
import PageLayout from "../../components/layout/PageLayout";

import {
  createSale,
  getTodaySales,
  type Sale,
} from "../../services/sales.service";

import {
  getProducts,
  type InventoryProduct,
} from "../../services/inventory.service";

/* =========================================================
   TYPES
   ========================================================= */

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

type SalesSummary = {
  revenue: number;
  orders: number;
};

type SalePayload = Parameters<typeof createSale>[0];

type OfflineSale = {
  id: string;
  payload: SalePayload;
  queuedAt: string;
};

/* =========================================================
   CONFIG
   ========================================================= */

const DEFAULT_WAREHOUSE_ID = 1;
const TAX_RATE = 18;

/* =========================================================
   HELPERS
   ========================================================= */

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Convert backend inventory product into the
 * frontend POS product shape.
 */
function normalizeProduct(
  product: InventoryProduct
): Product | null {
  const id = Number(product.id);

  if (!Number.isFinite(id)) {
    return null;
  }

  const name =
    typeof product.name === "string" &&
    product.name.trim()
      ? product.name
      : `Product ${id}`;

  const sku =
    typeof product.sku === "string"
      ? product.sku
      : "";

  const priceValue =
    product.price ??
    product.cost_price ??
    0;

  /*
   * Prefer the backend's AVAILABLE stock for POS.
   * This prevents reserved/unavailable stock from being sold.
   */
  const rawProduct = product as Record<string, unknown>;

  const availableValue =
    rawProduct.available ??
    rawProduct.available_quantity ??
    rawProduct.available_stock ??
    rawProduct.on_hand ??
    product.quantity ??
    product.stock ??
    0;

  const reservedValue =
    rawProduct.reserved ??
    rawProduct.reserved_quantity ??
    0;

  const stockValue =
    rawProduct.available !== undefined ||
    rawProduct.available_quantity !== undefined ||
    rawProduct.available_stock !== undefined
      ? availableValue
      : rawProduct.on_hand !== undefined
        ? Math.max(
            0,
            Number(availableValue) -
              Number(reservedValue)
          )
        : availableValue;

  const price = Number(priceValue);
  const stock = Number(stockValue);

  return {
    id,
    name,
    sku,
    price: Number.isFinite(price)
      ? price
      : 0,
    stock: Number.isFinite(stock)
      ? Math.max(0, stock)
      : 0,
  };
}

/* =========================================================
   SALES HELPERS
   ========================================================= */

function getSaleRevenue(
  sale: Sale
): number {
  return Number(
    sale.total_amount ??
      sale.total ??
      sale.revenue ??
      0
  );
}

function normalizeTodaySales(
  result: unknown
): SalesSummary {
  /*
   * Backend may return:
   *
   * 1. An array of sales
   * 2. { revenue, orders }
   * 3. { data: [...] }
   * 4. { sales: [...] }
   */

  if (Array.isArray(result)) {
    const sales = result as Sale[];

    return {
      revenue: sales.reduce(
        (sum, sale) =>
          sum + getSaleRevenue(sale),
        0
      ),
      orders: sales.length,
    };
  }

  if (
    typeof result === "object" &&
    result !== null
  ) {
    const data =
      result as Record<
        string,
        unknown
      >;

    if (Array.isArray(data.sales)) {
      const sales =
        data.sales as Sale[];

      return {
        revenue: sales.reduce(
          (sum, sale) =>
            sum + getSaleRevenue(sale),
          0
        ),
        orders: sales.length,
      };
    }

    if (Array.isArray(data.data)) {
      const sales =
        data.data as Sale[];

      return {
        revenue: sales.reduce(
          (sum, sale) =>
            sum + getSaleRevenue(sale),
          0
        ),
        orders: sales.length,
      };
    }

    return {
      revenue: Number(
        data.revenue ??
          data.total_amount ??
          data.total ??
          0
      ),
      orders: Number(
        data.orders ??
          data.count ??
          0
      ),
    };
  }

  return {
    revenue: 0,
    orders: 0,
  };
}

/* =========================================================
   PAGE
   ========================================================= */

export default function SalesPage() {
  /* =========================================================
     PRODUCT STATE
     ========================================================= */

  const [products, setProducts] =
    useState<Product[]>([]);

  const [
    productsLoading,
    setProductsLoading,
  ] = useState(true);

  const [
    productsError,
    setProductsError,
  ] = useState<string | null>(null);

  const [isOnline, setIsOnline] = useState(true);

const [offlineQueue, setOfflineQueue] =
  useState<OfflineSale[]>([]);

const [queueLoaded, setQueueLoaded] =
  useState(false);

const [syncingQueue, setSyncingQueue] =
  useState(false);

  /* =========================================================
     SEARCH
     ========================================================= */

  const [search, setSearch] =
    useState("");

  /* =========================================================
     CART
     ========================================================= */

  const [cart, setCart] =
    useState<CartItem[]>([]);

  /* =========================================================
     CUSTOMER
     ========================================================= */

  const [customer, setCustomer] =
    useState("");

    const [discount, setDiscount] =
  useState(0);

  /* =========================================================
     PAYMENT
     ========================================================= */

  const [
    paymentMethod,
    setPaymentMethod,
  ] = useState("Cash");

  /* =========================================================
     SALE UI STATE
     ========================================================= */

  const [
    showSuccess,
    setShowSuccess,
  ] = useState(false);

  const [
    processing,
    setProcessing,
  ] = useState(false);

  const [
    saleError,
    setSaleError,
  ] = useState<string | null>(null);

  /* =========================================================
     TODAY'S SALES STATE
     ========================================================= */

  const [
    salesSummary,
    setSalesSummary,
  ] = useState<SalesSummary>({
    revenue: 0,
    orders: 0,
  });

  const [
    summaryLoading,
    setSummaryLoading,
  ] = useState(true);

  const [
    summaryError,
    setSummaryError,
  ] = useState<string | null>(null);

  /* =========================================================
   OFFLINE QUEUE
   ========================================================= */

useEffect(() => {
  setIsOnline(navigator.onLine);

  const savedQueue =
    localStorage.getItem("stockflow-offline-sales");

  if (savedQueue) {
    try {
      const parsed =
        JSON.parse(savedQueue);

      if (Array.isArray(parsed)) {
        setOfflineQueue(parsed);
      }
    } catch {
      localStorage.removeItem(
        "stockflow-offline-sales"
      );
    }
  }

  setQueueLoaded(true);

  const handleOnline = () => {
    setIsOnline(true);
  };

  const handleOffline = () => {
    setIsOnline(false);
  };

  window.addEventListener(
    "online",
    handleOnline
  );

  window.addEventListener(
    "offline",
    handleOffline
  );

  return () => {
    window.removeEventListener(
      "online",
      handleOnline
    );

    window.removeEventListener(
      "offline",
      handleOffline
    );
  };
}, []);

useEffect(() => {
  if (!queueLoaded) {
    return;
  }

  localStorage.setItem(
    "stockflow-offline-sales",
    JSON.stringify(offlineQueue)
  );
}, [offlineQueue, queueLoaded]);

async function syncOfflineSales() {
  if (
    !navigator.onLine ||
    offlineQueue.length === 0 ||
    syncingQueue
  ) {
    return;
  }

  setSyncingQueue(true);

  const remaining: OfflineSale[] = [];

  for (const queuedSale of offlineQueue) {
    try {
      await createSale(queuedSale.payload);

      console.log(
        "Offline sale synced successfully:",
        queuedSale.id
      );
    } catch (error) {
      console.error(
        "Offline sale sync failed:",
        queuedSale.id,
        error
      );

      remaining.push(queuedSale);
    }
  }

  setOfflineQueue(remaining);
  setSyncingQueue(false);

  if (remaining.length === 0) {
    setShowSuccess(true);
    await loadProducts();
    await loadTodaySales();
  }
}

  /* =========================================================
     LOAD INVENTORY PRODUCTS
     ========================================================= */

  async function loadProducts() {
    try {
      setProductsLoading(true);
      setProductsError(null);

      const response =
        await getProducts();

      const rawProducts =
        Array.isArray(response)
          ? response
          : response.products ??
            response.items ??
            (Array.isArray(response.data)
              ? response.data
              : []);

      const normalizedProducts =
        rawProducts
          .map(normalizeProduct)
          .filter(
            (
              product
            ): product is Product =>
              product !== null
          );

      setProducts(
        normalizedProducts
      );

      /*
       * Update existing cart items with
       * the latest backend stock.
       */
      setCart((currentCart) =>
        currentCart
          .map((cartItem) => {
            const latest =
              normalizedProducts.find(
                (product) =>
                  product.id ===
                  cartItem.id
              );

            if (!latest) {
              return cartItem;
            }

            return {
              ...cartItem,
              ...latest,
              quantity: Math.min(
                cartItem.quantity,
                latest.stock
              ),
            };
          })
          .filter(
            (item) =>
              item.quantity > 0
          )
      );
    } catch (error) {
      console.error(
        "Unable to load inventory products:",
        error
      );

      setProductsError(
        error instanceof Error
          ? error.message
          : "Unable to load products."
      );
    } finally {
      setProductsLoading(false);
    }
  }

    /* =========================================================
     LOAD TODAY'S SALES
     ========================================================= */

  async function loadTodaySales() {
    try {
      setSummaryLoading(true);
      setSummaryError(null);

      const result =
        await getTodaySales();

      const summary =
        normalizeTodaySales(result);

      setSalesSummary(summary);
    } catch (error) {
      console.error(
        "Unable to load today's sales:",
        error
      );

      setSummaryError(
        error instanceof Error
          ? error.message
          : "Unable to load today's sales."
      );

      /*
       * Do not break the POS if the dashboard
       * endpoint is unavailable.
       */
      setSalesSummary({
        revenue: 0,
        orders: 0,
      });
    } finally {
      setSummaryLoading(false);
    }
  }

  /* =========================================================
     INITIAL LOAD
     ========================================================= */

  useEffect(() => {
  loadProducts();
  loadTodaySales();
}, []);

useEffect(() => {
  if (isOnline && queueLoaded) {
    syncOfflineSales();
  }
}, [isOnline, queueLoaded]);

  /* =========================================================
     FILTER PRODUCTS
     ========================================================= */

  const filteredProducts =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      if (!query) {
        return products;
      }

      return products.filter(
        (product) =>
          product.name
            .toLowerCase()
            .includes(query) ||
          product.sku
            .toLowerCase()
            .includes(query)
      );
    }, [products, search]);

  /* =========================================================
     CART CALCULATIONS
     ========================================================= */

  const subtotal = useMemo(() => {
    return cart.reduce(
      (sum, item) =>
        sum +
        item.price * item.quantity,
      0
    );
  }, [cart]);

  const taxAmount = useMemo(() => {
    return Math.round(
      subtotal * (TAX_RATE / 100)
    );
  }, [subtotal]);

  const discountAmount = useMemo(() => {
  return Math.min(
    Math.max(0, Number(discount) || 0),
    subtotal
  );
}, [discount, subtotal]);

const total = useMemo(() => {
  return subtotal - discountAmount + taxAmount;
}, [subtotal, discountAmount, taxAmount]);

  const cartItemCount = useMemo(() => {
    return cart.reduce(
      (sum, item) =>
        sum + item.quantity,
      0
    );
  }, [cart]);

  /* =========================================================
     ADD TO CART
     ========================================================= */

  function addToCart(
    product: Product
  ) {
    setSaleError(null);
    setShowSuccess(false);

    /*
     * Never allow an out-of-stock product
     * to enter the cart.
     */
    if (product.stock <= 0) {
      setSaleError(
        `${product.name}: Out of stock.`
      );
      return;
    }

    setCart((currentCart) => {
      const existing =
        currentCart.find(
          (item) =>
            item.id === product.id
        );

      if (!existing) {
        return [
          ...currentCart,
          {
            ...product,
            quantity: 1,
          },
        ];
      }

      /*
       * Do not allow quantity to exceed
       * currently available stock.
       */
      if (
        existing.quantity >=
        product.stock
      ) {
        setSaleError(
          `${product.name}: only ${product.stock} available.`
        );

        return currentCart;
      }

      return currentCart.map(
        (item) =>
          item.id === product.id
            ? {
                ...item,
                quantity:
                  item.quantity + 1,
              }
            : item
      );
    });
  }

  /* =========================================================
     REMOVE FROM CART
     ========================================================= */

  function removeFromCart(
    productId: number
  ) {
    setSaleError(null);
    setShowSuccess(false);

    setCart((currentCart) =>
      currentCart.filter(
        (item) =>
          item.id !== productId
      )
    );
  }

  /* =========================================================
     DECREASE CART QUANTITY
     ========================================================= */

  function decreaseQuantity(
    productId: number
  ) {
    setSaleError(null);
    setShowSuccess(false);

    setCart((currentCart) =>
      currentCart
        .map((item) => {
          if (
            item.id !== productId
          ) {
            return item;
          }

          return {
            ...item,
            quantity:
              item.quantity - 1,
          };
        })
        .filter(
          (item) =>
            item.quantity > 0
        )
    );
  }

  /* =========================================================
     INCREASE CART QUANTITY
     ========================================================= */

  function increaseQuantity(
    productId: number
  ) {
    setSaleError(null);
    setShowSuccess(false);

    setCart((currentCart) =>
      currentCart.map((item) => {
        if (
          item.id !== productId
        ) {
          return item;
        }

        if (
          item.quantity >=
          item.stock
        ) {
          setSaleError(
            `${item.name}: only ${item.stock} available.`
          );

          return item;
        }

        return {
          ...item,
          quantity:
            item.quantity + 1,
        };
      })
    );
  }

  /* =========================================================
     CLEAR CART
     ========================================================= */

  function clearCart() {
    setCart([]);
    setSaleError(null);
    setShowSuccess(false);
  }

  /* =========================================================
     VALIDATE CART BEFORE SALE
     ========================================================= */

  function validateCart(): string | null {
    if (cart.length === 0) {
      return "Please add at least one product to the sale.";
    }

    for (const item of cart) {
      if (item.quantity <= 0) {
        return `${item.name}: invalid quantity.`;
      }

      if (item.stock <= 0) {
        return `${item.name}: out of stock.`;
      }

      if (
        item.quantity >
        item.stock
      ) {
        return `${item.name}: only ${item.stock} available, but ${item.quantity} requested.`;
      }
    }

    return null;
  }

  /* =========================================================
     COMPLETE SALE
     ========================================================= */

  async function completeSale() {
    setSaleError(null);
    setShowSuccess(false);

    const validationError =
      validateCart();

    if (validationError) {
      setSaleError(
        validationError
      );
      return;
    }

    setProcessing(true);

try {
  /*
   * If the browser is offline, save the sale
   * locally and sync it automatically later.
   */
  if (!navigator.onLine) {
    const offlineSale: OfflineSale = {
      id: `offline-${Date.now()}`,
      payload: {
        customer_id: null,
        warehouse_id:
          DEFAULT_WAREHOUSE_ID,
        channel: "POS",
        payment_mode:
          paymentMethod,
        lines: cart.map(
          (item) => ({
            product_id: item.id,
            quantity: item.quantity,
            unit_price: item.price,
            tax_rate: TAX_RATE,
          })
        ),
      },
      queuedAt: new Date().toISOString(),
    };

    setOfflineQueue((currentQueue) => [
      ...currentQueue,
      offlineSale,
    ]);

    setCart([]);
    setCustomer("");
    setPaymentMethod("Cash");
    setShowSuccess(true);

    return;
  }
      /*
       * Backend expects:
       *
       * {
       *   customer_id: number | null,
       *   warehouse_id: number,
       *   channel: "POS",
       *   payment_mode: "Cash",
       *   lines: [...]
       * }
       *
       * IMPORTANT:
       * Send `lines`, NOT `items`.
       */

      const payload = {
        customer_id: null,

        warehouse_id:
          DEFAULT_WAREHOUSE_ID,

        channel: "POS",

        payment_mode:
          paymentMethod,

        lines: cart.map(
          (item) => ({
            product_id: item.id,
            quantity: item.quantity,
            unit_price: item.price,
            tax_rate: TAX_RATE,
          })
        ),
      };

      console.log(
        "Creating sale with payload:",
        payload
      );

      const createdSale =
        await createSale(
          payload
        );

      console.log(
        "Sale created successfully:",
        createdSale
      );

      /*
       * Sale succeeded.
       * Clear the cart only AFTER the backend
       * confirms successful creation.
       */

      setCart([]);

      setCustomer("");

      setPaymentMethod("Cash");

      setShowSuccess(true);

      /*
       * Refresh inventory so stock shown
       * on the POS is current.
       */

      await loadProducts();

      /*
       * Refresh today's sales summary.
       */

      await loadTodaySales();
    } catch (error) {
      console.error(
        "Sale creation error:",
        error
      );

      setSaleError(
        error instanceof Error
          ? error.message
          : "Sale could not be completed."
      );
    } finally {
      setProcessing(false);
    }
  }

    /* =========================================================
     PRODUCT INITIAL
     ========================================================= */

  function productInitial(name: string) {
    return (
      name
        .trim()
        .charAt(0)
        .toUpperCase() || "P"
    );
  }

  /* =========================================================
     ERROR / SUCCESS MESSAGE
     ========================================================= */

  function renderMessage() {
    if (saleError) {
      return (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <div className="font-semibold">
            Sale could not be completed.
          </div>

          <div className="mt-1">
            {saleError}
          </div>
        </div>
      );
    }

    if (showSuccess) {
      return (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <div className="font-semibold">
            Sale completed successfully.
          </div>

          <div className="mt-1">
            Inventory and today&apos;s sales have
            been updated.
          </div>
        </div>
      );
    }

    if (summaryError) {
      return (
        <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
          <div className="font-semibold">
            Today&apos;s sales summary could not
            be loaded.
          </div>

          <div className="mt-1">
            {summaryError}
          </div>
        </div>
      );
    }

    if (productsError) {
      return (
        <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
          <div className="font-semibold">
            Products could not be loaded.
          </div>

          <div className="mt-1">
            {productsError}
          </div>
        </div>
      );
    }

    return null;
  }

  /* =========================================================
     PAGE JSX
     ========================================================= */

  return (
    <PageLayout>
      <div className="min-h-screen bg-slate-50">
        <main className="mx-auto w-full max-w-[1180px] px-6 py-5">

          {/* =================================================
              PAGE HEADER
              ================================================= */}

          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-[22px] font-semibold tracking-tight text-slate-900">
                Point of Sale
              </h1>

              <p className="mt-1 text-xs text-slate-500">
                Create sales, manage cart items
                and process payments.
              </p>
            </div>

            <div className="flex items-center gap-2">

            <div
  className={`rounded-md border px-3 py-2 text-xs font-medium ${
    isOnline
      ? "border-green-200 bg-green-50 text-green-700"
      : "border-orange-200 bg-orange-50 text-orange-700"
  }`}
>
  {isOnline ? "Online" : "Offline"}
</div>

              <div className="rounded-md border border-slate-200 bg-white px-4 py-2 text-xs text-slate-600 shadow-sm">
                Store:{" "}
                <span className="font-semibold text-slate-900">
                  Main Store — Bengaluru
                </span>
              </div>

              <button
                type="button"
                onClick={clearCart}
                disabled={cart.length === 0}
                className="rounded-md border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Clear Cart
              </button>

            </div>
          </div>

          {/* =================================================
              MESSAGES
              ================================================= */}

          {renderMessage()}

          {/* =================================================
              SUMMARY CARDS
              ================================================= */}

          <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">

            {/* Today's Sales */}

            <div className="rounded-lg border border-slate-200 bg-white px-4 py-4 shadow-sm">

              <div className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                Today&apos;s Sales
              </div>

              <div className="mt-2 text-xl font-semibold text-slate-900">
                {summaryLoading
                  ? "—"
                  : formatCurrency(
                      salesSummary.revenue
                    )}
              </div>

              <div className="mt-1 text-[10px] text-slate-400">
                {summaryLoading
                  ? "Loading..."
                  : `${salesSummary.orders} completed orders`}
              </div>

            </div>

            {/* Orders Today */}

            <div className="rounded-lg border border-slate-200 bg-white px-4 py-4 shadow-sm">

              <div className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                Orders Today
              </div>

              <div className="mt-2 text-xl font-semibold text-slate-900">
                {summaryLoading
                  ? "—"
                  : salesSummary.orders}
              </div>

              <div className="mt-1 text-[10px] text-slate-400">
                All sales channels
              </div>

            </div>

            {/* Cart Items */}

            <div className="rounded-lg border border-slate-200 bg-white px-4 py-4 shadow-sm">

              <div className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                Cart Items
              </div>

              <div className="mt-2 text-xl font-semibold text-slate-900">
                {cartItemCount}
              </div>

              <div className="mt-1 text-[10px] text-slate-400">
                Current transaction
              </div>

            </div>

            {/* Cart Value */}

            <div className="rounded-lg border border-slate-200 bg-white px-4 py-4 shadow-sm">

              <div className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                Cart Value
              </div>

              <div className="mt-2 text-xl font-semibold text-slate-900">
                {formatCurrency(total)}
              </div>

              <div className="mt-1 text-[10px] text-slate-400">
                Including 18% GST
              </div>

            </div>

          </div>

          {/* =================================================
              MAIN POS GRID
              ================================================= */}

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_272px]">

            {/* =================================================
                PRODUCTS
                ================================================= */}

            <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">

              {/* Products Header */}

              <div className="border-b border-slate-200 px-4 py-4">

                <div className="flex items-center justify-between">

                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">
                      Products
                    </h2>

                    <p className="mt-1 text-[10px] text-slate-500">
                      Select products to add them
                      to the current sale.
                    </p>
                  </div>

                  <div className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-medium text-blue-600">
                    {filteredProducts.length} products
                  </div>

                </div>

                {/* Search */}

                <div className="mt-4">

                  <input
                    type="text"
                    value={search}
                    onChange={(event) =>
                      setSearch(
                        event.target.value
                      )
                    }
                    placeholder="Search product or SKU..."
                    className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />

                </div>

              </div>

              {/* Products List */}

              <div className="p-3">

                {productsLoading ? (
                  <div className="flex min-h-[360px] items-center justify-center">

                    <div className="text-xs text-slate-400">
                      Loading products...
                    </div>

                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="flex min-h-[360px] items-center justify-center">

                    <div className="text-center">

                      <div className="text-sm font-medium text-slate-600">
                        No products found.
                      </div>

                      {search && (
                        <button
                          type="button"
                          onClick={() =>
                            setSearch("")
                          }
                          className="mt-2 text-xs text-blue-600 hover:underline"
                        >
                          Clear search
                        </button>
                      )}

                    </div>

                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">

                    {filteredProducts.map(
                      (product) => {

                        const unavailable =
                          product.stock <= 0;

                        const cartItem =
                          cart.find(
                            (item) =>
                              item.id ===
                              product.id
                          );

                        const cartQuantity =
                          cartItem?.quantity ??
                          0;

                        const remainingStock =
                          Math.max(
                            0,
                            product.stock -
                              cartQuantity
                          );

                        const canAdd =
                          remainingStock > 0;

                        return (
                          <div
                            key={product.id}
                            className="rounded-lg border border-slate-200 bg-white p-3 transition hover:border-slate-300 hover:shadow-sm"
                          >

                            {/* Product Icon */}

                            <div className="mb-3 flex items-start justify-between">

                              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-100 text-sm font-semibold text-slate-600">
                                {productInitial(
                                  product.name
                                )}
                              </div>

                            </div>

                            {/* Product Name */}

                            <div className="min-h-[34px]">

                              <div className="text-xs font-semibold text-slate-900">
                                {product.name}
                              </div>

                              <div className="mt-1 text-[9px] text-slate-400">
                                SKU:{" "}
                                {product.sku ||
                                  "—"}
                              </div>

                            </div>

                            {/* Price */}

                            <div className="mt-3 text-sm font-semibold text-slate-900">
                              {formatCurrency(
                                product.price
                              )}
                            </div>

                            {/* Stock / Button */}

                            <div className="mt-1 flex items-center justify-between gap-2">

                              <div
                                className={`text-[9px] ${
                                  unavailable
                                    ? "text-red-500"
                                    : remainingStock <= 5
                                      ? "text-orange-500"
                                      : "text-green-600"
                                }`}
                              >
                                {unavailable
                                  ? "Out of stock"
                                  : cartQuantity > 0
                                    ? `${remainingStock} left`
                                    : `${product.stock} in stock`}
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  addToCart(
                                    product
                                  )
                                }
                                disabled={!canAdd}
                                className="rounded-md bg-slate-900 px-3 py-2 text-[10px] font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                              >
                                {unavailable
                                  ? "Unavailable"
                                  : "Add"}
                              </button>

                            </div>

                          </div>
                        );
                      }
                    )}

                  </div>
                )}

              </div>

            </section>

            {/* =================================================
                CURRENT SALE
                ================================================= */}

            <aside className="flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">

              {/* Current Sale Header */}

              <div className="border-b border-slate-200 px-4 py-4">

                <div className="flex items-center justify-between">

                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">
                      Current Sale
                    </h2>

                    <p className="mt-1 text-[10px] text-slate-500">
                      Review items before checkout.
                    </p>
                  </div>

                  <div className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-medium text-slate-600">
                    {cartItemCount} items
                  </div>

                </div>

              </div>

              {/* Cart */}

              <div className="min-h-[180px] border-b border-slate-200">

                {cart.length === 0 ? (
                  <div className="flex min-h-[180px] flex-col items-center justify-center px-4 text-center">

                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-lg">
                      🛒
                    </div>

                    <div className="mt-3 text-xs font-medium text-slate-700">
                      Cart is empty
                    </div>

                    <div className="mt-1 text-[9px] text-slate-400">
                      Add products from the list.
                    </div>

                  </div>
                ) : (
                  <div className="max-h-[310px] overflow-y-auto p-3">

                    <div className="space-y-2">

                      {cart.map((item) => (

                        <div
                          key={item.id}
                          className="rounded-md border border-slate-200 p-3"
                        >

                          <div className="flex items-start justify-between gap-2">

                            <div className="min-w-0">

                              <div className="truncate text-xs font-semibold text-slate-900">
                                {item.name}
                              </div>

                              <div className="mt-1 text-[9px] text-slate-400">
                                {formatCurrency(
                                  item.price
                                )}{" "}
                                each
                              </div>

                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                removeFromCart(
                                  item.id
                                )
                              }
                              className="text-[9px] font-medium text-red-500 hover:text-red-600"
                            >
                              Remove
                            </button>

                          </div>

                          <div className="mt-3 flex items-center justify-between">

                            <div className="flex items-center rounded-md border border-slate-200">

                              <button
                                type="button"
                                onClick={() =>
                                  decreaseQuantity(
                                    item.id
                                  )
                                }
                                className="flex h-7 w-7 items-center justify-center text-xs text-slate-600 hover:bg-slate-50"
                              >
                                −
                              </button>

                              <div className="flex h-7 w-7 items-center justify-center border-x border-slate-200 text-xs font-medium text-slate-700">
                                {item.quantity}
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  increaseQuantity(
                                    item.id
                                  )
                                }
                                disabled={
                                  item.quantity >=
                                  item.stock
                                }
                                className="flex h-7 w-7 items-center justify-center text-xs text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                +
                              </button>

                            </div>

                            <div className="text-xs font-semibold text-slate-900">
                              {formatCurrency(
                                item.price *
                                  item.quantity
                              )}
                            </div>

                          </div>

                        </div>

                      ))}

                    </div>

                  </div>
                )}

              </div>

              {/* Customer / Payment */}

              <div className="p-3">

                <div>

                  <label className="mb-1 block text-[9px] font-medium text-slate-600">
                    Customer
                  </label>

                  <input
                    type="text"
                    value={customer}
                    onChange={(event) =>
                      setCustomer(
                        event.target.value
                      )
                    }
                    placeholder="Customer name (optional)"
                    className="h-9 w-full rounded-md border border-slate-200 px-3 text-xs text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />

                </div>

                <div className="mt-3">

                  <label className="mb-1 block text-[9px] font-medium text-slate-600">
                    Payment Method
                  </label>

                  <div className="mt-3">
  <label className="mb-1 block text-[9px] font-medium text-slate-600">
    Discount
  </label>

  <input
    type="number"
    min="0"
    max={subtotal}
    value={discount}
    onChange={(event) =>
      setDiscount(
        Math.min(
          Math.max(0, Number(event.target.value) || 0),
          subtotal
        )
      )
    }
    placeholder="0"
    className="h-9 w-full rounded-md border border-slate-200 px-3 text-xs text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
  />
</div>

                  <select
                    value={paymentMethod}
                    onChange={(event) =>
                      setPaymentMethod(
                        event.target.value
                      )
                    }
                    className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="Cash">
                      Cash
                    </option>

                    <option value="Card">
                      Card
                    </option>

                    <option value="UPI">
                      UPI
                    </option>

                    <option value="Bank Transfer">
                      Bank Transfer
                    </option>
                  </select>

                </div>

              </div>

              {/* Totals */}

              <div className="mt-auto border-t border-slate-200 p-3">

                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Subtotal</span>

                  <span className="font-medium text-slate-900">
                    {formatCurrency(
                      subtotal
                    )}
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
                  <span>
                    GST ({TAX_RATE}%)
                  </span>

                  <span className="font-medium text-slate-900">
                    {formatCurrency(
                      taxAmount
                    )}
                  </span>
                </div>

                <div className="my-3 border-t border-slate-200" />

                <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
                  <span>Total</span>

                  <span>
                    {formatCurrency(
                      total
                    )}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={completeSale}
                  disabled={
                    processing ||
                    cart.length === 0
                  }
                  className="mt-4 h-10 w-full rounded-md bg-blue-600 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {processing
                    ? "Processing..."
                    : "Complete Sale"}
                </button>

              </div>

            </aside>

          </div>

        </main>
      </div>
    </PageLayout>
  );
}