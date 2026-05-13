import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {

    const [cart, setCart] = useState(() => {
        try {
            const saved = localStorage.getItem("cart");
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });

    const [conflictModal, setConflictModal] = useState(null);

    const cartRef = useRef(cart);
    useEffect(() => { cartRef.current = cart; }, [cart]);
    useEffect(() => {
        try { localStorage.setItem("cart", JSON.stringify(cart)); }
        catch (err) { console.error(err); }
    }, [cart]);

    const addToCart = useCallback((item) => {
        const currentCart = cartRef.current;
        if (currentCart.length > 0) {
            const existingRestaurantID = Number(currentCart[0]?.restaurantID);
            const newRestaurantID = Number(item.restaurantID);
            if (existingRestaurantID !== newRestaurantID) {
                setConflictModal({
                    existingRestaurantName: currentCart[0]?.restaurantName || "another restaurant",
                    newItem: item,
                });
                return;
            }
        }
        setCart((prev) => {
            const existing = prev.find((i) => i.menuItemID === item.menuItemID);
            if (existing) {
                return prev.map((i) =>
                    i.menuItemID === item.menuItemID ? { ...i, quantity: i.quantity + 1 } : i
                );
            }
            return [...prev, { ...item, quantity: 1 }];
        });
    }, []);

    const confirmNewCart = useCallback(() => {
        if (!conflictModal) return;
        setCart([{ ...conflictModal.newItem, quantity: 1 }]);
        setConflictModal(null);
    }, [conflictModal]);

    const cancelConflict = useCallback(() => {
        setConflictModal(null);
    }, []);

    const removeFromCart = useCallback((menuItemID) => {
        setCart((prev) => {
            const existing = prev.find((i) => i.menuItemID === menuItemID);
            if (!existing) return prev;
            if (existing.quantity <= 1) return prev.filter((i) => i.menuItemID !== menuItemID);
            return prev.map((i) =>
                i.menuItemID === menuItemID ? { ...i, quantity: i.quantity - 1 } : i
            );
        });
    }, []);

    const updateQuantity = useCallback((menuItemID, newQuantity) => {
        if (newQuantity <= 0) {
            setCart((prev) => prev.filter((i) => i.menuItemID !== menuItemID));
        } else {
            setCart((prev) =>
                prev.map((i) => i.menuItemID === menuItemID ? { ...i, quantity: newQuantity } : i)
            );
        }
    }, []);

    const clearCart = useCallback(() => setCart([]), []);

    const getCartItemQuantity = useCallback((menuItemID) => {
        const item = cartRef.current.find((i) => i.menuItemID === menuItemID);
        return item ? item.quantity : 0;
    }, []);

    const getTotalPrice = useCallback(() =>
        cartRef.current.reduce((t, i) => t + i.menuItemPrice * i.quantity, 0), []);

    const getTotalQuantity = useCallback(() =>
        cartRef.current.reduce((t, i) => t + i.quantity, 0), []);

    return (
        <CartContext.Provider value={{
            cart, addToCart, removeFromCart, updateQuantity,
            clearCart, getCartItemQuantity, getTotalPrice, getTotalQuantity,
        }}>
            {children}
            {conflictModal && (
                <CartConflictModal
                    existingRestaurantName={conflictModal.existingRestaurantName}
                    onCancel={cancelConflict}
                    onConfirm={confirmNewCart}
                />
            )}
        </CartContext.Provider>
    );
};

const CartConflictModal = ({ existingRestaurantName, onCancel, onConfirm }) => (
    <div style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem",
    }}>
        <div style={{
            background: "#fff", borderRadius: "20px",
            padding: "28px 24px 22px", maxWidth: "360px", width: "100%",
            boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
        }}>
            <div style={{
                width: "48px", height: "48px", borderRadius: "50%",
                background: "#FAECE7", display: "flex",
                alignItems: "center", justifyContent: "center", marginBottom: "16px",
            }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                    stroke="#D85A30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
            </div>

            <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.07em",
                textTransform: "uppercase", color: "#9a8060", margin: "0 0 6px" }}>
                Items already in cart
            </p>
            <p style={{ fontSize: "17px", fontWeight: 700, color: "#1a1a1a", margin: "0 0 8px" }}>
                Your cart has items from<br />
                <span style={{ color: "#D85A30" }}>{existingRestaurantName}</span>
            </p>
            <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 24px", lineHeight: 1.6 }}>
                Adding this item will clear your current cart. Do you want to start a new cart?
            </p>

            <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={onCancel} style={{
                    flex: 1, padding: "12px", borderRadius: "12px",
                    border: "1.5px solid #e5e7eb", background: "#fff",
                    color: "#374151", fontSize: "14px", fontWeight: 600,
                    cursor: "pointer",
                }}>
                    Cancel
                </button>
                <button onClick={onConfirm} style={{
                    flex: 1, padding: "12px", borderRadius: "12px",
                    border: "none", background: "#D85A30",
                    color: "#fff", fontSize: "14px", fontWeight: 700,
                    cursor: "pointer",
                }}>
                    Start new cart
                </button>
            </div>
        </div>
    </div>
);

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart must be used within a CartProvider");
    return context;
};

export default CartContext;