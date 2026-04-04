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

const api = initData(sourceData);

function collectState() {
    const state = processFormData(new FormData(sampleTable.container));
    const rowsPerPage = parseInt(state.rowsPerPage);
    const page = parseInt(state.page ?? 1);
    return { ...state, rowsPerPage, page };
}

async function render(action) {
    console.log('render() вызван', { action: action?.name || 'none' });

    let state = collectState();
    let query = {};

    query = applySearching(query, state, action);
    query = applyFiltering(query, state, action);
    query = applySorting(query, state, action);
    query = applyPagination(query, state, action);

    console.log('Итоговый query:', query);

    const { total, items } = await api.getRecords(query);

    updatePagination(total, query);
    sampleTable.render(items);

    console.log('render() завершён, отрисовано записей:', items.length);
}

const sampleTable = initTable({
    tableTemplate: 'table',
    rowTemplate: 'row',
    before: ['search', 'header', 'filter'],
    after: ['pagination']
}, render);

const { applyPagination, updatePagination } = initPagination(
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

const applySorting = initSorting([
    sampleTable.header.elements.sortByDate,
    sampleTable.header.elements.sortByTotal
]);

const { applyFiltering, updateIndexes } = initFiltering(
    sampleTable.filter.elements
);

const applySearching = initSearching('search');

const appRoot = document.querySelector('#app');
appRoot.appendChild(sampleTable.container);

async function init() {
    const indexes = await api.getIndexes();
    updateIndexes(sampleTable.filter.elements, {
        searchBySeller: indexes.sellers
    });
    return indexes;
}

init().then(() => render());