import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Star, ShoppingCart, Plus, Minus,
  MapPin, Clock, UtensilsCrossed, Search,
} from "lucide-react";
import { useCart } from "../../contexts/CartContext";

const REST_API    = "https://localhost:7217/api/Restaurant";
const MENU_API    = "https://localhost:7217/api/MenuItem";
const CATEGORY_API = "https://localhost:7217/api/Category";
const REVIEW_API  = "https://localhost:7217/api/Review";

/* ─── Auth header helper ─── */
const authHeaders = () => {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("jwtToken");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant,      setRestaurant]      = useState(null);
  const [menuItems,       setMenuItems]       = useState([]);
  const [categories,      setCategories]      = useState([]);
  const [reviews,         setReviews]         = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [searchTerm,      setSearchTerm]      = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeTab,       setActiveTab]       = useState("menu");
  const [error,           setError]           = useState("");

  const { cart, addToCart, removeFromCart, getCartItemQuantity } = useCart();

  useEffect(() => { loadData(); }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      // FIX: use GET /Restaurant/{id} directly — no need to fetch all restaurants
      const restRes = await fetch(`${REST_API}/${id}`, { headers: authHeaders() });

      if (restRes.status === 401) {
        // Token expired or missing — redirect to login
        navigate("/customer/login");
        return;
      }
      if (restRes.status === 404) {
        navigate("/customer/home");
        return;
      }
      if (!restRes.ok) {
        setError(`Failed to load restaurant (${restRes.status})`);
        return;
      }

      const restaurantData = await restRes.json();
      setRestaurant(restaurantData);

      // Load menu items, categories, reviews in parallel
      const [menuRes, catRes, reviewRes] = await Promise.all([
        fetch(`${MENU_API}/restaurant/${id}`,    { headers: authHeaders() }),
        fetch(CATEGORY_API,                       { headers: authHeaders() }),
        fetch(`${REVIEW_API}/restaurant/${id}`,   { headers: authHeaders() }),
      ]);

      if (menuRes.ok)   setMenuItems(await menuRes.json());
      if (catRes.ok)    setCategories(await catRes.json());
      if (reviewRes.ok) setReviews(await reviewRes.json());

    } catch (e) {
      console.error("loadData error:", e);
      setError("Network error — please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (menuItem) => {
    const menuId = menuItem.menuItemID ?? menuItem.menuItemId ?? menuItem.id ?? menuItem.MenuItemID;
    addToCart({
      menuItemID:     menuId,
      menuItemName:   menuItem.menuItemName,
      menuItemPrice:  menuItem.menuItemPrice,
      imageUrl:       menuItem.imageUrl,
      restaurantID:   parseInt(id),
      restaurantName: restaurant?.name,
    });
  };

  const filteredCart  = cart.filter(item => item.restaurantID === parseInt(id));
  const cartTotal     = filteredCart.reduce((s, i) => s + i.menuItemPrice * i.quantity, 0);

  const filteredMenuItems = menuItems.filter(item => {
    const matchSearch = !searchTerm ||
      item.menuItemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.menuItemDescription?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = selectedCategory === "All" ||
      item.categoryID?.toString() === selectedCategory;
    return matchSearch && matchCat && item.isAvailable;
  });

  const getFoodImage = (item) =>
    item.menuItemImage || item.imageUrl ||
    `https://source.unsplash.com/800x600/?food,${encodeURIComponent(item.menuItemName || "food")}`;

  /* ── avg rating from reviews ── */
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + (r.rating ?? r.Rating ?? 0), 0) / reviews.length).toFixed(1)
    : restaurant?.rating?.toFixed(1) ?? null;

  /* ─── LOADER ─── */
  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", flexDirection:"column", gap:16, background:"#f9f9f9" }}>
      <div style={{ width:52, height:52, border:"4px solid #fed7aa", borderTopColor:"#ea580c", borderRadius:"50%", animation:"spin .85s linear infinite" }}/>
      <p style={{ color:"#6b3f1e", fontWeight:600, fontSize:14 }}>Loading restaurant…</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (error) return (
    <div style={{ maxWidth:600, margin:"80px auto", textAlign:"center", padding:32 }}>
      <p style={{ fontSize:18, fontWeight:700, color:"#b91c1c", marginBottom:16 }}>{error}</p>
      <button onClick={loadData} style={{ padding:"10px 24px", borderRadius:12, background:"#ea580c", color:"#fff", border:"none", fontWeight:700, cursor:"pointer" }}>
        Retry
      </button>
    </div>
  );

  if (!restaurant) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

      {/* Back */}
      <button onClick={() => navigate("/customer/home")}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-semibold transition">
        <ArrowLeft size={20}/> Back to Restaurants
      </button>

      {/* Restaurant Hero */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-6">
        <div className="relative h-64 md:h-80">
          <img
            src={restaurant.imageUrl || `https://source.unsplash.com/1200x600/?restaurant,${encodeURIComponent(restaurant.name)}`}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"/>
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h1 className="text-4xl md:text-5xl font-black mb-2">{restaurant.name}</h1>
            <div className="flex items-center gap-4 flex-wrap">
              {avgRating && (
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur px-3 py-1 rounded-full">
                  <Star size={18} className="fill-yellow-400 text-yellow-400"/>
                  <span className="font-bold">{avgRating}</span>
                  {reviews.length > 0 && (
                    <span className="text-white/70 text-sm">({reviews.length})</span>
                  )}
                </div>
              )}
              {restaurant.city && (
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur px-3 py-1 rounded-full">
                  <MapPin size={18}/><span className="font-semibold">{restaurant.city}</span>
                </div>
              )}
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur px-3 py-1 rounded-full">
                <Clock size={18}/><span className="font-semibold">30–40 min</span>
              </div>
              <div className={`px-3 py-1 rounded-full font-bold text-sm ${restaurant.isOpen ? "bg-green-500" : "bg-red-500"}`}>
                {restaurant.isOpen ? "Open Now" : "Closed"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-lg p-2 mb-6 flex gap-2">
        {["menu","reviews"].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 px-6 py-3 rounded-xl font-bold transition capitalize ${
              activeTab === tab
                ? "bg-orange-500 text-white shadow-lg"
                : "text-gray-600 hover:bg-gray-100"
            }`}>
            {tab === "reviews" ? `Reviews (${reviews.length})` : "Menu"}
          </button>
        ))}
      </div>

      {/* ── MENU TAB ── */}
      {activeTab === "menu" ? (
        <>
          {/* Search + filter */}
          <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                <input type="text" placeholder="Search menu items…" value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"/>
              </div>
              <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none font-semibold">
                <option value="All">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.categoryID ?? cat.CategoryID} value={(cat.categoryID ?? cat.CategoryID)?.toString()}>
                    {cat.categoryName ?? cat.CategoryName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Menu items */}
          {filteredMenuItems.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
              <UtensilsCrossed size={64} className="mx-auto text-gray-300 mb-4"/>
              <p className="text-gray-500 font-semibold text-xl">No menu items found</p>
            </div>
          ) : (
            <div className="space-y-4 mb-24">
              {filteredMenuItems.map(item => {
                const itemId  = item.menuItemID ?? item.menuItemId ?? item.id ?? item.MenuItemID;
                const qty     = getCartItemQuantity(itemId);
                return (
                  <div key={itemId ?? item.menuItemName}
                    className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
                    <div className="flex gap-6">
                      <div className="w-32 h-32 rounded-xl overflow-hidden flex-shrink-0">
                        <img src={getFoodImage(item)} alt={item.menuItemName} className="w-full h-full object-cover"/>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-black text-gray-900 mb-2">{item.menuItemName}</h3>
                        {item.menuItemDescription && (
                          <p className="text-gray-600 mb-3 line-clamp-2">{item.menuItemDescription}</p>
                        )}
                        {item.categoryName && (
                          <p className="text-sm text-orange-600 font-semibold mb-3">{item.categoryName}</p>
                        )}
                        <div className="flex items-center justify-between">
                          <p className="text-2xl font-black text-gray-900">₹{item.menuItemPrice}</p>
                          {qty === 0 ? (
                            <button onClick={() => handleAddToCart(item)}
                              className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold transition shadow-lg">
                              <Plus size={20}/> Add
                            </button>
                          ) : (
                            <div className="flex items-center gap-4 bg-orange-100 rounded-xl px-4 py-2">
                              <button onClick={() => removeFromCart(itemId)}
                                className="w-8 h-8 flex items-center justify-center bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition">
                                <Minus size={18}/>
                              </button>
                              <span className="text-lg font-black text-gray-900 w-8 text-center">{qty}</span>
                              <button onClick={() => handleAddToCart(item)}
                                className="w-8 h-8 flex items-center justify-center bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition">
                                <Plus size={18}/>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        /* ── REVIEWS TAB ── */
        <div className="space-y-4 mb-24">
          {reviews.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
              <Star size={64} className="mx-auto text-gray-300 mb-4"/>
              <p className="text-gray-500 font-semibold text-xl">No reviews yet</p>
            </div>
          ) : (
            reviews.map(review => (
              <div key={review.reviewID ?? review.ReviewID} className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-bold text-gray-900 text-lg">
                      {review.userName ?? review.UserName ?? review.user?.userName ?? "Anonymous"}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      {[1,2,3,4,5].map(star => (
                        <Star key={star} size={18}
                          className={(review.rating ?? review.Rating ?? 0) >= star
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-gray-300"}/>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(review.createdAt ?? review.CreatedAt).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}
                  </p>
                </div>
                {(review.comment ?? review.Comment) && (
                  <p className="text-gray-700">{review.comment ?? review.Comment}</p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Floating cart bar */}
      {filteredCart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-2xl z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                Cart · {filteredCart.reduce((s,i)=>s+i.quantity,0)} item{filteredCart.reduce((s,i)=>s+i.quantity,0)!==1?"s":""}
              </p>
              <p className="text-2xl font-black text-gray-900">₹{cartTotal.toFixed(2)}</p>
            </div>
            <button onClick={() => navigate("/customer/cart")}
              className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-black text-lg transition shadow-lg hover:shadow-xl flex items-center gap-2">
              <ShoppingCart size={24}/> View Cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantDetail;