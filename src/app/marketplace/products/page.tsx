import { ProductBrowse } from '@/components/marketplace/ProductBrowse';

export default function ProductsPage() {
  // This would be a dedicated products page with more advanced filtering
  // For now, we'll redirect to the main marketplace browse tab
  return (
    <div className="min-h-screen bg-gradient-to-br from-mystical-purple/5 via-white to-mystical-pink/5">
      <div className="container mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">All Products</h1>
          <p className="text-muted-foreground">
            Browse our complete collection of spiritual products and courses
          </p>
        </div>
        {/* ProductBrowse component would go here with full functionality */}
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Full product browsing functionality coming soon. Visit the main marketplace page for now.
          </p>
        </div>
      </div>
    </div>
  );
}