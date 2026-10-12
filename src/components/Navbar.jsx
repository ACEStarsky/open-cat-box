import { NavLink } from 'react-router-dom';

// 替换为你的 QQ 群加入链接（QQ 群设置里可生成）
const QQ_GROUP_URL = 'http://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=zRivLC7_5XesFDLVSsL7mVeVlnaYx_TH&authKey=UFAXegUKVNY05SaIcjPu8R7H4ql7wFNVMHghFrFeSdz3RNofUzMNzFr7bkqwSJHC&noverify=0&group_code=1129804832';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-brand"><img src="/navLogo.jpg"></img></div>
      <div className="nav-links">
        <NavLink to="/" end>广场</NavLink>
        <NavLink to="/create-character">创建角色</NavLink>
        <NavLink to="/create-story">创建故事</NavLink>
        <NavLink to="/chat-picker">继续聊天</NavLink>
        <NavLink to="/settings">设置</NavLink>
        <a
          href={QQ_GROUP_URL}
          target="_blank"
          rel="noreferrer noopener"
          className="qq-btn"
        >
          加入 Q 群
        </a>
      </div>
    </nav>
  );
}