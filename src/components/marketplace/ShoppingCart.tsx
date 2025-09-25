import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { 
  ShoppingCart as ShoppingCartIcon, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard, 
  X,
  Book,
  Headphones,
  Video,
  Play,
  Package,
  Gift,
  Percent,
  AlertCircle,
  Lock,
  CheckCircle
} from 'lucide-react'

interface CartItem {
  id: string
  productId: string
  title: string
  type: 'GUIDE' | 'MEDITATION' | 'COURSE' | 'EBOOK' | 'AUDIO' | 'VIDEO' | 'BUNDLE'
  price: number
  originalPrice?: number
  discount?: number
  quantity: number
  reader: {
    firstName: string
    lastName: string
    username: string
  }
  thumbnail?: string
  isGift?: boolean
  giftRecipient?: {
    email: string
    message?: string
  }
}

interface CartSummary {
  subtotal: number
  discount: number
  tax: number
  total: number
  itemCount: number
}

interface ShoppingCartProps {
  items: CartItem[]
  summary: CartSummary
  isOpen?: boolean
  onToggle?: () => void
  onUpdateQuantity: (productId: string, quantity: number) => Promise<void>
  onRemoveItem: (productId: string) => Promise<void>
  onApplyCoupon: (code: string) => Promise<boolean>
  onRemoveCoupon: () => Promise<void>
  onCheckout: () => Promise<void>
  onClearCart: () => Promise<void>
  appliedCoupon?: {
    code: string
    discount: number
    type: 'PERCENTAGE' | 'FIXED'
  }
  isLoading?: boolean
  children?: React.ReactNode
}

export function ShoppingCart({
  items,
  summary,
  isOpen = false,
  onToggle,
  onUpdateQuantity,
  onRemoveItem,
  onApplyCoupon,
  onRemoveCoupon,
  onCheckout,
  onClearCart,
  appliedCoupon,
  isLoading = false,
  children
}: ShoppingCartProps) {
  const [couponCode, setCouponCode] = React.useState('')
  const [couponLoading, setCouponLoading] = React.useState(false)
  const [couponError, setCouponError] = React.useState('')

  const getProductTypeIcon = (type: string) => {
    switch (type) {
      case 'GUIDE': return <Book className="h-4 w-4" />
      case 'MEDITATION': return <Play className="h-4 w-4" />
      case 'COURSE': return <Play className="h-4 w-4" />
      case 'EBOOK': return <Book className="h-4 w-4" />
      case 'AUDIO': return <Headphones className="h-4 w-4" />
      case 'VIDEO': return <Video className="h-4 w-4" />
      case 'BUNDLE': return <Package className="h-4 w-4" />
      default: return <Book className="h-4 w-4" />
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price)
  }

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return

    setCouponLoading(true)
    setCouponError('')
    
    try {
      const success = await onApplyCoupon(couponCode.trim())
      if (success) {
        setCouponCode('')
      } else {
        setCouponError('Invalid or expired coupon code')
      }
    } catch (error) {
      setCouponError('Failed to apply coupon. Please try again.')
    } finally {
      setCouponLoading(false)
    }
  }

  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      await onRemoveItem(productId)
    } else {
      await onUpdateQuantity(productId, newQuantity)
    }
  }

  const cartContent = (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <ShoppingCartIcon className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Shopping Cart</h2>
          <Badge variant="secondary">{summary.itemCount}</Badge>
        </div>
        {onToggle && (
          <Button variant="ghost" size="sm" onClick={onToggle}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-auto">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <ShoppingCartIcon className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground mb-4">
              Add some spiritual guides, meditations, or courses to get started.
            </p>
            {onToggle && (
              <Button onClick={onToggle}>Continue Shopping</Button>
            )}
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    {/* Product Image/Icon */}
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                      {getProductTypeIcon(item.type)}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium line-clamp-2">{item.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            by {item.reader.firstName} {item.reader.lastName}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {item.type.toLowerCase()}
                            </Badge>
                            {item.isGift && (
                              <Badge variant="secondary" className="text-xs">
                                <Gift className="h-3 w-3 mr-1" />
                                Gift
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveItem(item.productId)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Gift Message */}
                      {item.isGift && item.giftRecipient && (
                        <div className="text-xs text-muted-foreground">
                          <p>Gift for: {item.giftRecipient.email}</p>
                          {item.giftRecipient.message && (
                            <p className="line-clamp-1">"{item.giftRecipient.message}"</p>
                          )}
                        </div>
                      )}

                      {/* Price and Quantity */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <div className="text-right">
                          {item.originalPrice && item.originalPrice > item.price && (
                            <div className="text-xs text-muted-foreground line-through">
                              {formatPrice(item.originalPrice * item.quantity)}
                            </div>
                          )}
                          <div className="font-medium">
                            {formatPrice(item.price * item.quantity)}
                          </div>
                          {item.discount && (
                            <div className="text-xs text-green-600">
                              {item.discount}% off
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Clear Cart */}
            {items.length > 0 && (
              <div className="text-center pt-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onClearCart}
                  className="text-muted-foreground"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Cart
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cart Summary and Checkout */}
      {items.length > 0 && (
        <div className="border-t p-4 space-y-4">
          {/* Coupon Code */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Coupon Code</label>
            {appliedCoupon ? (
              <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    {appliedCoupon.code}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {appliedCoupon.type === 'PERCENTAGE' 
                      ? `${appliedCoupon.discount}% off` 
                      : `${formatPrice(appliedCoupon.discount)} off`
                    }
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRemoveCoupon}
                  className="text-green-600 hover:text-green-800"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Input
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={handleApplyCoupon}
                  disabled={!couponCode.trim() || couponLoading}
                >
                  <Percent className="h-4 w-4 mr-1" />
                  Apply
                </Button>
              </div>
            )}
            {couponError && (
              <div className="flex items-center space-x-1 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>{couponError}</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Order Summary */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal ({summary.itemCount} items)</span>
              <span>{formatPrice(summary.subtotal)}</span>
            </div>
            
            {summary.discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span>-{formatPrice(summary.discount)}</span>
              </div>
            )}
            
            {summary.tax > 0 && (
              <div className="flex justify-between text-sm">
                <span>Tax</span>
                <span>{formatPrice(summary.tax)}</span>
              </div>
            )}
            
            <Separator />
            
            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>
              <span>{formatPrice(summary.total)}</span>
            </div>
          </div>

          {/* Security Notice */}
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Lock className="h-3 w-3" />
            <span>Secure checkout with 256-bit SSL encryption</span>
          </div>

          {/* Checkout Button */}
          <Button 
            className="w-full" 
            size="lg"
            onClick={onCheckout}
            disabled={isLoading || items.length === 0}
          >
            <CreditCard className="h-5 w-5 mr-2" />
            {isLoading ? 'Processing...' : `Checkout • ${formatPrice(summary.total)}`}
          </Button>

          {/* Continue Shopping */}
          {onToggle && (
            <Button 
              variant="outline" 
              className="w-full"
              onClick={onToggle}
            >
              Continue Shopping
            </Button>
          )}
        </div>
      )}
    </div>
  )

  if (children) {
    return (
      <Sheet open={isOpen} onOpenChange={onToggle}>
        <SheetTrigger asChild>
          {children}
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-lg p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Shopping Cart</SheetTitle>
            <SheetDescription>Review and manage your cart items</SheetDescription>
          </SheetHeader>
          {cartContent}
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Card className="w-full max-w-md">
      {cartContent}
    </Card>
  )
}

// Shopping Cart Badge Component (for header/navbar)
interface CartBadgeProps {
  itemCount: number
  onClick?: () => void
  className?: string
}

export function CartBadge({ itemCount, onClick, className }: CartBadgeProps) {
  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={onClick}
      className={`relative ${className}`}
    >
      <ShoppingCartIcon className="h-5 w-5" />
      {itemCount > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-2 -right-2 px-1 min-w-[1.25rem] h-5 text-xs"
        >
          {itemCount > 99 ? '99+' : itemCount}
        </Badge>
      )}
    </Button>
  )
}

// Mini Cart Dropdown Component
interface MiniCartProps {
  items: CartItem[]
  summary: CartSummary
  onViewCart: () => void
  onCheckout: () => void
  onRemoveItem: (productId: string) => Promise<void>
  maxItems?: number
}

export function MiniCart({
  items,
  summary,
  onViewCart,
  onCheckout,
  onRemoveItem,
  maxItems = 3
}: MiniCartProps) {
  const displayItems = items.slice(0, maxItems)
  const remainingItems = Math.max(0, items.length - maxItems)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price)
  }

  if (items.length === 0) {
    return (
      <Card className="w-80">
        <CardContent className="p-6 text-center">
          <ShoppingCartIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-medium mb-1">Your cart is empty</h3>
          <p className="text-sm text-muted-foreground">
            Start exploring our spiritual marketplace
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-80">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Shopping Cart</CardTitle>
          <Badge variant="secondary">{summary.itemCount}</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {displayItems.map((item) => (
          <div key={item.id} className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-muted rounded flex items-center justify-center flex-shrink-0">
              <Book className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium line-clamp-1">{item.title}</h4>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Qty: {item.quantity}</span>
                <span className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemoveItem(item.productId)}
              className="text-destructive hover:text-destructive"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
        
        {remainingItems > 0 && (
          <div className="text-center py-2">
            <Button variant="ghost" size="sm" onClick={onViewCart}>
              +{remainingItems} more items
            </Button>
          </div>
        )}

        <Separator />

        <div className="flex justify-between font-semibold">
          <span>Total:</span>
          <span>{formatPrice(summary.total)}</span>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={onViewCart} className="flex-1">
            View Cart
          </Button>
          <Button size="sm" onClick={onCheckout} className="flex-1">
            Checkout
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}