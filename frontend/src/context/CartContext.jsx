import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const storedCart = localStorage.getItem('syseg_cart');
      return storedCart ? JSON.parse(storedCart) : [];
    } catch (error) {
      console.error("Error cargando carrito:", error);
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Persistencia
  useEffect(() => {
    localStorage.setItem('syseg_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const toggleCart = () => setIsCartOpen(!isCartOpen);

  const addToCart = (product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, { 
        ...product, 
        quantity: 1, 
        recipient: null // Estructura: { name, type, relation, address }
      }];
    });
    // setIsCartOpen(true); // Comentado para evitar que se abra automáticamente
  };

  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const updateRecipient = (productId, recipientData) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId ? { ...item, recipient: recipientData } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price || 0) * item.quantity, 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      isCartOpen,
      toggleCart,
      addToCart,
      removeFromCart,
      updateQuantity,
      updateRecipient,
      clearCart,
      getCartTotal,
      getCartCount
    }}>
      {children}
    </CartContext.Provider>
  );
};
