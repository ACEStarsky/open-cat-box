// components/Footer.jsx
// 页脚：作者信息 + GitHub 源码仓库 + QQ 群

const REPO_URL = 'https://github.com/your-name/ai-roleplay-app';
const AUTHOR = 'Your Name';
const AUTHOR_EMAIL = 'you@example.com';
// 替换为你的 QQ 群加入链接（QQ 群设置里可生成）
const QQ_GROUP_URL = 'https://qm.qq.com/q/your_group_link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-col">
          <h4>关于项目</h4>
          <p>
            纯前端的 AI 角色扮演应用。模板与存档均以文件形式保存，
            不依赖任何后端服务。
          </p>
        </div>
        <div className="footer-col">
          <h4>资源</h4>
          <p>
            <a href={REPO_URL} target="_blank" rel="noreferrer noopener">
              GitHub 源码
            </a>
          </p>
          <p>
            <a href={QQ_GROUP_URL} target="_blank" rel="noreferrer noopener">
              加入 Q 群
            </a>
          </p>
        </div>
        <div className="footer-col">
          <h4>作者</h4>
          <p>{AUTHOR}</p>
          <p>
            <a href={`mailto:${AUTHOR_EMAIL}`}>{AUTHOR_EMAIL}</a>
          </p>
        </div>
      </div>
      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} {AUTHOR}. All rights reserved.
        </span>
      </div>
    </footer>
  );
}