import './styles.css';
import '@pnotify/core/dist/PNotify.css';
import '@pnotify/core/dist/BrightTheme.css';
import { error } from '@pnotify/core';
import apiService from './js/apiService';
import cardTpl from './templates/img-card.hbs';

const refs = {
  form: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  guard: document.querySelector('.guard'),
};

const notice = message => {
  error({
    text: message,
    maxTextHeight: null,
    delay: 2000,
  });
};

const clearPage = () => {
  refs.gallery.innerHTML = '';
};

const renderCards = cards => {
  const cardsMarkup = cardTpl(cards);
  refs.gallery.insertAdjacentHTML('beforeend', cardsMarkup);
};

const onSearch = event => {
  event.preventDefault();
  clearPage();
  apiService.searchQuery = event.target.elements.query.value;
  if (!apiService.searchQuery) {
    notice('digitate qulcosa!');
    return;
  }
  apiService
    .fetchByName()
    .then(result => {
      if (result.hits.length === 0) {
        throw new Error();
      }

      apiService.resetPage();
      renderCards(result.hits);
    })
    .catch(err => {
      notice('La richiesta non e valida. Riptovate');
    });
};

refs.form.addEventListener('submit', onSearch);
const onObserver = entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting && apiService.searchQuery) {
      apiService.nextPage();
      console.log(apiService.page);
      apiService
        .fetchByName()
        .then(result => {
          if (result.hits.length === 0) {
            throw new Error();
          }
          renderCards(result.hits);
        })
        .catch(err => {
          alert('La richiesta non e valida. Riptovate');
        });
    }
  });
};
const options = {
  rootMargin: '150px',
};
const observer = new IntersectionObserver(onObserver, options);
observer.observe(refs.guard);
