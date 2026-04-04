const BASE_URL = "https://webinars.webdev.education-services.ru/sp7-api";

let sellers;
let customers;
let lastResult;
let lastQuery;

const mapRecords = (data) =>
    data.map((item) => ({
        id: item.receipt_id,
        date: item.date,
        seller: sellers[item.seller_id],
        customer: customers[item.customer_id],
        total: item.total_amount,
    }));

const formatDateToISO = (dateStr) => {
    if (!dateStr) return null;
    const parts = dateStr.split(".");
    if (parts.length === 3) {
        const [day, month, year] = parts;
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
    return dateStr;
};

const mapQueryToServer = (query) => {
    const serverQuery = {};

    if (query.search) {
        serverQuery.q = query.search;
    }

    Object.keys(query).forEach((key) => {
        if (key.startsWith("filter[")) {
            let value = query[key];
            if (key === "filter[date]" && value) {
                value = formatDateToISO(value);
            }
            if (value) {
                serverQuery[key] = value;
            }
        }
    });

    if (query.sortBy && query.order) {
        const direction = query.order; // 'up' или 'down'
        if (direction === "up" || direction === "down") {
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

const buildQueryString = (params) => {
    return Object.entries(params)
        .map(([key, value]) => {
            const encodedKey = encodeURIComponent(key)
                .replace(/%5B/g, "[")
                .replace(/%5D/g, "]");
            const encodedValue = encodeURIComponent(value);
            return `${encodedKey}=${encodedValue}`;
        })
        .join("&");
};

export function initData(sourceData) {
    const getIndexes = async () => {
        if (!sellers || !customers) {
            try {
                [sellers, customers] = await Promise.all([
                    fetch(`${BASE_URL}/sellers`).then(async (res) => {
                        if (!res.ok)
                            throw new Error(`Failed to fetch sellers: ${res.status}`);
                        return res.json();
                    }),
                    fetch(`${BASE_URL}/customers`).then(async (res) => {
                        if (!res.ok)
                            throw new Error(`Failed to fetch customers: ${res.status}`);
                        return res.json();
                    }),
                ]);
            } catch (error) {
                console.error("Ошибка загрузки индексов:", error);
                sellers = sellers || {};
                customers = customers || {};
            }
        }
        return { sellers, customers };
    };

    const getRecords = async (query = {}, isUpdated = false) => {
        const serverQuery = mapQueryToServer(query);
        const nextQuery = buildQueryString(serverQuery);

        // ОТЛАДКА: логируем запрос
        console.log("Запрос к серверу:", {
            query,
            serverQuery,
            url: `${BASE_URL}/records?${nextQuery}`,
        });

        if (lastQuery === nextQuery && !isUpdated) {
            console.log("Возвращаем из кеша");
            return lastResult;
        }

        try {
            const response = await fetch(`${BASE_URL}/records?${nextQuery}`);

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Ошибка сервера:", {
                    status: response.status,
                    response: errorText,
                });
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const records = await response.json();
            console.log("Ответ сервера:", {
                total: records.total,
                itemsCount: records.items?.length,
            });

            lastQuery = nextQuery;
            lastResult = {
                total: records.total,
                items: mapRecords(records.items),
            };

            return lastResult;
        } catch (error) {
            console.error("Ошибка в getRecords:", error);
            return { total: 0, items: [] };
        }
    };

    return { getIndexes, getRecords };
}
