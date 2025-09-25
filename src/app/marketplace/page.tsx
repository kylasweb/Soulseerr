'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ShoppingBag,
  Package,
  FileText,
  Gift,
  Search,
  Filter,
  Star,
  Heart,
  Eye,
  DollarSign
} from 'lucide-react';
import Link from 'next/link';
import { ProductBrowse } from '@/components/marketplace/ProductBrowse';
import { ShoppingCart } from '@/components/marketplace/ShoppingCart';
import { PurchaseFlow } from '@/components/marketplace/PurchaseFlow';

interface MarketplaceStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  activeReaders: number;
}

interface Product {
  id: string;
  title: string;
  description: string;
  type: 'GUIDE' | 'MEDITATION' | 'COURSE' | 'EBOOK' | 'AUDIO' | 'VIDEO' | 'BUNDLE';
  price: number;
  category: string;
  tags: string[];
  difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  averageRating: number;
  totalSales: number;
  totalReviews: number;
  content: {
    duration?: number;
    pageCount?: number;
    fileUrl?: string;
    streamUrl?: string;
  };
  reader: {
    id: string;
    username: string;
    readerProfile: {
      firstName: string;
      lastName: string;
      avatar?: string;
      averageRating: number;
    };
  };
  previewContent?: string;
  createdAt: string;
  isOwned?: boolean;
  isFavorited?: boolean;
}

interface CartItem {
  id: string;
  productId: string;
  title: string;
  type: 'GUIDE' | 'MEDITATION' | 'COURSE' | 'EBOOK' | 'AUDIO' | 'VIDEO' | 'BUNDLE';
  price: number;
  originalPrice?: number;
  discount?: number;
  quantity: number;
  reader: {
    firstName: string;
    lastName: string;
    username: string;
  };
  thumbnail?: string;
  isGift?: boolean;
  giftRecipient?: {
    email: string;
    message?: string;
  };
}

interface CartSummary {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  itemCount: number;
}

export default function MarketplacePage() {
  const [activeTab, setActiveTab] = useState('browse');
  const [stats, setStats] = useState<MarketplaceStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeReaders: 0
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Array<{ category: string; count: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartSummary, setCartSummary] = useState<CartSummary>({
    subtotal: 0,
    discount: 0,
    tax: 0,
    total: 0,
    itemCount: 0
  });
  const [currentFilters, setCurrentFilters] = useState({
    category: undefined as string | undefined,
    search: '',
    sortBy: 'newest',
    type: undefined as string | undefined,
    difficulty: undefined as string | undefined
  });

  useEffect(() => {
    fetchStats();
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchStats = async () => {
    try {
      // This would fetch real stats from the API
      setStats({
        totalProducts: 47,
        totalOrders: 1234,
        totalRevenue: 45678,
        activeReaders: 89
      });
    } catch (error) {
      console.error('Failed to fetch marketplace stats:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      // This would fetch categories from the API
      setCategories([
        { category: 'Tarot', count: 12 },
        { category: 'Meditation', count: 8 },
        { category: 'Astrology', count: 15 },
        { category: 'Crystal Healing', count: 6 },
        { category: 'Spiritual Guides', count: 9 }
      ]);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleLoadMore = async () => {
    // Implement load more logic
    setHasMore(false);
  };

  const handleAddToCart = async (productId: string) => {
    // Implement add to cart logic
    console.log('Adding to cart:', productId);
  };

  const handlePurchase = async (productId: string) => {
    // Implement purchase logic
    console.log('Purchasing:', productId);
  };

  const handleToggleFavorite = async (productId: string) => {
    // Implement favorite toggle logic
    console.log('Toggling favorite:', productId);
  };

  const handleCategoryFilter = (category: string | null) => {
    setCurrentFilters(prev => ({ ...prev, category: category || undefined }));
  };

  const handleSearch = (query: string) => {
    setCurrentFilters(prev => ({ ...prev, search: query }));
  };

  const handleSort = (sortBy: string) => {
    setCurrentFilters(prev => ({ ...prev, sortBy }));
  };

  const handleTypeFilter = (type: string | null) => {
    setCurrentFilters(prev => ({ ...prev, type: type || undefined }));
  };

  const handleDifficultyFilter = (difficulty: string | null) => {
    setCurrentFilters(prev => ({ ...prev, difficulty: difficulty || undefined }));
  };

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    // Implement update quantity logic
    console.log('Updating quantity:', productId, quantity);
  };

  const handleRemoveItem = async (productId: string) => {
    // Implement remove item logic
    console.log('Removing item:', productId);
  };

  const handleApplyCoupon = async (code: string) => {
    // Implement apply coupon logic
    console.log('Applying coupon:', code);
    return true;
  };

  const handleRemoveCoupon = async () => {
    // Implement remove coupon logic
    console.log('Removing coupon');
  };

  const handleCheckout = async () => {
    // Implement checkout logic
    console.log('Starting checkout');
  };

  const handleClearCart = async () => {
    // Implement clear cart logic
    console.log('Clearing cart');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-mystical-purple/5 via-white to-mystical-pink/5">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-mystical-purple to-mystical-pink bg-clip-text text-transparent mb-4">
            Mystic Marketplace
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Discover spiritual tools, courses, and mystical products from our gifted community of readers
          </p>

          {/* Marketplace Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-center mb-2">
                <Package className="h-6 w-6 text-mystical-purple" />
              </div>
              <div className="text-2xl font-bold text-mystical-purple">{stats.totalProducts}</div>
              <div className="text-sm text-muted-foreground">Products</div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-center mb-2">
                <FileText className="h-6 w-6 text-mystical-pink" />
              </div>
              <div className="text-2xl font-bold text-mystical-pink">{stats.totalOrders.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Orders</div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-center mb-2">
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-green-500">${stats.totalRevenue.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Revenue</div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-center mb-2">
                <Star className="h-6 w-6 text-yellow-500" />
              </div>
              <div className="text-2xl font-bold text-yellow-500">{stats.activeReaders}</div>
              <div className="text-sm text-muted-foreground">Active Readers</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="browse" className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Browse
            </TabsTrigger>
            <TabsTrigger value="cart" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Cart
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Orders
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            <ProductBrowse
              products={products}
              categories={categories}
              onLoadMore={handleLoadMore}
              onAddToCart={handleAddToCart}
              onPurchase={handlePurchase}
              onToggleFavorite={handleToggleFavorite}
              onCategoryFilter={handleCategoryFilter}
              onSearch={handleSearch}
              onSort={handleSort}
              onTypeFilter={handleTypeFilter}
              onDifficultyFilter={handleDifficultyFilter}
              hasMore={hasMore}
              isLoading={loading}
              currentFilters={currentFilters}
            />
          </TabsContent>

          <TabsContent value="cart" className="space-y-6">
            <ShoppingCart
              items={cartItems}
              summary={cartSummary}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onApplyCoupon={handleApplyCoupon}
              onRemoveCoupon={handleRemoveCoupon}
              onCheckout={handleCheckout}
              onClearCart={handleClearCart}
            />
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-4">Order History</h2>
                <p className="text-muted-foreground">
                  View and manage your marketplace orders
                </p>
              </div>
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No orders yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start exploring our spiritual marketplace!
                </p>
                <Button onClick={() => setActiveTab('browse')}>
                  Browse Products
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}