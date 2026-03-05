import { createComparison, rules, defaultRules } from "../lib/compare.js";

const filterCompare = createComparison(
    defaultRules,
    [
        rules.searchMultipleFields('search', ['date', 'customer', 'seller'], false)
    ]
);



export function initFiltering(elements, indexes) {
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

    return (data, state, action) => {
        if (action && action.name === 'clear') {
            const field = action.dataset.field;
            const input = action.closest('.filter-wrapper')?.querySelector('input');
            if (input) {
                input.value = '';
                state[field] = '';
            }
        }

        const compareState = { ...state };
        if ('totalFrom' in compareState || 'totalTo' in compareState) {
            const from = compareState.totalFrom !== '' ? Number(compareState.totalFrom) : undefined;
            const to = compareState.totalTo !== '' ? Number(compareState.totalTo) : undefined;
            compareState.total = [from, to];
            delete compareState.totalFrom;
            delete compareState.totalTo;
        }

        return data.filter(row => filterCompare(row, compareState));
    };
}