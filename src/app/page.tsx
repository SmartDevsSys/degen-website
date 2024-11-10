'use client'

import { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowUpIcon, ArrowDownIcon, AlertTriangleIcon, DollarSign, TrendingUp, BarChart3, Users, Rocket } from 'lucide-react'
import { Line, LineChart, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const styles = `
  @keyframes marquee {
    0% { transform: translateX(100%); }
    100% { transform: translateX(-100%); }
  }
  .animate-marquee {
    animation: marquee 20s linear infinite;
  }
`;

const DEGEN_SOL_ADDRESS = '4w6bnjMbj8G7Ga8SGYgEMYVRRbEiFV54Nt8DiF1Hpump'
const DEGEN_BASE_ADDRESS = '0x4ed4e862860bed51a9570b96d89af5e1b0efefed'
const GECKOTERMINAL_API_BASE_URL = 'https://api.geckoterminal.com/api/v2'
const DEGEN_POOL_ADDRESS = '9sVudkgTHqrZWBQPx6id4uQpBJcf6HXyFEVqU9U7Avwe'

type TokenData = {
  supply: string
  price: number
  marketCap: number
  volume24h: number
  logo: string
  priceChange24h: number
}

type Trade = {
  id: string
  type: 'buy' | 'sell'
  amount: number
}

const placeholderData: TokenData = {
  supply: '999,997,115',
  price: 0,
  marketCap: 0,
  volume24h: 0,
  logo: 'https://ipfs.io/ipfs/QmYPTQzJeg1H82iy9nsDhTbmnWuBVem37uqXNyTyTJ1L52',
  priceChange24h: 0
}

export default function EnhancedDegenDashboard() {
  const [tokenDataSol, setTokenDataSol] = useState<TokenData | null>(null)
  const [tokenDataBase, setTokenDataBase] = useState<TokenData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [priceHistory, setPriceHistory] = useState<{ date: string; priceSol: number; priceBase: number }[]>([])
  const [recentTrades, setRecentTrades] = useState<Trade[]>([])
  const prevPrice = useRef<number | null>(null)

  const fetchTokenData = async (address: string, network: string, setData: React.Dispatch<React.SetStateAction<TokenData | null>>) => {
    try {
      const response = await axios.get(`${GECKOTERMINAL_API_BASE_URL}/networks/${network}/tokens/${address}`, {
        headers: { 'Accept': 'application/json;version=20230302' }
      })
      const data = response.data.data.attributes
      if (!data || !data.volume_usd || !data.volume_usd.h24) {
        throw new Error('Invalid data structure received from API')
      }
      const newPrice = parseFloat(data.price_usd)
      const priceChange24h = ((newPrice - parseFloat(data.price_usd_24h_change)) / parseFloat(data.price_usd_24h_change)) * 100
      prevPrice.current = newPrice
      setData({
        supply: "999,997,115",
        price: newPrice,
        marketCap: parseFloat(data.fdv_usd),
        volume24h: parseFloat(data.volume_usd.h24),
        logo: "https://ipfs.io/ipfs/QmYPTQzJeg1H82iy9nsDhTbmnWuBVem37uqXNyTyTJ1L52",
        priceChange24h: priceChange24h
      })
    } catch (err) {
      console.error('Error fetching token data:', err)
      setError('Failed to fetch token data.')
      setData(placeholderData)
    }
  }

  const fetchTrades = async () => {
    try {
      const response = await axios.get(`${GECKOTERMINAL_API_BASE_URL}/networks/solana/pools/${DEGEN_POOL_ADDRESS}/trades`, {
        headers: { 'Accept': 'application/json;version=20230302' }
      })
      const trades = response.data.data
      const formattedTrades = trades.slice(0, 5).map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (trade: any) => ({
          id: trade.id,
          type: trade.attributes.kind as 'buy' | 'sell',
          amount: parseFloat(trade.attributes.volume_in_usd),
        })
      );
      
      setRecentTrades(formattedTrades)
    } catch (err) {
      console.error('Error fetching trade data:', err)
      setError('Failed to fetch trade data.')
    }
  }

  useEffect(() => {
    const fetchData = () => {
      fetchTokenData(DEGEN_SOL_ADDRESS, 'solana', setTokenDataSol)
      fetchTokenData(DEGEN_BASE_ADDRESS, 'base', setTokenDataBase)
      fetchTrades()
    }

    fetchData()
    const interval = setInterval(fetchData, 15000) // Fetch every 15 seconds

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (tokenDataSol && tokenDataBase) {
      const today = new Date().toISOString().split('T')[0]
      setPriceHistory(prev => {
        const existingEntry = prev.find(entry => entry.date === today)
        if (existingEntry) {
          return prev.map(entry => 
            entry.date === today 
              ? { ...entry, priceSol: tokenDataSol.price, priceBase: tokenDataBase.price }
              : entry
          )
        } else {
          return [...prev, { date: today, priceSol: tokenDataSol.price, priceBase: tokenDataBase.price }].slice(-30) // Keep last 30 days
        }
      })
    }
  }, [tokenDataSol, tokenDataBase])

  if (!tokenDataSol || !tokenDataBase) {
    return <div className="flex justify-center items-center h-screen bg-black text-white text-2xl font-bold">Loading DEGEN data...</div>
  }

  

  const dominanceData = [
    { name: 'DEGEN SOL', value: tokenDataSol.marketCap },
    { name: 'DEGEN BASE', value: tokenDataBase.marketCap }
  ]

  const COLORS = ['#8884d8', '#82ca9d']

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 overflow-hidden">
      <style jsx>{styles}</style>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <img src={tokenDataSol.logo} alt="DEGEN Token" className="w-16 h-16 rounded-full" />
            <h1 className="text-4xl font-bold text-[#a36efd]">DEGEN Dashboard</h1>
          </div>
          <div className="flex gap-4">
            <Button
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full text-lg"
              onClick={() => window.open('https://raydium.io/swap/?inputMint=So11111111111111111111111111111111111111112&outputMint=4w6bnjMbj8G7Ga8SGYgEMYVRRbEiFV54Nt8DiF1Hpump', '_blank')}
            >
              <Rocket className="mr-2 h-5 w-5 inline-block" /> Buy DEGEN
            </Button>
            <Button
              className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-full text-lg"
              onClick={() => window.open('https://t.me/DEGEN_COIN_SOLANA', '_blank')}
            >
              <svg className="mr-2 h-5 w-5 inline-block" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.49-1.302.481-.428-.009-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.015 3.333-1.386 4.025-1.627 4.477-1.635.099-.002.321.023.465.178.12.13.145.309.164.433-.001.134-.01.183-.01.183z"/>
              </svg>
              Telegram
            </Button>
            <Button
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full text-lg"
              onClick={() => window.open('https://x.com/DegenToSolana', '_blank')}
            >
              <svg className="mr-2 h-5 w-5 inline-block" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              Twitter
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-900 border-l-4 border-red-500 text-white p-4 mb-6 rounded-lg" role="alert">
            <div className="flex items-center">
              <AlertTriangleIcon className="h-6 w-6 mr-2" />
              <p>{error}</p>
            </div>
            <p className="mt-2 text-sm">Please try refreshing the page.</p>
          </div>
        )}

        <div className="bg-gray-800 p-4 rounded-lg mb-6 overflow-hidden border-2 border-[#a36efd]">
          <div className="animate-marquee whitespace-nowrap">
            {recentTrades.map((trade) => (
              <span key={trade.id} className={`mr-4 ${trade.type === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                {trade.type === 'buy' ? '🟢 Bought:' : '🔴 Sold:'} ${trade.amount.toFixed(2)}
              </span>
            ))}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-[#a36efd]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-bold text-white">DEGEN Price</CardTitle>
              <DollarSign className="h-6 w-6 text-white" />
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-extrabold ${tokenDataSol.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${tokenDataSol.price.toFixed(6)}
                {tokenDataSol.priceChange24h >= 0 ? (
                  <ArrowUpIcon className="inline ml-2 h-6 w-6" />
                ) : (
                  <ArrowDownIcon className="inline ml-2 h-6 w-6" />
                )}
              </div>
              <div className="text-sm font-semibold mt-2 text-gray-400">
                {!isNaN(tokenDataSol.priceChange24h) ? `${Math.abs(tokenDataSol.priceChange24h).toFixed(2)}%` : 'N/A'} (24h)
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-[#a36efd]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-bold text-white">Market Cap</CardTitle>
              <TrendingUp className="h-6 w-6 text-white" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-white">${tokenDataSol.marketCap.toLocaleString("en-US", {maximumFractionDigits: 0})}</div>
              <div className="text-sm font-semibold mt-2 text-gray-400">
                DEGEN SOL
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-[#a36efd]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-bold text-white">24h Volume</CardTitle>
              <BarChart3 className="h-6 w-6 text-white" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-white">${tokenDataSol.volume24h.toLocaleString("en-US", {maximumFractionDigits: 0})}</div>
              <div className="text-sm font-semibold mt-2 text-gray-400">
                DEGEN SOL
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-[#a36efd]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-bold text-white">Total Supply</CardTitle>
              <Users className="h-6 w-6 text-white" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-white">{tokenDataSol.supply}</div>
              <div className="text-sm font-semibold mt-2 text-gray-400">
                Fixed Supply
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <Card className="bg-gray-900 rounded-xl shadow-lg border-2 border-[#a36efd]">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white">DEGEN Comparison</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <div className="h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={priceHistory}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="priceSol" stroke="#8884d8" name="DEGEN SOL" />
                    <Line type="monotone" dataKey="priceBase" stroke="#82ca9d" name="DEGEN BASE" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 rounded-xl shadow-lg border-2 border-[#a36efd]">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white">DEGEN Dominance</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dominanceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {dominanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="  lg:grid-cols-2 gap-6 mt-6">
          <Card className="bg-gray-900 rounded-xl shadow-lg border-2 border-[#a36efd]">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white">DEGEN Chart</CardTitle>
            </CardHeader>
            <CardContent className="h-[600px]">
              <iframe
                height="100%"
                width="100%"
                id="geckoterminal-embed"
                title="GeckoTerminal Embed"
                src="https://www.geckoterminal.com/fr/solana/pools/9sVudkgTHqrZWBQPx6id4uQpBJcf6HXyFEVqU9U7Avwe?embed=1&info=0&swaps=0"
                frameBorder="0"
                allow="clipboard-write"
                allowFullScreen
              ></iframe>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}