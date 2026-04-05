export function initSearching(searchField) {
    return (query, state, action) => {
        
        const searchTerm = state[searchField]?.toString().trim();
        
        if (searchTerm) {
            return Object.assign({}, query, {
                search: searchTerm
            });
        }
        return query;
    };
}