import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { 
  CreditCard, 
  Lock, 
  ArrowLeft, 
  Check, 
  Shield, 
  Banknote,
  Wallet,
  DollarSign,
  Download,
  AlertCircle,
  Gift,
  Mail,
  User,
  Calendar,
  HelpCircle,
  Star,
  Sparkles
} from 'lucide-react'

interface PurchaseItem {
  id: string
  title: string
  type: string
  price: number
  originalPrice?: number
  discount?: number
  quantity: number
  reader: {
    firstName: string
    lastName: string
  }
}

interface PaymentMethod {
  id: string
  type: 'CARD' | 'PAYPAL' | 'APPLE_PAY' | 'GOOGLE_PAY'
  name: string
  last4?: string
  expiryMonth?: number
  expiryYear?: number
  brand?: string
  isDefault: boolean
}

interface BillingDetails {
  email: string
  firstName: string
  lastName: string
  address?: {
    line1: string
    line2?: string
    city: string
    state: string
    postalCode: string
    country: string
  }
}

interface PurchaseFlowProps {
  items: PurchaseItem[]
  subtotal: number
  discount: number
  tax: number
  total: number
  paymentMethods: PaymentMethod[]
  savedBilling?: BillingDetails
  onBack: () => void
  onPaymentMethodSelect: (methodId: string) => void
  onNewPaymentMethod: () => void
  onBillingUpdate: (billing: BillingDetails) => Promise<void>
  onPurchase: (data: {
    paymentMethodId: string
    billingDetails: BillingDetails
    savePaymentMethod: boolean
    isGift?: boolean
    giftDetails?: {
      recipientEmail: string
      message: string
      deliveryDate?: string
    }
  }) => Promise<void>
  isLoading?: boolean
  selectedPaymentMethod?: string
}

export function PurchaseFlow({
  items,
  subtotal,
  discount,
  tax,
  total,
  paymentMethods,
  savedBilling,
  onBack,
  onPaymentMethodSelect,
  onNewPaymentMethod,
  onBillingUpdate,
  onPurchase,
  isLoading = false,
  selectedPaymentMethod
}: PurchaseFlowProps) {
  const [currentStep, setCurrentStep] = React.useState<'review' | 'payment' | 'processing' | 'success'>('review')
  const [billingDetails, setBillingDetails] = React.useState<BillingDetails>(
    savedBilling || {
      email: '',
      firstName: '',
      lastName: '',
    }
  )
  const [savePaymentMethod, setSavePaymentMethod] = React.useState(false)
  const [isGift, setIsGift] = React.useState(false)
  const [giftDetails, setGiftDetails] = React.useState({
    recipientEmail: '',
    message: '',
    deliveryDate: ''
  })
  const [agreeToTerms, setAgreeToTerms] = React.useState(false)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price)
  }

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'CARD': return <CreditCard className="h-4 w-4" />
      case 'PAYPAL': return <Wallet className="h-4 w-4" />
      case 'APPLE_PAY': return <Wallet className="h-4 w-4" />
      case 'GOOGLE_PAY': return <Wallet className="h-4 w-4" />
      default: return <CreditCard className="h-4 w-4" />
    }
  }

  const handlePurchase = async () => {
    if (!selectedPaymentMethod || !agreeToTerms) return

    setCurrentStep('processing')
    
    try {
      await onPurchase({
        paymentMethodId: selectedPaymentMethod,
        billingDetails,
        savePaymentMethod,
        isGift: isGift,
        giftDetails: isGift ? giftDetails : undefined
      })
      setCurrentStep('success')
    } catch (error) {
      setCurrentStep('payment')
      // Error handling would be managed by parent component
    }
  }

  if (currentStep === 'processing') {
    return (
      <div className="max-w-md mx-auto">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
              <h3 className="text-lg font-medium">Processing Payment</h3>
              <p className="text-muted-foreground">
                Please don't close this window. We're securely processing your payment.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (currentStep === 'success') {
    return (
      <div className="max-w-md mx-auto">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-2">Purchase Successful!</h3>
                <p className="text-muted-foreground">
                  {isGift 
                    ? `Gift has been sent to ${giftDetails.recipientEmail}`
                    : 'Your spiritual content is now available in your library'
                  }
                </p>
              </div>

              <div className="space-y-3">
                <Button className="w-full" onClick={() => window.location.href = '/library'}>
                  <Download className="h-4 w-4 mr-2" />
                  Access Your Content
                </Button>
                <Button variant="outline" className="w-full" onClick={() => window.location.href = '/marketplace'}>
                  Continue Shopping
                </Button>
              </div>

              <div className="text-xs text-muted-foreground">
                <p>A confirmation email has been sent to {billingDetails.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Main Content */}
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cart
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Checkout</h1>
            <p className="text-muted-foreground">Complete your spiritual journey</p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
              1
            </div>
            <span className="font-medium">Review Order</span>
          </div>
          <div className="flex-1 h-px bg-muted"></div>
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 ${currentStep === 'payment' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'} rounded-full flex items-center justify-center text-sm font-medium`}>
              2
            </div>
            <span className={currentStep === 'payment' ? 'font-medium' : 'text-muted-foreground'}>Payment</span>
          </div>
        </div>

        {currentStep === 'review' && (
          <>
            {/* Gift Option */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Gift className="h-5 w-5" />
                  <CardTitle>Gift This Order</CardTitle>
                </div>
                <CardDescription>
                  Share the gift of spiritual growth with someone special
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="gift-option"
                    checked={isGift}
                    onCheckedChange={(checked) => setIsGift(checked === true)}
                  />
                  <Label htmlFor="gift-option">This is a gift</Label>
                </div>

                {isGift && (
                  <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor="recipient-email">Recipient's Email</Label>
                      <Input
                        id="recipient-email"
                        type="email"
                        placeholder="recipient@example.com"
                        value={giftDetails.recipientEmail}
                        onChange={(e) => setGiftDetails(prev => ({ ...prev, recipientEmail: e.target.value }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="gift-message">Personal Message (Optional)</Label>
                      <Input
                        id="gift-message"
                        placeholder="Your message of love and light..."
                        value={giftDetails.message}
                        onChange={(e) => setGiftDetails(prev => ({ ...prev, message: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="delivery-date">Delivery Date (Optional)</Label>
                      <Input
                        id="delivery-date"
                        type="date"
                        value={giftDetails.deliveryDate}
                        onChange={(e) => setGiftDetails(prev => ({ ...prev, deliveryDate: e.target.value }))}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>We'll send your receipt and access details here</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={billingDetails.firstName}
                      onChange={(e) => setBillingDetails(prev => ({ ...prev, firstName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={billingDetails.lastName}
                      onChange={(e) => setBillingDetails(prev => ({ ...prev, lastName: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={billingDetails.email}
                    onChange={(e) => setBillingDetails(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Button 
              className="w-full" 
              onClick={() => setCurrentStep('payment')}
              disabled={!billingDetails.email || !billingDetails.firstName || !billingDetails.lastName || (isGift && !giftDetails.recipientEmail)}
            >
              Continue to Payment
            </Button>
          </>
        )}

        {currentStep === 'payment' && (
          <>
            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>Choose how you'd like to pay</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup value={selectedPaymentMethod} onValueChange={onPaymentMethodSelect}>
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={method.id} id={method.id} />
                      <Label htmlFor={method.id} className="flex items-center space-x-2 cursor-pointer flex-1">
                        {getPaymentMethodIcon(method.type)}
                        <span>
                          {method.name}
                          {method.last4 && ` ending in ${method.last4}`}
                        </span>
                        {method.isDefault && (
                          <Badge variant="secondary" className="text-xs">Default</Badge>
                        )}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                <Button variant="outline" onClick={onNewPaymentMethod} className="w-full">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Add New Payment Method
                </Button>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="save-payment"
                    checked={savePaymentMethod}
                    onCheckedChange={(checked) => setSavePaymentMethod(checked === true)}
                  />
                  <Label htmlFor="save-payment" className="text-sm">
                    Save this payment method for future purchases
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Terms and Conditions */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={agreeToTerms}
                    onCheckedChange={(checked) => setAgreeToTerms(checked === true)}
                  />
                  <div className="text-sm">
                    <Label htmlFor="terms" className="cursor-pointer">
                      I agree to the{' '}
                      <button className="text-primary underline">Terms of Service</button>
                      {' '}and{' '}
                      <button className="text-primary underline">Privacy Policy</button>
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex space-x-4">
              <Button variant="outline" onClick={() => setCurrentStep('review')} className="flex-1">
                Back to Review
              </Button>
              <Button 
                className="flex-1" 
                onClick={handlePurchase}
                disabled={!selectedPaymentMethod || !agreeToTerms || isLoading}
              >
                <Lock className="h-4 w-4 mr-2" />
                Complete Purchase
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Order Summary Sidebar */}
      <div className="space-y-6">
        <Card className="sticky top-6">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
            <CardDescription>{items.length} item{items.length !== 1 ? 's' : ''}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Order Items */}
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm line-clamp-2">{item.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      by {item.reader.firstName} {item.reader.lastName}
                    </p>
                    {item.quantity > 1 && (
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    )}
                  </div>
                  <div className="text-sm font-medium text-right">
                    {item.originalPrice && item.originalPrice > item.price && (
                      <div className="text-xs text-muted-foreground line-through">
                        {formatPrice(item.originalPrice * item.quantity)}
                      </div>
                    )}
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            {/* Price Breakdown */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              
              {tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>{formatPrice(tax)}</span>
                </div>
              )}
            </div>

            <Separator />

            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>

            {/* Security Badge */}
            <div className="flex items-center space-x-2 text-xs text-muted-foreground pt-4">
              <Shield className="h-4 w-4" />
              <span>Secured by 256-bit SSL encryption</span>
            </div>

            {/* Money Back Guarantee */}
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              <span>30-day money-back guarantee</span>
            </div>

            {/* Customer Support */}
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <HelpCircle className="h-4 w-4" />
              <span>24/7 customer support available</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}