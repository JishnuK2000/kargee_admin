import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Button from "../../components/ui/button/Button";
import api from "../../api/api";

interface User {
  _id: string;
  name: string;
  mobile: string;
  createdAt?: string;
}

export default function UsersScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/users/get-users");
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Filter + Sort
  const displayedUsers = users
    .filter(
      (user) =>
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.mobile.includes(search)
    )
    .sort((a, b) => {
      if (!sortField) return 0;

      const valA: any =
        sortField === "name"
          ? a.name
          : sortField === "mobile"
          ? a.mobile
          : a.createdAt;

      const valB: any =
        sortField === "name"
          ? b.name
          : sortField === "mobile"
          ? b.mobile
          : b.createdAt;

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Users</h2>

      {/* Search */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Search by name or mobile"
          className="border p-2 rounded-lg w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white p-4">
        <Table>
          <TableHeader className="border-y border-gray-100">
            <TableRow>
              <TableCell
                isHeader
                className="text-left cursor-pointer"
                onClick={() => handleSort("name")}
              >
                Name
              </TableCell>

              <TableCell
                isHeader
                className="text-left cursor-pointer"
                onClick={() => handleSort("mobile")}
              >
                Mobile
              </TableCell>

              <TableCell
                isHeader
                className="text-left cursor-pointer"
                onClick={() => handleSort("createdAt")}
              >
                Joined
              </TableCell>

              <TableCell isHeader className="text-left">
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100">
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  Loading...
                </TableCell>
              </TableRow>
            ) : displayedUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              displayedUsers.map((user) => (
                <TableRow key={user._id}>
                  <TableCell className="py-3">{user.name}</TableCell>
                  <TableCell className="py-3">{user.mobile}</TableCell>
                  <TableCell className="py-3">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  <TableCell className="py-3">
                    <Button size="xs" className="px-4 py-2">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}