#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri_plugin_updater::UpdaterExt;

async fn auto_update(app: tauri::AppHandle) -> tauri_plugin_updater::Result<()> {
    if let Some(update) = app.updater()?.check().await? {
        update.download_and_install(|_, _| {}, || {}).await?;
        app.restart();
    }
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .setup(|app| {
            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                let _ = auto_update(handle).await;
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error running MR-AutoCut");
}
