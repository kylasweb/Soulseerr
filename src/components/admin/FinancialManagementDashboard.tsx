'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  CreditCard, 
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  PieChart,
  BarChart3,
  Calendar,
  Download,
  Filter,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Send,
  Receipt,
  Building,
  User,
  ShoppingCart,
  Zap,
  Globe,
  Shield
} from 'lucide-react';
import { useSocket } from '@/hooks/use-socket';
import { toast } from 'sonner';

interface FinancialStats {
  totalRevenue: number;
  monthlyRevenue: number;
  revenueGrowth: number;
  totalTransactions: number;
  pendingPayouts: number;
  totalPayouts: number;
  platformCommission: number;
  readerEarnings: number;
  averageSessionValue: number;
  refundRate: number;
  disputeRate: number;
  paymentSuccessRate: number;
}

interface Transaction {
  id: string;
  type: 'PAYMENT' | 'PAYOUT' | 'REFUND' | 'FEE' | 'COMMISSION';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'DISPUTED';
  amount: number;
  currency: string;
  description: string;
  userId?: string;
  user?: {
    name: string;
    email: string;
    avatar?: string;
    role: string;
  };
  readerId?: string;
  reader?: {
    name: string;
    email: string;
    avatar?: string;
  };
  sessionId?: string;
  paymentMethod?: string;
  stripeTransactionId?: string;
  createdAt: string;
  processedAt?: string;
  failureReason?: string;
  metadata?: Record<string, any>;
}

interface PayoutRequest {
  id: string;
  readerId: string;
  reader: {
    name: string;
    email: string;
    avatar?: string;
  };
  amount: number;
  currency: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  requestedAt: string;
  processedAt?: string;
  bankAccount?: {
    lastFour: string;
    bankName: string;
  };
  stripePayoutId?: string;
  failureReason?: string;
  fees: number;
  netAmount: number;
}

interface RevenueData {
  date: string;
  revenue: number;
  transactions: number;
  commission: number;
  payouts: number;
}

interface FinancialFilters {
  search: string;
  type: string;
  status: string;
  dateRange: string;
  paymentMethod: string;
  minAmount: string;
  maxAmount: string;
}

export default function FinancialManagementDashboard() {
  const [stats, setStats] = useState<FinancialStats>({
    totalRevenue: 0,
    monthlyRevenue: 0,
    revenueGrowth: 0,
    totalTransactions: 0,
    pendingPayouts: 0,
    totalPayouts: 0,
    platformCommission: 0,
    readerEarnings: 0,
    averageSessionValue: 0,
    refundRate: 0,
    disputeRate: 0,
    paymentSuccessRate: 0
  });

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FinancialFilters>({
    search: '',
    type: 'all',
    status: 'all',
    dateRange: 'month',
    paymentMethod: 'all',
    minAmount: '',
    maxAmount: ''
  });

  const { socket } = useSocket();

  // Fetch financial statistics
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/finance/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch financial stats:', error);
      toast.error('Failed to load financial statistics');
    }
  }, []);

  // Fetch transactions
  const fetchTransactions = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        type: filters.type,
        status: filters.status,
        search: filters.search,
        dateRange: filters.dateRange,
        paymentMethod: filters.paymentMethod,
        minAmount: filters.minAmount,
        maxAmount: filters.maxAmount
      });

      const response = await fetch(`/api/admin/finance/transactions?${params}`);
      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch payout requests
  const fetchPayouts = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        status: filters.status,
        search: filters.search,
        dateRange: filters.dateRange
      });

      const response = await fetch(`/api/admin/finance/payouts?${params}`);
      const data = await response.json();
      setPayouts(data.payouts || []);
    } catch (error) {
      console.error('Failed to fetch payouts:', error);
      toast.error('Failed to load payouts');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch revenue data for charts
  const fetchRevenueData = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/finance/revenue-data?period=${filters.dateRange}`);
      const data = await response.json();
      setRevenueData(data.revenueData || []);
    } catch (error) {
      console.error('Failed to fetch revenue data:', error);
    }
  }, [filters.dateRange]);

  // Load data on component mount
  useEffect(() => {
    fetchStats();
    fetchRevenueData();
  }, [fetchStats, fetchRevenueData]);

  useEffect(() => {
    if (activeTab === 'transactions') {
      fetchTransactions(1);
    } else if (activeTab === 'payouts') {
      fetchPayouts(1);
    }
  }, [activeTab, fetchTransactions, fetchPayouts]);

  // Real-time updates via socket
  useEffect(() => {
    if (!socket) return;

    const handleFinancialUpdate = (data: { type: string; transactionId?: string; payoutId?: string }) => {
      if (data.type === 'transaction_completed' || data.type === 'payment_processed') {
        fetchTransactions(currentPage);
        fetchStats();
        fetchRevenueData();
      } else if (data.type === 'payout_requested' || data.type === 'payout_processed') {
        fetchPayouts(currentPage);
        fetchStats();
      }
    };

    socket.on('admin:finance:update', handleFinancialUpdate);

    return () => {
      socket.off('admin:finance:update', handleFinancialUpdate);
    };
  }, [socket, currentPage, fetchTransactions, fetchPayouts, fetchStats, fetchRevenueData]);

  // Transaction actions
  const processRefund = async (transactionId: string) => {
    try {
      const response = await fetch(`/api/admin/finance/transactions/${transactionId}/refund`, {
        method: 'POST'
      });

      if (response.ok) {
        toast.success('Refund processed successfully');
        fetchTransactions(currentPage);
        fetchStats();
      } else {
        toast.error('Failed to process refund');
      }
    } catch (error) {
      console.error('Error processing refund:', error);
      toast.error('Error processing refund');
    }
  };

  // Payout actions
  const processPayout = async (payoutId: string) => {
    try {
      const response = await fetch(`/api/admin/finance/payouts/${payoutId}/process`, {
        method: 'POST'
      });

      if (response.ok) {
        toast.success('Payout processed successfully');
        fetchPayouts(currentPage);
        fetchStats();
      } else {
        toast.error('Failed to process payout');
      }
    } catch (error) {
      console.error('Error processing payout:', error);
      toast.error('Error processing payout');
    }
  };

  const cancelPayout = async (payoutId: string, reason: string) => {
    try {
      const response = await fetch(`/api/admin/finance/payouts/${payoutId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });

      if (response.ok) {
        toast.success('Payout cancelled');
        fetchPayouts(currentPage);
        fetchStats();
      } else {
        toast.error('Failed to cancel payout');
      }
    } catch (error) {
      console.error('Error cancelling payout:', error);
      toast.error('Error cancelling payout');
    }
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

  const getTransactionTypeIcon = (type: string) => {
    switch (type) {
      case 'PAYMENT': return <CreditCard className="w-4 h-4 text-green-500" />;
      case 'PAYOUT': return <Send className="w-4 h-4 text-blue-500" />;
      case 'REFUND': return <ArrowDownLeft className="w-4 h-4 text-red-500" />;
      case 'FEE': return <Receipt className="w-4 h-4 text-gray-500" />;
      case 'COMMISSION': return <Building className="w-4 h-4 text-purple-500" />;
      default: return <DollarSign className="w-4 h-4" />;
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

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  if (loading && transactions.length === 0 && payouts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Financial Management</h1>
          <p className="text-muted-foreground">Monitor transactions, process payouts, and track revenue</p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
          <Button className="flex items-center gap-2" onClick={() => {
            fetchStats();
            fetchRevenueData();
            if (activeTab === 'transactions') fetchTransactions(currentPage);
            if (activeTab === 'payouts') fetchPayouts(currentPage);
          }}>
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              <span className={`inline-flex items-center ${stats.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.revenueGrowth >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                {formatPercentage(stats.revenueGrowth)} from last month
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.monthlyRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalTransactions} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
            <Wallet className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingPayouts}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(stats.totalPayouts)} total payouts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Commission</CardTitle>
            <PieChart className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.platformCommission)}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(stats.readerEarnings)} reader earnings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{formatCurrency(stats.averageSessionValue)}</div>
            <p className="text-xs text-muted-foreground">Average Session Value</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">{stats.paymentSuccessRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Payment Success Rate</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.refundRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Refund Rate</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-red-600">{stats.disputeRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Dispute Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Management Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">
            Transactions
          </TabsTrigger>
          <TabsTrigger value="payouts">
            Payouts
            {stats.pendingPayouts > 0 && (
              <Badge className="ml-2 bg-yellow-500">{stats.pendingPayouts}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Client Payments</span>
                  <span className="font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Platform Commission</span>
                  <span className="font-bold text-purple-600">{formatCurrency(stats.platformCommission)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Reader Earnings</span>
                  <span className="font-bold text-blue-600">{formatCurrency(stats.readerEarnings)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Processing Fees</span>
                  <span className="font-bold text-gray-600">{formatCurrency(stats.totalRevenue * 0.029)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Transaction Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Success Rate</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${stats.paymentSuccessRate}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{stats.paymentSuccessRate.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Refund Rate</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-500 h-2 rounded-full" 
                        style={{ width: `${stats.refundRate}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{stats.refundRate.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Dispute Rate</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full" 
                        style={{ width: `${stats.disputeRate}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{stats.disputeRate.toFixed(1)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Financial Activity</CardTitle>
              <CardDescription>Latest transactions and payouts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Recent activity summary will be displayed here...
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          {/* Transactions Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <Input
                    placeholder="Search transactions..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="w-full"
                  />
                </div>
                <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="PAYMENT">Payment</SelectItem>
                    <SelectItem value="PAYOUT">Payout</SelectItem>
                    <SelectItem value="REFUND">Refund</SelectItem>
                    <SelectItem value="FEE">Fee</SelectItem>
                    <SelectItem value="COMMISSION">Commission</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    <SelectItem value="DISPUTED">Disputed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filters.dateRange} onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                All platform transactions and financial activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            {getTransactionTypeIcon(transaction.type)}
                            <div>
                              <div className="font-medium">{transaction.id}</div>
                              <div className="text-sm text-muted-foreground">{transaction.description}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {transaction.user ? (
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={transaction.user.avatar} alt={transaction.user.name} />
                                <AvatarFallback className="text-xs">{transaction.user.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="text-sm font-medium">{transaction.user.name}</div>
                                <div className="text-xs text-muted-foreground">{transaction.user.role}</div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">System</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {transaction.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(transaction.status)} text-white`}>
                            {getStatusIcon(transaction.status)}
                            <span className="ml-1">{transaction.status}</span>
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(transaction.amount, transaction.currency)}
                        </TableCell>
                        <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {transaction.status === 'COMPLETED' && transaction.type === 'PAYMENT' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-red-500"
                                onClick={() => processRefund(transaction.id)}
                              >
                                <ArrowDownLeft className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {transactions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No transactions found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts" className="space-y-6">
          {/* Payouts Table */}
          <Card>
            <CardHeader>
              <CardTitle>Payout Requests</CardTitle>
              <CardDescription>
                Manage reader payout requests and disbursements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reader</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead>Bank Account</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payouts.map((payout) => (
                      <TableRow key={payout.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={payout.reader.avatar} alt={payout.reader.name} />
                              <AvatarFallback>{payout.reader.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{payout.reader.name}</div>
                              <div className="text-sm text-muted-foreground">{payout.reader.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{formatCurrency(payout.amount)}</div>
                            <div className="text-sm text-muted-foreground">
                              Net: {formatCurrency(payout.netAmount)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(payout.status)} text-white`}>
                            {getStatusIcon(payout.status)}
                            <span className="ml-1">{payout.status}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(payout.requestedAt)}</TableCell>
                        <TableCell>
                          {payout.bankAccount ? (
                            <div className="text-sm">
                              <div className="font-medium">{payout.bankAccount.bankName}</div>
                              <div className="text-muted-foreground">***{payout.bankAccount.lastFour}</div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">No account</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {payout.status === 'PENDING' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-green-500"
                                  onClick={() => processPayout(payout.id)}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-red-500"
                                  onClick={() => {
                                    const reason = prompt('Reason for cancellation:');
                                    if (reason) cancelPayout(payout.id, reason);
                                  }}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {payouts.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No payout requests found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Financial Analytics</CardTitle>
              <CardDescription>Revenue trends and financial insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Financial analytics dashboard coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}