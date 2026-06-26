'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { products as initialProducts, Product } from '../data/products';
import { supabase } from '../utils/supabase/client';

// Configurable seller phone number (with country code, e.g., +91 for India)
const SELLER_WHATSAPP_NUMBER = '919876543210'; 

const formatCategory = (cat: string) => {
  if (cat === 'chaniya-choli') return 'Chaniya Choli';
  if (cat === 'home-decor') return 'Home Decor';
  if (cat === 'cushion-covers') return 'Cushion Covers';
  return cat;
};

export default function CatalogPage() {
  // --- States ---
  const [productsList, setProductsList] = useState<Product[]>(initialProducts);
  const [user, setUser] = useState<any | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeMedia, setActiveMedia] = useState<{type: 'image' | 'video', url: string} | null>(null);
  
  // Inquiry Modals
  const [inquiryProduct, setInquiryProduct] = useState<Product | null>(null);
  const [isBulkInquiry, setIsBulkInquiry] = useState<boolean>(false);
  const [showInquiryModal, setShowInquiryModal] = useState<boolean>(false);
  
  // Form fields
  const [userName, setUserName] = useState<string>('');
  const [userPhone, setUserPhone] = useState<string>('');
  const [customNotes, setCustomNotes] = useState<string>('');
  
  // Inquiry Bag (Cart)
  const [inquiryBag, setInquiryBag] = useState<Product[]>([]);
  const [isBagOpen, setIsBagOpen] = useState<boolean>(false);
  
  // Toast notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active detail tab for product modal
  const [activeDetailTab, setActiveDetailTab] = useState<'details' | 'highlights' | 'care'>('details');

  // Active sub-tab for specifications (Lehenga, Blouse, Dupatta)
  const [activeSpecSubTab, setActiveSpecSubTab] = useState<'lehenga' | 'blouse' | 'dupatta'>('lehenga');

  // Load products, user and sync bag on mount
  useEffect(() => {
    const initApp = async () => {
      setLoading(true);
      try {
        // 1. Fetch products from database
        const { data: dbProducts } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })
          .async();
        if (dbProducts && dbProducts.length > 0) {
          setProductsList(dbProducts);
        } else {
          // Fallback to initialProducts if database has 0 products
          setProductsList(initialProducts);
        }

        // 2. Fetch logged in session
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (currentUser) {
          setUser(currentUser);
          
          // Fetch additional profile data (role)
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', currentUser.id)
            .single();
          if (profile) setUserProfile(profile);

          // Sync database inquiry bag
          const { data: dbBag } = await supabase
            .from('inquiry_bag')
            .select('*')
            .eq('user_id', currentUser.id)
            .async();
          if (dbBag) setInquiryBag(dbBag);
        } else {
          // Local storage fallback for guests
          const guestBag = localStorage.getItem('chaniya_choli_inquiry_bag');
          if (guestBag) setInquiryBag(JSON.parse(guestBag));
        }
      } catch (err) {
        console.error("Initialization error", err);
      } finally {
        setLoading(false);
      }
    };
    initApp();
  }, []);

  // Sync inquiry bag to localStorage / database when it changes
  const saveBag = async (newBag: Product[]) => {
    setInquiryBag(newBag);
    if (user) {
      try {
        // Simple sync strategy: delete all and re-insert
        await supabase.from('inquiry_bag').delete().eq('user_id', user.id).async();
        
        if (newBag.length > 0) {
          const rows = newBag.map(item => ({
            user_id: user.id,
            product_id: item.id
          }));
          await supabase.from('inquiry_bag').insert(rows).async();
        }
      } catch (err) {
        console.error("Failed to sync bag with db", err);
      }
    } else {
      localStorage.setItem('chaniya_choli_inquiry_bag', JSON.stringify(newBag));
    }
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserProfile(null);
    setInquiryBag([]);
    localStorage.removeItem('chaniya_choli_inquiry_bag');
    triggerToast("Signed out successfully.");
  };

  // --- Handlers ---
  const handleAddToBag = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click trigger
    if (inquiryBag.some(item => item.id === product.id)) {
      triggerToast(`${product.name} is already in your inquiry bag!`);
      return;
    }
    const updated = [...inquiryBag, product];
    saveBag(updated);
    triggerToast(`Added ${product.name} to inquiry bag!`);
  };

  const handleRemoveFromBag = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = inquiryBag.filter(item => item.id !== productId);
    saveBag(updated);
    triggerToast("Item removed from bag.");
  };

  const openProductDetails = (product: Product) => {
    setSelectedProduct(product);
    setActiveDetailTab('details');
    setActiveSpecSubTab('lehenga');
    if (product.video) {
      setActiveMedia({ type: 'video', url: product.video });
    } else {
      setActiveMedia({ type: 'image', url: product.image });
    }
  };

  const closeProductDetails = () => {
    setSelectedProduct(null);
    setActiveMedia(null);
  };

  const openSingleInquiry = (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setInquiryProduct(product);
    setIsBulkInquiry(false);
    setCustomNotes('');
    setShowInquiryModal(true);
  };

  const openBulkInquiry = () => {
    if (inquiryBag.length === 0) return;
    setIsBulkInquiry(true);
    setInquiryProduct(null);
    setCustomNotes('');
    setIsBagOpen(false);
    setShowInquiryModal(true);
  };

  const closeInquiryModal = () => {
    setShowInquiryModal(false);
    setInquiryProduct(null);
    setIsBulkInquiry(false);
  };

  const handleSubmitInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) {
      alert("Please enter your name");
      return;
    }

    let messageText = '';
    
    if (isBulkInquiry) {
      // Formulate bulk WhatsApp message
      const itemsList = inquiryBag.map((item, index) => 
        `${index + 1}. *${item.name}* (ID: ${item.id}) - ₹${item.price.toLocaleString('en-IN')}`
      ).join('\n');

      messageText = `✨ *Magic Threads - Bulk Inquiry* ✨\n\n` +
        `Hello! I would like to inquire about the availability of the following items:\n\n` +
        `${itemsList}\n\n` +
        `*Customer Details:*\n` +
        `👤 *Name:* ${userName.trim()}\n` +
        (userPhone.trim() ? `📞 *Contact:* ${userPhone.trim()}\n` : '') +
        (customNotes.trim() ? `💬 *Customization/Message:* ${customNotes.trim()}\n` : '') +
        `\nCould you please share details on stock status and shipping? Thank you!`;
        
      // Clear bag after successful inquiry
      saveBag([]);
    } else if (inquiryProduct) {
      // Formulate single product WhatsApp message
      const currentUrl = window.location.origin + `/product/${inquiryProduct.id}`;
      messageText = `✨ *Magic Threads - Product Inquiry* ✨\n\n` +
        `Hello! I am interested in this item:\n\n` +
        `*Product:* ${inquiryProduct.name}\n` +
        `*Price:* ₹${inquiryProduct.price.toLocaleString('en-IN')} (Original: ₹${inquiryProduct.originalPrice.toLocaleString('en-IN')}, ${inquiryProduct.discount}% OFF)\n` +
        `*ID Code:* ${inquiryProduct.id}\n` +
        `*Fabric:* ${inquiryProduct.fabric}\n` +
        `*Work:* ${inquiryProduct.workType}\n` +
        `*Link:* ${currentUrl}\n\n` +
        `*Customer Details:*\n` +
        `👤 *Name:* ${userName.trim()}\n` +
        (userPhone.trim() ? `📞 *Contact:* ${userPhone.trim()}\n` : '') +
        (customNotes.trim() ? `💬 *Notes/Requirements:* ${customNotes.trim()}\n` : '') +
        `\nCan you confirm if this piece is available? Thank you!`;
    }

    // Generate WhatsApp url and open it in a new tab
    const encodedText = encodeURIComponent(messageText);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${SELLER_WHATSAPP_NUMBER}&text=${encodedText}`;
    
    window.open(whatsappUrl, '_blank');
    closeInquiryModal();
    triggerToast("Inquiry sent successfully via WhatsApp!");
  };

  // --- Filtering Logic ---
  const filteredProducts = useMemo(() => {
    return productsList.filter(product => {
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            product.workType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            product.fabric.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [productsList, selectedCategory, searchQuery]);

  return (
    <div className="app-container">
      {/* HEADER */}
      <header className="app-header">
        <div className="nav-container">
          <a href="#" className="brand-logo" id="header-logo-link" style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', textDecoration: 'none' }}>
            <img src="/images/logo.png" alt="Magic Threads Logo" style={{ width: '64px', height: '64px', borderRadius: '50%', border: '2px solid var(--color-gold)', boxShadow: '0 0 10px rgba(197, 155, 39, 0.3)' }} />
            <div>
              <span className="brand-logo-text" style={{ display: 'block', fontSize: '1.4rem', fontWeight: '700', letterSpacing: '1.5px' }}>MAGIC THREADS</span>
              <div className="brand-logo-sub" style={{ fontSize: '0.68rem', letterSpacing: '0.2px', textTransform: 'lowercase', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>where magic meets tradition</div>
            </div>
          </a>

          <nav>
            <ul className="nav-links">
              <li>
                <a href="#catalog" className="nav-link" onClick={() => setSelectedCategory('all')}>Catalog</a>
              </li>
              <li>
                <a href="#catalog" className="nav-link" onClick={() => setSelectedCategory('chaniya-choli')}>Chaniya Choli</a>
              </li>
              <li>
                <a href="#catalog" className="nav-link" onClick={() => setSelectedCategory('home-decor')}>Home Decor</a>
              </li>
              <li>
                <a href="#catalog" className="nav-link" onClick={() => setSelectedCategory('cushion-covers')}>Cushion Covers</a>
              </li>
            </ul>
          </nav>

          <div className="nav-actions">
            {/* User Profile / Auth links */}
            {user && (
              <div className="user-nav-profile" style={{ marginRight: '1rem' }}>
                {userProfile?.role === 'admin' && (
                  <a 
                    href="/admin" 
                    className="btn-admin-action btn-admin-primary" 
                    style={{ textDecoration: 'none', padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}
                  >
                    Admin Panel
                  </a>
                )}
                <span className="user-nav-email" style={{ fontSize: '0.85rem' }} title={user.email}>{user.email}</span>
                <button className="btn-signout" onClick={handleSignOut}>Sign Out</button>
              </div>
            )}

            <button 
              className="inquiry-badge-btn"
              id="inquiry-bag-trigger"
              onClick={() => setIsBagOpen(true)}
              aria-label="Open Inquiry Bag"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h14v12z"/>
              </svg>
              Inquiry Bag
              {inquiryBag.length > 0 && (
                <span className="badge-count" id="bag-count-badge">{inquiryBag.length}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-background-mandala" aria-hidden="true"></div>
        <div className="hero-content">
          <div className="hero-tagline">Exquisite Traditional Wear</div>
          <h1 className="hero-title">
            Celebrate Festivals in <span className="gold-gradient-text">Nine Colors of Elegance</span>
          </h1>
          <p className="hero-description">
            Explore premium handcrafted Chaniya Cholis, traditional Home Decor, and ethnic Cushion Covers. Choose your favorites and inquire instantly on WhatsApp.
          </p>
          <a href="#catalog" className="hero-cta-btn" id="explore-collection-btn">
            Explore Collection
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
            </svg>
          </a>
        </div>
      </section>

      {/* MAIN CATALOG */}
      <main className="main-content" id="catalog">
        {/* Filters and Search */}
        <section className="filter-section">
          <div className="search-bar-container">
            <span className="search-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
            </span>
            <input 
              type="text" 
              className="search-input"
              id="search-products-input"
              placeholder="Search by name, fabric, or work type..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="category-tabs">
            <button 
              className={`category-tab ${selectedCategory === 'all' ? 'active' : ''}`}
              id="filter-tab-all"
              onClick={() => setSelectedCategory('all')}
            >
              All Collection
            </button>
            <button 
              className={`category-tab ${selectedCategory === 'chaniya-choli' ? 'active' : ''}`}
              id="filter-tab-chaniya-choli"
              onClick={() => setSelectedCategory('chaniya-choli')}
            >
              Chaniya Choli
            </button>
            <button 
              className={`category-tab ${selectedCategory === 'home-decor' ? 'active' : ''}`}
              id="filter-tab-home-decor"
              onClick={() => setSelectedCategory('home-decor')}
            >
              Home Decor
            </button>
            <button 
              className={`category-tab ${selectedCategory === 'cushion-covers' ? 'active' : ''}`}
              id="filter-tab-cushion-covers"
              onClick={() => setSelectedCategory('cushion-covers')}
            >
              Cushion Covers
            </button>
          </div>
        </section>

        {/* Catalog Header */}
        <div className="catalog-header">
          <h2 className="catalog-title">Our Exclusive Pieces</h2>
          <p className="catalog-subtitle">Showing {filteredProducts.length} premium handcrafted designs</p>
        </div>

        {/* Product Grid */}
        <section className="product-grid">
          {filteredProducts.map((product) => (
            <article className="product-card" key={product.id}>
              {product.tag && <span className="product-tag">{product.tag}</span>}
              
              <div 
                className="product-image-container"
                onClick={() => openProductDetails(product)}
              >
                <Image 
                  src={product.image} 
                  alt={product.name}
                  width={350}
                  height={350}
                  className="product-image"
                />
              </div>

              <div className="product-info">
                <span className="product-category">{formatCategory(product.category)}</span>
                <h3 
                  className="product-name"
                  onClick={() => openProductDetails(product)}
                >
                  {product.name}
                </h3>
                <p className="product-work-type">{product.workType}</p>
                
                <div className="product-price-row">
                  <span className="product-price">₹{product.price.toLocaleString('en-IN')}</span>
                  <span className="product-original-price">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                  <span className="product-discount">({product.discount}% OFF)</span>
                </div>

                <div className="product-card-actions">
                  <button 
                    className="btn-details"
                    id={`btn-details-${product.id}`}
                    onClick={() => openProductDetails(product)}
                  >
                    View Specs
                  </button>
                  <button 
                    className="btn-inquire"
                    id={`btn-inquire-card-${product.id}`}
                    onClick={(e) => openSingleInquiry(product, e)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" style={{marginRight: '6px', verticalAlign: 'middle', flexShrink: 0}}>
                      <rect width="24" height="24" rx="6" fill="#25D366" />
                      <g transform="translate(4, 4)">
                        <path fill="#FFFFFF" d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.907h.004c4.368 0 7.926-3.558 7.93-7.93a7.9 7.9 0 0 0-2.327-5.643zM11.75 11.517a2.23 2.23 0 0 1-1.07.513c-.273.069-.51.137-.8.02-.284-.117-.508-.228-1.002-.556-1.032-.687-1.782-1.758-2.222-2.47-.07-.113-.098-.2-.04-.27.054-.067.118-.148.18-.22.062-.072.079-.123.117-.205.037-.082.02-.153-.01-.225-.03-.072-.27-.655-.37-.899-.098-.238-.198-.205-.27-.205a8.3 8.3 0 0 0-.414-.008c-.146 0-.383.056-.583.275-.2.22-.765.748-.765 1.823s.783 2.115.892 2.262c.11.147 1.54 2.352 3.732 3.298.52.224.927.359 1.243.46.523.167.997.143 1.374.088.42-.062 1.777-.726 2.027-1.428.25-.701.25-1.303.175-1.428-.075-.126-.27-.197-.57-.346z"/>
                      </g>
                    </svg>
                    Inquire
                  </button>
                </div>
                
                <button 
                  className="btn-add-bag"
                  style={{ width: '100%', marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  id={`btn-add-bag-${product.id}`}
                  onClick={(e) => handleAddToBag(product, e)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24" style={{marginRight: '6px', verticalAlign: 'middle'}}>
                    <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
                  </svg>
                  Add to Bag
                </button>
              </div>
            </article>
          ))}

          {filteredProducts.length === 0 && (
            <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '4rem 0', color: 'var(--color-text-muted)'}}>
              <p style={{fontSize: '1.2rem', marginBottom: '1rem'}}>No Chaniya Cholis found matching your search.</p>
              <button 
                className="category-tab"
                onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
              >
                Reset Filters
              </button>
            </div>
          )}
        </section>
      </main>

      {/* FOOTER */}
      <footer className="app-footer">
        <div className="footer-container">
          <div className="footer-brand">
            <span className="brand-logo-text" style={{fontSize: '2rem'}}>MAGIC THREADS</span>
            <div className="brand-logo-sub" style={{marginTop: '-6px', letterSpacing: '1px', textTransform: 'lowercase', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '0.95rem'}}>where magic meets tradition</div>
            <p className="footer-brand-desc" style={{marginTop: '1rem'}}>
              Elegance woven into threads. We specialize in bringing you the most beautiful, authentic, and modern Gujarati designer Chaniya Cholis for Navratri, weddings, and special events.
            </p>
          </div>

          <div className="footer-links-col">
            <h4 className="footer-col-title">Categories</h4>
            <ul className="footer-links">
              <li><a href="#catalog" onClick={() => setSelectedCategory('chaniya-choli')}>Chaniya Choli</a></li>
              <li><a href="#catalog" onClick={() => setSelectedCategory('home-decor')}>Home Decor</a></li>
              <li><a href="#catalog" onClick={() => setSelectedCategory('cushion-covers')}>Cushion Covers</a></li>
            </ul>
          </div>

          <div className="footer-links-col">
            <h4 className="footer-col-title">How to Order</h4>
            <div className="footer-contact-info">
              <p>1. Select your favorite Chaniya Cholis.</p>
              <p>2. Click <strong>Inquire Now</strong> or add multiple items to your <strong>Inquiry Bag</strong>.</p>
              <p>3. Submit the details form to launch WhatsApp.</p>
              <p>4. Chat with us to select custom blouse stitching and finalize delivery details!</p>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Magic Threads. All rights reserved.</p>
          <p>Handcrafted with Love for Navratri & Indian Weddings</p>
        </div>
      </footer>

      {/* PRODUCT DETAILS MODAL */}
      {selectedProduct && (
        <div 
          className="modal-backdrop"
          onClick={closeProductDetails}
          id="product-details-modal-backdrop"
        >
          <div 
            className="modal-window"
            onClick={(e) => e.stopPropagation()}
            id="product-details-modal-window"
          >
            <button 
              className="modal-close-btn"
              onClick={closeProductDetails}
              aria-label="Close Modal"
            >
              &times;
            </button>

            <div className="modal-content-details">
              <div className="modal-image-panel">
                <div className="modal-main-image-wrapper">
                  {activeMedia && activeMedia.type === 'video' ? (
                    <video 
                      src={activeMedia.url} 
                      controls 
                      autoPlay 
                      loop 
                      muted
                      className="modal-main-video"
                    />
                  ) : (
                    <Image 
                      src={activeMedia?.url || selectedProduct.image} 
                      alt={selectedProduct.name}
                      width={400}
                      height={500}
                      className="modal-main-image"
                      priority
                    />
                  )}
                </div>

                {/* Thumbnail Gallery (shown only if there are secondary images or a video) */}
                {((selectedProduct.images && selectedProduct.images.length > 0) || selectedProduct.video) && (
                  <div className="modal-thumbnails">
                    {/* Video Thumbnail (Shown First) */}
                    {selectedProduct.video && (
                      <div 
                        className={`thumbnail-item ${activeMedia?.type === 'video' ? 'active' : ''}`}
                        onClick={() => setActiveMedia({ type: 'video', url: selectedProduct.video! })}
                      >
                        <img 
                          src={selectedProduct.image} 
                          alt={`${selectedProduct.name} video preview`}
                          className="thumbnail-img"
                        />
                        <div className="thumbnail-video-overlay">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      </div>
                    )}

                    {/* Primary Image Thumbnail */}
                    <div 
                      className={`thumbnail-item ${activeMedia?.type === 'image' && activeMedia.url === selectedProduct.image ? 'active' : ''}`}
                      onClick={() => setActiveMedia({ type: 'image', url: selectedProduct.image })}
                    >
                      <img 
                        src={selectedProduct.image} 
                        alt={`${selectedProduct.name} main`}
                        className="thumbnail-img"
                      />
                    </div>

                    {/* Secondary Images Thumbnails */}
                    {selectedProduct.images && selectedProduct.images.map((imgUrl, idx) => {
                      // Skip if it is the same as primary image (since we already displayed it)
                      if (imgUrl === selectedProduct.image) return null;
                      return (
                        <div 
                          key={idx}
                          className={`thumbnail-item ${activeMedia?.type === 'image' && activeMedia.url === imgUrl ? 'active' : ''}`}
                          onClick={() => setActiveMedia({ type: 'image', url: imgUrl })}
                        >
                          <img 
                            src={imgUrl} 
                            alt={`${selectedProduct.name} gallery ${idx + 1}`}
                            className="thumbnail-img"
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="modal-info-panel">
                <div className="modal-title-row">
                  <span className="product-category">{formatCategory(selectedProduct.category)}</span>
                  <h2 className="modal-title">{selectedProduct.name}</h2>
                </div>

                <div className="modal-price-row">
                  <span className="product-price" style={{fontSize: '2rem'}}>₹{selectedProduct.price.toLocaleString('en-IN')}</span>
                  <span className="product-original-price" style={{fontSize: '1.2rem'}}>₹{selectedProduct.originalPrice.toLocaleString('en-IN')}</span>
                  <span className="product-discount" style={{fontSize: '1.1rem'}}>({selectedProduct.discount}% OFF)</span>
                </div>

                <p className="modal-desc">{selectedProduct.description}</p>

                {/* Tabs Selector (Only shown if product has lehengaDetails) */}
                {selectedProduct.lehengaDetails ? (
                  <div className="product-details-tabs">
                    <button 
                      className={`details-tab-btn ${activeDetailTab === 'details' ? 'active' : ''}`}
                      onClick={() => setActiveDetailTab('details')}
                    >
                      Specifications
                    </button>
                    {selectedProduct.highlights && (
                      <button 
                        className={`details-tab-btn ${activeDetailTab === 'highlights' ? 'active' : ''}`}
                        onClick={() => setActiveDetailTab('highlights')}
                      >
                        Highlights
                      </button>
                    )}
                    {selectedProduct.careInstructions && (
                      <button 
                        className={`details-tab-btn ${activeDetailTab === 'care' ? 'active' : ''}`}
                        onClick={() => setActiveDetailTab('care')}
                      >
                        Care & Note
                      </button>
                    )}
                  </div>
                ) : (
                  <h4 style={{fontFamily: 'var(--font-sans)', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.5rem', fontWeight: 600}}>
                    Product Specifications
                  </h4>
                )}
                
                {/* Tab content rendering */}
                {selectedProduct.lehengaDetails ? (
                  <div style={{ marginBottom: '1.5rem', flexGrow: 1, overflowY: 'auto', paddingRight: '4px' }}>
                    {activeDetailTab === 'details' && (
                      <div className="tab-pane-content">
                        {/* Sub-tabs Selector for Lehenga/Blouse/Dupatta */}
                        <div className="spec-sub-tabs">
                          <button 
                            className={`sub-tab-btn ${activeSpecSubTab === 'lehenga' ? 'active' : ''}`}
                            onClick={() => setActiveSpecSubTab('lehenga')}
                          >
                            👗 Lehenga
                          </button>
                          <button 
                            className={`sub-tab-btn ${activeSpecSubTab === 'blouse' ? 'active' : ''}`}
                            onClick={() => setActiveSpecSubTab('blouse')}
                          >
                            👚 Blouse
                          </button>
                          <button 
                            className={`sub-tab-btn ${activeSpecSubTab === 'dupatta' ? 'active' : ''}`}
                            onClick={() => setActiveSpecSubTab('dupatta')}
                          >
                            🧣 Dupatta
                          </button>
                        </div>

                        {/* Lehenga Details */}
                        {activeSpecSubTab === 'lehenga' && selectedProduct.lehengaDetails && (
                          <div className="spec-section-card">
                            <h5 className="spec-section-title">👗 Lehenga (Skirt) Details</h5>
                            <table className="specs-table" style={{ marginBottom: 0 }}>
                              <tbody>
                                {selectedProduct.lehengaDetails.fabric && (
                                  <tr>
                                    <td className="spec-label">Fabric</td>
                                    <td className="spec-val">{selectedProduct.lehengaDetails.fabric}</td>
                                  </tr>
                                )}
                                {selectedProduct.lehengaDetails.color && (
                                  <tr>
                                    <td className="spec-label">Colour</td>
                                    <td className="spec-val">{selectedProduct.lehengaDetails.color}</td>
                                  </tr>
                                )}
                                {selectedProduct.lehengaDetails.flair && (
                                  <tr>
                                    <td className="spec-label">Flair</td>
                                    <td className="spec-val">{selectedProduct.lehengaDetails.flair}</td>
                                  </tr>
                                )}
                                {selectedProduct.lehengaDetails.waist && (
                                  <tr>
                                    <td className="spec-label">Waist Size</td>
                                    <td className="spec-val">{selectedProduct.lehengaDetails.waist}</td>
                                  </tr>
                                )}
                                {selectedProduct.lehengaDetails.length && (
                                  <tr>
                                    <td className="spec-label">Length</td>
                                    <td className="spec-val">{selectedProduct.lehengaDetails.length}</td>
                                  </tr>
                                )}
                                {selectedProduct.lehengaDetails.work && (
                                  <tr>
                                    <td className="spec-label">Work / Art</td>
                                    <td className="spec-val">{selectedProduct.lehengaDetails.work}</td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {/* Blouse Details */}
                        {activeSpecSubTab === 'blouse' && selectedProduct.blouseDetails && (
                          <div className="spec-section-card">
                            <h5 className="spec-section-title">👚 Blouse (Choli) Details</h5>
                            <table className="specs-table" style={{ marginBottom: 0 }}>
                              <tbody>
                                {selectedProduct.blouseDetails.fabric && (
                                  <tr>
                                    <td className="spec-label">Fabric</td>
                                    <td className="spec-val">{selectedProduct.blouseDetails.fabric}</td>
                                  </tr>
                                )}
                                {selectedProduct.blouseDetails.color && (
                                  <tr>
                                    <td className="spec-label">Colour</td>
                                    <td className="spec-val">{selectedProduct.blouseDetails.color}</td>
                                  </tr>
                                )}
                                {selectedProduct.blouseDetails.style && (
                                  <tr>
                                    <td className="spec-label">Style</td>
                                    <td className="spec-val">{selectedProduct.blouseDetails.style}</td>
                                  </tr>
                                )}
                                {selectedProduct.blouseDetails.sleeves && (
                                  <tr>
                                    <td className="spec-label">Sleeves</td>
                                    <td className="spec-val">{selectedProduct.blouseDetails.sleeves}</td>
                                  </tr>
                                )}
                                {selectedProduct.blouseDetails.size && (
                                  <tr>
                                    <td className="spec-label">Size</td>
                                    <td className="spec-val">{selectedProduct.blouseDetails.size}</td>
                                  </tr>
                                )}
                                {selectedProduct.blouseDetails.work && (
                                  <tr>
                                    <td className="spec-label">Work / Art</td>
                                    <td className="spec-val">{selectedProduct.blouseDetails.work}</td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {/* Dupatta Details */}
                        {activeSpecSubTab === 'dupatta' && selectedProduct.dupattaDetails && (
                          <div className="spec-section-card">
                            <h5 className="spec-section-title">🧣 Dupatta (Odhani) Details</h5>
                            <table className="specs-table" style={{ marginBottom: 0 }}>
                              <tbody>
                                {selectedProduct.dupattaDetails.fabric && (
                                  <tr>
                                    <td className="spec-label">Fabric</td>
                                    <td className="spec-val">{selectedProduct.dupattaDetails.fabric}</td>
                                  </tr>
                                )}
                                {selectedProduct.dupattaDetails.color && (
                                  <tr>
                                    <td className="spec-label">Colour</td>
                                    <td className="spec-val">{selectedProduct.dupattaDetails.color}</td>
                                  </tr>
                                )}
                                {selectedProduct.dupattaDetails.length && (
                                  <tr>
                                    <td className="spec-label">Length</td>
                                    <td className="spec-val">{selectedProduct.dupattaDetails.length}</td>
                                  </tr>
                                )}
                                {selectedProduct.dupattaDetails.work && (
                                  <tr>
                                    <td className="spec-label">Work / Art</td>
                                    <td className="spec-val">{selectedProduct.dupattaDetails.work}</td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        )}
                        {selectedProduct.weight && (
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.75rem 1rem',
                            background: 'rgba(212, 175, 55, 0.08)',
                            border: '1px solid rgba(212, 175, 55, 0.25)',
                            borderRadius: '8px',
                            marginTop: '1.2rem',
                            fontFamily: 'var(--font-sans)',
                            fontSize: '0.9rem'
                          }}>
                            <span style={{ fontWeight: 600, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              ⚖ Set Weight (Full Product)
                            </span>
                            <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
                              {selectedProduct.weight}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {activeDetailTab === 'highlights' && (
                      <div className="tab-pane-content">
                        {selectedProduct.styleStatement && (
                          <blockquote className="festive-quote">
                            <p>{selectedProduct.styleStatement}</p>
                            <cite>✨ Festive Style Statement</cite>
                          </blockquote>
                        )}

                        {selectedProduct.highlights && selectedProduct.highlights.length > 0 && (
                          <div className="highlights-section-card">
                            <h5 className="spec-section-title">✨ Highlights</h5>
                            <ul className="highlights-list">
                              {selectedProduct.highlights.map((hl, index) => (
                                <li key={index}>
                                  <span className="check-icon">✔</span>
                                  <span>{hl}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {activeDetailTab === 'care' && (
                      <div className="tab-pane-content">
                        {selectedProduct.careInstructions && selectedProduct.careInstructions.length > 0 && (
                          <div className="care-section-card">
                            <h5 className="spec-section-title">🧺 Care Instructions</h5>
                            <ul className="care-list">
                              {selectedProduct.careInstructions.map((care, index) => (
                                <li key={index}>
                                  <span className="bullet-icon">•</span>
                                  <span>{care}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {selectedProduct.note && (
                          <div className="note-section-card">
                            <h5 className="spec-section-title">📌 Important Note</h5>
                            <p className="note-text">{selectedProduct.note}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Fallback to simple Specs Table for products without detailed fields */
                  <table className="specs-table">
                    <tbody>
                      <tr>
                        <td className="spec-label">Fabric / Material</td>
                        <td className="spec-val">{selectedProduct.fabric}</td>
                      </tr>
                      <tr>
                        <td className="spec-label">Embroidery & Work</td>
                        <td className="spec-val">{selectedProduct.workType}</td>
                      </tr>
                      <tr>
                        <td className="spec-label">Lehenga Ghera (Flare)</td>
                        <td className="spec-val">{selectedProduct.flare}</td>
                      </tr>
                      <tr>
                        <td className="spec-label">Blouse Style</td>
                        <td className="spec-val">{selectedProduct.blouse}</td>
                      </tr>
                      <tr>
                        <td className="spec-label">Dupatta Detail</td>
                        <td className="spec-val">{selectedProduct.dupatta}</td>
                      </tr>
                      {selectedProduct.weight && (
                        <tr>
                          <td className="spec-label">Product Weight</td>
                          <td className="spec-val">{selectedProduct.weight}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}



                 <div style={{display: 'flex', gap: '1rem', marginTop: 'auto'}}>
                  <button 
                    className="btn-inquire"
                    style={{flexGrow: 2, padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'}}
                    id="modal-inquire-now-btn"
                    onClick={() => {
                      // Open inquiry
                      setInquiryProduct(selectedProduct);
                      setIsBulkInquiry(false);
                      setShowInquiryModal(true);
                      closeProductDetails();
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" style={{flexShrink: 0}}>
                      <rect width="24" height="24" rx="6" fill="#25D366" />
                      <g transform="translate(4, 4)">
                        <path fill="#FFFFFF" d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.907h.004c4.368 0 7.926-3.558 7.93-7.93a7.9 7.9 0 0 0-2.327-5.643zM11.75 11.517a2.23 2.23 0 0 1-1.07.513c-.273.069-.51.137-.8.02-.284-.117-.508-.228-1.002-.556-1.032-.687-1.782-1.758-2.222-2.47-.07-.113-.098-.2-.04-.27.054-.067.118-.148.18-.22.062-.072.079-.123.117-.205.037-.082.02-.153-.01-.225-.03-.072-.27-.655-.37-.899-.098-.238-.198-.205-.27-.205a8.3 8.3 0 0 0-.414-.008c-.146 0-.383.056-.583.275-.2.22-.765.748-.765 1.823s.783 2.115.892 2.262c.11.147 1.54 2.352 3.732 3.298.52.224.927.359 1.243.46.523.167.997.143 1.374.088.42-.062 1.777-.726 2.027-1.428.25-.701.25-1.303.175-1.428-.075-.126-.27-.197-.57-.346z"/>
                      </g>
                    </svg>
                    Inquire on WhatsApp
                  </button>
                  
                  <button
                    className="btn-add-bag"
                    style={{flexGrow: 1, padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'}}
                    id="modal-add-bag-btn"
                    onClick={(e) => {
                      handleAddToBag(selectedProduct, e);
                      closeProductDetails();
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
                    </svg>
                    Add to Bag
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INQUIRY FORM MODAL */}
      {showInquiryModal && (
        <div 
          className="modal-backdrop"
          onClick={closeInquiryModal}
          id="inquiry-form-modal-backdrop"
        >
          <div 
            className="modal-window modal-window-small"
            onClick={(e) => e.stopPropagation()}
            id="inquiry-form-modal-window"
          >
            <button 
              className="modal-close-btn"
              onClick={closeInquiryModal}
              aria-label="Close Modal"
            >
              &times;
            </button>

            <div className="inquiry-form-header">
              <h2 className="inquiry-form-title">
                {isBulkInquiry ? "Send Bulk Inquiry" : "Send Product Inquiry"}
              </h2>
              <p className="inquiry-form-sub">
                {isBulkInquiry 
                  ? `Inquiring about ${inquiryBag.length} Chaniya Cholis` 
                  : `For: ${inquiryProduct?.name}`}
              </p>
            </div>

            <form onSubmit={handleSubmitInquiry} className="inquiry-form">
              {/* Product summary card (Only for single product) */}
              {!isBulkInquiry && inquiryProduct && (
                <div className="product-summary-card">
                  <div className="product-summary-img-wrapper">
                    <Image 
                      src={inquiryProduct.image} 
                      alt={inquiryProduct.name}
                      width={60}
                      height={60}
                      className="product-summary-img"
                    />
                  </div>
                  <div className="product-summary-details">
                    <span className="product-summary-name">{inquiryProduct.name}</span>
                    <span className="product-summary-price">₹{inquiryProduct.price.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="inquiry-user-name">Your Full Name *</label>
                <input 
                  type="text" 
                  id="inquiry-user-name" 
                  className="form-input"
                  placeholder="Enter your name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="inquiry-user-phone">WhatsApp Number (Optional)</label>
                <input 
                  type="tel" 
                  id="inquiry-user-phone" 
                  className="form-input"
                  placeholder="e.g. +91 98765 43210"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                />
              </div>



              <div className="form-group">
                <label className="form-label" htmlFor="inquiry-user-notes">Custom Notes / Special Instructions</label>
                <textarea 
                  id="inquiry-user-notes" 
                  className="form-input form-textarea"
                  placeholder="Any customization requirements (e.g. neck depth, sleeve length, borders, or general questions)..."
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                className="btn-submit-inquiry"
                id="submit-whatsapp-inquiry-btn"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" style={{marginRight: '8px', flexShrink: 0}}>
                  <rect width="24" height="24" rx="6" fill="#25D366" />
                  <g transform="translate(4, 4)">
                    <path fill="#FFFFFF" d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.907h.004c4.368 0 7.926-3.558 7.93-7.93a7.9 7.9 0 0 0-2.327-5.643zM11.75 11.517a2.23 2.23 0 0 1-1.07.513c-.273.069-.51.137-.8.02-.284-.117-.508-.228-1.002-.556-1.032-.687-1.782-1.758-2.222-2.47-.07-.113-.098-.2-.04-.27.054-.067.118-.148.18-.22.062-.072.079-.123.117-.205.037-.082.02-.153-.01-.225-.03-.072-.27-.655-.37-.899-.098-.238-.198-.205-.27-.205a8.3 8.3 0 0 0-.414-.008c-.146 0-.383.056-.583.275-.2.22-.765.748-.765 1.823s.783 2.115.892 2.262c.11.147 1.54 2.352 3.732 3.298.52.224.927.359 1.243.46.523.167.997.143 1.374.088.42-.062 1.777-.726 2.027-1.428.25-.701.25-1.303.175-1.428-.075-.126-.27-.197-.57-.346z"/>
                  </g>
                </svg>
                Open WhatsApp & Chat
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SLIDE-OVER INQUIRY BAG PANEL */}
      {isBagOpen && (
        <div 
          className="modal-backdrop"
          onClick={() => setIsBagOpen(false)}
          id="cart-panel-backdrop"
          style={{padding: 0, justifyContent: 'flex-end'}}
        >
          <div 
            className="cart-panel"
            onClick={(e) => e.stopPropagation()}
            id="cart-panel-window"
          >
            <div className="cart-header">
              <h2 className="cart-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="var(--color-gold)" viewBox="0 0 24 24">
                  <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h14v12z"/>
                </svg>
                Inquiry Bag
              </h2>
              <button 
                className="modal-close-btn"
                style={{position: 'static', width: '30px', height: '30px'}}
                onClick={() => setIsBagOpen(false)}
              >
                &times;
              </button>
            </div>

            <div className="cart-items-list">
              {inquiryBag.map((item) => (
                <div className="cart-item" key={item.id}>
                  <div className="cart-item-img-wrapper">
                    <Image 
                      src={item.image} 
                      alt={item.name}
                      width={70}
                      height={70}
                      className="cart-item-img"
                    />
                  </div>
                  <div className="cart-item-details">
                    <span className="cart-item-name">{item.name}</span>
                    <span className="cart-item-price">₹{item.price.toLocaleString('en-IN')}</span>
                    <span className="cart-item-meta">{item.fabric}</span>
                  </div>
                  <button 
                    className="cart-item-remove-btn"
                    id={`btn-remove-item-${item.id}`}
                    onClick={(e) => handleRemoveFromBag(item.id, e)}
                    aria-label="Remove item"
                  >
                    &times;
                  </button>
                </div>
              ))}

              {inquiryBag.length === 0 && (
                <div className="empty-cart-view">
                  <span className="empty-cart-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h14v12z"/>
                    </svg>
                  </span>
                  <p>Your inquiry bag is empty.</p>
                  <p style={{fontSize: '0.85rem', color: 'var(--color-text-muted)'}}>
                    Add pieces from our catalog to inquire about them together!
                  </p>
                </div>
              )}
            </div>

            {inquiryBag.length > 0 && (
              <div className="cart-footer">
                <div className="cart-total-row">
                  <span>Selected Items:</span>
                  <span>{inquiryBag.length} Pieces</span>
                </div>
                <div className="cart-total-row" style={{color: 'var(--color-gold-bright)'}}>
                  <span>Est. Value:</span>
                  <span>₹{inquiryBag.reduce((total, item) => total + item.price, 0).toLocaleString('en-IN')}</span>
                </div>
                <button 
                  className="btn-submit-inquiry"
                  style={{marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'}}
                  id="bulk-inquiry-proceed-btn"
                  onClick={openBulkInquiry}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" style={{flexShrink: 0}}>
                    <rect width="24" height="24" rx="6" fill="#25D366" />
                    <g transform="translate(4, 4)">
                      <path fill="#FFFFFF" d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.907h.004c4.368 0 7.926-3.558 7.93-7.93a7.9 7.9 0 0 0-2.327-5.643zM11.75 11.517a2.23 2.23 0 0 1-1.07.513c-.273.069-.51.137-.8.02-.284-.117-.508-.228-1.002-.556-1.032-.687-1.782-1.758-2.222-2.47-.07-.113-.098-.2-.04-.27.054-.067.118-.148.18-.22.062-.072.079-.123.117-.205.037-.082.02-.153-.01-.225-.03-.072-.27-.655-.37-.899-.098-.238-.198-.205-.27-.205a8.3 8.3 0 0 0-.414-.008c-.146 0-.383.056-.583.275-.2.22-.765.748-.765 1.823s.783 2.115.892 2.262c.11.147 1.54 2.352 3.732 3.298.52.224.927.359 1.243.46.523.167.997.143 1.374.088.42-.062 1.777-.726 2.027-1.428.25-.701.25-1.303.175-1.428-.075-.126-.27-.197-.57-.346z"/>
                    </g>
                  </svg>
                  Inquire All via WhatsApp
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TOAST SYSTEM */}
      {toastMessage && (
        <div className="toast-message" id="toast-notification">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="var(--color-gold-bright)" viewBox="0 0 24 24">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
          {toastMessage}
        </div>
      )}
    </div>
  );
}
