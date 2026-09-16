"use client";

import React, { useEffect, useMemo, useState } from "react";
import PageLayout from "../../components/layout/PageLayout";

type ReturnStatus = "Draft" | "Pending Approval" | "Approved" | "Completed" | "Rejected";
type ReturnReason = "Damaged" | "Defective" | "Wrong Item" | "Excess Quantity" | "Quality Issue" | "Expired" | "Other" | "Select reason";
type Condition = "Resalable" | "Damaged" | "Quarantine" | "Scrap";

type ReturnItem = {
  id: string;
  sku: string;
  product: string;
  receivedQty: number;
  previouslyReturned: number;
  returnQty: number;
  unitPrice: number;
  reason: ReturnReason;
  condition: Condition;
  batchNumber: string;
  serialNumbers: string;
  expiryDate: string;
};

type PurchaseReturn = {
  id: string;
  returnNumber: string;
  grn: string;
  po: string;
  supplier: string;
  warehouse: string;
  returnDate: string;
  reference: string;
  requester: string;
  remarks: string;
  status: ReturnStatus;
  items: ReturnItem[];
  createdAt: string;
  approvedAt?: string;
  completedAt?: string;
  creditNote?: string;
};

const GRNS = [
  { id: "GRN-2026-0042", po: "PO-2026-0187", supplier: "TechSource Distributors Pvt Ltd", warehouse: "Hyderabad Central", date: "2026-08-22" },
  { id: "GRN-2026-0041", po: "PO-2026-0186", supplier: "Metro Electronics India", warehouse: "Bengaluru Warehouse", date: "2026-08-21" },
  { id: "GRN-2026-0040", po: "PO-2026-0185", supplier: "Prime Office Supplies", warehouse: "Mumbai Distribution Hub", date: "2026-08-20" },
];

const SAMPLE_ITEMS: ReturnItem[] = [
  { id:"1", sku:"KB-WL-001", product:"Wireless Keyboard", receivedQty:250, previouslyReturned:0, returnQty:5, unitPrice:1800, reason:"Damaged", condition:"Quarantine", batchNumber:"KB-0826-A", serialNumbers:"", expiryDate:"" },
  { id:"2", sku:"MIC-USB-002", product:"USB Microphone", receivedQty:80, previouslyReturned:0, returnQty:3, unitPrice:3200, reason:"Defective", condition:"Quarantine", batchNumber:"MIC-0826-B", serialNumbers:"", expiryDate:"" },
  { id:"3", sku:"MON-24-004", product:'24-inch Monitor', receivedQty:120, previouslyReturned:0, returnQty:0, unitPrice:14500, reason:"Select reason", condition:"Resalable", batchNumber:"", serialNumbers:"", expiryDate:"" },
  { id:"4", sku:"MSE-WL-005", product:"Wireless Mouse", receivedQty:50, previouslyReturned:0, returnQty:2, unitPrice:950, reason:"Wrong Item", condition:"Resalable", batchNumber:"", serialNumbers:"", expiryDate:"" },
];

const reasons: ReturnReason[] = ["Select reason","Damaged","Defective","Wrong Item","Excess Quantity","Quality Issue","Expired","Other"];
const conditions: Condition[] = ["Resalable","Damaged","Quarantine","Scrap"];

const money = (n:number) => new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(n);

function badge(status: ReturnStatus) {
  return status === "Completed" ? "bg-emerald-50 text-emerald-700" :
    status === "Approved" ? "bg-blue-50 text-blue-700" :
    status === "Pending Approval" ? "bg-amber-50 text-amber-700" :
    status === "Rejected" ? "bg-red-50 text-red-700" : "bg-gray-100 text-gray-700";
}

function freshItems(): ReturnItem[] {
  return SAMPLE_ITEMS.map(x => ({...x}));
}

export default function PurchaseReturnsPage() {
  const [history,setHistory] = useState<PurchaseReturn[]>([]);
  const [selectedGRN,setSelectedGRN] = useState(GRNS[0].id);
  const [items,setItems] = useState<ReturnItem[]>(freshItems());
  const [supplier,setSupplier] = useState(GRNS[0].supplier);
  const [warehouse,setWarehouse] = useState(GRNS[0].warehouse);
  const [returnDate,setReturnDate] = useState(new Date().toISOString().slice(0,10));
  const [reference,setReference] = useState("");
  const [requester,setRequester] = useState("Inventory Team");
  const [remarks,setRemarks] = useState("");
  const [status,setStatus] = useState<ReturnStatus>("Draft");
  const [message,setMessage] = useState("");
  const [search,setSearch] = useState("");
  const [statusFilter,setStatusFilter] = useState<"All"|ReturnStatus>("All");
  const [showAdd,setShowAdd] = useState(false);
  const [showConfirm,setShowConfirm] = useState(false);
  const [showHistory,setShowHistory] = useState(false);
  const [selectedHistory,setSelectedHistory] = useState<PurchaseReturn|null>(null);
  const [newItem,setNewItem] = useState({product:"",sku:"",received:1,price:0,batch:"",expiry:""});

  useEffect(() => {
    try {
      const raw=localStorage.getItem("stockflow-purchase-returns");
      if(raw) setHistory(JSON.parse(raw));
    } catch { setHistory([]); }
  },[]);

  const grn = useMemo(()=>GRNS.find(x=>x.id===selectedGRN) ?? GRNS[0],[selectedGRN]);
  const returnable = (x:ReturnItem)=>Math.max(0,x.receivedQty-x.previouslyReturned);
  const returnedItems = useMemo(()=>items.filter(x=>x.returnQty>0),[items]);
  const totalReceived = useMemo(()=>items.reduce((s,x)=>s+x.receivedQty,0),[items]);
  const totalReturn = useMemo(()=>items.reduce((s,x)=>s+x.returnQty,0),[items]);
  const totalValue = useMemo(()=>items.reduce((s,x)=>s+x.returnQty*x.unitPrice,0),[items]);
  const ratio = totalReceived ? Math.round(totalReturn/totalReceived*100) : 0;

  const filteredHistory=useMemo(()=>{
    const q=search.toLowerCase().trim();
    return history.filter(x=>(statusFilter==="All"||x.status===statusFilter) &&
      (!q || `${x.returnNumber} ${x.grn} ${x.po} ${x.supplier} ${x.warehouse}`.toLowerCase().includes(q)));
  },[history,search,statusFilter]);

  const persist=(rows:PurchaseReturn[])=>{
    setHistory(rows);
    localStorage.setItem("stockflow-purchase-returns",JSON.stringify(rows));
  };

  const updateItem=(id:string, patch:Partial<ReturnItem>)=>{
    setItems(xs=>xs.map(x=>x.id===id?{...x,...patch}:x));
    setStatus("Draft"); setMessage("");
  };

  const changeGRN=(id:string)=>{
    const x=GRNS.find(g=>g.id===id);
    setSelectedGRN(id);
    if(x){setSupplier(x.supplier);setWarehouse(x.warehouse);}
    setItems(freshItems()); setStatus("Draft"); setMessage("");
  };

  const addItem=()=>{
    if(!newItem.product.trim()||!newItem.sku.trim()||newItem.received<=0||newItem.price<0){
      setMessage("Enter product, SKU, received quantity and a valid price."); return;
    }
    if(items.some(x=>x.sku.toLowerCase()===newItem.sku.trim().toLowerCase())){
      setMessage("That SKU is already present in this return."); return;
    }
    setItems(xs=>[...xs,{id:crypto.randomUUID(),sku:newItem.sku.trim(),product:newItem.product.trim(),receivedQty:newItem.received,previouslyReturned:0,returnQty:0,unitPrice:newItem.price,reason:"Select reason",condition:"Resalable",batchNumber:newItem.batch,serialNumbers:"",expiryDate:newItem.expiry}]);
    setNewItem({product:"",sku:"",received:1,price:0,batch:"",expiry:""}); setShowAdd(false); setMessage("Item added.");
  };

  const validate=()=>{
    if(!returnDate){setMessage("Return date is required.");return false;}
    if(!supplier.trim()||!warehouse.trim()){setMessage("Supplier and warehouse are required.");return false;}
    if(!returnedItems.length){setMessage("Select at least one item to return.");return false;}
    if(items.some(x=>x.returnQty<0||x.returnQty>returnable(x))){setMessage("Return quantity cannot exceed the remaining received quantity.");return false;}
    if(returnedItems.some(x=>x.reason==="Select reason")){setMessage("Select a reason for every returned item.");return false;}
    if(returnedItems.some(x=>x.reason==="Expired"&&!x.expiryDate)){setMessage("Expired returns require an expiry date.");return false;}
    return true;
  };

  const submit=()=>{
    if(!validate()) return;
    setShowConfirm(false);
    setStatus("Pending Approval");
    setMessage("Return submitted for approval. Inventory has not been reduced.");
  };

  const approve=()=>{
    setStatus("Approved");
    setMessage("Return approved. It is ready for processing.");
  };

  const processReturn=()=>{
    if(!validate()) return;
    const number=`PRN-2026-${String(history.length+1).padStart(4,"0")}`;
    const credit=`CN-${Date.now().toString().slice(-7)}`;
    const now=new Date().toISOString();
    const record:PurchaseReturn={id:Date.now().toString(),returnNumber:number,grn:selectedGRN,po:grn.po,supplier,warehouse,returnDate,reference,requester,remarks,status:"Completed",items:returnedItems.map(x=>({...x})),createdAt:now,approvedAt:now,completedAt:now,creditNote:credit};
    persist([record,...history]);
    try {
      const raw=localStorage.getItem("inventory-products");
      if(raw){
        const products=JSON.parse(raw);
        const updated=Array.isArray(products)?products.map((p:any)=>{
          const r=record.items.find(x=>x.sku.toLowerCase()===String(p.sku||"").toLowerCase());
          if(!r)return p;
          const before=Number(p.onHand ?? p.stock ?? p.quantity ?? 0);
          const after=Math.max(0,before-r.returnQty);
          return {...p,onHand:after,stock:after,quantity:after,available:Math.max(0,Number(p.available ?? before)-r.returnQty)};
        }):products;
        localStorage.setItem("inventory-products",JSON.stringify(updated));
      }
      const ledgerRaw=localStorage.getItem("inventory-stock-ledger");
      const ledger=ledgerRaw?JSON.parse(ledgerRaw):[];
      const entries=record.items.map(x=>({
        id:`RET-${Date.now()}-${x.id}`,transactionId:`RET-${Date.now()}`,type:"OUT",transactionType:"PURCHASE_RETURN",
        referenceId:number,product:x.product,sku:x.sku,warehouse,quantity:x.returnQty,
        quantityChange:-x.returnQty,reason:`Supplier return: ${x.reason}`,user:requester,
        timestamp:now,source:"Purchase Return",status:"POSTED"
      }));
      localStorage.setItem("inventory-stock-ledger",JSON.stringify([...entries,...(Array.isArray(ledger)?ledger:[])]));
    } catch { /* frontend demo storage */ }
    setStatus("Completed"); setMessage(`Return ${number} processed. ${totalReturn} units removed and ${credit} recorded.`);
  };

  const saveDraft=()=>{
    const number=`PRN-DRAFT-${Date.now().toString().slice(-6)}`;
    const record:PurchaseReturn={id:Date.now().toString(),returnNumber:number,grn:selectedGRN,po:grn.po,supplier,warehouse,returnDate,reference,requester,remarks,status:"Draft",items:items.map(x=>({...x})),createdAt:new Date().toISOString()};
    persist([record,...history]); setMessage(`Draft ${number} saved.`); setStatus("Draft");
  };

  const exportCSV=()=>{
    const rows=filteredHistory.map(x=>[x.returnNumber,x.grn,x.po,x.supplier,x.warehouse,x.returnDate,x.status,x.items.reduce((s,i)=>s+i.returnQty,0),x.items.reduce((s,i)=>s+i.returnQty*i.unitPrice,0),x.creditNote||""]);
    const csv=[["Return Number","GRN","PO","Supplier","Warehouse","Date","Status","Units","Value","Credit Note"],...rows].map(r=>r.map(v=>`"${String(v).replaceAll('"','""')}"`).join(",")).join("\n");
    const blob=new Blob([csv],{type:"text/csv;charset=utf-8"}); const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="purchase-returns.csv"; a.click(); URL.revokeObjectURL(a.href);
  };

  return <PageLayout>
    <main className="min-h-screen bg-[#f6f8fb] p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#12213a] text-xs font-black text-white shadow-lg">RTN</div>
            <div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-blue-600">Procurement · Returns</p><h1 className="text-3xl font-bold text-[#12213a]">Purchase Returns</h1><p className="text-sm text-gray-500">Control supplier returns, inventory reversal and credit processing.</p></div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={()=>setShowHistory(true)} className="rounded-xl border bg-white px-4 py-2.5 text-xs font-bold text-gray-700 shadow-sm">Return History</button>
            <button onClick={exportCSV} className="rounded-xl border bg-white px-4 py-2.5 text-xs font-bold text-gray-700 shadow-sm">Export CSV</button>
            <span className={`rounded-xl px-4 py-2.5 text-xs font-bold ${badge(status)}`}>● {status}</span>
          </div>
        </header>

        <div className="mb-6 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-white p-4">
          <div className="flex gap-3"><span className="text-lg">↩</span><div><p className="text-sm font-bold text-blue-900">Supplier return control</p><p className="mt-1 text-xs text-blue-700">Returns are linked to a GRN. Inventory is reduced only after approval and processing. This browser implementation persists workflow data locally.</p></div></div>
        </div>

        <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Received Units",totalReceived,"From selected GRN","text-[#12213a]"],
            ["Return Units",totalReturn,"Selected for return","text-red-600"],
            ["Return Value",money(totalValue),"Supplier credit estimate","text-purple-600"],
            ["Return Ratio",`${ratio}%`,"Against received quantity","text-orange-600"],
          ].map(([a,b,c,d])=><div key={a} className="rounded-2xl border bg-white p-5 shadow-sm"><p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{a}</p><p className={`mt-2 text-2xl font-black ${d}`}>{b}</p><p className="mt-1 text-xs text-gray-500">{c}</p>{a==="Return Ratio"&&<div className="mt-3 h-1.5 rounded-full bg-gray-100"><div className="h-full rounded-full bg-orange-500" style={{width:`${Math.min(100,ratio)}%`}}/></div>}</div>)}
        </section>

        <section className="mb-6 rounded-2xl border bg-white shadow-sm">
          <div className="border-b px-6 py-5"><h2 className="text-base font-bold text-[#12213a]">Return Information</h2><p className="mt-1 text-xs text-gray-500">Reference the original receipt and provide accountable return metadata.</p></div>
          <div className="grid gap-4 p-6 md:grid-cols-2 lg:grid-cols-4">
            <Field label="Goods Receipt"><select value={selectedGRN} onChange={e=>changeGRN(e.target.value)} className="input">{GRNS.map(x=><option key={x.id}>{x.id}</option>)}</select></Field>
            <Field label="Purchase Order"><input className="input bg-gray-50" value={grn.po} readOnly/></Field>
            <Field label="Supplier"><input className="input" value={supplier} onChange={e=>setSupplier(e.target.value)}/></Field>
            <Field label="Warehouse"><input className="input" value={warehouse} onChange={e=>setWarehouse(e.target.value)}/></Field>
            <Field label="Return Date"><input type="date" className="input" value={returnDate} onChange={e=>setReturnDate(e.target.value)}/></Field>
            <Field label="Return Reference"><input className="input" placeholder="Supplier RMA / reference" value={reference} onChange={e=>setReference(e.target.value)}/></Field>
            <Field label="Requester"><input className="input" value={requester} onChange={e=>setRequester(e.target.value)}/></Field>
            <Field label="Remarks"><input className="input" placeholder="Reason / additional notes" value={remarks} onChange={e=>setRemarks(e.target.value)}/></Field>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b px-6 py-5 lg:flex-row lg:items-center lg:justify-between"><div><h2 className="text-base font-bold text-[#12213a]">Return Items</h2><p className="mt-1 text-xs text-gray-500">Returned quantity is capped by the quantity received less previous returns.</p></div><div className="flex flex-wrap gap-2"><button onClick={()=>setItems(xs=>xs.map(x=>({...x,returnQty:returnable(x)})))} className="btn">Return All</button><button onClick={()=>setItems(xs=>xs.map(x=>({...x,returnQty:0})))} className="btn">Clear</button><button onClick={()=>setShowAdd(true)} className="primary">+ Add Item</button></div></div>
          <div className="overflow-x-auto"><table className="min-w-[1450px] w-full text-left"><thead className="border-b bg-gray-50"><tr>{["Product","Received","Previously Returned","Returnable","Return Qty","Unit Price","Return Value","Reason","Condition","Batch","Serial / Expiry",""].map(h=><th key={h} className="px-4 py-3 text-[9px] font-bold uppercase tracking-wider text-gray-500">{h}</th>)}</tr></thead>
          <tbody className="divide-y">{items.map(x=>{const max=returnable(x); const invalid=x.returnQty>max; return <tr key={x.id} className="hover:bg-gray-50">
            <td className="px-4 py-4"><p className="text-xs font-bold text-gray-900">{x.product}</p><p className="mt-1 text-[9px] text-gray-400">{x.sku}</p></td>
            <td className="px-4 py-4 text-xs font-semibold">{x.receivedQty}</td><td className="px-4 py-4 text-xs">{x.previouslyReturned}</td><td className="px-4 py-4 text-xs font-bold text-blue-700">{max}</td>
            <td className="px-4 py-4"><input type="number" min="0" max={max} value={x.returnQty} onChange={e=>updateItem(x.id,{returnQty:Math.max(0,Number(e.target.value)||0)})} className={`w-24 rounded-lg border px-3 py-2 text-xs font-bold ${invalid?"border-red-300 bg-red-50":"border-gray-200"}`}/></td>
            <td className="px-4 py-4"><input type="number" min="0" value={x.unitPrice} onChange={e=>updateItem(x.id,{unitPrice:Math.max(0,Number(e.target.value)||0)})} className="w-24 rounded-lg border border-gray-200 px-3 py-2 text-xs"/></td>
            <td className="px-4 py-4 text-xs font-bold text-purple-600">{money(x.returnQty*x.unitPrice)}</td>
            <td className="px-4 py-4"><select value={x.reason} onChange={e=>updateItem(x.id,{reason:e.target.value as ReturnReason})} className="w-32 rounded-lg border border-gray-200 px-2 py-2 text-[10px]">{reasons.map(r=><option key={r}>{r}</option>)}</select></td>
            <td className="px-4 py-4"><select value={x.condition} onChange={e=>updateItem(x.id,{condition:e.target.value as Condition})} className="w-28 rounded-lg border border-gray-200 px-2 py-2 text-[10px]">{conditions.map(r=><option key={r}>{r}</option>)}</select></td>
            <td className="px-4 py-4"><input value={x.batchNumber} onChange={e=>updateItem(x.id,{batchNumber:e.target.value})} placeholder="Batch" className="w-28 rounded-lg border border-gray-200 px-2 py-2 text-[10px]"/></td>
            <td className="px-4 py-4"><input value={x.serialNumbers} onChange={e=>updateItem(x.id,{serialNumbers:e.target.value})} placeholder="Serials" className="w-28 rounded-lg border border-gray-200 px-2 py-2 text-[10px]"/><input type="date" value={x.expiryDate} onChange={e=>updateItem(x.id,{expiryDate:e.target.value})} className="mt-1 w-28 rounded-lg border border-gray-200 px-2 py-2 text-[10px]"/></td>
            <td className="px-4 py-4"><button onClick={()=>setItems(xs=>xs.filter(i=>i.id!==x.id))} className="text-[10px] font-bold text-red-600">Remove</button>{invalid&&<p className="mt-1 text-[9px] text-red-600">Exceeds returnable</p>}</td>
          </tr>})}</tbody></table></div>
          <div className="grid gap-4 border-t bg-gray-50 px-6 py-5 sm:grid-cols-3"><Metric label="Items Returned" value={String(returnedItems.length)}/><Metric label="Total Return Units" value={String(totalReturn)}/><Metric label="Supplier Credit" value={money(totalValue)}/></div>
        </section>

        {message&&<div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs font-semibold text-blue-800">{message}</div>}

        <section className="mt-6 rounded-2xl border bg-white p-6 shadow-sm"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><h2 className="text-base font-bold text-[#12213a]">Workflow Control</h2><p className="mt-1 text-xs text-gray-500">Approval precedes inventory reversal and supplier credit posting.</p></div><div className="flex flex-wrap gap-2">
          {status==="Draft"&&<><button onClick={saveDraft} className="btn">Save Draft</button><button onClick={()=>{if(validate())setShowConfirm(true)}} className="primary">Submit for Approval</button></>}
          {status==="Pending Approval"&&<><button onClick={()=>setStatus("Rejected")} className="danger">Reject</button><button onClick={approve} className="success">Approve Return</button></>}
          {status==="Approved"&&<button onClick={processReturn} className="success">Process Return</button>}
          {status==="Completed"&&<span className="rounded-xl bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-700">✓ Inventory & credit posted</span>}
        </div></div></section>

        {status==="Completed"&&<section className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-6"><h2 className="font-bold text-emerald-900">Return Processing Complete</h2><div className="mt-4 grid gap-3 md:grid-cols-3"><div className="card"><small>Stock Reversal</small><strong className="text-red-600">-{totalReturn} units</strong></div><div className="card"><small>Supplier Credit</small><strong className="text-purple-600">{money(totalValue)}</strong></div><div className="card"><small>Ledger</small><strong className="text-blue-700">POSTED</strong></div></div></section>}

        {showAdd&&<Modal title="Add Return Item" close={()=>setShowAdd(false)}><div className="grid gap-4 md:grid-cols-2">{<Field label="Product"><input className="input" value={newItem.product} onChange={e=>setNewItem({...newItem,product:e.target.value})}/></Field>}<Field label="SKU"><input className="input" value={newItem.sku} onChange={e=>setNewItem({...newItem,sku:e.target.value})}/></Field><Field label="Received Qty"><input type="number" min="1" className="input" value={newItem.received} onChange={e=>setNewItem({...newItem,received:Number(e.target.value)})}/></Field><Field label="Unit Price"><input type="number" min="0" className="input" value={newItem.price} onChange={e=>setNewItem({...newItem,price:Number(e.target.value)})}/></Field><Field label="Batch"><input className="input" value={newItem.batch} onChange={e=>setNewItem({...newItem,batch:e.target.value})}/></Field><Field label="Expiry"><input type="date" className="input" value={newItem.expiry} onChange={e=>setNewItem({...newItem,expiry:e.target.value})}/></Field></div><ModalActions cancel={()=>setShowAdd(false)} action={addItem} label="Add Item"/></Modal>}

        {showConfirm&&<Modal title="Confirm Purchase Return" close={()=>setShowConfirm(false)}><div className="rounded-xl bg-gray-50 p-4 text-sm"><p><b>{selectedGRN}</b> · {grn.po}</p><p className="mt-1 text-gray-500">{supplier} · {warehouse}</p><div className="mt-4 grid grid-cols-3 gap-3"><Metric label="Items" value={String(returnedItems.length)}/><Metric label="Units" value={String(totalReturn)}/><Metric label="Value" value={money(totalValue)}/></div></div><div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">Inventory will remain unchanged until an authorized user approves and processes this return.</div><ModalActions cancel={()=>setShowConfirm(false)} action={submit} label="Confirm & Submit"/></Modal>}

        {showHistory&&<Modal title="Purchase Return History" close={()=>setShowHistory(false)} wide><div className="mb-4 flex flex-col gap-2 md:flex-row"><input className="input" placeholder="Search return, GRN, PO or supplier..." value={search} onChange={e=>setSearch(e.target.value)}/><select className="input md:w-48" value={statusFilter} onChange={e=>setStatusFilter(e.target.value as any)}><option>All</option>{["Draft","Pending Approval","Approved","Rejected","Completed"].map(x=><option key={x}>{x}</option>)}</select></div><div className="max-h-[55vh] overflow-auto"><table className="w-full text-left"><thead className="bg-gray-50"><tr>{["Return","Supplier","Warehouse","Units","Value","Status",""].map(x=><th key={x} className="px-3 py-3 text-[9px] font-bold uppercase text-gray-500">{x}</th>)}</tr></thead><tbody className="divide-y">{filteredHistory.map(x=><tr key={x.id} className="hover:bg-gray-50"><td className="px-3 py-3"><b className="text-xs text-blue-700">{x.returnNumber}</b><p className="text-[9px] text-gray-400">{x.grn}</p></td><td className="px-3 py-3 text-xs">{x.supplier}</td><td className="px-3 py-3 text-xs">{x.warehouse}</td><td className="px-3 py-3 text-xs font-bold">{x.items.reduce((s,i)=>s+i.returnQty,0)}</td><td className="px-3 py-3 text-xs font-bold">{money(x.items.reduce((s,i)=>s+i.returnQty*i.unitPrice,0))}</td><td className="px-3 py-3"><span className={`rounded-full px-2 py-1 text-[9px] font-bold ${badge(x.status)}`}>{x.status}</span></td><td className="px-3 py-3"><button onClick={()=>setSelectedHistory(x)} className="text-[10px] font-bold text-blue-700">View</button></td></tr>)}</tbody></table>{!filteredHistory.length&&<p className="py-12 text-center text-xs text-gray-400">No returns found.</p>}</div></Modal>}

        {selectedHistory&&<Modal title={selectedHistory.returnNumber} close={()=>setSelectedHistory(null)}><div className="grid gap-3 sm:grid-cols-2"><div className="card"><small>Status</small><strong>{selectedHistory.status}</strong></div><div className="card"><small>Credit Note</small><strong>{selectedHistory.creditNote||"—"}</strong></div><div className="card"><small>GRN / PO</small><strong>{selectedHistory.grn} / {selectedHistory.po}</strong></div><div className="card"><small>Requester</small><strong>{selectedHistory.requester}</strong></div></div><div className="mt-4 space-y-2">{selectedHistory.items.map(x=><div key={x.id} className="rounded-xl border p-3"><div className="flex justify-between"><b className="text-xs">{x.product}</b><b className="text-xs text-red-600">-{x.returnQty}</b></div><p className="mt-1 text-[10px] text-gray-500">{x.sku} · {x.reason} · {x.condition} · {x.batchNumber||"No batch"}</p></div>)}</div></Modal>}
      </div>
    </main>
    <style jsx global>{`.input{width:100%;border:1px solid #e5e7eb;border-radius:.7rem;background:white;padding:.65rem .75rem;font-size:.75rem;outline:none}.input:focus{border-color:#60a5fa;box-shadow:0 0 0 3px #dbeafe}.btn{border:1px solid #e5e7eb;background:white;border-radius:.7rem;padding:.6rem .8rem;font-size:.7rem;font-weight:700;color:#374151}.primary,.success,.danger{border-radius:.7rem;padding:.6rem .9rem;font-size:.7rem;font-weight:700;color:white}.primary{background:#12213a}.success{background:#059669}.danger{background:#dc2626}.card{border:1px solid #e5e7eb;border-radius:.8rem;background:white;padding:.8rem}.card small{display:block;font-size:9px;text-transform:uppercase;color:#9ca3af;font-weight:700}.card strong{display:block;margin-top:.3rem;font-size:12px;color:#1f2937}`}</style>
  </PageLayout>;
}

function Field({label,children}:{label:string;children:React.ReactNode}){return <div><label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-gray-500">{label}</label>{children}</div>}
function Metric({label,value}:{label:string;value:string}){return <div><p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">{label}</p><p className="mt-1 text-sm font-black text-gray-900">{value}</p></div>}
function Modal({title,close,children,wide=false}:{title:string;close:()=>void;children:React.ReactNode;wide?:boolean}){return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><div className={`w-full ${wide?"max-w-5xl":"max-w-xl"} max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl`}><div className="flex items-center justify-between border-b px-6 py-4"><h2 className="text-lg font-bold text-[#12213a]">{title}</h2><button onClick={close} className="rounded-lg px-3 py-2 text-gray-400 hover:bg-gray-100">✕</button></div><div className="max-h-[75vh] overflow-y-auto p-6">{children}</div></div></div>}
function ModalActions({cancel,action,label}:{cancel:()=>void;action:()=>void;label:string}){return <div className="mt-5 flex justify-end gap-2 border-t pt-4"><button onClick={cancel} className="btn">Cancel</button><button onClick={action} className="primary">{label}</button></div>}
