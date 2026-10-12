
const REPO_URL = 'https://github.com/ACEStarsky/open-cat-box';
const AUTHOR = '神秘_星辰';
const AUTHOR_EMAIL = 'https://space.bilibili.com/3546642745657929';
const QQ_GROUP_URL = 'http://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=zRivLC7_5XesFDLVSsL7mVeVlnaYx_TH&authKey=UFAXegUKVNY05SaIcjPu8R7H4ql7wFNVMHghFrFeSdz3RNofUzMNzFr7bkqwSJHC&noverify=0&group_code=1129804832';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-col">
          <h4>关于项目</h4>
          <p>
            卡特魔盒是一个纯前端的 AI 角色扮演应用。不依赖任何后端服务。
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
            <a href={`mailto:${AUTHOR_EMAIL}`}>B 站主页</a>
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
