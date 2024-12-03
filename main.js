$(document).ready(() => {
    // Initialize loading spinner
    const loadingSpinner = '<div class="text-center my-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';
    
    // Back to top button
    $('body').append('<button id="backToTop" class="btn btn-primary position-fixed bottom-0 end-0 m-4" style="display: none;"><i class="fas fa-arrow-up"></i></button>');
    
    $(window).scroll(function() {
        if ($(this).scrollTop() > 200) {
            $('#backToTop').fadeIn();
        } else {
            $('#backToTop').fadeOut();
        }
    });
    
    $('#backToTop').click(() => {
        $('html, body').animate({scrollTop: 0}, 'slow');
    });

    // Real-time search with debounce
    let searchTimeout;
    $('#searchText').on('input', (e) => {
        clearTimeout(searchTimeout);
        let searchText = $('#searchText').val();
        if (searchText.length > 2) {
            $('#movies').html(loadingSpinner);
            searchTimeout = setTimeout(() => {
                getMovies(searchText);
            }, 500);
        }
    });

    $('#searchForm').on('submit', (e) => {
        let searchText = $('#searchText').val();
        if (searchText.length > 0) {
            $('#movies').html(loadingSpinner);
            getMovies(searchText);
        }
        e.preventDefault();
    });
});

function getMovies(searchText) {
    axios.get('http://www.omdbapi.com?apikey=5acafce3&s=' + searchText)
        .then((response) => {
            console.log(response);
            let movies = response.data.Search;
            let output = '';
            if (movies) {
                $.each(movies, (index, movie) => {
                    // Handle missing poster
                    const posterUrl = movie.Poster === 'N/A' ? 'https://via.placeholder.com/300x450.png?text=No+Poster+Available' : movie.Poster;
                    output += `
                    <div class="col-md-3 mt-5">
                        <div class="well text-center movie-card">
                            <div class="poster-container">
                                <img class="thumbnail rounded-3" src="${posterUrl}" alt="${movie.Title} Poster">
                                <div class="year-badge">${movie.Year}</div>
                            </div>
                            <h5 class="mt-3 mb-3">${movie.Title}</h5>
                            <a onclick="movieSelected('${movie.imdbID}')" class="btn btn-primary" href="#">Movie Details</a>
                        </div> 
                    </div>
                    `;
                });
                $('#movies').html(output);
            } else {
                $('#movies').html(`
                    <div class="alert alert-info text-center mt-5">
                        <i class="fas fa-info-circle me-2"></i>
                        No movies found matching "${searchText}".
                        <br>
                        Try different keywords or check your spelling.
                    </div>
                `);
            }
        })
        .catch((err) => {
            console.log(err);
            $('#movies').html(`
                <div class="alert alert-danger text-center mt-5">
                    <i class="fas fa-exclamation-circle me-2"></i>
                    Something went wrong while fetching the movies.
                    <br>
                    Please try again later or contact support if the problem persists.
                </div>
            `);
        });
}

function movieSelected(id) {
    sessionStorage.setItem('movieId', id);
    window.location = 'movie.html';
    return false;
}

function getMovie() {
    let movieId = sessionStorage.getItem('movieId');
    $('#movie').html('<div class="text-center my-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>');

    axios.get('http://www.omdbapi.com?apikey=5acafce3&i=' + movieId)
        .then((response) => {
            console.log(response);
            let movie = response.data;
            
            // Create rating stars
            const rating = parseFloat(movie.imdbRating);
            const fullStars = Math.floor(rating);
            const hasHalfStar = rating % 1 >= 0.5;
            let starsHtml = '';
            
            for (let i = 0; i < 10; i++) {
                if (i < fullStars) {
                    starsHtml += '<i class="fas fa-star text-warning"></i>';
                } else if (i === fullStars && hasHalfStar) {
                    starsHtml += '<i class="fas fa-star-half-alt text-warning"></i>';
                } else {
                    starsHtml += '<i class="far fa-star text-warning"></i>';
                }
            }

            const posterUrl = movie.Poster === 'N/A' ? 'https://via.placeholder.com/300x450.png?text=No+Poster+Available' : movie.Poster;

            let output = `
            <div class="row rounded-2 mt-3">
                <div class="col-md-4">
                    <img src="${posterUrl}" alt="${movie.Title} Poster" class="thumbnail shadow">
                    <div class="rating-container text-center mt-3">
                        <h4>IMDB Rating</h4>
                        <div class="stars">
                            ${starsHtml}
                        </div>
                        <h3 class="mt-2">${movie.imdbRating}/10</h3>
                        <p class="text-muted">(${movie.imdbVotes} votes)</p>
                    </div>
                </div>
                <div class="col-md-8">
                    <h2 class="mb-4">${movie.Title} <span class="text-muted">(${movie.Year})</span></h2>
                    <div class="badges mb-4">
                        <span class="badge bg-primary">${movie.Rated}</span>
                        <span class="badge bg-secondary">${movie.Runtime}</span>
                        ${movie.Genre.split(', ').map(genre => `<span class="badge bg-info">${genre}</span>`).join(' ')}
                    </div>
                    <ul class="list-group">
                        <li class="list-group-item"><strong>Released:</strong> ${movie.Released}</li>
                        <li class="list-group-item"><strong>Director:</strong> ${movie.Director}</li>
                        <li class="list-group-item"><strong>Writer:</strong> ${movie.Writer}</li>
                        <li class="list-group-item"><strong>Actors:</strong> ${movie.Actors}</li>
                        <li class="list-group-item"><strong>Awards:</strong> ${movie.Awards}</li>
                        <li class="list-group-item"><strong>Box Office:</strong> ${movie.BoxOffice || 'N/A'}</li>
                    </ul>
                </div>
            </div>
            <div class="row mt-4">
                <div class="col-12">
                    <div class="card">
                        <div class="card-body">
                            <h3 class="card-title">Plot</h3>
                            <p class="card-text">${movie.Plot}</p>
                            <div class="mt-4">
                                <a href="http://imdb.com/title/${movie.imdbID}" target="_blank" class="btn btn-primary">
                                    <i class="fas fa-external-link-alt me-2"></i>View on IMDB
                                </a>
                                <a href="index.html" class="btn btn-outline-secondary ms-2">
                                    <i class="fas fa-arrow-left me-2"></i>Go Back
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            `;
            $('#movie').html(output);
        })
        .catch((err) => {
            console.log(err);
            $('#movie').html(`
                <div class="alert alert-danger text-center mt-5">
                    <i class="fas fa-exclamation-circle me-2"></i>
                    Something went wrong while fetching the movie details.
                    <br>
                    Please try again later or contact support if the problem persists.
                </div>
            `);
        });
}
