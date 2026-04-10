import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/api";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";

const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL"];

// ✅ Custom dropdown with delete buttons
function DeletableSelect({
  options,
  value,
  onChange,
  onDelete,
  placeholder = "Select...",
}: {
  options: { label: string; value: string }[];
  value: string;
  onChange: (val: string) => void;
  onDelete: (val: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        style={{
          width: "100%",
          padding: "8px 12px",
          border: "1px solid #d1d5db",
          borderRadius: "6px",
          background: "white",
          textAlign: "left",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "14px",
          color: selected ? "#111827" : "#9ca3af",
        }}
      >
        {selected ? selected.label : placeholder}
        <span style={{ fontSize: "10px", color: "#6b7280" }}>▼</span>
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "6px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            zIndex: 50,
            maxHeight: "200px",
            overflowY: "auto",
          }}
        >
          {options.length === 0 && (
            <div
              style={{ padding: "10px 12px", fontSize: "13px", color: "#9ca3af" }}
            >
              No options
            </div>
          )}
          {options.map((opt) => (
            <div
              key={opt.value}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 12px",
                background: opt.value === value ? "#f3f4f6" : "transparent",
                cursor: "pointer",
                fontSize: "14px",
              }}
              onMouseEnter={(e) =>
              ((e.currentTarget as HTMLDivElement).style.background =
                opt.value === value ? "#f3f4f6" : "#f9fafb")
              }
              onMouseLeave={(e) =>
              ((e.currentTarget as HTMLDivElement).style.background =
                opt.value === value ? "#f3f4f6" : "transparent")
              }
            >
              <span
                style={{ flex: 1 }}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
              >
                {opt.label}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(opt.value);
                }}
                title={`Delete "${opt.label}"`}
                style={{
                  marginLeft: "8px",
                  padding: "2px 6px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#ef4444",
                  fontSize: "13px",
                  borderRadius: "4px",
                  lineHeight: 1,
                  display: "flex",
                  alignItems: "center",
                }}
                onMouseEnter={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.background =
                  "#fee2e2")
                }
                onMouseLeave={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.background =
                  "transparent")
                }
              >
                🗑
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AddEditProductScreen() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [newCollection, setNewCollection] = useState("");

  const [form, setForm] = useState({
    name: "",
    category: "",
    collectionName: "",
    price: "",
    discountPrice: "",
    description: "",
    fabric: "",
    sizes: [] as string[],
    colors: [] as string[],
    images: [] as File[],
    imageUrls: [] as string[],
    stockStatus: "in-stock",
    status: "Pending",
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: false,
    isTrending: false
  });

  // ✅ Fetch categories & collections
  const fetchCategories = async () => {
    const { data } = await api.get("/categories");
    setCategories(data);
  };

  const fetchCollections = async () => {
    const { data } = await api.get("/collections");
    setCollections(data);
  };

  useEffect(() => {
    fetchCategories();
    fetchCollections();
  }, []);

  // ✅ Fetch product (Edit mode)
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api
      .get(`/admin/products/${id}`)
      .then(({ data }) => {
        setForm({
          name: data.name,
          category: data.category,
          collectionName: data.collectionName,
          price: data.price,
          discountPrice: data.discountPrice || "",
          description: data.description || "",
          fabric: data.fabric || "",
          sizes: data.sizes || [],
          colors: data.colors || [],
          images: [],
          imageUrls: data.images || [],
          stockStatus: data.stockStatus,
          status: data.status || "Pending",
          isFeatured: data.isFeatured || false,
          isNewArrival: data.isNewArrival || false,
          isBestSeller: data.isBestSeller || false,
          isTrending: data.isTrending || false
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  // ✅ Add Category
  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    await api.post("/categories", { name: newCategory });
    const addedName = newCategory;
    setNewCategory("");
    await fetchCategories();
    setForm((prev) => ({ ...prev, category: addedName }));
  };

  // ✅ Delete Category
  const handleDeleteCategory = async (name: string) => {
    const cat = categories.find((c) => c.name === name);
    if (!cat) return;
    if (!window.confirm(`Delete category "${name}"?`)) return;
    await api.delete(`/categories/${cat._id}`);
    await fetchCategories();
    if (form.category === name) setForm((prev) => ({ ...prev, category: "" }));
  };

  // ✅ Add Collection
  const handleAddCollection = async () => {
    if (!newCollection.trim()) return;
    await api.post("/collections", { name: newCollection });
    const addedName = newCollection;
    setNewCollection("");
    await fetchCollections();
    setForm((prev) => ({ ...prev, collectionName: addedName }));
  };

  // ✅ Delete Collection
  const handleDeleteCollection = async (name: string) => {
    const col = collections.find((c) => c.name === name);
    if (!col) return;
    if (!window.confirm(`Delete collection "${name}"?`)) return;
    await api.delete(`/collections/${col._id}`);
    await fetchCollections();
    if (form.collectionName === name)
      setForm((prev) => ({ ...prev, collectionName: "" }));
  };

  // ✅ Image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setForm((prev) => ({
      ...prev,
      images: [...prev.images, ...Array.from(e.target.files!)],
    }));
  };

  // ✅ Save Product
  const handleSave = async () => {
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === "images") {
          (value as File[]).forEach((file) => formData.append("images", file));
        } else if (key === "imageUrls") {
          (value as string[]).forEach((url) =>
            formData.append("existingImages[]", url)
          );
        } else if (Array.isArray(value)) {
          (value as string[]).forEach((v) => formData.append(key + "[]", v));
        } else {
          formData.append(key, value as any);
        }
      });

      const method = id ? "put" : "post";
      const url = id ? `/admin/products/${id}` : "/admin/products";

      await api[method](url, formData);
      navigate("/products");
    } catch (err) {
      console.error(err);
    }
  };

  const categoryOptions = categories.map((c) => ({
    label: c.name,
    value: c.name,
  }));

  const collectionOptions = collections.map((c) => ({
    label: c.name,
    value: c.name,
  }));

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">
        {id ? "Edit Product" : "Add Product"}
      </h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-5">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Product Name
            </label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <DeletableSelect
              options={categoryOptions}
              value={form.category}
              onChange={(val) => setForm({ ...form, category: val })}
              onDelete={handleDeleteCategory}
              placeholder="Select category..."
            />
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Add new category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
              <Button onClick={handleAddCategory}>Add</Button>
            </div>
          </div>

          {/* Collection */}
          <div>
            <label className="block text-sm font-medium mb-1">Collection</label>
            <DeletableSelect
              options={collectionOptions}
              value={form.collectionName}
              onChange={(val) => setForm({ ...form, collectionName: val })}
              onDelete={handleDeleteCollection}
              placeholder="Select collection..."
            />
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Add new collection"
                value={newCollection}
                onChange={(e) => setNewCollection(e.target.value)}
              />
              <Button onClick={handleAddCollection}>Add</Button>
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium mb-1">Price</label>
            <Input
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>

          {/* Discount Price */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Discount Price
            </label>
            <Input
              type="number"
              value={form.discountPrice}
              onChange={(e) =>
                setForm({ ...form, discountPrice: e.target.value })
              }
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <Input
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>

          {/* Fabric */}
          <div>
            <label className="block text-sm font-medium mb-1">Fabric</label>
            <Input
              value={form.fabric}
              onChange={(e) => setForm({ ...form, fabric: e.target.value })}
            />
          </div>

          {/* Sizes */}
          <div>
            <label className="block text-sm font-medium mb-1">Sizes</label>
            <DeletableSelect
              options={sizeOptions.map((s) => ({ label: s, value: s }))}
              value=""
              onChange={(val) => {
                if (!form.sizes.includes(val)) {
                  setForm({ ...form, sizes: [...form.sizes, val] });
                }
              }}
              onDelete={() => { }} // sizes are static, no delete needed
              placeholder="Pick a size to add..."
            />
            <div className="flex gap-2 mt-2 flex-wrap">
              {form.sizes.map((size) => (
                <span
                  key={size}
                  className="px-3 py-1 bg-gray-200 rounded-full text-sm flex items-center gap-2"
                >
                  {size}
                  <button
                    onClick={() =>
                      setForm({
                        ...form,
                        sizes: form.sizes.filter((s) => s !== size),
                      })
                    }
                    className="text-red-500 text-xs"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Colors (comma separated)
            </label>
            <Input
              value={form.colors.join(", ")}
              onChange={(e) =>
                setForm({
                  ...form,
                  colors: e.target.value.split(",").map((c) => c.trim()),
                })
              }
            />
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium mb-2">Images</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="imageUpload"
              />
              <label htmlFor="imageUpload" className="cursor-pointer">
                <p className="text-gray-500">Click to upload images</p>
                <p className="text-xs text-gray-400">(Multiple allowed)</p>
              </label>
            </div>
            <div className="flex flex-wrap gap-3 mt-4">
              {form.imageUrls.map((url) => (
                <div key={url} className="relative w-24 h-24">
                  <img
                    src={url}
                    alt="product"
                    className="w-full h-full object-cover rounded-md border"
                  />
                  <button
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        imageUrls: prev.imageUrls.filter((img) => img !== url),
                      }))
                    }
                    className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}
              {form.images.map((file) => (
                <div key={file.name} className="relative w-24 h-24">
                  <img
                    src={URL.createObjectURL(file)}
                    alt="preview"
                    className="w-full h-full object-cover rounded-md border"
                  />
                  <button
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        images: prev.images.filter((img) => img !== file),
                      }))
                    }
                    className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="flex gap-4">
            <label>
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) =>
                  setForm({ ...form, isFeatured: e.target.checked })
                }
              />{" "}
              Featured
            </label>
            <label>
              <input
                type="checkbox"
                checked={form.isNewArrival}
                onChange={(e) =>
                  setForm({ ...form, isNewArrival: e.target.checked })
                }
              />{" "}
              New Arrival
            </label>
            <label>
              <input
                type="checkbox"
                checked={form.isBestSeller}
                onChange={(e) =>
                  setForm({ ...form, isBestSeller: e.target.checked })
                }
              />{" "}
              BestSeller
            </label> <label>
              <input
                type="checkbox"
                checked={form.isTrending}
                onChange={(e) =>
                  setForm({ ...form, isTrending: e.target.checked })
                }
              />{" "}
              Trending
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-6">
            <Button onClick={() => navigate("/products")}>Cancel</Button>
            <Button onClick={handleSave}>
              {id ? "Update" : "Add Product"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}