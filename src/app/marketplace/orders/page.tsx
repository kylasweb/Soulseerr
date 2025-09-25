'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileText,
  Download,
  Eye,
  RefreshCw,
  CheckCircle,
  Clock,
  XCircle,
  Truck,
  Package
} from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  total: number;
  createdAt: string;
  items: Array<{
    id: string;
    title: string;
    type: string;
    price: number;
    quantity: number;
  }>;
  reader: {
    name: string;
    username: string;
  };
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      // This would fetch real orders from the API
      setOrders([]);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      PROCESSING: { color: 'bg-blue-100 text-blue-800', icon: RefreshCw },
      SHIPPED: { color: 'bg-purple-100 text-purple-800', icon: Truck },
      DELIVERED: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      CANCELLED: { color: 'bg-red-100 text-red-800', icon: XCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    return order.status.toLowerCase() === activeTab;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-mystical-purple/5 via-white to-mystical-pink/5">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-mystical-purple to-mystical-pink bg-clip-text text-transparent mb-4">
            Order History
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            View and manage all your marketplace orders and purchases
          </p>
        </div>

        {/* Orders Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-6 mb-8">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="processing">Processing</TabsTrigger>
            <TabsTrigger value="shipped">Shipped</TabsTrigger>
            <TabsTrigger value="delivered">Delivered</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mystical-purple mx-auto"></div>
                <p className="text-muted-foreground mt-2">Loading orders...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No orders found</h3>
                <p className="text-muted-foreground mb-4">
                  {activeTab === 'all'
                    ? "You haven't placed any orders yet."
                    : `No ${activeTab} orders found.`
                  }
                </p>
                <Button>
                  Browse Products
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <Card key={order.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            Order #{order.orderNumber}
                          </CardTitle>
                          <CardDescription>
                            {new Date(order.createdAt).toLocaleDateString()} •
                            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(order.status)}
                          <div className="text-2xl font-bold text-mystical-pink mt-2">
                            ${order.total.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Order Items */}
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                              <div className="flex-1">
                                <h4 className="font-medium">{item.title}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {item.type} • Qty: {item.quantity}
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="font-medium">${item.price.toFixed(2)}</div>
                                {item.quantity > 1 && (
                                  <div className="text-sm text-muted-foreground">
                                    ${(item.price * item.quantity).toFixed(2)} total
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Order Actions */}
                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="text-sm text-muted-foreground">
                            Sold by {order.reader.name} (@{order.reader.username})
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                            {order.status === 'DELIVERED' && (
                              <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}