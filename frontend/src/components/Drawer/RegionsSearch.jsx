import './RegionsSearch.css';

export const RegionsSearch = ({ searchTerm, setSearchTerm, clearSearch }) => {
  return (
    <li className="drawer-search-item">
      <div className="drawer-search-container">
        <input
          type="text"
          placeholder="Поиск по регионам..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="drawer-search-input"
        />
        {searchTerm && (
          <button className="drawer-search-clear" onClick={clearSearch} aria-label="Очистить поиск">
            ×
          </button>
        )}
      </div>
    </li>
  );
};
