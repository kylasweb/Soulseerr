"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Gift,
  Heart,
  Star,
  Sparkles,
  Crown,
  Gem,
  Flower,
  Coffee,
  Zap,
  Trophy,
  Diamond,
  Coins,
  Plus,
  Send,
  ShoppingCart
} from 'lucide-react';
import { useAuth } from '@/components/auth/EnhancedAuthProvider';

interface VirtualGift {
  id: string;
  name: string;
  emoji: string;
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  description: string;
  animation?: string;
}

interface GiftTransaction {
  id: string;
  gift: VirtualGift;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  recipient: {
    id: string;
    name: string;
    avatar?: string;
  };
  quantity: number;
  totalValue: number;
  timestamp: string;
  message?: string;
}

const VIRTUAL_GIFTS: VirtualGift[] = [
  {
    id: 'heart',
    name: 'Heart',
    emoji: '❤️',
    icon: Heart,
    value: 10,
    rarity: 'common',
    description: 'Show some love'
  },
  {
    id: 'star',
    name: 'Star',
    emoji: '⭐',
    icon: Star,
    value: 25,
    rarity: 'common',
    description: 'You shine bright!'
  },
  {
    id: 'sparkles',
    name: 'Magic',
    emoji: '✨',
    icon: Sparkles,
    value: 50,
    rarity: 'rare',
    description: 'Add some magic to the moment'
  },
  {
    id: 'flower',
    name: 'Mystic Rose',
    emoji: '🌹',
    icon: Flower,
    value: 75,
    rarity: 'rare',
    description: 'A beautiful spiritual blessing'
  },
  {
    id: 'coffee',
    name: 'Energy Boost',
    emoji: '☕',
    icon: Coffee,
    value: 100,
    rarity: 'rare',
    description: 'Keep the energy flowing'
  },
  {
    id: 'gem',
    name: 'Crystal',
    emoji: '💎',
    icon: Gem,
    value: 200,
    rarity: 'epic',
    description: 'Powerful crystal energy'
  },
  {
    id: 'crown',
    name: 'Crown',
    emoji: '👑',
    icon: Crown,
    value: 500,
    rarity: 'epic',
    description: 'You are royalty!'
  },
  {
    id: 'diamond',
    name: 'Diamond',
    emoji: '💍',
    icon: Diamond,
    value: 1000,
    rarity: 'legendary',
    description: 'The ultimate gift of appreciation'
  }
];

export function VirtualGifts() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<GiftTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBalance();
    fetchTransactions();
  }, []);

  const fetchBalance = async () => {
    try {
      const response = await fetch('/api/virtual-gifts/balance');
      if (response.ok) {
        const data = await response.json();
        setBalance(data.balance || 0);
      }
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/virtual-gifts/history');
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRarityBadgeColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800';
      case 'rare': return 'bg-blue-100 text-blue-800';
      case 'epic': return 'bg-purple-100 text-purple-800';
      case 'legendary': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-300 bg-gray-50';
      case 'rare': return 'border-blue-300 bg-blue-50';
      case 'epic': return 'border-purple-300 bg-purple-50';
      case 'legendary': return 'border-yellow-300 bg-yellow-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Virtual Gifts</h2>
        <p className="text-muted-foreground mb-6">
          Support your favorite readers and show appreciation with virtual gifts
        </p>

        {/* Balance Card */}
        <Card className="max-w-md mx-auto mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2">
              <Coins className="h-6 w-6 text-yellow-500" />
              <span className="text-2xl font-bold">{balance.toLocaleString()}</span>
              <span className="text-muted-foreground">coins</span>
            </div>
            <p className="text-sm text-muted-foreground text-center mt-2">
              Your current balance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gift Shop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {VIRTUAL_GIFTS.map((gift) => (
          <Card key={gift.id} className={`cursor-pointer transition-all hover:shadow-lg ${getRarityColor(gift.rarity)}`}>
            <CardContent className="p-4 text-center">
              <div className="text-3xl mb-2">{gift.emoji}</div>
              <h3 className="font-semibold mb-1">{gift.name}</h3>
              <Badge className={`mb-2 ${getRarityBadgeColor(gift.rarity)}`}>
                {gift.rarity}
              </Badge>
              <p className="text-sm text-muted-foreground mb-3">{gift.description}</p>
              <div className="flex items-center justify-center space-x-1 text-mystical-pink font-bold">
                <Coins className="h-4 w-4" />
                <span>{gift.value}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Gift History</CardTitle>
          <CardDescription>
            Your recent gift transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mystical-purple mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8">
              <Gift className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No gifts yet</h3>
              <p className="text-muted-foreground">
                Start sending virtual gifts to support your favorite readers!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{transaction.gift.emoji}</div>
                    <div>
                      <p className="font-medium">
                        Sent {transaction.gift.name} to {transaction.recipient.name}
                      </p>
                      {transaction.message && (
                        <p className="text-sm text-muted-foreground">"{transaction.message}"</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(transaction.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1 text-mystical-pink font-bold">
                      <Coins className="h-4 w-4" />
                      <span>-{transaction.totalValue}</span>
                    </div>
                    <Badge className={getRarityBadgeColor(transaction.gift.rarity)}>
                      {transaction.gift.rarity}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface VirtualGift {
  id: string;
  name: string;
  emoji: string;
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  description: string;
  animation?: string;
}

// ...existing code...

interface GiftTransaction {
  id: string;
  gift: VirtualGift;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  recipient: {
    id: string;
    name: string;
    avatar?: string;
  };
  quantity: number;
  totalValue: number;
  timestamp: string;
  message?: string;
}

interface GiftShopProps {
  recipientId: string;
  recipientName: string;
  onGiftSent?: (gift: VirtualGift, quantity: number) => void;
}

function GiftShop({ recipientId, recipientName, onGiftSent }: GiftShopProps) {
  const { user } = useAuth();
  const [selectedGift, setSelectedGift] = useState<VirtualGift | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const [balance, setBalance] = useState(0);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const response = await fetch('/api/virtual-gifts/balance');
      if (response.ok) {
        const data = await response.json();
        setBalance(data.balance || 0);
      }
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    }
  };

  const sendGift = async () => {
    if (!selectedGift || !user) return;

    const totalCost = selectedGift.value * quantity;
    if (balance < totalCost) {
      // Show insufficient funds message
      alert('Insufficient balance to send this gift.');
      return;
    }

    setSending(true);
    try {
      const response = await fetch('/api/virtual-gifts/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId,
          giftId: selectedGift.id,
          quantity,
          message
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert('Gift sent successfully!');
        onGiftSent?.(selectedGift, quantity);
        setSelectedGift(null);
        setQuantity(1);
        setMessage('');
        fetchBalance(); // Refresh balance
      } else {
        alert('Failed to send gift. Please try again.');
      }
    } catch (error) {
      console.error('Failed to send gift:', error);
      alert('Failed to send gift. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const getRarityBadgeColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800';
      case 'rare': return 'bg-blue-100 text-blue-800';
      case 'epic': return 'bg-purple-100 text-purple-800';
      case 'legendary': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Gift className="h-4 w-4 mr-2" />
          Send Gift
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Send Gift to {recipientName}
          </DialogTitle>
          <DialogDescription>
            Show your appreciation with a virtual gift
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Balance */}
          <div className="flex items-center justify-between p-4 bg-mystical-pink/10 rounded-lg">
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-mystical-pink" />
              <span className="font-semibold">Your Balance:</span>
            </div>
            <span className="text-lg font-bold">{balance} coins</span>
          </div>

          {/* Gift Selection */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {VIRTUAL_GIFTS.map((gift) => {
              const IconComponent = gift.icon;
              const isSelected = selectedGift?.id === gift.id;
              
              return (
                <Card 
                  key={gift.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isSelected ? 'ring-2 ring-mystical-pink shadow-lg' : ''
                  } ${getRarityColor(gift.rarity)}`}
                  onClick={() => setSelectedGift(gift)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl mb-2">{gift.emoji}</div>
                    <h3 className="font-semibold text-sm mb-1">{gift.name}</h3>
                    <Badge className={`text-xs mb-2 ${getRarityBadgeColor(gift.rarity)}`}>
                      {gift.rarity}
                    </Badge>
                    <p className="text-xs text-muted-foreground mb-2">
                      {gift.description}
                    </p>
                    <div className="flex items-center justify-center gap-1 text-sm font-bold text-mystical-pink">
                      <Coins className="h-3 w-3" />
                      {gift.value}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Gift Details & Send */}
          {selectedGift && (
            <Card className="border-mystical-pink/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="text-2xl">{selectedGift.emoji}</span>
                  Sending {selectedGift.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Quantity */}
                <div className="flex items-center gap-4">
                  <label className="font-semibold">Quantity:</label>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      -
                    </Button>
                    <Input 
                      type="number" 
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 text-center"
                      min={1}
                    />
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      +
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total: <span className="font-bold text-mystical-pink">
                      {selectedGift.value * quantity} coins
                    </span>
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <label className="font-semibold">Message (optional):</label>
                  <Input
                    placeholder="Add a personal message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    maxLength={100}
                  />
                </div>

                {/* Send Button */}
                <div className="flex justify-between items-center pt-4">
                  <div className="text-sm text-muted-foreground">
                    {balance < selectedGift.value * quantity && (
                      <span className="text-red-500">Insufficient balance</span>
                    )}
                  </div>
                  <Button 
                    onClick={sendGift}
                    disabled={sending || balance < selectedGift.value * quantity}
                    className="bg-mystical-pink hover:bg-mystical-pink/90"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Gift
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Buy More Coins */}
          <Card className="bg-gradient-to-r from-mystical-pink/10 to-mystical-purple/10">
            <CardContent className="p-4 text-center">
              <h3 className="font-semibold mb-2">Need More Coins?</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Purchase coin packages to send more gifts
              </p>
              <Button variant="outline">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Buy Coins
              </Button>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}


// Helper for card color
const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'common': return 'border-gray-300 bg-gray-50';
    case 'rare': return 'border-blue-300 bg-blue-50';
    case 'epic': return 'border-purple-300 bg-purple-50';
    case 'legendary': return 'border-yellow-300 bg-yellow-50';
    default: return 'border-gray-300 bg-gray-50';
  }
};