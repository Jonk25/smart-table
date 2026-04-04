import { sortMap } from "../lib/sort.js";

export function initSorting(columns) {
    return (query, state, action) => {
        let field = null;
        let order = null;

        if (action && action.name === 'sort') {
            // Обработка клика: переключаем значение через sortMap
            action.dataset.value = sortMap[action.dataset.value];
            field = action.dataset.field;
            order = action.dataset.value;

            // Сбрасываем другие колонки
            columns.forEach(column => {
                if (column.dataset.field !== action.dataset.field) {
                    column.dataset.value = 'none';
                }
            });
            
            console.log('Sorting action:', { field, order });
        } else {
            // Читаем текущее состояние из DOM
            columns.forEach(column => {
                if (column.dataset.value !== 'none') {
                    field = column.dataset.field;
                    order = column.dataset.value;
                }
            });
            if (field) console.log('Sorting from DOM:', { field, order });
        }

        // Формируем параметр для сервера: sort=field:up или sort=field:down
        if (field && (order === 'up' || order === 'down')) {
            console.log('Добавляем в query:', { sort: `${field}:${order}` });
            return Object.assign({}, query, {
                sortBy: field,
                order: order  // 'up' или 'down' — как ожидает сервер
            });
        }
        
        console.log('Сортировка не активна');
        return query;
    };
}