# v4 改版前回滚说明

此目录保存项目展示与转化入口优化前的首页快照。

## 回滚步骤

1. 用本目录中的 `index.html` 覆盖项目根目录的 `index.html`。
2. 删除改版新增的 `assets/css/portfolio-enhancements.css`、`assets/js/project-dialog.js` 和 `assets/img/projects/`。
3. 重新启动本地静态服务器并检查首页。

旧版图片和动画脚本不会被本次改版覆盖，因此无需恢复其他资源。

原始 `index.html` SHA-256：`C016EE6C369E4AF396B1AE393315935733FCDC6B098FEBBE3255DC4A079F80E6`
