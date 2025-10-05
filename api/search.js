import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
    windowMs: 60_000,          // 1 min
    max: 30,                   // 30 req / min / IP
    message: { Error: 'Too many requests, try again later.' },
});

export default async function handler(req, res) {
    await limiter(req, res);               // apply rate-limit
    if (req.method !== 'GET') return res.status(405).end();

    const { s, i } = req.query;
    if (!s && !i) return res.status(400).json({ Error: 'Missing query' });

    const key = process.env.OMDB_KEY;      // secret
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
}