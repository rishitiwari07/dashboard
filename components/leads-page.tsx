"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  Loader2,
  MoreHorizontal,
  Mail,
  Phone,
  Building2,
  Globe,
  Calendar,
  DollarSign,
  Clock,
  MessageSquare,
  ExternalLink,
  UserPlus,
  Trash2,
  ChevronDown,
  ChevronUp,
  X,
  Eye,
  ArrowUpDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  companyName: string;
  companyWebsite: string;
  designation: string;
  serviceCategory: string;
  serviceCategorySlug: string;
  services: string[];
  projectDescription: string;
  budget: string;
  timeline: string;
  currency: string;
  source: string;
  sourcePage: string;
  status: string;
  notes: string;
  adminNotes: string;
  convertedClientId: string | null;
  convertedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type Counts = {
  all: number;
  new: number;
  contacted: number;
  interested: number;
  converted: number;
  rejected: number;
};

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className?: string }> = {
  new: { label: "New", variant: "default", className: "bg-blue-600" },
  contacted: { label: "Contacted", variant: "default", className: "bg-amber-600" },
  interested: { label: "Interested", variant: "default", className: "bg-purple-600" },
  converted: { label: "Converted", variant: "default", className: "bg-emerald-600" },
  rejected: { label: "Rejected", variant: "secondary" },
};

const FILTER_TABS = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "contacted", label: "Contacted" },
  { key: "interested", label: "Interested" },
  { key: "converted", label: "Converted" },
  { key: "rejected", label: "Rejected" },
];

import { ConfirmDialog } from "@/components/confirm-dialog";
import { toast } from "sonner";

export function LeadsPageClient() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [counts, setCounts] = useState<Counts>({ all: 0, new: 0, contacted: 0, interested: 0, converted: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Dialog states
  const [convertTargetId, setConvertTargetId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [addLeadOpen, setAddLeadOpen] = useState(false);
  const [addLeadSaving, setAddLeadSaving] = useState(false);
  const [newLead, setNewLead] = useState({
    name: "", email: "", phone: "", companyName: "", designation: "",
    source: "manual", budget: "", timeline: "", projectDescription: "", notes: "",
  });

  async function saveNewLead() {
    if (!newLead.name.trim() || !newLead.email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    setAddLeadSaving(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newLead, source: "manual" }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Lead added successfully!");
        setAddLeadOpen(false);
        setNewLead({ name: "", email: "", phone: "", companyName: "", designation: "", source: "manual", budget: "", timeline: "", projectDescription: "", notes: "" });
        fetchLeads();
      } else {
        toast.error(data.message || "Failed to add lead");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setAddLeadSaving(false);
    }
  }

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search) params.set("search", search);
      params.set("sort", sort);

      const res = await fetch(`/api/leads?${params.toString()}`);
      const data = await res.json();
      setLeads(data.leads || []);
      setCounts(data.counts || { all: 0, new: 0, contacted: 0, interested: 0, converted: 0, rejected: 0 });
    } catch {
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search, sort]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Debounced search
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  async function updateLeadStatus(leadId: string, status: string) {
    setActionLoading(leadId);
    try {
      await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      fetchLeads();
    } catch {
      // ignore
    } finally {
      setActionLoading(null);
    }
  }

  async function executeConvertToClient() {
    if (!convertTargetId) return;
    setActionLoading(convertTargetId);
    try {
      const res = await fetch(`/api/leads/${convertTargetId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "convert_to_client" }),
      });
      const data = await res.json();
      if (res.ok && data.clientId) {
        toast.success(data.message || "Lead converted to client! 🎉");
      } else {
        toast.error(data.message || "Failed to convert lead");
      }
      setConvertTargetId(null);
      fetchLeads();
    } catch {
      toast.error("Network error converting lead");
    } finally {
      setActionLoading(null);
    }
  }

  function convertToClient(leadId: string) {
    setConvertTargetId(leadId);
  }

  async function executeDeleteLead() {
    if (!deleteTargetId) return;
    setActionLoading(deleteTargetId);
    try {
      await fetch(`/api/leads/${deleteTargetId}`, { method: "DELETE" });
      toast.success("Lead deleted successfully");
      setDeleteTargetId(null);
      fetchLeads();
    } catch {
      toast.error("Failed to delete lead");
    } finally {
      setActionLoading(null);
    }
  }

  function deleteLead(leadId: string) {
    setDeleteTargetId(leadId);
  }

  async function updateAdminNotes(leadId: string, notes: string) {
    try {
      await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNotes: notes }),
      });
    } catch {
      // ignore
    }
  }

  function formatDate(dateStr: string) {
    if (!dateStr) return "~";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function timeAgo(dateStr: string) {
    if (!dateStr) return "";
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diff = now - then;
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return formatDate(dateStr);
  }

  return (
    <div className="space-y-6">
      {/* Convert Lead Confirmation Dialog */}
      <ConfirmDialog
        open={!!convertTargetId}
        onOpenChange={(open) => { if (!open) setConvertTargetId(null); }}
        title="Convert Lead to Client?"
        description="Convert this lead into a client? This will create a new client record with full onboarding access."
        confirmLabel={actionLoading ? "Converting..." : "Convert to Client"}
        variant="default"
        isLoading={!!actionLoading}
        onConfirm={executeConvertToClient}
      />

      {/* Delete Lead Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteTargetId}
        onOpenChange={(open) => { if (!open) setDeleteTargetId(null); }}
        title="Delete Lead?"
        description="Are you sure you want to permanently delete this lead record?"
        confirmLabel={actionLoading ? "Deleting..." : "Delete Lead"}
        variant="destructive"
        isLoading={!!actionLoading}
        onConfirm={executeDeleteLead}
      />

      {/* Filters bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10 h-10 rounded-xl"
          />
        </div>

        {/* Sort + Add */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl gap-1.5"
            onClick={() => setSort(sort === "newest" ? "oldest" : "newest")}
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            {sort === "newest" ? "Newest first" : "Oldest first"}
          </Button>
          <Button size="sm" className="rounded-xl gap-1.5" onClick={() => setAddLeadOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Add Lead
          </Button>
        </div>
      </div>

      {/* Add Lead Dialog */}
      <Dialog open={addLeadOpen} onOpenChange={setAddLeadOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Lead Manually</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="space-y-1">
              <Label className="text-xs">Name *</Label>
              <Input placeholder="Full Name" value={newLead.name} onChange={e => setNewLead(n => ({ ...n, name: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Email *</Label>
              <Input type="email" placeholder="email@example.com" value={newLead.email} onChange={e => setNewLead(n => ({ ...n, email: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Phone</Label>
              <Input placeholder="+91 98765 43210" value={newLead.phone} onChange={e => setNewLead(n => ({ ...n, phone: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Company Name</Label>
              <Input placeholder="Company" value={newLead.companyName} onChange={e => setNewLead(n => ({ ...n, companyName: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Designation</Label>
              <Input placeholder="CEO, Manager…" value={newLead.designation} onChange={e => setNewLead(n => ({ ...n, designation: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Budget</Label>
              <Input placeholder="e.g. ₹50,000" value={newLead.budget} onChange={e => setNewLead(n => ({ ...n, budget: e.target.value }))} />
            </div>
            <div className="col-span-2 space-y-1">
              <Label className="text-xs">Project Description</Label>
              <Textarea placeholder="Briefly describe the project…" rows={2} value={newLead.projectDescription} onChange={e => setNewLead(n => ({ ...n, projectDescription: e.target.value }))} />
            </div>
            <div className="col-span-2 space-y-1">
              <Label className="text-xs">Initial Notes / Follow-up</Label>
              <Textarea placeholder="Any initial notes or follow-up action…" rows={2} value={newLead.notes} onChange={e => setNewLead(n => ({ ...n, notes: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddLeadOpen(false)}>Cancel</Button>
            <Button onClick={saveNewLead} disabled={addLeadSaving}>
              {addLeadSaving ? "Saving…" : "Add Lead"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status filter tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {FILTER_TABS.map((tab) => (
          <Button
            key={tab.key}
            variant={statusFilter === tab.key ? "default" : "outline"}
            size="sm"
            className="rounded-xl"
            onClick={() => setStatusFilter(tab.key)}
          >
            {tab.label}
            <span className="ml-1.5 text-xs opacity-70">
              {counts[tab.key as keyof Counts] || 0}
            </span>
          </Button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border bg-background overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg font-medium">No leads found</p>
            <p className="text-sm mt-1">
              {search
                ? "Try a different search term"
                : "Leads from Rapydlaunch will appear here"}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[240px]">Lead</TableHead>
                <TableHead className="hidden md:table-cell">Service</TableHead>
                <TableHead className="hidden lg:table-cell">Budget</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
                <TableHead className="text-right w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => {
                const isExpanded = expandedId === lead.id;
                const statusConf = STATUS_CONFIG[lead.status] || STATUS_CONFIG.new;
                const isActionLoading = actionLoading === lead.id;

                return (
                  <>
                    <TableRow
                      key={lead.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() =>
                        setExpandedId(isExpanded ? null : lead.id)
                      }
                    >
                      <TableCell>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{lead.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {lead.email}
                          </p>
                          {lead.companyName && (
                            <p className="text-xs text-muted-foreground truncate">
                              {lead.companyName}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="text-sm truncate">
                          {lead.serviceCategory || "~"}
                        </span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span className="text-sm">
                          {lead.budget || "~"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={statusConf.variant}
                          className={`font-normal ${statusConf.className || ""}`}
                        >
                          {statusConf.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <span className="text-xs text-muted-foreground">
                          {timeAgo(lead.createdAt)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {isActionLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedId(
                                    isExpanded ? null : lead.id
                                  );
                                }}
                              >
                                {isExpanded ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  {/* Status changes */}
                                  {lead.status !== "contacted" && (
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        updateLeadStatus(lead.id, "contacted");
                                      }}
                                    >
                                      Mark as Contacted
                                    </DropdownMenuItem>
                                  )}
                                  {lead.status !== "interested" && (
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        updateLeadStatus(lead.id, "interested");
                                      }}
                                    >
                                      Mark as Interested
                                    </DropdownMenuItem>
                                  )}
                                  {lead.status !== "rejected" && (
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        updateLeadStatus(lead.id, "rejected");
                                      }}
                                    >
                                      Mark as Rejected
                                    </DropdownMenuItem>
                                  )}
                                  {lead.status !== "new" && (
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        updateLeadStatus(lead.id, "new");
                                      }}
                                    >
                                      Reset to New
                                    </DropdownMenuItem>
                                  )}

                                  <DropdownMenuSeparator />

                                  {/* Convert to client */}
                                  {lead.status !== "converted" && (
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        convertToClient(lead.id);
                                      }}
                                      className="text-emerald-600 focus:text-emerald-600"
                                    >
                                      <UserPlus className="w-4 h-4 mr-2" />
                                      Convert to Client
                                    </DropdownMenuItem>
                                  )}

                                  {lead.convertedClientId && (
                                    <DropdownMenuItem asChild>
                                      <a
                                        href={`/dashboard/clients/${lead.convertedClientId}`}
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <ExternalLink className="w-4 h-4 mr-2" />
                                        View Client
                                      </a>
                                    </DropdownMenuItem>
                                  )}

                                  <DropdownMenuSeparator />

                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteLead(lead.id);
                                    }}
                                    className="text-red-500 focus:text-red-500"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Expanded detail row */}
                    {isExpanded && (
                      <TableRow key={`${lead.id}-detail`} className="bg-muted/30 hover:bg-muted/30">
                        <TableCell colSpan={6}>
                          <div className="py-4 space-y-4">
                            {/* Contact info */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                              {lead.email && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                  <a href={`mailto:${lead.email}`} className="text-blue-500 hover:underline truncate">
                                    {lead.email}
                                  </a>
                                </div>
                              )}
                              {lead.phone && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Phone className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                  <a href={`tel:${lead.phone}`} className="hover:underline">
                                    {lead.phone}
                                  </a>
                                </div>
                              )}
                              {lead.companyName && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Building2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                  <span className="truncate">{lead.companyName}</span>
                                </div>
                              )}
                              {lead.companyWebsite && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Globe className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                  <a href={lead.companyWebsite.startsWith("http") ? lead.companyWebsite : `https://${lead.companyWebsite}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline truncate">
                                    {lead.companyWebsite}
                                  </a>
                                </div>
                              )}
                            </div>

                            {/* Project details */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {lead.budget && (
                                <div className="flex items-center gap-2 text-sm">
                                  <DollarSign className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                  <span>Budget: <span className="font-medium">{lead.budget}</span></span>
                                </div>
                              )}
                              {lead.timeline && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                  <span>Timeline: <span className="font-medium">{lead.timeline}</span></span>
                                </div>
                              )}
                              {lead.source && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                  <span>Source: <span className="font-medium capitalize">{lead.source}</span></span>
                                  {lead.sourcePage && (
                                    <span className="text-xs text-muted-foreground">({lead.sourcePage})</span>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Description */}
                            {lead.projectDescription && (
                              <div className="bg-background rounded-xl border p-4">
                                <div className="flex items-center gap-2 text-sm font-medium mb-1">
                                  <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
                                  Project Description
                                </div>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                  {lead.projectDescription}
                                </p>
                              </div>
                            )}

                            {/* Client notes */}
                            {lead.notes && (
                              <div className="bg-background rounded-xl border p-4">
                                <div className="flex items-center gap-2 text-sm font-medium mb-1">
                                  Notes from Lead
                                </div>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                  {lead.notes}
                                </p>
                              </div>
                            )}

                            {/* Admin notes */}
                            <div className="bg-background rounded-xl border p-4">
                              <div className="flex items-center gap-2 text-sm font-medium mb-2">
                                Admin Notes
                              </div>
                              <textarea
                                placeholder="Add internal notes about this lead..."
                                defaultValue={lead.adminNotes}
                                onBlur={(e) =>
                                  updateAdminNotes(lead.id, e.target.value)
                                }
                                rows={2}
                                className="w-full bg-muted/50 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                              />
                            </div>

                            {/* Quick actions */}
                            <div className="flex flex-wrap gap-2">
                              {lead.status !== "converted" && (
                                <Button
                                  size="sm"
                                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
                                  onClick={() => convertToClient(lead.id)}
                                >
                                  <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                                  Convert to Client
                                </Button>
                              )}
                              {lead.convertedClientId && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="rounded-xl"
                                  asChild
                                >
                                  <a href={`/dashboard/clients/${lead.convertedClientId}`}>
                                    <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                                    View Client Record
                                  </a>
                                </Button>
                              )}
                              {lead.email && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="rounded-xl"
                                  asChild
                                >
                                  <a href={`mailto:${lead.email}`}>
                                    <Mail className="w-3.5 h-3.5 mr-1.5" />
                                    Email
                                  </a>
                                </Button>
                              )}
                              {lead.phone && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="rounded-xl"
                                  asChild
                                >
                                  <a href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer">
                                    <Phone className="w-3.5 h-3.5 mr-1.5" />
                                    WhatsApp
                                  </a>
                                </Button>
                              )}
                            </div>

                            {/* Meta */}
                            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-2 border-t">
                              <span>Created: {formatDate(lead.createdAt)}</span>
                              <span>Updated: {formatDate(lead.updatedAt)}</span>
                              {lead.designation && <span>Role: {lead.designation}</span>}
                              {lead.convertedAt && <span>Converted: {formatDate(lead.convertedAt)}</span>}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
