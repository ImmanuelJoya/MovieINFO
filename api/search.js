import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

const app = express();

// Enable CORS for your frontend origin
app.use(cors({
    origin: 'http://127.0.0.1:5500',
    methods: ['GET'],
}));

const limiter = rateLimit({
    windowMs: 60_000, // 1 min
    max: 30, // 30 req / min / IP
    message: { Error: 'Too many requests, try again later.' },
});

app.get('/api/search', limiter, async (req, res) => {
    const { s, i } = req.query;
    if (!s && !i) return res.status(400).json({ Error: 'Missing query' });

    const key = process.env.OMDB_KEY;
    const url = i
        ? `https://www.omdbapi.com/?apikey=${key}&i=${encodeURIComponent(i)}&plot=full`
        : `https://www.omdbapi.com/?apikey=${key}&s=${encodeURIComponent(s)}&page=1`;

    try {
        const upstream = await fetch(url);
        const data = await upstream.json();
        return res.status(200).json(data);
    } catch {
        return res.status(500).json({ Error: 'Upstream error' });
    }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));