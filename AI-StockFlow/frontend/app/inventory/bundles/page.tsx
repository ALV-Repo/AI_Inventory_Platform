"use client";

import { useMemo, useState } from "react";

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
};

const products: Product[] = [
  {
    id: "p1",
    name: "Bluetooth Speaker",
    sku: "ELC-BT-608",
    stock: 8,
    price: 2800,
  },
  {
    id: "p2",
    name: "Hot Wheels Track Set",
    sku: "TOY-HW-101",
    stock: 31,
    price: 1200,
  },
  {
    id: "p3",
    name: "Premium Cotton T-Shirt",
    sku: "APP-TS-001",
    stock: 50,
    price: 650,
  },
  {
    id: "p4",
    name: "Wireless Mouse",
    sku: "ELC-MS-201",
    stock: 25,
    price: 900,
  },
];

export default function BundlesPage() {
  const [bundles, setBundles] = useState<Bundle[]>([
    {
      id: "BND-001",
      name: "Entertainment Combo",
      sku: "BND-ENT-001",
      components: [
        { productId: "p1", quantity: 1 },
        { productId: "p2", quantity: 1 },
      ],
    },
  ]);

  const [showCreate, setShowCreate] = useState(false);
  const [bundleName, setBundleName] = useState("");
  const [bundleSku, setBundleSku] = useState("");
  const [components, setComponents] = useState<BundleComponent[]>([]);

  const getProduct = (productId: string) =>
    products.find((product) => product.id === productId);

  const bundleCost = useMemo(() => {
    return components.reduce((total, component) => {
      const product = getProduct(component.productId);

      return total + (product?.price || 0) * component.quantity;
    }, 0);
  }, [components]);

  const availableBundles = useMemo(() => {
    if (components.length === 0) return 0;

    return Math.min(
      ...components.map((component) => {
        const product = getProduct(component.productId);

        if (!product || component.quantity <= 0) {
          return 0;
        }

        return Math.floor(product.stock / component.quantity);
      })
    );
  }, [components]);

  const addComponent = () => {
    setComponents((current) => [
      ...current,
      {
        productId: products[0].id,
        quantity: 1,
      },
    ]);
  };

  const updateComponent = (
    index: number,
    field: "productId" | "quantity",
    value: string
  ) => {
    setComponents((current) =>
      current.map((component, componentIndex) => {
        if (componentIndex !== index) {
          return component;
        }

        return {
          ...component,
          [field]:
            field === "quantity" ? Number(value) : value,
        };
      })
    );
  };

  const removeComponent = (index: number) => {
    setComponents((current) =>
      current.filter((_, componentIndex) => componentIndex !== index)
    );
  };

  const resetForm = () => {
    setBundleName("");
    setBundleSku("");
    setComponents([]);
  };

  const handleCreateBundle = (e: React.FormEvent) => {
    e.preventDefault();

    if (!bundleName.trim() || !bundleSku.trim()) {
      alert("Please enter Bundle Name and SKU.");
      return;
    }

    if (components.length === 0) {
      alert("Please add at least one component product.");
      return;
    }

    const invalidComponent = components.some(
      (component) =>
        !component.productId || component.quantity <= 0
    );

    if (invalidComponent) {
      alert("Please select valid products and quantities.");
      return;
    }

    const newBundle: Bundle = {
      id: `BND-${String(bundles.length + 1).padStart(3, "0")}`,
      name: bundleName.trim(),
      sku: bundleSku.trim().toUpperCase(),
      components,
    };

    setBundles((current) => [...current, newBundle]);

    resetForm();
    setShowCreate(false);
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Bundles & Kits
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Create product bundles using existing inventory items.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            + Create Bundle
          </button>
        </div>

        {/* SUMMARY CARDS */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-xs font-medium text-slate-500">
              Total Bundles
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {bundles.length}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-xs font-medium text-slate-500">
              Available Bundle Units
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {bundles.reduce((total, bundle) => {
                if (bundle.components.length === 0) {
                  return total;
                }

                const available = Math.min(
                  ...bundle.components.map((component) => {
                    const product = getProduct(component.productId);

                    return product
                      ? Math.floor(
                          product.stock / component.quantity
                        )
                      : 0;
                  })
                );

                return total + available;
              }, 0)}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-xs font-medium text-slate-500">
              Component Products
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {new Set(
                bundles.flatMap((bundle) =>
                  bundle.components.map(
                    (component) => component.productId
                  )
                )
              ).size}
            </p>
          </div>

        </div>

        {/* BUNDLE TABLE */}
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">

          <div className="border-b px-5 py-4">
            <h2 className="font-semibold text-slate-900">
              Bundle List
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">

              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">Bundle</th>
                  <th className="px-5 py-3">SKU</th>
                  <th className="px-5 py-3">Components</th>
                  <th className="px-5 py-3">Bundle Cost</th>
                  <th className="px-5 py-3">Available</th>
                </tr>
              </thead>

              <tbody className="divide-y">

                {bundles.map((bundle) => {

                  const cost = bundle.components.reduce(
                    (total, component) => {
                      const product = getProduct(component.productId);

                      return (
                        total +
                        (product?.price || 0) * component.quantity
                      );
                    },
                    0
                  );

                  const available = Math.min(
                    ...bundle.components.map((component) => {
                      const product = getProduct(component.productId);

                      return product
                        ? Math.floor(
                            product.stock / component.quantity
                          )
                        : 0;
                    })
                  );

                  return (
                    <tr key={bundle.id}>

                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-900">
                          {bundle.name}
                        </p>

                        <p className="text-xs text-slate-500">
                          {bundle.id}
                        </p>
                      </td>

                      <td className="px-5 py-4 font-medium text-slate-700">
                        {bundle.sku}
                      </td>

                      <td className="px-5 py-4">
                        <div className="space-y-1">

                          {bundle.components.map((component, componentIndex) => {
                            const product = getProduct(
                              component.productId
                            );

                            return (
                              <div
                                key={`${bundle.id}-${component.productId}-${componentIndex}`}
                                className="text-xs text-slate-600"
                              >
                                {product?.name} × {component.quantity}
                              </div>
                            );
                          })}

                        </div>
                      </td>

                      <td className="px-5 py-4 font-medium">
                        ₹{cost.toLocaleString("en-IN")}
                      </td>

                      <td className="px-5 py-4">

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            available > 0
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {available}
                        </span>

                      </td>

                    </tr>
                  );
                })}

              </tbody>
            </table>
          </div>
        </div>

        {/* CREATE BUNDLE MODAL */}
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

            <div className="w-full max-w-3xl rounded-xl bg-white shadow-2xl">

              <div className="flex items-center justify-between border-b px-5 py-4">

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Create Bundle / Kit
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Combine existing products into one sellable bundle.
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

              <form
                onSubmit={handleCreateBundle}
                className="space-y-5 p-5"
              >

                {/* BASIC DETAILS */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                      Bundle Name
                    </label>

                    <input
                      value={bundleName}
                      onChange={(e) =>
                        setBundleName(e.target.value)
                      }
                      placeholder="Example: Festival Combo"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                      Bundle SKU
                    </label>

                    <input
                      value={bundleSku}
                      onChange={(e) =>
                        setBundleSku(e.target.value)
                      }
                      placeholder="Example: BND-FEST-001"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm uppercase outline-none focus:border-blue-500"
                    />
                  </div>

                </div>

                {/* COMPONENT PRODUCTS */}
                <div>

                  <div className="mb-3 flex items-center justify-between">

                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">
                        Component Products
                      </h3>

                      <p className="text-xs text-slate-500">
                        Select products and required quantities.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={addComponent}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      + Add Component
                    </button>

                  </div>

                  {components.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                      No component products added.
                    </div>
                  ) : (
                    <div className="space-y-3">

                      {components.map((component, index) => {

                        const product = getProduct(
                          component.productId
                        );

                        return (
                          <div
                            key={index}
                            className="grid grid-cols-1 gap-3 rounded-lg border bg-slate-50 p-3 md:grid-cols-[1fr_120px_auto]"
                          >

                            <select
                              value={component.productId}
                              onChange={(e) =>
                                updateComponent(
                                  index,
                                  "productId",
                                  e.target.value
                                )
                              }
                              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                            >
                              {products.map((item) => (
                                <option
                                  key={item.id}
                                  value={item.id}
                                >
                                  {item.name} ({item.sku})
                                </option>
                              ))}
                            </select>

                            <input
                              type="number"
                              min="1"
                              value={component.quantity}
                              onChange={(e) =>
                                updateComponent(
                                  index,
                                  "quantity",
                                  e.target.value
                                )
                              }
                              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                            />

                            <button
                              type="button"
                              onClick={() =>
                                removeComponent(index)
                              }
                              className="rounded-lg px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                            >
                              Remove
                            </button>

                            <div className="md:col-span-3 text-xs text-slate-500">
                              Available stock:{" "}
                              <span className="font-semibold text-slate-700">
                                {product?.stock ?? 0}
                              </span>
                            </div>

                          </div>
                        );
                      })}

                    </div>
                  )}
                </div>

                {/* PREVIEW */}
                <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                    <div>
                      <p className="text-xs text-blue-600">
                        Bundle Cost
                      </p>

                      <p className="mt-1 text-lg font-bold text-blue-900">
                        ₹{bundleCost.toLocaleString("en-IN")}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-blue-600">
                        Available Bundles
                      </p>

                      <p className="mt-1 text-lg font-bold text-blue-900">
                        {components.length > 0
                          ? availableBundles
                          : 0}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-blue-600">
                        Components
                      </p>

                      <p className="mt-1 text-lg font-bold text-blue-900">
                        {components.length}
                      </p>
                    </div>

                  </div>
                </div>

                {/* ACTIONS */}
                <div className="flex justify-end gap-3 border-t pt-4">

                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setShowCreate(false);
                    }}
                    className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    Create Bundle
                  </button>

                </div>

              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}