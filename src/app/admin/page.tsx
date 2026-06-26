'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase, uploadProductImage } from '../../utils/supabase/client';
import { Product } from '../../data/products';

const formatCategory = (cat: string) => {
  if (cat === 'chaniya-choli') return 'Chaniya Choli';
  if (cat === 'home-decor') return 'Home Decor';
  if (cat === 'cushion-covers') return 'Cushion Covers';
  return cat;
};

export default function AdminPage() {
  const router = useRouter();
  
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  
  // Dashboard Data
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [totalUsersCount, setTotalUsersCount] = useState<number>(0);
  const [loadingData, setLoadingData] = useState<boolean>(true);

  // Form Fields for new item
  const [itemId, setItemId] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState<'chaniya-choli' | 'home-decor' | 'cushion-covers'>('chaniya-choli');
  const [itemPrice, setItemPrice] = useState('');
  const [itemOriginalPrice, setItemOriginalPrice] = useState('');
  const [itemFabric, setItemFabric] = useState('');
  const [itemWorkType, setItemWorkType] = useState('');
  const [itemFlare, setItemFlare] = useState('');
  const [itemBlouse, setItemBlouse] = useState('');
  const [itemDupatta, setItemDupatta] = useState('');
  const [itemTag, setItemTag] = useState('');
  const [itemWeight, setItemWeight] = useState('');
  const [itemImage, setItemImage] = useState('/images/navratri.png'); // Default preset
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [itemImages, setItemImages] = useState<string[]>([]);
  const [itemVideo, setItemVideo] = useState<string>('');
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviewUrls, setGalleryPreviewUrls] = useState<string[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [itemDescription, setItemDescription] = useState('');

  // Form tab selection state
  const [activeFormTab, setActiveFormTab] = useState<'basic' | 'lehenga' | 'blouse' | 'dupatta' | 'extra'>('basic');

  // Detailed Specifications state variables
  const [lehengaFabric, setLehengaFabric] = useState('');
  const [lehengaColor, setLehengaColor] = useState('');
  const [lehengaFlair, setLehengaFlair] = useState('');
  const [lehengaWaist, setLehengaWaist] = useState('');
  const [lehengaLength, setLehengaLength] = useState('');
  const [lehengaWork, setLehengaWork] = useState('');

  const [blouseFabric, setBlouseFabric] = useState('');
  const [blouseColor, setBlouseColor] = useState('');
  const [blouseStyle, setBlouseStyle] = useState('');
  const [blouseSleeves, setBlouseSleeves] = useState('');
  const [blouseSize, setBlouseSize] = useState('');
  const [blouseWork, setBlouseWork] = useState('');

  const [dupattaFabric, setDupattaFabric] = useState('');
  const [dupattaColor, setDupattaColor] = useState('');
  const [dupattaLength, setDupattaLength] = useState('');
  const [dupattaWork, setDupattaWork] = useState('');

  const [highlightsInput, setHighlightsInput] = useState('');
  const [careInstructionsInput, setCareInstructionsInput] = useState('');
  const [itemNote, setItemNote] = useState('');
  const [itemStyleStatement, setItemStyleStatement] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const filesArray = Array.from(files);
      setGalleryFiles(filesArray);
      const urls = filesArray.map(file => URL.createObjectURL(file));
      setGalleryPreviewUrls(urls);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Status messages
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  // Check auth and role on mount
  useEffect(() => {
    const checkAdminSession = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsAdmin(false);
          router.push('/auth');
          return;
        }

        setUserEmail(user.email || '');

        // Fetch user profile role
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error || !profile || profile.role !== 'admin') {
          setIsAdmin(false);
        } else {
          setIsAdmin(true);
          fetchDashboardData();
        }
      } catch (err) {
        setIsAdmin(false);
      }
    };

    checkAdminSession();
  }, [router]);

  // Fetch products and user count
  const fetchDashboardData = async () => {
    setLoadingData(true);
    try {
      // Fetch products
      const { data: products, error: pError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .async(); // Uses helper in mock/real client
      
      if (!pError && products) {
        setProductsList(products);
      }

      // Fetch user profile count
      const { data: profiles, error: uError } = await supabase
        .from('profiles')
        .select('*')
        .async();
      
      if (!uError && profiles) {
        setTotalUsersCount(profiles.length);
      }
    } catch (e) {
      console.error("Failed to fetch admin stats", e);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleEditClick = (product: Product) => {
    setIsEditMode(true);
    setItemId(product.id);
    setItemName(product.name);
    setItemCategory(product.category as any);
    setItemPrice(product.price.toString());
    setItemOriginalPrice(product.originalPrice.toString());
    setItemFabric(product.fabric);
    setItemWorkType(product.workType);
    setItemFlare(product.flare || '');
    setItemBlouse(product.blouse || '');
    setItemDupatta(product.dupatta || '');
    setItemTag(product.tag || '');
    setItemWeight(product.weight || '');
    setItemImage(product.image);
    setItemImages(product.images || []);
    setItemVideo(product.video || '');
    setItemDescription(product.description);
    setImageFile(null);
    setImagePreviewUrl(null);
    setGalleryFiles([]);
    setGalleryPreviewUrls([]);
    setVideoFile(null);
    setVideoPreviewUrl(null);
    setFormMessage(null);
    setFormError(false);

    // Populate Detailed Specifications
    setLehengaFabric(product.lehengaDetails?.fabric || '');
    setLehengaColor(product.lehengaDetails?.color || '');
    setLehengaFlair(product.lehengaDetails?.flair || '');
    setLehengaWaist(product.lehengaDetails?.waist || '');
    setLehengaLength(product.lehengaDetails?.length || '');
    setLehengaWork(product.lehengaDetails?.work || '');

    setBlouseFabric(product.blouseDetails?.fabric || '');
    setBlouseColor(product.blouseDetails?.color || '');
    setBlouseStyle(product.blouseDetails?.style || '');
    setBlouseSleeves(product.blouseDetails?.sleeves || '');
    setBlouseSize(product.blouseDetails?.size || '');
    setBlouseWork(product.blouseDetails?.work || '');

    setDupattaFabric(product.dupattaDetails?.fabric || '');
    setDupattaColor(product.dupattaDetails?.color || '');
    setDupattaLength(product.dupattaDetails?.length || '');
    setDupattaWork(product.dupattaDetails?.work || '');

    setHighlightsInput(product.highlights ? product.highlights.join('\n') : '');
    setCareInstructionsInput(product.careInstructions ? product.careInstructions.join('\n') : '');
    setItemNote(product.note || '');
    setItemStyleStatement(product.styleStatement || '');
    
    setActiveFormTab('basic');

    // Scroll to form smoothly
    const formElement = document.querySelector('.admin-form-panel');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setItemId('');
    setItemName('');
    setItemCategory('chaniya-choli');
    setItemPrice('');
    setItemOriginalPrice('');
    setItemFabric('');
    setItemWorkType('');
    setItemFlare('');
    setItemBlouse('');
    setItemDupatta('');
    setItemTag('');
    setItemWeight('');
    setItemImage('/images/navratri.png');
    setItemImages([]);
    setItemVideo('');
    setItemDescription('');
    setImageFile(null);
    setImagePreviewUrl(null);
    setGalleryFiles([]);
    setGalleryPreviewUrls([]);
    setVideoFile(null);
    setVideoPreviewUrl(null);
    setFormMessage(null);
    setFormError(false);

    // Reset Detailed Specifications
    setLehengaFabric('');
    setLehengaColor('');
    setLehengaFlair('');
    setLehengaWaist('');
    setLehengaLength('');
    setLehengaWork('');

    setBlouseFabric('');
    setBlouseColor('');
    setBlouseStyle('');
    setBlouseSleeves('');
    setBlouseSize('');
    setBlouseWork('');

    setDupattaFabric('');
    setDupattaColor('');
    setDupattaLength('');
    setDupattaWork('');

    setHighlightsInput('');
    setCareInstructionsInput('');
    setItemNote('');
    setItemStyleStatement('');
    
    setActiveFormTab('basic');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormMessage(null);
    setFormError(false);

    // Basic Validation
    if (!itemId.trim() || !itemName.trim() || !itemPrice || !itemOriginalPrice || !itemFabric.trim() || !itemWorkType.trim()) {
      setFormError(true);
      setFormMessage("Please fill in all required fields (*).");
      return;
    }

    // ID Format Validation (only for new creations)
    if (!isEditMode) {
      if (!/^[a-zA-Z0-9_-]+$/.test(itemId)) {
        setFormError(true);
        setFormMessage("ID Code must contain only alphanumeric characters, dashes, or underscores (e.g., cc-007).");
        return;
      }

      if (productsList.some(p => p.id.toLowerCase() === itemId.toLowerCase())) {
        setFormError(true);
        setFormMessage(`Product with ID Code "${itemId}" already exists in the catalog.`);
        return;
      }
    }

    setSubmitting(true);

    const priceNum = parseFloat(itemPrice);
    const originalPriceNum = parseFloat(itemOriginalPrice);
    const discountPercent = Math.round(((originalPriceNum - priceNum) / originalPriceNum) * 100);

    try {
      let imageUrl = itemImage;
      
      // 1. Upload main thumbnail file if selected
      if (imageFile) {
        setFormMessage("Uploading primary product photo...");
        imageUrl = await uploadProductImage(imageFile);
      }

      // 2. Upload multiple gallery files if selected
      let uploadedGalleryUrls: string[] = [...itemImages];
      if (galleryFiles && galleryFiles.length > 0) {
        setFormMessage(`Uploading ${galleryFiles.length} gallery images...`);
        uploadedGalleryUrls = [];
        for (let i = 0; i < galleryFiles.length; i++) {
          const file = galleryFiles[i];
          const url = await uploadProductImage(file);
          uploadedGalleryUrls.push(url);
        }
      }

      // 3. Upload video file if selected
      let uploadedVideoUrl = itemVideo;
      if (videoFile) {
        setFormMessage("Uploading product video...");
        uploadedVideoUrl = await uploadProductImage(videoFile);
      }

      // Construct detailed spec fields only if they have entries
      const lehengaDetailsObj = {
        fabric: lehengaFabric.trim() || undefined,
        color: lehengaColor.trim() || undefined,
        flair: lehengaFlair.trim() || undefined,
        waist: lehengaWaist.trim() || undefined,
        length: lehengaLength.trim() || undefined,
        work: lehengaWork.trim() || undefined,
      };

      const blouseDetailsObj = {
        fabric: blouseFabric.trim() || undefined,
        color: blouseColor.trim() || undefined,
        style: blouseStyle.trim() || undefined,
        sleeves: blouseSleeves.trim() || undefined,
        size: blouseSize.trim() || undefined,
        work: blouseWork.trim() || undefined,
      };

      const dupattaDetailsObj = {
        fabric: dupattaFabric.trim() || undefined,
        color: dupattaColor.trim() || undefined,
        length: dupattaLength.trim() || undefined,
        work: dupattaWork.trim() || undefined,
      };

      // Helper to check if any properties in object are defined
      const hasAnyValue = (obj: any) => Object.values(obj).some(val => val !== undefined);

      const productPayload: Product = {
        id: itemId.trim().toLowerCase(),
        name: itemName.trim(),
        category: itemCategory,
        price: priceNum,
        originalPrice: originalPriceNum,
        discount: discountPercent > 0 ? discountPercent : 0,
        image: imageUrl,
        images: uploadedGalleryUrls.length > 0 ? uploadedGalleryUrls : undefined,
        video: uploadedVideoUrl || undefined,
        description: itemDescription.trim() || "Handcrafted designer Chaniya Choli set.",
        fabric: itemFabric.trim(),
        workType: itemWorkType.trim(),
        flare: itemFlare.trim() || "5.5 Meters",
        blouse: itemBlouse.trim() || "Semi-stitched",
        dupatta: itemDupatta.trim() || "2.25 Meters",
        isAvailable: true,
        tag: itemTag.trim() || undefined,
        weight: itemWeight.trim() || undefined,
        lehengaDetails: hasAnyValue(lehengaDetailsObj) ? lehengaDetailsObj : undefined,
        blouseDetails: hasAnyValue(blouseDetailsObj) ? blouseDetailsObj : undefined,
        dupattaDetails: hasAnyValue(dupattaDetailsObj) ? dupattaDetailsObj : undefined,
        highlights: highlightsInput.trim() ? highlightsInput.split('\n').map(h => h.trim()).filter(Boolean) : undefined,
        careInstructions: careInstructionsInput.trim() ? careInstructionsInput.split('\n').map(c => c.trim()).filter(Boolean) : undefined,
        note: itemNote.trim() || undefined,
        styleStatement: itemStyleStatement.trim() || undefined,
        created_at: new Date().toISOString()
      };

      if (isEditMode) {
        // UPDATE MODE
        const { error } = await supabase
          .from('products')
          .update(productPayload)
          .eq('id', itemId.trim().toLowerCase())
          .async();

        if (error) throw error;
        
        setFormError(false);
        setFormMessage(`Success! "${itemName}" has been updated.`);
      } else {
        // CREATE MODE
        const { error } = await supabase
          .from('products')
          .insert([productPayload])
          .async();

        if (error) throw error;

        setFormError(false);
        setFormMessage(`Success! "${itemName}" has been added to the catalog.`);
      }
      
      // Reset Form
      setIsEditMode(false);
      setItemId('');
      setItemName('');
      setItemCategory('chaniya-choli');
      setItemPrice('');
      setItemOriginalPrice('');
      setItemFabric('');
      setItemWorkType('');
      setItemFlare('');
      setItemBlouse('');
      setItemDupatta('');
      setItemTag('');
      setItemWeight('');
      setItemDescription('');
      setItemImage('/images/navratri.png');
      setItemImages([]);
      setItemVideo('');
      setImageFile(null);
      setImagePreviewUrl(null);
      setGalleryFiles([]);
      setGalleryPreviewUrls([]);
      setVideoFile(null);
      setVideoPreviewUrl(null);

      // Reset Detailed Specifications
      setLehengaFabric('');
      setLehengaColor('');
      setLehengaFlair('');
      setLehengaWaist('');
      setLehengaLength('');
      setLehengaWork('');

      setBlouseFabric('');
      setBlouseColor('');
      setBlouseStyle('');
      setBlouseSleeves('');
      setBlouseSize('');
      setBlouseWork('');

      setDupattaFabric('');
      setDupattaColor('');
      setDupattaLength('');
      setDupattaWork('');

      setHighlightsInput('');
      setCareInstructionsInput('');
      setItemNote('');
      setItemStyleStatement('');
      
      setActiveFormTab('basic');

      // Refresh listings
      fetchDashboardData();
    } catch (err: any) {
      setFormError(true);
      setFormMessage(err.message || "Failed to save product.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}" from the catalog?`)) {
      return;
    }

    try {
      // In real Supabase RLS policies block this if not admin.
      // In mockClient it removes from localStorage.
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
        .async(); // standard trigger

      // Let's refresh mock local data directly by updating state
      const { data: refreshedProducts } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .async();
      
      if (refreshedProducts) {
        setProductsList(refreshedProducts);
      }
      
      alert(`Deleted ${name} successfully.`);
    } catch (e) {
      alert("Failed to delete product.");
    }
  };

  // Render Loader
  if (isAdmin === null) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', color: 'var(--color-gold)' }}>
        <h2>Verifying Administrator Session...</h2>
      </div>
    );
  }

  // Render Access Denied
  if (isAdmin === false) {
    return (
      <div className="auth-container">
        <div className="auth-card" style={{ textAlign: 'center', maxWidth: '500px' }}>
          <span className="brand-logo-text" style={{ fontSize: '2.5rem' }}>Access Denied</span>
          <p style={{ margin: '1.5rem 0', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
            Oops! You do not have administrator privileges. Only accounts with the role <strong>admin</strong> in the database profiles can access this module.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <a href="/" className="btn-auth" style={{ textDecoration: 'none' }}>Back to Shop Catalog</a>
            <button className="btn-signout" onClick={handleSignOut}>Sign Out & Try Another Account</button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalValue = productsList.reduce((acc, p) => acc + p.price, 0);

  return (
    <div className="app-container">
      {/* HEADER */}
      <header className="app-header">
        <div className="nav-container">
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', textDecoration: 'none' }}>
            <img src="/images/logo.png" alt="Magic Threads Logo" style={{ width: '56px', height: '56px', borderRadius: '50%', border: '2px solid var(--color-gold)' }} />
            <div>
              <span className="brand-logo-text" style={{ display: 'block', fontSize: '1.25rem', fontWeight: '700', letterSpacing: '1px' }}>MAGIC THREADS</span>
              <div className="brand-logo-sub" style={{ fontSize: '0.65rem' }}>Admin Portal</div>
            </div>
          </a>

          <div className="user-nav-profile">
            <span className="badge-role">Admin</span>
            <span className="user-nav-email" title={userEmail}>{userEmail}</span>
            <button className="btn-signout" onClick={handleSignOut}>Sign Out</button>
          </div>
        </div>
      </header>

      {/* DASHBOARD CONTENT */}
      <main className="admin-container">
        <div className="admin-header-row">
          <div className="admin-title-group">
            <h1 className="admin-title">Catalog Control</h1>
            <p className="admin-subtitle">Add new Chaniya Cholis or manage current listings in the database.</p>
          </div>
          <a href="/" className="btn-details" style={{ textDecoration: 'none', border: '1px solid var(--color-gold)' }}>
            &larr; View Live Shop
          </a>
        </div>

        {/* STATS SECTION */}
        <section className="admin-stats-grid">
          <div className="admin-stat-card">
            <span className="admin-stat-label">Products Active</span>
            <span className="admin-stat-val">{productsList.length} Items</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-label">Registered Accounts</span>
            <span className="admin-stat-val">{totalUsersCount} Users</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-label">Est. Showcase Value</span>
            <span className="admin-stat-val">₹{totalValue.toLocaleString('en-IN')}</span>
          </div>
        </section>

        {/* ADMIN WORK GRID */}
        <div className="admin-grid">
          
          {/* 1. ADD NEW ITEM FORM */}
          <section className="admin-form-panel">
            <h2 className="admin-panel-title">{isEditMode ? `Edit Product: ${itemName}` : "Add New Chaniya Choli"}</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '-0.5rem', marginBottom: '1rem' }}>
              {isEditMode ? "Modify details of this existing product listing." : "Fill out the details. Items will be appended to the catalog instantly."}
            </p>

            {formMessage && (
              <div style={{
                padding: '0.8rem 1rem',
                borderRadius: '10px',
                fontSize: '0.9rem',
                backgroundColor: formError ? 'rgba(231, 76, 60, 0.15)' : 'rgba(46, 204, 113, 0.15)',
                border: `1px solid ${formError ? '#e74c3c' : '#2ecc71'}`,
                color: formError ? '#ff7675' : '#2ecc71',
                textAlign: 'center'
              }}>
                {formMessage}
              </div>
            )}

            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {/* Form Section Tabs */}
              <div className="admin-form-tabs">
                <button
                  type="button"
                  className={`admin-tab-btn ${activeFormTab === 'basic' ? 'active' : ''}`}
                  onClick={() => setActiveFormTab('basic')}
                >
                  General Info
                </button>
                <button
                  type="button"
                  className={`admin-tab-btn ${activeFormTab === 'lehenga' ? 'active' : ''}`}
                  onClick={() => setActiveFormTab('lehenga')}
                >
                  Lehenga Spec
                </button>
                <button
                  type="button"
                  className={`admin-tab-btn ${activeFormTab === 'blouse' ? 'active' : ''}`}
                  onClick={() => setActiveFormTab('blouse')}
                >
                  Blouse Spec
                </button>
                <button
                  type="button"
                  className={`admin-tab-btn ${activeFormTab === 'dupatta' ? 'active' : ''}`}
                  onClick={() => setActiveFormTab('dupatta')}
                >
                  Dupatta Spec
                </button>
                <button
                  type="button"
                  className={`admin-tab-btn ${activeFormTab === 'extra' ? 'active' : ''}`}
                  onClick={() => setActiveFormTab('extra')}
                >
                  Highlights & Extra
                </button>
              </div>

              {activeFormTab === 'basic' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">ID Code *</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. cc-007"
                        value={itemId}
                        onChange={(e) => setItemId(e.target.value)}
                        disabled={isEditMode}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Category *</label>
                      <select
                        className="form-select"
                        value={itemCategory}
                        onChange={(e) => setItemCategory(e.target.value as any)}
                      >
                        <option value="chaniya-choli">Chaniya Choli</option>
                        <option value="home-decor">Home Decor</option>
                        <option value="cushion-covers">Cushion Covers</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Product Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Royal Emerald Patola Lehenga"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Selling Price (₹) *</label>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="e.g. 7499"
                        value={itemPrice}
                        onChange={(e) => setItemPrice(e.target.value)}
                        min="1"
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Original Price (₹) *</label>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="e.g. 11999"
                        value={itemOriginalPrice}
                        onChange={(e) => setItemOriginalPrice(e.target.value)}
                        min="1"
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Fabric / Material *</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Pure Georgette"
                        value={itemFabric}
                        onChange={(e) => setItemFabric(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Embroidery / Work *</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Real Mirror & Zari work"
                        value={itemWorkType}
                        onChange={(e) => setItemWorkType(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Lehenga Ghera (Summary Flare)</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. 6.5 Meters"
                        value={itemFlare}
                        onChange={(e) => setItemFlare(e.target.value)}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Blouse Fitting (Summary Details)</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Stitched Size 38-42"
                        value={itemBlouse}
                        onChange={(e) => setItemBlouse(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Dupatta Detail (Summary)</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. 2.3 Mtrs Organza"
                        value={itemDupatta}
                        onChange={(e) => setItemDupatta(e.target.value)}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Product Tag (Promo)</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. New Arrival"
                        value={itemTag}
                        onChange={(e) => setItemTag(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Total Weight</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Approx. 2.0 kg"
                        value={itemWeight}
                        onChange={(e) => setItemWeight(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Upload Product Image</label>
                    <input
                      type="file"
                      className="form-input"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ display: 'block', padding: '0.5rem' }}
                    />
                    
                    {imagePreviewUrl ? (
                      <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--color-border-gold)', position: 'relative' }}>
                          <img src={imagePreviewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Photo loaded successfully</span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>Or Select Preset Backup Graphic</label>
                        <select
                          className="form-select"
                          value={itemImage}
                          onChange={(e) => setItemImage(e.target.value)}
                        >
                          <option value="/images/navratri.png">Chaniya Choli preset 1 (Vibrant model)</option>
                          <option value="/images/bridal.png">Chaniya Choli preset 2 (Red Silk model)</option>
                          <option value="/images/pastel.png">Chaniya Choli preset 3 (Pastel model)</option>
                          <option value="/images/home_decor.png">Home Decor preset</option>
                          <option value="/images/cushion_cover.png">Cushion Cover preset</option>
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Upload Gallery Images (Inner View Card Images)</label>
                    <input
                      type="file"
                      className="form-input"
                      accept="image/*"
                      multiple
                      onChange={handleGalleryChange}
                      style={{ display: 'block', padding: '0.5rem' }}
                    />
                    {galleryPreviewUrls.length > 0 ? (
                      <div>
                        <label className="form-label" style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>Newly Selected Gallery Images ({galleryPreviewUrls.length})</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', marginTop: '0.2rem' }}>
                          {galleryPreviewUrls.map((url, idx) => (
                            <div key={idx} style={{ position: 'relative', width: '50px', height: '50px', borderRadius: '8px', border: '1px solid var(--color-border-gold)' }}>
                              <img src={url} alt={`Gallery preview ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                              <button
                                type="button"
                                onClick={() => {
                                  setGalleryFiles(prev => prev.filter((_, i) => i !== idx));
                                  setGalleryPreviewUrls(prev => prev.filter((_, i) => i !== idx));
                                }}
                                style={{
                                  position: 'absolute',
                                  top: '-6px',
                                  right: '-6px',
                                  width: '18px',
                                  height: '18px',
                                  borderRadius: '50%',
                                  background: '#e74c3c',
                                  color: 'white',
                                  border: 'none',
                                  fontSize: '12px',
                                  fontWeight: 'bold',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                }}
                                title="Remove Selected Image"
                              >
                                &times;
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {itemImages.length > 0 ? (
                      <div style={{ marginTop: '0.8rem' }}>
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>Saved Gallery Images ({itemImages.length})</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', marginTop: '0.2rem' }}>
                          {itemImages.map((url, idx) => (
                            <div key={idx} style={{ position: 'relative', width: '50px', height: '50px', borderRadius: '8px', border: '1px solid var(--color-border-gold)' }}>
                              <img src={url} alt={`Current gallery ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                              <button
                                type="button"
                                onClick={() => setItemImages(prev => prev.filter((_, i) => i !== idx))}
                                style={{
                                  position: 'absolute',
                                  top: '-6px',
                                  right: '-6px',
                                  width: '18px',
                                  height: '18px',
                                  borderRadius: '50%',
                                  background: '#e74c3c',
                                  color: 'white',
                                  border: 'none',
                                  fontSize: '12px',
                                  fontWeight: 'bold',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                }}
                                title="Delete Saved Image"
                              >
                                &times;
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Upload Product Video (Optional Showcase)</label>
                    <input
                      type="file"
                      className="form-input"
                      accept="video/*"
                      onChange={handleVideoChange}
                      style={{ display: 'block', padding: '0.5rem' }}
                    />
                    {videoPreviewUrl ? (
                      <div style={{ marginTop: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                          <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: 0 }}>New Showcase Video Preview</label>
                          <button
                            type="button"
                            onClick={() => {
                              setVideoFile(null);
                              setVideoPreviewUrl(null);
                            }}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#e74c3c',
                              fontSize: '0.75rem',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              padding: 0
                            }}
                          >
                            Remove Selected Video
                          </button>
                        </div>
                        <video src={videoPreviewUrl} controls style={{ width: '100%', maxHeight: '150px', borderRadius: '8px', border: '1px solid var(--color-border-gold)' }} />
                      </div>
                    ) : itemVideo ? (
                      <div style={{ marginTop: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                          <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: 0 }}>Saved Product Video</label>
                          <button
                            type="button"
                            onClick={() => setItemVideo('')}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#e74c3c',
                              fontSize: '0.75rem',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              padding: 0
                            }}
                          >
                            Remove Video
                          </button>
                        </div>
                        <video src={itemVideo} controls style={{ width: '100%', maxHeight: '150px', borderRadius: '8px', border: '1px solid var(--color-border-gold)' }} />
                      </div>
                    ) : null}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Product Description</label>
                    <textarea
                      className="form-input form-textarea"
                      placeholder="Provide a stunning narrative description of the Chaniya Choli..."
                      value={itemDescription}
                      onChange={(e) => setItemDescription(e.target.value)}
                    />
                  </div>
                </>
              )}

              {activeFormTab === 'lehenga' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  <h3 style={{ fontSize: '1.1rem', color: 'var(--color-gold-bright)', borderBottom: '1px solid rgba(212,175,55,0.2)', paddingBottom: '0.4rem', marginBottom: '0.4rem' }}>Lehenga Specifications</h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Lehenga Fabric</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Premium Cotton Blend"
                        value={lehengaFabric}
                        onChange={(e) => setLehengaFabric(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Lehenga Color</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Mustard Yellow & Ivory White"
                        value={lehengaColor}
                        onChange={(e) => setLehengaColor(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Lehenga Ghera (Flair)</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Approx. 5.5 – 6.0 Meters"
                        value={lehengaFlair}
                        onChange={(e) => setLehengaFlair(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Lehenga Waist Size</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Fits up to 40 inches"
                        value={lehengaWaist}
                        onChange={(e) => setLehengaWaist(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Lehenga Length</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. 42 inches"
                        value={lehengaLength}
                        onChange={(e) => setLehengaLength(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Lehenga Work / Finish</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Designer lace border with elegant finishing"
                        value={lehengaWork}
                        onChange={(e) => setLehengaWork(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeFormTab === 'blouse' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  <h3 style={{ fontSize: '1.1rem', color: 'var(--color-gold-bright)', borderBottom: '1px solid rgba(212,175,55,0.2)', paddingBottom: '0.4rem', marginBottom: '0.4rem' }}>Blouse Specifications</h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Blouse Fabric</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Premium Cotton Silk Blend"
                        value={blouseFabric}
                        onChange={(e) => setBlouseFabric(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Blouse Color</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Mustard Yellow with Silver Embroidery"
                        value={blouseColor}
                        onChange={(e) => setBlouseColor(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Blouse Style / Neckline</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. V-Neck Designer Blouse"
                        value={blouseStyle}
                        onChange={(e) => setBlouseStyle(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Blouse Sleeves</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Half Sleeves"
                        value={blouseSleeves}
                        onChange={(e) => setBlouseSleeves(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Blouse Size / Stitch Type</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Stitched Size 38-42"
                        value={blouseSize}
                        onChange={(e) => setBlouseSize(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Blouse Work / Details</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Intricate embroidered neckline and sleeves"
                        value={blouseWork}
                        onChange={(e) => setBlouseWork(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeFormTab === 'dupatta' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  <h3 style={{ fontSize: '1.1rem', color: 'var(--color-gold-bright)', borderBottom: '1px solid rgba(212,175,55,0.2)', paddingBottom: '0.4rem', marginBottom: '0.4rem' }}>Dupatta Specifications</h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Dupatta Fabric</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Premium Jacquard / Banarasi Weave"
                        value={dupattaFabric}
                        onChange={(e) => setDupattaFabric(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Dupatta Color</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Deep Mehendi Green"
                        value={dupattaColor}
                        onChange={(e) => setDupattaColor(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Dupatta Length</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Approx. 2.3–2.5 Meters"
                        value={dupattaLength}
                        onChange={(e) => setDupattaLength(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Dupatta Work Details</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Rich traditional woven motifs & designer border"
                        value={dupattaWork}
                        onChange={(e) => setDupattaWork(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeFormTab === 'extra' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  <h3 style={{ fontSize: '1.1rem', color: 'var(--color-gold-bright)', borderBottom: '1px solid rgba(212,175,55,0.2)', paddingBottom: '0.4rem', marginBottom: '0.4rem' }}>Highlights, Care & Notes</h3>
                  
                  <div className="form-group">
                    <label className="form-label">Product Highlights (One item per line)</label>
                    <textarea
                      className="form-input form-textarea"
                      style={{ height: '80px' }}
                      placeholder="e.g.&#10;Elegant festive color combination&#10;Comfortable premium cotton&#10;Stunning designer dupatta"
                      value={highlightsInput}
                      onChange={(e) => setHighlightsInput(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Care Instructions (One instruction per line)</label>
                    <textarea
                      className="form-input form-textarea"
                      style={{ height: '80px' }}
                      placeholder="e.g.&#10;Dry Clean Only&#10;Steam or low heat iron recommended&#10;Store in a cool dry place"
                      value={careInstructionsInput}
                      onChange={(e) => setCareInstructionsInput(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Stylist Statement / Quote</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Step into every celebration with timeless elegance."
                      value={itemStyleStatement}
                      onChange={(e) => setItemStyleStatement(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Important Note / Disclaimer</label>
                    <textarea
                      className="form-input form-textarea"
                      style={{ height: '60px' }}
                      placeholder="e.g. The displayed image is for presentation purposes. Actual colors may vary slightly."
                      value={itemNote}
                      onChange={(e) => setItemNote(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button 
                  type="submit" 
                  className="btn-submit-inquiry btn-admin-primary"
                  style={{ flex: 1 }}
                  disabled={submitting}
                >
                  {submitting ? "Saving..." : isEditMode ? "Update Product" : "Add to Live Database"}
                </button>
                {isEditMode && (
                  <button 
                    type="button" 
                    className="btn-admin-action"
                    style={{ flex: 1, padding: '0.75rem' }}
                    onClick={handleCancelEdit}
                    disabled={submitting}
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </section>

          {/* 2. CATALOG MANAGEMENT LIST */}
          <section className="admin-items-panel">
            <h2 className="admin-panel-title">Active Products ({productsList.length})</h2>
            
            {loadingData ? (
              <p style={{ color: 'var(--color-text-muted)' }}>Loading items list...</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '700px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                {productsList.map((product) => (
                  <div className="admin-item-row" key={product.id}>
                    <div className="admin-item-meta">
                      <div className="admin-item-img-wrapper">
                        <Image 
                          src={product.image} 
                          alt={product.name}
                          width={50}
                          height={50}
                          className="admin-item-img"
                        />
                      </div>
                      
                      <div className="admin-item-info">
                        <span className="admin-item-category">{formatCategory(product.category)}</span>
                        <span className="admin-item-name">{product.name}</span>
                        <span className="admin-item-price">
                          ₹{product.price.toLocaleString('en-IN')}{" "}
                          <span style={{ textDecoration: 'line-through', color: 'var(--color-text-muted)', fontSize: '0.8rem', fontWeight: 'normal' }}>
                            ₹{product.originalPrice.toLocaleString('en-IN')}
                          </span>
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                          Code: <strong>{product.id}</strong> | Fabric: {product.fabric}
                        </span>
                      </div>
                    </div>

                    <div className="admin-item-actions">
                      <button 
                        className="btn-admin-action btn-admin-edit"
                        onClick={() => handleEditClick(product)}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn-admin-action"
                        onClick={() => handleDeleteProduct(product.id, product.name)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}

                {productsList.length === 0 && (
                  <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '2rem' }}>
                    No products in the catalog yet. Add one using the form.
                  </p>
                )}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
