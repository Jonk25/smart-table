import { rules, createComparison } from "../lib/compare.js";

export function initSearching(searchField) {
    // #5.1 — настройка компаратора с правилом поиска по нескольким полям
    const compare = createComparison(
        [], // имена стандартных правил не используются
        [
            rules.skipEmptyTargetValues(),                 // вызываем, чтобы получить функцию правила
            rules.searchMultipleFields(searchField, ['date', 'customer', 'seller'], false)
        ]
    );

    return (data, state, action) => {
        // #5.2 — фильтрация данных с помощью компаратора
        return data.filter(row => compare(row, state));
    };
}