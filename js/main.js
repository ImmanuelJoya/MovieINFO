/*  main.js  –  ES-module build (Vite / Webpack / plain <script type="module">)  */
import './icons.js';               // tree-shaken FA icons

/* ----------  UTILS  ---------- */
const loadingSpinner =
    '<div class="text-center my-5"><div class="spinner-border text-primary" role="status">' +
    '<span class="visually-hidden">Loading…</span></div></div>';

const buildSkeleton = n => {
    let html = '';
    for (let i = 0; i < n; i++) {
        html += `
      <div class="col-md-3 mt-5">
        <div class="card skeleton-card" aria-hidden="true">
          <div class="skeleton" style="height:400px"></div>
          <div class="card-body">
            <div class="skeleton w-75 mb-2"></div>
            <div class="skeleton w-50"></div>
          </div>
        </div>
      </div>`;
    }
    return html;
};

const cardTpl = m => {
    m.Poster = m.Poster === 'N/A'
        ? 'https://via.placeholder.com/300x450?text=No+Poster'
        : m.Poster;
    return `
    <div class="col-md-3 mt-5">
      <div class="card h-100 shadow-sm">
        <div class="poster-container">
          <img data-src="${m.Poster}" alt="${m.Title} poster" class="card-img-top lazy">
          <div class="year-badge">${m.Year}</div>
        </div>
        <div class="card-body d-flex flex-column">
          <h5 class="card-title flex-grow-1">${m.Title}</h5>
          <button class="btn btn-primary btn-sm" onclick="movieSelected('${m.imdbID}')">Details</button>
        </div>
      </div>
    </div>`;
};

const noResultTpl = q => `
  <div class="alert alert-info text-center mt-5">
    <i class="fas fa-info-circle me-2"></i>No movies found for “<strong>${q}</strong>”.
  </div>`;

const errorTpl = () => `
  <div class="alert alert-danger text-center mt-5">
    <i class="fas fa-exclamation-circle me-2"></i>Something went wrong.
  </div>`;

/* ----------  BACK-TO-TOP  ---------- */
$('body').append(
    '<button id="backToTop" class="btn btn-primary position-fixed bottom-0 end-0 m-4" style="display:none;">' +
    '<i class="fas fa-arrow-up"></i></button>'
);
$(window).on('scroll', () =>
    $(window).scrollTop() > 200 ? $('#backToTop').fadeIn() : $('#backToTop').fadeOut()
);
$('#backToTop').on('click', () => $('html,body').animate({ scrollTop: 0 }, 'slow'));

/* ----------  SEARCH  ---------- */
let searchTimeout, searchController;

$('#searchText').on('input', e => {
    clearTimeout(searchTimeout);
    const q = e.target.value.trim();
    if (q.length > 2) {
        $('#movies').html(buildSkeleton(8));
        searchTimeout = setTimeout(() => getMovies(q), 600);
    }
});

$('#searchForm').on('submit', e => {
    e.preventDefault();
    const q = $('#searchText').val().trim();
    if (q) {
        $('#movies').html(buildSkeleton(8));
        getMovies(q);
    }
});

function getMovies(query) {
    if (searchController) searchController.abort();        // cancel previous
    searchController = new AbortController();

    axios
        .get(`/api/search?s=${encodeURIComponent(query)}`, {
            signal: searchController.signal
        })
        .then(res => {
            const movies = res.data.Search;
            if (!movies) return $('#movies').html(noResultTpl(query));
            $('#movies').html(movies.map(cardTpl).join(''));
            lazyLoad();                       // activate lazy-loading
        })
        .catch(err => {
            if (axios.isCancel(err)) return;
            $('#movies').html(errorTpl());
        });
}

/* ----------  DETAIL PAGE  ---------- */
function movieSelected(id) {
    sessionStorage.setItem('movieId', id);
    location.href = 'movie.html';
}

if (location.pathname.includes('movie.html')) {
    const id = sessionStorage.getItem('movieId');
    const cacheKey = `omdb_${id}`;
    const cached = sessionStorage.getItem(cacheKey);

    if (cached) {
        renderDetail(JSON.parse(cached));
    } else {
        $('#movie').html(loadingSpinner);
        axios
            .get(`/api/search?i=${encodeURIComponent(id)}`)
            .then(res => {
                sessionStorage.setItem(cacheKey, JSON.stringify(res.data));
                renderDetail(res.data);
            })
            .catch(() => $('#movie').html(errorTpl()));
    }
}

function renderDetail(m) {
    const rating = parseFloat(m.imdbRating) || 0;
    let stars = '';
    for (let i = 0; i < 10; i++) {
        if (i < Math.floor(rating)) stars += '<i class="fas fa-star text-warning"></i>';
        else if (i === Math.floor(rating) && rating % 1 >= 0.5) stars += '<i class="fas fa-star-half-alt text-warning"></i>';
        else stars += '<i class="far fa-star text-warning"></i>';
    }
    const poster = m.Poster === 'N/A'
        ? 'https://via.placeholder.com/300x450?text=No+Poster'
        : m.Poster;

    $('#movie').html(`
    <div class="row mt-3">
      <div class="col-md-4">
        <img src="${poster}" class="img-fluid rounded shadow" alt="${m.Title}">
        <div class="text-center mt-3">
          <h4>IMDb Rating</h4><div>${stars}</div>
          <h3>${m.imdbRating}/10</h3>
          <p class="text-muted">(${m.imdbVotes} votes)</p>
        </div>
      </div>
      <div class="col-md-8">
        <h2>${m.Title} <span class="text-muted">(${m.Year})</span></h2>
        <div class="mb-3">
          <span class="badge bg-primary">${m.Rated}</span>
          <span class="badge bg-secondary">${m.Runtime}</span>
          ${m.Genre.split(', ').map(g => `<span class="badge bg-info">${g}</span>`).join(' ')}
        </div>
        <ul class="list-group mb-4">
          <li class="list-group-item"><strong>Released:</strong> ${m.Released}</li>
          <li class="list-group-item"><strong>Director:</strong> ${m.Director}</li>
          <li class="list-group-item"><strong>Writer:</strong> ${m.Writer}</li>
          <li class="list-group-item"><strong>Actors:</strong> ${m.Actors}</li>
          <li class="list-group-item"><strong>Awards:</strong> ${m.Awards}</li>
          <li class="list-group-item"><strong>Box Office:</strong> ${m.BoxOffice || 'N/A'}</li>
        </ul>
        <div class="card">
          <div class="card-body">
            <h3>Plot</h3>
            <p>${m.Plot}</p>
            <a href="https://imdb.com/title/${m.imdbID}" target="_blank" class="btn btn-primary">
              <i class="fas fa-external-link-alt me-2"></i>IMDb
            </a>
            <a href="index.html" class="btn btn-outline-secondary ms-2">
              <i class="fas fa-arrow-left me-2"></i>Back
            </a>
          </div>
        </div>
      </div>
    </div>`);
}

/* ----------  LAZY-LOAD  ---------- */
function lazyLoad() {
    const images = document.querySelectorAll('img.lazy');
    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries, obs) => {
            entries.forEach(({ isIntersecting, target }) => {
                if (isIntersecting) {
                    target.src = target.dataset.src;
                    target.classList.remove('lazy');
                    obs.unobserve(target);
                }
            });
        });
        images.forEach(img => io.observe(img));
    } else {
        // fallback for old browsers
        images.forEach(img => { img.src = img.dataset.src; img.classList.remove('lazy'); });
    }
}