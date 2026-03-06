import { getPages } from "../lib/utils.js";

export const initPagination = ({ pages, fromRow, toRow, totalRows }, createPage) => {
    const pageTemplate = pages.firstElementChild.cloneNode(true);
    pages.firstElementChild.remove();

    return (data, state, action) => {
        const rowsPerPage = state.rowsPerPage;
        const pageCount = Math.ceil(data.length / rowsPerPage);
        let page = state.page;

        // Обработка действий (переключение страниц)
        if (action) {
            switch (action.name) {
                case 'prev':
                    page = Math.max(1, page - 1);
                    break;
                case 'next':
                    page = Math.min(pageCount, page + 1);
                    break;
                case 'first':
                    page = 1;
                    break;
                case 'last':
                    page = pageCount;
                    break;
            }
        }

        // Коррекция страницы, если она выходит за границы после фильтрации
        if (page > pageCount) page = pageCount;
        if (page < 1) page = 1;

        // Генерация видимых кнопок страниц
        const visiblePages = getPages(page, pageCount, 5);
        pages.replaceChildren(
            ...visiblePages.map(pageNumber => {
                const el = pageTemplate.cloneNode(true);
                return createPage(el, pageNumber, pageNumber === page);
            })
        );

        // Обновление статуса
        const skip = (page - 1) * rowsPerPage;
        fromRow.textContent = skip + 1;
        toRow.textContent = Math.min(skip + rowsPerPage, data.length);
        totalRows.textContent = data.length;

        // Возврат среза данных для текущей страницы
        return data.slice(skip, skip + rowsPerPage);
    };
};