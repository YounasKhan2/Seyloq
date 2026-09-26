#[tauri::command]
fn platform_summary() -> &'static str {
    "Seyloq Tauri platform boundary is initialized with no broad native permissions."
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![platform_summary])
        .run(tauri::generate_context!())
        .expect("error while running Seyloq");
}

#[cfg(test)]
mod tests {
    use super::platform_summary;

    #[test]
    fn platform_summary_describes_boundary() {
        assert!(platform_summary().contains("no broad native permissions"));
    }
}
