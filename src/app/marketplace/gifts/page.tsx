import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Gift } from 'lucide-react';

export default function GiftsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-mystical-purple/5 via-white to-mystical-pink/5">
      <div className="container mx-auto px-6 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-mystical-purple to-mystical-pink bg-clip-text text-transparent mb-4">
            Virtual Gifts
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Send virtual gifts to support your favorite readers and show appreciation
          </p>
        </div>

        <div className="max-w-md mx-auto text-center">
          <Gift className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Virtual Gifts</h3>
          <p className="text-muted-foreground mb-6">
            Virtual gifts are now available in our community section. Visit the community page to explore and send gifts to your favorite readers.
          </p>
          <Link href="/community">
            <Button className="bg-mystical-pink hover:bg-mystical-pink/90">
              <Gift className="h-4 w-4 mr-2" />
              Go to Community
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}