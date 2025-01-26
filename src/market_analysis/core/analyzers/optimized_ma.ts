// Optimized Moving Average calculation methods
export function calculateOptimizedMA(prices: any[], period: number): number[] {
    const ma: number[] = new Array(prices.length).fill(0);
    
    // Calculate first MA value
    let sum = 0;
    for (let i = 0; i < period; i++) {
        sum += prices[i].price;
    }
    ma[period - 1] = sum / period;

    // Calculate remaining values using sliding window
    for (let i = period; i < prices.length; i++) {
        sum = sum - prices[i - period].price + prices[i].price;
        ma[i] = sum / period;
    }

    // Add volume-weighted component
    for (let i = period - 1; i < prices.length; i++) {
        let volumeWeight = 0;
        let volumeSum = 0;
        
        for (let j = 0; j < period; j++) {
            volumeWeight += prices[i - j].price * prices[i - j].volume;
            volumeSum += prices[i - j].volume;
        }
        
        // Blend regular MA with volume-weighted MA
        const vwma = volumeWeight / volumeSum;
        ma[i] = (ma[i] + vwma) / 2;
    }
    
    return ma;
}