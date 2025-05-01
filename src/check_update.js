import { check, install } from "@tauri-apps/plugin-updater";

async function checkUpdate() {
  const update = await check();
  if (update?.available) {
    // 这里弹出你自己的提示框
    if (confirm(`发现新版本：${update.version}，是否立即更新？`)) {
      await install();
    }
  }
}

checkUpdate(); // 你可以在 app 启动时调用，也可以挂到菜单/按钮
