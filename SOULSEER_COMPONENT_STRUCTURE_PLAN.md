# SoulSeer Component Structure Plan

## Overview
This document outlines the comprehensive frontend component architecture for the SoulSeer spiritual consultation platform. The structure follows a feature-driven approach with clear separation of concerns, reusability, and scalability in mind.

## Directory Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth-related routes
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── (client)/                 # Client-specific routes
│   │   ├── dashboard/
│   │   ├── readers/
│   │   ├── sessions/
│   │   ├── wallet/
│   │   ├── marketplace/
│   │   ├── community/
│   │   └── profile/
│   ├── (reader)/                 # Reader-specific routes
│   │   ├── dashboard/
│   │   ├── profile/
│   │   ├── schedule/
│   │   ├── earnings/
│   │   └── sessions/
│   ├── (admin)/                  # Admin-specific routes
│   │   ├── dashboard/
│   │   ├── users/
│   │   ├── readers/
│   │   ├── sessions/
│   │   ├── finances/
│   │   ├── marketplace/
│   │   └── community/
│   ├── (public)/                 # Public routes
│   │   ├── home/
│   │   ├── readers/
│   │   ├── about/
│   │   └── contact/
│   ├── api/                      # API routes
│   │   ├── auth/
│   │   ├── users/
│   │   ├── sessions/
│   │   ├── payments/
│   │   ├── marketplace/
│   │   ├── community/
│   │   └── admin/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/                   # Reusable components
│   ├── ui/                       # shadcn/ui components (already exists)
│   ├── layout/                   # Layout components
│   ├── auth/                     # Authentication components
│   ├── common/                   # Common shared components
│   ├── client/                   # Client-specific components
│   ├── reader/                   # Reader-specific components
│   ├── admin/                    # Admin-specific components
│   ├── forms/                    # Form components
│   ├── charts/                   # Chart and data visualization
│   └── webrtc/                   # WebRTC communication components
├── hooks/                        # Custom React hooks
├── lib/                          # Utility libraries
├── store/                        # State management (Zustand)
├── types/                        # TypeScript type definitions
└── utils/                        # Utility functions
```

## Component Breakdown by Feature

### 1. Layout Components (`src/components/layout/`)

```typescript
// Main layout structure
├── Header.tsx                    # Main navigation header
├── Sidebar.tsx                   # Collapsible sidebar navigation
├── Footer.tsx                    # Application footer
├── MainLayout.tsx                # Wrapper for main content area
├── AuthLayout.tsx                # Layout for authentication pages
├── ClientLayout.tsx              # Client-specific layout
├── ReaderLayout.tsx              # Reader-specific layout
├── AdminLayout.tsx               # Admin-specific layout
├── PublicLayout.tsx              # Public page layout
├── MobileNavigation.tsx          # Bottom navigation for mobile
└── Breadcrumb.tsx                # Navigation breadcrumb
```

### 2. Authentication Components (`src/components/auth/`)

```typescript
├── AuthProvider.tsx              # Authentication context provider
├── LoginForm.tsx                 # Login form component
├── RegisterForm.tsx              # Registration form component
├── ForgotPasswordForm.tsx        # Password reset form
├── ResetPasswordForm.tsx         # Password reset confirmation
├── SocialLogin.tsx               # Social media login buttons
├── TwoFactorAuth.tsx             # 2FA verification
├── EmailVerification.tsx         # Email verification component
├── AuthGuard.tsx                 # Route protection wrapper
├── RoleGuard.tsx                 # Role-based access control
└── SessionTimeout.tsx           # Session timeout handler
```

### 3. Common Components (`src/components/common/`)

```typescript
// UI Elements
├── Avatar.tsx                    # User avatar with online status
├── Badge.tsx                     # Status and role badges
├── Card.tsx                      # Enhanced card component
├── Modal.tsx                     # Reusable modal wrapper
├── Drawer.tsx                    # Slide-out drawer component
├── Tooltip.tsx                   # Enhanced tooltip
├── Skeleton.tsx                  # Loading skeleton
├── EmptyState.tsx                # Empty state illustration
├── ErrorBoundary.tsx             # Error boundary wrapper
├── LoadingSpinner.tsx            # Loading spinner
├── Pagination.tsx                # Pagination controls
├── SearchBar.tsx                 # Search input with filters
├── FilterDropdown.tsx            # Filter dropdown component
├── SortDropdown.tsx              # Sort options dropdown
└── ToastNotification.tsx         # Toast notifications

// Data Display
├── DataTable.tsx                 # Reusable data table
├── UserList.tsx                  # User listing component
├── StatCard.tsx                  # Statistics card
├── Timeline.tsx                  # Timeline view
├── RatingStars.tsx               # Star rating display
├── PriceDisplay.tsx              # Price formatting display
└── DateTimeDisplay.tsx           # Formatted date/time display

// Media
├── ImageUpload.tsx               # Image upload component
├── FileUpload.tsx                # File upload component
├── VideoPlayer.tsx               # Video player component
├── AudioPlayer.tsx               # Audio player component
└── ImageGallery.tsx              # Image gallery viewer
```

### 4. Client Components (`src/components/client/`)

```typescript
// Dashboard
├── ClientDashboard.tsx           # Main client dashboard
├── QuickActions.tsx              # Quick action buttons
├── RecentSessions.tsx            # Recent session history
├── FavoriteReaders.tsx           # Favorite readers list
├── UpcomingSessions.tsx          # Scheduled sessions
├── WalletBalance.tsx             # Wallet balance display
└── RecommendedReaders.tsx        # Reader recommendations

// Reader Discovery
├── ReaderCard.tsx                # Reader profile card
├── ReaderList.tsx                # Readers listing page
├── ReaderFilters.tsx             # Reader filtering options
├── ReaderSearch.tsx              # Reader search interface
├── ReaderProfile.tsx             # Reader profile view
├── ReaderReviews.tsx             # Reader reviews section
├── ReaderAvailability.tsx        # Availability calendar
├── ReaderSpecialties.tsx         # Specialties display
└── ReaderComparison.tsx          # Reader comparison tool

// Session Management
├── SessionBooking.tsx            # Session booking flow
├── SessionScheduler.tsx          # Session scheduling calendar
├── SessionCard.tsx               # Session card display
├── SessionHistory.tsx            # Session history list
├── SessionDetails.tsx            # Session details view
├── SessionReview.tsx             # Session review form
├── SessionTimer.tsx              # Session timer display
└── SessionFeedback.tsx           # Session feedback form

// Wallet & Payments
├── WalletDashboard.tsx           # Wallet management dashboard
├── AddFunds.tsx                  # Add funds to wallet
├── TransactionHistory.tsx        # Transaction history
├── PaymentMethods.tsx            # Payment methods management
├── BillingInfo.tsx               # Billing information
├── Invoice.tsx                   # Invoice display
└── RefundRequest.tsx             # Refund request form

// Marketplace
├── Marketplace.tsx               # Main marketplace page
├── ProductCard.tsx               # Product display card
├── ProductDetails.tsx            # Product details view
├── ProductFilters.tsx            # Product filtering
├── ShoppingCart.tsx              # Shopping cart
├── Checkout.tsx                  # Checkout process
├── OrderHistory.tsx              # Order history
├── OrderDetails.tsx              # Order details view
└── DigitalDownload.tsx           # Digital product download
```

### 5. Reader Components (`src/components/reader/`)

```typescript
// Dashboard
├── ReaderDashboard.tsx           # Main reader dashboard
├── EarningsOverview.tsx          # Earnings summary
├── SessionStats.tsx              # Session statistics
├── PerformanceMetrics.tsx        # Performance metrics
├── ClientFeedback.tsx            # Client feedback summary
├── RecentActivity.tsx            # Recent activity feed
└── Notifications.tsx             # Reader notifications

// Profile Management
├── ProfileEditor.tsx             # Profile editing interface
├── ProfilePreview.tsx            # Profile preview
├── ServicesEditor.tsx            # Services and pricing editor
├── AvailabilityManager.tsx       # Availability management
├── MediaGallery.tsx              # Profile media gallery
├── VerificationStatus.tsx        # Verification status display
└── ProfessionalInfo.tsx          # Professional information editor

// Session Management
├── SessionQueue.tsx              # Incoming session queue
├── ActiveSession.tsx             # Active session interface
├── SessionControls.tsx           # Session control buttons
├── SessionNotes.tsx              # Session notes
├── SessionHistory.tsx            # Session history
├── SessionRecording.tsx          # Session recording management
└── ClientInfo.tsx                # Client information display

// Earnings & Payouts
├── EarningsDashboard.tsx         # Earnings management dashboard
├── EarningsReport.tsx            # Earnings reports
├── PayoutHistory.tsx             # Payout history
├── PayoutSettings.tsx            # Payout configuration
├── TaxDocuments.tsx              # Tax document management
├── EarningsChart.tsx             # Earnings visualization
└── RevenueBreakdown.tsx          # Revenue breakdown analysis

// Live Streaming
├── StreamDashboard.tsx           # Live streaming dashboard
├── StreamControls.tsx             # Stream control interface
├── StreamStats.tsx               # Stream statistics
├── ViewerList.tsx                # Active viewers list
├── GiftNotifications.tsx         # Gift notifications
├── StreamRecording.tsx           # Stream recording management
└── StreamScheduler.tsx          # Stream scheduling
```

### 6. Admin Components (`src/components/admin/`)

```typescript
// Dashboard
├── AdminDashboard.tsx            # Main admin dashboard
├── PlatformStats.tsx             # Platform statistics
├── SystemHealth.tsx              # System health monitoring
├── RecentActivity.tsx            # Recent platform activity
├── RevenueOverview.tsx           # Revenue overview
├── UserGrowthChart.tsx           # User growth visualization
└── PerformanceMetrics.tsx        # Platform performance metrics

// User Management
├── UserManagement.tsx            # User management interface
├── UserList.tsx                  # User listing with filters
├── UserDetails.tsx               # User details view
├── UserActions.tsx               # User action buttons
├── BulkActions.tsx               # Bulk user operations
├── UserVerification.tsx          # User verification process
└── UserSuspension.tsx            # User suspension interface

// Reader Management
├── ReaderManagement.tsx          # Reader management interface
├── ReaderApproval.tsx            # Reader approval workflow
├── ReaderVerification.tsx        # Reader verification process
├── ReaderPerformance.tsx         # Reader performance analysis
├── ReaderEarnings.tsx            # Reader earnings overview
├── ReaderCompliance.tsx          # Compliance monitoring
└── BulkReaderActions.tsx        # Bulk reader operations

// Financial Management
├── FinancialDashboard.tsx        # Financial management dashboard
├── TransactionMonitor.tsx        # Transaction monitoring
├── RevenueAnalytics.tsx          # Revenue analytics
├── PayoutManagement.tsx          # Payout management
├── DisputeResolution.tsx         # Dispute resolution interface
├── TaxReporting.tsx              # Tax reporting
└── FinancialReports.tsx          # Financial reports

// Content Moderation
├── ContentModeration.tsx         # Content moderation dashboard
├── ReportedContent.tsx           # Reported content management
├── FlaggedUsers.tsx              # Flagged user management
├── ReviewModeration.tsx          # Review moderation
├── ForumModeration.tsx           # Forum moderation
├── AutomatedFilters.tsx          # Automated filter management
└── ModerationActions.tsx         # Moderation actions

// System Configuration
├── SystemSettings.tsx            # System configuration interface
├── FeatureFlags.tsx              # Feature flag management
├── EmailTemplates.tsx            # Email template management
├── NotificationSettings.tsx      # Notification configuration
├── SecuritySettings.tsx          # Security configuration
├── IntegrationSettings.tsx       # Third-party integrations
└── BackupManagement.tsx          # Backup and recovery
```

### 7. WebRTC Components (`src/components/webrtc/`)

```typescript
// Core WebRTC
├── WebRTCProvider.tsx            # WebRTC context provider
├── SignalingManager.tsx          # WebSocket signaling manager
├── PeerConnection.tsx            # Peer connection manager
├── MediaManager.tsx              # Media stream management
├── ConnectionManager.tsx         # Connection state manager
└── ICEConfiguration.tsx         # ICE server configuration

// Session Types
├── ChatSession.tsx               # Chat session interface
├── VoiceSession.tsx              # Voice call interface
├── VideoSession.tsx              # Video call interface
├── SessionControls.tsx           # Session control buttons
├── MediaControls.tsx             # Media control buttons
└── QualityIndicator.tsx          # Connection quality indicator

// UI Components
├── VideoGrid.tsx                 # Video grid layout
├── ParticipantTile.tsx           # Participant video tile
├── ChatInterface.tsx             # Chat interface
├── ScreenShare.tsx               # Screen sharing component
├── RecordingIndicator.tsx       # Recording indicator
├── NetworkStats.tsx              # Network statistics display
└── SessionTimer.tsx              # Session timer
```

### 8. Community Components (`src/components/community/`)

```typescript
// Live Streaming
├── LiveStreamPlayer.tsx          # Live stream player
├── StreamList.tsx                # Live streams listing
├── StreamSchedule.tsx            # Stream schedule
├── StreamChat.tsx                # Stream chat interface
├── VirtualGifts.tsx              # Virtual gifts interface
├── StreamReplay.tsx              # Stream replay player
└── StreamNotifications.tsx      # Stream notifications

// Forums
├── ForumHome.tsx                 # Forum home page
├── ForumCategory.tsx             # Forum category view
├── ForumPost.tsx                 # Forum post view
├── PostEditor.tsx                # Post creation/editing
├── ReplyEditor.tsx               # Reply creation/editing
├── PostList.tsx                  # Post listing
├── ForumSearch.tsx               # Forum search
└── ForumModeration.tsx           # Forum moderation tools

// Messaging
├── MessageCenter.tsx             # Message center dashboard
├── ConversationList.tsx          # Conversation list
├── ConversationView.tsx          # Individual conversation
├── MessageComposer.tsx           # Message composition
├── MessageSearch.tsx             # Message search
├── MessageAttachments.tsx        # Message attachments
└── UnreadIndicator.tsx           # Unread message indicator
```

### 9. Form Components (`src/components/forms/`)

```typescript
// Base Forms
├── FormWrapper.tsx              # Form wrapper with validation
├── FormField.tsx                # Individual form field
├── FormSubmit.tsx               # Form submit button
├── FormError.tsx                # Form error display
├── FormSuccess.tsx              # Form success message
└── FormLoader.tsx               # Form loading state

// Specific Forms
├── UserProfileForm.tsx          # User profile form
├── ReaderProfileForm.tsx        # Reader profile form
├── ServiceForm.tsx              # Service configuration form
├── AvailabilityForm.tsx         # Availability form
├── PaymentForm.tsx               # Payment form
├── ProductForm.tsx               # Product form
├── ReviewForm.tsx               # Review form
└── ReportForm.tsx               # Report form
```

### 10. Chart Components (`src/components/charts/`)

```typescript
// Chart Types
├── LineChart.tsx                # Line chart component
├── BarChart.tsx                 # Bar chart component
├── PieChart.tsx                 # Pie chart component
├── AreaChart.tsx                # Area chart component
├── ScatterChart.tsx             # Scatter chart component
└── HeatmapChart.tsx             # Heatmap chart

// Dashboard Charts
├── EarningsChart.tsx            # Earnings over time
├── SessionChart.tsx             # Session statistics
├── UserGrowthChart.tsx          # User growth chart
├── RevenueChart.tsx             # Revenue breakdown
├── PerformanceChart.tsx         # Performance metrics
└── ActivityChart.tsx            # Activity timeline
```

## State Management Structure

### Zustand Store Structure (`src/store/`)

```typescript
├── index.ts                     # Store exports
├── authStore.ts                 # Authentication state
├── userStore.ts                 # User profile state
├── sessionStore.ts              # Session management state
├── webrtcStore.ts               # WebRTC connection state
├── walletStore.ts               # Wallet and payment state
├── marketplaceStore.ts          # Marketplace state
├── communityStore.ts            # Community features state
├── notificationStore.ts         # Notification state
├── adminStore.ts                # Admin dashboard state
└── uiStore.ts                   # UI state (theme, layout, etc.)
```

## Custom Hooks (`src/hooks/`)

```typescript
├── useAuth.ts                   # Authentication hook
├── useUser.ts                   # User profile hook
├── useSession.ts                # Session management hook
├── useWebRTC.ts                 # WebRTC connection hook
├── useWallet.ts                 # Wallet operations hook
├── useMarketplace.ts            # Marketplace operations hook
├── useCommunity.ts              # Community features hook
├── useAdmin.ts                  # Admin operations hook
├── useNotifications.ts          # Notification management hook
├── useDebounce.ts               # Debounce utility hook
├── useLocalStorage.ts           # Local storage hook
├── useApi.ts                    # API request hook
├── useSocket.ts                 # Socket.io connection hook
└── useMediaQuery.ts             # Media query hook
```

## Utility Libraries (`src/lib/`)

```typescript
├── api.ts                       # API client configuration
├── auth.ts                      # Authentication utilities
├── db.ts                        # Database client (Prisma)
├── socket.ts                    # Socket.io configuration
├── webrtc.ts                    # WebRTC utilities
├── payments.ts                  # Payment processing utilities
├── validation.ts                # Form validation schemas
├── formatting.ts                # Data formatting utilities
├── constants.ts                 # Application constants
├── helpers.ts                   # Helper functions
└── config.ts                    # Configuration management
```

## Type Definitions (`src/types/`)

```typescript
├── index.ts                     # Type exports
├── auth.ts                      # Authentication types
├── user.ts                      # User profile types
├── session.ts                   # Session types
├── payment.ts                   # Payment and wallet types
├── marketplace.ts               # Marketplace types
├── community.ts                 # Community types
├── admin.ts                     # Admin types
├── webrtc.ts                    # WebRTC types
├── api.ts                       # API response types
└── ui.ts                        # UI component types
```

## Implementation Guidelines

### 1. Component Design Principles
- **Single Responsibility**: Each component should have a single, well-defined purpose
- **Reusability**: Components should be reusable across different contexts
- **Composition**: Prefer composition over inheritance
- **Props Interface**: Use TypeScript interfaces for component props
- **Default Props**: Provide sensible default values for optional props

### 2. State Management
- **Local State**: Use React's useState for component-local state
- **Global State**: Use Zustand for cross-component state sharing
- **Server State**: Use TanStack Query for server state management
- **Derived State**: Compute derived state using selectors

### 3. Performance Optimization
- **Memoization**: Use React.memo and useMemo for expensive computations
- **Virtualization**: Implement virtual scrolling for large lists
- **Code Splitting**: Use dynamic imports for large components
- **Lazy Loading**: Implement lazy loading for images and components

### 4. Accessibility
- **Semantic HTML**: Use appropriate HTML elements for accessibility
- **ARIA Attributes**: Include necessary ARIA attributes
- **Keyboard Navigation**: Ensure all interactive elements are keyboard accessible
- **Screen Reader Support**: Test with screen readers
- **Color Contrast**: Maintain sufficient color contrast ratios

### 5. Testing Strategy
- **Unit Tests**: Test individual components in isolation
- **Integration Tests**: Test component interactions
- **E2E Tests**: Test complete user flows
- **Visual Testing**: Test component appearance across different viewports

This component structure provides a solid foundation for building the SoulSeer platform with maintainable, scalable, and performant code.