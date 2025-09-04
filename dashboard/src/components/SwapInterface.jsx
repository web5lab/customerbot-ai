import { useState } from 'react';
import { ArrowDownUp, Wallet, RefreshCw, Info } from 'lucide-react';


const TOKENS = [
  {
    symbol: 'ETH',
    address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    decimals: 18,
    balance: '1.245',
    icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg'
  },
  {
    symbol: 'USDC',
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    decimals: 6,
    balance: '2,500.00',
    icon: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg'
  },
  {
    symbol: 'USDT',
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    decimals: 6,
    balance: '1,750.00',
    icon: 'https://cryptologos.cc/logos/tether-usdt-logo.svg'
  },
  {
    symbol: 'DAI',
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    decimals: 18,
    balance: '3,200.00',
    icon: 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.svg'
  }
];

export function SwapInterface() {
  const [fromToken, setFromToken] = useState(TOKENS[0]);
  const [toToken, setToToken] = useState(TOKENS[1]);
  const [amount, setAmount] = useState('');
  const [quote, setQuote] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [slippage, setSlippage] = useState('0.5');
  const [showSlippageSettings, setShowSlippageSettings] = useState(false);

  const handleSwap = async (e) => {
    e.preventDefault();
    // In production, this would connect to wallet and execute the swap
    alert('Wallet connection and swap execution would happen here');
  };

  const handleGetQuote = async () => {
    if (!amount || isNaN(Number(amount))) return;
    
    setIsLoading(true);
    try {
      // Simulated quote for demo
      const mockPrice = Math.random() * 1000;
      setQuote(mockPrice.toFixed(2));
    } catch (error) {
      console.error('Error getting quote:', error);
      setQuote(null);
    } finally {
      setIsLoading(false);
    }
  };

  const estimatedOutput = quote ? Number(quote).toLocaleString('en-US', {
    maximumFractionDigits: 6
  }) : '0.00';

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-900">Swap Tokens</h3>
        <button className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700">
          <Wallet className="w-4 h-4" />
          Connect Wallet
        </button>
      </div>

      <form onSubmit={handleSwap} className="space-y-6">
        <div className="space-y-2">
          <div className="relative bg-gray-100 p-4 rounded-lg">
            <label className="text-xs text-gray-500 mb-2 block">You Pay</label>
            <div className="flex items-center gap-3">
            <input
              type="number"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setQuote(null);
              }}
              placeholder="0.0"
              className="flex-1 bg-transparent text-2xl font-medium focus:outline-none"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 transition-colors"
                onClick={() => setFromToken(TOKENS.find(t => t !== fromToken))}
              >
                <img src={fromToken.icon} alt={fromToken.symbol} className="w-5 h-5" />
                <span className="font-medium">{fromToken.symbol}</span>
              </button>
            </div>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
              <span>Balance: {fromToken.balance} {fromToken.symbol}</span>
              <button
                type="button"
                onClick={() => setAmount(fromToken.balance)}
                className="text-gray-600 hover:text-gray-900"
              >
                MAX
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => {
              const temp = fromToken;
              setFromToken(toToken);
              setToToken(temp);
              setQuote(null);
            }}
            className="p-2 rounded-full hover:bg-gray-100 border border-gray-200 bg-white -my-3 z-10"
          >
            <ArrowDownUp className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        <div className="space-y-2">
          <div className="relative bg-gray-100 p-4 rounded-lg">
            <label className="text-xs text-gray-500 mb-2 block">You Receive</label>
            <div className="flex items-center gap-3">
            <input
              type="text"
              value={estimatedOutput}
              readOnly
              placeholder="0.0"
              className="flex-1 bg-transparent text-2xl font-medium"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 transition-colors"
                onClick={() => setToToken(TOKENS.find(t => t !== toToken))}
              >
                <img src={toToken.icon} alt={toToken.symbol} className="w-5 h-5" />
                <span className="font-medium">{toToken.symbol}</span>
              </button>
            </div>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
              <span>Balance: {toToken.balance} {toToken.symbol}</span>
              <div className="flex items-center gap-1">
                <Info className="w-3 h-3" />
                <span>1 {fromToken.symbol} ≈ {(Number(quote) / Number(amount || 1)).toFixed(6)} {toToken.symbol}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowSlippageSettings(!showSlippageSettings)}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Slippage Tolerance
            </button>
            <span className="text-sm font-medium">{slippage}%</span>
          </div>
          
          {showSlippageSettings && (
            <div className="flex gap-2">
              {['0.1', '0.5', '1.0'].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSlippage(value)}
                  className={`flex-1 px-3 py-1.5 rounded-lg text-sm ${
                    slippage === value
                      ? 'bg-gray-200 text-gray-900'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {value}%
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <button
            type="button"
            onClick={handleGetQuote}
            className={`w-full px-4 py-3 rounded-xl flex items-center justify-center gap-2 ${
              isLoading
                ? 'bg-gray-200 cursor-wait'
                : 'bg-gray-200 hover:bg-gray-300'
            } text-gray-700 transition-colors font-medium`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Getting Best Quote...
              </>
            ) : (
              'Get Quote'
            )}
          </button>
          <button
            type="submit"
            className="w-full px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
            disabled={!quote}
          >
            Swap
          </button>
        </div>
      </form>
    </div>
  );
}