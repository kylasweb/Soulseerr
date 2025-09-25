'use client';

import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  DollarSign,
  CreditCard,
  Calendar,
  User,
  Hash,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  ArrowDownLeft,
  Receipt,
  Building,
  Shield,
  ExternalLink,
  Copy,
  RefreshCw,
  Send,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';

interface TransactionDetailProps {
  transactionId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onTransactionUpdate?: () => void;
}

interface TransactionDetails {
  id: string;
  type: string;
  status: string;
  amount: number;
  currency: string;
  description: string;
  user?: {
    name: string;
    email: string;
    avatar?: string;
    role: string;
  };
  reader?: {
    name: string;
    email: string;
    avatar?: string;
  };
  session?: {
    id: string;
    duration: number;
    service: string;
  };
  paymentMethod?: string;
  stripeTransactionId?: string;
  createdAt: string;
  processedAt?: string;
  failureReason?: string;
  fees: number;
  netAmount: number;
  refunds: Array<{
    id: string;
    amount: number;
    status: string;
    createdAt: string;
    reason?: string;
  }>;
  metadata: Record<string, any>;
}

export default function TransactionDetailModal({ 
  transactionId, 
  isOpen, 
  onClose, 
  onTransactionUpdate 
}: TransactionDetailProps) {
  const [transaction, setTransaction] = useState<TransactionDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Fetch transaction details
  const fetchTransactionDetails = async () => {
    if (!transactionId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/finance/transactions/${transactionId}/details`);
      const data = await response.json();
      
      if (response.ok) {
        setTransaction(data.transaction);
      } else {
        toast.error('Failed to load transaction details');
      }
    } catch (error) {
      console.error('Error fetching transaction details:', error);
      toast.error('Error loading transaction details');
    } finally {
      setLoading(false);
    }
  };

  // Load transaction details when modal opens
  useEffect(() => {
    if (isOpen && transactionId) {
      fetchTransactionDetails();
    }
  }, [isOpen, transactionId]);

  // Clear data when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTransaction(null);
    }
  }, [isOpen]);

  // Transaction actions
  const processRefund = async () => {
    if (!transaction) return;
    
    const confirmRefund = confirm(
      `Are you sure you want to refund $${transaction.amount}? This action cannot be undone.`
    );
    
    if (!confirmRefund) return;

    setActionLoading('refund');
    try {
      const response = await fetch(`/api/admin/finance/transactions/${transaction.id}/refund`, {
        method: 'POST'
      });

      if (response.ok) {
        toast.success('Refund processed successfully');
        await fetchTransactionDetails();
        onTransactionUpdate?.();
      } else {
        toast.error('Failed to process refund');
      }
    } catch (error) {
      console.error('Error processing refund:', error);
      toast.error('Error processing refund');
    } finally {
      setActionLoading(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  // Utility functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-500';
      case 'PENDING': case 'PROCESSING': return 'bg-yellow-500';
      case 'FAILED': case 'CANCELLED': return 'bg-red-500';
      case 'DISPUTED': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="w-4 h-4" />;
      case 'PENDING': case 'PROCESSING': return <Clock className="w-4 h-4" />;
      case 'FAILED': case 'CANCELLED': return <XCircle className="w-4 h-4" />;
      case 'DISPUTED': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PAYMENT': return <CreditCard className="w-5 h-5 text-green-500" />;
      case 'PAYOUT': return <Send className="w-5 h-5 text-blue-500" />;
      case 'REFUND': return <ArrowDownLeft className="w-5 h-5 text-red-500" />;
      case 'FEE': return <Receipt className="w-5 h-5 text-gray-500" />;
      case 'COMMISSION': return <Building className="w-5 h-5 text-purple-500" />;
      default: return <DollarSign className="w-5 h-5" />;
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
          <DialogDescription>
            Comprehensive transaction information and management
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : transaction ? (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-lg bg-muted">
                  {getTypeIcon(transaction.type)}
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xl font-bold">{transaction.type} Transaction</h3>
                    <Badge className={`${getStatusColor(transaction.status)} text-white`}>
                      {getStatusIcon(transaction.status)}
                      <span className="ml-1">{transaction.status}</span>
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">{transaction.description}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Hash className="w-4 h-4" />
                      <span className="font-mono">{transaction.id}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() => copyToClipboard(transaction.id)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Created {formatDateTime(transaction.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                {transaction.status === 'COMPLETED' && 
                 transaction.type === 'PAYMENT' && 
                 transaction.refunds.length === 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={processRefund}
                    disabled={actionLoading === 'refund'}
                  >
                    {actionLoading === 'refund' ? (
                      <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <ArrowDownLeft className="w-4 h-4 mr-1" />
                    )}
                    Process Refund
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchTransactionDetails}
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Amount Information */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </div>
                    <p className="text-sm text-muted-foreground">Transaction Amount</p>
                  </div>
                  
                  {transaction.fees > 0 && (
                    <div className="text-center">
                      <div className="text-xl font-semibold text-orange-600">
                        {formatCurrency(transaction.fees, transaction.currency)}
                      </div>
                      <p className="text-sm text-muted-foreground">Processing Fees</p>
                    </div>
                  )}
                  
                  <div className="text-center">
                    <div className="text-xl font-semibold">
                      {formatCurrency(transaction.netAmount, transaction.currency)}
                    </div>
                    <p className="text-sm text-muted-foreground">Net Amount</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Information */}
            <Tabs defaultValue="details" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="parties">Parties</TabsTrigger>
                <TabsTrigger value="payment">Payment Info</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Transaction Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Transaction ID</label>
                        <div className="flex items-center space-x-2">
                          <code className="text-sm bg-muted px-2 py-1 rounded">{transaction.id}</code>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => copyToClipboard(transaction.id)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Type</label>
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(transaction.type)}
                          <span className="font-medium">{transaction.type}</span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Status</label>
                        <Badge className={`${getStatusColor(transaction.status)} text-white`}>
                          {getStatusIcon(transaction.status)}
                          <span className="ml-1">{transaction.status}</span>
                        </Badge>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Currency</label>
                        <span className="font-medium">{transaction.currency}</span>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Created At</label>
                        <span className="font-medium">{formatDateTime(transaction.createdAt)}</span>
                      </div>
                      
                      {transaction.processedAt && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Processed At</label>
                          <span className="font-medium">{formatDateTime(transaction.processedAt)}</span>
                        </div>
                      )}
                    </div>

                    {transaction.failureReason && (
                      <div className="border-l-4 border-red-500 bg-red-50 p-4">
                        <div className="flex items-center space-x-2">
                          <XCircle className="w-5 h-5 text-red-500" />
                          <span className="font-medium text-red-800">Failure Reason</span>
                        </div>
                        <p className="text-red-700 mt-1">{transaction.failureReason}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="parties" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {transaction.user && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <User className="w-5 h-5" />
                          <span>Client</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={transaction.user.avatar} alt={transaction.user.name} />
                            <AvatarFallback>{transaction.user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{transaction.user.name}</div>
                            <div className="text-sm text-muted-foreground">{transaction.user.email}</div>
                          </div>
                        </div>
                        <Badge variant="outline">{transaction.user.role}</Badge>
                      </CardContent>
                    </Card>
                  )}

                  {transaction.reader && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Shield className="w-5 h-5" />
                          <span>Reader</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={transaction.reader.avatar} alt={transaction.reader.name} />
                            <AvatarFallback>{transaction.reader.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{transaction.reader.name}</div>
                            <div className="text-sm text-muted-foreground">{transaction.reader.email}</div>
                          </div>
                        </div>
                        <Badge variant="outline">READER</Badge>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {transaction.session && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Related Session</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span>Session ID:</span>
                        <code className="text-sm bg-muted px-2 py-1 rounded">{transaction.session.id}</code>
                      </div>
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span>{transaction.session.duration} minutes</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Service:</span>
                        <span>{transaction.session.service}</span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="payment" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {transaction.paymentMethod && (
                      <div className="flex justify-between">
                        <span>Payment Method:</span>
                        <span className="font-medium">{transaction.paymentMethod}</span>
                      </div>
                    )}
                    
                    {transaction.stripeTransactionId && (
                      <div className="flex justify-between items-center">
                        <span>Stripe Transaction ID:</span>
                        <div className="flex items-center space-x-2">
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {transaction.stripeTransactionId}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => copyToClipboard(transaction.stripeTransactionId || '')}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => window.open(`https://dashboard.stripe.com/payments/${transaction.stripeTransactionId}`, '_blank')}
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Gross Amount:</span>
                        <span className="font-medium">{formatCurrency(transaction.amount, transaction.currency)}</span>
                      </div>
                      {transaction.fees > 0 && (
                        <div className="flex justify-between text-orange-600">
                          <span>Processing Fees:</span>
                          <span>-{formatCurrency(transaction.fees, transaction.currency)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>Net Amount:</span>
                        <span>{formatCurrency(transaction.netAmount, transaction.currency)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Transaction History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {transaction.refunds.length > 0 ? (
                      <div className="space-y-4">
                        <h4 className="font-medium">Refunds</h4>
                        {transaction.refunds.map((refund) => (
                          <div key={refund.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium">Refund #{refund.id}</div>
                                <div className="text-sm text-muted-foreground">
                                  {formatDateTime(refund.createdAt)}
                                </div>
                                {refund.reason && (
                                  <div className="text-sm mt-1">{refund.reason}</div>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-red-600">
                                  -{formatCurrency(refund.amount, transaction.currency)}
                                </div>
                                <Badge className={`${getStatusColor(refund.status)} text-white`}>
                                  {refund.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No refunds or modifications
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            Transaction not found
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}