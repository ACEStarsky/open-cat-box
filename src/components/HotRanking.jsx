export default function HotRanking({ items = [], onSelect }) {
  return (
    <aside className="hot-ranking">
      <h3 className="hot-title">热度排行榜</h3>
      {items.length === 0 ? (
        <p className="empty small">暂无数据</p>
      ) : (
        <ol className="hot-list">
          {items.map((item, i) => (
            <li
              key={item._id}
              className="hot-item"
              onClick={() => onSelect?.(item._id)}
            >
              <span className={`rank rank-${i + 1}`}>{i + 1}</span>
              <span className="hot-name">{item.name || item.title}</span>
              <span className="hot-score">{item.hot || 0}</span>
            </li>
          ))}
        </ol>
      )}
    </aside>
  );
}