const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3000;

// Middleware to parse URL-encoded bodies (form data)
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('index', { 
        prices: null, 
        equivalentAmountsUSD: null, 
        equivalentAmountsINR: null, 
        amount: null,
        error: null 
    });
});

app.post('/convert', async (req, res) => {
    const amountInUSD = req.body.amount;

    try {
        // Fetch cryptocurrency prices and USD to INR conversion rate
        const [cryptoResponse, conversionResponse] = await Promise.all([
            axios.get('https://api.coingecko.com/api/v3/simple/price', {
                params: {
                    ids: 'bitcoin,ethereum,solana,dogecoin,binancecoin',
                    vs_currencies: 'usd'
                }
            }),
            axios.get('https://api.coingecko.com/api/v3/simple/price', {
                params: {
                    ids: 'usd',
                    vs_currencies: 'inr'
                }
            })
        ]);

        const prices = cryptoResponse.data;
        const usdToInrRate = conversionResponse.data.usd.inr;

        const equivalentAmountsUSD = {
            bitcoin: amountInUSD / prices.bitcoin.usd,
            ethereum: amountInUSD / prices.ethereum.usd,
            solana: amountInUSD / prices.solana.usd,
            dogecoin: amountInUSD / prices.dogecoin.usd,
            binancecoin: amountInUSD / prices.binancecoin.usd
        };

        const amountInINR = amountInUSD * usdToInrRate;
        const equivalentAmountsINR = {
            bitcoin: amountInINR / prices.bitcoin.usd,
            ethereum: amountInINR / prices.ethereum.usd,
            solana: amountInINR / prices.solana.usd,
            dogecoin: amountInINR / prices.dogecoin.usd,
            binancecoin: amountInINR / prices.binancecoin.usd
        };

        res.render('index', {
            prices,
            equivalentAmountsUSD,
            equivalentAmountsINR,
            amount: amountInUSD,
            error: null
        });
    } catch (error) {
        console.error(error);
        res.render('index', { 
            prices: null, 
            equivalentAmountsUSD: null, 
            equivalentAmountsINR: null, 
            amount: null, 
            error: 'Failed to fetch data from API' 
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
