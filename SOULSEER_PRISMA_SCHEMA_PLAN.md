# SoulSeer Prisma Schema Plan

## Overview
This document outlines the comprehensive database schema for the SoulSeer spiritual consultation platform. The schema is designed to support all core features including user management, real-time sessions, financial transactions, marketplace functionality, and community engagement.

## Core Entities & Relationships

### 1. User Management System

#### User (Base Table)
```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  username      String?  @unique
  passwordHash  String
  role          UserRole
  status        UserStatus @default(ACTIVE)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Profile relationships
  clientProfile  Client?
  readerProfile  Reader?
  adminProfile   Admin?
  
  // Financial relationships
  wallet         Wallet?
  transactions   Transaction[]
  
  // Session relationships
  clientSessions Session[] @relation("ClientSessions")
  readerSessions Session[] @relation("ReaderSessions")
  
  // Marketplace relationships
  orders         Order[]
  
  // Community relationships
  sentMessages   Message[] @relation("SentMessages")
  receivedMessages Message[] @relation("ReceivedMessages")
  forumPosts     ForumPost[]
  forumReplies   ForumReply[]
  liveStreams    LiveStream[]
  giftPurchases  GiftPurchase[]
  giftReceived   Gift[] @relation("GiftReceiver")
  
  @@map("users")
}

enum UserRole {
  CLIENT
  READER
  ADMIN
}

enum UserStatus {
  ACTIVE
  SUSPENDED
  PENDING
  BANNED
}
```

#### Client Profile
```prisma
model Client {
  id              String   @id @default(cuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id])
  
  firstName       String?
  lastName        String?
  avatar          String?
  bio             String?
  dateOfBirth     DateTime?
  timezone        String   @default("UTC")
  preferences     Json     // Store client preferences as JSON
  
  // Session preferences
  preferredSessionTypes String[] // ["chat", "call", "video"]
  preferredCategories   String[]
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@map("clients")
}
```

#### Reader Profile
```prisma
model Reader {
  id              String   @id @default(cuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id])
  
  // Personal Information
  firstName       String
  lastName        String
  avatar          String?
  bio             String
  headline        String?  // Short professional tagline
  
  // Professional Details
  specialties     String[] // ["tarot", "astrology", "mediumship"]
  experience      Int      // Years of experience
  certifications  String[]
  languages       String[] // ["en", "es", "fr"]
  
  // Business Settings
  sessionTypes    String[] // ["chat", "call", "video"]
  pricing         Json     // Dynamic pricing per session type
  availability    Availability[]
  status          ReaderStatus @default(OFFLINE)
  
  // Verification & Compliance
  isVerified      Boolean  @default(false)
  verificationDocs String[] // Paths to verification documents
  stripeAccountId String?  // Stripe Connect account ID
  
  // Statistics
  totalSessions   Int      @default(0)
  totalEarnings   Float    @default(0)
  averageRating   Float    @default(0)
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@map("readers")
}

enum ReaderStatus {
  ONLINE
  OFFLINE
  BUSY
  AWAY
  INVISIBLE
}
```

#### Admin Profile
```prisma
model Admin {
  id              String   @id @default(cuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id])
  
  firstName       String?
  lastName        String?
  avatar          String?
  permissions     String[] // ["manage_users", "manage_finances", "moderate_content"]
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@map("admins")
}
```

### 2. Session Management System

#### Session
```prisma
model Session {
  id              String        @id @default(cuid())
  sessionId       String        @unique // External session ID for WebRTC
  
  // Participants
  clientId        String
  client          User          @relation("ClientSessions", fields: [clientId], references: [id])
  readerId        String
  reader          User          @relation("ReaderSessions", fields: [readerId], references: [id])
  
  // Session Details
  type            SessionType
  status          SessionStatus
  scheduledAt     DateTime?
  startedAt       DateTime?
  endedAt         DateTime?
  duration        Int?          // Duration in minutes
  
  // Financial Details
  readerRate      Float         // Per-minute rate
  totalCost       Float?
  transactionId   String?       // Reference to transaction
  
  // Content & Recording
  chatMessages    ChatMessage[]
  recordingUrl    String?
  
  // Review & Rating
  review          Review?
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  
  @@map("sessions")
}

enum SessionType {
  CHAT
  CALL
  VIDEO
}

enum SessionStatus {
  SCHEDULED
  IN_PROGRESS
  COMPLETED
  CANCELLED
  NO_SHOW
  DISCONNECTED
}
```

#### Chat Message
```prisma
model ChatMessage {
  id          String   @id @default(cuid())
  sessionId   String
  session     Session  @relation(fields: [sessionId], references: [id])
  
  senderId    String
  sender      User     @relation(fields: [senderId], references: [id])
  
  content     String
  messageType MessageType @default(TEXT)
  
  createdAt   DateTime @default(now())
  
  @@map("chat_messages")
}

enum MessageType {
  TEXT
  IMAGE
  SYSTEM
}
```

#### Review
```prisma
model Review {
  id          String   @id @default(cuid())
  sessionId   String   @unique
  session     Session  @relation(fields: [sessionId], references: [id])
  
  clientId    String
  client      User     @relation(fields: [clientId], references: [id])
  readerId    String
  reader      User     @relation(fields: [readerId], references: [id])
  
  rating      Int      // 1-5 stars
  comment     String?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("reviews")
}
```

### 3. Financial System

#### Wallet
```prisma
model Wallet {
  id          String   @id @default(cuid())
  userId      String   @unique
  user        User     @relation(fields: [userId], references: [id])
  
  balance     Float    @default(0)
  currency    String   @default("USD")
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("wallets")
}
```

#### Transaction
```prisma
model Transaction {
  id              String           @id @default(cuid())
  transactionId   String           @unique // External transaction ID
  
  userId          String
  user            User             @relation(fields: [userId], references: [id])
  
  type            TransactionType
  amount          Float
  currency        String           @default("USD")
  status          TransactionStatus
  
  // Session reference if applicable
  sessionId       String?
  session         Session?         @relation(fields: [sessionId], references: [id])
  
  // Payment processing
  stripePaymentIntentId String?
  stripeTransferId     String?
  
  // Revenue sharing
  readerEarnings   Float?
  platformRevenue  Float?
  
  description      String?
  metadata         Json?
  
  createdAt        DateTime         @default(now())
  updatedAt        DateTime         @updatedAt
  
  @@map("transactions")
}

enum TransactionType {
  ADD_FUNDS
  SESSION_CHARGE
  REFUND
  PAYOUT
  PURCHASE
  GIFT_PURCHASE
}

enum TransactionStatus {
  PENDING
  COMPLETED
  FAILED
  REFUNDED
  CANCELLED
}
```

#### Payout
```prisma
model Payout {
  id              String       @id @default(cuid())
  readerId        String
  reader          User         @relation(fields: [readerId], references: [id])
  
  amount          Float
  currency        String       @default("USD")
  status          PayoutStatus
  
  stripeTransferId String?
  
  createdAt       DateTime     @default(now())
  processedAt     DateTime?
  
  @@map("payouts")
}

enum PayoutStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}
```

### 4. Availability System

#### Availability
```prisma
model Availability {
  id          String   @id @default(cuid())
  readerId    String
  reader      User     @relation(fields: [readerId], references: [id])
  
  dayOfWeek   Int      // 0-6 (Sunday-Saturday)
  startTime   String   // HH:mm format
  endTime     String   // HH:mm format
  
  isRecurring Boolean  @default(true)
  specificDate DateTime? // For one-time availability
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([readerId, dayOfWeek, startTime, endTime])
  @@map("availability")
}
```

### 5. Marketplace System

#### Product
```prisma
model Product {
  id              String       @id @default(cuid())
  stripeProductId String?
  
  name            String
  description     String
  type            ProductType
  category        String
  price           Float
  currency        String       @default("USD")
  
  // Inventory
  stockQuantity   Int?
  sku             String?
  
  // Digital products
  downloadUrl     String?
  fileUrl         String?
  
  // Physical products
  weight          Float?
  dimensions      Json?
  
  // Media
  images          String[]
  
  // Status
  status          ProductStatus @default(ACTIVE)
  featured        Boolean      @default(false)
  
  // Creator (Reader)
  readerId        String?
  reader          User?        @relation(fields: [readerId], references: [id])
  
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
  
  @@map("products")
}

enum ProductType {
  SERVICE
  DIGITAL
  PHYSICAL
}

enum ProductStatus {
  ACTIVE
  INACTIVE
  OUT_OF_STOCK
  DRAFT
}
```

#### Order
```prisma
model Order {
  id          String       @id @default(cuid())
  orderId     String       @unique // External order ID
  
  clientId    String
  client      User         @relation(fields: [clientId], references: [id])
  
  status      OrderStatus
  totalAmount Float
  currency    String       @default("USD")
  
  // Payment
  stripePaymentIntentId String?
  
  // Shipping (for physical products)
  shippingAddress Json?
  trackingNumber  String?
  
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  
  orderItems  OrderItem[]
  
  @@map("orders")
}

enum OrderStatus {
  PENDING
  PAID
  SHIPPED
  DELIVERED
  CANCELLED
  REFUNDED
}
```

#### Order Item
```prisma
model OrderItem {
  id          String   @id @default(cuid())
  orderId     String
  order       Order    @relation(fields: [orderId], references: [id])
  
  productId   String
  product     Product  @relation(fields: [productId], references: [id])
  
  quantity    Int      @default(1)
  price       Float    // Price at time of purchase
  
  createdAt   DateTime @default(now())
  
  @@map("order_items")
}
```

### 6. Community System

#### Live Stream
```prisma
model LiveStream {
  id          String           @id @default(cuid())
  streamId    String           @unique // External stream ID
  
  readerId    String
  reader      User             @relation(fields: [readerId], references: [id])
  
  title       String
  description String?
  category    String
  
  status      StreamStatus     @default(SCHEDULED)
  
  scheduledAt DateTime?
  startedAt   DateTime?
  endedAt     DateTime?
  
  viewerCount Int              @default(0)
  maxViewers  Int?
  
  recordingUrl String?
  
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt
  
  @@map("live_streams")
}

enum StreamStatus {
  SCHEDULED
  LIVE
  ENDED
  CANCELLED
}
```

#### Virtual Gift
```prisma
model VirtualGift {
  id          String   @id @default(cuid())
  name        String
  description String?
  price       Float
  currency    String   @default("USD")
  
  imageUrl    String
  animationUrl String?
  
  createdAt   DateTime @default(now())
  
  gifts       Gift[]
  
  @@map("virtual_gifts")
}
```

#### Gift
```prisma
model Gift {
  id          String   @id @default(cuid())
  
  senderId    String
  sender      User     @relation(fields: [senderId], references: [id])
  receiverId  String
  receiver    User     @relation("GiftReceiver", fields: [receiverId], references: [id])
  
  giftId      String
  gift        VirtualGift @relation(fields: [giftId], references: [id])
  
  // Context
  sessionId   String?  // If sent during a session
  streamId    String?  // If sent during a live stream
  
  message     String?
  
  createdAt   DateTime @default(now())
  
  @@map("gifts")
}
```

#### Forum Category
```prisma
model ForumCategory {
  id          String   @id @default(cuid())
  name        String
  description String?
  icon        String?
  
  sortOrder   Int      @default(0)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  posts       ForumPost[]
  
  @@map("forum_categories")
}
```

#### Forum Post
```prisma
model ForumPost {
  id          String           @id @default(cuid())
  
  authorId    String
  author      User             @relation(fields: [authorId], references: [id])
  
  categoryId  String
  category    ForumCategory    @relation(fields: [categoryId], references: [id])
  
  title       String
  content     String
  status      PostStatus       @default(PUBLISHED)
  
  isPinned    Boolean          @default(false)
  isLocked    Boolean          @default(false)
  
  viewCount   Int              @default(0)
  
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt
  
  replies     ForumReply[]
  
  @@map("forum_posts")
}

enum PostStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
  DELETED
}
```

#### Forum Reply
```prisma
model ForumReply {
  id          String   @id @default(cuid())
  
  postId      String
  post        ForumPost @relation(fields: [postId], references: [id])
  
  authorId    String
  author      User     @relation(fields: [authorId], references: [id])
  
  content     String
  status      PostStatus @default(PUBLISHED)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("forum_replies")
}
```

#### Direct Message
```prisma
model Message {
  id          String           @id @default(cuid())
  
  senderId    String
  sender      User             @relation("SentMessages", fields: [senderId], references: [id])
  receiverId  String
  receiver    User             @relation("ReceivedMessages", fields: [receiverId], references: [id])
  
  content     String
  messageType MessageType     @default(TEXT)
  
  isRead      Boolean          @default(false)
  readAt      DateTime?
  
  createdAt   DateTime         @default(now())
  
  @@map("messages")
}
```

### 7. System Configuration

#### System Setting
```prisma
model SystemSetting {
  id          String   @id @default(cuid())
  key         String   @unique
  value       String
  description String?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("system_settings")
}
```

#### Audit Log
```prisma
model AuditLog {
  id          String   @id @default(cuid())
  
  userId      String?
  user        User?    @relation(fields: [userId], references: [id])
  
  action      String
  entityType  String
  entityId    String
  changes     Json?
  
  ipAddress   String?
  userAgent   String?
  
  createdAt   DateTime @default(now())
  
  @@map("audit_logs")
}
```

## Schema Implementation Notes

### 1. Performance Considerations
- **Indexing**: All foreign keys and frequently queried fields will have proper indexes
- **Partitioning**: Large tables like `transactions` and `sessions` may be partitioned by date
- **Caching**: Frequently accessed data like reader profiles will be cached

### 2. Security Considerations
- **Row Level Security (RLS)**: Will be implemented in Supabase for client-side data access
- **Sensitive Data**: Payment information will be handled through Stripe, not stored directly
- **Encryption**: All sensitive communications will be end-to-end encrypted

### 3. Scalability Considerations
- **Connection Pooling**: Prisma will handle connection pooling for database connections
- **Read Replicas**: For read-heavy operations, read replicas may be implemented
- **Archival**: Old session data and audit logs may be archived to cold storage

### 4. Data Integrity
- **Referential Integrity**: All relationships will have proper foreign key constraints
- **Validation**: Business logic validation will be implemented at both database and application level
- **Transactions**: Financial operations will use database transactions for ACID compliance

### 5. Migration Strategy
- **Incremental Migrations**: All schema changes will be implemented through Prisma migrations
- **Backward Compatibility**: Migrations will maintain backward compatibility where possible
- **Data Transformation**: Existing data will be transformed during migrations when schema changes

This schema provides a comprehensive foundation for the SoulSeer platform, supporting all required features while maintaining data integrity, security, and scalability.