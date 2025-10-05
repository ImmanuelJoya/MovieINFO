export default function headers(req, res, next) {
    res.setHeader('Content-Security-Policy',
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' cdn.jsdelivr.net; " +  // skeleton inline
        "style-src 'self' 'unsafe-inline' cdn.jsdelivr.net fonts.googleapis.com; " +
        "font-src 'self' fonts.gstatic.com; " +
        "img-src 'self' m.media-amazon.com images-na.ssl-images-amazon.com via.placeholder.com data:; " +
        "connect-src 'self' movie-info-tau.vercel.app;");
    res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    next();
}