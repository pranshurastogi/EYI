# EYI - Empower Your Identity

> **No more look-alikes. Only you.**

EYI is a decentralized identity platform that empowers users to own and verify their digital identity across multiple platforms. Connect your ENS (Ethereum Name Service) to Self, GitHub, X (Twitter), and Farcaster to unlock your EYI badge and enjoy safer, smarter web3 interactions.

## 🚀 Mission

EYI believes that identity isn't given—it's empowered. We're building the infrastructure for a more secure, trustworthy web3 ecosystem where users can prove their identity across platforms while maintaining privacy and control over their personal data.

## ✨ Features

### 🔗 Multi-Platform Identity Verification
- **ENS Integration**: Connect your Ethereum Name Service domain for a unified web3 identity
- **Self Protocol**: Private personhood verification that stores no PII but issues blockchain proof
- **GitHub Integration**: Prove your builder presence and development activity
- **X (Twitter) Integration**: Verify control of your social media handle
- **Farcaster Integration**: Link your Farcaster fid to your Ethereum address

### 🎯 Power Modules

#### 🔥 Spark (Self)
- **Purpose**: Prove personhood privately
- **Privacy**: Stores no PII, issues blockchain attestation
- **Use Case**: Anonymous but verified human identity

#### 🔨 Build (GitHub)
- **Purpose**: Prove your builder presence
- **Features**: Verify GitHub handle and development activity
- **Use Case**: Showcase your coding contributions and expertise

#### 📢 Voice (X/Twitter)
- **Purpose**: Prove control of your social handle
- **Features**: Verify ownership of your X/Twitter account
- **Use Case**: Authenticate your social media presence

#### 🌐 Web (Farcaster)
- **Purpose**: Link your Farcaster fid to your Ethereum address
- **Features**: Verify Farcaster fid ownership
- **Use Case**: Connect your decentralized social identity

### 🛡️ Security & Trust Features
- **EYI Badge System**: Visual indicators of verification status
- **Risk Assessment**: Detect potential homograph attacks and identity spoofing
- **Status Tracking**: Real-time verification status across all platforms
- **Directory**: Browse verified identities and their powers

### 🎨 User Experience
- **Animated Interface**: Smooth, engaging user experience with Framer Motion
- **Real-time Updates**: Live status updates as you connect platforms
- **Visual Progress**: EYI Ring showing your verification progress
- **Responsive Design**: Works seamlessly across desktop and mobile

## 🏗️ How It Works

### 1. Connect
- Connect your wallet and check your ENS status
- Get guidance to register an ENS if you don't have one

### 2. Verify
- Complete Spark, Build, Voice, and Web verifications
- Each verification increases your trust score
- Visual progress tracking through the EYI Ring

### 3. Use
- Enjoy safer transactions with verified identities
- Access exclusive features and events
- Build reputation across the web3 ecosystem

## 💼 Portfolio API Integration

EYI integrates with Alchemy's Portfolio API to provide comprehensive wallet portfolio data for verified users. This enables users to showcase their complete digital asset portfolio alongside their verified identity.

### 🔗 Alchemy Portfolio API Features

#### 📊 Transaction History
- **Endpoint**: `POST https://api.g.alchemy.com/data/v1/:apiKey/transactions/history/by-address`
- **Purpose**: Fetch all historical transactions (internal & external) for wallet addresses
- **Networks**: Ethereum, Solana, and 30+ EVM chains
- **Data Includes**:
  - Transaction metadata (hash, timestamp, block number)
  - Gas usage and pricing information
  - Internal transactions and logs
  - Contract interactions

#### 🎯 Portfolio Overview
- Complete transaction history across multiple networks
- Token holdings and transfers
- DeFi interactions and protocol usage
- NFT transactions and ownership

#### 🔒 Privacy & Security
- API key stored securely in environment variables
- No sensitive data stored locally
- Real-time data fetching for up-to-date portfolio information

### 📈 Implementation Details

```typescript
// Example API call structure
const portfolioData = await fetch('https://api.g.alchemy.com/data/v1/YOUR_API_KEY/transactions/history/by-address', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    addresses: [
      {
        address: "0x1E6E8695FAb3Eb382534915eA8d7Cc1D1994B152",
        networks: ["eth-mainnet"]
      }
    ],
    limit: 25
  })
});
```

### 🛡️ Security Features
- **API Key Protection**: Environment variable configuration
- **Rate Limiting**: Respects Alchemy API limits
- **Error Handling**: Graceful fallbacks for API failures
- **Data Validation**: Ensures data integrity before display

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 14 with React 18
- **Styling**: Tailwind CSS with custom EYI design system
- **Animations**: Framer Motion for smooth interactions
- **UI Components**: Radix UI primitives with custom styling
- **Authentication**: Privy for wallet and social connections

### Blockchain Integration
- **Ethereum**: ENS domain resolution and verification
- **Ethers.js**: Ethereum blockchain interactions
- **Self Protocol**: Private personhood verification
- **Alchemy API**: Portfolio data and transaction history
- **Multi-Chain Support**: Ethereum, Solana, and 30+ EVM chains

### Development Tools
- **TypeScript**: Full type safety
- **Package Manager**: pnpm for efficient dependency management
- **Linting**: ESLint with Next.js configuration
- **Analytics**: Vercel Analytics for usage insights

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- Ethereum wallet (MetaMask, WalletConnect, etc.)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/EYI.git
   cd EYI
   ```

2. **Install dependencies**
   ```bash
   cd eyi-fe
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Add your configuration
   ```
   
   Required environment variables:
   ```bash
   # Alchemy API Key for portfolio data
   NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key_here
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## 📁 Project Structure

```
EYI/
├── eyi-fe/                 # Frontend application
│   ├── app/               # Next.js app directory
│   │   ├── page.tsx       # Home page
│   │   ├── directory/     # Directory page
│   │   └── layout.tsx     # Root layout
│   ├── components/        # React components
│   │   ├── eyi/          # EYI-specific components
│   │   ├── ens/          # ENS integration components
│   │   ├── how-it-works/ # How it works section
│   │   └── ui/           # Reusable UI components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions
│   └── styles/           # Global styles
└── README.md
```

## 🔮 Future Roadmap

- **Enhanced Security**: Advanced fraud detection and identity verification
- **Cross-Chain Support**: Extend beyond Ethereum to other blockchains
- **API Integration**: Developer tools for third-party applications
- **Mobile App**: Native mobile experience
- **Community Features**: Social verification and community building tools

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for details on how to get involved.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**EYI** - Where identity meets empowerment. 🚀
