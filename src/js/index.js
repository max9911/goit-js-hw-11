import Notiflix from 'notiflix';
import 'simplelightbox/dist/simple-lightbox.min.css';
import SimpleLightbox from 'simplelightbox';

const ELEM = {
  form: document.querySelector('.search-form'),
  gal: document.querySelector('.gallery'),
  loadMore: document.querySelector('.load-more'),
};
let userInput;
let pageN = 1;
ELEM.form.addEventListener('submit', Search);

async function Search(evt) {
  pageN = 1;
  evt.preventDefault();
  userInput = evt.currentTarget[0].value;

  const data = await imgSearch(pageN);
  if (data.hits.length === 0) {
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }
  Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
  markup(data.hits);

  new SimpleLightbox('.gallery a');

  ELEM.form[0].value = '';
  ELEM.loadMore.classList.remove('hidden');
}

ELEM.loadMore.addEventListener('click', loadMore);

async function loadMore() {
  pageN += 1;

  const data = await imgSearch(pageN);

  if (pageN * 40 > data.totalHits) {
    ELEM.loadMore.classList.add('hidden');
    Notiflix.Notify.info(
      "We're sorry, but you've reached the end of search results."
    );
  }

  markup(data.hits);

  new SimpleLightbox('.gallery a');
}

async function imgSearch(pageN) {
  const baseLink = 'https://pixabay.com/api/';
  const APIkey = '40419544-c0f303dad1209c5e446227c13';
  const searchOptions = new URLSearchParams({
    key: APIkey,
    q: userInput,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: 'true',
    page: pageN,
    per_page: '40',
  });

  const resp = await fetch(`${baseLink}?${searchOptions}`);

  if (!resp.ok) {
    throw new Error(resp.statusText);
  }

  return resp.json();
}

function markup(arr) {
  const result = arr
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) =>
        `
        <div class="photo-card">
        <a href="${largeImageURL}">
         <img src="${webformatURL}" alt="${tags}" loading="lazy" width="300"/>
         </a>
          <div class="info">
            <p class="info-item">
              <b>Likes</b><br> ${likes}
            </p>
            <p class="info-item">
              <b>Views</b><br> ${views}
            </p>
            <p class="info-item">
              <b>Comments</b><br> ${comments}
            </p>
            <p class="info-item">
              <b>Downloads</b><br> ${downloads}
            </p>
          </div>
         </div>`
    )
    .join('');

  ELEM.gal.innerHTML = result;
}
