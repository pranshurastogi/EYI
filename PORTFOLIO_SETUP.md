# Portfolio API Setup Guide

## Overview

The EYI Portfolio Dashboard provides comprehensive portfolio analytics using Alchemy's Portfolio API. This guide will help you set up the portfolio functionality.

## Features

- **Transaction History**: Complete transaction history across multiple networks
- **Portfolio Analytics**: Risk scoring, activity metrics, and efficiency analysis
- **Interactive Charts**: Visual representation of portfolio data
- **Real-time Data**: Live portfolio updates and insights
- **Privacy Controls**: Option to hide sensitive data

## Setup Instructions

### 1. Get Alchemy API Key

1. Visit [Alchemy Dashboard](https://dashboard.alchemy.com/)
2. Create an account or sign in
3. Create a new app or use an existing one
4. Copy your API key from the dashboard

### 2. Configure Environment Variables

Create a `.env.local` file in the `eyi-fe` directory:

```bash
# Alchemy API Key for portfolio data
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key_here
```

### 3. Supported Networks

The portfolio API supports the following networks:
- Ethereum Mainnet (`eth-mainnet`)
- Base (`base-mainnet`)
- Polygon (`polygon-mainnet`)
- Arbitrum (`arbitrum-mainnet`)
- Optimism (`optimism-mainnet`)

### 4. Demo Mode

If no API key is configured, the portfolio will run in demo mode with mock data to showcase the interface.

## Usage

### Accessing the Portfolio

1. Connect your wallet on the main page
2. Navigate to the Portfolio section
3. View your comprehensive portfolio dashboard

### Features Available

#### Overview Tab
- Key metrics and statistics
- Network distribution
- Top contract interactions
- Monthly activity trends

#### Transactions Tab
- Complete transaction history
- Advanced filtering and search
- Export functionality
- Detailed transaction information

#### Analytics Tab
- Risk assessment scoring
- Activity and efficiency metrics
- Portfolio recommendations
- Performance insights

#### Charts Tab
- Interactive data visualizations
- Timeline analysis
- Network distribution charts
- Contract interaction graphs

## API Integration

The portfolio uses Alchemy's Portfolio API endpoint:

```typescript
POST https://api.g.alchemy.com/data/v1/:apiKey/transactions/history/by-address
```

### Request Format

```json
{
  "addresses": [
    {
      "address": "0x...",
      "networks": ["eth-mainnet"]
    }
  ],
  "limit": 50
}
```

### Response Format

The API returns comprehensive transaction data including:
- Transaction metadata (hash, timestamp, block number)
- Gas usage and pricing information
- Internal transactions and logs
- Contract interactions

## Privacy & Security

- API keys are stored securely in environment variables
- No sensitive data is stored locally
- Privacy controls allow hiding sensitive information
- Real-time data fetching ensures up-to-date information

## Troubleshooting

### Common Issues

1. **"Connect Wallet" message despite being connected**
   - The portfolio page includes retry logic for wallet detection
   - Try refreshing the page
   - Ensure your wallet is properly connected

2. **API key not configured**
   - Set `NEXT_PUBLIC_ALCHEMY_API_KEY` in your environment variables
   - Restart the development server after adding the key

3. **No data showing**
   - Check if your wallet has transaction history
   - Verify the API key is correct
   - Check browser console for error messages

### Debug Information

The portfolio page includes debug logging in the browser console to help diagnose issues:
- Authentication status
- Wallet detection
- API response status

## Development

### Adding New Features

1. **New Chart Types**: Add to `portfolio-charts.tsx`
2. **Additional Analytics**: Extend `portfolio-analytics.tsx`
3. **New Data Sources**: Update `use-portfolio-data.ts`

### Customization

- Modify chart colors in `portfolio-charts.tsx`
- Adjust analytics calculations in `portfolio-analytics.tsx`
- Update UI components in respective files

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify your API key configuration
3. Ensure your wallet is properly connected
4. Check the network connection

## Future Enhancements

- Additional blockchain networks
- More detailed analytics
- Export functionality
- Mobile optimization
- Real-time notifications
