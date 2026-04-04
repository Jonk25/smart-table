import { createComparison, defaultRules } from "../lib/compare.js";

export function initFiltering(elements) {
    const compare = createComparison(defaultRules);

    /**
     * Заполняет select-элементы опциями из индексов
     * @param {Object} elements - DOM-элементы фильтров
     * @param {Object} indexes - данные индексов { searchBySeller: [...] }
     */
    const updateIndexes = (elements, indexes) => {
        Object.keys(indexes).forEach((elementName) => {
            const select = elements[elementName];
            if (!select) return;

            // Сохраняем пустую опцию, если есть
            const firstOption = select.querySelector('option[value=""]');
            select.innerHTML = '';
            if (firstOption) {
                select.appendChild(firstOption);
            }

            // Добавляем опции из индексов
            select.append(
                ...Object.values(indexes[elementName]).map(name => {
                    const el = document.createElement('option');
                    el.textContent = name;
                    el.value = name;
                    return el;
                })
            );
        });
    };

    /**
     * Формирует параметры фильтрации и добавляет их в query-объект
     * @param {Object} query - текущий объект запроса
     * @param {Object} state - состояние формы
     * @param {HTMLElement?} action - элемент, вызвавший перерисовку
     * @returns {Object} обновлённый query
     */
    const applyFiltering = (query, state, action) => {
        // Обработка кнопки "очистить"
        if (action && action.name === 'clear') {
            const field = action.dataset.field;
            const input = action.closest('.filter-wrapper')?.querySelector('input, select');
            if (input) {
                input.value = '';
                if (field) state[field] = '';
            }
        }

        const filter = {};

        // Собираем значения из полей фильтрации
        Object.keys(elements).forEach(key => {
            const element = elements[key];
            if (element && ['INPUT', 'SELECT'].includes(element.tagName)) {
                const value = element.value?.trim();
                if (value) {
                    // Формируем параметр в формате filter[field]=value
                    filter[`filter[${element.name}]`] = value;
                }
            }
        });

        // Обработка диапазона суммы: totalFrom/totalTo → filter[total]=from,to
        const totalFrom = state.totalFrom?.trim();
        const totalTo = state.totalTo?.trim();
        if (totalFrom || totalTo) {
            const from = totalFrom ? parseFloat(totalFrom) : '';
            const to = totalTo ? parseFloat(totalTo) : '';
            filter['filter[total]'] = `${from},${to}`;
        }

        // Добавляем параметры фильтрации в query, если они есть
        return Object.keys(filter).length
            ? Object.assign({}, query, filter)
            : query;
    };

    return {
        updateIndexes,
        applyFiltering
    };
}