import axios from 'axios';
import cheerio from 'cheerio';

async function scrapeWithRegex(url) {
  const html = (await axios.get(url)).data;
  const rx = /zg_item[\s\S]+?p13n-sc-truncate.+?>([\s\S]+?)<[\s\S]+?a-icon-star.+?a-icon-alt.+?>(.+?)<[\s\S]+?product-reviews.+>([\d,]+)/g;
  const table = [['Наименование', 'Оценка', 'Количество отзывов']];
  const matches = Array.from(html.toString().matchAll(rx));
  return [
    ...table,
    ...matches.map(([, name, rating, reviews]) => [name.trim().slice(0, 24), rating.trim(), reviews.trim()])
  ]
}

scrapeWithRegex('https://web.archive.org/web/20201015002125/https://www.amazon.com/gp/bestsellers/?ref_=nav_cs_bestsellers')
  .then((data) => console.table(data))
  .catch((err) => console.error(err));

async function scrapeWithCheerio(url) {
  const html = (await axios.get(url)).data;
  const $ = cheerio.load(html);
  const items = $('.zg_item');
  const table = [['Наименование', 'Оценка', 'Количество отзывов']];
  const results = items.map((i, el) => {
    const $el = $(el);
    const name = $el.find('.p13n-sc-truncate-desktop-type2').text().trim().slice(0, 24);
    const rating = $el.find('.a-icon-star .a-icon-alt').text().trim();
    const reviews = $el.find('.a-icon-row a:last-of-type').text().trim();
    return [[name, rating, reviews]];
  }).get();
  return [
    ...table,
    ...results
  ];
}

scrapeWithCheerio('https://web.archive.org/web/20201015002125/https://www.amazon.com/gp/bestsellers/?ref_=nav_cs_bestsellers')
  .then((data) => console.table(data))
  .catch((err) => console.error(err));
