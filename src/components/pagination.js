import { getPages } from "../lib/utils.js";

export const initPagination = ({ pages, fromRow, toRow, totalRows }, createPage) => {
    // #2.3 — подготовка шаблона кнопки
    const pageTemplate = pages.firstElementChild.cloneNode(true);
    pages.firstElementChild.remove();

    return (data, state, action) => {
        // #2.1 — вычисление количества страниц
        const rowsPerPage = state.rowsPerPage;
        const pageCount = Math.ceil(data.length / rowsPerPage);
        let page = state.page;

        // #2.6 — обработка действий (переключение страниц)
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

        // #2.4 — генерация кнопок для видимых страниц
        const visiblePages = getPages(page, pageCount, 5);
        pages.replaceChildren(
            ...visiblePages.map(pageNumber => {
                const el = pageTemplate.cloneNode(true);
                return createPage(el, pageNumber, pageNumber === page);
            })
        );

        // #2.5 — обновление статуса пагинации
        const skip = (page - 1) * rowsPerPage;
        fromRow.textContent = skip + 1;
        toRow.textContent = Math.min(skip + rowsPerPage, data.length);
        totalRows.textContent = data.length;

        // #2.2 — возврат среза данных
        return data.slice(skip, skip + rowsPerPage);
    };
};