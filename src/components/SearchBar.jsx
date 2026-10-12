export default function SearchBar({ value, onChange, placeholder }) {
  return (
    <div className="search-bar">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || '搜索角色、故事、关键词...'}
        aria-label="搜索"
      />
      {value && (
        <button
          type="button"
          className="search-clear"
          onClick={() => onChange('')}
          aria-label="清除"
        >
          清除
        </button>
      )}
    </div>
  );
}