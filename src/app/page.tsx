'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Rocket, Users, DollarSign, TrendingUp, Twitter, Send } from 'lucide-react'

const GECKOTERMINAL_API_BASE_URL = 'https://api.geckoterminal.com/api/v2'
const DEGEN_SOL_ADDRESS = '4w6bnjMbj8G7Ga8SGYgEMYVRRbEiFV54Nt8DiF1Hpump'

type TokenData = {
  price: number
  marketCap: number
  volume24h: number
  supply: number
  holders: number
}

const styles = `
.comic-sans {
  font-family: 'Comic Sans MS', 'Comic Sans', 'Chalkboard SE', 'Comic Neue', sans-serif;
}

.degen-button {
  background: linear-gradient(to right, #a36efd, #4c2897);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(163, 110, 253, 0.7);
  }
  
  70% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(163, 110, 253, 0);
  }
  
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(163, 110, 253, 0);
  }
}

.card-glow {
  border: 2px solid #a36efd;
  box-shadow: 0 0 15px rgba(163, 110, 253, 0.3);
}

.stat-value {
  color: #FFD700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

.ca-glow {
  box-shadow: 0 0 20px rgba(163, 110, 253, 0.5);
}

* {
  font-family: inherit;
}
`

export default function DegenLandingPage() {
  const [tokenData, setTokenData] = useState<TokenData | null>(null)

  useEffect(() => {
    const fetchTokenData = async () => {
      try {
        const response = await axios.get(`${GECKOTERMINAL_API_BASE_URL}/networks/solana/tokens/${DEGEN_SOL_ADDRESS}`)
        const data = response.data.data.attributes
        setTokenData({
          price: parseFloat(data.price_usd),
          marketCap: parseFloat(data.fdv_usd),
          volume24h: parseFloat(data.volume_usd.h24),
          supply: parseFloat(data.total_supply),
          holders: 1694 // Placeholder value
        })
      } catch (err) {
        console.error('Error fetching token data:', err)
      }
    }

    fetchTokenData()
    const interval = setInterval(fetchTokenData, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-[#4c2897] text-white comic-sans">
      <style jsx>{styles}</style>
      
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1500x500.jpg-YjM0r5wePu3r2PE50HAS0hupANXyN3.jpeg" 
            alt="DEGEN Background" 
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-[#4c2897] bg-opacity-70"></div>
        </div>
        <div className="relative z-10 text-center">
          <img 
            src="https://ipfs.io/ipfs/QmYPTQzJeg1H82iy9nsDhTbmnWuBVem37uqXNyTyTJ1L52" 
            alt="DEGEN Logo" 
            className="w-32 h-32 mx-auto mb-4 rounded-full border-4 border-[#a36efd]" 
          />
          <h1 className="text-6xl md:text-8xl font-extrabold mb-4 animate-pulse">
            $DEGEN
          </h1>
          <p className="text-2xl md:text-3xl mb-8">Made by Degens, For Degens</p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
            <Button
              size="lg"
              className="degen-button text-white font-bold py-4 px-8 rounded-full text-xl"
              onClick={() => window.open('https://raydium.io/swap/?inputMint=So11111111111111111111111111111111111111112&outputMint=4w6bnjMbj8G7Ga8SGYgEMYVRRbEiFV54Nt8DiF1Hpump', '_blank')}
            >
              GET $DEGEN 🎩
            </Button>
            <div className="relative">
              <Button
                size="lg"
                className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 px-8 rounded-full text-xl"
                disabled
              >
                BRIDGE
              </Button>
              <span className="absolute -top-2 -right-2 bg-[#a36efd] text-white text-xs font-bold px-2 py-1 rounded-full">Coming Soon</span>
            </div>
          </div>
          <div className="bg-gradient-to-r from-[#a36efd] to-[#4c2897] p-6 rounded-lg inline-block shadow-lg mt-8 animate-pulse ca-glow">
            <p className="text-xl font-mono break-all text-white font-bold">CA : {DEGEN_SOL_ADDRESS}</p>
          </div>
        </div>
      </section>

      {/* Token Stats */}
      <section className="py-16 px-4 bg-[#4c2897]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-8 text-center">🎩 DEGEN Token Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tokenData && (
              <>
                <Card className="bg-[#4c2897] card-glow">
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <DollarSign className="w-12 h-12 mb-4 text-[#a36efd]" />
                    <h3 className="text-lg font-semibold mb-2 text-white">Price</h3>
                    <p className="text-3xl font-bold stat-value">${tokenData.price.toFixed(6)}</p>
                  </CardContent>
                </Card>
                <Card className="bg-[#4c2897] card-glow">
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <TrendingUp className="w-12 h-12 mb-4 text-[#a36efd]" />
                    <h3 className="text-lg font-semibold mb-2 text-white">Market Cap</h3>
                    <p className="text-3xl font-bold stat-value">${(tokenData.marketCap / 1000000).toFixed(2)}M</p>
                  </CardContent>
                </Card>
                <Card className="bg-[#4c2897] card-glow">
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <Rocket className="w-12 h-12 mb-4 text-[#a36efd]" />
                    <h3 className="text-lg font-semibold mb-2 text-white">24h Volume</h3>
                    <p className="text-3xl font-bold stat-value">${(tokenData.volume24h / 1000000).toFixed(2)}M</p>
                  </CardContent>
                </Card>
                <Card className="bg-[#4c2897] card-glow">
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <Users className="w-12 h-12 mb-4 text-[#a36efd]" />
                    <h3 className="text-lg font-semibold mb-2 text-white">Holders</h3>
                    <p className="text-3xl font-bold stat-value">{tokenData.holders.toLocaleString()}</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 px-4 bg-[#a36efd]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-8">🎩 What is DEGEN?</h2>
          <p className="text-xl mb-8 text-justify">
          Dive into the world of $DEGEN on Solana, a token created by and for true crypto degens.<br/>
          More than just a memecoin, it’s a community-powered rebellion, taking charge with bold initiatives and unstoppable energy. Join the movement where every member is a driving force, shaping a fearless, independent future for the degen spirit.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              size="lg"
              className="degen-button text-white font-bold py-4 px-8 rounded-full text-xl hover:scale-105 transition-transform"
              onClick={() => window.open('https://t.me/DEGEN_COIN_SOLANA', '_blank')}
            >
              <Send className="w-5 h-5 mr-2" />
              Join Our Community
            </Button>
            <Button
              size="lg"
              className="bg-[#4c2897] hover:bg-[#3d1f7a] text-white font-bold py-4 px-8 rounded-full text-xl hover:scale-105 transition-transform"
              onClick={() => window.open('https://x.com/DegenToSolana', '_blank')}
            >
              <Twitter className="w-5 h-5 mr-2" />
              Follow on Twitter
            </Button>
          </div>
        </div>
      </section>

      {/* Chart Section */}
      <section className="py-16 px-4 bg-[#4c2897]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-8 text-center">🎩 DEGEN Chart</h2>
          <Card className="card-glow bg-[#4c2897]">
            <CardContent className="h-[600px] pt-6">
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
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-[#a36efd]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-8">🎩 Ready to become DEGEN?</h2>
          <p className="text-xl mb-8">
            The hat is purple for a reason. <br/>Unburdened by what it was. <br/> Becoming what it could have been.
          </p>
          <Button
            size="lg"
            className="degen-button text-white font-bold py-4 px-8 rounded-full text-xl"
            onClick={() => window.open('https://raydium.io/swap/?inputMint=So11111111111111111111111111111111111111112&outputMint=4w6bnjMbj8G7Ga8SGYgEMYVRRbEiFV54Nt8DiF1Hpump', '_blank')}
          >
            GET $DEGEN 🎩
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#4c2897] py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <img 
              src="https://ipfs.io/ipfs/QmYPTQzJeg1H82iy9nsDhTbmnWuBVem37uqXNyTyTJ1L52" 
              alt="DEGEN Logo" 
              className="w-10 h-10 mr-2 rounded-full" 
            />
            <p className="text-lg">© 2024 DEGEN. All rights reserved.</p>
          </div>
          <div className="flex gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:text-[#a36efd]"
              onClick={() => window.open('https://x.com/DegenToSolana', '_blank')}
            >
              <Twitter className="h-6 w-6" />
              <span className="sr-only">Twitter</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:text-[#a36efd]"
              onClick={() => window.open('https://t.me/DEGEN_COIN_SOLANA', '_blank')}
            >
              <Send className="h-6 w-6" />
              <span className="sr-only">Telegram</span>
            </Button>
          </div>
        </div>
      </footer>
    </div>
  )
}