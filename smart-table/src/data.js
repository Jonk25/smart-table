const BASE_URL = 'https://webinars.webdev.education-services.ru/sp7-api';

let sellers;
let customers;
let lastResult;
let lastQuery;

/**
 
 * @param {Array} data 
 * @returns {Array}
 */
const mapRecords = (data) => data.map(item => ({
    id: item.receipt_id,
    date: item.date,
    seller: sellers[item.seller_id],
    customer: customers[item.customer_id],
    total: item.total_amount
}));

/**
 
 * @param {string} dateStr 
 * @returns {string|null}
 */
const formatDateToISO = (dateStr) => {
    if (!dateStr) return null;
    const parts = dateStr.split('.');
    if (parts.length === 3) {
        const [day, month, year] = parts;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return dateStr;
};

/**
 
 * @param {Object} query - параметры от компонентов
 * @returns {Object} параметры для сервера
 */
const mapQueryToServer = (query) => {
    const serverQuery = {};


    if (query.search) {
        serverQuery.search = query.search;
    }


    Object.keys(query).forEach(key => {
        if (key.startsWith('filter[')) {
            let value = query[key];


            if (key === 'filter[date]' && value) {
                value = formatDateToISO(value);
            }

            if (value) {
                serverQuery[key] = value;
            }
        }
    });


    if (query.sortBy && query.order) {
        const direction = query.order;
        if (direction === 'up' || direction === 'down') {
            serverQuery.sort = `${query.sortBy}:${direction}`;
        }
    }


    if (query.page && Number.isInteger(query.page) && query.page >= 1) {
        serverQuery.page = query.page;
    }
    if (query.limit && Number.isInteger(query.limit) && query.limit > 0) {
        serverQuery.limit = query.limit;
    }

    return serverQuery;
};

/**
 
 * @param {Object} params 
 * @returns {string}
 */
const buildQueryString = (params) => {
    return Object.entries(params)
        .map(([key, value]) => {

            const encodedKey = encodeURIComponent(key)
                .replace(/%5B/g, '[')
                .replace(/%5D/g, ']');
            const encodedValue = encodeURIComponent(value);
            return `${encodedKey}=${encodedValue}`;
        })
        .join('&');
};

export function initData(sourceData) {

    /**
     
     * @returns {Promise<Object>}
     */
    const getIndexes = async () => {
        if (!sellers || !customers) {
            try {
                [sellers, customers] = await Promise.all([
                    fetch(`${BASE_URL}/sellers`).then(async res => {
                        if (!res.ok) throw new Error(`Failed to fetch sellers: ${res.status}`);
                        return res.json();
                    }),
                    fetch(`${BASE_URL}/customers`).then(async res => {
                        if (!res.ok) throw new Error(`Failed to fetch customers: ${res.status}`);
                        return res.json();
                    }),
                ]);
            } catch (error) {
                console.error('Ошибка загрузки индексов:', error);
                sellers = sellers || {};
                customers = customers || {};
            }
        }
        return { sellers, customers };
    };

    /**
     
     * @param {Object} query - параметры запроса
     * @param {boolean} isUpdated - принудительное обновление кеша
     * @returns {Promise<Object>}
     */
    const getRecords = async (query = {}, isUpdated = false) => {
        const serverQuery = mapQueryToServer(query);
        const queryString = buildQueryString(serverQuery);
        const fullUrl = `${BASE_URL}/records?${queryString}`;


        if (lastQuery === queryString && !isUpdated) {
            return lastResult;
        }

        try {
            const response = await fetch(fullUrl, {
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Ошибка сервера:', {
                    status: response.status,
                    url: fullUrl,
                    response: errorText.slice(0, 500)
                });
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }


            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                console.warn('⚠️ Неожиданный Content-Type:', contentType);
            }

            const records = await response.json();


            if (!records || typeof records.total !== 'number' || !Array.isArray(records.items)) {
                console.error('Некорректная структура ответа:', records);
                throw new Error('Invalid API response format');
            }


            lastQuery = queryString;
            lastResult = {
                total: records.total,
                items: mapRecords(records.items)
            };

            return lastResult;
        } catch (error) {
            console.error('Ошибка в getRecords:', error);

            return { total: 0, items: [] };
        }
    };

    return {
        getIndexes,
        getRecords
    };
}