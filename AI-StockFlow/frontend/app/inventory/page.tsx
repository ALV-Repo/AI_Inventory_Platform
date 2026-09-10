"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import PageLayout from "../../components/layout/PageLayout";
import useInventory, {
  InventoryProduct,
} from "../../hooks/useInventory";

type StockStatus =
  | "Healthy"
  | "Low Stock"
  | "Out of Stock";

type ProductVariant = {
  id: string;
  name: string;
  sku: string;
  size?: string;
  color?: string;
  onHand: number;
  reserved: number;
  reorderPoint: number;
  unitCost: number;
};

type Product = {
  id: number;
  name: string;
  sku: string;
  category: string;
  warehouse: string;
  onHand: number;
  reserved: number;
  reorderPoint: number;
  unitCost: number;
  costPrice?: number;
  transportCost?: number;
  mrp?: number;
  discountType?: "Percentage" | "Fixed";
  discountValue?: number;
  sellingPrice?: number;
  gstRate?: number;

  supplierName?: string;
  supplierContact?: string;
  supplierEmail?: string;

  productType?: "Simple" | "Variable";
  parentId?: number | null;
  variants?: ProductVariant[];
};

const categories = [
  "All",
  "Electronics",
  "Toys",
  "Sports",
  "Seasonal",
  "Home",
];

const warehouses = [
  "Main Store",
  "Warehouse A",
  "Warehouse B",
];

function getAvailable(product: Product) {
  return Math.max(
    product.onHand - product.reserved,
    0
  );
}

function getStatus(
  product: Product
): StockStatus {
  if (product.onHand === 0) {
    return "Out of Stock";
  }

  if (
    getAvailable(product) <=
    product.reorderPoint
  ) {
    return "Low Stock";
  }

  return "Healthy";
}

function formatCurrency(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

function mapInventoryProduct(
  item: InventoryProduct
): Product {
  return {
    id: Number(
      item.id ??
        item.product_id ??
        0
    ),

    name:
      item.name ??
      item.product_name ??
      "",

    sku:
      item.sku ??
      item.code ??
      "",

    category:
      item.category ??
      item.category_name ??
      "Uncategorized",

    warehouse:
      item.warehouse ??
      item.warehouse_name ??
      "Main Store",

    onHand: Number(
      item.on_hand ??
        item.quantity ??
        item.current_stock ??
        0
    ),

    reserved: Number(
      item.reserved ?? 0
    ),

    reorderPoint: Number(
      item.reorder_point ??
        item.reorder_level ??
        0
    ),

    unitCost: Number(
  item.unit_cost ??
    item.cost_price ??
    item.price ??
  0
),

costPrice: Number(
  item.cost_price ??
    item.costPrice ??
    item.unit_cost ??
    0
),

transportCost: Number(
  item.transport_cost ??
    item.transportCost ??
    0
),

mrp: Number(
  item.mrp ??
    item.maximum_retail_price ??
    item.selling_price ??
    item.sellingPrice ??
    item.sale_price ??
    item.price ??
    0
),

discountType:
  item.discount_type === "Fixed"
    ? "Fixed"
    : "Percentage",

discountValue: Number(
  item.discount_value ??
    item.discount ??
    0
),

sellingPrice: Number(
  item.selling_price ??
    item.sellingPrice ??
    item.sale_price ??
    item.price ??
    0
),

gstRate: Number(
  (
    item as InventoryProduct & {
      gst_rate?: number;
      tax_rate?: number;
      gstRate?: number;
      taxRate?: number;
    }
  ).gst_rate ??
    (
      item as InventoryProduct & {
        gst_rate?: number;
        tax_rate?: number;
        gstRate?: number;
        taxRate?: number;
      }
    ).tax_rate ??
    (
      item as InventoryProduct & {
        gst_rate?: number;
        tax_rate?: number;
        gstRate?: number;
        taxRate?: number;
      }
    ).gstRate ??
    (
      item as InventoryProduct & {
        gst_rate?: number;
        tax_rate?: number;
        gstRate?: number;
        taxRate?: number;
      }
    ).taxRate ??
        18
  ),

  supplierName:
    (item as InventoryProduct & {
      supplier_name?: string;
      supplierName?: string;
    }).supplier_name ??
    (item as InventoryProduct & {
      supplier_name?: string;
      supplierName?: string;
    }).supplierName ??
    "",

  supplierContact:
    (item as InventoryProduct & {
      supplier_contact?: string;
      supplierContact?: string;
    }).supplier_contact ??
    (item as InventoryProduct & {
      supplier_contact?: string;
      supplierContact?: string;
    }).supplierContact ??
    "",

  supplierEmail:
    (item as InventoryProduct & {
      supplier_email?: string;
      supplierEmail?: string;
    }).supplier_email ??
    (item as InventoryProduct & {
      supplier_email?: string;
      supplierEmail?: string;
    }).supplierEmail ??
    "",
  };
}

export default function InventoryPage() {
  const router = useRouter();

  /*
   * Inventory data now comes through the
   * useInventory hook.
   *
   * Flow:
   *
   * inventory/page.tsx
   *       ↓
   * useInventory()
   *       ↓
   * inventory.service.ts
   *       ↓
   * /inventory/products
   */

  const {
    products: inventoryProducts,
    loading,
    error,
  } = useInventory();

  /*
   * Keep a local Product[] state because the
   * existing inventory UI supports local actions
   * such as Add, Edit, Adjust, Transfer and
   * Cycle Count.
   */

  const [products, setProducts] =
    useState<Product[]>([]);

    const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  /*
   * Convert API products into the Product shape
   * used by the existing UI.
   */

  useEffect(() => {
  const mappedProducts =
    inventoryProducts.map(
      mapInventoryProduct
    );

  try {
    const storedProducts =
      localStorage.getItem("inventory-products");

    if (storedProducts) {
  const localProducts: Product[] =
    JSON.parse(storedProducts);

  const normalizedProducts =
    localProducts.map((product) => {
      const mrp =
        Number(product.mrp) > 0
          ? Number(product.mrp)
          : Number(product.sellingPrice) > 0
            ? Number(product.sellingPrice)
            : Number(product.unitCost);

      const discountValue =
        Number(product.discountValue ?? 0);

      const discountType =
        product.discountType ?? "Percentage";

      const sellingPrice =
        Number(product.sellingPrice) > 0
          ? Number(product.sellingPrice)
          : discountType === "Percentage"
            ? mrp - (mrp * discountValue) / 100
            : mrp - discountValue;

      return {
        ...product,
        mrp,
        sellingPrice: Math.max(sellingPrice, 0),
      };
    });

  setProducts(normalizedProducts);

  localStorage.setItem(
    "inventory-products",
    JSON.stringify(normalizedProducts)
  );
} else {
      setProducts(mappedProducts);

      localStorage.setItem(
        "inventory-products",
        JSON.stringify(mappedProducts)
      );
    }
  } catch {
    setProducts(mappedProducts);
  }
}, [inventoryProducts]);

  // --------------------------------------------------
  // FILTERS
  // --------------------------------------------------

  const [search, setSearch] =
    useState("");

  const [category, setCategory] =
    useState("All");

  const [warehouse, setWarehouse] =
    useState("All");

  const [stockStatus, setStockStatus] =
    useState("All");

  // --------------------------------------------------
  // ADD PRODUCT
  // --------------------------------------------------

  const [showAddProduct, setShowAddProduct] =
    useState(false);

  const [newProduct, setNewProduct] =
    useState({
      name: "",
      sku: "",
      productType:
        "Simple" as
          | "Simple"
          | "Variable",
      category: "Electronics",
      warehouse: "Main Store",
      quantity: "",
      reorderPoint: "10",
unitCost: "",
costPrice: "",
transportCost: "",
mrp: "",
discountType: "Percentage" as
  | "Percentage"
  | "Fixed",
discountValue: "",
supplierName: "",
supplierContact: "",
supplierEmail: "",
});

  const [newVariants, setNewVariants] =
    useState<ProductVariant[]>([]);

  // --------------------------------------------------
  // EDIT PRODUCT
  // --------------------------------------------------

  const [showEditProduct, setShowEditProduct] =
    useState(false);

  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

    const [showMassEdit, setShowMassEdit] =
  useState(false);

const [massEditField, setMassEditField] =
  useState<
    | "category"
    | "warehouse"
    | "reorderPoint"
    | "costPrice"
    | "mrp"
    | "discountType"
    | "discountValue"
  >("category");

const [massEditValue, setMassEditValue] =
  useState("");

  // --------------------------------------------------
  // STOCK ADJUSTMENT
  // --------------------------------------------------

  const [showAdjustment, setShowAdjustment] =
    useState(false);

  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null);

  const [adjustmentType, setAdjustmentType] =
    useState<
      "increase" | "decrease"
    >("increase");

  const [
    adjustmentQuantity,
    setAdjustmentQuantity,
  ] = useState("");

  const [
    adjustmentReason,
    setAdjustmentReason,
  ] = useState("");

  // --------------------------------------------------
  // TRANSFER STOCK
  // --------------------------------------------------

  const [showTransfer, setShowTransfer] =
    useState(false);

  const [transferProduct, setTransferProduct] =
    useState<Product | null>(null);

  const [transferFrom, setTransferFrom] =
    useState("");

  const [transferTo, setTransferTo] =
    useState("");

  const [
    transferQuantity,
    setTransferQuantity,
  ] = useState("");

  const [
    transferReason,
    setTransferReason,
  ] = useState("");

  // --------------------------------------------------
  // BARCODE SCANNER
  // --------------------------------------------------

  const [showBarcode, setShowBarcode] =
    useState(false);

  const [barcodeValue, setBarcodeValue] =
    useState("");

  const [barcodeProduct, setBarcodeProduct] =
    useState<Product | null>(null);

  // --------------------------------------------------
  // CYCLE COUNT
  // --------------------------------------------------

  const [showCycleCount, setShowCycleCount] =
    useState(false);

  const [cycleProduct, setCycleProduct] =
    useState<Product | null>(null);

  const [
    physicalQuantity,
    setPhysicalQuantity,
  ] = useState("");

  const [cycleReason, setCycleReason] =
    useState("");

  // --------------------------------------------------
  // FILTERED PRODUCTS
  // --------------------------------------------------

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const searchText = search
        .toLowerCase()
        .trim();

      const matchesSearch =
        product.name
          .toLowerCase()
          .includes(searchText) ||
        product.sku
          .toLowerCase()
          .includes(searchText);

      const matchesCategory =
        category === "All" ||
        product.category === category;

      const matchesWarehouse =
        warehouse === "All" ||
        product.warehouse === warehouse;

      const matchesStatus =
        stockStatus === "All" ||
        getStatus(product) ===
          stockStatus;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesWarehouse &&
        matchesStatus
      );
    });
  }, [
    products,
    search,
    category,
    warehouse,
    stockStatus,
  ]);

  // --------------------------------------------------
  // KPI VALUES
  // --------------------------------------------------

  const totalProducts =
    products.length;

  const totalUnits =
    products.reduce(
      (total, product) =>
        total + product.onHand,
      0
    );

  const stockValue =
    products.reduce(
      (total, product) =>
        total +
        product.onHand *
          product.unitCost,
      0
    );

  const needsAttention =
    products.filter(
      (product) =>
        getStatus(product) !==
        "Healthy"
    ).length;

  const lowStockCount =
    products.filter(
      (product) =>
        getStatus(product) ===
        "Low Stock"
    ).length;

  const outOfStockCount =
    products.filter(
      (product) =>
        getStatus(product) ===
        "Out of Stock"
    ).length;

  // --------------------------------------------------
  // VIEW PRODUCT
  // --------------------------------------------------

  function handleView(product: Product) {
  localStorage.setItem(
    "inventory-view-product",
    JSON.stringify(product)
  );

  router.push(`/inventory/${product.id}`);
}

  // --------------------------------------------------
  // ADD PRODUCT
  // --------------------------------------------------

  function handleAddProduct(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (
      !newProduct.name.trim() ||
      !newProduct.sku.trim()
    ) {
      alert(
        "Please enter product name and SKU."
      );
      return;
    }

    const quantity =
      newProduct.productType ===
      "Simple"
        ? Number(newProduct.quantity)
        : 0;

    const reorderPoint = Number(
      newProduct.reorderPoint
    );

    const unitCost = Number(
      newProduct.unitCost
    );

    const costPrice = Number(newProduct.costPrice);
const transportCost = Number(newProduct.transportCost);
const totalProductCost = costPrice + transportCost;
const mrp = Number(newProduct.mrp);
const discountValue = Number(newProduct.discountValue);

const calculatedMrp = Math.max(
  mrp,
  totalProductCost
);

const sellingPrice =
  newProduct.discountType === "Percentage"
    ? calculatedMrp - (calculatedMrp * discountValue) / 100
    : calculatedMrp - discountValue;

    if (
      (newProduct.productType ===
        "Simple" &&
        Number.isNaN(quantity)) ||
      Number.isNaN(reorderPoint) ||
      Number.isNaN(unitCost)
    ) {
      alert(
        "Please enter valid numbers."
      );
      return;
    }

    if (
  !Number.isFinite(costPrice) ||
  !Number.isFinite(transportCost) ||
  !Number.isFinite(mrp) ||
  !Number.isFinite(discountValue) ||
  costPrice < 0 ||
  transportCost < 0 ||
  mrp < 0 ||
  discountValue < 0
) {
  alert("Please enter valid pricing values.");
  return;
}

if (
  newProduct.discountType === "Percentage" &&
  discountValue > 100
) {
  alert("Percentage discount cannot exceed 100%.");
  return;
}

if (
  newProduct.discountType === "Fixed" &&
  discountValue > mrp
) {
  alert("Fixed discount cannot be greater than MRP.");
  return;
}

    if (
      newProduct.productType ===
      "Variable"
    ) {
      if (newVariants.length === 0) {
        alert(
          "Please add at least one product variant."
        );
        return;
      }

      const invalidVariant =
        newVariants.find(
          (variant) =>
            !variant.sku.trim()
        );

      if (invalidVariant) {
        alert(
          "Please enter a SKU for every product variant."
        );
        return;
      }

      const variantSkus =
        newVariants.map(
          (variant) =>
            variant.sku
              .trim()
              .toUpperCase()
        );

      const hasDuplicateVariantSku =
        new Set(
          variantSkus
        ).size !==
        variantSkus.length;

      if (hasDuplicateVariantSku) {
        alert(
          "Each product variant must have a unique SKU."
        );
        return;
      }
    }

    const product: Product = {
      id: Date.now(),

      name:
        newProduct.name.trim(),

      sku:
        newProduct.sku
          .trim()
          .toUpperCase(),

      productType:
        newProduct.productType,

      category:
        newProduct.category,

      warehouse:
        newProduct.warehouse,

      onHand:
        newProduct.productType ===
        "Variable"
          ? newVariants.reduce(
              (
                total,
                variant
              ) =>
                total +
                variant.onHand,
              0
            )
          : Math.max(
              quantity,
              0
            ),

      reserved: 0,

      reorderPoint:
        Math.max(
          reorderPoint,
          0
        ),

      unitCost:
        Math.max(
          unitCost,
          0
        ),

       costPrice: Math.max(costPrice, 0),
transportCost: Math.max(transportCost, 0),
mrp: Math.max(calculatedMrp, 0),
discountType: newProduct.discountType,
discountValue: Math.max(discountValue, 0),
sellingPrice: Math.max(sellingPrice, 0),

supplierName:
  newProduct.supplierName.trim(),
supplierContact:
  newProduct.supplierContact.trim(),
supplierEmail:
  newProduct.supplierEmail.trim(),

variants:
        newProduct.productType ===
        "Variable"
          ? newVariants
          : [],
    };

    setProducts((current) => {
  const updatedProducts = [
    ...current,
    product,
  ];

  localStorage.setItem(
    "inventory-products",
    JSON.stringify(updatedProducts)
  );

  return updatedProducts;
});

    setNewProduct({
  name: "",
  sku: "",
  productType:
    "Simple",
  category:
    "Electronics",
  warehouse:
    "Main Store",
  quantity: "",
  reorderPoint:
    "10",
  unitCost: "",
costPrice: "",
transportCost: "",
mrp: "",
discountType:
  "Percentage",
  discountValue: "",
  supplierName: "",
  supplierContact: "",
  supplierEmail: "",
});

    setNewVariants([]);

    setShowAddProduct(false);

    alert(
      "Product added successfully."
    );
  }

    // --------------------------------------------------
  // EXPORT PRODUCTS
  // --------------------------------------------------

  function handleExportProducts() {
    const headers = [
      "SKU",
      "Product Name",
      "Product Type",
      "Category",
      "Warehouse",
      "Quantity",
      "Reorder Point",
      "Unit Cost",
"Cost Price",
"Transport Cost",
"MRP",
      "Discount Type",
      "Discount Value",
      "Selling Price",
      "GST Rate",
      "Supplier Name",
      "Supplier Contact",
      "Supplier Email",
    ];

    const rows = products.map((product) => [
      product.sku,
      product.name,
      product.productType ?? "Simple",
      product.category,
      product.warehouse,
      product.onHand ?? 0,
      product.reorderPoint ?? 0,
      product.unitCost ?? 0,
product.costPrice ?? 0,
product.transportCost ?? 0,
product.mrp ?? 0,
      product.discountType ?? "Percentage",
      product.discountValue ?? 0,
      product.sellingPrice ?? 0,
      product.gstRate ?? 18,
      product.supplierName ?? "",
      product.supplierContact ?? "",
      product.supplierEmail ?? "",
    ]);

    const escapeCsvValue = (value: unknown) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const csv = [
      headers.map(escapeCsvValue).join(","),
      ...rows.map((row) =>
        row.map(escapeCsvValue).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `inventory-products-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

    // --------------------------------------------------
  // DOWNLOAD IMPORT TEMPLATE
  // --------------------------------------------------

  function handleDownloadTemplate() {
    const headers = [
      "SKU",
      "Product Name",
      "Product Type",
      "Category",
      "Warehouse",
      "Quantity",
      "Reorder Point",
      "Unit Cost",
"Cost Price",
"Transport Cost",
"MRP",
      "Discount Type",
      "Discount Value",
      "Selling Price",
      "GST Rate",
      "Supplier Name",
      "Supplier Contact",
      "Supplier Email",
    ];

    const exampleRow = [
      "SKU-001",
      "Sample Product",
      "Simple",
      "Electronics",
      "Main Store",
      "10",
      "5",
      "500",
"50",
"699",
      "Percentage",
      "10",
      "629.10",
      "18",
      "ABC Suppliers",
      "9876543210",
      "supplier@example.com",
    ];

    const escapeCsvValue = (value: unknown) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const csv = [
      headers.map(escapeCsvValue).join(","),
      exampleRow.map(escapeCsvValue).join(","),
    ].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "inventory-import-template.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

    // --------------------------------------------------
  // IMPORT PRODUCTS
  // --------------------------------------------------

  function handleImportProducts(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const text = String(reader.result ?? "");

      const parseCsvRow = (row: string) => {
        const values: string[] = [];
        let current = "";
        let insideQuotes = false;

        for (let i = 0; i < row.length; i++) {
          const char = row[i];

          if (char === '"') {
            if (insideQuotes && row[i + 1] === '"') {
              current += '"';
              i++;
            } else {
              insideQuotes = !insideQuotes;
            }
          } else if (char === "," && !insideQuotes) {
            values.push(current.trim());
            current = "";
          } else {
            current += char;
          }
        }

        values.push(current.trim());

        return values;
      };

      const lines = text
        .split(/\r?\n/)
        .filter((line) => line.trim());

      if (lines.length < 2) {
        alert("The CSV file does not contain any products.");
        return;
      }

      const headers = parseCsvRow(lines[0]);

      const headerIndex = (name: string) =>
        headers.findIndex(
          (header) =>
            header.trim().toLowerCase() === name.toLowerCase()
        );

      const skuIndex = headerIndex("SKU");
      const nameIndex = headerIndex("Product Name");

      if (skuIndex === -1 || nameIndex === -1) {
        alert(
          "Invalid CSV file. SKU and Product Name columns are required."
        );
        return;
      }

      const importedProducts = lines
        .slice(1)
        .map((line) => parseCsvRow(line))
        .filter(
          (row) =>
            row[skuIndex]?.trim() &&
            row[nameIndex]?.trim()
        );

      if (importedProducts.length === 0) {
        alert("No valid products were found in the CSV file.");
        return;
      }

      const getValue = (
        row: string[],
        column: string
      ) => {
        const index = headerIndex(column);
        return index >= 0 ? row[index] ?? "" : "";
      };

      const getNumber = (
        row: string[],
        column: string,
        fallback = 0
      ) => {
        const value = Number(getValue(row, column));
        return Number.isFinite(value) ? value : fallback;
      };

      setProducts((currentProducts) => {
        const updatedProducts = [...currentProducts];

        importedProducts.forEach((row, index) => {
          const sku = getValue(row, "SKU").trim();

          const importedProduct: Product = {
            id:
              Date.now() +
              index,
            name: getValue(
              row,
              "Product Name"
            ).trim(),
            sku,
            productType:
  (getValue(
    row,
    "Product Type"
  ) || "Simple") as "Simple" | "Variable",
            category:
              getValue(
                row,
                "Category"
              ) || "Electronics",
            warehouse:
              getValue(
                row,
                "Warehouse"
              ) || "Main Store",
            onHand: getNumber(
              row,
              "Quantity"
            ),
            reorderPoint: getNumber(
              row,
              "Reorder Point"
            ),
            unitCost: getNumber(
  row,
  "Unit Cost"
),
costPrice: getNumber(
  row,
  "Cost Price"
),
transportCost: getNumber(
  row,
  "Transport Cost"
),
mrp: getNumber(
  row,
  "MRP"
),
            discountType:
  (getValue(
    row,
    "Discount Type"
  ) || "Percentage") as "Percentage" | "Fixed",
            discountValue: getNumber(
              row,
              "Discount Value"
            ),
            sellingPrice: getNumber(
              row,
              "Selling Price"
            ),
            gstRate: getNumber(
              row,
              "GST Rate",
              18
            ),
            supplierName:
              getValue(
                row,
                "Supplier Name"
              ).trim(),
            supplierContact:
              getValue(
                row,
                "Supplier Contact"
              ).trim(),
            supplierEmail:
              getValue(
                row,
                "Supplier Email"
              ).trim(),
            reserved: 0,
            variants: [],
          };

          const existingIndex =
            updatedProducts.findIndex(
              (product) =>
                product.sku.toLowerCase() ===
                sku.toLowerCase()
            );

          if (existingIndex >= 0) {
            updatedProducts[existingIndex] = {
              ...updatedProducts[existingIndex],
              ...importedProduct,
              id: updatedProducts[existingIndex].id,
            };
          } else {
            updatedProducts.push(
              importedProduct
            );
          }
        });

        localStorage.setItem(
          "inventory-products",
          JSON.stringify(updatedProducts)
        );

        return updatedProducts;
      });

      alert(
        `${importedProducts.length} product(s) imported successfully.`
      );

      event.target.value = "";
    };

    reader.readAsText(file);
  }

  // --------------------------------------------------
  // EDIT PRODUCT
  // --------------------------------------------------

  function openEditProduct(
    product: Product
  ) {
    setEditingProduct({
      ...product,
    });

    setShowEditProduct(true);
  }

  function handleEditProduct(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!editingProduct) {
      return;
    }

    if (
      !editingProduct.name.trim() ||
      !editingProduct.sku.trim()
    ) {
      alert(
        "Please enter product name and SKU."
      );
      return;
    }

    if (
      !Number.isFinite(
        editingProduct.onHand
      ) ||
      editingProduct.onHand < 0
    ) {
      alert(
        "Enter a valid stock quantity."
      );
      return;
    }

    if (
      !Number.isFinite(
        editingProduct.reorderPoint
      ) ||
      editingProduct.reorderPoint < 0
    ) {
      alert(
        "Enter a valid reorder point."
      );
      return;
    }

    if (
      !Number.isFinite(
        editingProduct.unitCost
      ) ||
      editingProduct.unitCost < 0
    ) {
      alert(
        "Enter a valid unit cost."
      );
      return;
    }

        if (
  !Number.isFinite(
    editingProduct.costPrice ?? 0
  ) ||
  !Number.isFinite(
    editingProduct.transportCost ?? 0
  ) ||
  !Number.isFinite(
    editingProduct.mrp ?? 0
  ) ||
  !Number.isFinite(
    editingProduct.discountValue ?? 0
  ) ||
  (editingProduct.costPrice ?? 0) < 0 ||
  (editingProduct.transportCost ?? 0) < 0 ||
  (editingProduct.mrp ?? 0) < 0 ||
  (editingProduct.discountValue ?? 0) < 0
) {
  alert(
    "Please enter valid pricing values."
  );
  return;
}

    if (
      editingProduct.discountType ===
        "Percentage" &&
      (editingProduct.discountValue ?? 0) > 100
    ) {
      alert(
        "Percentage discount cannot exceed 100%."
      );
      return;
    }

    if (
      editingProduct.discountType === "Fixed" &&
      (editingProduct.discountValue ?? 0) >
        (editingProduct.mrp ?? 0)
    ) {
      alert(
        "Fixed discount cannot be greater than MRP."
      );
      return;
    }

    const costPrice = editingProduct.costPrice ?? 0;
const transportCost = editingProduct.transportCost ?? 0;
const totalProductCost = costPrice + transportCost;

const mrp = Math.max(
  editingProduct.mrp ?? 0,
  totalProductCost
);

const discountValue =
  editingProduct.discountValue ?? 0;

    const sellingPrice =
      editingProduct.discountType ===
      "Percentage"
        ? mrp - (mrp * discountValue) / 100
        : mrp - discountValue;

    setProducts((current) => {
  const updatedProducts = current.map(
    (product) =>
      product.id === editingProduct.id
        ? {
            ...editingProduct,
            ...editingProduct,
name: editingProduct.name.trim(),
sku: editingProduct.sku
  .trim()
  .toUpperCase(),
onHand: Number(editingProduct.onHand),
costPrice:
  editingProduct.costPrice ?? 0,
transportCost:
  editingProduct.transportCost ?? 0,
mrp: mrp,
            discountType:
              editingProduct.discountType ??
              "Percentage",
            discountValue:
              editingProduct.discountValue ?? 0,
            sellingPrice:
              Math.max(sellingPrice, 0),
          }
        : product
  );

  localStorage.setItem(
    "inventory-products",
    JSON.stringify(updatedProducts)
  );

  return updatedProducts;
});

    setShowEditProduct(false);

    setEditingProduct(null);

    alert(
      "Product updated successfully."
    );
  }

    // --------------------------------------------------
  // MASS EDIT PRODUCTS
  // --------------------------------------------------

  function handleMassEdit() {
    if (selectedProductIds.length === 0) {
      return;
    }

    if (!massEditValue.trim()) {
      alert("Please enter or select a value.");
      return;
    }

    let updatedProducts: Product[] = [];

    if (
      massEditField === "discountType" &&
      massEditValue !== "Percentage" &&
      massEditValue !== "Fixed"
    ) {
      alert("Please select a valid discount type.");
      return;
    }

    if (
      massEditField !== "category" &&
      massEditField !== "warehouse" &&
      massEditField !== "discountType"
    ) {
      const numericValue = Number(massEditValue);

      if (!Number.isFinite(numericValue) || numericValue < 0) {
        alert("Please enter a valid non-negative number.");
        return;
      }
    }

    updatedProducts = products.map((product) => {
      if (
        !selectedProductIds.includes(
          product.id.toString()
        )
      ) {
        return product;
      }

      if (massEditField === "category") {
        return {
          ...product,
          category: massEditValue,
        };
      }

      if (massEditField === "warehouse") {
        return {
          ...product,
          warehouse: massEditValue,
        };
      }

      if (massEditField === "reorderPoint") {
        return {
          ...product,
          reorderPoint: Number(massEditValue),
        };
      }

      if (massEditField === "costPrice") {
        return {
          ...product,
          costPrice: Number(massEditValue),
          unitCost: Number(massEditValue),
        };
      }

      if (massEditField === "mrp") {
        const mrp = Number(massEditValue);
        const discountValue =
          product.discountValue ?? 0;

        const sellingPrice =
          product.discountType === "Percentage"
            ? mrp - (mrp * discountValue) / 100
            : mrp - discountValue;

        return {
          ...product,
          mrp,
          sellingPrice: Math.max(sellingPrice, 0),
        };
      }

      if (massEditField === "discountType") {
        const discountType =
          massEditValue as
            | "Percentage"
            | "Fixed";

        const mrp = product.mrp ?? 0;
        const discountValue =
          product.discountValue ?? 0;

        if (
          discountType === "Percentage" &&
          discountValue > 100
        ) {
          return product;
        }

        if (
          discountType === "Fixed" &&
          discountValue > mrp
        ) {
          return product;
        }

        const sellingPrice =
          discountType === "Percentage"
            ? mrp - (mrp * discountValue) / 100
            : mrp - discountValue;

        return {
          ...product,
          discountType,
          sellingPrice: Math.max(
            sellingPrice,
            0
          ),
        };
      }

      if (massEditField === "discountValue") {
        const discountValue =
          Number(massEditValue);
        const mrp = product.mrp ?? 0;
        const discountType =
          product.discountType ?? "Percentage";

        if (
          discountType === "Percentage" &&
          discountValue > 100
        ) {
          return product;
        }

        if (
          discountType === "Fixed" &&
          discountValue > mrp
        ) {
          return product;
        }

        const sellingPrice =
          discountType === "Percentage"
            ? mrp -
              (mrp * discountValue) / 100
            : mrp - discountValue;

        return {
          ...product,
          discountValue,
          sellingPrice: Math.max(
            sellingPrice,
            0
          ),
        };
      }

      return product;
    });

    setProducts(updatedProducts);

    localStorage.setItem(
      "inventory-products",
      JSON.stringify(updatedProducts)
    );
    const updatedCount = selectedProductIds.length;

    setShowMassEdit(false);
    setMassEditValue("");
    setSelectedProductIds([]);

    alert(
  `${updatedCount} product(s) updated successfully.`
);
  }

    // --------------------------------------------------
  // MASS DELETE PRODUCTS
  // --------------------------------------------------

  function handleMassDelete() {
    if (selectedProductIds.length === 0) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedProductIds.length} selected product(s)?`
    );

    if (!confirmed) {
      return;
    }

    const selectedIds = new Set(selectedProductIds);

    const updatedProducts = products.filter(
      (product) =>
        !selectedIds.has(product.id.toString())
    );

    setProducts(updatedProducts);

    localStorage.setItem(
      "inventory-products",
      JSON.stringify(updatedProducts)
    );

    const deletedCount = selectedProductIds.length;

    setSelectedProductIds([]);

    alert(
      `${deletedCount} product(s) deleted successfully.`
    );
  }

  // --------------------------------------------------
  // STOCK ADJUSTMENT
  // --------------------------------------------------

  function openAdjustment(
    product: Product
  ) {
    setSelectedProduct(product);

    setAdjustmentType(
      "increase"
    );

    setAdjustmentQuantity("");

    setAdjustmentReason("");

    setShowAdjustment(true);
  }

  function handleAdjustment(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!selectedProduct) {
      return;
    }

    const quantity = Number(
      adjustmentQuantity
    );

    if (
      !Number.isFinite(quantity) ||
      quantity <= 0
    ) {
      alert(
        "Enter a valid quantity."
      );
      return;
    }

    if (
      adjustmentType ===
        "decrease" &&
      quantity >
        selectedProduct.onHand
    ) {
      alert(
        "Quantity cannot be greater than current stock."
      );
      return;
    }

    setProducts((current) => {
  const updatedProducts = current.map(
    (product) => {
      if (
        product.id !== selectedProduct.id
      ) {
        return product;
      }

      const newOnHand =
        adjustmentType === "increase"
          ? product.onHand + quantity
          : Math.max(
              product.onHand - quantity,
              0
            );

      return {
        ...product,
        onHand: newOnHand,
      };
    }
  );

  localStorage.setItem(
    "inventory-products",
    JSON.stringify(updatedProducts)
  );

  return updatedProducts;
});

    setShowAdjustment(false);

    setSelectedProduct(null);

    alert(
      "Stock adjusted successfully."
    );
  }

  // --------------------------------------------------
  // TRANSFER STOCK
  // --------------------------------------------------

  function openTransfer(
    product: Product
  ) {
    setTransferProduct(product);

    setTransferFrom(
      product.warehouse
    );

    const defaultDestination =
      warehouses.find(
        (item) =>
          item !==
          product.warehouse
      ) || "";

    setTransferTo(
      defaultDestination
    );

    setTransferQuantity("");

    setTransferReason("");

    setShowTransfer(true);
  }

  function handleTransfer(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!transferProduct) {
      return;
    }

    const quantity = Number(
      transferQuantity
    );

    if (
      !Number.isFinite(quantity) ||
      quantity <= 0
    ) {
      alert(
        "Enter a valid transfer quantity."
      );
      return;
    }

    if (
      !transferFrom ||
      !transferTo
    ) {
      alert(
        "Please select both warehouses."
      );
      return;
    }

    if (
      transferFrom ===
      transferTo
    ) {
      alert(
        "Source and destination warehouses must be different."
      );
      return;
    }

    if (
      quantity >
      transferProduct.onHand
    ) {
      alert(
        "Transfer quantity cannot exceed current stock."
      );
      return;
    }

    /*
     * Frontend demo:
     *
     * The selected product is moved to the
     * destination warehouse and its quantity
     * is reduced by the transferred amount.
     *
     * The real create → approve → dispatch
     * → receive workflow can later connect
     * to the backend API.
     */

    setProducts(
      (current) =>
        current.map(
          (product) => {
            if (
              product.id !==
              transferProduct.id
            ) {
              return product;
            }

            return {
              ...product,
              warehouse:
                transferTo,
              onHand:
                Math.max(
                  product.onHand -
                    quantity,
                  0
                ),
            };
          }
        )
    );

    setShowTransfer(false);

    setTransferProduct(null);

    alert(
      `Transfer created successfully.\n\n${quantity} units moved from ${transferFrom} to ${transferTo}.`
    );
  }

  // --------------------------------------------------
  // CYCLE COUNT
  // --------------------------------------------------

  function openCycleCount(
    product: Product
  ) {
    setCycleProduct(product);

    setPhysicalQuantity(
      product.onHand.toString()
    );

    setCycleReason("");

    setShowCycleCount(true);
  }

  function handleCycleCount(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!cycleProduct) {
      return;
    }

    const physical = Number(
      physicalQuantity
    );

    if (
      !Number.isFinite(
        physical
      ) ||
      physical < 0
    ) {
      alert(
        "Enter a valid physical quantity."
      );
      return;
    }

    setProducts(
      (current) =>
        current.map(
          (product) =>
            product.id ===
            cycleProduct.id
              ? {
                  ...product,
                  onHand:
                    physical,
                }
              : product
        )
    );

    setShowCycleCount(false);

    setCycleProduct(null);

    alert(
      "Cycle count completed successfully."
    );
  }

  // --------------------------------------------------
  // BARCODE SCANNER
  // --------------------------------------------------

  function handleBarcodeSearch() {
    const value =
      barcodeValue
        .trim()
        .toLowerCase();

    if (!value) {
      setBarcodeProduct(null);
      return;
    }

    const found =
      products.find(
        (product) =>
          product.sku
            .toLowerCase() ===
            value ||
          product.name
            .toLowerCase()
            .includes(value)
      );

    if (!found) {
      setBarcodeProduct(null);

      alert(
        "No product found for this barcode or SKU."
      );

      return;
    }

    setBarcodeProduct(found);
  }

  // --------------------------------------------------
  // LOADING / ERROR
  // --------------------------------------------------

  if (loading) {
    return (
      <PageLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-sm font-medium text-gray-500">
            Loading inventory...
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="p-6">
          <div className="rounded-xl border border-red-200 bg-red-50 p-5">
            <h2 className="text-sm font-bold text-red-800">
              Unable to load inventory
            </h2>

            <p className="mt-2 text-sm text-red-700">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
              className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-xs font-semibold text-white hover:bg-red-800"
            >
              Retry
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

    // --------------------------------------------------
  // CLEAR FILTERS
  // --------------------------------------------------

  function clearFilters() {
    setSearch("");
    setCategory("All");
    setWarehouse("All");
    setStockStatus("All");
  }

  // --------------------------------------------------
  // PAGE UI
  // --------------------------------------------------

  return (
    <PageLayout>
      <main className="min-h-screen bg-[#f8fafc] px-6 py-7 text-slate-900">

        <div className="mx-auto max-w-7xl">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <h1 className="text-2xl font-bold tracking-tight text-[#12213a]">
                Inventory
              </h1>

              <p className="mt-1 text-xs text-gray-500">
                Manage products, stock levels, warehouses
                and inventory operations.
              </p>

            </div>

            <div className="flex flex-wrap gap-2">

              <button
                type="button"
                onClick={() => {
                  setBarcodeValue("");
                  setBarcodeProduct(null);
                  setShowBarcode(true);
                }}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Scan Barcode
              </button>

              <button
                type="button"
                onClick={() => {
                  setTransferProduct(null);
                  setTransferFrom("");
                  setTransferTo("");
                  setTransferQuantity("");
                  setTransferReason("");
                  setShowTransfer(true);
                }}
                className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
              >
                Transfer Stock
              </button>

              <button
  type="button"
  onClick={handleExportProducts}
  className="rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-xs font-semibold text-green-700 hover:bg-green-100"
>
  Export Products
</button>

<label className="cursor-pointer rounded-lg border border-purple-200 bg-purple-50 px-4 py-2.5 text-xs font-semibold text-purple-700 hover:bg-purple-100">
  Import Products
  <input
    type="file"
    accept=".csv,text/csv"
    onChange={handleImportProducts}
    className="hidden"
  />
</label>

<button
  type="button"
  onClick={handleDownloadTemplate}
  className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
>
  Download Template
</button>

              <button
                type="button"
                onClick={() =>
                  setShowAddProduct(true)
                }
                className="rounded-lg bg-[#12213a] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#1d3055]"
              >
                + Add Product
              </button>

            </div>

          </div>

          {/* =================================================
              KPI CARDS
          ================================================= */}

          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

            {/* TOTAL PRODUCTS */}

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">

              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                Total Products
              </p>

              <p className="mt-2 text-2xl font-bold text-[#12213a]">
                {totalProducts}
              </p>

              <p className="mt-1 text-[10px] text-gray-500">
                Active products
              </p>

            </div>

            {/* TOTAL UNITS */}

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">

              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                Total Units
              </p>

              <p className="mt-2 text-2xl font-bold text-blue-600">
                {totalUnits.toLocaleString(
                  "en-IN"
                )}
              </p>

              <p className="mt-1 text-[10px] text-gray-500">
                Units currently in stock
              </p>

            </div>

            {/* STOCK VALUE */}

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">

              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                Stock Value
              </p>

              <p className="mt-2 text-2xl font-bold text-green-600">
                {formatCurrency(
                  stockValue
                )}
              </p>

              <p className="mt-1 text-[10px] text-gray-500">
                Current inventory value
              </p>

            </div>

            {/* NEEDS ATTENTION */}

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">

              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                Needs Attention
              </p>

              <p className="mt-2 text-2xl font-bold text-orange-500">
                {needsAttention}
              </p>

              <p className="mt-1 text-[10px] text-gray-500">
                {lowStockCount} low stock ·{" "}
                {outOfStockCount} out of stock
              </p>

            </div>

          </div>

          {/* =================================================
              FILTERS
          ================================================= */}

          <section className="mb-5 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">

            <div className="mb-3 flex items-center justify-between">

              <div>

                <h2 className="text-sm font-semibold text-[#12213a]">
                  Product Search & Filters
                </h2>

                <p className="mt-1 text-[10px] text-gray-400">
                  Search products and filter inventory
                  by category, warehouse or stock status.
                </p>

              </div>

              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-medium text-blue-600 hover:text-blue-800"
              >
                Clear Filters
              </button>

            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">

              {/* SEARCH */}

              <div>

                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                  Search
                </label>

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="Product name or SKU..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                />

              </div>

              {/* CATEGORY */}

              <div>

                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                  Category
                </label>

                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-xs outline-none focus:border-blue-500"
                >

                  {categories.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item === "All"
                          ? "All Categories"
                          : item}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* WAREHOUSE */}

              <div>

                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                  Warehouse
                </label>

                <select
                  value={warehouse}
                  onChange={(e) =>
                    setWarehouse(
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-xs outline-none focus:border-blue-500"
                >

                  <option value="All">
                    All Warehouses
                  </option>

                  {warehouses.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* STOCK STATUS */}

              <div>

                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                  Stock Status
                </label>

                <select
                  value={stockStatus}
                  onChange={(e) =>
                    setStockStatus(
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-xs outline-none focus:border-blue-500"
                >

                  <option value="All">
                    All Status
                  </option>

                  <option value="Healthy">
                    Healthy
                  </option>

                  <option value="Low Stock">
                    Low Stock
                  </option>

                  <option value="Out of Stock">
                    Out of Stock
                  </option>

                </select>

              </div>

            </div>

          </section>

          {/* =================================================
              PRODUCT TABLE
          ================================================= */}

          <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

            <div className="flex flex-col gap-3 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <h2 className="text-sm font-semibold text-[#12213a]">
                  Product List
                </h2>

                <p className="mt-1 text-[10px] text-gray-400">
                  Showing{" "}
                  {filteredProducts.length}{" "}
                  of{" "}
                  {products.length}{" "}
                  products
                </p>

                </div>

  {selectedProductIds.length > 0 && (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold text-gray-600">
        {selectedProductIds.length} selected
      </span>

      <button
  type="button"
  onClick={() => {
    setMassEditField("category");
    setMassEditValue("");
    setShowMassEdit(true);
  }}
  className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-[10px] font-semibold text-blue-700 hover:bg-blue-100"
>
  Mass Edit
</button>

      <button
  type="button"
  onClick={handleMassDelete}
  className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-[10px] font-semibold text-red-700 hover:bg-red-100"
>
  Mass Delete
</button>

      <button
        type="button"
        onClick={() => setSelectedProductIds([])}
        className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-[10px] font-semibold text-gray-600 hover:bg-gray-50"
      >
        Clear
      </button>
    </div>
  )}

  <div className="flex gap-2 text-[10px]">

    <span className="rounded-full bg-green-100 px-2.5 py-1 font-semibold text-green-700">
      Healthy
    </span>

                <span className="rounded-full bg-orange-100 px-2.5 py-1 font-semibold text-orange-700">
                  Low Stock
                </span>

                <span className="rounded-full bg-red-100 px-2.5 py-1 font-semibold text-red-700">
                  Out of Stock
                </span>

              </div>

            </div>

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1100px] border-collapse text-xs">

                <thead>

                  <tr className="border-b border-gray-200 bg-gray-50 text-left">

  <th className="px-4 py-3">
    <input
      type="checkbox"
      checked={
        products.length > 0 &&
        selectedProductIds.length === products.length
      }
      onChange={(e) => {
        if (e.target.checked) {
          setSelectedProductIds(
            products.map((product) => product.id.toString())
          );
        } else {
          setSelectedProductIds([]);
        }
      }}
      className="h-4 w-4 rounded border-gray-300"
    />
  </th>

  <th className="px-4 py-3 font-semibold text-gray-600">
    Product
  </th>

                    <th className="px-4 py-3 font-semibold text-gray-600">
                      Type
                    </th>

                    <th className="px-4 py-3 font-semibold text-gray-600">
                      Category
                    </th>

                    <th className="px-4 py-3 font-semibold text-gray-600">
                      Warehouse
                    </th>

                    <th className="px-4 py-3 font-semibold text-gray-600">
                      On Hand
                    </th>

                    <th className="px-4 py-3 font-semibold text-gray-600">
                      Reserved
                    </th>

                    <th className="px-4 py-3 font-semibold text-gray-600">
                      Available
                    </th>

                    <th className="px-4 py-3 font-semibold text-gray-600">
                      Status
                    </th>

                    <th className="px-4 py-3 font-semibold text-gray-600">
  Cost Price
</th>

<th className="px-4 py-3 font-semibold text-gray-600">
  Transport Cost
</th>

<th className="px-4 py-3 font-semibold text-gray-600">
  MRP
</th>

<th className="px-4 py-3 font-semibold text-gray-600">
  Discount
</th>

<th className="px-4 py-3 font-semibold text-gray-600">
  Selling Price
</th>

                    <th className="px-4 py-3 font-semibold text-gray-600">
  Supplier
</th>

<th className="px-4 py-3 font-semibold text-gray-600">
  Actions
</th>

                  </tr>

                </thead>

                <tbody>

                  {filteredProducts.map(
                    (product) => {

                      const status =
                        getStatus(
                          product
                        );

                      return (
  <tr
    key={product.id}
    className="border-b border-gray-100 transition hover:bg-gray-50"
  >

    {/* SELECT */}

    <td className="px-4 py-3">
      <input
        type="checkbox"
        checked={selectedProductIds.includes(
          product.id.toString()
        )}
        onChange={(e) => {
          if (e.target.checked) {
            setSelectedProductIds((current) => [
              ...current,
              product.id.toString(),
            ]);
          } else {
            setSelectedProductIds((current) =>
              current.filter(
                (id) => id !== product.id.toString()
              )
            );
          }
        }}
        className="h-4 w-4 rounded border-gray-300"
      />
    </td>

    {/* PRODUCT */}

    <td className="px-4 py-3">

                            <p className="font-semibold text-[#12213a]">
                              {
                                product.name
                              }
                            </p>

                            <p className="mt-0.5 font-mono text-[10px] text-gray-400">
                              {
                                product.sku
                              }
                            </p>

                          </td>

                          {/* TYPE */}

                          <td className="px-4 py-3">

                            <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-700">
                              {
                                product.productType ??
                                "Simple"
                              }
                            </span>

                          </td>

                          {/* CATEGORY */}

                          <td className="px-4 py-3 text-gray-600">
                            {
                              product.category
                            }
                          </td>

                          {/* WAREHOUSE */}

                          <td className="px-4 py-3 text-gray-600">
                            {
                              product.warehouse
                            }
                          </td>

                          {/* ON HAND */}

                          <td className="px-4 py-3 font-semibold text-gray-800">
                            {
                              product.onHand
                            }
                          </td>

                          {/* RESERVED */}

                          <td className="px-4 py-3 text-gray-500">
                            {
                              product.reserved
                            }
                          </td>

                          {/* AVAILABLE */}

                          <td className="px-4 py-3 font-semibold text-gray-800">
                            {
                              getAvailable(
                                product
                              )
                            }
                          </td>

                          {/* STATUS */}

                          <td className="px-4 py-3">

                            <span
                              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                                status ===
                                "Healthy"
                                  ? "bg-green-100 text-green-700"
                                  : status ===
                                    "Low Stock"
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {
                                status
                              }
                            </span>

                          </td>

                          {/* COST PRICE */}

<td className="px-4 py-3 font-medium text-gray-700">
  {formatCurrency(
    product.costPrice ?? product.unitCost
  )}
</td>

{/* TRANSPORT COST */}

<td className="px-4 py-3 font-medium text-gray-700">
  {formatCurrency(product.transportCost ?? 0)}
</td>

{/* MRP */}

<td className="px-4 py-3 font-medium text-gray-700">
  {formatCurrency(product.mrp ?? 0)}
</td>

{/* DISCOUNT */}

<td className="px-4 py-3 text-gray-600">
  {product.discountValue != null
    ? product.discountType === "Percentage"
      ? `${product.discountValue}%`
      : formatCurrency(product.discountValue)
    : "—"}
</td>

{/* SELLING PRICE */}

<td className="px-4 py-3 font-semibold text-green-700">
  {formatCurrency(
    product.sellingPrice ?? product.mrp ?? product.unitCost
  )}
</td>

{/* SUPPLIER */}

<td className="px-4 py-3">
  <div className="font-medium text-gray-700">
    {product.supplierName || "—"}
  </div>

  {product.supplierContact && (
    <div className="mt-0.5 text-[10px] text-gray-400">
      {product.supplierContact}
    </div>
  )}

  {product.supplierEmail && (
    <div className="mt-0.5 text-[10px] text-gray-400">
      {product.supplierEmail}
    </div>
  )}
</td>

{/* ACTIONS */}

                          <td className="px-4 py-3">

                            <div className="flex flex-wrap gap-1.5">

                              <button
                                type="button"
                                onClick={() =>
                                  handleView(
                                    product
                                  )
                                }
                                className="rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-[10px] font-medium text-gray-700 hover:bg-gray-50"
                              >
                                View
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  openEditProduct(
                                    product
                                  )
                                }
                                className="rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-[10px] font-medium text-blue-700 hover:bg-blue-100"
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  openAdjustment(
                                    product
                                  )
                                }
                                className="rounded-md border border-orange-200 bg-orange-50 px-2.5 py-1.5 text-[10px] font-medium text-orange-700 hover:bg-orange-100"
                              >
                                Adjust
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  openTransfer(
                                    product
                                  )
                                }
                                className="rounded-md border border-purple-200 bg-purple-50 px-2.5 py-1.5 text-[10px] font-medium text-purple-700 hover:bg-purple-100"
                              >
                                Transfer
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  openCycleCount(
                                    product
                                  )
                                }
                                className="rounded-md border border-green-200 bg-green-50 px-2.5 py-1.5 text-[10px] font-medium text-green-700 hover:bg-green-100"
                              >
                                Cycle Count
                              </button>

                            </div>

                          </td>

                        </tr>
                      );
                    }
                  )}

                  {filteredProducts.length ===
                    0 && (
                    <tr>

                      <td
                        colSpan={13}
                        className="px-4 py-12 text-center"
                      >

                        <p className="text-sm font-semibold text-gray-600">
                          No products found
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          Try changing your search
                          or filters.
                        </p>

                      </td>

                    </tr>
                  )}

                </tbody>

              </table>

            </div>

          </section>

        </div>

      </main>

      {/* =================================================
    MASS EDIT MODAL
================================================= */}
{showMassEdit && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-[#12213a]">
            Mass Edit Products
          </h2>
          <p className="mt-1 text-[10px] text-gray-400">
            Updating {selectedProductIds.length} selected product(s)
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowMassEdit(false)}
          className="text-lg text-gray-400 hover:text-gray-700"
        >
          ×
        </button>
      </div>

      <div className="space-y-4 p-5">
        <div>
          <label className="mb-1 block text-[10px] font-semibold text-gray-600">
            Field to update
          </label>

          <select
            value={massEditField}
            onChange={(e) => {
              setMassEditField(
                e.target.value as typeof massEditField
              );
              setMassEditValue("");
            }}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs outline-none focus:border-blue-500"
          >
            <option value="category">Category</option>
            <option value="warehouse">Warehouse</option>
            <option value="reorderPoint">Reorder Point</option>
            <option value="costPrice">Cost Price</option>
            <option value="mrp">MRP</option>
            <option value="discountType">Discount Type</option>
            <option value="discountValue">Discount Value</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-[10px] font-semibold text-gray-600">
            New value
          </label>

          {massEditField === "category" ? (
            <select
              value={massEditValue}
              onChange={(e) => setMassEditValue(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs outline-none focus:border-blue-500"
            >
              <option value="">Select category</option>
              {categories
                .filter((category) => category !== "All")
                .map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
            </select>
          ) : massEditField === "warehouse" ? (
            <select
              value={massEditValue}
              onChange={(e) => setMassEditValue(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs outline-none focus:border-blue-500"
            >
              <option value="">Select warehouse</option>
              {warehouses.map((warehouse) => (
                <option key={warehouse} value={warehouse}>
                  {warehouse}
                </option>
              ))}
            </select>
          ) : massEditField === "discountType" ? (
            <select
              value={massEditValue}
              onChange={(e) => setMassEditValue(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs outline-none focus:border-blue-500"
            >
              <option value="">Select discount type</option>
              <option value="Percentage">Percentage</option>
              <option value="Fixed">Fixed Amount</option>
            </select>
          ) : (
            <input
              type="number"
              min="0"
              step="0.01"
              value={massEditValue}
              onChange={(e) => setMassEditValue(e.target.value)}
              placeholder="Enter new value"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs outline-none focus:border-blue-500"
            />
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => setShowMassEdit(false)}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-[10px] font-semibold text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>

                    <button
            type="button"
            onClick={handleMassEdit}
            className="rounded-md bg-blue-600 px-4 py-2 text-[10px] font-semibold text-white hover:bg-blue-700"
          >
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  </div>
)}

            {/* =================================================
          ADD PRODUCT MODAL
      ================================================= */}

      {showAddProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl">

            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">

              <div>
                <h2 className="text-lg font-bold text-[#12213a]">
                  Add Product
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Create a new product and add it to inventory.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowAddProduct(false)
                }
                className="text-xl text-gray-400 hover:text-gray-700"
              >
                ×
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleAddProduct}
              className="max-h-[75vh] space-y-4 overflow-y-auto p-5"
            >

              {/* PRODUCT NAME */}

              <div>

                <label className="mb-1 block text-xs font-semibold text-gray-700">
                  Product Name
                </label>

                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct(
                      (current) => ({
                        ...current,
                        name: e.target.value,
                      })
                    )
                  }
                  placeholder="Enter product name"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  required
                />

              </div>

              {/* SKU */}

              <div>

                <label className="mb-1 block text-xs font-semibold text-gray-700">
                  SKU
                </label>

                <input
                  type="text"
                  value={newProduct.sku}
                  onChange={(e) =>
                    setNewProduct(
                      (current) => ({
                        ...current,
                        sku: e.target.value,
                      })
                    )
                  }
                  placeholder="e.g. PROD-001"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-mono outline-none focus:border-blue-500"
                  required
                />

              </div>

              {/* PRODUCT TYPE */}

              <div>

                <label className="mb-1 block text-xs font-semibold text-gray-700">
                  Product Type
                </label>

                <select
                  value={
                    newProduct.productType
                  }
                  onChange={(e) =>
                    setNewProduct(
                      (current) => ({
                        ...current,
                        productType:
                          e.target.value as
                            | "Simple"
                            | "Variable",
                      })
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                >

                  <option value="Simple">
                    Simple Product
                  </option>

                  <option value="Variable">
                    Variable Product
                  </option>

                </select>

                <p className="mt-1 text-[11px] text-gray-500">
                  Choose Variable Product if this product has different sizes, colors, or other variants.
                </p>

              </div>

              {/* PRODUCT VARIANTS */}

              {newProduct.productType ===
                "Variable" && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">

                  <div className="mb-3">

                    <h3 className="text-sm font-semibold text-[#12213a]">
                      Product Variants
                    </h3>

                    <p className="mt-1 text-[11px] text-gray-500">
                      Add individual variants with their own SKU, size, color and stock.
                    </p>

                  </div>

                  {newVariants.map(
                    (variant, index) => (
                      <div
                        key={
                          variant.id
                        }
                        className="mb-3 rounded-lg border border-gray-200 bg-white p-3"
                      >

                        <div className="mb-2 flex items-center justify-between">

                          <span className="text-xs font-semibold text-gray-600">
                            Variant{" "}
                            {index + 1}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              setNewVariants(
                                (current) =>
                                  current.filter(
                                    (item) =>
                                      item.id !==
                                      variant.id
                                  )
                              )
                            }
                            className="text-xs font-medium text-red-600 hover:text-red-700"
                          >
                            Remove
                          </button>

                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                          {/* SIZE */}

                          <div>

                            <label className="mb-1 block text-[11px] font-semibold text-gray-700">
                              Size
                            </label>

                            <input
                              type="text"
                              value={
                                variant.size ??
                                ""
                              }
                              onChange={(e) =>
                                setNewVariants(
                                  (current) =>
                                    current.map(
                                      (item) =>
                                        item.id ===
                                        variant.id
                                          ? {
                                              ...item,
                                              size: e.target.value,
                                            }
                                          : item
                                    )
                                )
                              }
                              placeholder="e.g. Small"
                              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                            />

                          </div>

                          {/* COLOR */}

                          <div>

                            <label className="mb-1 block text-[11px] font-semibold text-gray-700">
                              Color
                            </label>

                            <input
                              type="text"
                              value={
                                variant.color ??
                                ""
                              }
                              onChange={(e) =>
                                setNewVariants(
                                  (current) =>
                                    current.map(
                                      (item) =>
                                        item.id ===
                                        variant.id
                                          ? {
                                              ...item,
                                              color: e.target.value,
                                            }
                                          : item
                                    )
                                )
                              }
                              placeholder="e.g. Red"
                              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                            />

                          </div>

                          {/* VARIANT SKU */}

                          <div>

                            <label className="mb-1 block text-[11px] font-semibold text-gray-700">
                              Variant SKU
                            </label>

                            <input
                              type="text"
                              value={
                                variant.sku
                              }
                              onChange={(e) =>
                                setNewVariants(
                                  (current) =>
                                    current.map(
                                      (item) =>
                                        item.id ===
                                        variant.id
                                          ? {
                                              ...item,
                                              sku: e.target.value,
                                            }
                                          : item
                                    )
                                )
                              }
                              placeholder="e.g. SHIRT-S-RED"
                              className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm outline-none focus:border-blue-500"
                            />

                          </div>

                          {/* STOCK */}

                          <div>

                            <label className="mb-1 block text-[11px] font-semibold text-gray-700">
                              Stock
                            </label>

                            <input
                              type="number"
                              min="0"
                              value={
                                variant.onHand
                              }
                              onChange={(e) =>
                                setNewVariants(
                                  (current) =>
                                    current.map(
                                      (item) =>
                                        item.id ===
                                        variant.id
                                          ? {
                                              ...item,
                                              onHand:
                                                Math.max(
                                                  Number(
                                                    e.target.value
                                                  ),
                                                  0
                                                ),
                                            }
                                          : item
                                    )
                                )
                              }
                              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                            />

                          </div>

                        </div>

                      </div>
                    )
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      setNewVariants(
                        (current) => [
                          ...current,
                          {
                            id: `${Date.now()}-${current.length}`,
                            name: "",
                            sku: "",
                            size: "",
                            color: "",
                            onHand: 0,
                            reserved: 0,
                            reorderPoint: 0,
                            unitCost: 0,
                          },
                        ]
                      )
                    }
                    className="rounded-lg border border-blue-300 bg-white px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50"
                  >
                    + Add Variant
                  </button>

                </div>
              )}

              {/* CATEGORY / WAREHOUSE */}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                {/* CATEGORY */}

                <div>

                  <label className="mb-1 block text-xs font-semibold text-gray-700">
                    Category
                  </label>

                  <select
                    value={
                      newProduct.category
                    }
                    onChange={(e) =>
                      setNewProduct(
                        (current) => ({
                          ...current,
                          category:
                            e.target.value,
                        })
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  >

                    {categories
                      .filter(
                        (item) =>
                          item !== "All"
                      )
                      .map((item) => (
                        <option
                          key={item}
                          value={item}
                        >
                          {item}
                        </option>
                      ))}

                  </select>

                </div>

                {/* WAREHOUSE */}

                <div>

                  <label className="mb-1 block text-xs font-semibold text-gray-700">
                    Warehouse
                  </label>

                  <select
                    value={
                      newProduct.warehouse
                    }
                    onChange={(e) =>
                      setNewProduct(
                        (current) => ({
                          ...current,
                          warehouse:
                            e.target.value,
                        })
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  >

                    {warehouses.map(
                      (item) => (
                        <option
                          key={item}
                          value={item}
                        >
                          {item}
                        </option>
                      )
                    )}

                  </select>

                </div>

              </div>

              {/* QUANTITY / REORDER POINT */}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                {/* INITIAL QUANTITY — SIMPLE ONLY */}

                {newProduct.productType ===
                  "Simple" && (
                  <div>

                    <label className="mb-1 block text-xs font-semibold text-gray-700">
                      Initial Quantity
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={
                        newProduct.quantity
                      }
                      onChange={(e) =>
                        setNewProduct(
                          (current) => ({
                            ...current,
                            quantity:
                              e.target.value,
                          })
                        )
                      }
                      placeholder="0"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                      required
                    />

                  </div>
                )}

                {/* REORDER POINT */}

                <div>

                  <label className="mb-1 block text-xs font-semibold text-gray-700">
                    Reorder Point
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={
                      newProduct.reorderPoint
                    }
                    onChange={(e) =>
                      setNewProduct(
                        (current) => ({
                          ...current,
                          reorderPoint:
                            e.target.value,
                        })
                      )
                    }
                    placeholder="10"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    required
                  />

                </div>

              </div>

              {/* UNIT COST */}

              <div>

                <label className="mb-1 block text-xs font-semibold text-gray-700">
                  Unit Cost
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={
                    newProduct.unitCost
                  }
                  onChange={(e) =>
                    setNewProduct(
                      (current) => ({
                        ...current,
                        unitCost:
                          e.target.value,
                      })
                    )
                  }
                  placeholder="0.00"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  required
                />

              </div>

              {/* COST PRICE */}

              <div>

                <label className="mb-1 block text-xs font-semibold text-gray-700">
                  Cost Price
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newProduct.costPrice}
                  onChange={(e) =>
                    setNewProduct((current) => ({
                      ...current,
                      costPrice: e.target.value,
                    }))
                  }
                  placeholder="0.00"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />

              </div>

              {/* MRP */}

              <div>

                <label className="mb-1 block text-xs font-semibold text-gray-700">
                  MRP
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newProduct.mrp}
                  onChange={(e) =>
                    setNewProduct((current) => ({
                      ...current,
                      mrp: e.target.value,
                    }))
                  }
                  placeholder="0.00"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />

              </div>

              {/* DISCOUNT TYPE */}

              <div>

                <label className="mb-1 block text-xs font-semibold text-gray-700">
                  Discount Type
                </label>

                <select
                  value={newProduct.discountType}
                  onChange={(e) =>
                    setNewProduct((current) => ({
                      ...current,
                      discountType:
                        e.target.value as
                          | "Percentage"
                          | "Fixed",
                    }))
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                  <option value="Percentage">
                    Percentage
                  </option>

                  <option value="Fixed">
                    Fixed Amount
                  </option>
                </select>

              </div>

              {/* DISCOUNT VALUE */}

              <div>

                <label className="mb-1 block text-xs font-semibold text-gray-700">
                  Discount Value
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newProduct.discountValue}
                  onChange={(e) =>
                    setNewProduct((current) => ({
                      ...current,
                      discountValue: e.target.value,
                    }))
                  }
                  placeholder="0.00"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />

                            </div>

              {/* SUPPLIER DETAILS */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <h3 className="mb-3 text-sm font-semibold text-[#12213a]">
                  Supplier Details
                </h3>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-700">
                      Supplier Name
                    </label>
                    <input
                      type="text"
                      value={newProduct.supplierName ?? ""}
                      onChange={(e) =>
                        setNewProduct((current) => ({
                          ...current,
                          supplierName: e.target.value,
                        }))
                      }
                      placeholder="Enter supplier name"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-700">
                      Supplier Contact
                    </label>
                    <input
                      type="tel"
                      value={newProduct.supplierContact ?? ""}
                      onChange={(e) =>
                        setNewProduct((current) => ({
                          ...current,
                          supplierContact: e.target.value,
                        }))
                      }
                      placeholder="Phone number"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-semibold text-gray-700">
                      Supplier Email
                    </label>
                    <input
                      type="email"
                      value={newProduct.supplierEmail ?? ""}
                      onChange={(e) =>
                        setNewProduct((current) => ({
                          ...current,
                          supplierEmail: e.target.value,
                        }))
                      }
                      placeholder="supplier@example.com"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* BUTTONS */}
              <div className="flex justify-end gap-2 border-t border-gray-200 pt-4">

                <button
                  type="button"
                  onClick={() =>
                    setShowAddProduct(false)
                  }
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-[#12213a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1d3055]"
                >
                  Add Product
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

            {/* =================================================
          EDIT PRODUCT MODAL
      ================================================= */}

      {showEditProduct &&
        editingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

            <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl">

              {/* HEADER */}

              <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">

                <div>

                  <h2 className="text-lg font-bold text-[#12213a]">
                    Edit Product
                  </h2>

                  <p className="mt-1 text-xs text-gray-500">
                    Update product and inventory details.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowEditProduct(false);
                    setEditingProduct(null);
                  }}
                  className="text-xl text-gray-400 hover:text-gray-700"
                >
                  ×
                </button>

              </div>

              {/* FORM */}

              <form
                onSubmit={handleEditProduct}
                className="space-y-4 p-5"
              >

                {/* PRODUCT NAME */}

                <div>

                  <label className="mb-1 block text-xs font-semibold text-gray-700">
                    Product Name
                  </label>

                  <input
                    type="text"
                    value={
                      editingProduct.name
                    }
                    onChange={(e) =>
                      setEditingProduct(
                        (current) =>
                          current
                            ? {
                                ...current,
                                name:
                                  e.target.value,
                              }
                            : current
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    required
                  />

                </div>

                {/* SKU */}

                <div>

                  <label className="mb-1 block text-xs font-semibold text-gray-700">
                    SKU
                  </label>

                  <input
                    type="text"
                    value={
                      editingProduct.sku
                    }
                    onChange={(e) =>
                      setEditingProduct(
                        (current) =>
                          current
                            ? {
                                ...current,
                                sku:
                                  e.target.value,
                              }
                            : current
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-mono outline-none focus:border-blue-500"
                    required
                  />

                </div>

                {/* CATEGORY / WAREHOUSE */}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                  {/* CATEGORY */}

                  <div>

                    <label className="mb-1 block text-xs font-semibold text-gray-700">
                      Category
                    </label>

                    <select
                      value={
                        editingProduct.category
                      }
                      onChange={(e) =>
                        setEditingProduct(
                          (current) =>
                            current
                              ? {
                                  ...current,
                                  category:
                                    e.target.value,
                                }
                              : current
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    >

                      {categories
                        .filter(
                          (item) =>
                            item !== "All"
                        )
                        .map(
                          (item) => (
                            <option
                              key={item}
                              value={item}
                            >
                              {item}
                            </option>
                          )
                        )}

                    </select>

                  </div>

                  {/* WAREHOUSE */}

                  <div>

                    <label className="mb-1 block text-xs font-semibold text-gray-700">
                      Warehouse
                    </label>

                    <select
                      value={
                        editingProduct.warehouse
                      }
                      onChange={(e) =>
                        setEditingProduct(
                          (current) =>
                            current
                              ? {
                                  ...current,
                                  warehouse:
                                    e.target.value,
                                }
                              : current
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    >

                      {warehouses.map(
                        (item) => (
                          <option
                            key={item}
                            value={item}
                          >
                            {item}
                          </option>
                        )
                      )}

                    </select>

                  </div>

                </div>

                {/* STOCK / REORDER POINT */}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                  {/* CURRENT STOCK */}

                  <div>

                    <label className="mb-1 block text-xs font-semibold text-gray-700">
                      Current Stock
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={
                        editingProduct.onHand
                      }
                      onChange={(e) =>
                        setEditingProduct(
                          (current) =>
                            current
                              ? {
                                  ...current,
                                  onHand:
                                    Number(
                                      e.target.value
                                    ),
                                }
                              : current
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                      required
                    />

                  </div>

                  {/* REORDER POINT */}

                  <div>

                    <label className="mb-1 block text-xs font-semibold text-gray-700">
                      Reorder Point
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={
                        editingProduct.reorderPoint
                      }
                      onChange={(e) =>
                        setEditingProduct(
                          (current) =>
                            current
                              ? {
                                  ...current,
                                  reorderPoint:
                                    Number(
                                      e.target.value
                                    ),
                                }
                              : current
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                      required
                    />

                  </div>

                </div>

                {/* UNIT COST */}

                <div>

                  <label className="mb-1 block text-xs font-semibold text-gray-700">
                    Unit Cost
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      editingProduct.unitCost
                    }
                    onChange={(e) =>
                      setEditingProduct(
                        (current) =>
                          current
                            ? {
                                ...current,
                                unitCost:
                                  Number(
                                    e.target.value
                                  ),
                              }
                            : current
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    required
                  />

                </div>

{/* COST PRICE */}

<div>
  <label className="mb-1 block text-xs font-semibold text-gray-700">
    Cost Price
  </label>

  <input
    type="number"
    min="0"
    step="0.01"
    value={editingProduct.costPrice ?? ""}
    onChange={(e) =>
      setEditingProduct(
        (current) =>
          current
            ? {
                ...current,
                costPrice:
                  e.target.value === ""
                    ? undefined
                    : Number(e.target.value),
              }
            : current
      )
    }
    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
    placeholder="Enter cost price"
  />
</div>

{/* TRANSPORT COST */}

<div>
  <label className="mb-1 block text-xs font-semibold text-gray-700">
    Transport Cost
  </label>

  <input
    type="number"
    min="0"
    step="0.01"
    value={editingProduct.transportCost ?? ""}
    onChange={(e) =>
      setEditingProduct(
        (current) =>
          current
            ? {
                ...current,
                transportCost:
                  e.target.value === ""
                    ? undefined
                    : Number(e.target.value),
              }
            : current
      )
    }
    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
    placeholder="Enter transport cost"
  />
</div>

{/* MRP */}

<div>
  <label className="mb-1 block text-xs font-semibold text-gray-700">
    MRP
  </label>

  <input
    type="number"
    min="0"
    step="0.01"
    value={editingProduct.mrp ?? ""}
    onChange={(e) =>
      setEditingProduct(
        (current) =>
          current
            ? {
                ...current,
                mrp:
                  e.target.value === ""
                    ? undefined
                    : Number(e.target.value),
              }
            : current
      )
    }
    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
    placeholder="Enter MRP"
  />
</div>

{/* DISCOUNT TYPE */}

<div>
  <label className="mb-1 block text-xs font-semibold text-gray-700">
    Discount Type
  </label>

  <select
    value={
      editingProduct.discountType ??
      "Percentage"
    }
    onChange={(e) =>
      setEditingProduct(
        (current) =>
          current
            ? {
                ...current,
                discountType:
                  e.target.value as
                    | "Percentage"
                    | "Fixed",
              }
            : current
      )
    }
    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
  >
    <option value="Percentage">
      Percentage
    </option>
    <option value="Fixed">
      Fixed Amount
    </option>
  </select>
</div>

{/* DISCOUNT VALUE */}

<div>
  <label className="mb-1 block text-xs font-semibold text-gray-700">
    Discount Value
  </label>

  <input
    type="number"
    min="0"
    step="0.01"
    value={editingProduct.discountValue ?? ""}
    onChange={(e) =>
      setEditingProduct(
        (current) =>
          current
            ? {
                ...current,
                discountValue:
                  e.target.value === ""
                    ? undefined
                    : Number(e.target.value),
              }
            : current
      )
    }
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
/>
</div>

{/* GST RATE */}
<div>
  <label className="mb-1 block text-xs font-semibold text-gray-700">
    GST Rate (%)
  </label>

  <input
    type="number"
    min="0"
    max="100"
    step="0.01"
    value={editingProduct.gstRate ?? 18}
    onChange={(e) =>
      setEditingProduct(
        (current) =>
          current
            ? {
                ...current,
                gstRate:
                  e.target.value === ""
                    ? 0
                    : Number(e.target.value),
              }
            : current
      )
    }
    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
    placeholder="Enter GST rate"
  />
</div>

{/* SUPPLIER NAME */}
<div>
  <label className="mb-1 block text-xs font-semibold text-gray-700">
    Supplier Name
  </label>

  <input
    type="text"
    value={editingProduct.supplierName ?? ""}
    onChange={(e) =>
      setEditingProduct((current) =>
        current
          ? {
              ...current,
              supplierName: e.target.value,
            }
          : current
      )
    }
    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
    placeholder="Enter supplier name"
  />
</div>

{/* SUPPLIER CONTACT */}
<div>
  <label className="mb-1 block text-xs font-semibold text-gray-700">
    Supplier Contact
  </label>

  <input
    type="text"
    value={editingProduct.supplierContact ?? ""}
    onChange={(e) =>
      setEditingProduct((current) =>
        current
          ? {
              ...current,
              supplierContact: e.target.value,
            }
          : current
      )
    }
    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
    placeholder="Enter supplier contact"
  />
</div>

{/* SUPPLIER EMAIL */}
<div>
  <label className="mb-1 block text-xs font-semibold text-gray-700">
    Supplier Email
  </label>

  <input
    type="email"
    value={editingProduct.supplierEmail ?? ""}
    onChange={(e) =>
      setEditingProduct((current) =>
        current
          ? {
              ...current,
              supplierEmail: e.target.value,
            }
          : current
      )
    }
    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
    placeholder="Enter supplier email"
  />
</div>

                {/* VARIABLE PRODUCT INFO */}

                {editingProduct.productType ===
                  "Variable" && (
                  <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">

                    <p className="text-xs font-semibold text-blue-800">
                      Variable Product
                    </p>

                    <p className="mt-1 text-[11px] text-blue-700">
                      This product contains individual variants.
                      Variant-level editing can be connected
                      to the backend variant API later.
                    </p>

                    {editingProduct.variants &&
                      editingProduct.variants.length >
                        0 && (
                        <div className="mt-3 space-y-2">

                          {editingProduct.variants.map(
                            (
                              variant,
                              index
                            ) => (
                              <div
                                key={
                                  variant.id
                                }
                                className="rounded-md border border-blue-100 bg-white p-2"
                              >

                                <div className="flex items-center justify-between">

                                  <span className="text-[11px] font-semibold text-gray-700">
                                    Variant{" "}
                                    {index +
                                      1}
                                  </span>

                                  <span className="font-mono text-[10px] text-gray-500">
                                    {
                                      variant.sku
                                    }
                                  </span>

                                </div>

                                <p className="mt-1 text-[10px] text-gray-500">

                                  {variant.size
                                    ? `Size: ${variant.size}`
                                    : ""}

                                  {variant.size &&
                                  variant.color
                                    ? " · "
                                    : ""}

                                  {variant.color
                                    ? `Color: ${variant.color}`
                                    : ""}

                                  {" · Stock: "}
                                  {
                                    variant.onHand
                                  }

                                </p>

                              </div>
                            )
                          )}

                        </div>
                      )}

                  </div>
                )}

                {/* BUTTONS */}

                <div className="flex justify-end gap-2 border-t border-gray-200 pt-4">

                  <button
                    type="button"
                    onClick={() => {
                      setShowEditProduct(false);
                      setEditingProduct(null);
                    }}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="rounded-lg bg-[#12213a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1d3055]"
                  >
                    Save Changes
                  </button>

                </div>

              </form>

            </div>

          </div>
        )}

              {/* =================================================
          STOCK ADJUSTMENT MODAL
      ================================================= */}

      {showAdjustment &&
        selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

            <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">

              {/* HEADER */}

              <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">

                <div>

                  <h2 className="text-lg font-bold text-[#12213a]">
                    Adjust Stock
                  </h2>

                  <p className="mt-1 text-xs text-gray-500">
                    Update stock quantity for{" "}
                    {selectedProduct.name}.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowAdjustment(false);
                    setSelectedProduct(null);
                  }}
                  className="text-xl text-gray-400 hover:text-gray-700"
                >
                  ×
                </button>

              </div>

              {/* FORM */}

              <form
                onSubmit={handleAdjustment}
                className="space-y-4 p-5"
              >

                {/* PRODUCT */}

                <div className="rounded-lg bg-gray-50 p-3">

                  <p className="text-xs font-semibold text-gray-500">
                    Product
                  </p>

                  <p className="mt-1 text-sm font-bold text-gray-900">
                    {selectedProduct.name}
                  </p>

                  <p className="mt-1 font-mono text-xs text-gray-500">
                    {selectedProduct.sku}
                  </p>

                  <p className="mt-2 text-xs text-gray-500">
                    Current stock:{" "}
                    <span className="font-semibold text-gray-900">
                      {selectedProduct.onHand}
                    </span>
                  </p>

                </div>

                {/* ADJUSTMENT TYPE */}

                <div>

                  <label className="mb-1 block text-xs font-semibold text-gray-700">
                    Adjustment Type
                  </label>

                  <select
                    value={
                      adjustmentType
                    }
                    onChange={(e) =>
                      setAdjustmentType(
                        e.target.value as
                          | "increase"
                          | "decrease"
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  >

                    <option value="increase">
                      Increase Stock
                    </option>

                    <option value="decrease">
                      Decrease Stock
                    </option>

                  </select>

                </div>

                {/* QUANTITY */}

                <div>

                  <label className="mb-1 block text-xs font-semibold text-gray-700">
                    Quantity
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={
                      adjustmentQuantity
                    }
                    onChange={(e) =>
                      setAdjustmentQuantity(
                        e.target.value
                      )
                    }
                    placeholder="Enter quantity"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    required
                  />

                </div>

                {/* REASON */}

                <div>

                  <label className="mb-1 block text-xs font-semibold text-gray-700">
                    Reason
                  </label>

                  <textarea
                    value={
                      adjustmentReason
                    }
                    onChange={(e) =>
                      setAdjustmentReason(
                        e.target.value
                      )
                    }
                    placeholder="Enter reason for adjustment"
                    rows={3}
                    className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    required
                  />

                </div>

                {/* BUTTONS */}

                <div className="flex justify-end gap-2 border-t border-gray-200 pt-4">

                  <button
                    type="button"
                    onClick={() => {
                      setShowAdjustment(false);
                      setSelectedProduct(null);
                    }}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="rounded-lg bg-[#12213a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1d3055]"
                  >
                    Save Adjustment
                  </button>

                </div>

              </form>

            </div>

          </div>
        )}

              {/* =================================================
          STOCK TRANSFER MODAL
      ================================================= */}

      {showTransfer &&
        transferProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

            <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">

              {/* HEADER */}

              <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">

                <div>

                  <h2 className="text-lg font-bold text-[#12213a]">
                    Transfer Stock
                  </h2>

                  <p className="mt-1 text-xs text-gray-500">
                    Transfer inventory to another warehouse.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowTransfer(false);
                    setTransferProduct(null);
                  }}
                  className="text-xl text-gray-400 hover:text-gray-700"
                >
                  ×
                </button>

              </div>

              {/* FORM */}

              <form
                onSubmit={handleTransfer}
                className="space-y-4 p-5"
              >

                {/* PRODUCT */}

                <div className="rounded-lg bg-gray-50 p-3">

                  <p className="text-xs font-semibold text-gray-500">
                    Product
                  </p>

                  <p className="mt-1 text-sm font-bold text-gray-900">
                    {transferProduct.name}
                  </p>

                  <p className="mt-1 font-mono text-xs text-gray-500">
                    {transferProduct.sku}
                  </p>

                  <p className="mt-2 text-xs text-gray-500">
                    Available stock:{" "}
                    <span className="font-semibold text-gray-900">
                      {transferProduct.onHand}
                    </span>
                  </p>

                </div>

                {/* FROM / TO */}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                  {/* FROM WAREHOUSE */}

                  <div>

                    <label className="mb-1 block text-xs font-semibold text-gray-700">
                      From Warehouse
                    </label>

                    <select
                      value={transferFrom}
                      onChange={(e) =>
                        setTransferFrom(
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    >

                      <option value="">
                        Select warehouse
                      </option>

                      {warehouses.map(
                        (item) => (
                          <option
                            key={item}
                            value={item}
                          >
                            {item}
                          </option>
                        )
                      )}

                    </select>

                  </div>

                  {/* TO WAREHOUSE */}

                  <div>

                    <label className="mb-1 block text-xs font-semibold text-gray-700">
                      To Warehouse
                    </label>

                    <select
                      value={transferTo}
                      onChange={(e) =>
                        setTransferTo(
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    >

                      <option value="">
                        Select warehouse
                      </option>

                      {warehouses.map(
                        (item) => (
                          <option
                            key={item}
                            value={item}
                          >
                            {item}
                          </option>
                        )
                      )}

                    </select>

                  </div>

                </div>

                {/* QUANTITY */}

                <div>

                  <label className="mb-1 block text-xs font-semibold text-gray-700">
                    Quantity
                  </label>

                  <input
                    type="number"
                    min="1"
                    max={
                      transferProduct.onHand
                    }
                    value={
                      transferQuantity
                    }
                    onChange={(e) =>
                      setTransferQuantity(
                        e.target.value
                      )
                    }
                    placeholder="Enter quantity"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    required
                  />

                </div>

                {/* REASON */}

                <div>

                  <label className="mb-1 block text-xs font-semibold text-gray-700">
                    Reason
                  </label>

                  <textarea
                    value={
                      transferReason
                    }
                    onChange={(e) =>
                      setTransferReason(
                        e.target.value
                      )
                    }
                    placeholder="Enter transfer reason"
                    rows={3}
                    className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    required
                  />

                </div>

                {/* BUTTONS */}

                <div className="flex justify-end gap-2 border-t border-gray-200 pt-4">

                  <button
                    type="button"
                    onClick={() => {
                      setShowTransfer(false);
                      setTransferProduct(null);
                    }}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="rounded-lg bg-[#12213a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1d3055]"
                  >
                    Transfer Stock
                  </button>

                </div>

              </form>

            </div>

          </div>
        )}

                   {/* =================================================
          CYCLE COUNT MODAL
      ================================================= */}

      {showCycleCount &&
        cycleProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

            <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">

              <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">

                <div>
                  <h2 className="text-lg font-bold text-[#12213a]">
                    Cycle Count
                  </h2>

                  <p className="mt-1 text-xs text-gray-500">
                    Record the physically counted stock.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowCycleCount(false);
                    setCycleProduct(null);
                  }}
                  className="text-xl text-gray-400 hover:text-gray-700"
                >
                  ×
                </button>

              </div>

              <form
                onSubmit={handleCycleCount}
                className="space-y-4 p-5"
              >

                <div className="rounded-lg bg-gray-50 p-3">

                  <p className="text-xs font-semibold text-gray-500">
                    Product
                  </p>

                  <p className="mt-1 text-sm font-bold text-gray-900">
                    {cycleProduct.name}
                  </p>

                  <p className="mt-1 font-mono text-xs text-gray-500">
                    {cycleProduct.sku}
                  </p>

                  <p className="mt-2 text-xs text-gray-500">
                    System stock:{" "}
                    <span className="font-semibold text-gray-900">
                      {cycleProduct.onHand}
                    </span>
                  </p>

                </div>

                <div>

                  <label className="mb-1 block text-xs font-semibold text-gray-700">
                    Counted Quantity
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={physicalQuantity}
                    onChange={(e) =>
                      setPhysicalQuantity(
                        e.target.value
                      )
                    }
                    placeholder="Enter physically counted quantity"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    required
                  />

                </div>

                <div>

                  <label className="mb-1 block text-xs font-semibold text-gray-700">
                    Reason / Notes
                  </label>

                  <textarea
                    value={cycleReason}
                    onChange={(e) =>
                      setCycleReason(
                        e.target.value
                      )
                    }
                    placeholder="Enter count notes"
                    rows={3}
                    className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  />

                </div>

                <div className="flex justify-end gap-2 border-t border-gray-200 pt-4">

                  <button
                    type="button"
                    onClick={() => {
                      setShowCycleCount(false);
                      setCycleProduct(null);
                    }}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="rounded-lg bg-[#12213a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1d3055]"
                  >
                    Save Count
                  </button>

                </div>

              </form>

            </div>

          </div>
        )}


      {/* =================================================
          BARCODE SCANNER MODAL
      ================================================= */}

      {showBarcode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">

              <div>
                <h2 className="text-lg font-bold text-[#12213a]">
                  Barcode Scanner
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Scan or enter a product barcode.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowBarcode(false);
                  setBarcodeValue("");
                  setBarcodeProduct(null);
                }}
                className="text-xl text-gray-400 hover:text-gray-700"
              >
                ×
              </button>

            </div>

            <div className="space-y-5 p-5">

              <div className="flex h-44 items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50">

                <div className="text-center">

                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl shadow-sm">
                    ▣
                  </div>

                  <p className="mt-3 text-sm font-semibold text-gray-700">
                    Ready to scan
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Enter the barcode manually below.
                  </p>

                </div>

              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleBarcodeSearch();
                }}
                className="flex gap-2"
              >

                <input
                  type="text"
                  value={barcodeValue}
                  onChange={(e) =>
                    setBarcodeValue(
                      e.target.value
                    )
                  }
                  placeholder="Enter barcode / SKU"
                  className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  autoFocus
                />

                <button
                  type="submit"
                  className="rounded-lg bg-[#12213a] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1d3055]"
                >
                  Search
                </button>

              </form>

              {barcodeProduct && (
                <div className="rounded-xl border border-gray-200 bg-white p-4">

                  <div className="flex items-start justify-between gap-4">

                    <div>

                      <p className="text-sm font-bold text-gray-900">
                        {barcodeProduct.name}
                      </p>

                      <p className="mt-1 font-mono text-xs text-gray-500">
                        {barcodeProduct.sku}
                      </p>

                    </div>

                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                        getStatus(barcodeProduct) ===
                        "Healthy"
                          ? "bg-green-100 text-green-700"
                          : getStatus(barcodeProduct) ===
                            "Low Stock"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {getStatus(barcodeProduct)}
                    </span>

                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3">

                    <div className="rounded-lg bg-gray-50 p-3">

                      <p className="text-[10px] uppercase tracking-wide text-gray-500">
                        On Hand
                      </p>

                      <p className="mt-1 text-lg font-bold text-gray-900">
                        {barcodeProduct.onHand}
                      </p>

                    </div>

                    <div className="rounded-lg bg-gray-50 p-3">

                      <p className="text-[10px] uppercase tracking-wide text-gray-500">
                        Available
                      </p>

                      <p className="mt-1 text-lg font-bold text-gray-900">
                        {getAvailable(barcodeProduct)}
                      </p>

                    </div>

                    <div className="rounded-lg bg-gray-50 p-3">

                      <p className="text-[10px] uppercase tracking-wide text-gray-500">
                        Warehouse
                      </p>

                      <p className="mt-1 truncate text-sm font-bold text-gray-900">
                        {barcodeProduct.warehouse}
                      </p>

                    </div>

                  </div>

                </div>
              )}

              <div className="flex justify-end border-t border-gray-200 pt-4">

                <button
                  type="button"
                  onClick={() => {
                    setShowBarcode(false);
                    setBarcodeValue("");
                    setBarcodeProduct(null);
                  }}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>

              </div>

            </div>

          </div>

        </div>
      )}

            {/* =================================================
          FOOTER
      ================================================= */}

      <div className="py-8 text-center text-[10px] text-gray-400">
        AI StockFlow • Inventory Management
      </div>

    </PageLayout>
  );
}