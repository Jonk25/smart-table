import { getPages } from "../lib/utils.js";

export const initPagination = ({ pages, fromRow, toRow, totalRows }, createPage) => {
    const pageTemplate = pages.firstElementChild.cloneNode(true);
    pages.firstElementChild.remove();

    // Переменная для хранения количества страниц при последней отрисовке
    let pageCount;


    const applyPagination = (query, state, action) => {
        const limit = state.rowsPerPage;
        let page = state.page;

        // Обработка действий (переключение страниц)
        if (action) {
            switch (action.name) {
                case 'prev':
                    page = Math.max(1, page - 1);
                    break;
                case 'next':
                    page = Math.min(pageCount ?? 1, page + 1);
                    break;
                case 'first':
                    page = 1;
                    break;
                case 'last':
                    // Переход на последнюю страницу (используем кешированное значение)
                    page = pageCount ?? 1;
                    break;
            }
        }

        // Возвращаем новый объект query с добавленными параметрами пагинации
        return Object.assign({}, query, {
            limit,
            page
        });
    }

    /**
     * @param {number} total - общее количество записей с сервера
     * @param {Object} params - параметры запроса { page, limit }
     */
    const updatePagination = (total, { page, limit }) => {
        // Пересчитываем количество страниц на основе актуального total
        pageCount = Math.ceil(total / limit);

        // Коррекция страницы, если она выходит за границы
        if (page > pageCount) page = Math.max(1, pageCount);
        if (page < 1) page = 1;

        // Генерация видимых кнопок страниц
        const visiblePages = getPages(page, pageCount, 5);
        pages.replaceChildren(
            ...visiblePages.map(pageNumber => {
                const el = pageTemplate.cloneNode(true);
                return createPage(el, pageNumber, pageNumber === page);
            })
        );


        const hasData = total > 0;
        const skip = hasData ? (page - 1) * limit : 0;
        const currentFrom = hasData ? skip + 1 : 0;
        const currentTo = hasData ? Math.min(skip + limit, total) : 0;

        fromRow.textContent = currentFrom;
        toRow.textContent = currentTo;
        totalRows.textContent = total;
    }

    // Возвращаем обе функции для использования на разных этапах
    return {
        applyPagination,
        updatePagination
    };
};