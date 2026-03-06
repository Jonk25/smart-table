import './fonts/ys-display/fonts.css';
import './style.css';

import { data as sourceData } from './data/dataset_1.js';
import { initData } from './data.js';
import { processFormData } from './lib/utils.js';
import { initTable } from './components/table.js';
import { initPagination } from './components/pagination.js';
import { initSorting } from './components/sorting.js';
import { initFiltering } from './components/filtering.js';
import { initSearching } from './components/searching.js';

// Исходные данные и индексы (продавцы и т.д.)
const { data, ...indexes } = initData(sourceData);

/**
 * Сбор и обработка полей из таблицы
 * @returns {Object}
 */
function collectState() {
    const state = processFormData(new FormData(sampleTable.container));

    const rowsPerPage = parseInt(state.rowsPerPage);
    const page = parseInt(state.page ?? 1);

    return {
        ...state,
        rowsPerPage,
        page
    };
}

/**
 * Перерисовка состояния таблицы при любых изменениях
 * @param {HTMLButtonElement?} action
 */
function render(action) {
    let state = collectState();
    let result = [...data];

    // Применяем модули в правильном порядке:
    // 1. Поиск (глобальный поиск по нескольким полям)
    result = applySearching(result, state, action);
    // 2. Фильтрация по колонкам
    result = applyFiltering(result, state, action);
    // 3. Сортировка
    result = applySorting(result, state, action);
    // 4. Пагинация
    result = applyPagination(result, state, action);

    sampleTable.render(result);
}

// Инициализация таблицы с подключением всех шаблонов
const sampleTable = initTable({
    tableTemplate: 'table',
    rowTemplate: 'row',
    before: ['search', 'header', 'filter'], // поиск, заголовок, фильтр
    after: ['pagination']
}, render);

// Инициализация пагинации
const applyPagination = initPagination(
    sampleTable.pagination.elements,
    (el, page, isCurrent) => {
        const input = el.querySelector('input');
        const label = el.querySelector('span');
        input.value = page;
        input.checked = isCurrent;
        label.textContent = page;
        return el;
    }
);

// Инициализация сортировки (передаём кнопки сортировки из шапки)
const applySorting = initSorting([
    sampleTable.header.elements.sortByDate,
    sampleTable.header.elements.sortByTotal
]);

// Инициализация фильтрации (передаём элементы фильтра и индекс продавцов)
const applyFiltering = initFiltering(
    sampleTable.filter.elements,
    {
        searchBySeller: indexes.sellers // массив уникальных продавцов
    }
);

// Инициализация поиска (передаём имя поля в state, которое содержит поисковый запрос)
const applySearching = initSearching('search');

// Вставляем таблицу в DOM
const appRoot = document.querySelector('#app');
appRoot.appendChild(sampleTable.container);

// Первый рендер (без действия)
render();