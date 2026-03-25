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

export default function OrderScreen() {
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [activeStatus, setActiveStatus] = useState<string>("ALL"); // NEW
  const navigate = useNavigate();
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const formatOrderId = (_id: string) => _id.slice(-5).toUpperCase();

  const statusColor = (status: string) => {
    switch (status) {
      case "PLACED":
        return "primary";
      case "PROCESSING":
        return "warning";
      case "SHIPPED":
        return "info";
      case "DELIVERED":
        return "success";
      default:
        return "default";
    }
  };

  // Sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Filter and sort orders
  const displayedOrders = orders
    .filter((order) =>
      activeStatus === "ALL" ? true : order.status === activeStatus,
    )
    .filter((order) => formatOrderId(order._id).includes(search.toUpperCase()))
    .sort((a, b) => {
      if (!sortField) return 0;
      const valA: any =
        sortField === "total"
          ? a.totalAmount
          : sortField === "status"
            ? a.status
            : a.products.length;
      const valB: any =
        sortField === "total"
          ? b.totalAmount
          : sortField === "status"
            ? b.status
            : b.products.length;
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  const statusTabs = ["ALL", "PLACED", "PROCESSING", "SHIPPED", "DELIVERED"];

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
        Orders
      </h2>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {statusTabs.map((status) => (
          <button
            key={status}
            className={`px-4 py-2 rounded-lg font-semibold ${
              activeStatus === status
                ? "bg-[#5e2a14] text-white"
                : "bg-gray-200 dark:bg-gray-700 dark:text-gray-200"
            }`}
            onClick={() => setActiveStatus(status)}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Search (optional) */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Search Order ID"
          className="border p-2 rounded-lg w-64"
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
                onClick={() => handleSort("id")}
              >
                Order ID
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
                onClick={() => handleSort("total")}
              >
                Total Amount
              </TableCell>
              <TableCell
                isHeader
                className="text-left cursor-pointer"
                onClick={() => handleSort("items")}
              >
                Items
              </TableCell>
              <TableCell isHeader className="text-left">
                Payment Method
              </TableCell>
              <TableCell isHeader className="text-left">
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  Loading...
                </TableCell>
              </TableRow>
            ) : displayedOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No orders found
                </TableCell>
              </TableRow>
            ) : (
              displayedOrders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell className="py-3 text-left">
                    {formatOrderId(order._id)}
                  </TableCell>
                  <TableCell className="py-3 text-left">
                    <Badge size="sm" color={statusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3 text-left">
                    ${order.totalAmount}
                  </TableCell>
                  <TableCell className="py-3 text-left">
                    {order.products.length}
                  </TableCell>
                  <TableCell className="py-3 text-left">
                    {order.paymentMethod}
                  </TableCell>
                  <TableCell className="py-3 text-left">
                    <Button
                      size="xs"
                      className="px-4 py-2"
                      onClick={() => navigate(`/orders/${order._id}`)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Expanded Order Details */}
        {expandedOrder && (
          <div className="mt-4 border p-4 rounded-lg bg-gray-50">
            {orders
              .filter((o) => o._id === expandedOrder)
              .map((order) => (
                <div key={order._id}>
                  <h3 className="font-semibold mb-2">Order Details</h3>
                  <p>
                    <b>Name:</b> {order.address.name}
                  </p>
                  <p>
                    <b>Phone:</b> {order.address.phone}
                  </p>
                  <p>
                    <b>Address:</b> {order.address.address},{" "}
                    {order.address.city}, {order.address.state} -{" "}
                    {order.address.pincode}
                  </p>
                  <p>
                    <b>Payment:</b> {order.paymentMethod}
                  </p>
                  <p className="mt-2 font-semibold">Products:</p>
                  <ul className="list-disc pl-5">
                    {order.products.map((p) => (
                      <li key={p.productId}>
                        {p.name} - Qty: {p.quantity} - ₹{p.price}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
