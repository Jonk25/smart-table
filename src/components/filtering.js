import { createComparison, defaultRules } from "../lib/compare.js";

// #4.3 — создаём компаратор с правилами по умолчанию
const compare = createComparison(defaultRules);

export function initFiltering(elements, indexes) {
    // #4.1 — заполнение выпадающих списков опциями
    Object.keys(indexes).forEach(elementName => {
        const select = elements[elementName];
        select.innerHTML = '';
        const emptyOption = document.createElement('option');
        emptyOption.value = '';
        emptyOption.textContent = '—';
        select.appendChild(emptyOption);
        
        Object.values(indexes[elementName]).forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            select.appendChild(option);
        });
    });

    const compare = createComparison(defaultRules);

    return (data, state, action) => {
        // #4.2 — обработка очистки поля
        if (action && action.name === 'clear') {
            const field = action.dataset.field;
            const input = action.closest('.filter-wrapper')?.querySelector('input');
            if (input) {
                input.value = '';
                state[field] = '';
            }
        }

        // Подготавливаем состояние для корректной фильтрации по диапазону суммы
        const filterState = { ...state };
        if ('totalFrom' in state || 'totalTo' in state) {
            const from = state.totalFrom === '' ? undefined : parseFloat(state.totalFrom);
            const to = state.totalTo === '' ? undefined : parseFloat(state.totalTo);
            filterState.total = [from, to];
            delete filterState.totalFrom;
            delete filterState.totalTo;
        }

        // #4.5 — фильтрация данных с помощью компаратора
        return data.filter(row => compare(row, filterState));
    };
}