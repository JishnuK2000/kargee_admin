import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import { useNavigate } from "react-router";
import api from "../../api/api";

export default function SupportTickets({ type }: { type: 'COMPLAINT' | 'RETURN_REQUEST' }) {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [activeStatus, setActiveStatus] = useState<string>("ALL");
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);

  const navigate = useNavigate();

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/support");
      // Handle the case where the API might return an object like { tickets: [...] }
      const data = res.data;
      const ticketsArray = Array.isArray(data) ? data : data.tickets || [];
      // Filter strictly by the prop `type`
      const filtered = ticketsArray.filter((t: any) => t.ticketType === type);
      setTickets(filtered);
    } catch (err) {
      console.error(`Error fetching ${type.toLowerCase()}s:`, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [type]);

  const formatId = (_id: string) => _id?.slice(-5).toUpperCase() || "N/A";

  const statusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "warning";
      case "REVIEWED":
        return "info";
      case "APPROVED":
        return "success";
      case "REJECTED":
        return "error";
      case "RESOLVED":
        return "success";
      default:
        return "light";
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const displayedTickets = tickets
    .filter((ticket) =>
      activeStatus === "ALL" ? true : ticket.status === activeStatus,
    )
    .filter((ticket) => {
      const idMatch = formatId(ticket._id).includes(search.toUpperCase());
      const orderMatch = ticket.orderId?.status?.toUpperCase()?.includes(search.toUpperCase()) || formatId(ticket.orderId?._id || "").includes(search.toUpperCase());
      return idMatch || orderMatch;
    })
    .sort((a, b) => {
      if (!sortField) return 0;
      const valA: any = a[sortField];
      const valB: any = b[sortField];
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  const statusTabs = ["ALL", "PENDING", "REVIEWED", "APPROVED", "REJECTED", "RESOLVED"];

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      // Trying /status as it is a common convention or just /admin/tickets/:id based on User Controller API
      const res = await api.put(`/admin/support/${id}`, { status: newStatus });
      
      // Optimistically update
      setTickets(tickets.map((t: any) => t._id === id ? { ...t, status: newStatus } : t));
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
        {type === "COMPLAINT" ? "Complaint Tickets" : "Return Requests"}
      </h2>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {statusTabs.map((status) => (
          <button
            key={status}
            className={`px-4 py-2 rounded-lg font-semibold ${activeStatus === status
              ? "bg-[#5e2a14] text-white"
              : "bg-gray-200 dark:bg-gray-700 dark:text-gray-200"
              }`}
            onClick={() => setActiveStatus(status)}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Search Ticket ID or Order ID"
          className="border p-2 rounded-lg w-64 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <Table>
          <TableHeader className="border-y border-gray-100 dark:border-gray-800">
            <TableRow>

              <TableCell
                isHeader
                className="text-left cursor-pointer"
                onClick={() => handleSort("_id")}
              >
                Ticket ID
              </TableCell>

              <TableCell
                isHeader
                className="text-left cursor-pointer"
                onClick={() => handleSort("subject")}
              >
                Subject
              </TableCell>

              <TableCell
                isHeader
                className="text-left cursor-pointer"
                onClick={() => handleSort("status")}
              >
                Status
              </TableCell>
              <TableCell
                isHeader
                className="text-left cursor-pointer"
              >
                Order ID
              </TableCell>
              <TableCell
                isHeader
                className="text-left cursor-pointer"
              >
                User
              </TableCell>
              <TableCell isHeader className="text-left">
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              <TableRow>
                {/* @ts-ignore */}
                <TableCell colSpan={6} className="text-center py-4 text-gray-500 dark:text-gray-400">
                  Loading...
                </TableCell>
              </TableRow>
            ) : displayedTickets.length === 0 ? (
              <TableRow>
                {/* @ts-ignore */}
                <TableCell colSpan={6} className="text-center py-4 text-gray-500 dark:text-gray-400">
                  No tickets found
                </TableCell>
              </TableRow>
            ) : (
              displayedTickets.map((ticket) => (
                <TableRow key={ticket._id}>
                  <TableCell className="py-3 text-left">
                    {formatId(ticket._id)}
                  </TableCell>
                  <TableCell className="py-3 text-left font-medium text-gray-800 dark:text-white/90">
                    {ticket.subject}
                  </TableCell>
                  <TableCell className="py-3 text-left">
                    <Badge size="sm" color={statusColor(ticket.status || "PENDING")}>
                      {ticket.status || "PENDING"}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3 text-left">
                    <span
                      className="text-brand-500 hover:underline cursor-pointer"
                      onClick={() => ticket.orderId?._id && navigate(`/orders/${ticket.orderId._id}`)}
                    >
                      {formatId(ticket.orderId?._id)}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 text-left">
                    {ticket.user?.name || ticket.user?.email || "Unknown"}
                  </TableCell>
                  <TableCell className="py-3 text-left">
                    <Button
                      size="sm"
                      className="px-4 py-2"
                      onClick={() => setExpandedTicket(expandedTicket === ticket._id ? null : ticket._id)}
                    >
                      {expandedTicket === ticket._id ? "Hide Details" : "View Details"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Expanded Ticket Details */}
        {expandedTicket && (
          <div className="mt-4 border p-4 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
            {tickets
              .filter((t) => t._id === expandedTicket)
              .map((ticket) => (
                <div key={ticket._id}>
                  <h3 className="font-semibold mb-2 text-gray-800 dark:text-white/90">
                    Ticket Details (ID: {formatId(ticket._id)})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">
                        <b className="text-gray-800 dark:text-white/80">User:</b> {ticket.user?.name} ({ticket.user?.email}) - {ticket.user?.mobile}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        <b className="text-gray-800 dark:text-white/80">Subject:</b> {ticket.subject}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400 mt-2">
                        <b className="text-gray-800 dark:text-white/80">Description:</b><br />
                        <span className="whitespace-pre-wrap">{ticket.description}</span>
                      </p>
                      {ticket.images && ticket.images.length > 0 && (
                        <div className="mt-2">
                          <b className="text-gray-800 dark:text-white/80">Images:</b>
                          <div className="flex gap-2 mt-1 flex-wrap">
                            {ticket.images.map((img: string, idx: number) => (
                              <img key={idx} src={img} alt={"ticket"} className="w-24 h-24 object-cover rounded-md border" />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">
                        <b className="text-gray-800 dark:text-white/80">Order Amount:</b> ${ticket.orderId?.totalAmount}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        <b className="text-gray-800 dark:text-white/80">Order Status:</b> {ticket.orderId?.status}
                      </p>
                      {ticket.productId && (
                        <p className="text-gray-600 dark:text-gray-400">
                          <b className="text-gray-800 dark:text-white/80">Product ID:</b> {ticket.productId}
                        </p>
                      )}
                      <p className="text-gray-600 dark:text-gray-400 mt-4">
                        <b className="text-gray-800 dark:text-white/80">Update Status:</b>
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {["PENDING", "REVIEWED", "APPROVED", "REJECTED", "RESOLVED"].map(st => (
                          <button
                            key={st}
                            onClick={() => handleStatusUpdate(ticket._id, st)}
                            className={`px-3 py-1 text-sm rounded transition-opacity ${ticket.status === st ? 'bg-brand-500 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'} hover:opacity-80`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
