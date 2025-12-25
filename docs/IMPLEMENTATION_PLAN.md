# M4Hub - Implementation Plan

**Date**: December 11, 2025  
**Status**: Ready for Development

## 🎯 Overview

This document outlines the complete implementation plan for M4Hub's core authentication, messaging, payment, and news features.

---

## 📱 Phase 1: Mobile OTP Verification Flow

### Current Status
- ✅ Phone number login exists
- ✅ Basic OTP sending/verification implemented
- ⚠️ Needs enhancement and proper flow

### Implementation Tasks

#### 1.1 Backend - OTP Service Enhancement
**File**: `backend/src/main/java/com/m4hub/service/OtpService.java`

```java
@Service
public class OtpService {
    // Generate 6-digit OTP
    // Store OTP with expiration (5 minutes)
    // Send OTP via SMS provider
    // Verify OTP and validate expiration
    // Rate limiting (max 3 attempts per phone number)
}
```

#### 1.2 Frontend - OTP Screen Flow
**Files**: 
- `mobile/app/auth/phone-login.tsx` (enhance)
- `mobile/app/auth/verify-otp.tsx` (create)

**Features**:
- Phone number input with country code selector
- Auto-detect country code
- Send OTP button with loading state
- OTP input (6 digits) with auto-focus
- Resend OTP with 60-second countdown
- Error handling with user-friendly messages

---

## 📧 Phase 2: Email/Password Registration with Email OTP

### Implementation Tasks

#### 2.1 Backend - User Registration API
**File**: `backend/src/main/java/com/m4hub/controller/AuthController.java`

```java
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        // 1. Validate email/password
        // 2. Check if email already exists
        // 3. Hash password (BCrypt)
        // 4. Generate email OTP
        // 5. Send OTP to email
        // 6. Return temporary token
    }
    
    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestBody VerifyEmailRequest request) {
        // 1. Verify OTP
        // 2. Activate user account
        // 3. Return JWT token
    }
}
```

#### 2.2 Email Service Integration
**File**: `backend/src/main/java/com/m4hub/service/EmailService.java`

**Options**:
- **SendGrid** (12,000 free emails/month)
- **Mailgun** (5,000 free emails/month)
- **AWS SES** (62,000 free emails/month)

#### 2.3 Frontend - Registration Flow
**Files**:
- `mobile/app/auth/register.tsx` (create)
- `mobile/app/auth/verify-email.tsx` (create)

**Flow**:
1. Email/Password input screen
2. Password strength indicator
3. Send OTP to email
4. Verify email OTP (6 digits)
5. Navigate to profile setup

---

## 👤 Phase 3: Mandatory Username in Profile

### Implementation Tasks

#### 3.1 Backend - Username System
**File**: `backend/src/main/java/com/m4hub/model/User.java`

```java
@Entity
@Table(name = "users")
public class User {
    @Column(unique = true, nullable = false)
    private String username; // Unique username for messaging
    
    @Column(unique = true, nullable = false)
    private String phoneNumber;
    
    @Column(unique = true)
    private String email;
    
    private String firstName;
    private String lastName;
    private String profilePicture;
    
    // Add username validation
    // Username must be 3-20 characters
    // Only alphanumeric and underscore allowed
    // Case-insensitive uniqueness check
}
```

#### 3.2 Frontend - Profile Setup Enhancement
**File**: `mobile/app/profile-setup.tsx` (update)

**Changes**:
- Add username field (required)
- Real-time username availability check
- Show suggestions if username taken
- Username format validation
- Update UI to emphasize username importance

**Flow**:
1. Username (required, unique)
2. First Name (required)
3. Last Name (required)
4. Email (optional if registered via phone)
5. Date of Birth
6. Gender
7. Profile Picture (optional)

---

## 💬 Phase 4: Instagram-like Chat Messaging System

### Architecture

#### 4.1 Backend - Messaging Infrastructure

**Database Schema**:

```sql
-- Conversations table
CREATE TABLE conversations (
    id BIGSERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL, -- 'direct' or 'group'
    name VARCHAR(100), -- For group chats
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Conversation participants
CREATE TABLE conversation_participants (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT REFERENCES conversations(id),
    user_id BIGINT REFERENCES users(id),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_read_at TIMESTAMP,
    UNIQUE(conversation_id, user_id)
);

-- Messages table
CREATE TABLE messages (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT REFERENCES conversations(id),
    sender_id BIGINT REFERENCES users(id),
    content TEXT,
    message_type VARCHAR(20) DEFAULT 'text', -- 'text', 'image', 'video', 'audio'
    media_url VARCHAR(500),
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Message read status
CREATE TABLE message_reads (
    id BIGSERIAL PRIMARY KEY,
    message_id BIGINT REFERENCES messages(id),
    user_id BIGINT REFERENCES users(id),
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(message_id, user_id)
);
```

**Backend Files to Create**:
```
backend/src/main/java/com/m4hub/
├── model/
│   ├── Conversation.java
│   ├── ConversationParticipant.java
│   ├── Message.java
│   └── MessageRead.java
├── repository/
│   ├── ConversationRepository.java
│   ├── MessageRepository.java
│   └── MessageReadRepository.java
├── service/
│   ├── ConversationService.java
│   ├── MessageService.java
│   └── WebSocketService.java
├── controller/
│   ├── ConversationController.java
│   └── MessageController.java
├── dto/
│   ├── ConversationDTO.java
│   ├── MessageDTO.java
│   └── SendMessageRequest.java
└── config/
    └── WebSocketConfig.java
```

#### 4.2 Real-time Messaging (WebSocket)

**File**: `backend/src/main/java/com/m4hub/config/WebSocketConfig.java`

```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue");
        config.setApplicationDestinationPrefixes("/app");
    }
    
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws-messaging")
                .setAllowedOrigins("*")
                .withSockJS();
    }
}
```

#### 4.3 Frontend - Chat UI

**Files to Create**:
```
mobile/
├── app/
│   ├── messages.tsx (update - chat list)
│   ├── chat/
│   │   ├── [conversationId].tsx (chat screen)
│   │   └── new-chat.tsx (start new conversation)
│   └── search-users.tsx (find users by username)
├── components/
│   ├── MessageBubble.tsx
│   ├── ChatInput.tsx
│   ├── ConversationItem.tsx
│   └── UserSearchItem.tsx
└── services/
    └── messaging.service.ts (WebSocket integration)
```

**Features**:
- Instagram-like UI design
- Real-time message delivery
- Typing indicators
- Read receipts
- Message delivery status (sent, delivered, read)
- Search conversations
- Search users by username
- Media sharing (images)
- Message deletion
- Unread message count badges

#### 4.4 WebSocket Integration (Mobile)

**File**: `mobile/services/messaging.service.ts`

```typescript
import { io, Socket } from 'socket.io-client';

class MessagingService {
    private socket: Socket | null = null;
    
    connect(token: string) {
        this.socket = io(APP_CONFIG.WS_URL, {
            auth: { token }
        });
        
        this.socket.on('new_message', (message) => {
            // Handle incoming message
        });
        
        this.socket.on('message_read', (data) => {
            // Update read status
        });
    }
    
    sendMessage(conversationId: number, content: string) {
        this.socket?.emit('send_message', {
            conversationId,
            content
        });
    }
    
    disconnect() {
        this.socket?.disconnect();
    }
}
```

---

## 💳 Phase 5: GPay-like Payment Interface

### Implementation Tasks

#### 5.1 Backend - Payment System

**Database Schema**:

```sql
-- Wallet table
CREATE TABLE wallets (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) UNIQUE,
    balance DECIMAL(10, 2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'INR',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE transactions (
    id BIGSERIAL PRIMARY KEY,
    wallet_id BIGINT REFERENCES wallets(id),
    type VARCHAR(20) NOT NULL, -- 'credit', 'debit', 'transfer'
    amount DECIMAL(10, 2) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'failed'
    reference_id VARCHAR(100) UNIQUE,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment methods
CREATE TABLE payment_methods (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    type VARCHAR(20) NOT NULL, -- 'upi', 'card', 'bank'
    details JSONB, -- Encrypted payment details
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Backend Files**:
```
backend/src/main/java/com/m4hub/
├── model/
│   ├── Wallet.java
│   ├── Transaction.java
│   └── PaymentMethod.java
├── service/
│   ├── WalletService.java
│   ├── TransactionService.java
│   └── PaymentGatewayService.java
├── controller/
│   └── PaymentController.java
└── dto/
    ├── TransactionDTO.java
    └── PaymentRequest.java
```

#### 5.2 Payment Gateway Integration

**Options**:
- **Razorpay** (Best for India, UPI support)
- **Stripe** (International payments)
- **PayPal** (Global support)

**File**: `backend/src/main/java/com/m4hub/service/PaymentGatewayService.java`

```java
@Service
public class PaymentGatewayService {
    
    public PaymentOrder createOrder(BigDecimal amount, String currency) {
        // Create Razorpay order
    }
    
    public boolean verifyPayment(String orderId, String signature) {
        // Verify payment signature
    }
    
    public void processRefund(String transactionId, BigDecimal amount) {
        // Process refund
    }
}
```

#### 5.3 Frontend - GPay-like UI

**Files**:
```
mobile/app/
├── money.tsx (update - wallet dashboard)
├── payment/
│   ├── send-money.tsx (send to username/phone)
│   ├── request-money.tsx
│   ├── add-money.tsx (recharge wallet)
│   ├── transaction-history.tsx
│   └── payment-methods.tsx
└── components/
    ├── WalletCard.tsx
    ├── TransactionItem.tsx
    ├── QuickActions.tsx
    └── PaymentMethodCard.tsx
```

**Features**:
- **Wallet Dashboard**:
  - Current balance display
  - Quick actions (Send, Request, Add Money)
  - Recent transactions
  - Payment QR code

- **Send Money**:
  - Search by username/phone
  - Enter amount
  - Add note
  - Secure PIN verification
  - Transaction success animation

- **Add Money**:
  - Multiple payment methods (UPI, Card, Net Banking)
  - Amount presets
  - Razorpay integration

- **Transaction History**:
  - Filterable by type/date
  - Download statements
  - Transaction receipt

---

## 📰 Phase 6: News Page with Free API

### API Options

#### 6.1 Recommended Free News APIs

**1. NewsAPI.org** ⭐ (Recommended)
- **Free Tier**: 100 requests/day
- **Features**: 
  - 80,000+ news sources
  - Category filtering
  - Keyword search
  - Multi-language support
- **Endpoint**: `https://newsapi.org/v2/top-headlines`
- **API Key**: Register at https://newsapi.org

**2. The Guardian API**
- **Free Tier**: Unlimited (with attribution)
- **Features**: Quality journalism, sections, tags
- **Endpoint**: `https://content.guardianapis.com/search`

**3. GNews API**
- **Free Tier**: 100 requests/day
- **Features**: Real-time news, 60,000+ sources
- **Endpoint**: `https://gnews.io/api/v4/top-headlines`

**4. Currents API**
- **Free Tier**: 600 requests/day
- **Features**: Regional news, categorized content
- **Endpoint**: `https://api.currentsapi.services/v1/latest-news`

### Implementation

#### 6.2 Backend - News Service

**File**: `backend/src/main/java/com/m4hub/service/NewsService.java`

```java
@Service
public class NewsService {
    
    private static final String NEWS_API_URL = "https://newsapi.org/v2/top-headlines";
    private static final String API_KEY = "${news.api.key}";
    
    @Cacheable(value = "news", key = "#category")
    public List<NewsArticle> getTopHeadlines(String category, String country) {
        // Fetch from NewsAPI
        // Transform to NewsArticle DTO
        // Cache for 15 minutes
    }
    
    public List<NewsArticle> searchNews(String query) {
        // Search news by keyword
    }
}
```

**File**: `backend/src/main/java/com/m4hub/controller/NewsController.java`

```java
@RestController
@RequestMapping("/api/news")
public class NewsController {
    
    @GetMapping("/headlines")
    public ResponseEntity<List<NewsArticle>> getHeadlines(
        @RequestParam(defaultValue = "general") String category,
        @RequestParam(defaultValue = "us") String country
    ) {
        // Return top headlines
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<NewsArticle>> searchNews(
        @RequestParam String query
    ) {
        // Return search results
    }
}
```

#### 6.3 Frontend - News Screen Enhancement

**File**: `mobile/app/news.tsx` (update)

**Features**:
- Category tabs (General, Business, Technology, Sports, Entertainment, Health, Science)
- Pull-to-refresh
- Infinite scroll
- Article preview cards with:
  - Thumbnail image
  - Headline
  - Source & author
  - Published time
  - Read more button
- Search functionality
- Bookmark articles (save for later)
- Share articles

**File**: `mobile/app/news/[articleId].tsx` (create)

**Article Detail Screen**:
- Full article content
- Hero image
- Author info
- Related articles
- Share options

#### 6.4 News Service Integration

**File**: `mobile/services/news.service.ts`

```typescript
export interface NewsArticle {
    id: string;
    title: string;
    description: string;
    content: string;
    author: string;
    source: string;
    url: string;
    imageUrl: string;
    publishedAt: string;
    category: string;
}

class NewsService {
    async getTopHeadlines(
        category: string = 'general',
        country: string = 'us'
    ): Promise<NewsArticle[]> {
        const response = await fetch(
            `${API_URL}/api/news/headlines?category=${category}&country=${country}`
        );
        return response.json();
    }
    
    async searchNews(query: string): Promise<NewsArticle[]> {
        const response = await fetch(
            `${API_URL}/api/news/search?query=${query}`
        );
        return response.json();
    }
}
```

---

## 🗂️ Implementation Priority & Timeline

### Week 1: Authentication Foundation
- ✅ Day 1-2: Mobile OTP verification enhancement
- ✅ Day 3-4: Email/Password registration with OTP
- ✅ Day 5: Username mandatory in profile

### Week 2: Core Features
- ✅ Day 1-3: News API integration (quickest win)
- ✅ Day 4-7: Payment interface (GPay-like UI)

### Week 3-4: Messaging System
- ✅ Day 1-3: Database schema & backend APIs
- ✅ Day 4-7: WebSocket setup
- ✅ Day 8-10: Frontend chat UI
- ✅ Day 11-14: Testing & refinement

---

## 🔐 Security Considerations

### Authentication
- ✅ JWT token with 7-day expiry
- ✅ Refresh token rotation
- ✅ BCrypt password hashing (cost factor: 12)
- ✅ Rate limiting on OTP endpoints
- ✅ HTTPS only in production

### Messaging
- ✅ End-to-end encryption (future)
- ✅ Message content sanitization
- ✅ File upload size limits
- ✅ Spam detection

### Payments
- ✅ PCI-DSS compliance (use payment gateway)
- ✅ Transaction PIN/biometric authentication
- ✅ Fraud detection
- ✅ Encrypted payment method storage
- ✅ Two-factor authentication for large amounts

---

## 📦 Required Dependencies

### Backend (pom.xml)
```xml
<!-- Email -->
<dependency>
    <groupId>com.sendgrid</groupId>
    <artifactId>sendgrid-java</artifactId>
    <version>4.9.3</version>
</dependency>

<!-- WebSocket -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-websocket</artifactId>
</dependency>

<!-- Redis for caching -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>

<!-- Payment Gateway -->
<dependency>
    <groupId>com.razorpay</groupId>
    <artifactId>razorpay-java</artifactId>
    <version>1.4.3</version>
</dependency>
```

### Frontend (package.json)
```json
{
  "dependencies": {
    "socket.io-client": "^4.5.4",
    "react-native-image-picker": "^5.0.0",
    "react-native-razorpay": "^2.3.0",
    "@react-native-async-storage/async-storage": "^1.19.0"
  }
}
```

---

## 🧪 Testing Strategy

### Unit Tests
- Authentication flows
- OTP generation/validation
- Message sending/receiving
- Payment processing
- News API integration

### Integration Tests
- End-to-end registration
- WebSocket messaging
- Payment gateway callbacks
- API rate limiting

### Manual Testing
- Mobile app on iOS/Android
- Different network conditions
- Edge cases (OTP expiry, payment failures)

---

## 📝 Environment Variables

```env
# Email Service
SENDGRID_API_KEY=your_sendgrid_key

# News API
NEWS_API_KEY=your_newsapi_key

# Payment Gateway
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

# WebSocket
WS_ALLOWED_ORIGINS=http://localhost:*,https://yourdomain.com

# Redis (for caching & real-time)
REDIS_HOST=localhost
REDIS_PORT=6379
```

---

## 🎨 UI/UX References

### Messaging
- **Reference**: Instagram DMs, WhatsApp
- **Color Scheme**: Green gradients (#11998e → #38ef7d)
- **Fonts**: SF Pro (iOS), Roboto (Android)

### Payment
- **Reference**: Google Pay, PhonePe
- **Color Scheme**: Blue gradients (#667eea → #764ba2)
- **Animations**: Success animations, confetti effects

### News
- **Reference**: Flipboard, Google News
- **Layout**: Card-based, masonry grid
- **Typography**: Clear hierarchy, readable fonts

---

## 🚀 Next Steps for Tomorrow

1. **Morning**: 
   - Set up SendGrid/Mailgun account
   - Get NewsAPI.org API key
   - Create Razorpay test account

2. **Afternoon**:
   - Implement email OTP backend
   - Add username field to User model
   - Create username validation endpoint

3. **Evening**:
   - Update mobile profile setup with username
   - Test registration flow end-to-end
   - Integrate NewsAPI in backend

4. **Testing**:
   - Verify OTP delivery (email + SMS)
   - Test username uniqueness
   - Load news articles in app

---

## 📞 Support & Resources

### Documentation
- [NewsAPI Docs](https://newsapi.org/docs)
- [Razorpay Docs](https://razorpay.com/docs/)
- [SendGrid Docs](https://docs.sendgrid.com/)
- [Socket.io Docs](https://socket.io/docs/)

### Contact
- Questions? Add comments in this file
- Issues? Create GitHub issues
- Updates? Track progress in TODO.md

---

**Last Updated**: December 11, 2025  
**Version**: 1.0  
**Status**: Ready for Implementation ✅
