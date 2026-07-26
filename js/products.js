// Imágenes personalizadas por SKU (sobrescriben la automática "imagenes/SKU.jpeg")
const IMAGENES_MANUALES = {
  "ESCALERA-FIBRA-VIDRIO-5":      "imagenes/fibra-de-vidrio-5-pasos.jpg",
  "GUANTES-NYLON":                "imagenes/guantes-nylon.jpg",
  "ESCALERA-2-PASOS":             "imagenes/escalera-2-pasos.jpg",
  "ESCALERA-3-PASOS":             "imagenes/escalera-3-pasos.jpg",
  "ESCALERA-4-PASOS":             "imagenes/escalera-4-pasos.jpg",
  "ESCALERA-5-PASOS":             "imagenes/escalera-6-pasos.jpg",
  "ESCALERA-6-PASOS":             "imagenes/escalera-5-pasos.jpg",
  "ESCALERA-12-PASOS":            "imagenes/escalera-12-pasos.jpg",
  "ESCALERA-16-PASOS":            "imagenes/escalera-16-pasos.jpg",
  "ESCALERA-24-PASOS":            "imagenes/escalera-24-pasos.jpg",
  "ESCALERA-1-PASOS-TUBULAR":     "imagenes/escalera-1-paso-tubular.jpg",
  "ESCALERA-3-PASOS-TUBULAR":     "imagenes/escalera-3-pasos-tubular.jpg",
  "ESCALERA-4-PASOS-TUBULAR":     "imagenes/escalera-6-pasos-tubular.jpg",
  "ESCALERA-6-PASOS-TUBULAR":     "imagenes/escalera-4-pasos-tubular.jpg",
  "ESCALERA-3-PASOS-ALUMINIO":    "imagenes/escalera-3-pasos-aluminio.jpg",
  "ESCALERA-4-PASOS-ALUMINIO":    "imagenes/escalera-6-pasos-aluminio.jpg",
  "ESCALERA-6-PASOS-ALUMINIO":    "imagenes/escalera-4-pasos-aluminio.jpg",
  "ESCALERA-4-PASOS-C&A":         "imagenes/escalera-4-pasos-cya.jpg",
  "PRETUL-ESCALERA-3-PASOS":      "imagenes/pretul-escalera-3-pasos.jpg",
  "PRETUL-ESCALERA-4-PASOS":      "imagenes/pretul-escalera-4-pasos.jpg",
  "ESCALERA-TELES-10":            "imagenes/escalera-teles-10.jpg",
  "TRUPER-ESCALERA-TELES-7":      "imagenes/truper-escalera-teles-7.jpg",
  "ESCALERA-TELES-TIJERA-12":     "imagenes/escalera-teles-tijera-12-plegada.jpg",
};


// === Catálogo Strenko — se alimenta solo desde el Google Sheet ===
const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR_TGbgo-sVm6R7EMGGVAkrztMQ6RxtqAb-9YYJj5lTBlNMG-SU9lseA9a7bT_d8sWTvo0-fXV4xlUH/pub?gid=642137454&single=true&output=csv";

const RUBRO_TIENDA = "SENTO";   // esta es la tienda de este repo

// A=SKU  B=Nombre  C=Categoria  D=Precio  E=Stock  F=Linea/Rubro
const COL = { sku: 0, nombre: 1, categoria: 2, precio: 3, stock: 4, rubro: 5 };

async function cargarProductos() {
  try {
    const csv   = await (await fetch(CSV_URL)).text();
    const filas = parseCSV(csv);
    const datos = filas.slice(1);

    window.productosData = datos
      .filter(f => f[COL.sku]?.trim())
      .map(f => ({
        sku:       f[COL.sku].trim(),
        nombre:    (f[COL.nombre]    || "").trim(),
        categoria: (f[COL.categoria] || "").trim(),
        precio:    Number(f[COL.precio]) || 0,
        stock:     Number(f[COL.stock]) || 0,
        rubro:     (f[COL.rubro]     || "").trim(),
        imagen:    `imagenes/${f[COL.sku].trim()}.jpeg`,
      }))
      .filter(p =>
          p.rubro.toUpperCase() === RUBRO_TIENDA &&
          p.nombre
        );

    // 👇 ESTO ES LO QUE FALTA 👇
    window.productosData.forEach(prod => {
      if (IMAGENES_MANUALES[prod.sku]) {
        prod.imagen = IMAGENES_MANUALES[prod.sku];
      }
    });

    // ← re-inyecta los productos custom y VUELVE a pintar la grilla
    if (typeof cargarProductosCustom === "function") cargarProductosCustom();
    if (typeof renderGrid === "function") renderGrid();
  } catch (e) {
    console.error("No se pudo cargar el catálogo:", e);
  }
}

// Parser CSV que respeta comas y saltos de línea dentro de comillas
function parseCSV(texto) {
  const filas = []; let campo = "", fila = [], comillas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (comillas) {
      if (c === '"' && texto[i + 1] === '"') { campo += '"'; i++; }
      else if (c === '"') comillas = false;
      else campo += c;
    } else {
      if (c === '"') comillas = true;
      else if (c === ",")  { fila.push(campo); campo = ""; }
      else if (c === "\n") { fila.push(campo); filas.push(fila); fila = []; campo = ""; }
      else if (c !== "\r") campo += c;
    }
  }
  if (campo !== "" || fila.length) { fila.push(campo); filas.push(fila); }
  return filas;
}

// Inicia vacío para que init() de app.js no falle mientras llega el Sheet
window.productosData = window.productosData || [];
cargarProductos();


