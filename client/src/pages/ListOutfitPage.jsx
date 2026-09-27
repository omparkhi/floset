import React, { useState } from 'react';
import {
  Upload,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Shield,
  DollarSign,
  ArrowRight,
  ArrowLeft,
  Store,
  Lock,
  Plus,
  Image as ImageIcon,
  UploadCloud,
  Link as LinkIcon,
  Star,
  Trash2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function ListOutfitPage({ onNavigate, onOpenAuth }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submittedListing, setSubmittedListing] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'Lehengas',
    subcategory: '',
    gender: 'Women',
    brand: user?.hostDetails?.businessName || '',
    description: '',
    size: 'M',
    availableSizes: ['M'],
    colour: '',
    condition: 'Like New',
    bustChest: '',
    waist: '',
    hips: '',
    length: '',
    occasions: ['Wedding'],
    expectedEarning: '800',
    rentalDurationPreference: '3_days',
    additionalDayCharge: '200',
    pickupAddress: {
      street: user?.savedAddresses?.[0]?.street || '',
      city: user?.savedAddresses?.[0]?.city || 'Mumbai',
      state: 'Maharashtra',
      pincode: '400050',
      contactPhone: user?.phone || '',
      contactName: user?.name || ''
    },
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1200&auto=format&fit=crop'
    ],
    newImageUrl: ''
  });

  const categories = [
    'Lehengas',
    'Sarees',
    'Gowns',
    'Dresses',
    'Indo-Western',
    'Sherwanis',
    'Kurta Sets',
    'Suits',
    'Blazers'
  ];

  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [photoInputMode, setPhotoInputMode] = useState('upload'); // 'upload' | 'url'
  const fileInputRef = React.useRef(null);

  const processImageFile = (file) => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        return reject(new Error('Please upload only image files (JPG, PNG, WEBP)'));
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1000;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.onerror = () => reject(new Error('Failed to parse image file'));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.readAsDataURL(file);
    });
  };

  const handleFilesSelected = async (fileList) => {
    if (!fileList || !fileList.length) return;
    setUploadingFiles(true);
    setError('');
    try {
      const promises = Array.from(fileList).map(file => processImageFile(file));
      const base64Images = await Promise.all(promises);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...base64Images]
      }));
    } catch (err) {
      setError(err.message || 'Error processing selected images');
    } finally {
      setUploadingFiles(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer && e.dataTransfer.files) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  const handleAddImage = () => {
    if (formData.newImageUrl.trim()) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, prev.newImageUrl.trim()],
        newImageUrl: ''
      }));
    }
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSetCover = (index) => {
    setFormData((prev) => {
      const copy = [...prev.images];
      const [item] = copy.splice(index, 1);
      return {
        ...prev,
        images: [item, ...copy]
      };
    });
  };

  const allSizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];

  const toggleSize = (sz) => {
    setFormData((prev) => {
      const current = prev.availableSizes || [prev.size || 'M'];
      let nextSizes;
      if (current.includes(sz)) {
        if (current.length === 1) return prev; // Always keep at least 1 size selected
        nextSizes = current.filter((s) => s !== sz);
      } else {
        nextSizes = [...current, sz];
      }
      return {
        ...prev,
        availableSizes: nextSizes,
        size: nextSizes[0] || 'M'
      };
    });
  };

  const selectAllStandardSizes = () => {
    setFormData((prev) => ({
      ...prev,
      availableSizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      size: 'M'
    }));
  };

  const selectFreeSizeOnly = () => {
    setFormData((prev) => ({
      ...prev,
      availableSizes: ['Free Size'],
      size: 'Free Size'
    }));
  };

  const handleSubmitListing = async () => {
    setError('');
    if (!user) {
      setError('Please sign in or register as a shopkeeper to list an outfit.');
      if (onOpenAuth) onOpenAuth({ role: 'shopkeeper', mode: 'register' });
      return;
    }

    setLoading(true);
    try {
      const activeSizes = formData.availableSizes?.length ? formData.availableSizes : [formData.size || 'M'];
      const payload = {
        name: formData.name,
        category: formData.category,
        subcategory: formData.subcategory,
        gender: formData.gender,
        size: activeSizes[0] || 'M',
        availableSizes: activeSizes,
        measurements: {
          bustChest: formData.bustChest || '36 inches',
          waist: formData.waist || '30 inches',
          hips: formData.hips || '40 inches',
          length: formData.length || '43 inches'
        },
        colour: formData.colour || 'Gold / Multicolor',
        condition: formData.condition,
        description: formData.description,
        brand: formData.brand || user?.hostDetails?.businessName || 'Boutique Collection',
        occasions: formData.occasions,
        images: formData.images,
        expectedEarning: Number(formData.expectedEarning),
        rentalDurationPreference: formData.rentalDurationPreference,
        additionalDayCharge: Number(formData.additionalDayCharge),
        pickupAddress: formData.pickupAddress
      };

      const res = await api.products.listOutfit(payload);
      setSubmittedListing(res.listing);

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (err) {
      setError(err.message || 'Failed to submit outfit');
    } finally {
      setLoading(false);
    }
  };

  // Not logged in gate
  if (!user) {
    return (
      <div className="min-h-screen bg-sand/20 py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto flex items-center justify-center">
        <div className="w-full max-w-lg text-center py-14 px-6 sm:px-10 rounded-3xl border border-black/10 bg-white shadow-framer-md space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-noir text-emeraldRent flex items-center justify-center mx-auto shadow-sm">
            <Store className="w-8 h-8" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
            Boutique & Shopkeeper Portal
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-noir tracking-tight">
            Sign In to List an Outfit
          </h1>
          <p className="text-xs sm:text-sm text-ash leading-relaxed">
            Please sign in to list your boutique collection. FLOSET handles concierge dry-cleaning, insured logistics, and weekly rental payouts.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => onOpenAuth({ role: 'shopkeeper', mode: 'login' })}
              className="px-6 py-3.5 bg-noir hover:bg-obsidian text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>Sign In to Shopkeeper Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onOpenAuth({ role: 'shopkeeper', mode: 'register' })}
              className="px-6 py-3.5 bg-cream hover:bg-sand border border-black/10 text-noir text-xs font-semibold rounded-xl transition-colors"
            >
              Register Boutique
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success State
  if (submittedListing) {
    return (
      <div className="min-h-screen bg-sand/20 py-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto text-center">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-black/10 shadow-framer-md space-y-6">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <h2 className="font-display text-3xl font-extrabold text-noir">
            Outfit Submitted for FLOSET Curation!
          </h2>

          <p className="text-xs sm:text-sm text-ash max-w-md mx-auto leading-relaxed">
            Your outfit <strong className="text-noir">{submittedListing.name}</strong> (SKU: {submittedListing.productId}) has been submitted. Our concierge team reviews quality, sets consumer pricing, and publishes it live to renters.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('host-dashboard')}
              className="w-full sm:w-auto px-8 py-3.5 bg-noir text-white text-xs font-bold rounded-xl hover:bg-obsidian transition-colors shadow-md"
            >
              View in Shopkeeper Dashboard
            </button>
            <button
              onClick={() => {
                setSubmittedListing(null);
                setStep(1);
                setFormData({
                  ...formData,
                  name: '',
                  description: '',
                  colour: ''
                });
              }}
              className="w-full sm:w-auto px-6 py-3.5 border border-black/15 text-noir text-xs font-semibold rounded-xl hover:bg-cream transition-colors"
            >
              List Another Outfit
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand/20 py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cream border border-black/10 text-noir/80">
          <Store className="w-3.5 h-3.5 text-emerald-600" />
          <span>Boutique Inventory Submission</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-noir tracking-tight">
          List a Designer Outfit
        </h1>
        <p className="text-xs sm:text-sm text-ash">
          Submit your boutique pieces. FLOSET handles customer pickups, dry-cleaning, and weekly payouts.
        </p>
      </div>

      {/* Progress Stepper */}
      <div className="flex items-center justify-center gap-2 sm:gap-4 mb-8">
        {['1. Outfit Details', '2. Photos & Fit', '3. Earnings & Pickup'].map((label, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              step === idx + 1
                ? 'bg-noir text-white shadow-sm'
                : step > idx + 1
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-white border border-black/10 text-ash'
            }`}
          >
            <span>{label}</span>
          </div>
        ))}
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-black/10 shadow-framer-sm">
        {error && (
          <div className="p-3.5 mb-6 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Basic Outfit Details */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <h3 className="font-display text-lg font-bold text-noir border-b border-black/5 pb-2">
              Basic Outfit Information
            </h3>

            <div>
              <label className="block text-[11px] font-bold text-noir/70 uppercase tracking-wider mb-1">
                Outfit Name / Title *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="E.g. Sabyasachi Royal Crimson Velvet Lehenga"
                className="w-full px-3.5 py-2.5 bg-cream/40 border border-black/10 rounded-xl text-xs text-noir focus:outline-none focus:border-noir"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-noir/70 uppercase tracking-wider mb-1">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2.5 bg-cream/40 border border-black/10 rounded-xl text-xs text-noir focus:outline-none focus:border-noir cursor-pointer font-medium"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-noir/70 uppercase tracking-wider mb-1">
                  Gender *
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3 py-2.5 bg-cream/40 border border-black/10 rounded-xl text-xs text-noir focus:outline-none focus:border-noir cursor-pointer font-medium"
                >
                  <option value="Women">Women</option>
                  <option value="Men">Men</option>
                  <option value="Unisex">Unisex</option>
                </select>
              </div>
            </div>

            {/* Available Sizes Multi-Select */}
            <div className="p-4 rounded-2xl bg-cream/40 border border-black/10 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-noir uppercase tracking-wider">
                    Available Sizes in Stock *
                  </label>
                  <p className="text-[11px] text-ash">
                    Select one or multiple sizes available in your boutique for this outfit.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={selectAllStandardSizes}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-neutral-100 text-noir text-[10px] font-bold border border-black/10 transition-colors shadow-2xs"
                  >
                    Select All (XS–XXL)
                  </button>
                  <button
                    type="button"
                    onClick={selectFreeSizeOnly}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-neutral-100 text-noir text-[10px] font-bold border border-black/10 transition-colors shadow-2xs"
                  >
                    Free Size Only
                  </button>
                </div>
              </div>

              {/* Size Chips */}
              <div className="flex flex-wrap gap-2 pt-1">
                {allSizeOptions.map((sz) => {
                  const isSelected = (formData.availableSizes || []).includes(sz);
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => toggleSize(sz)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs ${
                        isSelected
                          ? 'bg-noir text-white ring-2 ring-emerald-500/50 scale-105'
                          : 'bg-white text-noir/70 border border-black/10 hover:border-black/30 hover:text-noir'
                      }`}
                    >
                      <span>{sz}</span>
                      {isSelected && <span className="text-[10px] text-emeraldRent">✓</span>}
                    </button>
                  );
                })}
              </div>

              <div className="text-[11px] text-ash pt-1 flex items-center justify-between">
                <span>
                  Active sizes: <strong className="text-noir font-bold">{(formData.availableSizes || []).join(', ') || 'None selected'}</strong>
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold">
                  {(formData.availableSizes || []).length} size(s) available
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-noir/70 uppercase tracking-wider mb-1">
                  Colour / Hue *
                </label>
                <input
                  type="text"
                  required
                  value={formData.colour}
                  onChange={(e) => setFormData({ ...formData, colour: e.target.value })}
                  placeholder="E.g. Emerald Green & Gold"
                  className="w-full px-3.5 py-2.5 bg-cream/40 border border-black/10 rounded-xl text-xs text-noir focus:outline-none focus:border-noir"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-noir/70 uppercase tracking-wider mb-1">
                  Designer / Boutique Brand
                </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="E.g. Heritage Studio"
                  className="w-full px-3.5 py-2.5 bg-cream/40 border border-black/10 rounded-xl text-xs text-noir focus:outline-none focus:border-noir"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-noir/70 uppercase tracking-wider mb-1">
                Outfit Description & Styling Details *
              </label>
              <textarea
                rows={3}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe fabric (pure silk, raw georgette), zardozi embroidery work, blouse padding, dupatta details, etc."
                className="w-full px-3.5 py-2.5 bg-cream/40 border border-black/10 rounded-xl text-xs text-noir focus:outline-none focus:border-noir"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  if (!formData.name.trim() || !formData.colour.trim() || !formData.description.trim()) {
                    setError('Please fill in all required fields before proceeding.');
                    return;
                  }
                  setError('');
                  setStep(2);
                }}
                className="px-6 py-3 bg-noir hover:bg-obsidian text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2"
              >
                <span>Continue to Photos & Fit</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Photos & Measurements */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="border-b border-black/5 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-display text-lg font-bold text-noir">
                  Photos & Sizing Fit
                </h3>
                <p className="text-xs text-ash">
                  Add high-resolution photos of your outfit (upload from your computer or provide URLs).
                </p>
              </div>

              {/* Mode Switcher */}
              <div className="inline-flex p-1 rounded-xl bg-cream/70 border border-black/10 text-xs font-semibold self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setPhotoInputMode('upload')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    photoInputMode === 'upload'
                      ? 'bg-noir text-white shadow-xs font-bold'
                      : 'text-ash hover:text-noir'
                  }`}
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload from Computer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPhotoInputMode('url')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    photoInputMode === 'url'
                      ? 'bg-noir text-white shadow-xs font-bold'
                      : 'text-ash hover:text-noir'
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>Paste Image URL</span>
                </button>
              </div>
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              multiple
              onChange={(e) => handleFilesSelected(e.target.files)}
              className="hidden"
            />

            {/* UPLOAD MODE: Drag & Drop Zone */}
            {photoInputMode === 'upload' && (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-200 group ${
                  isDragging
                    ? 'border-emerald-600 bg-emerald-50/50 scale-[1.01]'
                    : 'border-black/15 bg-cream/30 hover:bg-cream/60 hover:border-black/30'
                }`}
              >
                <div className="max-w-md mx-auto space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-md border border-black/5 flex items-center justify-center mx-auto text-noir group-hover:scale-110 transition-transform">
                    {uploadingFiles ? (
                      <div className="w-6 h-6 border-2 border-noir border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <UploadCloud className="w-7 h-7 text-emerald-700" />
                    )}
                  </div>

                  <div>
                    <p className="font-display text-sm sm:text-base font-bold text-noir">
                      {uploadingFiles ? 'Optimizing and loading photos...' : 'Drag & drop outfit photos here, or browse files'}
                    </p>
                    <p className="text-xs text-ash mt-1">
                      Supports JPG, PNG, WEBP from your computer or phone (select multiple photos at once)
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={uploadingFiles}
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current && fileInputRef.current.click();
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-noir hover:bg-obsidian text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Choose Photos from Computer</span>
                  </button>
                </div>
              </div>
            )}

            {/* URL MODE: Text Input */}
            {photoInputMode === 'url' && (
              <div className="p-5 rounded-2xl bg-cream/30 border border-black/10 space-y-3">
                <label className="block text-[11px] font-bold text-noir/70 uppercase tracking-wider">
                  Add Image URL
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-grow">
                    <LinkIcon className="w-4 h-4 text-noir/40 absolute left-3 top-3" />
                    <input
                      type="url"
                      value={formData.newImageUrl}
                      onChange={(e) => setFormData({ ...formData, newImageUrl: e.target.value })}
                      placeholder="Paste high-res image URL (e.g. Unsplash, Pinterest, Cloudinary)"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-black/10 rounded-xl text-xs text-noir focus:outline-none focus:border-noir"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddImage();
                        }
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="px-5 py-2.5 bg-noir text-white text-xs font-bold rounded-xl hover:bg-obsidian transition-colors shrink-0"
                  >
                    Add URL
                  </button>
                </div>
              </div>
            )}

            {/* Gallery Previews Grid */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-[11px] font-bold text-noir/70 uppercase tracking-wider">
                  Attached Photos ({formData.images.length})
                </label>
                {formData.images.length > 0 && (
                  <span className="text-[10px] text-ash italic">
                    ★ The 1st photo is your primary catalog cover
                  </span>
                )}
              </div>

              {formData.images.length === 0 ? (
                <div className="p-6 text-center border border-black/10 rounded-2xl bg-sand/20 text-xs text-ash">
                  No photos added yet. Upload from your computer or paste an image URL above.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {formData.images.map((img, i) => (
                    <div
                      key={i}
                      className={`relative aspect-[3/4] rounded-2xl overflow-hidden border group bg-sand shadow-xs transition-all ${
                        i === 0 ? 'border-emerald-600 ring-2 ring-emerald-500/20' : 'border-black/10'
                      }`}
                    >
                      <img src={img} alt={`Outfit preview ${i + 1}`} className="w-full h-full object-cover" />

                      {/* Primary Cover Badge */}
                      {i === 0 && (
                        <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[9px] font-extrabold uppercase tracking-wider shadow-sm">
                          <Star className="w-2.5 h-2.5 fill-white" /> Cover
                        </span>
                      )}

                      {/* Hover Overlay with Actions */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(i)}
                            className="bg-red-600 hover:bg-red-700 text-white rounded-full p-1.5 shadow-md transition-colors"
                            title="Remove Photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {i > 0 && (
                          <button
                            type="button"
                            onClick={() => handleSetCover(i)}
                            className="w-full py-1 px-2 rounded-lg bg-white/90 hover:bg-white text-noir text-[10px] font-bold text-center shadow-xs transition-colors"
                          >
                            Set as Cover
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sizing & Tailoring Measurements */}
            <div className="pt-2">
              <span className="block text-[11px] font-bold text-noir/70 uppercase tracking-wider mb-2">
                Key Measurements (Optional but Recommended)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <input
                  type="text"
                  placeholder="Bust/Chest (e.g. 36 in)"
                  value={formData.bustChest}
                  onChange={(e) => setFormData({ ...formData, bustChest: e.target.value })}
                  className="px-3 py-2 text-xs bg-cream/40 border border-black/10 rounded-xl text-noir focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Waist (e.g. 30 in)"
                  value={formData.waist}
                  onChange={(e) => setFormData({ ...formData, waist: e.target.value })}
                  className="px-3 py-2 text-xs bg-cream/40 border border-black/10 rounded-xl text-noir focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Hips (e.g. 40 in)"
                  value={formData.hips}
                  onChange={(e) => setFormData({ ...formData, hips: e.target.value })}
                  className="px-3 py-2 text-xs bg-cream/40 border border-black/10 rounded-xl text-noir focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Length (e.g. 43 in)"
                  value={formData.length}
                  onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                  className="px-3 py-2 text-xs bg-cream/40 border border-black/10 rounded-xl text-noir focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2.5 border border-black/15 text-noir text-xs font-semibold rounded-xl hover:bg-cream"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!formData.images.length) {
                    setError('Please add at least one outfit image.');
                    return;
                  }
                  setError('');
                  setStep(3);
                }}
                className="px-6 py-3 bg-noir hover:bg-obsidian text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2"
              >
                <span>Continue to Earnings & Pickup</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Expected Earnings & Concierge Pickup */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <h3 className="font-display text-lg font-bold text-noir border-b border-black/5 pb-2">
              Expected Payout & Doorstep Concierge Pickup
            </h3>

            <div>
              <label className="block text-[11px] font-bold text-noir/70 uppercase tracking-wider mb-1">
                Your Desired Earning per 3-Day Rental (₹ INR) *
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-noir/40 absolute left-3 top-3" />
                <input
                  type="number"
                  min="200"
                  step="50"
                  required
                  value={formData.expectedEarning}
                  onChange={(e) => setFormData({ ...formData, expectedEarning: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-cream/40 border border-black/10 rounded-xl text-xs font-bold text-noir focus:outline-none focus:border-noir"
                />
              </div>
              <p className="text-[11px] text-ash mt-1">
                FLOSET adds concierge dry-cleaning, insurance, and doorstep logistics fees on top of your payout.
              </p>
            </div>

            {/* Pickup Address */}
            <div className="space-y-3 pt-2">
              <span className="block text-[11px] font-bold text-noir/70 uppercase tracking-wider">
                Concierge Pickup Address (Store / Boutique)
              </span>
              <input
                type="text"
                placeholder="Street address & Landmark"
                value={formData.pickupAddress.street}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pickupAddress: { ...formData.pickupAddress, street: e.target.value }
                  })
                }
                className="w-full px-3.5 py-2.5 bg-cream/40 border border-black/10 rounded-xl text-xs text-noir focus:outline-none"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="City"
                  value={formData.pickupAddress.city}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pickupAddress: { ...formData.pickupAddress, city: e.target.value }
                    })
                  }
                  className="px-3 py-2 text-xs bg-cream/40 border border-black/10 rounded-xl text-noir focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Pincode"
                  value={formData.pickupAddress.pincode}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pickupAddress: { ...formData.pickupAddress, pincode: e.target.value }
                    })
                  }
                  className="px-3 py-2 text-xs bg-cream/40 border border-black/10 rounded-xl text-noir focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 border border-black/15 text-noir text-xs font-semibold rounded-xl hover:bg-cream"
              >
                Back
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleSubmitListing}
                className="px-8 py-3.5 bg-noir hover:bg-obsidian text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span>Submitting to Curation...</span>
                ) : (
                  <>
                    <span>Submit Outfit for Review</span>
                    <Sparkles className="w-4 h-4 text-emeraldRent" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
