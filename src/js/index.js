import Notiflix from 'notiflix';
import 'simplelightbox/dist/simple-lightbox.min.css';
import SimpleLightbox from 'simplelightbox';

const ELEM = {
  form: document.querySelector('.search-form'),
  gal: document.querySelector('.gallery'),
  loadMore: document.querySelector('.load-more'),
};

let userInput;
let pageN = 0;

ELEM.form.addEventListener('submit', Search);
ELEM.loadMore.addEventListener('click', loadMore);

async function Search(evt) {
  pageN = 1;
  evt.preventDefault();
  userInput = evt.currentTarget[0].value;
  let data = [];

  try {
    data = await imgSearch(pageN);

    if (data.hits.length === 0) {
      ELEM.gal.innerHTML = '';
      ELEM.loadMore.classList.add('hidden');
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    } else {
      Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);

      ELEM.gal.innerHTML = markup(data.hits);
      new SimpleLightbox('.gallery a');
      if (pageN * 40 > data.totalHits) {
        ELEM.loadMore.classList.add('hidden');
        Notiflix.Notify.info(
          "We're sorry, but you've reached the end of search results."
        );
        return;
      }
      ELEM.loadMore.classList.remove('hidden');
    }
  } catch (err) {
    Notiflix.Notify.failure(`error ${err} Please try again.`);
  } finally {
    ELEM.form[0].value = '';
  }
}

async function loadMore() {
  pageN += 1;

  try {
    const data = await imgSearch(pageN);
    if (pageN * 40 > data.totalHits) {
      ELEM.loadMore.classList.add('hidden');
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
    }
    ELEM.gal.insertAdjacentHTML('beforeend', markup(data.hits));
    new SimpleLightbox('.gallery a');
  } catch (err) {
    Notiflix.Notify.failure(`error ${err} Please try again.`);
  } finally {
  }
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
    console.log(resp.statusText);
    console.dir(resp);
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

  return result;
}
