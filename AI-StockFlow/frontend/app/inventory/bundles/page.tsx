"use client";

import { useEffect, useMemo, useState } from "react";

type Product = {
  id: string;
  name: string;
  sku: string;
  stock: number;
  price: number;
};

type BundleComponent = {
  productId: string;
  quantity: number;
};

type Bundle = {
  id: string;
  name: string;
  sku: string;
  components: BundleComponent[];
  status: "Active" | "Inactive";
  createdAt: string;
};

type BundleSale = {
  id: string;
  bundleId: string;
  bundleName: string;
  quantity: number;
  soldAt: string;
  deducted: { productId: string; sku: string; quantity: number }[];
};

const defaultProducts: Product[] = [
  { id: "p1", name: "Bluetooth Speaker", sku: "ELC-BT-608", stock: 8, price: 2800 },
  { id: "p2", name: "Hot Wheels Track Set", sku: "TOY-HW-101", stock: 31, price: 1200 },
  { id: "p3", name: "Premium Cotton T-Shirt", sku: "APP-TS-001", stock: 50, price: 650 },
  { id: "p4", name: "Wireless Mouse", sku: "ELC-MS-201", stock: 25, price: 900 },
];

const initialBundles: Bundle[] = [
  {
    id: "BND-001",
    name: "Entertainment Combo",
    sku: "BND-ENT-001",
    components: [
      { productId: "p1", quantity: 1 },
      { productId: "p2", quantity: 1 },
    ],
    status: "Active",
    createdAt: "2026-09-01",
  },
];

const BUNDLE_STORAGE_KEY = "inventory-bundles";
const SALES_STORAGE_KEY = "inventory-bundle-sales";
const INVENTORY_STORAGE_KEY = "inventory-products";

function formatCurrency(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function BundlesPage() {
  const [products, setProducts] = useState<Product[]>(defaultProducts);
  const [bundles, setBundles] = useState<Bundle[]>(initialBundles);
  const [sales, setSales] = useState<BundleSale[]>([]);

  const [showCreate, setShowCreate] = useState(false);
  const [selectedBundle, setSelectedBundle] = useState<Bundle | null>(null);
  const [showSell, setShowSell] = useState(false);
  const [sellQuantity, setSellQuantity] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [message, setMessage] = useState("");

  const [bundleName, setBundleName] = useState("");
  const [bundleSku, setBundleSku] = useState("");
  const [components, setComponents] = useState<BundleComponent[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const storedBundles = localStorage.getItem(BUNDLE_STORAGE_KEY);
      const storedSales = localStorage.getItem(SALES_STORAGE_KEY);
      const storedProducts = localStorage.getItem(INVENTORY_STORAGE_KEY);

      if (storedBundles) {
        const parsed = JSON.parse(storedBundles);
        if (Array.isArray(parsed)) setBundles(parsed);
      }

      if (storedSales) {
        const parsed = JSON.parse(storedSales);
        if (Array.isArray(parsed)) setSales(parsed);
      }

      if (storedProducts) {
        const parsed = JSON.parse(storedProducts);
        if (Array.isArray(parsed)) {
          const normalized = parsed.map((item: any, index: number) => ({
            id: String(item.id ?? item.product_id ?? `inventory-${index}`),
            name: String(item.name ?? item.product_name ?? "Product"),
            sku: String(item.sku ?? item.code ?? `SKU-${index}`),
            stock: Number(
              item.stock ??
                item.current_stock ??
                item.quantity ??
                item.on_hand ??
                item.onHand ??
                0
            ),
            price: Number(
              item.price ??
                item.selling_price ??
                item.unit_cost ??
                item.purchase_price ??
                0
            ),
          }));
          if (normalized.length > 0) setProducts(normalized);
        }
      }
    } catch {
      // Keep safe local fallback data.
    }
  }, []);

  const persistBundles = (next: Bundle[]) => {
    setBundles(next);
    if (typeof window !== "undefined") {
      localStorage.setItem(BUNDLE_STORAGE_KEY, JSON.stringify(next));
    }
  };

  const persistSales = (next: BundleSale[]) => {
    setSales(next);
    if (typeof window !== "undefined") {
      localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(next));
    }
  };

  const getProduct = (productId: string) =>
    products.find((product) => product.id === productId);

  const bundleMetrics = (bundle: Bundle) => {
    const componentDetails = bundle.components.map((component) => {
      const product = getProduct(component.productId);
      const stock = product?.stock ?? 0;
      const required = component.quantity;
      return {
        component,
        product,
        stock,
        required,
        available: required > 0 ? Math.floor(stock / required) : 0,
      };
    });

    const available =
      componentDetails.length > 0
        ? Math.min(...componentDetails.map((item) => item.available))
        : 0;

    const cost = componentDetails.reduce(
      (sum, item) => sum + (item.product?.price ?? 0) * item.required,
      0
    );

    return { componentDetails, available, cost };
  };

  const bundleCost = useMemo(
    () =>
      components.reduce((total, component) => {
        const product = getProduct(component.productId);
        return total + (product?.price ?? 0) * component.quantity;
      }, 0),
    [components, products]
  );

  const availableBundles = useMemo(() => {
    if (components.length === 0) return 0;
    return Math.min(
      ...components.map((component) => {
        const product = getProduct(component.productId);
        return product && component.quantity > 0
          ? Math.floor(product.stock / component.quantity)
          : 0;
      })
    );
  }, [components, products]);

  const filteredBundles = useMemo(() => {
    const term = search.trim().toLowerCase();
    return bundles.filter((bundle) => {
      const matchesSearch =
        !term ||
        bundle.name.toLowerCase().includes(term) ||
        bundle.sku.toLowerCase().includes(term) ||
        bundle.id.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "All" || bundle.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bundles, search, statusFilter]);

  const totalAvailable = useMemo(
    () =>
      bundles.reduce(
        (sum, bundle) => sum + bundleMetrics(bundle).available,
        0
      ),
    [bundles, products]
  );

  const activeBundles = bundles.filter((bundle) => bundle.status === "Active").length;
  const totalComponentTypes = new Set(
    bundles.flatMap((bundle) => bundle.components.map((component) => component.productId))
  ).size;

  const totalBundleSales = sales.reduce((sum, sale) => sum + sale.quantity, 0);

  const resetForm = () => {
    setBundleName("");
    setBundleSku("");
    setComponents([]);
  };

  const addComponent = () => {
    const unused = products.find(
      (product) => !components.some((component) => component.productId === product.id)
    );
    setComponents((current) => [
      ...current,
      { productId: unused?.id ?? products[0]?.id ?? "", quantity: 1 },
    ]);
  };

  const updateComponent = (
    index: number,
    field: "productId" | "quantity",
    value: string
  ) => {
    setComponents((current) =>
      current.map((component, componentIndex) =>
        componentIndex === index
          ? {
              ...component,
              [field]:
                field === "quantity"
                  ? Math.max(1, Number(value) || 1)
                  : value,
            }
          : component
      )
    );
  };

  const removeComponent = (index: number) => {
    setComponents((current) =>
      current.filter((_, componentIndex) => componentIndex !== index)
    );
  };

  const handleCreateBundle = (event: React.FormEvent) => {
    event.preventDefault();

    if (!bundleName.trim() || !bundleSku.trim()) {
      alert("Please enter Bundle Name and SKU.");
      return;
    }

    if (components.length === 0) {
      alert("Please add at least one component product.");
      return;
    }

    const invalid = components.some(
      (component) => !component.productId || component.quantity <= 0
    );

    if (invalid) {
      alert("Please select valid products and quantities.");
      return;
    }

    const duplicateProducts =
      new Set(components.map((component) => component.productId)).size !==
      components.length;

    if (duplicateProducts) {
      alert("Each component product can only appear once in the BOM.");
      return;
    }

    const duplicateSku = bundles.some(
      (bundle) => bundle.sku.toLowerCase() === bundleSku.trim().toLowerCase()
    );

    if (duplicateSku) {
      alert("A bundle with this SKU already exists.");
      return;
    }

    const newBundle: Bundle = {
      id: `BND-${String(bundles.length + 1).padStart(3, "0")}`,
      name: bundleName.trim(),
      sku: bundleSku.trim().toUpperCase(),
      components: components.map((component) => ({ ...component })),
      status: "Active",
      createdAt: today(),
    };

    persistBundles([...bundles, newBundle]);
    resetForm();
    setShowCreate(false);
    setMessage(`${newBundle.name} created successfully.`);
  };

  const toggleBundleStatus = (bundle: Bundle) => {
    const nextStatus = bundle.status === "Active" ? "Inactive" : "Active";
    persistBundles(
      bundles.map((item) =>
        item.id === bundle.id ? { ...item, status: nextStatus } : item
      )
    );
    setSelectedBundle(null);
    setMessage(`${bundle.name} is now ${nextStatus.toLowerCase()}.`);
  };

  const persistInventoryProducts = (nextProducts: Product[]) => {
    if (typeof window === "undefined") return;

    try {
      const existing = localStorage.getItem(INVENTORY_STORAGE_KEY);

      if (!existing) {
        localStorage.setItem(
          INVENTORY_STORAGE_KEY,
          JSON.stringify(
            nextProducts.map((product) => ({
              id: product.id,
              name: product.name,
              sku: product.sku,
              stock: product.stock,
              price: product.price,
            }))
          )
        );
        return;
      }

      const parsed = JSON.parse(existing);

      if (!Array.isArray(parsed)) return;

      const updated = parsed.map((item: any) => {
        const sku = String(item.sku ?? item.code ?? "").toLowerCase();
        const name = String(item.name ?? item.product_name ?? "").toLowerCase();

        const match = nextProducts.find(
          (product) =>
            product.sku.toLowerCase() === sku ||
            product.name.toLowerCase() === name
        );

        if (!match) return item;

        return {
          ...item,
          stock: match.stock,
          current_stock: match.stock,
          quantity: match.stock,
          on_hand: match.stock,
          onHand: match.stock,
        };
      });

      localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // The page still keeps its own synchronized frontend state.
    }
  };

  const sellBundle = () => {
    if (!selectedBundle) return;

    if (selectedBundle.status !== "Active") {
      setMessage("Inactive bundles cannot be sold.");
      return;
    }

    const quantity = Math.max(1, Number(sellQuantity) || 1);
    const metrics = bundleMetrics(selectedBundle);

    if (metrics.available < quantity) {
      setMessage(
        `Cannot sell ${quantity}. Only ${metrics.available} bundle unit(s) are available from current component stock.`
      );
      return;
    }

    const nextProducts = products.map((product) => {
      const component = selectedBundle.components.find(
        (item) => item.productId === product.id
      );

      if (!component) return product;

      return {
        ...product,
        stock: Math.max(0, product.stock - component.quantity * quantity),
      };
    });

    const deducted = selectedBundle.components.map((component) => {
      const product = getProduct(component.productId);
      return {
        productId: component.productId,
        sku: product?.sku ?? "",
        quantity: component.quantity * quantity,
      };
    });

    const sale: BundleSale = {
      id: `BSALE-${Date.now()}`,
      bundleId: selectedBundle.id,
      bundleName: selectedBundle.name,
      quantity,
      soldAt: new Date().toISOString(),
      deducted,
    };

    setProducts(nextProducts);
    persistInventoryProducts(nextProducts);
    persistSales([sale, ...sales]);

    setShowSell(false);
    setSelectedBundle(null);
    setSellQuantity(1);
    setMessage(
      `${quantity} ${selectedBundle.name} bundle unit(s) sold. BOM component stock deducted successfully.`
    );
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[9px] font-bold text-blue-700">
                FR-INV-10
              </span>
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[9px] font-bold text-emerald-700">
                BOM DEDUCTION
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Bundles & Kits</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              Create sellable bundles from existing inventory components and
              automatically deduct the BOM quantities when a bundle is sold.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              resetForm();
              setShowCreate(true);
            }}
            className="rounded-lg bg-[#12213a] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1b3153]"
          >
            + Create Bundle
          </button>
        </div>

        {message && (
          <div className="mb-5 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-700">
            <span>{message}</span>
            <button
              type="button"
              onClick={() => setMessage("")}
              className="font-bold"
            >
              ×
            </button>
          </div>
        )}

        <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
              Total Bundles
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{bundles.length}</p>
            <p className="mt-1 text-[10px] text-slate-400">{activeBundles} active</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
              Available Bundle Units
            </p>
            <p className="mt-2 text-2xl font-bold text-emerald-600">{totalAvailable}</p>
            <p className="mt-1 text-[10px] text-slate-400">Limited by lowest BOM component</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
              Component Products
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{totalComponentTypes}</p>
            <p className="mt-1 text-[10px] text-slate-400">Unique BOM components</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
              Bundle Sales
            </p>
            <p className="mt-2 text-2xl font-bold text-blue-600">{totalBundleSales}</p>
            <p className="mt-1 text-[10px] text-slate-400">Units sold through this module</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
              Inventory Sync
            </p>
            <p className="mt-2 text-lg font-bold text-slate-900">Live</p>
            <p className="mt-1 text-[10px] text-slate-400">Frontend inventory state</p>
          </div>
        </div>

        <div className="mb-5 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 lg:flex-row">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search bundle name, SKU or ID..."
            className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-xs outline-none focus:border-blue-400"
          />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 outline-none"
          >
            <option>All</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>

          <button
            type="button"
            onClick={() => {
              setSearch("");
              setStatusFilter("All");
            }}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Clear
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-sm font-bold text-slate-900">Bundle List</h2>
            <p className="mt-1 text-[10px] text-slate-400">
              {filteredBundles.length} of {bundles.length} bundles
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200">
                  {["Bundle", "SKU", "BOM Components", "Cost", "Available", "Status", "Actions"].map(
                    (heading) => (
                      <th
                        key={heading}
                        className="px-5 py-3 text-[9px] font-semibold uppercase tracking-wider text-slate-500"
                      >
                        {heading}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredBundles.map((bundle) => {
                  const metrics = bundleMetrics(bundle);

                  return (
                    <tr key={bundle.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <p className="text-xs font-bold text-slate-900">{bundle.name}</p>
                        <p className="mt-1 text-[9px] text-slate-400">{bundle.id}</p>
                      </td>

                      <td className="px-5 py-4 font-mono text-xs font-semibold text-slate-700">
                        {bundle.sku}
                      </td>

                      <td className="px-5 py-4">
                        <div className="max-w-[350px] space-y-1">
                          {metrics.componentDetails.map((item) => (
                            <div key={`${bundle.id}-${item.component.productId}`} className="flex justify-between gap-3 text-[10px]">
                              <span className="truncate text-slate-600">
                                {item.product?.name ?? "Unknown product"}
                              </span>
                              <span className="whitespace-nowrap font-semibold text-slate-800">
                                × {item.required}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-xs font-semibold text-slate-800">
                        {formatCurrency(metrics.cost)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                            metrics.available > 0
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {metrics.available}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                            bundle.status === "Active"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {bundle.status}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedBundle(bundle)}
                            className="rounded-md border border-slate-200 px-2.5 py-1.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            View BOM
                          </button>
                          <button
                            type="button"
                            disabled={bundle.status !== "Active" || metrics.available < 1}
                            onClick={() => {
                              setSelectedBundle(bundle);
                              setSellQuantity(1);
                              setShowSell(true);
                            }}
                            className="rounded-md bg-[#12213a] px-2.5 py-1.5 text-[10px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Sell Bundle
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredBundles.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-sm font-semibold text-slate-700">No bundles found</p>
              <p className="mt-1 text-xs text-slate-400">
                Try changing the search or status filter.
              </p>
            </div>
          )}
        </div>

        <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-5">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-bold text-blue-950">FR-INV-10 · BOM deduction rule</p>
              <p className="mt-1 text-[10px] text-blue-700">
                Selling one bundle deducts each BOM component by its configured quantity.
                Example: 2 bundles containing 1 speaker + 2 mice deduct 2 speakers + 4 mice.
              </p>
            </div>
            <div className="rounded-lg bg-white px-4 py-3 text-right shadow-sm">
              <p className="text-[9px] uppercase tracking-wide text-slate-400">ATP-style availability</p>
              <p className="mt-1 text-sm font-bold text-blue-950">
                Minimum(component stock ÷ BOM qty)
              </p>
            </div>
          </div>
        </div>

        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
            <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900">Create Bundle / Kit</h2>
                    <span className="rounded-full bg-blue-100 px-2 py-1 text-[8px] font-bold text-blue-700">
                      BOM
                    </span>
                  </div>
                  <p className="mt-1 text-[10px] text-slate-400">
                    Define the bill of materials for the sellable bundle.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowCreate(false);
                  }}
                  className="text-xl text-slate-400 hover:text-slate-700"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleCreateBundle} className="max-h-[75vh] space-y-5 overflow-y-auto p-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-[10px] font-semibold text-slate-600">
                      Bundle Name
                    </label>
                    <input
                      value={bundleName}
                      onChange={(event) => setBundleName(event.target.value)}
                      placeholder="Example: Festival Combo"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-blue-400"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[10px] font-semibold text-slate-600">
                      Bundle SKU
                    </label>
                    <input
                      value={bundleSku}
                      onChange={(event) => setBundleSku(event.target.value.toUpperCase())}
                      placeholder="BND-FEST-001"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs uppercase outline-none focus:border-blue-400"
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Bill of Materials</h3>
                      <p className="mt-1 text-[10px] text-slate-400">
                        Every sale deducts these quantities from component inventory.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addComponent}
                      disabled={products.length === 0}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-[10px] font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                    >
                      + Add Component
                    </button>
                  </div>

                  {components.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                      <p className="text-xs font-semibold text-slate-700">No BOM components yet</p>
                      <p className="mt-1 text-[10px] text-slate-400">
                        Add at least one inventory product.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {components.map((component, index) => {
                        const product = getProduct(component.productId);
                        const possible =
                          product && component.quantity > 0
                            ? Math.floor(product.stock / component.quantity)
                            : 0;

                        return (
                          <div key={`${component.productId}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_120px_auto]">
                              <select
                                value={component.productId}
                                onChange={(event) =>
                                  updateComponent(index, "productId", event.target.value)
                                }
                                className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none"
                              >
                                {products.map((item) => (
                                  <option key={item.id} value={item.id}>
                                    {item.name} ({item.sku})
                                  </option>
                                ))}
                              </select>

                              <input
                                type="number"
                                min={1}
                                value={component.quantity}
                                onChange={(event) =>
                                  updateComponent(index, "quantity", event.target.value)
                                }
                                className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none"
                              />

                              <button
                                type="button"
                                onClick={() => removeComponent(index)}
                                className="rounded-lg px-3 py-2 text-[10px] font-semibold text-red-600 hover:bg-red-50"
                              >
                                Remove
                              </button>
                            </div>

                            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[10px]">
                              <span className="text-slate-500">
                                On-hand: <strong className="text-slate-800">{product?.stock ?? 0}</strong>
                              </span>
                              <span className="text-slate-500">
                                Bundle capacity: <strong className="text-emerald-700">{possible}</strong>
                              </span>
                              <span className="text-slate-500">
                                Required per bundle: <strong className="text-slate-800">{component.quantity}</strong>
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                    <p className="text-[9px] uppercase tracking-wide text-blue-500">BOM Cost</p>
                    <p className="mt-1 text-lg font-bold text-blue-950">{formatCurrency(bundleCost)}</p>
                  </div>
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                    <p className="text-[9px] uppercase tracking-wide text-emerald-600">Available Bundles</p>
                    <p className="mt-1 text-lg font-bold text-emerald-900">{availableBundles}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-[9px] uppercase tracking-wide text-slate-400">Components</p>
                    <p className="mt-1 text-lg font-bold text-slate-900">{components.length}</p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setShowCreate(false);
                    }}
                    className="rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-[#12213a] px-5 py-2.5 text-xs font-semibold text-white"
                  >
                    Create Bundle
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {selectedBundle && !showSell && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
            <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900">{selectedBundle.name}</h2>
                    <span className="rounded-full bg-blue-100 px-2 py-1 text-[8px] font-bold text-blue-700">
                      {selectedBundle.sku}
                    </span>
                  </div>
                  <p className="mt-1 text-[10px] text-slate-400">
                    Bill of materials and component availability
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedBundle(null)}
                  className="text-xl text-slate-400"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4 p-6">
                {bundleMetrics(selectedBundle).componentDetails.map((item) => (
                  <div key={item.component.productId} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{item.product?.name ?? "Unknown product"}</p>
                      <p className="mt-1 font-mono text-[9px] text-slate-400">{item.product?.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-slate-800">
                        {item.stock} on-hand
                      </p>
                      <p className="mt-1 text-[10px] text-slate-500">
                        {item.required} required / bundle
                      </p>
                    </div>
                  </div>
                ))}

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-blue-50 p-4">
                    <p className="text-[9px] uppercase text-blue-500">Bundle Capacity</p>
                    <p className="mt-1 text-xl font-bold text-blue-950">
                      {bundleMetrics(selectedBundle).available}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-[9px] uppercase text-slate-400">Status</p>
                    <p className="mt-1 text-sm font-bold text-slate-900">{selectedBundle.status}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 px-6 py-4">
                <button
                  type="button"
                  onClick={() => setSelectedBundle(null)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => toggleBundleStatus(selectedBundle)}
                  className="rounded-lg border border-orange-200 px-4 py-2 text-xs font-semibold text-orange-700"
                >
                  {selectedBundle.status === "Active" ? "Deactivate" : "Activate"}
                </button>
                <button
                  type="button"
                  disabled={
                    selectedBundle.status !== "Active" ||
                    bundleMetrics(selectedBundle).available < 1
                  }
                  onClick={() => {
                    setSellQuantity(1);
                    setShowSell(true);
                  }}
                  className="rounded-lg bg-[#12213a] px-4 py-2 text-xs font-semibold text-white disabled:opacity-40"
                >
                  Sell Bundle
                </button>
              </div>
            </div>
          </div>
        )}

        {showSell && selectedBundle && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
              <div className="border-b border-slate-200 px-6 py-5">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">Sell Bundle</h2>
                  <span className="rounded-full bg-blue-100 px-2 py-1 text-[8px] font-bold text-blue-700">
                    BOM DEDUCTION
                  </span>
                </div>
                <p className="mt-1 text-[10px] text-slate-400">
                  {selectedBundle.name} · {selectedBundle.sku}
                </p>
              </div>

              <div className="space-y-4 p-6">
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Available bundles</span>
                    <strong className="text-sm text-emerald-700">
                      {bundleMetrics(selectedBundle).available}
                    </strong>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-[10px] font-semibold text-slate-600">
                    Quantity to sell
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={bundleMetrics(selectedBundle).available}
                    value={sellQuantity}
                    onChange={(event) =>
                      setSellQuantity(Math.max(1, Number(event.target.value) || 1))
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-blue-400"
                  />
                </div>

                <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                  <p className="text-[10px] font-bold text-amber-800">Stock deduction preview</p>
                  <div className="mt-2 space-y-1">
                    {selectedBundle.components.map((component) => {
                      const product = getProduct(component.productId);
                      return (
                        <div key={component.productId} className="flex justify-between text-[10px] text-amber-900">
                          <span>{product?.name ?? "Component"}</span>
                          <strong>−{component.quantity * sellQuantity}</strong>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowSell(false);
                    setSellQuantity(1);
                  }}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={sellBundle}
                  className="rounded-lg bg-[#12213a] px-5 py-2 text-xs font-semibold text-white"
                >
                  Confirm Sale
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
