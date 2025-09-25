// Database types generated from Prisma schema
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          username: string | null
          password_hash: string
          role: 'CLIENT' | 'READER' | 'ADMIN'
          status: 'ACTIVE' | 'SUSPENDED' | 'PENDING' | 'BANNED'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          username?: string | null
          password_hash: string
          role?: 'CLIENT' | 'READER' | 'ADMIN'
          status?: 'ACTIVE' | 'SUSPENDED' | 'PENDING' | 'BANNED'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string | null
          password_hash?: string
          role?: 'CLIENT' | 'READER' | 'ADMIN'
          status?: 'ACTIVE' | 'SUSPENDED' | 'PENDING' | 'BANNED'
          created_at?: string
          updated_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          user_id: string
          first_name: string | null
          last_name: string | null
          avatar: string | null
          bio: string | null
          date_of_birth: string | null
          timezone: string
          preferences: any | null
          preferred_session_types: any | null
          preferred_categories: any | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          first_name?: string | null
          last_name?: string | null
          avatar?: string | null
          bio?: string | null
          date_of_birth?: string | null
          timezone?: string
          preferences?: any | null
          preferred_session_types?: any | null
          preferred_categories?: any | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          first_name?: string | null
          last_name?: string | null
          avatar?: string | null
          bio?: string | null
          date_of_birth?: string | null
          timezone?: string
          preferences?: any | null
          preferred_session_types?: any | null
          preferred_categories?: any | null
          created_at?: string
          updated_at?: string
        }
      }
      readers: {
        Row: {
          id: string
          user_id: string
          first_name: string
          last_name: string
          avatar: string | null
          bio: string
          headline: string | null
          specialties: any | null
          experience: number
          certifications: any | null
          languages: any | null
          session_types: any | null
          pricing: any | null
          status: 'ONLINE' | 'OFFLINE' | 'BUSY' | 'AWAY' | 'INVISIBLE'
          is_verified: boolean
          verification_docs: any | null
          stripe_account_id: string | null
          total_sessions: number
          total_earnings: number
          average_rating: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          first_name: string
          last_name: string
          avatar?: string | null
          bio: string
          headline?: string | null
          specialties?: any | null
          experience?: number
          certifications?: any | null
          languages?: any | null
          session_types?: any | null
          pricing?: any | null
          status?: 'ONLINE' | 'OFFLINE' | 'BUSY' | 'AWAY' | 'INVISIBLE'
          is_verified?: boolean
          verification_docs?: any | null
          stripe_account_id?: string | null
          total_sessions?: number
          total_earnings?: number
          average_rating?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          first_name?: string
          last_name?: string
          avatar?: string | null
          bio?: string
          headline?: string | null
          specialties?: any | null
          experience?: number
          certifications?: any | null
          languages?: any | null
          session_types?: any | null
          pricing?: any | null
          status?: 'ONLINE' | 'OFFLINE' | 'BUSY' | 'AWAY' | 'INVISIBLE'
          is_verified?: boolean
          verification_docs?: any | null
          stripe_account_id?: string | null
          total_sessions?: number
          total_earnings?: number
          average_rating?: number
          created_at?: string
          updated_at?: string
        }
      }
      admins: {
        Row: {
          id: string
          user_id: string
          first_name: string | null
          last_name: string | null
          avatar: string | null
          permissions: any | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          first_name?: string | null
          last_name?: string | null
          avatar?: string | null
          permissions?: any | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          first_name?: string | null
          last_name?: string | null
          avatar?: string | null
          permissions?: any | null
          created_at?: string
          updated_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          session_id: string
          client_id: string
          reader_id: string
          type: 'CHAT' | 'CALL' | 'VIDEO'
          status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW' | 'DISCONNECTED'
          scheduled_at: string | null
          started_at: string | null
          ended_at: string | null
          duration: number | null
          reader_rate: number
          total_cost: number | null
          transaction_id: string | null
          recording_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          session_id?: string
          client_id: string
          reader_id: string
          type: 'CHAT' | 'CALL' | 'VIDEO'
          status?: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW' | 'DISCONNECTED'
          scheduled_at?: string | null
          started_at?: string | null
          ended_at?: string | null
          duration?: number | null
          reader_rate: number
          total_cost?: number | null
          transaction_id?: string | null
          recording_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          client_id?: string
          reader_id?: string
          type?: 'CHAT' | 'CALL' | 'VIDEO'
          status?: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW' | 'DISCONNECTED'
          scheduled_at?: string | null
          started_at?: string | null
          ended_at?: string | null
          duration?: number | null
          reader_rate?: number
          total_cost?: number | null
          transaction_id?: string | null
          recording_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          session_id: string
          sender_id: string
          content: string
          message_type: 'TEXT' | 'IMAGE' | 'SYSTEM'
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          sender_id: string
          content: string
          message_type?: 'TEXT' | 'IMAGE' | 'SYSTEM'
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          sender_id?: string
          content?: string
          message_type?: 'TEXT' | 'IMAGE' | 'SYSTEM'
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          session_id: string
          client_id: string
          reader_id: string
          rating: number
          comment: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          session_id: string
          client_id: string
          reader_id: string
          rating: number
          comment?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          client_id?: string
          reader_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      wallets: {
        Row: {
          id: string
          user_id: string
          balance: number
          currency: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          balance?: number
          currency?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          balance?: number
          currency?: string
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          transaction_id: string
          user_id: string
          type: 'ADD_FUNDS' | 'SESSION_CHARGE' | 'REFUND' | 'PAYOUT' | 'PURCHASE' | 'GIFT_PURCHASE'
          amount: number
          currency: string
          status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CANCELLED'
          session_id: string | null
          stripe_payment_intent_id: string | null
          stripe_transfer_id: string | null
          reader_earnings: number | null
          platform_revenue: number | null
          description: string | null
          metadata: any | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          transaction_id?: string
          user_id: string
          type: 'ADD_FUNDS' | 'SESSION_CHARGE' | 'REFUND' | 'PAYOUT' | 'PURCHASE' | 'GIFT_PURCHASE'
          amount: number
          currency?: string
          status?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CANCELLED'
          session_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_transfer_id?: string | null
          reader_earnings?: number | null
          platform_revenue?: number | null
          description?: string | null
          metadata?: any | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          transaction_id?: string
          user_id?: string
          type?: 'ADD_FUNDS' | 'SESSION_CHARGE' | 'REFUND' | 'PAYOUT' | 'PURCHASE' | 'GIFT_PURCHASE'
          amount?: number
          currency?: string
          status?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CANCELLED'
          session_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_transfer_id?: string | null
          reader_earnings?: number | null
          platform_revenue?: number | null
          description?: string | null
          metadata?: any | null
          created_at?: string
          updated_at?: string
        }
      }
      payouts: {
        Row: {
          id: string
          reader_id: string
          amount: number
          currency: string
          status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
          stripe_transfer_id: string | null
          created_at: string
          processed_at: string | null
        }
        Insert: {
          id?: string
          reader_id: string
          amount: number
          currency?: string
          status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
          stripe_transfer_id?: string | null
          created_at?: string
          processed_at?: string | null
        }
        Update: {
          id?: string
          reader_id?: string
          amount?: number
          currency?: string
          status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
          stripe_transfer_id?: string | null
          created_at?: string
          processed_at?: string | null
        }
      }
      availability: {
        Row: {
          id: string
          reader_id: string
          day_of_week: number
          start_time: string
          end_time: string
          is_recurring: boolean
          specific_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          reader_id: string
          day_of_week: number
          start_time: string
          end_time: string
          is_recurring?: boolean
          specific_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          reader_id?: string
          day_of_week?: number
          start_time?: string
          end_time?: string
          is_recurring?: boolean
          specific_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          stripe_product_id: string | null
          name: string
          description: string
          type: 'SERVICE' | 'DIGITAL' | 'PHYSICAL'
          category: string
          price: number
          currency: string
          stock_quantity: number | null
          sku: string | null
          download_url: string | null
          file_url: string | null
          weight: number | null
          dimensions: any | null
          images: any | null
          status: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK' | 'DRAFT'
          featured: boolean
          reader_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          stripe_product_id?: string | null
          name: string
          description: string
          type: 'SERVICE' | 'DIGITAL' | 'PHYSICAL'
          category: string
          price: number
          currency?: string
          stock_quantity?: number | null
          sku?: string | null
          download_url?: string | null
          file_url?: string | null
          weight?: number | null
          dimensions?: any | null
          images?: any | null
          status?: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK' | 'DRAFT'
          featured?: boolean
          reader_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          stripe_product_id?: string | null
          name?: string
          description?: string
          type?: 'SERVICE' | 'DIGITAL' | 'PHYSICAL'
          category?: string
          price?: number
          currency?: string
          stock_quantity?: number | null
          sku?: string | null
          download_url?: string | null
          file_url?: string | null
          weight?: number | null
          dimensions?: any | null
          images?: any | null
          status?: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK' | 'DRAFT'
          featured?: boolean
          reader_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_id: string
          client_id: string
          status: 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED'
          total_amount: number
          currency: string
          stripe_payment_intent_id: string | null
          shipping_address: any | null
          tracking_number: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id?: string
          client_id: string
          status?: 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED'
          total_amount: number
          currency?: string
          stripe_payment_intent_id?: string | null
          shipping_address?: any | null
          tracking_number?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          client_id?: string
          status?: 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED'
          total_amount?: number
          currency?: string
          stripe_payment_intent_id?: string | null
          shipping_address?: any | null
          tracking_number?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          price: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity?: number
          price: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          price?: number
          created_at?: string
        }
      }
      live_streams: {
        Row: {
          id: string
          stream_id: string
          reader_id: string
          title: string
          description: string | null
          category: string
          status: 'SCHEDULED' | 'LIVE' | 'ENDED' | 'CANCELLED'
          scheduled_at: string | null
          started_at: string | null
          ended_at: string | null
          viewer_count: number
          max_viewers: number | null
          recording_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          stream_id?: string
          reader_id: string
          title: string
          description?: string | null
          category: string
          status?: 'SCHEDULED' | 'LIVE' | 'ENDED' | 'CANCELLED'
          scheduled_at?: string | null
          started_at?: string | null
          ended_at?: string | null
          viewer_count?: number
          max_viewers?: number | null
          recording_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          stream_id?: string
          reader_id?: string
          title?: string
          description?: string | null
          category?: string
          status?: 'SCHEDULED' | 'LIVE' | 'ENDED' | 'CANCELLED'
          scheduled_at?: string | null
          started_at?: string | null
          ended_at?: string | null
          viewer_count?: number
          max_viewers?: number | null
          recording_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      virtual_gifts: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          currency: string
          image_url: string
          animation_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          currency?: string
          image_url: string
          animation_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          currency?: string
          image_url?: string
          animation_url?: string | null
          created_at?: string
        }
      }
      gifts: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          gift_id: string
          session_id: string | null
          stream_id: string | null
          message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          gift_id: string
          session_id?: string | null
          stream_id?: string | null
          message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          gift_id?: string
          session_id?: string | null
          stream_id?: string | null
          message?: string | null
          created_at?: string
        }
      }
      forum_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          icon: string | null
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          icon?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          icon?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      forum_posts: {
        Row: {
          id: string
          author_id: string
          category_id: string
          title: string
          content: string
          status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'DELETED'
          is_pinned: boolean
          is_locked: boolean
          view_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          author_id: string
          category_id: string
          title: string
          content: string
          status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'DELETED'
          is_pinned?: boolean
          is_locked?: boolean
          view_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          author_id?: string
          category_id?: string
          title?: string
          content?: string
          status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'DELETED'
          is_pinned?: boolean
          is_locked?: boolean
          view_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      forum_replies: {
        Row: {
          id: string
          post_id: string
          author_id: string
          content: string
          status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'DELETED'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          post_id: string
          author_id: string
          content: string
          status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'DELETED'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          author_id?: string
          content?: string
          status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'DELETED'
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          content: string
          message_type: 'TEXT' | 'IMAGE' | 'SYSTEM'
          is_read: boolean
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          content: string
          message_type?: 'TEXT' | 'IMAGE' | 'SYSTEM'
          is_read?: boolean
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          content?: string
          message_type?: 'TEXT' | 'IMAGE' | 'SYSTEM'
          is_read?: boolean
          read_at?: string | null
          created_at?: string
        }
      }
      system_settings: {
        Row: {
          id: string
          key: string
          value: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          entity_type: string
          entity_id: string
          changes: any | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          entity_type: string
          entity_id: string
          changes?: any | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          entity_type?: string
          entity_id?: string
          changes?: any | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}