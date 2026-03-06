import { createComparison, defaultRules } from "../lib/compare.js";

// #4.3 — создаём компаратор с правилами по умолчанию
const compare = createComparison(defaultRules);

export function initFiltering(elements, indexes) {
    // #4.1 — заполнение выпадающих списков опциями
    Object.keys(indexes).forEach(elementName => {
        const select = elements[elementName];
        // Очищаем select от старой опции "—" (она уже есть в HTML)
        // Но можно оставить как есть, добавив новые поверх; лучше очистить и добавить заново с пустой опцией
        select.innerHTML = ''; // удаляем всё
        // Добавляем пустую опцию (значение "" — показать всех)
        const emptyOption = document.createElement('option');
        emptyOption.value = '';
        emptyOption.textContent = '—';
        select.appendChild(emptyOption);
        
        // Добавляем опции для каждого продавца
        Object.values(indexes[elementName]).forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            select.appendChild(option);
        });
    });

    return (data, state, action) => {
        // #4.2 — обработка очистки поля
        if (action && action.name === 'clear') {
            const field = action.dataset.field; // поле, которое нужно очистить (date, customer и т.д.)
            const input = action.closest('.filter-wrapper')?.querySelector('input');
            if (input) {
                input.value = '';               // очищаем поле ввода
                state[field] = '';               // обновляем состояние (важно для последующей фильтрации)
            }
            // Можно также обработать select, но в нашем шаблоне кнопка clear есть только у текстовых полей
        }

        // #4.5 — фильтрация данных с помощью компаратора
        return data.filter(row => compare(row, state));
    };
}