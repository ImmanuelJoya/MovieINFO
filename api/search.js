// api/search.js
export default async function handler(req, res) {
    const { s, i } = req.query;          // s = search, i = imdb id
    const key = process.env.OMDB_KEY;    // secret, never leaves the server

    const url = i
        ? `https://www.omdbapi.com/?apikey=${key}&i=${encodeURIComponent(i)}`
        : `https://www.omdbapi.com/?apikey=${key}&s=${encodeURIComponent(s)}`;

    try {
        const omdb = await fetch(url).then(r => r.json());
        res.status(200).json(omdb);
    } catch (e) {
        res.status(500).json({ Error: 'Upstream error' });
    }
}