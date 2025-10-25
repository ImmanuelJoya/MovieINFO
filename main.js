/*  main.js  –  plain jQuery + Axios  */
$(function () { 
    const loadingSpinner =
        '<div class="text-center my-5"><div class="spinner-border text-primary" role="status">' +
        '<span class="visually-hidden">Loading…</span></div></div>';

    /* ----- back-to-top ----- */
    $('body').append(
        '<button id="backToTop" class="btn btn-primary position-fixed bottom-0 end-0 m-4" style="display:none;">' +
        '<i class="fas fa-arrow-up"></i></button>'
    );
    $(window).on('scroll', () =>
        $(window).scrollTop() > 200
            ? $('#backToTop').fadeIn()
            : $('#backToTop').fadeOut()
    );
    $('#backToTop').on('click', () =>
        $('html,body').animate({ scrollTop: 0 }, 'slow')
    );

    /* ----- live search ----- */
    let searchTimeout;
    const $movies = $('#movies');
    const $search = $('#searchText');

    $search.on('input', (e) => {
        clearTimeout(searchTimeout);
        const q = e.target.value.trim();
        if (q.length > 2) {
            $movies.html(loadingSpinner);
            searchTimeout = setTimeout(() => getMovies(q), 500);
        }
    });

    $('#searchForm').on('submit', (e) => {
        e.preventDefault();
        const q = $search.val().trim();
        if (q) {
            $movies.html(loadingSpinner);
            getMovies(q);
        }
    });
});

/* ----------  SEARCH  ---------- */
function getMovies(query) {
    axios
        .get(
            `https://www.omdbapi.com/?apikey=5acafce3&s=${encodeURIComponent(
                query.toLowerCase()
            )}`
        )
        .then((res) => {
            const list = res.data.Search;
            if (!list || list.length === 0) {
                $('#movies').html(noResultTpl(query));
                return;
            }
            $('#movies').html(list.map(cardTpl).join(''));
        })
        .catch(() => $('#movies').html(errorTpl()));
}

/* ----------  DETAIL PAGE  ---------- */
function movieSelected(id) {
    sessionStorage.setItem('movieId', id);
    location.href = 'movie.html';
    return false;
}

/* only runs on movie.html */
if (location.pathname.includes('movie.html')) {
    $(() => getMovie());
}

function getMovie() {
    const id = sessionStorage.getItem('movieId');
    $('#movie').html(
        '<div class="text-center my-5"><div class="spinner-border text-primary" role="status">' +
        '<span class="visually-hidden">Loading…</span></div></div>'
    );

    axios
        .get(
            `https://www.omdbapi.com/?apikey=5acafce3&i=${encodeURIComponent(id)}&plot=full`
        )
        .then((res) => renderDetail(res.data))
        .catch(() => $('#movie').html(errorTpl()));
}

/* ----------  RENDER TEMPLATES  ---------- */
const cardTpl = (m) => {
    const poster =
        m.Poster === 'N/A'
            ? 'https://via.placeholder.com/300x450?text=No+Poster'
            : m.Poster;
    return `
    <div class="col-md-3 mt-5">
      <div class="well text-center movie-card">
        <div class="poster-container">
          <img class="thumbnail rounded-3" src="${poster}" alt="${m.Title} Poster">
          <div class="year-badge">${m.Year}</div>
        </div>
        <h5 class="mt-3 mb-3">${m.Title}</h5>
        <a onclick="movieSelected('${m.imdbID}')" class="btn btn-primary" href="#">Movie Details</a>
      </div>
    </div>`;
};

const noResultTpl = (q) => `
  <div class="alert alert-info text-center mt-5">
    <i class="fas fa-info-circle me-2"></i>
    No movies found matching “${q}”.<br>
    Try different keywords or check your spelling.
  </div>`;

const errorTpl = () => `
  <div class="alert alert-danger text-center mt-5">
    <i class="fas fa-exclamation-circle me-2"></i>
    Something went wrong while fetching the movies.<br>
    Please try again later.
  </div>`;

/* ----------  DETAIL RENDER  ---------- */
function renderDetail(m) {
    const rating = parseFloat(m.imdbRating) || 0;
    let stars = '';
    for (let i = 0; i < 10; i++) {
        if (i < Math.floor(rating)) stars += '<i class="fas fa-star text-warning"></i>';
        else if (i === Math.floor(rating) && rating % 1 >= 0.5)
            stars += '<i class="fas fa-star-half-alt text-warning"></i>';
        else stars += '<i class="far fa-star text-warning"></i>';
    }

    const poster =
        m.Poster === 'N/A'
            ? 'https://via.placeholder.com/300x450?text=No+Poster'
            : m.Poster;

    $('#movie').html(`
    <div class="row rounded-2 mt-3">
      <div class="col-md-4">
        <img src="${poster}" alt="${m.Title} Poster" class="thumbnail shadow">
        <div class="rating-container text-center mt-3">
          <h4>IMDb Rating</h4>
          <div class="stars">${stars}</div>
          <h3 class="mt-2">${m.imdbRating}/10</h3>
          <p class="text-muted">(${m.imdbVotes} votes)</p>
        </div>
      </div>
      <div class="col-md-8">
        <h2 class="mb-4">${m.Title} <span class="text-muted">(${m.Year})</span></h2>
        <div class="badges mb-4">
          <span class="badge bg-primary">${m.Rated}</span>
          <span class="badge bg-secondary">${m.Runtime}</span>
          ${m.Genre.split(', ')
            .map((g) => `<span class="badge bg-info">${g}</span>`)
            .join(' ')}
        </div>
        <ul class="list-group">
          <li class="list-group-item"><strong>Released:</strong> ${m.Released}</li>
          <li class="list-group-item"><strong>Director:</strong> ${m.Director}</li>
          <li class="list-group-item"><strong>Writer:</strong> ${m.Writer}</li>
          <li class="list-group-item"><strong>Actors:</strong> ${m.Actors}</li>
          <li class="list-group-item"><strong>Awards:</strong> ${m.Awards}</li>
          <li class="list-group-item"><strong>Box Office:</strong> ${m.BoxOffice || 'N/A'}</li>
        </ul>
      </div>
    </div>
    <div class="row mt-4">
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <h3 class="card-title">Plot</h3>
            <p class="card-text">${m.Plot}</p>
            <div class="mt-4">
              <a href="https://www.imdb.com/title/${m.imdbID}" target="_blank" class="btn btn-primary">
                <i class="fas fa-external-link-alt me-2"></i>View on IMDb
              </a>
              <a href="index.html" class="btn btn-outline-secondary ms-2">
                <i class="fas fa-arrow-left me-2"></i>Go Back
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>`);
}
