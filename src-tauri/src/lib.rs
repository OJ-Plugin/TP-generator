// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// use tauri::Manager; // 引入 Manager 以便访问窗口

// #[tauri::command]
// fn minimize_window(window: tauri::Window) {
//     window.minimize().unwrap();
// }

// #[tauri::command]
// fn maximize_window(window: tauri::Window) {
//     window.maximize().unwrap();
// }

// #[tauri::command]
// fn close_window(window: tauri::Window) {
//     window.close().unwrap();
// }

// #[cfg_attr(mobile, tauri::mobile_entry_point)]
// pub fn run() {
//     tauri::Builder::default()
//         .plugin(tauri_plugin_opener::init())
//         .invoke_handler(tauri::generate_handler![
//             minimize_window,
//             maximize_window,
//             close_window
//         ])
//         .run(tauri::generate_context!())
//         .expect("error while running tauri application");
// }
