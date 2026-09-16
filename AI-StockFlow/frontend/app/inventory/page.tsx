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

type LowStockAlertChannel = "In-App" | "Email" | "Push";

type LowStockAlertRule = {
  id: string;
  productId: number;
  warehouse: string;
  enabled: boolean;
  threshold: number;
  channels: LowStockAlertChannel[];
  updatedAt: string;
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
  moq?: number;
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

    moq: Math.max(
  Number(
    (item as InventoryProduct & {
      moq?: number;
      minimum_order_quantity?: number;
    }).moq ??
      (item as InventoryProduct & {
        moq?: number;
        minimum_order_quantity?: number;
      }).minimum_order_quantity ??
      1
  ),
  1
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

  const [warehouses, setWarehouses] = useState<string[]>([
  "Main Store",
]);

useEffect(() => {
  try {
    const storedWarehouses = localStorage.getItem(
      "inventory-warehouses"
    );

    if (!storedWarehouses) {
      return;
    }

    const savedWarehouses = JSON.parse(
      storedWarehouses
    );

    if (Array.isArray(savedWarehouses)) {
      const warehouseNames = savedWarehouses
        .map((warehouse) => warehouse?.name)
        .filter(
          (name): name is string =>
            typeof name === "string" &&
            name.trim().length > 0
        );

      setWarehouses(
        Array.from(
          new Set(["Main Store", ...warehouseNames])
        )
      );
    }
  } catch {
    setWarehouses(["Main Store"]);
  }
}, []);

  useEffect(() => {
    try {
      const storedRules = localStorage.getItem(
        "inventory-low-stock-alert-rules"
      );

      if (!storedRules) {
        return;
      }

      const parsedRules = JSON.parse(storedRules);

      if (Array.isArray(parsedRules)) {
        setAlertRules(parsedRules);
      }
    } catch {
      setAlertRules([]);
    }
  }, []);

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
      moq: "1",
      unitCost: "",
costPrice: "",
transportCost: "",
mrp: "",
discountType: "Percentage" as
  | "Percentage"
  | "Fixed",
discountValue: "",
gstRate: "18",
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
    | "moq"
    | "costPrice"
    | "transportCost"
    | "mrp"
    | "discountType"
    | "discountValue"
    | "gstRate"
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
  // LOW-STOCK ALERTS — FR-INV-11
  // --------------------------------------------------

  const [showLowStockAlerts, setShowLowStockAlerts] =
    useState(false);
  const [alertRules, setAlertRules] =
    useState<LowStockAlertRule[]>([]);
  const [alertRuleProductId, setAlertRuleProductId] =
    useState("");
  const [alertRuleWarehouse, setAlertRuleWarehouse] =
    useState("Main Store");
  const [alertRuleThreshold, setAlertRuleThreshold] =
    useState("");
  const [alertRuleChannels, setAlertRuleChannels] =
    useState<LowStockAlertChannel[]>(["In-App"]);
  const [alertRuleEnabled, setAlertRuleEnabled] =
    useState(true);
  const [alertSearch, setAlertSearch] =
    useState("");
  const [alertStatusFilter, setAlertStatusFilter] =
    useState<"All" | "Active" | "Healthy">("All");


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
          ((product.costPrice ?? product.unitCost ?? 0) +
            (product.transportCost ?? 0)),
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

  const getAlertRule = (
    product: Product,
    targetWarehouse = product.warehouse
  ) =>
    alertRules.find(
      (rule) =>
        rule.productId === product.id &&
        rule.warehouse === targetWarehouse
    );

  const lowStockAlerts = useMemo(() => {
    const query = alertSearch.toLowerCase().trim();

    return products
      .map((product) => {
        const rule = alertRules.find(
          (item) =>
            item.productId === product.id &&
            item.warehouse === product.warehouse
        );
        const threshold =
          rule?.threshold ?? product.reorderPoint;
        const enabled = rule?.enabled ?? true;
        const available = getAvailable(product);

        return {
          product,
          rule,
          threshold,
          available,
          active: enabled && available <= threshold,
        };
      })
      .filter((item) => {
        const matchesSearch =
          !query ||
          item.product.name.toLowerCase().includes(query) ||
          item.product.sku.toLowerCase().includes(query) ||
          item.product.warehouse.toLowerCase().includes(query);

        const matchesStatus =
          alertStatusFilter === "All" ||
          (alertStatusFilter === "Active"
            ? item.active
            : !item.active);

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (a.active !== b.active) {
          return a.active ? -1 : 1;
        }
        return a.available - b.available;
      });
  }, [products, alertRules, alertSearch, alertStatusFilter]);

  const activeLowStockAlerts = useMemo(
    () =>
      products.filter((product) => {
        const rule = alertRules.find(
          (item) =>
            item.productId === product.id &&
            item.warehouse === product.warehouse
        );
        const threshold =
          rule?.threshold ?? product.reorderPoint;

        return (
          (rule?.enabled ?? true) &&
          getAvailable(product) <= threshold
        );
      }).length,
    [products, alertRules]
  );

  function persistAlertRules(
    nextRules: LowStockAlertRule[]
  ) {
    setAlertRules(nextRules);
    localStorage.setItem(
      "inventory-low-stock-alert-rules",
      JSON.stringify(nextRules)
    );
  }

  function resetAlertRuleForm() {
    const firstProduct = products[0];

    setAlertRuleProductId(
      firstProduct ? firstProduct.id.toString() : ""
    );
    setAlertRuleWarehouse(
      firstProduct?.warehouse ||
        warehouses[0] ||
        "Main Store"
    );
    setAlertRuleThreshold(
      firstProduct
        ? String(
            getAlertRule(firstProduct)?.threshold ??
              firstProduct.reorderPoint
          )
        : "0"
    );
    setAlertRuleChannels(["In-App"]);
    setAlertRuleEnabled(true);
  }

  function openLowStockAlerts() {
    resetAlertRuleForm();
    setShowLowStockAlerts(true);
  }

  function loadAlertRule(
    productId: string,
    targetWarehouse?: string
  ) {
    const product = products.find(
      (item) => item.id.toString() === productId
    );

    if (!product) {
      return;
    }

    const warehouseName =
      targetWarehouse || product.warehouse;

    const rule = alertRules.find(
      (item) =>
        item.productId === product.id &&
        item.warehouse === warehouseName
    );

    setAlertRuleProductId(productId);
    setAlertRuleWarehouse(warehouseName);
    setAlertRuleThreshold(
      String(rule?.threshold ?? product.reorderPoint)
    );
    setAlertRuleChannels(
      rule?.channels?.length
        ? rule.channels
        : ["In-App"]
    );
    setAlertRuleEnabled(rule?.enabled ?? true);
  }

  function toggleAlertChannel(
    channel: LowStockAlertChannel
  ) {
    setAlertRuleChannels((current) =>
      current.includes(channel)
        ? current.filter((item) => item !== channel)
        : [...current, channel]
    );
  }

  function handleSaveAlertRule() {
    const product = products.find(
      (item) =>
        item.id.toString() === alertRuleProductId
    );
    const threshold = Number(alertRuleThreshold);

    if (!product) {
      alert("Please select a product.");
      return;
    }

    if (!Number.isFinite(threshold) || threshold < 0) {
      alert("Enter a valid non-negative alert threshold.");
      return;
    }

    if (alertRuleChannels.length === 0) {
      alert("Select at least one notification channel.");
      return;
    }

    const ruleId =
      `${product.id}:${alertRuleWarehouse}`;

    const nextRule: LowStockAlertRule = {
      id: ruleId,
      productId: product.id,
      warehouse: alertRuleWarehouse,
      enabled: alertRuleEnabled,
      threshold,
      channels: alertRuleChannels,
      updatedAt: new Date().toISOString(),
    };

    persistAlertRules([
      ...alertRules.filter(
        (rule) => rule.id !== ruleId
      ),
      nextRule,
    ]);

    alert(
      `Low-stock alert rule saved for ${product.name} at ${alertRuleWarehouse}.`
    );
  }

  function handleDeleteAlertRule(
    productId: number,
    targetWarehouse: string
  ) {
    persistAlertRules(
      alertRules.filter(
        (rule) =>
          !(
            rule.productId === productId &&
            rule.warehouse === targetWarehouse
          )
      )
    );
  }

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
const gstRate = Number(newProduct.gstRate);

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
  !Number.isFinite(gstRate) ||
  costPrice < 0 ||
  transportCost < 0 ||
  mrp < 0 ||
  discountValue < 0 ||
  gstRate < 0 ||
  gstRate > 100
) {
  alert("Please enter valid pricing and GST values.");
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
  discountValue > calculatedMrp
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

        moq:
  Math.max(
    Number(newProduct.moq),
    1
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
gstRate: gstRate,

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
    moq: "1",
  unitCost: "",
costPrice: "",
transportCost: "",
mrp: "",
discountType:
  "Percentage",
  discountValue: "",
  gstRate: "18",
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
"MOQ",
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
product.moq ?? 1,
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
"MOQ",
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
      "1",
      "500",
      "450",
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

            const invalidRows = importedProducts.filter((row) => {
        const numericColumns = [
          "Quantity",
          "Reorder Point",
          "MOQ",
          "Unit Cost",
          "Cost Price",
          "Transport Cost",
          "MRP",
          "Discount Value",
          "Selling Price",
          "GST Rate",
        ];

        return numericColumns.some((column) => {
          const value = getValue(row, column).trim();

          if (!value) {
            return false;
          }

          return !Number.isFinite(Number(value));
        });
      });

            if (invalidRows.length > 0) {
        alert(
          `${invalidRows.length} row(s) contain invalid numeric values. Please correct the CSV and try again.`
        );
        return;
      }

      setProducts((currentProducts) => {
        const updatedProducts = [...currentProducts];

        importedProducts.forEach((row, index) => {
          const sku = getValue(row, "SKU").trim();

          const importedCostPrice = getNumber(
            row,
            "Cost Price"
          );

          const importedTransportCost = getNumber(
            row,
            "Transport Cost"
          );

          const importedTotalProductCost =
            importedCostPrice + importedTransportCost;

          const importedMrp = Math.max(
            getNumber(row, "MRP"),
            importedTotalProductCost
          );

          const importedDiscountType =
            (getValue(row, "Discount Type") ||
              "Percentage") as "Percentage" | "Fixed";

          const importedDiscountValue =
            getNumber(row, "Discount Value");

          const importedSellingPrice =
            importedDiscountType === "Percentage"
              ? importedMrp -
                (importedMrp * importedDiscountValue) / 100
              : importedMrp - importedDiscountValue;

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
moq: Math.max(
  getNumber(row, "MOQ", 1),
  1
),
            unitCost: getNumber(
  row,
  "Unit Cost"
),
costPrice: importedCostPrice,
            transportCost: importedTransportCost,
            mrp: importedMrp,
            discountType: importedDiscountType,
            discountValue: importedDiscountValue,
            sellingPrice: Math.max(importedSellingPrice, 0),
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
  !Number.isFinite(
    editingProduct.gstRate ?? 18
  ) ||
  (editingProduct.costPrice ?? 0) < 0 ||
  (editingProduct.transportCost ?? 0) < 0 ||
  (editingProduct.mrp ?? 0) < 0 ||
  (editingProduct.discountValue ?? 0) < 0 ||
  (editingProduct.gstRate ?? 18) < 0 ||
  (editingProduct.gstRate ?? 18) > 100
) {
  alert(
    "Please enter valid pricing and GST values."
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

    const costPrice = editingProduct.costPrice ?? 0;
const transportCost = editingProduct.transportCost ?? 0;
const totalProductCost = costPrice + transportCost;

const mrp = Math.max(
  editingProduct.mrp ?? 0,
  totalProductCost
);

if (
  editingProduct.discountType === "Fixed" &&
  (editingProduct.discountValue ?? 0) > mrp
) {
  alert(
    "Fixed discount cannot be greater than MRP."
  );
  return;
}

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
        moq: Math.max(
      Number(editingProduct.moq ?? 1),
      1
    ),
    name: editingProduct.name.trim(),
    sku: editingProduct.sku
      .trim()
      .toUpperCase(),
    onHand: Number(editingProduct.onHand),
    costPrice:
      editingProduct.costPrice ?? 0,
    transportCost:
      editingProduct.transportCost ?? 0,
    mrp,
    discountType:
      editingProduct.discountType ??
      "Percentage",
    discountValue:
      editingProduct.discountValue ?? 0,
    sellingPrice:
      Math.max(sellingPrice, 0),
    gstRate:
      editingProduct.gstRate ?? 18,
    supplierName:
      editingProduct.supplierName?.trim() ?? "",
    supplierContact:
      editingProduct.supplierContact?.trim() ?? "",
    supplierEmail:
      editingProduct.supplierEmail?.trim() ?? "",
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

      if (massEditField === "moq") {
  const moq = Number(massEditValue);

  if (!Number.isFinite(moq) || moq < 1) {
    return product;
  }

  return {
    ...product,
    moq,
  };
}

      if (massEditField === "costPrice") {
        return {
          ...product,
          costPrice: Number(massEditValue),
          unitCost: Number(massEditValue),
        };
      }

      if (massEditField === "transportCost") {
  const transportCost = Number(massEditValue);
  const costPrice = product.costPrice ?? 0;
  const totalProductCost =
    costPrice + transportCost;

  const mrp = Math.max(
    product.mrp ?? 0,
    totalProductCost
  );

  const discountValue =
    product.discountValue ?? 0;

  const sellingPrice =
    product.discountType === "Percentage"
      ? mrp - (mrp * discountValue) / 100
      : mrp - discountValue;

  return {
    ...product,
    transportCost,
    mrp,
    sellingPrice: Math.max(sellingPrice, 0),
  };
}

      if (massEditField === "gstRate") {
        const gstRate = Number(massEditValue);

        if (gstRate < 0 || gstRate > 100) {
          return product;
        }

        return {
          ...product,
          gstRate,
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
          <div className="text-[11px] font-medium tracking-wide text-slate-500">
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
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-6 text-slate-900 sm:px-6 sm:py-7">

        <div className="mx-auto max-w-7xl">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="mb-7 rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-[0_8px_30px_rgba(15,23,42,0.05)] backdrop-blur-sm sm:p-6 lg:flex lg:items-center lg:justify-between">

            <div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-800">
                Inventory
              </h1>

              <p className="mt-1.5 text-[11px] font-medium tracking-wide text-slate-500">
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
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
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
                className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-xs font-semibold text-blue-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-100 hover:shadow-md"
              >
                Transfer Stock
              </button>

              <button
  type="button"
  onClick={handleExportProducts}
  className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-100 hover:shadow-md"
>
  Export Products
</button>

<label className="cursor-pointer rounded-xl border border-purple-200 bg-purple-50 px-4 py-2.5 text-xs font-semibold text-purple-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-purple-100 hover:shadow-md">
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
  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md"
>
  Download Template
</button>

              <button
                type="button"
                onClick={openLowStockAlerts}
                className="relative rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-semibold text-amber-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-amber-100 hover:shadow-md"
              >
                Low-Stock Alerts
                {activeLowStockAlerts > 0 && (
                  <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-amber-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
                    {activeLowStockAlerts}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() =>
                  setShowAddProduct(true)
                }
                className="rounded-xl border border-blue-600 bg-blue-600 px-4 py-2.5 text-xs font-semibold tracking-wide text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-500/20"
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

            <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_35px_rgba(15,23,42,0.10)]">

              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                Total Products
              </p>

              <p className="mt-2 text-2xl font-bold tracking-tight text-slate-800">
                {totalProducts}
              </p>

              <p className="mt-1 text-[11px] font-medium tracking-wide text-slate-500">
                Active products
              </p>

            </div>

            {/* TOTAL UNITS */}

            <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_35px_rgba(15,23,42,0.10)]">

              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                Total Units
              </p>

              <p className="mt-2 text-2xl font-bold text-blue-600">
                {totalUnits.toLocaleString(
                  "en-IN"
                )}
              </p>

              <p className="mt-1 text-[11px] font-medium tracking-wide text-slate-500">
                Units currently in stock
              </p>

            </div>

            {/* STOCK VALUE */}

            <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_35px_rgba(15,23,42,0.10)]">

              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                Stock Value
              </p>

              <p className="mt-2 text-2xl font-bold text-green-600">
                {formatCurrency(
                  stockValue
                )}
              </p>

              <p className="mt-1 text-[11px] font-medium tracking-wide text-slate-500">
                Current inventory value
              </p>

            </div>

            {/* NEEDS ATTENTION */}

            <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_35px_rgba(15,23,42,0.10)]">

              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                Needs Attention
              </p>

              <p className="mt-2 text-2xl font-bold text-orange-500">
                {needsAttention}
              </p>

              <p className="mt-1 text-[11px] font-medium tracking-wide text-slate-500">
                {lowStockCount} low stock ·{" "}
                {outOfStockCount} out of stock
              </p>

            </div>

          </div>

          {/* =================================================
              FILTERS
          ================================================= */}

          <section className="mb-6 rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-[0_8px_30px_rgba(15,23,42,0.05)] backdrop-blur-sm sm:p-6">

            <div className="mb-3 flex items-center justify-between">

              <div>

                <h2 className="text-base font-bold tracking-tight text-slate-800">
                  Product Search & Filters
                </h2>

                <p className="mt-1.5 text-[11px] font-medium tracking-wide text-slate-500">
                  Search products and filter inventory
                  by category, warehouse or stock status.
                </p>

              </div>

              <button
                type="button"
                onClick={clearFilters}
                className="rounded-lg border border-blue-100 bg-blue-50/60 px-3 py-2 text-[10px] font-semibold tracking-wide text-blue-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-100 hover:text-blue-700 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-500/10"
              >
                Clear Filters
              </button>

            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">

              {/* SEARCH */}

              <div>

                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
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
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-700 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />

              </div>

              {/* CATEGORY */}

              <div>

                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Category
                </label>

                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-700 shadow-sm outline-none transition-all duration-200 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
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

                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Warehouse
                </label>

                <select
                  value={warehouse}
                  onChange={(e) =>
                    setWarehouse(
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-700 shadow-sm outline-none transition-all duration-200 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
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

                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Stock Status
                </label>

                <select
                  value={stockStatus}
                  onChange={(e) =>
                    setStockStatus(
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-700 shadow-sm outline-none transition-all duration-200 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
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

          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-sm">

            <div className="flex flex-col gap-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-slate-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <h2 className="text-base font-bold tracking-tight text-slate-900">
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
    <div className="flex flex-wrap items-center justify-end gap-2">
      <span className="text-[11px] font-semibold tracking-wide text-slate-600">
        {selectedProductIds.length} selected
      </span>

      <button
  type="button"
  onClick={() => {
    setMassEditField("category");
    setMassEditValue("");
    setShowMassEdit(true);
  }}
  className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-[10px] font-semibold tracking-wide text-blue-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-100 hover:shadow-md"
>
  Mass Edit
</button>

      <button
  type="button"
  onClick={handleMassDelete}
  className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[10px] font-semibold tracking-wide text-red-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-100 hover:shadow-md"
>
  Mass Delete
</button>

      <button
        type="button"
        onClick={() => setSelectedProductIds([])}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-semibold tracking-wide text-slate-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md"
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

              <table className="w-full min-w-[1100px] border-collapse bg-white text-xs">

                <thead>

                  <tr className="border-b border-slate-300/80 bg-gradient-to-r from-slate-50 via-white to-slate-50 text-left">

  <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-600">
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
      className="h-4 w-4 rounded-md border-slate-300 text-blue-600 shadow-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
    />
  </th>

  <th className="min-w-[180px] px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
  Product
</th>

                    <th className="min-w-[120px] px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
  Type
</th>

                    <th className="min-w-[140px] px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
  Category
</th>

                    <th className="min-w-[140px] px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
  Warehouse
</th>

                   <th className="min-w-[100px] px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
  On Hand
</th>

                   <th className="min-w-[100px] px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
  Reserved
</th>

                    <th className="min-w-[100px] px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
  Available
</th>

                    <th className="min-w-[110px] px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
  Status
</th>

                    {/* MOQ */}

<th className="min-w-[80px] px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
  MOQ
</th>

<th className="min-w-[110px] px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
  Cost Price
</th>

<th className="min-w-[130px] px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
  Transport Cost
</th>

<th className="min-w-[100px] px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
  MRP
</th>

<th className="min-w-[110px] px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
  Discount
</th>

<th className="min-w-[120px] px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
  Selling Price
</th>

<th className="min-w-[100px] px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
  GST Rate
</th>

<th className="min-w-[180px] px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
  Supplier
</th>

<th className="min-w-[260px] px-4 py-3.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-600 text-right">
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
  className="border-b border-slate-200/70 align-middle transition-all duration-200 hover:-translate-y-[1px] hover:bg-blue-50/40 hover:shadow-[inset_3px_0_0_rgba(59,130,246,0.45),0_4px_12px_rgba(15,23,42,0.04)]"
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
        className="h-4 w-4 rounded-md border-slate-300 text-blue-600 shadow-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
      />
    </td>

    {/* PRODUCT */}

    <td className="w-12 px-4 py-3 align-middle">

                            <p className="text-sm font-semibold tracking-tight text-slate-800">
                              {
                                product.name
                              }
                            </p>

                            <p className="mt-1 font-mono text-[10px] font-medium tracking-wide text-slate-400">
                              {
                                product.sku
                              }
                            </p>

                          </td>

                          {/* TYPE */}

                          <td className="px-4 py-3">

                            <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-blue-700 shadow-sm">
                              {
                                product.productType ??
                                "Simple"
                              }
                            </span>

                          </td>

                          {/* CATEGORY */}
                          <td className="px-4 py-3 text-sm font-medium tracking-tight text-slate-600">
                            {
                              product.category
                            }
                          </td>

                          {/* WAREHOUSE */}

                          <td className="px-4 py-3 text-sm font-medium tracking-tight text-slate-600">
                            {
                              product.warehouse
                            }
                          </td>

                          {/* ON HAND */}

<td className="px-4 py-3 text-sm font-bold tracking-tight text-slate-800">
  {product.onHand}
</td>

                          {/* RESERVED */}

                          <td className="px-4 py-3 text-sm font-bold tracking-tight text-slate-700">
                            {
                              product.reserved
                            }
                          </td>

                          {/* AVAILABLE */}

                          <td className="px-4 py-3 text-sm font-bold tracking-tight text-emerald-700">
                            {getAvailable(product)}
                          </td>

                          {/* STATUS */}

                          <td className="px-4 py-3 text-sm font-semibold">

                            <span
                              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-wide shadow-sm ${
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

                          {/* MOQ */}

<td className="px-4 py-3 text-sm font-semibold tracking-tight text-slate-700">
  {product.moq ?? 1}
</td>

                          {/* COST PRICE */}

<td className="px-4 py-3 text-sm font-semibold tracking-tight text-slate-700">
  {formatCurrency(
    product.costPrice ?? product.unitCost
  )}
</td>

{/* TRANSPORT COST */}

<td className="px-4 py-3 text-sm font-semibold tracking-tight text-slate-700">
  {formatCurrency(product.transportCost ?? 0)}
</td>

{/* MRP */}

<td className="px-4 py-3 text-sm font-semibold tracking-tight text-slate-700">
  {formatCurrency(product.mrp ?? 0)}
</td>

{/* DISCOUNT */}

<td className="px-4 py-3 text-sm font-semibold tracking-tight text-slate-600">
  {product.discountValue != null
    ? product.discountType === "Percentage"
      ? `${product.discountValue}%`
      : formatCurrency(product.discountValue)
    : "—"}
</td>

{/* SELLING PRICE */}

<td className="px-4 py-3 text-sm font-bold tracking-tight text-emerald-700">
  {formatCurrency(
    product.sellingPrice ?? product.mrp ?? product.unitCost
  )}
</td>

{/* GST RATE */}

<td className="px-4 py-3 text-sm font-semibold tracking-tight text-slate-700">
  {product.gstRate ?? 18}%
</td>

{/* SUPPLIER */}

<td className="px-4 py-3 align-top min-w-[180px]">
  <div className="text-sm font-semibold text-slate-700">
    {product.supplierName || "—"}
  </div>

 {product.supplierContact && (
  <div className="mt-1 text-[10px] font-medium tracking-wide text-slate-500">
    {product.supplierContact}
  </div>
)}

 {product.supplierEmail && (
  <div className="mt-0.5 text-[10px] font-medium tracking-wide text-slate-400">
    {product.supplierEmail}
  </div>
)}
</td>

{/* ACTIONS */}

                          <td className="min-w-[260px] px-4 py-3 align-middle bg-slate-50/40">

                            <div className="flex flex-wrap items-center justify-end gap-2">

                              <button
                                type="button"
                                onClick={() =>
                                  handleView(
                                    product
                                  )
                                }
                                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-semibold tracking-wide text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md"
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
                                className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-[10px] font-semibold tracking-wide text-blue-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-100 hover:shadow-md"
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
                                className="rounded-lg border border-orange-200 bg-orange-50 px-2.5 py-1.5 text-[10px] font-semibold tracking-wide text-orange-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-100 hover:shadow-md"
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
                                className="rounded-lg border border-purple-200 bg-purple-50 px-2.5 py-1.5 text-[10px] font-semibold tracking-wide text-purple-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-purple-100 hover:shadow-md"
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
                                className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-[10px] font-semibold tracking-wide text-red-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-100 hover:shadow-md"
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
                        colSpan={18}
                        className="px-4 py-16 text-center"
                      >

                        <p className="text-sm font-semibold tracking-tight text-slate-700">
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
          LOW-STOCK ALERTS — FR-INV-11
      ================================================= */}
      {showLowStockAlerts && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-[3px]">
          <div className="mx-auto my-6 w-full max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.20)]">
            <div className="flex flex-col gap-4 border-b border-slate-100 bg-gradient-to-r from-amber-50 via-white to-blue-50/40 px-6 py-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-bold tracking-tight text-slate-900">
                    Low-Stock Alerts
                  </h2>
                  <span className="rounded-full border border-amber-200 bg-amber-100 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-amber-700">
                    FR-INV-11
                  </span>
                </div>
                <p className="mt-1.5 max-w-2xl text-[11px] font-medium leading-5 text-slate-500">
                  Configure product and warehouse thresholds and notification
                  channels. An alert becomes active when Available stock is at
                  or below the configured threshold.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowLowStockAlerts(false)}
                className="self-end rounded-xl border border-slate-200 bg-white px-3 py-2 text-lg leading-none text-slate-400 shadow-sm transition hover:bg-slate-50 hover:text-slate-700 sm:self-auto"
                aria-label="Close low-stock alerts"
              >
                ×
              </button>
            </div>

            <div className="grid gap-5 p-5 lg:grid-cols-[1.05fr_1.95fr]">
              <section className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
                <div className="mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-blue-600">
                    Alert Rule
                  </p>
                  <h3 className="mt-1 text-base font-bold text-slate-800">
                    Configure threshold
                  </h3>
                  <p className="mt-1 text-[10px] leading-4 text-slate-500">
                    Configure a separate rule for each product and warehouse.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      Product
                    </label>
                    <select
                      value={alertRuleProductId}
                      onChange={(e) => loadAlertRule(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                    >
                      <option value="">Select product</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} · {product.sku}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      Warehouse
                    </label>
                    <select
                      value={alertRuleWarehouse}
                      onChange={(e) =>
                        loadAlertRule(
                          alertRuleProductId,
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                    >
                      {warehouses.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      Alert Threshold
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={alertRuleThreshold}
                      onChange={(e) =>
                        setAlertRuleThreshold(e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                      placeholder="e.g. 10"
                    />
                    <p className="mt-1.5 text-[10px] text-slate-400">
                      If no custom rule exists, the product reorder point is used.
                    </p>
                  </div>

                  <div>
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      Notification Channels
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {(["In-App", "Email", "Push"] as LowStockAlertChannel[]).map(
                        (channel) => {
                          const checked =
                            alertRuleChannels.includes(channel);

                          return (
                            <label
                              key={channel}
                              className={`cursor-pointer rounded-xl border p-3 text-center transition ${
                                checked
                                  ? "border-blue-300 bg-blue-50 text-blue-700"
                                  : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() =>
                                  toggleAlertChannel(channel)
                                }
                                className="sr-only"
                              />
                              <span className="text-[10px] font-bold">
                                {channel}
                              </span>
                            </label>
                          );
                        }
                      )}
                    </div>
                    <p className="mt-2 text-[9px] leading-4 text-slate-400">
                      Email and Push are saved as notification preferences here.
                      Actual delivery requires backend/notification integration.
                    </p>
                  </div>

                  <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 py-3">
                    <div>
                      <p className="text-[11px] font-bold text-slate-700">
                        Alert enabled
                      </p>
                      <p className="mt-0.5 text-[9px] text-slate-400">
                        Disable without deleting the rule.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={alertRuleEnabled}
                      onChange={(e) =>
                        setAlertRuleEnabled(e.target.checked)
                      }
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleSaveAlertRule}
                    className="w-full rounded-xl border border-blue-600 bg-blue-600 px-4 py-3 text-[11px] font-bold tracking-wide text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md"
                  >
                    Save Alert Rule
                  </button>
                </div>
              </section>

              <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-amber-600">
                      Alert Center
                    </p>
                    <h3 className="mt-1 text-base font-bold text-slate-800">
                      {activeLowStockAlerts} active alert
                      {activeLowStockAlerts === 1 ? "" : "s"}
                    </h3>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      type="text"
                      value={alertSearch}
                      onChange={(e) => setAlertSearch(e.target.value)}
                      placeholder="Search product, SKU..."
                      className="rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-[10px] font-medium text-slate-700 outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    />
                    <select
                      value={alertStatusFilter}
                      onChange={(e) =>
                        setAlertStatusFilter(
                          e.target.value as typeof alertStatusFilter
                        )
                      }
                      className="rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-[10px] font-semibold text-slate-700 outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    >
                      <option value="All">All Rules</option>
                      <option value="Active">Active Alerts</option>
                      <option value="Healthy">Healthy</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full min-w-[760px] text-left">
                    <thead className="bg-slate-50">
                      <tr className="border-b border-slate-200">
                        {[
                          "Product",
                          "Warehouse",
                          "Available",
                          "Threshold",
                          "Status",
                          "Channels",
                          "Action",
                        ].map((heading) => (
                          <th
                            key={heading}
                            className="px-4 py-3 text-[9px] font-bold uppercase tracking-wider text-slate-500"
                          >
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {lowStockAlerts.map(
                        ({
                          product,
                          rule,
                          threshold,
                          available,
                          active,
                        }) => (
                          <tr
                            key={`${product.id}:${product.warehouse}`}
                            className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
                          >
                            <td className="px-4 py-3">
                              <p className="text-[11px] font-bold text-slate-700">
                                {product.name}
                              </p>
                              <p className="mt-0.5 font-mono text-[9px] text-slate-400">
                                {product.sku}
                              </p>
                            </td>
                            <td className="px-4 py-3 text-[10px] font-semibold text-slate-600">
                              {product.warehouse}
                            </td>
                            <td className="px-4 py-3 text-[11px] font-bold text-slate-800">
                              {available}
                            </td>
                            <td className="px-4 py-3 text-[11px] font-bold text-amber-700">
                              {threshold}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex rounded-full border px-2.5 py-1 text-[9px] font-bold ${
                                  active
                                    ? "border-amber-200 bg-amber-100 text-amber-700"
                                    : "border-emerald-200 bg-emerald-50 text-emerald-700"
                                }`}
                              >
                                {active ? "Alert Active" : "Healthy"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-1">
                                {(rule?.channels?.length
                                  ? rule.channels
                                  : ["In-App"]
                                ).map((channel) => (
                                  <span
                                    key={channel}
                                    className="rounded-full bg-slate-100 px-2 py-1 text-[8px] font-semibold text-slate-600"
                                  >
                                    {channel}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() =>
                                    loadAlertRule(
                                      product.id.toString(),
                                      product.warehouse
                                    )
                                  }
                                  className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-[9px] font-bold text-blue-700 hover:bg-blue-100"
                                >
                                  Edit
                                </button>
                                {rule && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDeleteAlertRule(
                                        product.id,
                                        product.warehouse
                                      )
                                    }
                                    className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-[9px] font-bold text-red-700 hover:bg-red-100"
                                  >
                                    Reset
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      )}

                      {lowStockAlerts.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-5 py-14 text-center">
                            <p className="text-sm font-bold text-slate-700">
                              No matching alert rules
                            </p>
                            <p className="mt-1 text-[10px] text-slate-400">
                              Change the search/status filter or add a product.
                            </p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-amber-700">
                      Active
                    </p>
                    <p className="mt-1 text-lg font-bold text-amber-800">
                      {activeLowStockAlerts}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                      Configured Rules
                    </p>
                    <p className="mt-1 text-lg font-bold text-slate-800">
                      {alertRules.length}
                    </p>
                  </div>
                  <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-blue-600">
                      Default Logic
                    </p>
                    <p className="mt-1 text-[10px] font-bold leading-4 text-blue-800">
                      Available ≤ Reorder Point
                    </p>
                  </div>
                </div>
              </section>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4">
              <p className="text-[9px] leading-4 text-slate-400">
                Configuration is persisted in localStorage. Server-side alert
                enforcement and actual email/push delivery require backend integration.
              </p>
              <button
                type="button"
                onClick={() => setShowLowStockAlerts(false)}
                className="shrink-0 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[10px] font-bold text-slate-600 shadow-sm hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================
    MASS EDIT MODAL
================================================= */}
{showMassEdit && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]">
    <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.15)]">
      <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-blue-50/40 px-6 py-4">
        <div>
          <h2 className="text-base font-bold tracking-tight text-slate-800">
  Mass Edit Products
</h2>
          <p className="mt-1.5 text-[11px] font-medium tracking-wide text-slate-500">
            Updating {selectedProductIds.length} selected product(s)
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowMassEdit(false)}
          className="rounded-lg p-1.5 text-lg font-medium text-slate-400 transition-all duration-200 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-500/10"
        >
          ×
        </button>
      </div>

      <div className="space-y-5 border-t border-slate-100 px-6 py-5">
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/40 p-3">
          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
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
            className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-700 shadow-sm outline-none transition-all duration-200 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
          >
            <option value="category">Category</option>
            <option value="warehouse">Warehouse</option>
            <option value="reorderPoint">Reorder Point</option>
            <option value="moq">MOQ</option>
            <option value="costPrice">Cost Price</option>
<option value="transportCost">Transport Cost</option>
<option value="mrp">MRP</option>
            <option value="discountType">Discount Type</option>
            <option value="discountValue">Discount Value</option>
            <option value="gstRate">GST Rate</option>
          </select>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-slate-50/40 p-3">
          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
            New value
          </label>

          {massEditField === "category" ? (
            <select
              value={massEditValue}
              onChange={(e) => setMassEditValue(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-700 shadow-sm outline-none transition-all duration-200 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
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
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-700 shadow-sm outline-none transition-all duration-200 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
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
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-700 shadow-sm outline-none transition-all duration-200 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="">Select discount type</option>
              <option value="Percentage">Percentage</option>
              <option value="Fixed">Fixed Amount</option>
            </select>
          ) : (
            <input
  type="number"
  min="0"
  max={massEditField === "gstRate" ? "100" : undefined}
  step="0.01"
  value={massEditValue}
  onChange={(e) => setMassEditValue(e.target.value)}
  placeholder={
    massEditField === "gstRate"
      ? "Enter GST rate (0-100)"
      : "Enter new value"
  }
  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-700 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
/>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={() => setShowMassEdit(false)}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[10px] font-semibold tracking-wide text-slate-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-slate-500/10"
          >
            Cancel
          </button>

                    <button
            type="button"
            onClick={handleMassEdit}
            className="rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-[10px] font-semibold tracking-wide text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-500/20"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]">

          <div className="w-full max-w-2xl rounded-2xl border border-slate-200/80 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.15)]">

            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-blue-50/40 px-6 py-4">

              <div>
                <h2 className="text-base font-bold tracking-tight text-slate-800">
                  Add Product
                </h2>

                <p className="mt-1.5 text-[11px] font-medium tracking-wide text-slate-500">
                  Create a new product and add it to inventory.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowAddProduct(false)
                }
                className="rounded-lg p-1.5 text-xl font-medium text-slate-400 transition-all duration-200 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-500/10"
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

                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
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
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-700 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  required
                />

              </div>

              {/* SKU */}

              <div>

                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
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
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 font-mono text-xs font-medium text-slate-700 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  required
                />

              </div>

              {/* PRODUCT TYPE */}

              <div>

                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
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
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-700 shadow-sm outline-none transition-all duration-200 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                >

                  <option value="Simple">
                    Simple Product
                  </option>

                  <option value="Variable">
                    Variable Product
                  </option>

                </select>

                <p className="mt-1 text-[11px] font-medium tracking-wide text-slate-500">
                  Choose Variable Product if this product has different sizes, colors, or other variants.
                </p>

              </div>

              {/* PRODUCT VARIANTS */}

              {newProduct.productType ===
                "Variable" && (
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 shadow-sm">

                  <div className="mb-3">

                    <h3 className="text-base font-bold tracking-tight text-slate-800">
                      Product Variants
                    </h3>

                    <p className="mt-1 text-[11px] font-medium tracking-wide text-slate-500">
                      Add individual variants with their own SKU, size, color and stock.
                    </p>

                  </div>

                  {newVariants.map(
                    (variant, index) => (
                      <div
                        key={
                          variant.id
                        }
                        className="mb-3 rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 shadow-sm"
                      >

                        <div className="mb-2 flex items-center justify-between">

                          <span className="text-[11px] font-semibold tracking-wide text-slate-600">
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

                            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
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
                              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-700 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                            />

                          </div>

                          {/* COLOR */}

                          <div>

                            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
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
                              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-700 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                            />

                          </div>

                          {/* VARIANT SKU */}

                          <div>

                            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
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

                            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
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
                              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-700 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
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

                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
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
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-700 shadow-sm outline-none transition-all duration-200 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
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

                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
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
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-700 shadow-sm outline-none transition-all duration-200 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
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

                    <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
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
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-700 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                      required
                    />

                  </div>
                )}

                {/* REORDER POINT */}

                <div>

                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
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
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-700 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    required
                  />

                </div>

              </div>

              {/* UNIT COST */}

              {/* MOQ */}

<div>
  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
    Minimum Order Quantity (MOQ)
  </label>

  <input
    type="number"
    min="1"
    value={newProduct.moq}
    onChange={(e) =>
      setNewProduct(
        (current) => ({
          ...current,
          moq: e.target.value,
        })
      )
    }
    placeholder="1"
    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-700 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
    required
  />
</div>

              <div>

                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
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
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-700 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  required
                />

              </div>

              {/* COST PRICE */}

              <div>

                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
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
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-700 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />

              </div>

              {/* MRP */}

              <div>

                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
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
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-700 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />

              </div>

              {/* DISCOUNT TYPE */}

              <div>

                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
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
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-700 shadow-sm outline-none transition-all duration-200 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
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

                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
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
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-700 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />

                            </div>

                            {/* GST RATE */}
<div>
  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
    GST Rate (%)
  </label>

  <input
    type="number"
    min="0"
    max="100"
    step="0.01"
    value={newProduct.gstRate}
    onChange={(e) =>
      setNewProduct((current) => ({
        ...current,
        gstRate: e.target.value,
      }))
    }
    placeholder="18"
    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-700 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
  />
</div>

              {/* SUPPLIER DETAILS */}
              <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 shadow-sm">
                <h3 className="mb-3 text-base font-bold tracking-tight text-slate-800">
                  Supplier Details
                </h3>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
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
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-700 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
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
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-700 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
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
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-700 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>
                </div>
              </div>

              {/* BUTTONS */}
              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">

                <button
                  type="button"
                  onClick={() =>
                    setShowAddProduct(false)
                  }
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[10px] font-semibold tracking-wide text-slate-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-slate-500/10"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-[10px] font-semibold tracking-wide text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-500/20"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]">

            <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200/80 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.15)]">

              {/* HEADER */}

              <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-blue-50/40 px-6 py-4">

                <div>

                  <h2 className="text-base font-bold tracking-tight text-slate-800">
                    Edit Product
                  </h2>

                  <p className="mt-1.5 text-[11px] font-medium tracking-wide text-slate-500">
                    Update product and inventory details.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowEditProduct(false);
                    setEditingProduct(null);
                  }}
                  className="rounded-lg p-1.5 text-xl font-medium text-slate-400 transition-all duration-200 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-500/10"
                >
                  ×
                </button>

              </div>

              {/* FORM */}

              <form
                onSubmit={handleEditProduct}
                className="space-y-5 border-t border-slate-100 px-6 py-5"
              >

                {/* PRODUCT NAME */}

                <div>

                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
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
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-700 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    required
                  />

                </div>

                {/* SKU */}

                <div>

                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
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
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 font-mono text-xs font-medium text-slate-700 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    required
                  />

                </div>

                {/* CATEGORY / WAREHOUSE */}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                  {/* CATEGORY */}

                  <div>

                    <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
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
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-700 shadow-sm outline-none transition-all duration-200 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
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

                    <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
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
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-700 shadow-sm outline-none transition-all duration-200 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
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

                    <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
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
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-700 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                      required
                    />

                  </div>

                  {/* REORDER POINT */}

                  <div>

                    <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
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
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-700 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                      required
                    />

                  </div>

                </div>

                                {/* MOQ */}

                <div>
                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                    Minimum Order Quantity (MOQ)
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={editingProduct.moq ?? 1}
                    onChange={(e) =>
                      setEditingProduct(
                        (current) =>
                          current
                            ? {
                                ...current,
                                moq: Number(
                                  e.target.value
                                ),
                              }
                            : current
                      )
                    }
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-700 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    required
                  />
                </div>

                {/* UNIT COST */}

                <div>

                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
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
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-700 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    required
                  />

                </div>

{/* COST PRICE */}

<div>
  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
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
    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-700 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
    placeholder="Enter cost price"
  />
</div>

{/* TRANSPORT COST */}

<div>
  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
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
    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-700 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
    placeholder="Enter transport cost"
  />
</div>

{/* MRP */}

<div>
  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
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
    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-700 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
    placeholder="Enter MRP"
  />
</div>

{/* DISCOUNT TYPE */}

<div>
  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
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
    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-700 shadow-sm outline-none transition-all duration-200 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
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
  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
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
        className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-700 shadow-sm outline-none transition-all duration-200 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
/>
</div>

{/* GST RATE */}
<div>
  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
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
    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-700 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
    placeholder="Enter GST rate"
  />
</div>

{/* SUPPLIER NAME */}
<div>
  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
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
    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-700 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
    placeholder="Enter supplier name"
  />
</div>

{/* SUPPLIER CONTACT */}
<div>
  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
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
    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-700 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
    placeholder="Enter supplier contact"
  />
</div>

{/* SUPPLIER EMAIL */}
<div>
  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
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
    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-700 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
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

                                  <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                                    Variant{" "}
                                    {index +
                                      1}
                                  </span>

                                  <span className="font-mono text-[10px] font-medium tracking-wide text-slate-400">
                                    {
                                      variant.sku
                                    }
                                  </span>

                                </div>

                                <p className="mt-1 text-[11px] font-medium tracking-wide text-slate-500">

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

                <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">

                  <button
                    type="button"
                    onClick={() => {
                      setShowEditProduct(false);
                      setEditingProduct(null);
                    }}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[10px] font-semibold tracking-wide text-slate-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-slate-500/10"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-[10px] font-semibold tracking-wide text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-500/20"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]">

            <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.15)]">

              {/* HEADER */}

              <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-blue-50/40 px-6 py-4">

                <div>

                  <h2 className="text-base font-bold tracking-tight text-slate-800">
                    Adjust Stock
                  </h2>

                  <p className="mt-1.5 text-[11px] font-medium tracking-wide text-slate-500">
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
                  className="rounded-lg p-1.5 text-xl font-medium text-slate-400 transition-all duration-200 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-500/10"
                >
                  ×
                </button>

              </div>

              {/* FORM */}

              <form
                onSubmit={handleAdjustment}
                className="space-y-5 border-t border-slate-100 px-6 py-5"
              >

                {/* PRODUCT */}

                <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 shadow-sm">

                  <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                    Product
                  </p>

                  <p className="mt-1 text-sm font-bold tracking-tight text-slate-800">
                    {selectedProduct.name}
                  </p>

                  <p className="mt-1 font-mono text-[10px] font-medium tracking-wide text-slate-400">
                    {selectedProduct.sku}
                  </p>

                  <p className="mt-2 text-[11px] font-medium text-slate-500">
                    Current stock:{" "}
                    <span className="font-bold text-slate-800">
                      {selectedProduct.onHand}
                    </span>
                  </p>

                </div>

                {/* ADJUSTMENT TYPE */}

                <div>

                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
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
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-700 shadow-sm outline-none transition-all duration-200 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
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

                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
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
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-700 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    required
                  />

                </div>

                {/* REASON */}

                <div>

                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
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
                    className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-700 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    required
                  />

                </div>

                {/* BUTTONS */}

                <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">

                  <button
                    type="button"
                    onClick={() => {
                      setShowAdjustment(false);
                      setSelectedProduct(null);
                    }}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[10px] font-semibold tracking-wide text-slate-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-slate-500/10"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-[10px] font-semibold tracking-wide text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-500/20"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]">

            <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.15)]">

              {/* HEADER */}

              <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-blue-50/40 px-6 py-4">

                <div>

                  <h2 className="text-base font-bold tracking-tight text-slate-800">
                    Transfer Stock
                  </h2>

                  <p className="mt-1.5 text-[11px] font-medium tracking-wide text-slate-500">
                    Transfer inventory to another warehouse.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowTransfer(false);
                    setTransferProduct(null);
                  }}
                  className="rounded-lg p-1.5 text-xl font-medium text-slate-400 transition-all duration-200 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-500/10"
                >
                  ×
                </button>

              </div>

              {/* FORM */}

              <form
                onSubmit={handleTransfer}
                className="space-y-5 border-t border-slate-100 px-6 py-5"
              >

                {/* PRODUCT */}

                <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 shadow-sm">

                  <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                    Product
                  </p>

                  <p className="mt-1 text-sm font-bold tracking-tight text-slate-800">
                    {transferProduct.name}
                  </p>

                  <p className="mt-1 font-mono text-[10px] font-medium tracking-wide text-slate-400">
                    {transferProduct.sku}
                  </p>

                  <p className="mt-2 text-[11px] font-medium text-slate-500">
                    Available stock:{" "}
                    <span className="font-bold text-slate-800">
                      {transferProduct.onHand}
                    </span>
                  </p>

                </div>

                {/* FROM / TO */}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                  {/* FROM WAREHOUSE */}

                  <div>

                    <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                      From Warehouse
                    </label>

                    <select
                      value={transferFrom}
                      onChange={(e) =>
                        setTransferFrom(
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-700 shadow-sm outline-none transition-all duration-200 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
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

                    <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                      To Warehouse
                    </label>

                    <select
                      value={transferTo}
                      onChange={(e) =>
                        setTransferTo(
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-700 shadow-sm outline-none transition-all duration-200 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
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

                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
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
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-700 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    required
                  />

                </div>

                {/* REASON */}

                <div>

                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
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
                    className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-700 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    required
                  />

                </div>

                {/* BUTTONS */}

                <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">

                  <button
                    type="button"
                    onClick={() => {
                      setShowTransfer(false);
                      setTransferProduct(null);
                    }}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[10px] font-semibold tracking-wide text-slate-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-slate-500/10"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-[10px] font-semibold tracking-wide text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-500/20"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]">

            <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.15)]">

              <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-blue-50/40 px-6 py-4">

                <div>
                  <h2 className="text-base font-bold tracking-tight text-slate-800">
                    Cycle Count
                  </h2>

                  <p className="mt-1.5 text-[11px] font-medium tracking-wide text-slate-500">
                    Record the physically counted stock.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowCycleCount(false);
                    setCycleProduct(null);
                  }}
                  className="rounded-lg p-1.5 text-xl font-medium text-slate-400 transition-all duration-200 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-500/10"
                >
                  ×
                </button>

              </div>

              <form
                onSubmit={handleCycleCount}
                className="space-y-5 border-t border-slate-100 px-6 py-5"
              >

                <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 shadow-sm">

                  <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                    Product
                  </p>

                  <p className="mt-1 text-sm font-bold tracking-tight text-slate-800">
                    {cycleProduct.name}
                  </p>

                  <p className="mt-1 font-mono text-[10px] font-medium tracking-wide text-slate-400">
                    {cycleProduct.sku}
                  </p>

                  <p className="mt-2 text-[11px] font-medium text-slate-500">
                    System stock:{" "}
                    <span className="font-bold text-slate-800">
                      {cycleProduct.onHand}
                    </span>
                  </p>

                </div>

                <div>

                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
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
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-700 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    required
                  />

                </div>

                <div>

                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
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
                    className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-700 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  />

                </div>

                <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">

                  <button
                    type="button"
                    onClick={() => {
                      setShowCycleCount(false);
                      setCycleProduct(null);
                    }}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[10px] font-semibold tracking-wide text-slate-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-slate-500/10"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-[10px] font-semibold tracking-wide text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-500/20"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]">

          <div className="w-full max-w-lg rounded-2xl border border-slate-200/80 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.15)]">

            <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-blue-50/40 px-6 py-4">

              <div>
                <h2 className="text-base font-bold tracking-tight text-slate-800">
                  Barcode Scanner
                </h2>

                <p className="mt-1.5 text-[11px] font-medium tracking-wide text-slate-500">
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
                className="rounded-lg p-1.5 text-xl font-medium text-slate-400 transition-all duration-200 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-500/10"
              >
                ×
              </button>

            </div>

            <div className="space-y-5 border-t border-slate-100 px-6 py-5">

              <div className="flex h-44 items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-gradient-to-br from-slate-50 to-blue-50/40">

                <div className="text-center">

                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl shadow-sm">
                    ▣
                  </div>

                  <p className="mt-3 text-sm font-semibold tracking-tight text-slate-700">
                    Ready to scan
                  </p>

                  <p className="mt-1.5 text-[11px] font-medium tracking-wide text-slate-500">
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
                  className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-700 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  autoFocus
                />

                <button
                  type="submit"
                  className="rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-[10px] font-semibold tracking-wide text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-500/20"
                >
                  Search
                </button>

              </form>

              {barcodeProduct && (
                <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-sm">

                  <div className="flex items-start justify-between gap-4">

                    <div>

                      <p className="text-sm font-bold tracking-tight text-slate-800">
                        {barcodeProduct.name}
                      </p>

                      <p className="mt-1 font-mono text-[10px] font-medium tracking-wide text-slate-400">
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

                    <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 shadow-sm">

                      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                        On Hand
                      </p>

                      <p className="mt-1 text-lg font-bold tracking-tight text-slate-800">
                        {barcodeProduct.onHand}
                      </p>

                    </div>

                    <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 shadow-sm">

                      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                        Available
                      </p>

                      <p className="mt-1 text-lg font-bold tracking-tight text-slate-800">
                        {getAvailable(barcodeProduct)}
                      </p>

                    </div>

                    <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 shadow-sm">

                      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                        Warehouse
                      </p>

                      <p className="mt-1 truncate text-sm font-bold tracking-tight text-slate-800">
                        {barcodeProduct.warehouse}
                      </p>

                    </div>

                  </div>

                </div>
              )}

              <div className="flex items-center justify-end border-t border-slate-100 pt-4">

                <button
                  type="button"
                  onClick={() => {
                    setShowBarcode(false);
                    setBarcodeValue("");
                    setBarcodeProduct(null);
                  }}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[10px] font-semibold tracking-wide text-slate-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-slate-500/10"
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

      <div className="border-t border-slate-200/70 py-8 text-center text-[10px] font-medium tracking-wide text-slate-400">
        AI StockFlow • Inventory Management
      </div>

    </PageLayout>
  );
}