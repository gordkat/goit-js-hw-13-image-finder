import './styles.css';
import '@pnotify/core/dist/PNotify.css';
import '@pnotify/core/dist/BrightTheme.css';
import { error } from '@pnotify/core';
import apiService from './js/apiService';
import cardTpl from './templates/img-card.hbs';
import * as basicLightbox from 'basiclightbox';
import 'basiclightbox/src/styles/main.scss';

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

const onSearch = async event => {
  event.preventDefault();
  clearPage();
  apiService.searchQuery = event.target.elements.query.value.trim();
  if (!apiService.searchQuery) {
    notice('Введите что-то!');
    return;
  }
  try {
    const result = await apiService.fetchByName();
    if (result.hits.length === 0) {
      throw new Error();
    }
    apiService.resetPage();
    renderCards(result.hits);
  } catch {
    notice('По вашему запросу картинок не найдено. Попробуйте еще раз!');
  }
};

refs.form.addEventListener('submit', onSearch);

const onModal = event => {
  const imgTag = event.target;
  if (imgTag.nodeName !== 'IMG') return;
  const imgSrc = imgTag.dataset.source;
  const instance = basicLightbox.create(
    `<img src=${imgSrc} alt="" width="1280"/>`,
  );
  instance.show();
};

refs.gallery.addEventListener('click', onModal);

const onObserver = entries => {
  entries.forEach(async entry => {
    if (
      entry.isIntersecting &&
      apiService.searchQuery &&
      refs.gallery.textContent
    ) {
      apiService.nextPage();
      try {
        const result = await apiService.fetchByName();
        if (result.hits.length === 0) {
          throw new Error();
        }
        renderCards(result.hits);
      } catch {
        notice('Картинок по этому запросу больше нет. Делайте новый запрос!');
      }
    }
  });
};
const options = {
  rootMargin: '150px',
};
const observer = new IntersectionObserver(onObserver, options);
observer.observe(refs.guard);
