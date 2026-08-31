fn main() {
    println!("cargo:rerun-if-changed=assets/weavatrix.ico");
    if std::env::var("CARGO_CFG_TARGET_OS").as_deref() != Ok("windows") {
        return;
    }
    let mut resource = winresource::WindowsResource::new();
    resource.set_icon("assets/weavatrix.ico");
    resource.set("ProductName", "Weavatrix");
    resource.set("FileDescription", "Weavatrix repository intelligence");
    resource.set("CompanyName", "Weavatrix");
    resource.set("LegalCopyright", "Copyright (c) Weavatrix");
    resource
        .compile()
        .expect("embed the Weavatrix Windows icon");
}
