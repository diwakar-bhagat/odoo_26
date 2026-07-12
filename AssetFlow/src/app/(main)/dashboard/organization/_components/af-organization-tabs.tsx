"use client";

import { useState } from "react";

export function OrganizationTabs({ data }: { data: { departments: any[], employees: any[] } }) {
  const [tab, setTab] = useState<"departments" | "employees">("departments");
  const [search, setSearch] = useState("");

  const filteredDepts = data.departments.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase())
  );
  
  const filteredEmps = data.employees.filter(e => 
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center space-x-2 border-b pb-4">
        <button 
          onClick={() => setTab("departments")}
          className={`px-4 py-2 text-sm font-medium transition-colors rounded-md ${tab === "departments" ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-secondary/50"}`}
        >
          Departments
        </button>
        <button 
          onClick={() => setTab("employees")}
          className={`px-4 py-2 text-sm font-medium transition-colors rounded-md ${tab === "employees" ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-secondary/50"}`}
        >
          Employees
        </button>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm mt-4">
        <div className="p-4 border-b">
          <input 
            type="text" 
            placeholder={tab === "departments" ? "Search departments..." : "Search employees..."} 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex h-9 w-full md:w-[300px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        
        <div className="p-0">
          <div className="relative w-full overflow-auto">
            {tab === "departments" ? (
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Department Name</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Head</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Employees</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Active Assets</th>
                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {filteredDepts.length === 0 ? (
                    <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No departments found.</td></tr>
                  ) : (
                    filteredDepts.map((d) => (
                      <tr key={d.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <td className="p-4 align-middle font-semibold text-primary">{d.name}</td>
                        <td className="p-4 align-middle font-medium">{d.head_name || "-"}</td>
                        <td className="p-4 align-middle">{d.employee_count}</td>
                        <td className="p-4 align-middle">{d.asset_count}</td>
                        <td className="p-4 align-middle text-right">
                          <button className="text-xs border px-3 py-1 rounded-md hover:bg-accent">Edit</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Email</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Department</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Role</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Active Assets</th>
                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {filteredEmps.length === 0 ? (
                    <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No employees found.</td></tr>
                  ) : (
                    filteredEmps.map((e) => (
                      <tr key={e.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <td className="p-4 align-middle font-semibold text-primary">{e.name}</td>
                        <td className="p-4 align-middle">{e.email}</td>
                        <td className="p-4 align-middle font-medium">{e.department_name || "-"}</td>
                        <td className="p-4 align-middle">
                          <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${e.role === 'Admin' ? 'border-transparent bg-destructive text-destructive-foreground' : e.role === 'Asset Manager' ? 'border-transparent bg-amber-500 text-white' : e.role === 'Department Head' ? 'border-transparent bg-blue-500 text-white' : 'bg-secondary text-secondary-foreground'}`}>{e.role}</div>
                        </td>
                        <td className="p-4 align-middle">{e.active_allocations}</td>
                        <td className="p-4 align-middle text-right">
                          <button className="text-xs border px-3 py-1 rounded-md hover:bg-accent">Edit</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
