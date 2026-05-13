// import { useEffect, useState } from "react";
// import {
//   Plus,
//   Pencil,
//   Trash2,
//   Search,
//   X,
//   CheckCircle,
//   AlertCircle,
//   UtensilsCrossed,
//   Image as ImageIcon,
//   IndianRupee,
//   Tag,
// } from "lucide-react";

// import axiosInstance from "../../api/axiosInstance";

// const REST_API = "/Restaurant";
// const MENU_API = "/MenuItem";
// const CATEGORY_API = "/Category";

// const RestaurantMenu = () => {
//   const [menuItems, setMenuItems] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filterCategory, setFilterCategory] = useState("All");
//   const [filterAvailability, setFilterAvailability] = useState("All");
//   const [modal, setModal] = useState(null);
//   const [form, setForm] = useState({
//     menuItemID: null,
//     menuItemName: "",
//     menuItemPrice: "",
//     menuItemDescription: "",
//     categoryID: "",
//     isAvailable: true,
//     menuItemImage: "",
//   });


//   const [restaurant, setRestaurant] = useState(null);
//   const restaurantId = localStorage.getItem("restaurantId");

//   useEffect(() => {
//     if (restaurantId) {
//       loadData();
//     }
//   }, [restaurantId]);

//   const loadData = async () => {
//     try {
//       if (!restaurantId) {
//         setLoading(false);
//         return;
//       }

//       // Load restaurant by restaurantID from localStorage
//       const restRes = await axiosInstance.get(REST_API);
//       const restaurants = restRes.data;
      
//       // Find restaurant by restaurantID (stored from selection)
//       const currentRestaurant = restaurants.find(
//         (r) => r.restaurantID === parseInt(restaurantId)
//       );
      
//       if (!currentRestaurant) {
//         console.error("Restaurant not found");
//         setLoading(false);
//         return;
//       }
      
//       setRestaurant(currentRestaurant);

//       // Load menu items for this restaurant (management view needs both available & unavailable)
//       let menuData = [];
//       let restaurantItems = [];
//       let fallbackItems = [];
//       let allMenuData = [];
//       let matchingItems = [];
//       let missingItems = [];

//       // helper to safely coerce IDs
//       const normalizeId = (v) => {
//         const n = Number(v);
//         return Number.isFinite(n) ? n : null;
//       };

//       const getMenuItemKey = (it) => it.menuItemID ?? it.menuItemId ?? it.id ?? null;

//       const matchesRestaurant = (mi, rest) => {
//         // check a variety of possible properties and nested objects
//         const candidateIds = [
//           mi.restaurantID,
//           mi.restaurantId,
//           mi.RestaurantID,
//           mi.restaurant?.restaurantID,
//           mi.restaurant?.restaurantId,
//           mi.restaurant?.RestaurantID,
//         ];
//         for (const cid of candidateIds) {
//           if (cid !== undefined && cid !== null && normalizeId(cid) === normalizeId(rest.restaurantID)) return true;
//         }

//         const nameA = (mi.restaurantName || mi.restaurant?.name || "").toString().trim().toLowerCase();
//         const nameB = (rest.name || "").toString().trim().toLowerCase();
//         if (nameA && nameB && (nameA === nameB || nameA.includes(nameB) || nameB.includes(nameA))) return true;

//         return false;
//       };

//       try {
//         // primary: restaurant-specific endpoint with includeUnavailable (if supported)
//         const menuRes = await axiosInstance.get(`${MENU_API}/restaurant/${currentRestaurant.restaurantID}?includeUnavailable=true`);
//         restaurantItems = Array.isArray(menuRes.data) ? menuRes.data : [];
//         menuData = restaurantItems;

//         // fallback: restaurant endpoint without query param
//         if (menuData.length === 0) {
//           const fallbackRes = await axiosInstance.get(`${MENU_API}/restaurant/${currentRestaurant.restaurantID}`);
//           fallbackItems = Array.isArray(fallbackRes.data) ? fallbackRes.data : [];
//           menuData = fallbackItems;
//         }
//       } catch (err) {
//         // ignore; we'll attempt to recover using the global list below
//         menuData = [];
//       }

//       // Merge any missing items from global /MenuItem using robust matching (many backends return different shapes)
//       try {
//         const allMenuRes = await axiosInstance.get(MENU_API);
//         allMenuData = Array.isArray(allMenuRes.data) ? allMenuRes.data : [];

//         const existingKeys = new Set(menuData.map(getMenuItemKey).filter(Boolean));
//         matchingItems = allMenuData.filter((m) => matchesRestaurant(m, currentRestaurant));

//         missingItems = matchingItems.filter(m => !existingKeys.has(getMenuItemKey(m)));
//         if (missingItems.length > 0) {
//           console.debug(`[Menu] Merging ${missingItems.length} missing items for restaurant ${currentRestaurant.restaurantID}`);
//           menuData = [...menuData, ...missingItems];
//         }

//         // final safety: if we still have nothing, try a name-only match as last resort
//         if (menuData.length === 0) {
//           menuData = allMenuData.filter((m) => (m.restaurantName || m.restaurant?.name || "").toString().toLowerCase() === (currentRestaurant.name || "").toString().toLowerCase());
//         }
//       } catch (e) {
//         // give up merge if global fetch fails
//         console.debug("[Menu] global /MenuItem fetch failed during merge", e);
//       }

//       // Deduplicate by menu item key and sort by name for stable UI
//       const keyed = new Map();
//       menuData.forEach((mi) => {
//         const k = getMenuItemKey(mi) ?? `${(mi.menuItemName || mi.name || "")}_${mi.menuItemPrice ?? mi.price ?? ""}`;
//         if (!keyed.has(k)) keyed.set(k, mi);
//       });
//       menuData = Array.from(keyed.values()).sort((a, b) => (a.menuItemName || a.name || "").localeCompare(b.menuItemName || b.name || ""));

//       // set debug payload so we can inspect what came from each fetch (useful when backend shapes vary)
//       try {
//         setDebugData({
//           restaurantId: currentRestaurant.restaurantID,
//           restaurantName: currentRestaurant.name,
//           restaurantItems: restaurantItems.map((m) => ({ id: getMenuItemKey(m), name: m.menuItemName || m.name, available: m.isAvailable })),
//           fallbackItems: fallbackItems.map((m) => ({ id: getMenuItemKey(m), name: m.menuItemName || m.name, available: m.isAvailable })),
//           globalCount: allMenuData.length,
//           matchingCount: matchingItems.length,
//           missingItems: missingItems.map((m) => ({ id: getMenuItemKey(m), name: m.menuItemName || m.name, available: m.isAvailable })),
//           final: menuData.map((m) => ({ id: getMenuItemKey(m), name: m.menuItemName || m.name, available: m.isAvailable })),
//         });
//       } catch {}

//       setMenuItems(menuData);

//       // Load categories
//       try {
//         const catRes = await axiosInstance.get(CATEGORY_API);
//         const catData = catRes.data;
//         setCategories(catData);
//       } catch {
//         // Categories might not be available
//         setCategories([]);
//       }
//     } catch (error) {
//       console.error("Error loading data:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAdd = () => {
//     setForm({
//       menuItemID: null,
//       menuItemName: "",
//       menuItemPrice: "",
//       menuItemDescription: "",
//       categoryID: categories.length > 0 ? String(categories[0].categoryID) : "",
//       isAvailable: true,
//       menuItemImage: "",
//     });
//     setModal("add");
//   };

//   const handleEdit = (item) => {
//     // MenuItemReadDto has CategoryName but not categoryID
//     // We need to find the categoryID from the categoryName
//     let foundCategoryID = "";
//     if (item.categoryName && categories.length > 0) {
//       const category = categories.find(cat => cat.categoryName === item.categoryName);
//       if (category) {
//         foundCategoryID = String(category.categoryID);
//       }
//     }
    
//     setForm({
//       menuItemID: item.menuItemID,
//       menuItemName: item.menuItemName || "",
//       menuItemPrice: item.menuItemPrice || "",
//       menuItemDescription: item.menuItemDescription || "",
//       categoryID: foundCategoryID || (item.categoryID ? String(item.categoryID) : ""),
//       isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
//       menuItemImage: item.imageUrl || item.menuItemImage || "",
//     });
//     setModal("edit");
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm("Are you sure you want to delete this menu item?")) return;

//     try {
//       const res = await axiosInstance.delete(`${MENU_API}/${id}`);
//       if (res.status === 200 || res.status === 204) {
//         // Remove from local state immediately for better UX
//         setMenuItems(prev => prev.filter(item => item.menuItemID !== id));
//       }
//       // Reload to ensure consistency
//       await loadData();
//     } catch (error) {
//       console.error("Delete error:", error);
//       const errorMessage = error.response?.data?.message || error.message || "Unknown error";
//       alert("Failed to delete item: " + errorMessage);
//       await loadData(); // Reload to refresh state
//     }
//   };

//   const handleToggleAvailability = async (item) => {
//     // Optimistically update UI and counts without reloading the whole list.
//     // If backend call fails we'll revert and reload.
//     const originalStatus = item.isAvailable;
//     const newStatus = !originalStatus;

//     // Update local state immediately for instant UI feedback
//     setMenuItems(prev =>
//       prev.map(i =>
//         i.menuItemID === item.menuItemID ? { ...i, isAvailable: newStatus } : i
//       )
//     );

//     try {
//       const res = await axiosInstance.patch(
//         `${MENU_API}/${item.menuItemID}/availability?isAvailable=${newStatus}`
//       );

//       if (res.status !== 200) {
//         throw new Error("Failed to update availability");
//       }

//       // success — keep optimistic update (no full reload)
//     } catch (error) {
//       console.error("Toggle availability error:", error);
//       const errorMessage = error.response?.data?.message || error.message || "Unknown error";
//       alert("Failed to update availability: " + errorMessage);

//       // revert optimistic change and reload to ensure consistency
//       setMenuItems(prev =>
//         prev.map(i =>
//           i.menuItemID === item.menuItemID ? { ...i, isAvailable: originalStatus } : i
//         )
//       );
//       await loadData();
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!restaurant) {
//       alert("Restaurant not found. Please refresh the page.");
//       return;
//     }

//     // Validate required fields
//     if (!form.menuItemName || !form.menuItemPrice) {
//       alert("Please fill in all required fields (Name and Price)");
//       return;
//     }

//     const price = parseFloat(form.menuItemPrice);
//     if (isNaN(price) || price <= 0) {
//       alert("Please enter a valid price");
//       return;
//     }

//     try {
//       const method = modal === "edit" ? "put" : "post";
//       // POST endpoint: /api/MenuItem  (backend reads RestaurantID from JWT claims)
//       // PUT endpoint: /api/MenuItem/{menuItemId}
//       const url = modal === "edit"
//         ? `${MENU_API}/${form.menuItemID}`
//         : `${MENU_API}`;

//       // Ensure category is selected when categories exist
//       if (categories.length > 0 && (!form.categoryID || form.categoryID === "")) {
//         alert("Please select a category.");
//         return;
//       }

//       // MenuItemCreateDto structure: MenuItemName, MenuItemPrice, CategoryID, ImageUrl
//       const payload = {
//         MenuItemName: form.menuItemName.trim(),
//         MenuItemPrice: price,
//         CategoryID: form.categoryID && form.categoryID !== "" ? parseInt(form.categoryID, 10) : null,
//         ImageUrl: form.menuItemImage && form.menuItemImage.trim() !== ""
//           ? form.menuItemImage.trim()
//           : `https://source.unsplash.com/800x600/?food,${encodeURIComponent(form.menuItemName)}`,
//       };

//       // For edit, use MenuItemCreateDto (same structure)
//       // The API doesn't update IsAvailable in UpdateMenuItem, only in ChangeAvailability endpoint

//       console.log("Submitting menu item:", payload);
//       console.log("URL:", url, "Method:", method);
//       console.log("Token:", localStorage.getItem("token")?.substring(0, 50) + "...");

//       const res = await axiosInstance[method](url, payload);

//       console.log("Response status:", res.status);
//       console.log("Response data:", res.data);

//       if (res.status === 200 || res.status === 201) {
//         console.log("Menu item saved successfully");
//       } else {
//         console.warn("Unexpected response while saving menu item:", res);
//       }
 
//       // Close modal and reset form
//       setModal(null);
//       setForm({
//         menuItemID: null,
//         menuItemName: "",
//         menuItemPrice: "",
//         menuItemDescription: "",
//         categoryID: "",
//         isAvailable: true,
//         menuItemImage: "",
//       });

//       // Reload data
//       await loadData();
//     } catch (error) {
//       console.error("Error saving menu item:", error);
//       console.error("Error response status:", error.response?.status);
//       console.error("Error response data:", error.response?.data);
//       const errorMessage = error.response?.data?.message || error.response?.data?.title || error.response?.data || error.message || "Unknown error";
//       alert("Failed to save menu item:\n" + JSON.stringify(errorMessage, null, 2));
//     }
//   };

//   const filteredItems = menuItems.filter((item) => {
//     const matchesSearch =
//       item.menuItemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       item.menuItemDescription?.toLowerCase().includes(searchTerm.toLowerCase());

//     const matchesCategory =
//       filterCategory === "All" ||
//       item.categoryID?.toString() === filterCategory ||
//       item.categoryName === categories.find(c => c.categoryID?.toString() === filterCategory)?.categoryName;


//     const matchesAvailability =
//       filterAvailability === "All" ||
//       (filterAvailability === "Available" && item.isAvailable) ||
//       (filterAvailability === "Unavailable" && !item.isAvailable);

//     return matchesSearch && matchesCategory && matchesAvailability;
//   });

//   const getFoodImage = (item) => {
//     if (item.menuItemImage) return item.menuItemImage;
//     if (item.imageUrl) return item.imageUrl;
//     return `https://source.unsplash.com/800x600/?food,${encodeURIComponent(item.menuItemName || "food")}`;
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <div className="text-center">
//           <div className="inline-block w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
//           <p className="text-gray-600 font-semibold">Loading menu...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-black text-gray-900 mb-2">
//             Menu Management
//           </h1>
//           <p className="text-gray-600">
//             Manage your restaurant menu items and availability
//           </p>
//         </div>
//         <div className="flex items-center gap-3">
//           <button
//             onClick={handleAdd}
//             className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition"
//           >
//             <Plus size={20} />
//             Add Item
//           </button>
//         </div>
//       </div>

//       {/* Stats */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <div className="bg-white rounded-xl shadow p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-gray-600 text-sm font-semibold mb-1">
//                 Total Items
//               </p>
//               <p className="text-3xl font-black text-gray-900">
//                 {menuItems.length}
//               </p>
//             </div>
//             <UtensilsCrossed className="text-orange-500" size={32} />
//           </div>
//         </div>

//         <div className="bg-white rounded-xl shadow p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-gray-600 text-sm font-semibold mb-1">
//                 Available
//               </p>
//               <p className="text-3xl font-black text-green-600">
//                 {menuItems.filter((i) => i.isAvailable).length}
//               </p>
//             </div>
//             <CheckCircle className="text-green-500" size={32} />
//           </div>
//         </div>

//         <div className="bg-white rounded-xl shadow p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-gray-600 text-sm font-semibold mb-1">
//                 Unavailable
//               </p>
//               <p className="text-3xl font-black text-red-600">
//                 {menuItems.filter((i) => !i.isAvailable).length}
//               </p>
//             </div>
//             <AlertCircle className="text-red-500" size={32} />
//           </div>
//         </div>
//       </div>

//       {/* Filters */}
//       <div className="bg-white rounded-xl shadow p-6">
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div className="relative">
//             <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//             <input
//               type="text"
//               placeholder="Search menu items..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
//             />
//           </div>

//           <select
//             value={filterCategory}
//             onChange={(e) => setFilterCategory(e.target.value)}
//             className="px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
//           >
//             <option value="All">All Categories</option>
//             {categories.map((cat) => (
//               <option key={cat.categoryID} value={cat.categoryID}>
//                 {cat.categoryName}
//               </option>
//             ))}
//           </select>

//           <select
//             value={filterAvailability}
//             onChange={(e) => setFilterAvailability(e.target.value)}
//             className="px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
//           >
//             <option value="All">All Items</option>
//             <option value="Available">Available</option>
//             <option value="Unavailable">Unavailable</option>
//           </select>
//         </div>
//       </div>

      

//       {/* Menu Items Grid */}
//       {filteredItems.length === 0 ? (
//         <div className="bg-white rounded-xl shadow p-16 text-center">
//           <UtensilsCrossed size={64} className="mx-auto text-gray-300 mb-4" />
//           <p className="text-gray-500 font-semibold text-lg">
//             No menu items found
//           </p>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//           {filteredItems.map((item) => (
//             <div
//               key={item.menuItemID}
//               className={`bg-white rounded-2xl shadow-lg overflow-hidden transition transform hover:scale-[1.02] ${
//                 !item.isAvailable ? "opacity-75" : ""
//               }`}
//             >
//               {/* Image */}
//               <div className="relative h-48">
//                 <img
//                   src={getFoodImage(item)}
//                   alt={item.menuItemName}
//                   className={`w-full h-full object-cover ${
//                     !item.isAvailable ? "grayscale" : ""
//                   }`}
//                 />
//                 {!item.isAvailable && (
//                   <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
//                     <div className="text-center">
//                       <AlertCircle className="mx-auto text-white mb-2" size={32} />
//                       <p className="text-white font-black">Out of Stock</p>
//                     </div>
//                   </div>
//                 )}
//                 <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full">
//                   <span className="flex items-center gap-1 font-black text-gray-900">
//                     <IndianRupee size={14} />
//                     {item.menuItemPrice}
//                   </span>
//                 </div>
//               </div>

//               {/* Content */}
//               <div className="p-5">
//                 <h3 className="text-xl font-black text-gray-900 mb-2 truncate">
//                   {item.menuItemName}
//                 </h3>
//                 {item.categoryName && (
//                   <div className="flex items-center gap-2 mb-3">
//                     <Tag className="text-orange-500" size={16} />
//                     <span className="text-sm text-gray-600 font-semibold">
//                       {item.categoryName}
//                     </span>
//                   </div>
//                 )}

//                 {/* Actions */}
//                 <div className="flex gap-2 mt-4">
//                   <button
//                     onClick={() => handleToggleAvailability(item)}
//                     className={`flex-1 px-4 py-2 rounded-xl font-semibold text-sm transition ${
//                       item.isAvailable
//                         ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
//                         : "bg-green-100 text-green-700 hover:bg-green-200"
//                     }`}
//                   >
//                     {item.isAvailable ? "Mark Unavailable" : "Mark Available"}
//                   </button>
//                   <button
//                     onClick={() => handleEdit(item)}
//                     className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl font-semibold hover:bg-blue-200 transition"
//                   >
//                     <Pencil size={16} />
//                   </button>
//                   <button
//                     onClick={() => handleDelete(item.menuItemID)}
//                     className="px-4 py-2 bg-red-100 text-red-700 rounded-xl font-semibold hover:bg-red-200 transition"
//                   >
//                     <Trash2 size={16} />
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Add/Edit Modal */}
//       {modal && (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-2xl p-8 w-full max-w-md relative shadow-2xl max-h-[90vh] overflow-y-auto">
//             <button
//               onClick={() => setModal(null)}
//               className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 p-2 rounded-xl hover:bg-gray-100 transition"
//             >
//               <X size={24} />
//             </button>

//             <h2 className="text-2xl font-black text-gray-900 mb-6">
//               {modal === "add" ? "Add Menu Item" : "Edit Menu Item"}
//             </h2>

//             <form onSubmit={handleSubmit} className="space-y-4">
//               <div>
//                 <label className="block text-sm font-bold text-gray-700 mb-2">
//                   Item Name *
//                 </label>
//                 <input
//                   type="text"
//                   value={form.menuItemName}
//                   onChange={(e) =>
//                     setForm({ ...form, menuItemName: e.target.value })
//                   }
//                   required
//                   className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
//                   placeholder="e.g., Margherita Pizza"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-bold text-gray-700 mb-2">
//                   Price (₹) *
//                 </label>
//                 <input
//                   type="number"
//                   step="0.01"
//                   value={form.menuItemPrice}
//                   onChange={(e) =>
//                     setForm({ ...form, menuItemPrice: e.target.value })
//                   }
//                   required
//                   className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
//                   placeholder="299.00"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-bold text-gray-700 mb-2">
//                   Description
//                 </label>
//                 <textarea
//                   value={form.menuItemDescription}
//                   onChange={(e) =>
//                     setForm({ ...form, menuItemDescription: e.target.value })
//                   }
//                   rows={3}
//                   className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
//                   placeholder="Describe your dish..."
//                 />
//               </div>

//               {categories.length > 0 && (
//                 <div>
//                   <label className="block text-sm font-bold text-gray-700 mb-2">
//                     Category
//                   </label>
//                   <select
//                     value={form.categoryID}
//                     onChange={(e) =>
//                       setForm({ ...form, categoryID: e.target.value })
//                     }
//                     className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
//                   >
//                     <option value="">Select Category</option>
//                     {categories.map((cat) => (
//                       <option key={cat.categoryID} value={String(cat.categoryID)}>
//                         {cat.categoryName}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               )}

//               <div>
//                 <label className="block text-sm font-bold text-gray-700 mb-2">
//                   Image URL
//                 </label>
//                 <input
//                   type="url"
//                   value={form.menuItemImage}
//                   onChange={(e) =>
//                     setForm({ ...form, menuItemImage: e.target.value })
//                   }
//                   className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
//                   placeholder="https://example.com/image.jpg"
//                 />
//                 <p className="text-xs text-gray-500 mt-1">
//                   Leave empty to use a default food image
//                 </p>
//               </div>

//               <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
//                 <input
//                   type="checkbox"
//                   id="available"
//                   checked={form.isAvailable}
//                   onChange={(e) =>
//                     setForm({ ...form, isAvailable: e.target.checked })
//                   }
//                   className="w-5 h-5 cursor-pointer"
//                 />
//                 <label
//                   htmlFor="available"
//                   className="font-semibold cursor-pointer"
//                 >
//                   Available for orders
//                 </label>
//               </div>

//               <button
//                 type="submit"
//                 className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-4 rounded-xl font-black text-lg transition shadow-lg hover:shadow-xl"
//               >
//                 {modal === "add" ? "Add Item" : "Save Changes"}
//               </button>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default RestaurantMenu;


import { useEffect, useState } from "react";
import {
  Plus, Pencil, Trash2, Search, X, CheckCircle, AlertCircle,
  UtensilsCrossed, IndianRupee, Tag, ToggleLeft, ToggleRight,
  Filter, GridIcon, List, Sparkles, ChefHat, Clock,
  TrendingUp, Package, Eye, EyeOff, Loader2, ImageOff,
} from "lucide-react";
import axiosInstance from "../../api/axiosInstance";

const REST_API      = "/Restaurant";
const MENU_API      = "/MenuItem";
const CATEGORY_API  = "/Category";

/* ─── tiny helpers ─── */
const normalizeId = v => { const n = Number(v); return Number.isFinite(n) ? n : null; };
const getMenuItemKey = it => it?.menuItemID ?? it?.menuItemId ?? it?.id ?? null;
const getFoodImage = item => {
  if (item?.menuItemImage && item.menuItemImage.trim()) return item.menuItemImage;
  if (item?.imageUrl      && item.imageUrl.trim())      return item.imageUrl;
  return `https://source.unsplash.com/800x600/?food,${encodeURIComponent(item?.menuItemName || "food")}`;
};

/* ─── category colour palette ─── */
const CAT_COLORS = [
  "#fb923c","#f59e0b","#10b981","#3b82f6","#8b5cf6","#ec4899","#ef4444","#06b6d4",
];

/* ══════════════════════════════════════════════
   MODAL
══════════════════════════════════════════════ */
const MenuModal = ({ mode, form, setForm, categories, onClose, onSubmit, saving }) => (
  <div className="mn-overlay" onClick={onClose}>
    <div className="mn-dialog" onClick={e => e.stopPropagation()}>

      {/* header stripe */}
      <div className="mn-dialog-header">
        <div className="mn-dialog-header-icon">
          {mode === "add" ? <Plus size={20}/> : <Pencil size={20}/>}
        </div>
        <div>
          <h2 className="mn-dialog-title">{mode === "add" ? "Add Menu Item" : "Edit Menu Item"}</h2>
          <p className="mn-dialog-sub">{mode === "add" ? "Create a new dish for your menu" : "Update item details"}</p>
        </div>
        <button className="mn-dialog-close" onClick={onClose}><X size={18}/></button>
      </div>

      <form onSubmit={onSubmit} className="mn-dialog-body">

        {/* Image preview banner */}
        {form.menuItemImage && (
          <div className="mn-img-preview">
            <img src={form.menuItemImage} alt="preview"
              onError={e => e.target.style.display="none"}
              style={{width:"100%",height:"100%",objectFit:"cover"}}/>
            <div className="mn-img-preview-label">Image preview</div>
          </div>
        )}

        <div className="mn-field-grid">
          {/* Name */}
          <div className="mn-field mn-field-full">
            <label className="mn-label">Item Name <span className="mn-required">*</span></label>
            <input className="mn-input" placeholder="e.g. Butter Chicken" required
              value={form.menuItemName}
              onChange={e => setForm(f => ({...f, menuItemName: e.target.value}))}/>
          </div>

          {/* Price */}
          <div className="mn-field">
            <label className="mn-label">Price (₹) <span className="mn-required">*</span></label>
            <div className="mn-input-icon-wrap">
              <IndianRupee size={14} className="mn-input-prefix-icon"/>
              <input className="mn-input mn-input-prefixed" type="number" step="0.01" placeholder="299" required
                value={form.menuItemPrice}
                onChange={e => setForm(f => ({...f, menuItemPrice: e.target.value}))}/>
            </div>
          </div>

          {/* Category */}
          {categories.length > 0 && (
            <div className="mn-field">
              <label className="mn-label">Category</label>
              <select className="mn-input mn-select"
                value={form.categoryID}
                onChange={e => setForm(f => ({...f, categoryID: e.target.value}))}>
                <option value="">Select category…</option>
                {categories.map(cat => (
                  <option key={cat.categoryID} value={String(cat.categoryID)}>{cat.categoryName}</option>
                ))}
              </select>
            </div>
          )}

          {/* Description */}
          <div className="mn-field mn-field-full">
            <label className="mn-label">Description</label>
            <textarea className="mn-input mn-textarea" rows={3} placeholder="Describe your dish…"
              value={form.menuItemDescription}
              onChange={e => setForm(f => ({...f, menuItemDescription: e.target.value}))}/>
          </div>

          {/* Image URL */}
          <div className="mn-field mn-field-full">
            <label className="mn-label">Image URL</label>
            <input className="mn-input" placeholder="https://example.com/food.jpg"
              value={form.menuItemImage}
              onChange={e => setForm(f => ({...f, menuItemImage: e.target.value}))}/>
            <p className="mn-hint">Leave empty to auto-generate a food image</p>
          </div>

          {/* Availability toggle */}
          <div className="mn-field mn-field-full">
            <div className="mn-avail-toggle" onClick={() => setForm(f => ({...f, isAvailable: !f.isAvailable}))}>
              <div className={`mn-toggle-track ${form.isAvailable ? "mn-toggle-on" : ""}`}>
                <div className="mn-toggle-thumb"/>
              </div>
              <div>
                <span className="mn-toggle-label">{form.isAvailable ? "Available for orders" : "Currently unavailable"}</span>
                <span className="mn-toggle-sub">Customers {form.isAvailable ? "can" : "cannot"} order this item</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mn-dialog-footer">
          <button type="button" className="mn-btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
          <button type="submit" className="mn-btn-primary" disabled={saving}>
            {saving
              ? <><Loader2 size={15} className="mn-spin"/> Saving…</>
              : mode === "add" ? <><Plus size={15}/> Add Item</> : <><Pencil size={15}/> Save Changes</>}
          </button>
        </div>
      </form>

    </div>
  </div>
);

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
const RestaurantMenu = () => {
  const [menuItems,          setMenuItems]          = useState([]);
  const [categories,         setCategories]         = useState([]);
  const [loading,            setLoading]            = useState(true);
  const [searchTerm,         setSearchTerm]         = useState("");
  const [filterCategory,     setFilterCategory]     = useState("All");
  const [filterAvailability, setFilterAvailability] = useState("All");
  const [modal,              setModal]              = useState(null); // null | "add" | "edit"
  const [saving,             setSaving]             = useState(false);
  const [togglingId,         setTogglingId]         = useState(null);
  const [viewMode,           setViewMode]           = useState("grid"); // "grid" | "list"
  const [mounted,            setMounted]            = useState(false);
  const [restaurant,         setRestaurant]         = useState(null);

  const [form, setForm] = useState({
    menuItemID: null, menuItemName: "", menuItemPrice: "",
    menuItemDescription: "", categoryID: "", isAvailable: true, menuItemImage: "",
  });

  const restaurantId = (() => {
    const raw = localStorage.getItem("restaurantId");
    return raw ? parseInt(raw, 10) : null;
  })();

  useEffect(() => {
    if (restaurantId) loadData();
    else setLoading(false);
    setTimeout(() => setMounted(true), 80);
    // eslint-disable-next-line
  }, [restaurantId]);

  /* ─── load data ─── */
  const loadData = async () => {
    try {
      const restRes = await axiosInstance.get(REST_API);
      const restaurants = Array.isArray(restRes?.data) ? restRes.data : [];
      const current = restaurants.find(r => Number(r.restaurantID) === Number(restaurantId));
      if (!current) { setLoading(false); return; }
      setRestaurant(current);

      let menuData = [];
      const matchesRestaurant = mi => {
        const candidates = [mi?.restaurantID, mi?.restaurantId, mi?.RestaurantID,
          mi?.restaurant?.restaurantID, mi?.restaurant?.restaurantId];
        if (candidates.some(c => c != null && normalizeId(c) === normalizeId(current.restaurantID))) return true;
        const nameA = (mi?.restaurantName || mi?.restaurant?.name || "").toLowerCase().trim();
        const nameB = (current?.name || "").toLowerCase().trim();
        return nameA && nameB && (nameA === nameB || nameA.includes(nameB) || nameB.includes(nameA));
      };

      try {
        const r1 = await axiosInstance.get(`${MENU_API}/restaurant/${current.restaurantID}?includeUnavailable=true`);
        menuData = Array.isArray(r1?.data) ? r1.data : [];
        if (!menuData.length) {
          const r2 = await axiosInstance.get(`${MENU_API}/restaurant/${current.restaurantID}`);
          menuData = Array.isArray(r2?.data) ? r2.data : [];
        }
      } catch {}

      try {
        const allR = await axiosInstance.get(MENU_API);
        const allData = Array.isArray(allR?.data) ? allR.data : [];
        const existingKeys = new Set(menuData.map(getMenuItemKey).filter(Boolean));
        const missing = allData.filter(m => matchesRestaurant(m) && !existingKeys.has(getMenuItemKey(m)));
        menuData = [...menuData, ...missing];
        if (!menuData.length)
          menuData = allData.filter(m => (m?.restaurantName||m?.restaurant?.name||"").toLowerCase() === (current?.name||"").toLowerCase());
      } catch {}

      const keyed = new Map();
      menuData.forEach(mi => {
        const k = getMenuItemKey(mi) ?? `${mi?.menuItemName||""}_${mi?.menuItemPrice??""}`;
        if (!keyed.has(k)) keyed.set(k, mi);
      });
      setMenuItems(Array.from(keyed.values()).sort((a,b) =>
        (a?.menuItemName||"").localeCompare(b?.menuItemName||"")));

      try {
        const catR = await axiosInstance.get(CATEGORY_API);
        setCategories(Array.isArray(catR?.data) ? catR.data : []);
      } catch { setCategories([]); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  /* ─── open add modal ─── */
  const handleAdd = () => {
    setForm({ menuItemID:null, menuItemName:"", menuItemPrice:"",
      menuItemDescription:"", categoryID: categories.length ? String(categories[0].categoryID) : "",
      isAvailable:true, menuItemImage:"" });
    setModal("add");
  };

  /* ─── open edit modal ─── */
  const handleEdit = item => {
    setForm({ menuItemID:item.menuItemID, menuItemName:item.menuItemName,
      menuItemPrice:item.menuItemPrice, menuItemDescription:item.menuItemDescription||"",
      categoryID: item.categoryID ? String(item.categoryID) : "",
      isAvailable:item.isAvailable, menuItemImage:item.imageUrl||"" });
    setModal("edit");
  };

  /* ─── submit ─── */
  const handleSubmit = async e => {
    e.preventDefault();
    if (!restaurantId || !restaurant) { alert("Restaurant not found."); return; }
    const price = parseFloat(form.menuItemPrice);
    if (isNaN(price) || price <= 0) { alert("Enter a valid price."); return; }
    if (categories.length && !form.categoryID) { alert("Please select a category."); return; }
    try {
      setSaving(true);
      const payload = {
        RestaurantID: restaurantId,
        MenuItemName: form.menuItemName.trim(),
        MenuItemPrice: price,
        CategoryID: form.categoryID ? parseInt(form.categoryID,10) : null,
        ImageUrl: form.menuItemImage?.trim() ||
          `https://source.unsplash.com/800x600/?food,${encodeURIComponent(form.menuItemName)}`,
      };
      if (modal === "edit") await axiosInstance.put(`${MENU_API}/${form.menuItemID}`, payload);
      else                  await axiosInstance.post(MENU_API, payload);
      setModal(null);
      await loadData();
    } catch (err) {
      alert("Failed: " + (err.response?.data?.message || err.message || "Unknown error"));
    } finally { setSaving(false); }
  };

  /* ─── toggle availability ─── */
  const handleToggle = async item => {
    const newStatus = !item.isAvailable;
    setTogglingId(item.menuItemID);
    setMenuItems(prev => prev.map(i => i.menuItemID === item.menuItemID ? {...i, isAvailable:newStatus} : i));
    try {
      await axiosInstance.patch(`${MENU_API}/${item.menuItemID}/availability`, null, { params:{ isAvailable:newStatus } });
    } catch (err) {
      alert("Failed: " + (err.response?.data?.message || err.message));
      setMenuItems(prev => prev.map(i => i.menuItemID === item.menuItemID ? {...i, isAvailable:item.isAvailable} : i));
    } finally { setTogglingId(null); }
  };

  /* ─── delete ─── */
  const handleDelete = async id => {
    if (!window.confirm("Delete this menu item?")) return;
    try { await axiosInstance.delete(`${MENU_API}/${id}`); await loadData(); }
    catch { alert("Failed to delete item."); }
  };

  /* ─── filter ─── */
  const filteredItems = menuItems.filter(item => {
    const name = (item?.menuItemName||"").toLowerCase();
    const desc = (item?.menuItemDescription||"").toLowerCase();
    const matchSearch = name.includes(searchTerm.toLowerCase()) || desc.includes(searchTerm.toLowerCase());
    const selCat = categories.find(c => String(c.categoryID) === String(filterCategory));
    const matchCat = filterCategory === "All" ||
      String(item?.categoryID) === String(filterCategory) ||
      item?.categoryName === selCat?.categoryName;
    const matchAvail = filterAvailability === "All" ||
      (filterAvailability === "Available" && item?.isAvailable) ||
      (filterAvailability === "Unavailable" && !item?.isAvailable);
    return matchSearch && matchCat && matchAvail;
  });

  const availableCount   = menuItems.filter(i => i.isAvailable).length;
  const unavailableCount = menuItems.filter(i => !i.isAvailable).length;
  const rName = restaurant?.name || restaurant?.restaurantName || "Your Restaurant";

  /* ─── loading screen ─── */
  if (loading) return (
    <>
      <style>{CSS}</style>
      <div className="mn-splash">
        <div className="mn-splash-ring"/>
        <ChefHat size={30} className="mn-splash-ico mn-spin-slow"/>
        <p className="mn-splash-txt">Loading menu…</p>
        <div className="mn-splash-bar-wrap"><div className="mn-splash-bar"/></div>
      </div>
    </>
  );

  return (
    <>
      <style>{CSS}</style>

      {/* MODAL */}
      {modal && (
        <MenuModal mode={modal} form={form} setForm={setForm}
          categories={categories} onClose={() => setModal(null)}
          onSubmit={handleSubmit} saving={saving}/>
      )}

      <div className={`mn-root ${mounted ? "mn-mounted" : ""}`}>

        {/* ── HERO HEADER ── */}
        <div className="mn-hero">
          <div className="mn-hero-bg"/>
          <div className="mn-hero-content">
            <div className="mn-hero-left">
              <div className="mn-hero-eyebrow">
                <ChefHat size={13}/> Menu Management
              </div>
              <h1 className="mn-hero-title">{rName}</h1>
              <p className="mn-hero-sub">
                Craft your menu · Set prices · Control availability
              </p>
            </div>
            <button className="mn-hero-add-btn" onClick={handleAdd}>
              <Plus size={18}/> Add New Item
            </button>
          </div>
        </div>

        <div className="mn-body">

          {/* ── STAT STRIP ── */}
          <div className="mn-stat-strip">
            {[
              { icon:<UtensilsCrossed size={22}/>, label:"Total Items",   val:menuItems.length,  accent:"#fb923c", bg:"#fff7ed" },
              { icon:<CheckCircle     size={22}/>, label:"Available",     val:availableCount,    accent:"#16a34a", bg:"#f0fdf4" },
              { icon:<EyeOff          size={22}/>, label:"Unavailable",   val:unavailableCount,  accent:"#dc2626", bg:"#fef2f2" },
              { icon:<Tag             size={22}/>, label:"Categories",    val:categories.length, accent:"#7c3aed", bg:"#f5f3ff" },
            ].map((s,i) => (
              <div key={i} className="mn-stat" style={{"--acc":s.accent, "--bg":s.bg, animationDelay:`${i*60}ms`}}>
                <div className="mn-stat-icon">{s.icon}</div>
                <div>
                  <div className="mn-stat-val">{s.val}</div>
                  <div className="mn-stat-lbl">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ── FILTER BAR ── */}
          <div className="mn-filter-bar">
            {/* Search */}
            <div className="mn-search-wrap">
              <Search size={15} className="mn-search-ico"/>
              <input className="mn-search" placeholder="Search dishes…"
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/>
              {searchTerm && <button className="mn-search-clear" onClick={() => setSearchTerm("")}><X size={12}/></button>}
            </div>

            {/* Category pills */}
            <div className="mn-cat-pills">
              <button className={`mn-cat-pill ${filterCategory==="All"?"mn-cat-pill-on":""}`}
                onClick={() => setFilterCategory("All")}>All</button>
              {categories.map((cat,i) => (
                <button key={cat.categoryID}
                  className={`mn-cat-pill ${filterCategory===String(cat.categoryID)?"mn-cat-pill-on":""}`}
                  style={filterCategory===String(cat.categoryID) ? {"--pill-color":CAT_COLORS[i%CAT_COLORS.length]} : {}}
                  onClick={() => setFilterCategory(String(cat.categoryID))}>
                  {cat.categoryName}
                </button>
              ))}
            </div>

            {/* Right controls */}
            <div className="mn-filter-right">
              <select className="mn-avail-select"
                value={filterAvailability} onChange={e => setFilterAvailability(e.target.value)}>
                <option value="All">All items</option>
                <option value="Available">Available</option>
                <option value="Unavailable">Unavailable</option>
              </select>
              <div className="mn-view-toggle">
                <button className={`mn-view-btn ${viewMode==="grid"?"mn-view-on":""}`} onClick={() => setViewMode("grid")} title="Grid view">
                  <GridIcon size={14}/>
                </button>
                <button className={`mn-view-btn ${viewMode==="list"?"mn-view-on":""}`} onClick={() => setViewMode("list")} title="List view">
                  <List size={14}/>
                </button>
              </div>
            </div>
          </div>

          {/* ── RESULTS INFO ── */}
          {filteredItems.length > 0 && (
            <div className="mn-results-info">
              <span>{filteredItems.length} item{filteredItems.length!==1?"s":""}</span>
              {(searchTerm || filterCategory!=="All" || filterAvailability!=="All") && (
                <button className="mn-clear-filters" onClick={() => {
                  setSearchTerm(""); setFilterCategory("All"); setFilterAvailability("All");
                }}>Clear filters ×</button>
              )}
            </div>
          )}

          {/* ── EMPTY STATE ── */}
          {filteredItems.length === 0 && (
            <div className="mn-empty">
              <div className="mn-empty-icon"><UtensilsCrossed size={44}/></div>
              <p className="mn-empty-title">{menuItems.length === 0 ? "No menu items yet" : "No results found"}</p>
              <p className="mn-empty-sub">
                {menuItems.length === 0
                  ? "Start building your menu by adding your first dish"
                  : "Try adjusting your search or filters"}
              </p>
              {menuItems.length === 0 && (
                <button className="mn-hero-add-btn" style={{marginTop:20}} onClick={handleAdd}>
                  <Plus size={16}/> Add First Item
                </button>
              )}
            </div>
          )}

          {/* ── GRID VIEW ── */}
          {filteredItems.length > 0 && viewMode === "grid" && (
            <div className="mn-grid">
              {filteredItems.map((item, idx) => {
                const catColor = CAT_COLORS[categories.findIndex(c => String(c.categoryID) === String(item.categoryID)) % CAT_COLORS.length] || "#fb923c";
                const isToggling = togglingId === item.menuItemID;
                return (
                  <article key={item.menuItemID} className={`mn-card ${!item.isAvailable?"mn-card-unavail":""}`}
                    style={{animationDelay:`${idx*40}ms`}}>

                    {/* Image */}
                    <div className="mn-card-img-wrap">
                      <img src={getFoodImage(item)} alt={item.menuItemName}
                        className="mn-card-img"
                        onError={e => { e.target.style.display="none"; e.target.nextSibling.style.display="flex"; }}/>
                      <div className="mn-card-img-fallback" style={{display:"none"}}>
                        <ImageOff size={28}/>
                      </div>
                      {/* Price badge */}
                      <div className="mn-price-badge">
                        <IndianRupee size={11}/>
                        <span>{Number(item.menuItemPrice).toFixed(0)}</span>
                      </div>
                      {/* Unavailable overlay */}
                      {!item.isAvailable && (
                        <div className="mn-unavail-overlay">
                          <EyeOff size={20}/>
                          <span>Unavailable</span>
                        </div>
                      )}
                      {/* Availability dot */}
                      <div className={`mn-avail-dot ${item.isAvailable?"mn-dot-on":"mn-dot-off"}`}/>
                    </div>

                    {/* Body */}
                    <div className="mn-card-body">
                      <div className="mn-card-top">
                        <h3 className="mn-card-name">{item.menuItemName}</h3>
                        {item.categoryName && (
                          <span className="mn-card-cat" style={{"--cc":catColor}}>
                            {item.categoryName}
                          </span>
                        )}
                      </div>
                      {item.menuItemDescription && (
                        <p className="mn-card-desc">{item.menuItemDescription}</p>
                      )}

                      {/* Actions */}
                      <div className="mn-card-actions">
                        <button className={`mn-toggle-btn ${item.isAvailable?"mn-toggle-avail":"mn-toggle-unavail"}`}
                          onClick={() => handleToggle(item)} disabled={isToggling}>
                          {isToggling
                            ? <Loader2 size={12} className="mn-spin"/>
                            : item.isAvailable ? <ToggleRight size={13}/> : <ToggleLeft size={13}/>}
                          {isToggling ? "Updating…" : item.isAvailable ? "Available" : "Unavailable"}
                        </button>
                        <button className="mn-icon-btn mn-edit-btn" onClick={() => handleEdit(item)} title="Edit">
                          <Pencil size={13}/>
                        </button>
                        <button className="mn-icon-btn mn-del-btn" onClick={() => handleDelete(item.menuItemID)} title="Delete">
                          <Trash2 size={13}/>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* ── LIST VIEW ── */}
          {filteredItems.length > 0 && viewMode === "list" && (
            <div className="mn-list">
              {filteredItems.map((item, idx) => {
                const catColor = CAT_COLORS[categories.findIndex(c => String(c.categoryID) === String(item.categoryID)) % CAT_COLORS.length] || "#fb923c";
                const isToggling = togglingId === item.menuItemID;
                return (
                  <div key={item.menuItemID} className={`mn-list-row ${!item.isAvailable?"mn-list-unavail":""}`}
                    style={{animationDelay:`${idx*30}ms`}}>
                    <div className="mn-list-img-wrap">
                      <img src={getFoodImage(item)} alt={item.menuItemName}
                        className="mn-list-img"
                        onError={e => { e.target.style.display="none"; }}/>
                      {!item.isAvailable && <div className="mn-list-unavail-mark"><EyeOff size={12}/></div>}
                    </div>
                    <div className="mn-list-info">
                      <div className="mn-list-name-row">
                        <h3 className="mn-list-name">{item.menuItemName}</h3>
                        {item.categoryName && (
                          <span className="mn-card-cat" style={{"--cc":catColor}}>{item.categoryName}</span>
                        )}
                      </div>
                      {item.menuItemDescription && (
                        <p className="mn-list-desc">{item.menuItemDescription}</p>
                      )}
                    </div>
                    <div className="mn-list-price">
                      <IndianRupee size={13}/>
                      {Number(item.menuItemPrice).toFixed(0)}
                    </div>
                    <div className="mn-list-actions">
                      <button className={`mn-toggle-btn ${item.isAvailable?"mn-toggle-avail":"mn-toggle-unavail"}`}
                        onClick={() => handleToggle(item)} disabled={isToggling} style={{minWidth:120}}>
                        {isToggling ? <Loader2 size={12} className="mn-spin"/> : item.isAvailable ? <ToggleRight size={13}/> : <ToggleLeft size={13}/>}
                        {isToggling ? "…" : item.isAvailable ? "Available" : "Unavailable"}
                      </button>
                      <button className="mn-icon-btn mn-edit-btn" onClick={() => handleEdit(item)}><Pencil size={13}/></button>
                      <button className="mn-icon-btn mn-del-btn" onClick={() => handleDelete(item.menuItemID)}><Trash2 size={13}/></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>{/* end body */}
      </div>
    </>
  );
};

/* ══════════════════════════════════════════════════════
   CSS  —  warm orange customer theme
   Fonts: Syne (display) + Nunito (body)
══════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Nunito:wght@400;500;600;700;800;900&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

:root{
  --or:       #fb923c;
  --or-d:     #f97316;
  --or-dd:    #ea580c;
  --or-pale:  #fff7ed;
  --or-soft:  #fed7aa;
  --or-mid:   #fdba74;
  --text:     #431407;
  --text2:    #92400e;
  --text3:    #b45309;
  --text4:    #d97706;
  --border:   #fed7aa;
  --border2:  #fef3e2;
  --bg:       #fffbf5;
  --bg2:      #fff7ed;
  --white:    #ffffff;
  --red:      #ef4444;
  --grn:      #16a34a;
  --sh:       0 2px 12px rgba(249,115,22,0.08), 0 1px 3px rgba(0,0,0,0.04);
  --sh-md:    0 8px 28px rgba(249,115,22,0.16), 0 2px 8px rgba(0,0,0,0.06);
  --sh-lg:    0 20px 60px rgba(249,115,22,0.14), 0 8px 20px rgba(0,0,0,0.06);
  font-family: 'Nunito', sans-serif;
}

.mn-spin      { animation: _spin  .8s linear   infinite; }
.mn-spin-slow { animation: _spin 2.4s linear   infinite; }
@keyframes _spin { to{transform:rotate(360deg)} }
@keyframes _fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
@keyframes _slideIn{ from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:translateY(0)} }

/* ── SPLASH ── */
.mn-splash{
  min-height:100vh; display:flex; flex-direction:column;
  align-items:center; justify-content:center; gap:16px;
  background:var(--bg); position:relative; overflow:hidden;
}
.mn-splash::before{
  content:''; position:absolute; width:500px; height:500px;
  border-radius:50%; top:-150px; left:-100px;
  background:radial-gradient(circle,#fed7aa,transparent);
  opacity:.5; pointer-events:none;
}
.mn-splash-ring{
  width:70px; height:70px; border-radius:50%;
  border:3px solid var(--or-soft); border-top-color:var(--or);
  animation:_spin .9s linear infinite; position:absolute;
}
.mn-splash-ico{ color:var(--or); z-index:1; position:relative; }
.mn-splash-txt{ font-size:15px; font-weight:700; color:var(--text2); font-family:'Syne',sans-serif; }
.mn-splash-bar-wrap{ width:190px; height:4px; background:var(--or-soft); border-radius:4px; overflow:hidden; }
.mn-splash-bar{
  height:100%; width:42%; border-radius:4px;
  background:linear-gradient(90deg,var(--or),var(--or-d));
  animation:_sweep 1.4s ease-in-out infinite;
}
@keyframes _sweep{ 0%{transform:translateX(-200%)} 100%{transform:translateX(400%)} }

/* ── ROOT ── */
.mn-root{ background:var(--bg); min-height:100vh; }
.mn-root.mn-mounted .mn-hero,
.mn-root.mn-mounted .mn-stat-strip,
.mn-root.mn-mounted .mn-filter-bar{ animation:_slideIn .5s cubic-bezier(.22,1,.36,1) both; }

/* ── HERO HEADER ── */
.mn-hero{
  position:relative; overflow:hidden;
  background:linear-gradient(135deg, #fff7ed 0%, #fed7aa 60%, #fdba74 100%);
  border-bottom:2px solid var(--or-soft);
  padding:36px 44px 32px;
}
.mn-hero-bg{
  position:absolute; inset:0; pointer-events:none;
  background:
    radial-gradient(circle 280px at 90% 50%, rgba(251,146,60,.18), transparent),
    radial-gradient(circle 180px at 10% 80%, rgba(253,186,116,.22), transparent);
}
/* decorative circles */
.mn-hero::before,.mn-hero::after{
  content:''; position:absolute; border-radius:50%;
  background:rgba(251,146,60,0.10); pointer-events:none;
}
.mn-hero::before{ width:320px; height:320px; top:-120px; right:-60px; }
.mn-hero::after { width:160px; height:160px; bottom:-60px; left:30%; }

.mn-hero-content{
  position:relative; z-index:1;
  display:flex; align-items:center; justify-content:space-between; gap:20px; flex-wrap:wrap;
}
.mn-hero-eyebrow{
  display:inline-flex; align-items:center; gap:6px;
  font-size:11px; font-weight:800; color:var(--or-dd);
  letter-spacing:.09em; text-transform:uppercase;
  background:rgba(255,255,255,0.65); border:1.5px solid rgba(251,146,60,.3);
  padding:4px 12px; border-radius:100px; margin-bottom:10px;
  font-family:'Syne',sans-serif; backdrop-filter:blur(6px);
}
.mn-hero-title{
  font-family:'Syne',sans-serif;
  font-size:clamp(24px,3vw,36px); font-weight:800;
  color:var(--text); letter-spacing:-.5px; line-height:1.1; margin-bottom:6px;
}
.mn-hero-sub{
  font-size:13.5px; color:var(--text2); font-weight:600;
  font-family:'Nunito',sans-serif;
}
.mn-hero-add-btn{
  display:inline-flex; align-items:center; gap:8px;
  padding:13px 24px; border-radius:14px; border:none; cursor:pointer;
  background:linear-gradient(135deg,var(--or-d),var(--or-dd));
  font-family:'Syne',sans-serif; font-size:14px; font-weight:700; color:#fff;
  box-shadow:0 6px 20px rgba(249,115,22,0.35), inset 0 1px 0 rgba(255,255,255,.15);
  transition:all .2s; white-space:nowrap;
}
.mn-hero-add-btn:hover{
  transform:translateY(-2px);
  box-shadow:0 10px 28px rgba(249,115,22,0.44);
}

/* ── BODY ── */
.mn-body{ padding:28px 44px 60px; }

/* ── STAT STRIP ── */
.mn-stat-strip{
  display:grid; grid-template-columns:repeat(4,1fr); gap:16px;
  margin-bottom:26px;
}
.mn-stat{
  display:flex; align-items:center; gap:14px;
  background:var(--white); border:1.5px solid var(--border2);
  border-radius:16px; padding:18px 20px;
  box-shadow:var(--sh);
  animation:_fadeUp .45s cubic-bezier(.22,1,.36,1) both;
  transition:transform .2s, box-shadow .2s;
  position:relative; overflow:hidden;
}
.mn-stat::before{
  content:''; position:absolute; left:0; top:0; bottom:0;
  width:4px; background:var(--acc); border-radius:0 4px 4px 0;
}
.mn-stat:hover{ transform:translateY(-3px); box-shadow:var(--sh-md); }
.mn-stat-icon{
  width:48px; height:48px; border-radius:13px; flex-shrink:0;
  background:var(--bg); color:var(--acc);
  display:flex; align-items:center; justify-content:center;
}
.mn-stat-val{ font-size:26px; font-weight:900; color:var(--text); font-family:'Syne',sans-serif; line-height:1; }
.mn-stat-lbl{ font-size:12px; font-weight:700; color:var(--text3); margin-top:3px; }

/* ── FILTER BAR ── */
.mn-filter-bar{
  background:var(--white); border:1.5px solid var(--border2);
  border-radius:18px; padding:16px 20px;
  box-shadow:var(--sh); margin-bottom:20px;
  display:flex; align-items:center; gap:14px; flex-wrap:wrap;
}
.mn-search-wrap{
  position:relative; display:flex; align-items:center;
  flex-shrink:0;
}
.mn-search-ico{ position:absolute; left:13px; color:var(--or-mid); pointer-events:none; }
.mn-search{
  padding:10px 34px 10px 38px;
  border:1.5px solid var(--border); border-radius:11px;
  font-family:'Nunito',sans-serif; font-size:13px; font-weight:600;
  color:var(--text); background:var(--bg2); outline:none;
  min-width:200px; transition:all .18s;
}
.mn-search:focus{ border-color:var(--or); box-shadow:0 0 0 3px rgba(251,146,60,.12); background:#fff; }
.mn-search::placeholder{ color:var(--or-mid); }
.mn-search-clear{
  position:absolute; right:10px; width:20px; height:20px;
  border-radius:50%; border:none; background:var(--or-soft);
  color:var(--or-dd); display:flex; align-items:center; justify-content:center;
  cursor:pointer; transition:all .15s;
}
.mn-search-clear:hover{ background:var(--or); color:#fff; }

/* Category pills */
.mn-cat-pills{ display:flex; flex-wrap:wrap; gap:7px; flex:1; }
.mn-cat-pill{
  padding:6px 14px; border-radius:100px; border:1.5px solid var(--border);
  background:var(--bg2); font-family:'Nunito',sans-serif;
  font-size:12px; font-weight:700; color:var(--text2);
  cursor:pointer; transition:all .18s; white-space:nowrap;
}
.mn-cat-pill:hover{ border-color:var(--or-mid); background:var(--or-pale); }
.mn-cat-pill-on{
  background:var(--pill-color,var(--or)) !important;
  border-color:var(--pill-color,var(--or)) !important;
  color:#fff !important;
  box-shadow:0 3px 10px rgba(251,146,60,.28);
}

.mn-filter-right{ display:flex; align-items:center; gap:10px; margin-left:auto; }
.mn-avail-select{
  padding:9px 14px; border:1.5px solid var(--border); border-radius:11px;
  font-family:'Nunito',sans-serif; font-size:12px; font-weight:700; color:var(--text2);
  background:var(--bg2); outline:none; cursor:pointer; transition:border-color .18s;
}
.mn-avail-select:focus{ border-color:var(--or); }

.mn-view-toggle{ display:flex; gap:2px; background:var(--bg2); border-radius:9px; padding:3px; border:1.5px solid var(--border); }
.mn-view-btn{
  width:30px; height:30px; border-radius:7px; border:none; background:transparent;
  color:var(--text3); display:flex; align-items:center; justify-content:center;
  cursor:pointer; transition:all .15s;
}
.mn-view-btn:hover{ background:var(--or-pale); color:var(--or); }
.mn-view-on{ background:var(--white) !important; color:var(--or-dd) !important; box-shadow:0 1px 4px rgba(0,0,0,.1); }

/* results info */
.mn-results-info{
  font-size:12px; font-weight:700; color:var(--text3);
  margin-bottom:18px; display:flex; align-items:center; gap:12px;
}
.mn-clear-filters{
  background:none; border:none; cursor:pointer; font-family:'Nunito',sans-serif;
  font-size:12px; font-weight:700; color:var(--or-dd); transition:opacity .15s;
}
.mn-clear-filters:hover{ opacity:.7; }

/* ── GRID ── */
.mn-grid{
  display:grid;
  grid-template-columns:repeat(auto-fill,minmax(250px,1fr));
  gap:20px;
}

/* ── CARD ── */
.mn-card{
  background:var(--white); border-radius:20px;
  border:1.5px solid var(--border2);
  overflow:hidden; box-shadow:var(--sh);
  transition:all .28s cubic-bezier(.22,1,.36,1);
  animation:_fadeUp .42s cubic-bezier(.22,1,.36,1) both;
  display:flex; flex-direction:column;
}
.mn-card:hover{
  transform:translateY(-5px);
  box-shadow:var(--sh-md);
  border-color:var(--or-soft);
}
.mn-card-unavail{ opacity:0.72; }

.mn-card-img-wrap{
  position:relative; height:180px; overflow:hidden; background:var(--bg2);
  flex-shrink:0;
}
.mn-card-img{
  width:100%; height:100%; object-fit:cover;
  transition:transform .4s ease;
}
.mn-card:hover .mn-card-img{ transform:scale(1.06); }
.mn-card-img-fallback{
  width:100%; height:100%; display:none; align-items:center; justify-content:center;
  color:var(--or-soft); font-size:28px; background:var(--bg2);
}
.mn-price-badge{
  position:absolute; top:10px; right:10px;
  display:flex; align-items:center; gap:2px;
  background:rgba(255,255,255,0.94); backdrop-filter:blur(8px);
  border:1.5px solid var(--or-soft);
  border-radius:100px; padding:4px 10px;
  font-size:13px; font-weight:900; color:var(--text);
  font-family:'Syne',sans-serif;
  box-shadow:0 2px 8px rgba(0,0,0,.1);
}
.mn-unavail-overlay{
  position:absolute; inset:0;
  background:rgba(67,20,7,.6);
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  gap:6px; color:#fff; font-weight:700; font-size:13px;
  font-family:'Syne',sans-serif;
}
.mn-avail-dot{
  position:absolute; bottom:10px; left:10px;
  width:10px; height:10px; border-radius:50%;
  border:2px solid #fff; box-shadow:0 1px 4px rgba(0,0,0,.2);
}
.mn-dot-on { background:#22c55e; }
.mn-dot-off{ background:#ef4444; }

.mn-card-body{ padding:14px 16px 14px; display:flex; flex-direction:column; gap:8px; flex:1; }
.mn-card-top{ display:flex; align-items:flex-start; justify-content:space-between; gap:8px; }
.mn-card-name{
  font-size:15px; font-weight:800; color:var(--text);
  font-family:'Syne',sans-serif; line-height:1.2;
  flex:1; min-width:0;
}
.mn-card-cat{
  display:inline-block; padding:2px 9px; border-radius:100px;
  font-size:10px; font-weight:800; letter-spacing:.04em;
  background:color-mix(in srgb,var(--cc) 12%,white);
  color:var(--cc);
  border:1px solid color-mix(in srgb,var(--cc) 28%,transparent);
  white-space:nowrap; flex-shrink:0;
  font-family:'Nunito',sans-serif;
}
.mn-card-desc{
  font-size:12px; color:var(--text3); line-height:1.5;
  display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;
}
.mn-card-actions{ display:flex; gap:6px; margin-top:auto; }

/* ── LIST VIEW ── */
.mn-list{ display:flex; flex-direction:column; gap:10px; }
.mn-list-row{
  background:var(--white); border:1.5px solid var(--border2);
  border-radius:14px; padding:12px 16px;
  display:flex; align-items:center; gap:14px;
  box-shadow:var(--sh);
  animation:_fadeUp .38s cubic-bezier(.22,1,.36,1) both;
  transition:all .2s;
}
.mn-list-row:hover{ border-color:var(--or-soft); box-shadow:var(--sh-md); transform:translateX(3px); }
.mn-list-unavail{ opacity:.72; }
.mn-list-img-wrap{
  width:58px; height:58px; border-radius:12px; overflow:hidden;
  flex-shrink:0; position:relative; background:var(--bg2);
}
.mn-list-img{ width:100%; height:100%; object-fit:cover; }
.mn-list-unavail-mark{
  position:absolute; inset:0; background:rgba(67,20,7,.55);
  display:flex; align-items:center; justify-content:center; color:#fff;
}
.mn-list-info{ flex:1; min-width:0; }
.mn-list-name-row{ display:flex; align-items:center; gap:8px; margin-bottom:3px; flex-wrap:wrap; }
.mn-list-name{ font-size:14px; font-weight:800; color:var(--text); font-family:'Syne',sans-serif; }
.mn-list-desc{ font-size:12px; color:var(--text3); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.mn-list-price{
  display:flex; align-items:center; gap:2px;
  font-size:16px; font-weight:900; color:var(--text);
  font-family:'Syne',sans-serif; flex-shrink:0;
}
.mn-list-actions{ display:flex; align-items:center; gap:7px; flex-shrink:0; }

/* ── SHARED ACTION BUTTONS ── */
.mn-toggle-btn{
  display:flex; align-items:center; gap:5px;
  padding:7px 13px; border-radius:9px; border:none; cursor:pointer;
  font-family:'Nunito',sans-serif; font-size:11px; font-weight:700;
  transition:all .18s; flex:1;
}
.mn-toggle-avail  { background:#f0fdf4; color:#15803d; }
.mn-toggle-avail:hover{ background:#dcfce7; }
.mn-toggle-unavail{ background:#fef2f2; color:#dc2626; }
.mn-toggle-unavail:hover{ background:#fee2e2; }
.mn-toggle-btn:disabled{ opacity:.6; cursor:not-allowed; }

.mn-icon-btn{
  width:34px; height:34px; border-radius:9px; border:none;
  display:flex; align-items:center; justify-content:center;
  cursor:pointer; flex-shrink:0; transition:all .16s;
}
.mn-edit-btn{ background:#eff6ff; color:#3b82f6; border:1.5px solid #dbeafe; }
.mn-edit-btn:hover{ background:#3b82f6; color:#fff; border-color:#3b82f6; transform:scale(1.08); }
.mn-del-btn { background:#fef2f2; color:#ef4444; border:1.5px solid #fee2e2; }
.mn-del-btn:hover { background:#ef4444; color:#fff; border-color:#ef4444; transform:scale(1.08); }

/* ── EMPTY ── */
.mn-empty{
  text-align:center; padding:80px 24px;
  background:var(--white); border:1.5px solid var(--border2);
  border-radius:20px; box-shadow:var(--sh);
}
.mn-empty-icon{
  width:88px; height:88px; border-radius:50%; margin:0 auto 20px;
  background:var(--or-pale); color:var(--or-soft);
  display:flex; align-items:center; justify-content:center;
  border:2px solid var(--or-soft);
}
.mn-empty-title{ font-size:20px; font-weight:800; color:var(--text); margin-bottom:8px; font-family:'Syne',sans-serif; }
.mn-empty-sub  { font-size:14px; color:var(--text3); }

/* ── MODAL OVERLAY ── */
.mn-overlay{
  position:fixed; inset:0; z-index:1000;
  background:rgba(67,20,7,.45); backdrop-filter:blur(7px);
  display:flex; align-items:center; justify-content:center; padding:20px;
  animation:_fi .2s ease;
}
@keyframes _fi{ from{opacity:0} }
.mn-dialog{
  background:var(--white); border-radius:24px;
  width:100%; max-width:480px; max-height:92vh; overflow-y:auto;
  box-shadow:var(--sh-lg); border:1.5px solid var(--border);
  animation:_pi .24s cubic-bezier(.22,1,.36,1);
}
@keyframes _pi{ from{opacity:0;transform:scale(.93)} }

.mn-dialog-header{
  display:flex; align-items:center; gap:14px;
  padding:22px 24px 18px;
  border-bottom:1.5px solid var(--border2);
  position:sticky; top:0; background:var(--white); z-index:10;
  border-radius:24px 24px 0 0;
}
.mn-dialog-header-icon{
  width:44px; height:44px; border-radius:13px; flex-shrink:0;
  background:linear-gradient(135deg,var(--or-d),var(--or-dd));
  display:flex; align-items:center; justify-content:center; color:#fff;
  box-shadow:0 4px 12px rgba(249,115,22,.3);
}
.mn-dialog-title{ font-size:18px; font-weight:800; color:var(--text); font-family:'Syne',sans-serif; }
.mn-dialog-sub  { font-size:12px; color:var(--text3); margin-top:2px; }
.mn-dialog-close{
  margin-left:auto; width:32px; height:32px; border-radius:50%;
  border:none; background:var(--bg2); color:var(--text3);
  display:flex; align-items:center; justify-content:center;
  cursor:pointer; transition:all .15s; flex-shrink:0;
}
.mn-dialog-close:hover{ background:var(--or-soft); color:var(--or-dd); }

.mn-dialog-body{ padding:20px 24px 24px; }

/* Image preview */
.mn-img-preview{
  height:110px; border-radius:12px; overflow:hidden;
  margin-bottom:16px; background:var(--bg2);
  border:1.5px solid var(--border); position:relative;
}
.mn-img-preview-label{
  position:absolute; bottom:6px; left:8px;
  background:rgba(67,20,7,.6); color:#fff;
  font-size:10px; font-weight:700; padding:2px 8px; border-radius:100px;
}

/* Form fields */
.mn-field-grid{ display:grid; grid-template-columns:1fr 1fr; gap:14px; }
.mn-field{ display:flex; flex-direction:column; gap:6px; }
.mn-field-full{ grid-column:1/-1; }
.mn-label{ font-size:11px; font-weight:800; color:var(--text3); letter-spacing:.06em; text-transform:uppercase; font-family:'Nunito',sans-serif; }
.mn-required{ color:#ef4444; }
.mn-input{
  padding:10px 13px; border:1.5px solid var(--border);
  border-radius:10px; font-family:'Nunito',sans-serif;
  font-size:13px; font-weight:600; color:var(--text);
  background:var(--bg2); outline:none; width:100%;
  transition:border-color .18s,box-shadow .18s,background .18s;
}
.mn-input:focus{ border-color:var(--or); background:#fff; box-shadow:0 0 0 3px rgba(251,146,60,.12); }
.mn-input-icon-wrap{ position:relative; }
.mn-input-prefix-icon{ position:absolute; left:12px; top:50%; transform:translateY(-50%); color:var(--or-mid); pointer-events:none; }
.mn-input-prefixed{ padding-left:30px; }
.mn-select{ cursor:pointer; }
.mn-textarea{ resize:vertical; min-height:80px; }
.mn-hint{ font-size:11px; color:var(--text4); margin-top:2px; }

/* Availability toggle in modal */
.mn-avail-toggle{
  display:flex; align-items:center; gap:14px;
  background:var(--bg2); border:1.5px solid var(--border);
  border-radius:12px; padding:13px 16px; cursor:pointer;
  transition:all .18s;
}
.mn-avail-toggle:hover{ border-color:var(--or-mid); background:var(--or-pale); }
.mn-toggle-track{
  width:44px; height:24px; border-radius:100px; flex-shrink:0;
  background:#e2e8f0; position:relative; transition:background .2s;
}
.mn-toggle-on{ background:var(--or) !important; }
.mn-toggle-thumb{
  position:absolute; top:3px; left:3px;
  width:18px; height:18px; border-radius:50%;
  background:#fff; transition:transform .2s;
  box-shadow:0 1px 3px rgba(0,0,0,.2);
}
.mn-toggle-on .mn-toggle-thumb{ transform:translateX(20px); }
.mn-toggle-label{ font-size:13px; font-weight:700; color:var(--text); display:block; }
.mn-toggle-sub  { font-size:11px; color:var(--text3); margin-top:1px; }

.mn-dialog-footer{
  display:flex; gap:10px; justify-content:flex-end;
  padding-top:18px; border-top:1.5px solid var(--border2); margin-top:18px;
}
.mn-btn-ghost{
  padding:10px 20px; border-radius:10px; border:1.5px solid var(--border);
  background:transparent; font-family:'Nunito',sans-serif; font-size:13px; font-weight:800;
  color:var(--text2); cursor:pointer; transition:all .15s;
}
.mn-btn-ghost:hover{ background:var(--bg2); }
.mn-btn-primary{
  display:flex; align-items:center; gap:6px;
  padding:10px 22px; border-radius:10px; border:none; cursor:pointer;
  background:linear-gradient(135deg,var(--or-d),var(--or-dd));
  font-family:'Nunito',sans-serif; font-size:13px; font-weight:800; color:#fff;
  box-shadow:0 4px 14px rgba(249,115,22,.3);
  transition:all .18s;
}
.mn-btn-primary:hover{ background:linear-gradient(135deg,var(--or-dd),#c2410c); transform:translateY(-1px); }
.mn-btn-primary:disabled{ opacity:.6; cursor:not-allowed; transform:none; }

/* ── RESPONSIVE ── */
@media(max-width:900px){
  .mn-hero{ padding:24px 20px 22px; }
  .mn-body{ padding:20px 16px 50px; }
  .mn-stat-strip{ grid-template-columns:repeat(2,1fr); }
  .mn-grid{ grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); }
  .mn-filter-bar{ flex-direction:column; align-items:stretch; }
  .mn-search-wrap{ width:100%; }
  .mn-search{ min-width:unset; width:100%; }
  .mn-filter-right{ justify-content:space-between; }
  .mn-hero-add-btn{ width:100%; justify-content:center; margin-top:4px; }
}
@media(max-width:560px){
  .mn-stat-strip{ grid-template-columns:1fr 1fr; }
  .mn-grid{ grid-template-columns:1fr; }
  .mn-field-grid{ grid-template-columns:1fr; }
  .mn-hero-title{ font-size:22px; }
}
`;

export default RestaurantMenu;