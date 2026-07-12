"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import {
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  Clock,
  Columns3,
  Download,
  ExternalLink,
  Filter,
  ImageIcon,
  Info,
  Plus,
  Save,
  Search,
  Table2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExportButton } from "@/components/dashboard/export-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Order } from "@/types/erp";

type OperationsMode =
  | "merchant"
  | "task-manager"
  | "material-requisition"
  | "fabric-working"
  | "design-gallery"
  | "notifications"
  | "sample-create"
  | "sample-assign"
  | "sampling-status"
  | "sample-tracking"
  | "style-repository"
  | "style-databank"
  | "inventory"
  | "production"
  | "suppliers"
  | "costing"
  | "generic";

type OperationsScreenProps = {
  mode: OperationsMode;
  title?: string;
  description?: string;
};

type OrdersResponse = {
  orders: Order[];
};

const buyerNames = ["DESIGN DEPT", "ENGINEERING", "MARKETING", "HUMAN RESOURCES", "LOGISTICS", "EXECUTIVE SUITE"];
const designers = ["MANSI KAPOOR", "TAMANNA", "SIMRAN SAHU", "VIBHA KOCHAR", "PRIYA BHARTIYA"];
const departments = ["IT INFRASTRUCTURE", "FLEET MANAGEMENT", "OFFICE ADMIN", "TECH OPERATIONS", "FINANCE SERVICES"];

const fetchOrders = async () => {
  const res = await fetch("/api/orders");
  if (!res.ok) throw new Error("Failed to fetch orders");
  const data = (await res.json()) as OrdersResponse;
  return data.orders ?? [];
};

const formatDate = (value?: Date | string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(date);
};

const displayRef = (order: Order, index: number) => order.refNo ? order.refNo.replace("CTA", "ALC") : `ALC/${String(26030000 + index).padStart(8, "0")}`;
const displayVgRef = (index: number) => `AST/${String(392 + index).padStart(6, "0")}`;
const displayBuyer = (order: Order, index: number) => order.buyer || buyerNames[index % buyerNames.length];
const displayBrand = (order: Order, index: number) => order.brand ?? displayBuyer(order, index);
const displayStyle = (order: Order, index: number) => order.styleName ?? order.styleId ?? `Asset Type ${index + 1}`;

function RefBadge({
  children,
  tone = "green",
}: {
  children: React.ReactNode;
  tone?: "green" | "yellow" | "blue" | "red";
}) {
  const styles = {
    green: "border-emerald-500/20 bg-emerald-500/10 text-emerald-500",
    yellow: "border-amber-500/20 bg-amber-500/10 text-amber-500",
    blue: "border-blue-500/20 bg-blue-500/10 text-blue-500",
    red: "border-red-500/20 bg-red-500/10 text-red-500",
  };

  return <span className={cn("rounded-md border px-1.5 py-0.5 font-mono font-medium text-xs", styles[tone])}>{children}</span>;
}

function CountBadge({ value, tone }: { value: ReactNode; tone: "red" | "orange" | "green" | "blue" | "gray" }) {
  const styles = {
    red: "bg-red-500/20 text-red-500 border-red-500/30",
    orange: "bg-orange-500/20 text-orange-500 border-orange-500/30",
    green: "bg-emerald-500/20 text-emerald-500 border-emerald-500/30",
    blue: "bg-blue-500/20 text-blue-500 border-blue-500/30",
    gray: "bg-muted text-muted-foreground border-border",
  };

  return (
    <span className={cn("inline-flex min-w-7 justify-center items-center rounded-md border px-1.5 py-0.5 font-medium text-xs", styles[tone])}>
      {value}
    </span>
  );
}

function Toolbar({ task = false }: { task?: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {task && (
        <>
          <Button variant="outline" className="gap-2 border-blue-500/20 bg-blue-500/10 text-blue-500 hover:bg-blue-500/25">
            <Info className="size-4" />
            Status Info
          </Button>
          <Button variant="outline" className="gap-2 border-purple-500/20 bg-purple-500/10 text-purple-500 hover:bg-purple-500/25">
            <CalendarDays className="size-4" />
            Bulk Flow
          </Button>
          <Button variant="outline" className="gap-2 border-sky-500/20 bg-sky-500/10 text-sky-500 hover:bg-sky-500/25">
            <Filter className="size-4" />
            Sort By Delivery Date
          </Button>
          <Button variant="outline" className="gap-2 border-purple-500/20 bg-purple-500/10 text-purple-500 hover:bg-purple-500/25">
            <Columns3 className="size-4" />
            Columns
          </Button>
        </>
      )}
      <div className="ml-auto flex min-w-0 flex-wrap items-center gap-3">
        <Button variant="outline" className="min-w-44 justify-between">
          Department
          <ChevronDown className="size-4" />
        </Button>
        <div className="relative">
          <Search className="-translate-y-1/2 absolute top-1/2 right-3 size-4 text-muted-foreground" />
          <Input className="w-60 pr-9" placeholder="Search / Filter" />
        </div>
        {task && (
          <Button variant="outline" className="min-w-40 justify-between">
            Delivery Date: All
            <CalendarDays className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

function HighlightTable({ title, rows, tone }: { title: string; rows: Order[]; tone: "green" | "yellow" | "blue" }) {
  return (
    <Card className="min-h-[300px] rounded-lg py-0">
      <CardHeader className="border-b bg-muted/30 py-4">
        <div className="flex items-center justify-between">
          <CardTitle className="font-semibold text-lg">{title}</CardTitle>
          <ExternalLink className="size-4" />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Allocation Ref.</TableHead>
              <TableHead>Asset Ref.</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Custodian</TableHead>
              <TableHead>Asset Code</TableHead>
              <TableHead>Asset Name</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((order, index) => (
              <TableRow key={`${order.id}-${title}`}>
                <TableCell>
                  <RefBadge tone={index % 4 === 0 ? "yellow" : tone}>{displayRef(order, index)}</RefBadge>
                </TableCell>
                <TableCell>{displayVgRef(index)}</TableCell>
                <TableCell>{displayBuyer(order, index)}</TableCell>
                <TableCell>{displayBrand(order, index)}</TableCell>
                <TableCell>{order.styleId}</TableCell>
                <TableCell>{displayStyle(order, index)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="mt-4 text-right text-sm text-muted-foreground">
          1-{Math.min(rows.length, 7)} of {rows.length}
        </div>
      </CardContent>
    </Card>
  );
}

function MerchantDashboard({ orders }: { orders: Order[] }) {
  const sample = orders.slice(0, 10);
  const risk = orders.filter((order) => order.approvalPending || order.pfhStatus !== "approved").slice(0, 5);
  const ppm = orders.filter((order) => order.ppmStatus).slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-center">
        <Tabs value="dashboard" className="w-full max-w-[400px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="dashboard" asChild>
              <Link href="/dashboard/merchant">Dashboard</Link>
            </TabsTrigger>
            <TabsTrigger value="task-manager" asChild>
              <Link href="/dashboard/merchant/task-manager">Task Manager</Link>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <section className="space-y-4">
        <Toolbar />
        <h2 className="font-semibold text-2xl tracking-tight">Overall Highlights</h2>
        <div className="grid gap-4 xl:grid-cols-3">
          <HighlightTable title="Asset Handover Logs" rows={sample.slice(0, 7)} tone="green" />
          <HighlightTable title="Asset Risk Analysis" rows={(risk.length ? risk : sample).slice(0, 3)} tone="yellow" />
          <HighlightTable title="Maintenance Schedule" rows={(ppm.length ? ppm : sample).slice(0, 4)} tone="blue" />
        </div>
      </section>
      <section className="space-y-4">
        <h2 className="font-semibold text-2xl tracking-tight">Diagnostic & Funding Status</h2>
        <div className="grid gap-4 xl:grid-cols-2">
          <ReportCard
            title="Device Diagnostic & Health Reports"
            orders={orders.slice(0, 7)}
            status="Sent"
            count={78}
          />
          <ReportCard title="Procurement Funding Approvals" orders={orders.slice(2, 6)} status="sent" count={4} />
        </div>
      </section>
      <section className="space-y-4">
        <h2 className="font-semibold text-2xl tracking-tight">Asset Operational Highlights</h2>
        <div className="grid gap-4 xl:grid-cols-2">
          <ReportCard title="Standard Operating Procedure (SOP) Audits" orders={orders.slice(4, 10)} status="sent" count={8} />
          <ReportCard title="Bulk Hardware Provisioning" orders={orders.slice(8, 14)} status="All" count={orders.length} />
        </div>
      </section>
    </div>
  );
}

function ReportCard({
  title,
  orders,
  status,
  count,
}: {
  title: string;
  orders: Order[];
  status: string;
  count: number;
}) {
  return (
    <Card className="rounded-lg py-0">
      <CardHeader className="border-b bg-muted/30 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Filter className="size-4 text-purple-500" />
            <span className="font-semibold">Status:</span>
            <Button variant="outline" className="min-w-28 justify-between">
              {status}
              <ChevronDown className="size-4" />
            </Button>
          </div>
          <Badge className="bg-blue-500/20 text-blue-500 border border-blue-500/30 hover:bg-blue-500/30">{count} items</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-lg">{title}</h3>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="gap-2 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/25">
              <Download className="size-4" />
              Export
            </Button>
            <ExternalLink className="size-4 text-muted-foreground" />
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Action</TableHead>
              <TableHead>Allocation Ref.</TableHead>
              <TableHead>Asset Ref.</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Custodian</TableHead>
              <TableHead>Deadline Margin</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order, index) => {
              const overdue = index % 3 === 0;
              return (
                <TableRow key={`${order.id}-${title}`}>
                  <TableCell>
                    <Check className="size-5 text-emerald-500" />
                  </TableCell>
                  <TableCell>
                    <RefBadge tone={index % 2 ? "blue" : "yellow"}>{displayRef(order, index)}</RefBadge>
                  </TableCell>
                  <TableCell>{displayVgRef(index)}</TableCell>
                  <TableCell>{displayBuyer(order, index)}</TableCell>
                  <TableCell>{displayBrand(order, index)}</TableCell>
                  <TableCell>
                    <CountBadge
                      value={overdue ? `-${index + 1}d` : `+${index + 2}d`}
                      tone={overdue ? "red" : "green"}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function TaskManager({ orders }: { orders: Order[] }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center">
        <Tabs value="task-manager" className="w-full max-w-[400px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="dashboard" asChild>
              <Link href="/dashboard/merchant">Dashboard</Link>
            </TabsTrigger>
            <TabsTrigger value="task-manager" asChild>
              <Link href="/dashboard/merchant/task-manager">Task Manager</Link>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <Toolbar task />
      <Card className="overflow-hidden rounded-lg py-0">
        <div className="overflow-auto">
          <Table className="min-w-[1500px]">
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead>Asset Type / Name</TableHead>
                <TableHead>Allocated Qty</TableHead>
                <TableHead>Verified</TableHead>
                <TableHead>Risk Assessment</TableHead>
                <TableHead>Hardware</TableHead>
                <TableHead>Peripherals</TableHead>
                <TableHead>Software Suite</TableHead>
                <TableHead>Purchase Value</TableHead>
                <TableHead>Network Setup</TableHead>
                <TableHead>Configuration Profile</TableHead>
                <TableHead>Handover Cert</TableHead>
                <TableHead>System Diagnostics</TableHead>
                <TableHead>Compliance Check</TableHead>
                <TableHead>Scheduled Audits</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.slice(0, 41).map((order, index) => {
                const overdue = index % 5 === 0;
                return (
                  <TableRow key={order.id} className={index % 2 ? "bg-muted/10" : undefined}>
                    <TableCell className="bg-muted/30 font-medium">{displayStyle(order, index)}</TableCell>
                    <TableCell className="bg-muted/30 font-semibold">
                      {Number(order.orderQty || 0).toFixed(1)}
                    </TableCell>
                    <TableCell>
                      <CountBadge value={<Check className="size-3" />} tone="green" />
                    </TableCell>
                    <TableCell>
                      <CountBadge
                        value={overdue ? `-${index + 2}` : <Check className="size-3" />}
                        tone={overdue ? "red" : "green"}
                      />
                    </TableCell>
                    <TableCell>
                      <StageCounts index={index} />
                    </TableCell>
                    <TableCell>
                      <StageCounts index={index + 3} />
                    </TableCell>
                    <TableCell>{index % 3 === 0 ? <CountBadge value={index % 7} tone="green" /> : "-"}</TableCell>
                    <TableCell>{index % 4 === 0 ? <CountBadge value={1} tone="orange" /> : "-"}</TableCell>
                    <TableCell>{overdue ? <CountBadge value={`-${index + 7}`} tone="red" /> : "-"}</TableCell>
                    <TableCell>{overdue ? <CountBadge value={`-${index + 7}`} tone="red" /> : "-"}</TableCell>
                    <TableCell>
                      {index % 2 === 0 ? <CountBadge value={<Check className="size-3" />} tone="green" /> : "-"}
                    </TableCell>
                    <TableCell>
                      {overdue ? <CountBadge value="-18" tone="red" /> : <CountBadge value="+15" tone="orange" />}
                    </TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>{index % 6 === 0 ? <CountBadge value="+46" tone="orange" /> : "-"}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between border-t px-4 py-3 text-sm text-muted-foreground">
          <span>Records per page: 100</span>
          <span>
            1 - {Math.min(orders.length, 41)} of {Math.min(orders.length, 41)}
          </span>
        </div>
      </Card>
    </div>
  );
}

function StageCounts({ index }: { index: number }) {
  return (
    <div className="flex items-center gap-2">
      <CountBadge value={index % 4} tone="red" />
      <CountBadge value={(index + 2) % 8} tone="orange" />
      <CountBadge value={(index + 1) % 5} tone="green" />
      <CountBadge value={index % 3} tone="blue" />
      <ChevronDown className="size-4" />
    </div>
  );
}

function MaterialRequisition({ orders }: { orders: Order[] }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2 border-purple-500/20 bg-purple-500/10 text-purple-500 hover:bg-purple-500/25">
              <Plus className="size-4" />
              Create New
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-6xl overflow-auto bg-card text-card-foreground">
            <DialogHeader className="border-b pb-4">
              <DialogTitle>Add New - EQUIPMENT</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 p-2 md:grid-cols-3">
              {[
                "Requisition No.",
                "Item: Laptop/Server/Accessory",
                "Reqn Type: Local",
                "Requisition Date",
                "Company",
                "Asset Manager",
                "Requisition For",
                "Department",
                "Quarter / Term",
                "For Location",
                "Prepared By",
                "Dept From",
                "Dept To",
              ].map((field) => (
                <Input
                  key={field}
                  placeholder={field}
                  defaultValue={field.includes(":") ? field.split(": ")[1] : undefined}
                />
              ))}
            </div>
            <div className="mt-4 border rounded-lg overflow-hidden">
              <div className="bg-muted px-4 py-3 font-semibold border-b">Details</div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button size="icon" variant="outline">
                        <Plus className="size-4" />
                      </Button>
                    </TableHead>
                    {[
                      "Item Category",
                      "Item Desc",
                      "Model/Serial",
                      "Specs / RAM / Storage",
                      "Unit",
                      "Reqn Qty",
                      "Rate",
                      "Reqd On",
                      "Remark",
                    ].map((head) => (
                      <TableHead key={head}>{head}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
              </Table>
            </div>
            <Button className="mt-6 w-fit gap-2">
              <Save className="size-4" />
              Save
            </Button>
          </DialogContent>
        </Dialog>
        <Button variant="outline" className="ml-auto min-w-44 justify-between">
          Type: Hardware <ChevronDown className="size-4" />
        </Button>
        <Input className="w-60" placeholder="Search / Filter" />
      </div>
      <DataTable
        title="Material Requisition"
        orders={orders}
        columns={["Created Date", "Asset Manager", "Prepared By", "Department From", "Item Type"]}
      />
    </div>
  );
}

function DataTable({ title, orders, columns }: { title: string; orders: Order[]; columns: string[] }) {
  return (
    <Card className="rounded-lg py-0">
      <CardHeader className="border-b py-4">
        <CardTitle className="text-2xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Our Ref</TableHead>
              {columns.map((column) => (
                <TableHead key={column}>{column}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.slice(0, 20).map((order, index) => (
              <TableRow key={`${title}-${order.id}`}>
                <TableCell>{displayVgRef(index)}</TableCell>
                <TableCell>{formatDate(order.createdAt)}</TableCell>
                <TableCell>{designers[index % designers.length]}</TableCell>
                <TableCell>{designers[(index + 2) % designers.length]}</TableCell>
                <TableCell>{departments[index % departments.length]}</TableCell>
                <TableCell>Hardware</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function FabricWorking({ orders }: { orders: Order[] }) {
  const exportRows = orders.slice(0, 22).map((order, index) => ({
    "Created At": formatDate(order.createdAt),
    "Our Ref": displayVgRef(index),
    "Order No": displayVgRef(index),
    "PO No": `${55713 + index}`,
    "User Created": designers[index % designers.length],
    "Order Qty": Number(order.orderQty || 0).toFixed(1),
    "Qty Unit": "PCS",
    "Style No": order.styleId ?? "",
    "Order Date": formatDate(order.deliveryDate),
    Status: index % 6 === 0 ? "Revised" : "Approved",
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold text-2xl font-heading">Equipment Reports</h2>
        <div className="flex flex-wrap items-center gap-2">
          <ExportButton data={exportRows} filename="equipment-reports" label="Export All" />
          <Input className="w-60" placeholder="Filter / Search" />
        </div>
      </div>
      <Card className="rounded-lg py-0">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                {[
                  "Action",
                  "Created At",
                  "Our Ref",
                  "Req No",
                  "PO No",
                  "User Created",
                  "Quantity",
                  "Qty Unit",
                  "Asset Code",
                  "Delivery Date",
                  "Status",
                ].map((head) => (
                  <TableHead key={head}>{head}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.slice(0, 22).map((order, index) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <ExportButton
                      data={[exportRows[index]]}
                      filename={`equipment-report-${displayVgRef(index).replaceAll("/", "-")}`}
                      label="Action"
                      size="sm"
                    />
                  </TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                  <TableCell>{displayVgRef(index)}</TableCell>
                  <TableCell>{displayVgRef(index)}</TableCell>
                  <TableCell>{String(55713 + index)}...</TableCell>
                  <TableCell>{designers[index % designers.length]}</TableCell>
                  <TableCell>{Number(order.orderQty || 0).toFixed(1)}</TableCell>
                  <TableCell>PCS</TableCell>
                  <TableCell>{order.styleId}</TableCell>
                  <TableCell>{formatDate(order.deliveryDate)}</TableCell>
                  <TableCell
                    className={index % 6 === 0 ? "font-semibold text-orange-500" : "font-semibold text-emerald-500"}
                  >
                    {index % 6 === 0 ? "Revised" : "Approved"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function DesignGallery({ orders }: { orders: Order[] }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <h2 className="font-semibold text-2xl font-heading">Asset Document Vault</h2>
        <div className="ml-auto flex flex-wrap gap-3">
          <Input className="w-60" placeholder="Filter" />
          <Button variant="outline" className="min-w-40 justify-between">
            Department <ChevronDown className="size-4" />
          </Button>
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white border-none">Apply</Button>
          <Button variant="secondary">Clear</Button>
          <Button>Vault List</Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {orders.slice(0, 12).map((order, index) => (
          <Card key={order.id} className="overflow-hidden rounded-lg py-0">
            <div className="relative flex aspect-[4/2.5] items-center justify-center bg-muted">
              <ImageIcon className="size-12 text-muted-foreground" />
              <Badge className="absolute top-0 right-0 rounded-none bg-emerald-500 text-white border-none">Id: {21900 + index}</Badge>
            </div>
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center gap-3 text-lg font-semibold">
                <span className="size-5 rounded border border-border" />
                {displayStyle(order, index)}
              </div>
              <div className="grid grid-cols-[7rem_1fr] overflow-hidden rounded-md border text-sm">
                <div className="border-r px-3 py-2 text-muted-foreground bg-muted/20">Department</div>
                <div className="px-3 py-2">{displayBuyer(order, index)}</div>
                <div className="border-r border-t px-3 py-2 text-muted-foreground bg-muted/20">Asset Manager</div>
                <div className="border-t px-3 py-2">{designers[index % designers.length]}</div>
                <div className="border-r border-t px-3 py-2 text-muted-foreground bg-muted/20">Term</div>
                <div className="border-t px-3 py-2">{index % 2 ? "Q3 FY26" : "Q4 FY26"}</div>
                <div className="border-r border-t px-3 py-2 text-muted-foreground bg-muted/20">Status</div>
                <div className="border-t px-3 py-2">
                  <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">
                    Active
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Notifications({ orders }: { orders: Order[] }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h2 className="font-semibold text-2xl font-heading">Unread Notifications</h2>
        <Input className="w-72" placeholder="Search / Filter" />
      </div>
      {orders.slice(0, 12).map((order, index) => (
        <Card key={order.id} className="rounded-lg border-purple-500/30 bg-purple-500/5 py-0">
          <CardContent className="flex items-center gap-4 p-4">
            <Bell className="size-5 text-purple-500" />
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-purple-500">
                Ref No: {displayRef(order, index)}, Asset Type: {displayStyle(order, index)}
              </div>
              <p className="text-muted-foreground text-sm">
                Reference number {displayRef(order, index)} has been created allocation request by{" "}
                {designers[index % designers.length]}.
              </p>
            </div>
            <Badge className="bg-purple-500 text-white border-none">New</Badge>
            <span className="text-sm text-muted-foreground">{index + 1} hr ago</span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function GenericModule({
  title,
  description,
  orders,
  mode,
}: {
  title: string;
  description?: string;
  orders: Order[];
  mode: OperationsMode;
}) {
  if (mode === "material-requisition") return <MaterialRequisition orders={orders} />;
  if (mode === "fabric-working") return <FabricWorking orders={orders} />;
  if (mode === "design-gallery") return <DesignGallery orders={orders} />;
  if (mode === "notifications") return <Notifications orders={orders} />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-semibold text-2xl font-heading">{title}</h2>
        {description && <p className="mt-1 text-muted-foreground">{description}</p>}
      </div>
      <Toolbar task={mode === "production"} />
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Assets</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{orders.length}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Departments</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{new Set(orders.map((o) => o.buyer)).size}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Open Actions</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{orders.filter((o) => o.approvalPending).length}</CardContent>
        </Card>
      </div>
      <DataTable
        title={title}
        orders={orders}
        columns={["Created Date", "Asset Manager", "Prepared By", "Department From", "Item Type"]}
      />
    </div>
  );
}

export function OperationsScreen({ mode, title, description }: OperationsScreenProps) {
  const { data, isLoading, error } = useQuery({ queryKey: ["cta-operations-orders"], queryFn: fetchOrders });
  const orders = useMemo(() => data ?? [], [data]);

  if (isLoading) {
    return <div className="p-10 text-muted-foreground">Loading operational data...</div>;
  }

  if (error) {
    return (
      <div className="p-10 text-red-600">
        Unable to load asset records. Check database connection and /api/orders.
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="p-10 text-muted-foreground">
        No asset data found. Run the setup and seed endpoints before using this module.
      </div>
    );
  }

  if (mode === "merchant") return <MerchantDashboard orders={orders} />;
  if (mode === "task-manager") return <TaskManager orders={orders} />;

  return <GenericModule title={title ?? "Asset Management"} description={description} orders={orders} mode={mode} />;
}
