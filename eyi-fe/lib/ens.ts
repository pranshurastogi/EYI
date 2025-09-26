/**
 * Standard ENS resolution using ethers.js and your Alchemy RPC
 */

import { ethers } from 'ethers'

// ENS Registry contract address on mainnet
const ENS_REGISTRY_ADDRESS = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e'

// ENS Registry ABI - minimal interface for name resolution
const ENS_REGISTRY_ABI = [
  {
    "inputs": [
      { "internalType": "bytes32", "name": "node", "type": "bytes32" }
    ],
    "name": "resolver",
    "outputs": [
      { "internalType": "contract IResolver", "name": "", "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]

// Public Resolver ABI - for getting name and avatar
const PUBLIC_RESOLVER_ABI = [
  {
    "inputs": [
      { "internalType": "bytes32", "name": "node", "type": "bytes32" }
    ],
    "name": "name",
    "outputs": [
      { "internalType": "string", "name": "", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "node", "type": "bytes32" },
      { "internalType": "string", "name": "key", "type": "string" }
    ],
    "name": "text",
    "outputs": [
      { "internalType": "string", "name": "", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]

/**
 * Convert address to ENS namehash
 */
function namehash(name: string): string {
  const labels = name.split('.')
  let node = '0x0000000000000000000000000000000000000000000000000000000000000000'
  
  for (let i = labels.length - 1; i >= 0; i--) {
    const labelHash = ethers.keccak256(ethers.toUtf8Bytes(labels[i]))
    node = ethers.keccak256(node + labelHash.slice(2))
  }
  
  return node
}

/**
 * Convert address to reverse lookup namehash
 */
function reverseNamehash(address: string): string {
  const normalizedAddress = address.toLowerCase().slice(2) // Remove 0x
  const reverseName = `${normalizedAddress}.addr.reverse`
  return namehash(reverseName)
}

/**
 * Get provider using mainnet RPC for ENS resolution
 */
function getProvider() {
  // ENS resolution always happens on mainnet, not testnet
  // Use your Alchemy mainnet RPC endpoint
  const rpcUrl = process.env.NEXT_PUBLIC_ETH_RPC || 'https://eth-mainnet.g.alchemy.com/v2/6Dhi7I5OA8qYGZ9DYZAgYKdQZJo6hh47'
  return new ethers.JsonRpcProvider(rpcUrl)
}

/**
 * Resolve ENS name for an address using standard contract calls
 */
export async function resolveENSName(
  address: string, 
  wallet?: any
): Promise<string | null> {
  try {
    console.log('🔍 Resolving ENS for address:', address)
    const provider = getProvider()
    const contract = new ethers.Contract(ENS_REGISTRY_ADDRESS, ENS_REGISTRY_ABI, provider)
    
    // Get the reverse lookup node
    const reverseNode = reverseNamehash(address)
    console.log('📝 Reverse node:', reverseNode)
    
    // Get the resolver for this node
    const resolverAddress = await contract.resolver(reverseNode)
    console.log('🔗 Resolver address:', resolverAddress)
    
    if (resolverAddress === '0x0000000000000000000000000000000000000000') {
      console.log('❌ No resolver set for this address')
      return null // No resolver set
    }
    
    // Get the name from the resolver
    const resolver = new ethers.Contract(resolverAddress, PUBLIC_RESOLVER_ABI, provider)
    const name = await resolver.name(reverseNode)
    console.log('✅ Resolved ENS name:', name)
    
    return name && name.length > 0 ? name : null
  } catch (error) {
    console.error('❌ Error resolving ENS name:', error)
    return null
  }
}

/**
 * Get ENS avatar URL for a name
 */
export async function getENSAvatar(
  name: string,
  wallet?: any
): Promise<string | null> {
  try {
    const provider = getProvider()
    const contract = new ethers.Contract(ENS_REGISTRY_ADDRESS, ENS_REGISTRY_ABI, provider)
    
    // Get the namehash for the name
    const node = namehash(name)
    
    // Get the resolver
    const resolverAddress = await contract.resolver(node)
    
    if (resolverAddress === '0x0000000000000000000000000000000000000000') {
      return null
    }
    
    // Get the avatar from the resolver
    const resolver = new ethers.Contract(resolverAddress, PUBLIC_RESOLVER_ABI, provider)
    const avatar = await resolver.text(node, 'avatar')
    
    return avatar && avatar.length > 0 ? avatar : null
  } catch (error) {
    console.error('Error getting ENS avatar:', error)
    return null
  }
}

/**
 * Check if an address has an ENS name
 */
export async function hasENSName(
  address: string,
  wallet?: any
): Promise<boolean> {
  const name = await resolveENSName(address, wallet)
  return name !== null
}
