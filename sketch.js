/* =========================================================================
   VIRTUAL LAB: LISTRIK ARUS SEARAH (DC) - P5.JS STANDALONE SKETCH
   Format: p5.js Standalone Editor
   ========================================================================= */

let currentScreen = 'HOME';
let activeTab = 1;

// Identitas Penyusun & Kurikulum
const infoPenyusun = {
  judul: "VIRTUAL LAB LISTRIK ARUS SEARAH (DC)",
  subJudul: "Fisika SMA Kelas XII - Kurikulum Merdeka",
  nama: "Tim Pengembang Media Pembelajaran Fisika",
  instansi: "Adinda Amelia • Rizki Syahfina B. • Wiji Susilowati",
  tahun: "RPL 2026"
};

// Parameter Animasi & Partikel Latar Belakang
let animOffset = 0;
let bgParticles = [];
let mainCanvas;

// Dynamic Screen Virtual Resolution (16:9 HD)
const VIRTUAL_W = 1280;
const VIRTUAL_H = 720;

// Parameter Fisika Simulasi
let physics = {
  // Tab 1: Hukum Ohm
  voltage: 12.0,       // Volt
  resistance: 10.0,    // Ohm
  
  // Tab 2: Hambatan Jenis Kawat
  wireLength: 50.0,    // Meter
  wireArea: 2.0,       // mm²
  materialIndex: 0,    // 0: Tembaga, 1: Aluminium, 2: Besi, 3: Nikrom
  showMicroView: true, // Toggle mikroskopis kawat

  // Tab 3: Rangkaian Seri, Paralel & Gabungan
  circuitType: 'SERI',
  r1: 10.0,
  r2: 10.0,
  r3: 10.0,

  // Tab 4: Hukum II Kirchhoff (Dual Loop)
  v1: 12.0,
  v2: 6.0,
  rk1: 10.0,

  // Tab 5: Daya & Energi Listrik Interaktif Perangkat
  selectedAppliance: 0,
  powerDeviceWatts: 15,
  hoursPerDay: 8
};

const materials = [
  { name: "Tembaga", rho: 1.68e-8, color: [249, 115, 22], presetDesc: "Kabel Rumah & Peralatan Elektronik" },
  { name: "Aluminium", rho: 2.82e-8, color: [148, 163, 184], presetDesc: "Kabel Jaringan Listrik PLN (SUTET)" },
  { name: "Besi", rho: 10.0e-8, color: [100, 116, 139], presetDesc: "Konduktor Konstruksi & Rel Kereta" },
  { name: "Nikrom", rho: 100.0e-8, color: [225, 29, 72], presetDesc: "Elemen Pemanas Teko / Pemanggang" }
];

// State Control Sliders In-Canvas
let draggingSlider = null; // 'SLIDER1', 'SLIDER2', 'SLIDER3'

// State Modal & Kuis Interaktif
let activeModal = null; // 'APERSEPSI', 'KUIS', 'REFLEKSI', null
let activeKuisQuestion = 0;
let KuisAnswers = [-1, -1, -1, -1, -1];
let refleksiRating = 5;

let refleksiNotes = "Konsep Hukum Ohm, Resistivitas Kawat, Rangkaian Seri-Paralel, Kirchhoff II, dan Jejak Karbon Daya Listrik telah dipahami dengan baik melalui simulasi visual.";

// ===============================
// DATA SOAL KUIS — 5 OPSI A–E
// ===============================
const KuisQuestions = [
  {
    title: "Soal 1: Hukum Ohm & Kuat Arus",
    question: "Jika tegangan sumber baterai dinaikkan 2 kali lipat sedangkan nilai hambatan tetap, apa yang terjadi pada kuat arus listrik?",
    options: [
      "Kuat arus menjadi 2x lebih besar",
      "Kuat arus menjadi 1/2 kali semula",
      "Kuat arus tetap",
      "Kuat arus menjadi 4x lebih besar",
      "Kuat arus menjadi 1/4 kali semula"
    ],
    correct: 0,
    explanation: "Sesuai Hukum Ohm (I = V / R), kuat arus (I) berbanding lurus dengan tegangan (V). Jika V menjadi 2V dan R tetap, maka I menjadi 2I."
  },

  {
    title: "Soal 2: Hambatan Jenis Kawat",
    question: "Bagaimana cara memperkecil nilai hambatan kawat penghantar?",
    options: [
      "Memperpanjang kawat dan memperkecil luas penampang",
      "Memperpendek kawat dan memperbesar luas penampang",
      "Menaikkan suhu kawat",
      "Memilih bahan kawat dengan resistivitas tinggi",
      "Memperpanjang kawat tanpa mengubah luas penampang"
    ],
    correct: 1,
    explanation: "Hambatan kawat dirumuskan R = ρL/A. Untuk memperkecil R, panjang kawat (L) diperkecil dan luas penampang (A) diperbesar."
  },

  {
    title: "Soal 3: Rangkaian Seri vs Paralel",
    question: "Mengapa lampu yang dirangkai secara paralel dapat menyala lebih terang dibandingkan lampu yang dirangkai seri pada tegangan sumber yang sama?",
    options: [
      "Karena hambatan total paralel lebih kecil sehingga arus total dari sumber lebih besar",
      "Karena rangkaian seri membagi arus sama besar ke semua lampu",
      "Karena tegangan pada setiap cabang paralel berkurang",
      "Karena arus pada rangkaian seri bernilai nol",
      "Karena setiap lampu paralel memperoleh tegangan sumber yang sama"
    ],
    correct: 0,
    explanation: "Pada rangkaian paralel, hambatan total lebih kecil dibandingkan hambatan masing-masing cabang. Selain itu, setiap lampu memperoleh tegangan sumber yang sama sehingga lampu dapat bekerja lebih optimal."
  },

  {
    title: "Soal 4: Hukum II Kirchhoff",
    question: "Pada suatu loop tertutup, jumlah perubahan potensial listrik (ΣE + ΣI·R) sama dengan berapa?",
    options: [
      "Tegangan maksimum baterai",
      "Nol (0)",
      "Satu (1 Volt)",
      "Jumlah seluruh hambatan",
      "Jumlah seluruh arus dalam rangkaian"
    ],
    correct: 1,
    explanation: "Hukum II Kirchhoff berdasarkan prinsip kekekalan energi menyatakan bahwa jumlah perubahan potensial dalam satu loop tertutup adalah nol, sehingga ΣE + ΣI·R = 0."
  },

  {
    title: "Soal 5: Daya & Jejak Karbon",
    question: "Jika sebuah perangkat listrik 1000 Watt dinyalakan selama 5 jam, berapa energi listrik yang dikonsumsi?",
    options: [
      "0,5 kWh",
      "5,0 kWh",
      "50 kWh",
      "500 kWh",
      "5000 kWh"
    ],
    correct: 1,
    explanation: "Energi listrik E = P × t. Daya 1000 W = 1 kW, sehingga E = 1 kW × 5 jam = 5 kWh."
  }
];

const appliances = [
  { name: "💡 Lampu LED", defaultWatts: 15, maxWatts: 50, icon: "💡", desc: "Penerangan Hemat Energi" },
  { name: "📺 Smart TV 43\"", defaultWatts: 90, maxWatts: 200, icon: "📺", desc: "Hiburan & Display Display" },
  { name: "🧊 Kulkas 2 Pintu", defaultWatts: 150, maxWatts: 350, icon: "🧊", desc: "Pendingin Makanan 24 Jam" },
  { name: "❄️ AC Split 1 PK", defaultWatts: 750, maxWatts: 1500, icon: "❄️", desc: "Pengondisi Udara Ruangan" },
  { name: "🫖 Teko Listrik", defaultWatts: 1200, maxWatts: 2200, icon: "🫖", desc: "Pemanas Air Daya Tinggi" }
];

function setup() {
  mainCanvas = createCanvas(windowWidth, windowHeight);
  textFont('sans-serif');
  
  // Inisialisasi Partikel Dekoratif Atom Latar (Dioptimalkan agar sangat ringan)
  for (let i = 0; i < 22; i++) {
    bgParticles.push({
      x: random(20, VIRTUAL_W - 20),
      y: random(20, VIRTUAL_H - 20),
      size: random(12, 20),
      vx: random(-0.5, 0.5),
      vy: random(-0.5, 0.5),
      type: random() > 0.5 ? '+' : '-',
      color: random() > 0.5 ? color(244, 63, 94, 180) : color(14, 165, 233, 180)
    });
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function getVirtualMouse() {
  let scaleFactor = min(width / VIRTUAL_W, height / VIRTUAL_H);
  let offsetX = (width - VIRTUAL_W * scaleFactor) / 2;
  let offsetY = (height - VIRTUAL_H * scaleFactor) / 2;

  let mx = (mouseX - offsetX) / scaleFactor;
  let my = (mouseY - offsetY) / scaleFactor;
  return { x: mx, y: my, scale: scaleFactor, offX: offsetX, offY: offsetY };
}

function draw() {
  background(15, 23, 42); // Deep dark space border background

  let scaleFactor = min(width / VIRTUAL_W, height / VIRTUAL_H);
  let offsetX = (width - VIRTUAL_W * scaleFactor) / 2;
  let offsetY = (height - VIRTUAL_H * scaleFactor) / 2;

  push();
  translate(offsetX, offsetY);
  scale(scaleFactor);

  // Background Canvas Card
  fill(248, 250, 252);
  stroke(14, 165, 233);
  strokeWeight(3);
  rect(0, 0, VIRTUAL_W, VIRTUAL_H, 16);

  // Animasi Partikel Background
  updateAndDrawParticles();

  // Manajemen Tampilan Screen
  if (currentScreen === 'HOME') {
    drawCoverScreen();
  } else if (currentScreen === 'LAB') {
    drawLabScreen();
  }

  animOffset += 2.2;
  pop();

  // Update In-Canvas Slider Dragging
  if (draggingSlider && mouseIsPressed) {
    updateSliderDrag();
  }
}

function updateAndDrawParticles() {
  push();
  noStroke();
  textAlign(CENTER, CENTER);
  textStyle(BOLD);

  bgParticles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < 15 || p.x > VIRTUAL_W - 15) p.vx *= -1;
    if (p.y < 15 || p.y > VIRTUAL_H - 15) p.vy *= -1;

    fill(red(p.color), green(p.color), blue(p.color), 35);
    ellipse(p.x, p.y, p.size * 1.8);

    fill(p.color);
    ellipse(p.x, p.y, p.size);

    fill(255, 240);
    textSize(p.size * 0.7);
    text(p.type, p.x, p.y);
  });
  pop();
}

function drawCoverScreen() {
  push();
  let vm = getVirtualMouse();

  // Inner Glow Border
  stroke(244, 63, 94, 120);
  strokeWeight(3);
  noFill();
  rect(12, 12, VIRTUAL_W - 24, VIRTUAL_H - 24, 14);

  // Header Banner Cover
  fill(244, 63, 94);
  noStroke();
  rect(30, 30, VIRTUAL_W - 60, 220, 20);

  fill(251, 191, 36, 230);
  ellipse(80, 80, 60, 60);
  ellipse(VIRTUAL_W - 80, 80, 50, 50);

  textAlign(CENTER, CENTER);
  fill(255);
  textSize(34);
  textStyle(BOLD);
  text(`⚡ ${infoPenyusun.judul} ⚡`, VIRTUAL_W / 2, 90);

  fill(254, 243, 199);
  textSize(18);
  textStyle(NORMAL);
  text(infoPenyusun.subJudul, VIRTUAL_W / 2, 142);

  fill(16, 185, 129);
  rect(VIRTUAL_W / 2 - 280, 182, 560, 42, 21);
  fill(255);
  textSize(14);
  textStyle(BOLD);
  text("TUGAS PROJEK KELOMPOK 10 • MATA KULIAH SAINS KOMPUTASI", VIRTUAL_W / 2, 203);

  // Info Penyusun Container Card
  fill(240, 253, 250);
  stroke(20, 184, 166);
  strokeWeight(2.5);
  rect(30, 275, VIRTUAL_W - 60, 250, 20);

  fill(13, 148, 136);
  noStroke();
  textSize(16);
  textStyle(BOLD);
  text("DISUSUN KREATIF OLEH:", VIRTUAL_W / 2, 308);

  fill(15, 23, 42);
  textSize(25);
  textStyle(BOLD);
  text(infoPenyusun.nama, VIRTUAL_W / 2, 348);

  fill(71, 85, 105);
  textSize(17);
  textStyle(NORMAL);
  text(infoPenyusun.instansi + " • " + infoPenyusun.tahun, VIRTUAL_W / 2, 388);

  fill(249, 115, 22);
  rect(VIRTUAL_W / 2 - 320, 430, 640, 46, 23);
  fill(255);
  textSize(16);
  textStyle(BOLD);
  text("💡 V = I × R   |   P = V × I   |   R = ρ · L / A   |   ΣE + Σ(I·R) = 0 💡", VIRTUAL_W / 2, 453);

  // Tombol Mulai Simulasi (Interaktif & Hoverable)
  let btnX = VIRTUAL_W / 2 - 200;
  let btnY = 560;
  let btnW = 400;
  let btnH = 75;

  let isHover = vm.x > btnX && vm.x < btnX + btnW && vm.y > btnY && vm.y < btnY + btnH;
  
  noStroke();
  fill(0, 0, 0, 30);
  rect(btnX + 4, btnY + 6, btnW, btnH, 24);

  if (isHover) fill(245, 158, 11); else fill(251, 191, 36);
  stroke(isHover ? color(244, 63, 94) : color(249, 115, 22));
  strokeWeight(isHover ? 4 : 3);
  rect(btnX, btnY, btnW, btnH, 24);

  fill(15, 23, 42);
  noStroke();
  textSize(22);
  textStyle(BOLD);
  text("🚀 MULAI SIMULASI LAB  ➔", VIRTUAL_W / 2, btnY + 38);

  pop();
}

function drawLabScreen() {
  push();
  drawHeaderNavigation();

  switch (activeTab) {
    case 1: drawTabHukumOhm(); break;
    case 2: drawTabHambatanKawat(); break;
    case 3: drawTabRangkaianSeriParalel(); break;
    case 4: drawTabHukumKirchhoff(); break;
    case 5: drawTabDayaListrik(); break;
  }

  drawLiveReadingsFooter();

  if (activeModal === 'APERSEPSI') drawApersepsiModal();
  else if (activeModal === 'KUIS') drawKUISModal();
  else if (activeModal === 'REFLEKSI') drawRefleksiModal();

  pop();
}

function drawHeaderNavigation() {
  push();
  let vm = getVirtualMouse();

  fill(224, 242, 254);
  noStroke();
  rect(20, 16, VIRTUAL_W - 40, 60, 16);

  // Tombol Kembali Ke Home
  let isBackHover = vm.x > 30 && vm.x < 130 && vm.y > 24 && vm.y < 68;
  fill(isBackHover ? color(225, 29, 72) : color(244, 63, 94));
  stroke(255);
  strokeWeight(1.5);
  rect(30, 24, 100, 44, 12);
  fill(255);
  noStroke();
  textSize(13);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  text("🏠 HOME", 80, 46);

  const tabTitles = ["1. Hukum Ohm", "2. Kawat Penghantar", "3. Seri / Paralel", "4. Kirchhoff II", "5. Daya & Carbon"];
  const tabColors = [
    color(236, 72, 153),
    color(14, 165, 233),
    color(249, 115, 22),
    color(139, 92, 246),
    color(16, 185, 129)
  ];

  let startX = 275;
  let tabW = 188;

  tabTitles.forEach((title, i) => {
    let tx = startX + i * (tabW + 6);
    let ty = 24;
    let isActive = (activeTab === (i + 1));
    let isHover = vm.x > tx && vm.x < tx + tabW && vm.y > ty && vm.y < ty + 44;

    if (isActive) {
      fill(tabColors[i]);
      stroke(251, 191, 36);
      strokeWeight(3);
    } else if (isHover) {
      fill(254, 240, 138);
      stroke(tabColors[i]);
      strokeWeight(2);
    } else {
      fill(255);
      stroke(203, 213, 225);
      strokeWeight(1.5);
    }

    rect(tx, ty, tabW, 44, 12);

    fill(isActive ? 255 : 30);
    noStroke();
    textSize(13.5);
    textStyle(BOLD);
    text(title, tx + tabW / 2, ty + 22);
  });

  // Tombol Apersepsi Top Right
  let apX = 142;
  let apY = 24;
  let apW = 127;
  let apH = 44;
  let isApersepsiHover = vm.x > apX && vm.x < apX + apW && vm.y > apY && vm.y < apY + apH;

  fill(isApersepsiHover ? color(217, 119, 6) : color(245, 158, 11));
  stroke(251, 191, 36);
  strokeWeight(2.5);
  rect(apX, apY, apW, apH, 12);

  fill(255);
  noStroke();
  textSize(13);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  text("💡 APERSEPSI", apX + apW / 2, apY + 22);

  pop();
}

function drawTabHukumOhm() {
  push();
  let V = physics.voltage;
  let R = physics.resistance;
  let I = V / R;

  // Panel Kiri: Informasi Formula & Parameter
  fill(255); stroke(203, 213, 225); strokeWeight(2);
  rect(20, 90, 310, 480, 16);

  fill(15, 23, 42); textAlign(LEFT, TOP); textSize(16); textStyle(BOLD);
  text("⚡ TEORI HUKUM OHM", 35, 110);
  textSize(13); textStyle(NORMAL); fill(71, 85, 105);
  text("Besar kuat arus listrik (I) yang mengalir pada penghantar berbanding lurus dengan beda potensial (V) dan berbanding terbalik dengan hambatan (R).", 35, 138, 280, 90);

  fill(236, 72, 153, 30); stroke(236, 72, 153); strokeWeight(2);
  rect(35, 230, 280, 100, 12);
  fill(15, 23, 42); textAlign(CENTER, CENTER); textSize(24); textStyle(BOLD);
  text("I = V / R", 175, 260);
  textSize(15); fill(225, 29, 72);
  text(`I = ${V.toFixed(1)} / ${R.toFixed(1)} = ${I.toFixed(2)} Ampere`, 175, 300);

  // Meter visual gauge
  fill(240, 253, 244); stroke(34, 197, 94); strokeWeight(2);
  rect(35, 350, 280, 200, 12);
  fill(21, 128, 61); textSize(15); textStyle(BOLD); textAlign(CENTER, TOP);
  text("📊 HASIL UKUR AMPEREMETER", 175, 365);
  textSize(36); fill(16, 185, 129);
  text(`${I.toFixed(2)} A`, 175, 410);

  // Canvas Rangkaian Listrik (Kanan)
  let left = 350, right = 1240, top = 90, bottom = 570;
  fill(255); stroke(14, 165, 233); strokeWeight(3);
  rect(left, top, right - left, bottom - top, 16);

  stroke(14, 165, 233); strokeWeight(5); noFill();
  rect(left + 60, top + 50, (right - left) - 120, (bottom - top) - 100, 20);

  drawBatteryIcon(left + 60, (top + bottom) / 2, V);
  drawResistorIcon((left + right) / 2, top + 50, R);
  drawLampuIcon(right - 60, (top + bottom) / 2, "Bohlam Beban", I, R);

  drawElectronFlow(left + 60, right - 60, top + 50, bottom - 50, I);
  pop();
}

function drawTabHambatanKawat() {
  push();
  let L = physics.wireLength;
  let A = physics.wireArea;
  let mat = materials[physics.materialIndex];
  let rho = mat.rho;
  let R_kawat = (rho * L) / (A * 1e-6);
  let hypotheticalI = 12.0 / (R_kawat > 0.0001 ? R_kawat : 0.0001);

  // Panel Kiri: Kontrol & Informasi
  fill(255); stroke(203, 213, 225); strokeWeight(2);
  rect(20, 90, 310, 480, 16);

  fill(15, 23, 42); textAlign(LEFT, TOP); textSize(16); textStyle(BOLD);
  text("📐 RESISTIVITAS KAWAT", 35, 110);
  textSize(12.5); textStyle(NORMAL); fill(71, 85, 105);
  text("Hambatan kawat (R) berbanding lurus dengan panjang (L) dan resistivitas bahan (ρ), serta berbanding terbalik dengan luas penampang (A).", 35, 136, 280, 75);

  // Selector Material Bahan Kawat
  fill(15, 23, 42); textSize(12.5); textStyle(BOLD);
  text("PILIH BAHAN KONDUKTOR:", 35, 215);
  let vm = getVirtualMouse();
  let bw = 64;

  materials.forEach((mItem, m) => {
    let bx = 35 + m * (bw + 6);
    let by = 235;
    let isActive = (physics.materialIndex === m);
    let isHover = vm.x > bx && vm.x < bx + bw && vm.y > by && vm.y < by + 32;

    fill(isActive ? color(mat.color[0], mat.color[1], mat.color[2]) : (isHover ? color(226, 232, 240) : color(241, 245, 249)));
    stroke(isActive ? color(15, 23, 42) : color(203, 213, 225));
    strokeWeight(isActive ? 2.5 : 1.5);
    rect(bx, by, bw, 32, 8);

    fill(isActive ? 255 : 50); noStroke(); textSize(10.5); textStyle(BOLD); textAlign(CENTER, CENTER);
    text(mItem.name, bx + bw / 2, by + 16);
  });

  // Preset Info Box
  fill(240, 253, 250); stroke(20, 184, 166); strokeWeight(1.5);
  rect(35, 275, 280, 45, 8);
  fill(13, 148, 136); textAlign(LEFT, CENTER); textSize(11); textStyle(BOLD);
  text(`💡 Aplikasi: ${mat.presetDesc}`, 43, 297, 264, 38);

  // Formula Card & Live Calculation
  fill(14, 165, 233, 20); stroke(14, 165, 233); strokeWeight(2);
  rect(35, 330, 280, 105, 12);
  fill(15, 23, 42); textAlign(CENTER, TOP); textSize(18); textStyle(BOLD);
  text("R = ρ · L / A", 175, 342);

  textSize(13); fill(2, 132, 199); textStyle(BOLD);
  text(`ρ = ${rho.toExponential(2)} Ω·m`, 175, 370);

  textSize(16); fill(225, 29, 72);
  text(`Hambatan R = ${R_kawat < 0.01 ? R_kawat.toExponential(3) : R_kawat.toFixed(4)} Ω`, 175, 398);

  // Toggle Mikroskopis View Button
  let microBtnX = 35, microBtnY = 445, microBtnW = 280, microBtnH = 38;
  let isMicroHover = vm.x > microBtnX && vm.x < microBtnX + microBtnW && vm.y > microBtnY && vm.y < microBtnY + microBtnH;
  fill(physics.showMicroView ? color(16, 185, 129) : (isMicroHover ? color(226, 232, 240) : color(241, 245, 249)));
  stroke(physics.showMicroView ? color(5, 150, 105) : color(203, 213, 225));
  strokeWeight(2);
  rect(microBtnX, microBtnY, microBtnW, microBtnH, 10);
  fill(physics.showMicroView ? 255 : 30); noStroke(); textSize(12.5); textStyle(BOLD); textAlign(CENTER, CENTER);
  text(physics.showMicroView ? "🔬 Mode Mikroskopis (Aktif)" : "🔍 Aktifkan Struktur Atom Kawat", microBtnX + microBtnW / 2, microBtnY + microBtnH / 2);

  // Live Conductance Info
  fill(71, 85, 105); textSize(11.5); textAlign(CENTER, TOP); textStyle(NORMAL);
  text(`Daya Hantar (G) = ${(1 / (R_kawat || 1)).toFixed(2)} Siemens`, 175, 495);
  text(`Arus pada 12V = ${hypotheticalI > 1000 ? '>1000' : hypotheticalI.toFixed(1)} A`, 175, 515);

  // Canvas Animasi Kawat (Kanan)
  let left = 350, right = 1240, top = 90, bottom = 570;
  fill(255); stroke(14, 165, 233); strokeWeight(3);
  rect(left, top, right - left, bottom - top, 16);

  // Visual Kawat 3D & Pemetaan Dimensi Dinamis
  let startX = left + 80;
  let startY = (top + bottom) / 2 - 10;
  let maxWireW = (right - left) - 160; 
  let wireW = map(L, 5, 200, 160, maxWireW);
  let wireH = map(A, 0.5, 10, 24, 110);

  // Efek Pendar Panas Hambatan Tinggi (Nichrome / Besi)
  if (mat.name === "Nikrom" || mat.name === "Besi") {
    let heatGlow = map(R_kawat, 0.001, 0.1, 0, 180);
    noStroke();
    fill(244, 63, 94, constrain(heatGlow, 0, 180));
    rect(startX - 10, startY - wireH / 2 - 10, wireW + 20, wireH + 20, wireH / 2);
  }

  // Batang Silinder Utama Kawat
  fill(mat.color[0], mat.color[1], mat.color[2]);
  stroke(30, 41, 59);
  strokeWeight(3);
  rect(startX, startY - wireH / 2, wireW, wireH, wireH / 4);

  // Penampang Samping Silinder 3D
  fill(red(color(mat.color[0], mat.color[1], mat.color[2])) * 0.8, green(color(mat.color[0], mat.color[1], mat.color[2])) * 0.8, blue(color(mat.color[0], mat.color[1], mat.color[2])) * 0.8);
  ellipse(startX + wireW, startY, wireH * 0.4, wireH);

  // Mikroskopis: Kation Logam (+) dan Elektron Bebas (-) Berpindah
  if (physics.showMicroView) {
    let latticeCols = constrain(Math.floor(wireW / 40), 1, 14);
    let latticeRows = constrain(Math.floor(wireH / 28), 1, 4);
    let heatVibe = (mat.name === "Nikrom") ? sin(animOffset * 0.5) * 2.5 : 0;

    // Kisi-kisi Atom Logam
    noStroke();
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(10);

    Array.from({ length: latticeRows }).forEach((_, r) => {
      Array.from({ length: latticeCols }).forEach((_, c) => {
        let ax = startX + 20 + c * 36 + heatVibe;
        let ay = (startY - wireH / 2 + 16) + r * 24;
        
        fill(255, 255, 255, 140);
        ellipse(ax, ay, 18, 18);
        fill(15, 23, 42, 200);
        text("+", ax, ay);
      });
    });

    // Elektron Bebas Mengalir
    let speed = constrain(10 / (R_kawat * 100 + 1), 0.8, 6.0);
    textSize(8);
    Array.from({ length: 18 }).forEach((_, e) => {
      let ex = startX + ((animOffset * speed + e * 35) % wireW);
      let ey = (startY - wireH / 2 + 12) + ((e * 17) % (wireH - 24));
      
      fill(56, 189, 248);
      ellipse(ex, ey, 9, 9);
      fill(255);
      text("-", ex, ey);
    });
  }

  // Panah Dimensi Panjang (L) & Penampang (A)
  stroke(14, 165, 233); strokeWeight(2);
  let dimY = startY + wireH / 2 + 35;
  line(startX, dimY, startX + wireW, dimY);
  line(startX, dimY - 6, startX, dimY + 6);
  line(startX + wireW, dimY - 6, startX + wireW, dimY + 6);

  fill(15, 23, 42); noStroke(); textSize(13); textStyle(BOLD); textAlign(CENTER, TOP);
  text(`Panjang L = ${L.toFixed(1)} Meter`, startX + wireW / 2, dimY + 8);

  // Label Keterangan Kawat
  textSize(16); textStyle(BOLD); textAlign(CENTER, TOP); fill(15, 23, 42);
  text(`Kawat Penghantar: ${mat.name}`, (left + right) / 2, top + 18);
  textSize(12.5); textStyle(NORMAL); fill(100, 116, 139);
  text(`Luas Penampang A = ${A.toFixed(1)} mm²  |  Diameter d ≈ ${(2 * Math.sqrt(A / Math.PI)).toFixed(2)} mm`, (left + right) / 2, top + 42);

  pop();
}

function drawTabRangkaianSeriParalel() {
  push();

  // Mode Selector (Top Left)
  let modes = ['SERI', 'PARALEL', 'GABUNGAN'];
  let btnW = 95;
  
  modes.forEach((mode, m) => {
    let mx = 20 + m * (btnW + 8);
    let my = 90;
    let isActive = (physics.circuitType === mode);
    
    fill(isActive ? color(249, 115, 22) : color(241, 245, 249));
    stroke(isActive ? color(251, 191, 36) : color(203, 213, 225));
    strokeWeight(2);
    rect(mx, my, btnW, 36, 10);

    fill(isActive ? 255 : 50);
    noStroke();
    textSize(12);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text(mode, mx + btnW / 2, my + 18);
  });

  let I_tot = 0, i1 = 0, i2 = 0, i3 = 0, R_tot = 0;
  let V = physics.voltage;
  let R1 = physics.r1, R2 = physics.r2, R3 = physics.r3;

  if (physics.circuitType === 'SERI') {
    R_tot = R1 + R2 + R3;
    I_tot = V / R_tot;
    i1 = I_tot; i2 = I_tot; i3 = I_tot;
  } else if (physics.circuitType === 'PARALEL') {
    R_tot = 1 / ((1 / R1) + (1 / R2) + (1 / R3));
    I_tot = V / R_tot;
    i1 = V / R1; i2 = V / R2; i3 = V / R3;
  } else if (physics.circuitType === 'GABUNGAN') {
    let R23 = (R2 * R3) / (R2 + R3);
    R_tot = R1 + R23;
    I_tot = V / R_tot;
    i1 = I_tot;
    let V_par = I_tot * R23;
    i2 = V_par / R2;
    i3 = V_par / R3;
  }

  // Panel Kiri Analisis Rangkaian
  fill(254, 243, 199); stroke(245, 158, 11); strokeWeight(2);
  rect(20, 140, 310, 430, 16);
  fill(180, 83, 9); noStroke(); textSize(16); textStyle(BOLD); textAlign(LEFT, TOP);
  text("📊 ANALISIS RANGKAIAN:", 35, 158);
  textSize(13.5); textStyle(NORMAL); fill(15, 23, 42);
  text(`• R Total = ${R_tot.toFixed(2)} Ω`, 35, 195);
  text(`• Arus Total (I) = ${I_tot.toFixed(2)} A`, 35, 225);
  text(`• Arus Lampu 1 = ${i1.toFixed(2)} A`, 35, 255);
  text(`• Arus Lampu 2 = ${i2.toFixed(2)} A`, 35, 285);
  text(`• Arus Lampu 3 = ${i3.toFixed(2)} A`, 35, 315);

  fill(120, 53, 15); textSize(12); textStyle(ITALIC);
  text("💡 Catatan: Nyala lampu (daya) berbanding lurus dengan kuadrat arus P = I²·R!", 35, 360, 280, 100);

  // Canvas Rangkaian (Kanan)
  let left = 350, right = 1240, top = 90, bottom = 570;
  fill(255); stroke(14, 165, 233); strokeWeight(3);
  rect(left, top, right - left, bottom - top, 16);

  stroke(14, 165, 233); strokeWeight(4); noFill();

  if (physics.circuitType === 'SERI') {
    rect(left + 60, top + 50, (right - left) - 120, (bottom - top) - 100, 20);
    drawBatteryIcon(left + 60, (top + bottom) / 2, V);
    drawLampuIcon(left + 260, top + 50, "Lampu 1", i1, R1);
    drawLampuIcon(left + 500, top + 50, "Lampu 2", i2, R2);
    drawLampuIcon(left + 740, top + 50, "Lampu 3", i3, R3);
    drawElectronFlow(left + 60, right - 60, top + 50, bottom - 50, I_tot);

  } else if (physics.circuitType === 'PARALEL') {
    rect(left + 60, top + 50, (right - left) - 120, (bottom - top) - 100, 20);
    line(left + 350, top + 50, left + 350, bottom - 50);
    line(left + 620, top + 50, left + 620, bottom - 50);

    drawBatteryIcon(left + 60, (top + bottom) / 2, V);
    drawLampuIcon(left + 210, top + 50, "Lampu 1", i1, R1);
    drawLampuIcon(left + 485, top + 50, "Lampu 2", i2, R2);
    drawLampuIcon(left + 755, top + 50, "Lampu 3", i3, R3);
    drawElectronFlow(left + 60, right - 60, top + 50, bottom - 50, I_tot);

  } else if (physics.circuitType === 'GABUNGAN') {
    rect(left + 60, top + 50, (right - left) - 120, (bottom - top) - 100, 20);
    let midX = left + 450;
    line(midX, top + 50, midX, bottom - 50);

    drawBatteryIcon(left + 60, (top + bottom) / 2, V);
    drawLampuIcon(left + 240, top + 50, "Lampu 1 (Seri)", i1, R1);
    drawLampuIcon(midX + 220, top + 50, "Lampu 2 (Paralel A)", i2, R2);
    drawLampuIcon(midX + 220, bottom - 50, "Lampu 3 (Paralel B)", i3, R3);
    drawElectronFlow(left + 60, right - 60, top + 50, bottom - 50, I_tot);
  }

  pop();
}

function drawTabHukumKirchhoff() {
  push();
  fill(255); stroke(203, 213, 225); strokeWeight(2);
  rect(20, 90, 310, 480, 16);

  fill(15, 23, 42); textAlign(LEFT, TOP); textSize(16); textStyle(BOLD);
  text("🔄 HUKUM II KIRCHHOFF", 35, 110);
  textSize(13); textStyle(NORMAL); fill(71, 85, 105);
  text("Di dalam sebuah rangkaian tertutup (loop), jumlah aljabar gaya gerak listrik (E) dengan penurunan tegangan (I·R) sama dengan nol.", 35, 138, 280, 90);

  fill(139, 92, 246, 30); stroke(139, 92, 246); strokeWeight(2);
  rect(35, 240, 280, 110, 12);
  fill(15, 23, 42); textAlign(CENTER, CENTER); textSize(20); textStyle(BOLD);
  text("ΣE + Σ(I · R) = 0", 175, 275);
  textSize(14); fill(109, 40, 217);
  text(`Loop Dual Tegangan V1 & V2`, 175, 320);

  // Canvas Visual Rangkaian Kirchhoff (Kanan)
  let left = 350, right = 1240, top = 90, bottom = 570, midX = (left + right) / 2;
  fill(255); stroke(14, 165, 233); strokeWeight(3);
  rect(left, top, right - left, bottom - top, 16);

  // Parameter Fisika Hukum Kirchhoff
  let rLoopLeft = physics.r1 + physics.rk1;
  let rLoopRight = physics.r2 + physics.rk1;
  
  // Arus Cabang Kiri (I1) dan Kanan (I2)
  let i1 = rLoopLeft > 0 ? physics.v1 / rLoopLeft : 0;
  let i2 = rLoopRight > 0 ? physics.v2 / rLoopRight : 0;
  let i3 = i1 + i2; // Hukum I Kirchhoff: I3 (keluar) = I1 (masuk) + I2 (masuk)

  // Koordinat Kawat
  let wireL = left + 80, wireR = right - 80;
  let wireT = top + 70, wireB = bottom - 70;

  // 1. Gambar Kawat Rangkaian (2 Loop Paralel)
  stroke(30, 41, 59); strokeWeight(4); noFill();
  rect(wireL, wireT, wireR - wireL, wireB - wireT, 12); // Loop Luar
  line(midX, wireT, midX, wireB);                       // Cabang Tengah

  // 2. Gambar Titik Cabang (Junction Node A dan B)
  fill(239, 68, 68); stroke(185, 28, 28); strokeWeight(2);
  ellipse(midX, wireT, 18, 18); // Titik Cabang Atas (Node A)
  ellipse(midX, wireB, 18, 18); // Titik Cabang Bawah (Node B)

  fill(15, 23, 42); noStroke(); textSize(12); textStyle(BOLD); textAlign(CENTER, BOTTOM);
  text("Titik Cabang A", midX, wireT - 20);
  textAlign(CENTER, TOP);
  text("Titik Cabang B", midX, wireB + 12);

  // 3. Simbol Komponen (Baterai & Resistor)
  drawBatteryIcon(wireL, (wireT + wireB) / 2, physics.v1);
  drawBatteryIcon(wireR, (wireT + wireB) / 2, physics.v2);
  drawResistorIcon((wireL + midX) / 2, wireT, physics.r1);
  drawResistorIcon((midX + wireR) / 2, wireT, physics.r2);
  drawResistorIcon(midX, (wireT + wireB) / 2, physics.rk1);

  // 4. Animasi Aliran Elektron di 3 Percabangan
  if (Math.abs(i1) > 0.01) {
    drawElectronBranch(wireL, (wireT + wireB) / 2, wireT, midX, wireT, i1, true);
  }
  if (Math.abs(i2) > 0.01) {
    drawElectronBranch(wireR, (wireT + wireB) / 2, wireT, midX, wireT, i2, false);
  }
  if (Math.abs(i3) > 0.01) {
    drawElectronBranch(midX, wireT, wireB, midX, wireB, i3, true);
  }

  // 5. Indikator Panah & Teks Hukum I Kirchhoff (I_masuk = I_keluar)
  drawArrowLabel(midX - 70, wireT - 5, "I₁ (Masuk) = " + i1.toFixed(2) + " A", true);
  drawArrowLabel(midX + 70, wireT - 5, "I₂ (Masuk) = " + i2.toFixed(2) + " A", false);
  drawArrowLabel(midX + 25, (wireT + wireB) / 2 - 50, "I₃ (Keluar) = " + i3.toFixed(2) + " A", true);

  pop();
}

// -------------------------------------------------------------------------
// HELPER ARUS & PANAH PERCABANGAN
// -------------------------------------------------------------------------
function drawElectronBranch(x1, y1, y2, x2, y3, current, isLeftToRight) {
  push();
  fill(56, 189, 248); noStroke();
  let speed = current * 2.0;
  let numDots = 8;

  for (let i = 0; i < numDots; i++) {
    let t = ((animOffset * speed * 0.02) + (i / numDots)) % 1;
    let px, py;
    if (x1 !== x2) {
      px = isLeftToRight ? lerp(x1, x2, t) : lerp(x1, x2, t);
      py = y2;
    } else {
      px = x1;
      py = lerp(y1, y3, t);
    }
    ellipse(px, py, 7, 7);
  }
  pop();
}

function drawArrowLabel(x, y, txt, isRight) {
  push();
  fill(15, 23, 42); stroke(255); strokeWeight(2);
  textSize(11); textStyle(BOLD); textAlign(CENTER, CENTER);
  rectMode(CENTER);
  rect(x, y, textWidth(txt) + 16, 22, 6);
  fill(255); noStroke();
  text(txt, x, y);
  pop();
}

function drawTabDayaListrik() {
  push();
  let app = appliances[physics.selectedAppliance];
  let P = physics.powerDeviceWatts;
  let hrs = physics.hoursPerDay;
  let kWhPerDay = (P * hrs) / 1000;
  let kWhPerMonth = kWhPerDay * 30;
  let co2KgPerDay = kWhPerDay * 0.85; 
  let co2KgPerYear = co2KgPerDay * 365;
  let costPerMonth = kWhPerMonth * 1444; 
  let treesNeeded = Math.ceil(co2KgPerYear / 22); 

  // Panel Kiri Pilihan Perangkat
  fill(255); stroke(203, 213, 225); strokeWeight(2);
  rect(20, 90, 310, 480, 16);

  fill(15, 23, 42); textAlign(LEFT, TOP); textSize(15); textStyle(BOLD);
  text("🏠 PERANGKAT RUMAH TANGGA:", 35, 110);

  let btnW = 52;
  let vm = getVirtualMouse();
  
  appliances.forEach((item, i) => {
    let bx = 35 + i * (btnW + 4);
    let by = 135;
    let isActive = (physics.selectedAppliance === i);

    fill(isActive ? color(16, 185, 129) : color(241, 245, 249));
    stroke(isActive ? color(5, 150, 105) : color(203, 213, 225));
    strokeWeight(2);
    rect(bx, by, btnW, 40, 10);

    textSize(18);
    textAlign(CENTER, CENTER);
    text(item.icon, bx + btnW / 2, by + 20);
  });

  fill(15, 23, 42); textAlign(LEFT, TOP); textSize(14); textStyle(BOLD);
  text(`Alat: ${app.name}`, 35, 190);
  textSize(12); textStyle(NORMAL); fill(71, 85, 105);
  text(`• ${app.desc}`, 35, 212);

  fill(240, 253, 250); stroke(20, 184, 166); strokeWeight(2);
  rect(35, 240, 280, 310, 14);

  fill(13, 148, 136); noStroke(); textSize(14); textStyle(BOLD); textAlign(LEFT, TOP);
  text("📊 METRIKS ENERGI & EMISI:", 48, 255);

  textSize(12.5); textStyle(BOLD); fill(15, 23, 42);
  text(`⚡ Daya (P):`, 48, 290);
  fill(225, 29, 72); textAlign(RIGHT, TOP);
  text(`${P.toFixed(0)} Watt`, 300, 290);

  textAlign(LEFT, TOP); fill(15, 23, 42);
  text(`⏱️ Pemakaian Harian:`, 48, 325);
  fill(225, 29, 72); textAlign(RIGHT, TOP);
  text(`${hrs.toFixed(1)} Jam/hari`, 300, 325);

  textAlign(LEFT, TOP); fill(15, 23, 42);
  text(`🔋 Konsumsi Energi:`, 48, 360);
  fill(16, 185, 129); textAlign(RIGHT, TOP);
  text(`${kWhPerDay.toFixed(2)} kWh/hari`, 300, 360);

  textAlign(LEFT, TOP); fill(15, 23, 42);
  text(`🌱 Emisi Karbon CO₂:`, 48, 395);
  fill(239, 68, 68); textAlign(RIGHT, TOP);
  text(`${co2KgPerDay.toFixed(2)} kg/hari`, 300, 395);

  textAlign(LEFT, TOP); fill(15, 23, 42);
  text(`💰 Estimasi Biaya/Bulan:`, 48, 430);
  fill(180, 83, 9); textAlign(RIGHT, TOP);
  text(`Rp ${Math.round(costPerMonth).toLocaleString('id-ID')}`, 300, 430);

  textAlign(LEFT, TOP); fill(15, 23, 42);
  text(`🌳 Pohon Penyeimbang:`, 48, 465);
  fill(5, 150, 105); textAlign(RIGHT, TOP);
  text(`~${treesNeeded} Pohon/tahun`, 300, 465);

  // Canvas Animasi Peralatan (Kanan)
  let left = 350, right = 1240, top = 90, bottom = 570;
  fill(255); stroke(14, 165, 233); strokeWeight(3);
  rect(left, top, right - left, bottom - top, 16);

  drawApplianceIllustration(physics.selectedAppliance, left + 260, (top + bottom) / 2, P, hrs);
  drawCarbonEmissionGauge(right - 200, top + 40, 160, 380, co2KgPerDay, treesNeeded);

  pop();
}

function drawApplianceIllustration(type, cx, cy, power, hours) {
  push();
  rectMode(CENTER);

  if (type === 0) { // LAMPU LED
    let lightBrightness = map(power, 10, 50, 100, 255);
    noStroke();
    fill(254, 240, 138, lightBrightness * 0.4);
    ellipse(cx, cy - 20, 240, 240);
    fill(251, 191, 36, lightBrightness * 0.7);
    ellipse(cx, cy - 20, 160, 160);

    fill(255, 255, 255, 230);
    stroke(245, 158, 11);
    strokeWeight(4);
    ellipse(cx, cy - 30, 110, 110);
    rect(cx, cy + 30, 60, 45, 6);

    fill(148, 163, 184); stroke(71, 85, 105); strokeWeight(2);
    rect(cx, cy + 60, 50, 20, 4);

    fill(15, 23, 42); noStroke(); textSize(15); textStyle(BOLD); textAlign(CENTER, TOP);
    text("LAMPU LED HEMAT ENERGI", cx, cy + 100);

  } else if (type === 1) { // SMART TV
    fill(71, 85, 105); stroke(30, 41, 59); strokeWeight(3);
    rect(cx, cy + 110, 140, 14, 4);
    rect(cx, cy + 90, 30, 30);

    fill(15, 23, 42); stroke(51, 65, 85); strokeWeight(5);
    rect(cx, cy - 10, 320, 180, 14);

    fill(14, 116, 144);
    rect(cx, cy - 10, 300, 160, 8);

    noFill(); stroke(56, 189, 248); strokeWeight(4);
    beginShape();
    Array.from({ length: 19 }).forEach((_, i) => {
      let x = -130 + i * 14.4;
      let y = sin((x + animOffset * 5) * 0.04) * 30;
      vertex(cx + x, cy - 10 + y);
    });
    endShape();

    fill(255); noStroke(); textSize(15); textStyle(BOLD); textAlign(CENTER, CENTER);
    text("SMART TV 43 INCH", cx, cy - 50);

  } else if (type === 2) { // KULKAS
    fill(226, 232, 240); stroke(71, 85, 105); strokeWeight(4);
    rect(cx, cy, 180, 280, 18);

    line(cx - 90, cy - 35, cx + 90, cy - 35);

    fill(148, 163, 184);
    rect(cx - 65, cy - 85, 12, 45, 4);
    rect(cx - 65, cy + 35, 12, 70, 4);

    fill(15, 23, 42); textSize(14); textStyle(BOLD); textAlign(CENTER, TOP);
    text("KULKAS INVERTER 2 PINTU", cx, cy + 155);

  } else if (type === 3) { // AC SPLIT
    fill(248, 250, 252); stroke(100, 116, 139); strokeWeight(4);
    rect(cx, cy - 20, 300, 110, 16);

    fill(34, 197, 94); noStroke();
    ellipse(cx + 120, cy - 45, 10, 10);

    fill(203, 213, 225); stroke(148, 163, 184); strokeWeight(2);
    rect(cx, cy + 20, 270, 16, 6);

    fill(15, 23, 42); noStroke(); textSize(14); textStyle(BOLD); textAlign(CENTER, TOP);
    text("AIR CONDITIONER (1 PK)", cx, cy + 110);

  } else if (type === 4) { // TEKO LISTRIK
    fill(218, 226, 236); stroke(71, 85, 105); strokeWeight(4);
    rect(cx, cy + 10, 150, 160, 24);

    fill(30, 41, 59); rect(cx, cy + 96, 180, 18, 6);

    fill(15, 23, 42); textSize(14); textStyle(BOLD); textAlign(CENTER, TOP);
    text("TEKO ELECTRIC KETTLE", cx, cy + 125);
  }

  pop();
}

function drawCarbonEmissionGauge(gx, gy, gw, gh, co2, trees) {
  push();
  fill(254, 242, 242); stroke(239, 68, 68); strokeWeight(2.5);
  rect(gx, gy, gw, gh, 16);

  fill(185, 28, 28); noStroke(); textSize(13); textStyle(BOLD); textAlign(CENTER, TOP);
  text("☁️ JEJAK KARBON", gx + gw / 2, gy + 14);

  let maxCo2 = 5.0; 
  let fillH = constrain(map(co2, 0, maxCo2, 0, 180), 8, 180);

  fill(226, 232, 240); stroke(203, 213, 225); strokeWeight(1.5);
  rect(gx + gw / 2 - 18, gy + 45, 36, 180, 18);

  fill(co2 > 2.5 ? color(239, 68, 68) : color(245, 158, 11)); noStroke();
  rect(gx + gw / 2 - 15, gy + 45 + (180 - fillH), 30, fillH, 15);

  fill(15, 23, 42); textSize(13); textStyle(BOLD); textAlign(CENTER, TOP);
  text(`${co2.toFixed(2)} kg`, gx + gw / 2, gy + 240);
  fill(100, 116, 139); textSize(11); textStyle(NORMAL);
  text("CO₂ / Hari", gx + gw / 2, gy + 260);

  let treeIcons = ["", "🌳", "🌳🌳", "🌳🌳🌳", "🌳🌳🌳🌳", "🌳🌳🌳🌳🌳"];
  let safeTreeCount = Math.max(0, Math.min(Math.floor(trees || 0), 5));
  fill(34, 197, 94); textSize(18);
  text(treeIcons[safeTreeCount], gx + gw / 2, gy + 290);
  textSize(11); fill(21, 128, 61); textStyle(BOLD);
  text(`${trees || 0} Pohon Penyeimbang`, gx + gw / 2, gy + 325);

  pop();
}

function drawBatteryIcon(x, y, v) {
  push();
  rectMode(CENTER);
  fill(30, 41, 59); stroke(203, 213, 225); strokeWeight(3);
  rect(x, y, 54, 86, 12);
  
  fill(239, 68, 68); rect(x, y - 48, 22, 10, 4);

  fill(255); noStroke(); textAlign(CENTER, CENTER); textSize(16); textStyle(BOLD);
  text("+", x, y - 24);
  text("-", x, y + 24);
  
  fill(251, 191, 36); textSize(14);
  text(`${v.toFixed(1)}V`, x, y);
  pop();
}

function drawResistorIcon(x, y, r) {
  push();
  rectMode(CENTER);
  fill(224, 231, 255); stroke(99, 102, 241); strokeWeight(3);
  rect(x, y, 90, 40, 8);

  strokeWeight(4);
  stroke(239, 68, 68); line(x - 25, y - 16, x - 25, y + 16);
  stroke(245, 158, 11); line(x - 6, y - 16, x - 6, y + 16);
  stroke(16, 185, 129); line(x + 14, y - 16, x + 14, y + 16);

  fill(15, 23, 42); noStroke(); textAlign(CENTER, CENTER); textSize(13); textStyle(BOLD);
  text(`${r.toFixed(1)} Ω`, x, y + 32);
  pop();
}

function drawLampuIcon(x, y, label, current, resistance) {
  push();
  let bulbBrightness = constrain(map(current, 0, 2.5, 50, 255), 50, 255);
  let glowSize = constrain(map(current, 0, 2.5, 30, 75), 30, 75);

  noStroke();
  fill(251, 191, 36, bulbBrightness * 0.35);
  ellipse(x, y, glowSize * 1.5);

  fill(254, 240, 138, bulbBrightness);
  stroke(245, 158, 11);
  strokeWeight(3);
  ellipse(x, y, 44, 44);

  fill(15, 23, 42); noStroke(); textAlign(CENTER, TOP); textSize(12); textStyle(BOLD);
  text(label, x, y + 28);

  fill(71, 85, 105); textSize(11); textStyle(NORMAL);
  text(`${current.toFixed(2)} A`, x, y + 44);
  pop();
}

function drawElectronFlow(left, right, top, bottom, current) {
  if (current <= 0.001) return;
  push();
  noStroke();
  fill(14, 165, 233);
  let speed = current * 3.0;
  let numDots = 16;

  let w = right - left;
  let h = bottom - top;
  let totalPerimeter = 2 * (w + h);

  if (totalPerimeter <= 0) {
    pop();
    return;
  }

  Array.from({ length: numDots }).forEach((_, i) => {
    let pos = (animOffset * speed + (i * totalPerimeter / numDots)) % totalPerimeter;
    let px = left, py = top;

    if (pos < w) {
      px = left + pos; py = top;
    } else if (pos < w + h) {
      px = right; py = top + (pos - w);
    } else if (pos < 2 * w + h) {
      px = right - (pos - (w + h)); py = bottom;
    } else {
      px = left; py = bottom - (pos - (2 * w + h));
    }

    ellipse(px, py, 9, 9);
  });
  pop();
}

function drawLiveReadingsFooter() {
  push();
  let vm = getVirtualMouse();

  fill(241, 245, 249); 
  stroke(203, 213, 225); 
  strokeWeight(2.5);
  rect(20, 585, VIRTUAL_W - 40, 120, 16);

  fill(15, 23, 42); 
  noStroke(); 
  textSize(14); 
  textStyle(BOLD); 
  textAlign(LEFT, TOP);
  text("🎛️ PANEL KONTROL VARIABEL SIMULASI", 35, 595);

  let label1 = "", valStr1 = "", min1 = 1, max1 = 24, val1 = 12;
  let label2 = "", valStr2 = "", min2 = 1, max2 = 50, val2 = 10;
  let label3 = "", valStr3 = "", min3 = 1, max3 = 50, val3 = 10;

  if (activeTab === 1) {
    label1 = "⚡ Tegangan (V)"; valStr1 = `${physics.voltage.toFixed(1)} Volt`; min1 = 1; max1 = 24; val1 = physics.voltage;
    label2 = "🔘 Hambatan (R)"; valStr2 = `${physics.resistance.toFixed(1)} Ω`; min2 = 1; max2 = 50; val2 = physics.resistance;
  } else if (activeTab === 2) {
    label1 = "📏 Panjang Kawat (L)"; valStr1 = `${physics.wireLength.toFixed(1)} m`; min1 = 5; max1 = 200; val1 = physics.wireLength;
    label2 = "📐 Luas Penampang (A)"; valStr2 = `${physics.wireArea.toFixed(1)} mm²`; min2 = 0.5; max2 = 10; val2 = physics.wireArea;
  } else if (activeTab === 3) {
    label1 = "⚡ Tegangan (V)"; valStr1 = `${physics.voltage.toFixed(1)} Volt`; min1 = 1; max1 = 24; val1 = physics.voltage;
    label2 = "🔘 Hambatan R1 & R2"; valStr2 = `${physics.r1.toFixed(1)} Ω`; min2 = 1; max2 = 50; val2 = physics.r1;
    label3 = "🔘 Hambatan R3"; valStr3 = `${physics.r3.toFixed(1)} Ω`; min3 = 1; max3 = 50; val3 = physics.r3;
  } else if (activeTab === 4) {
    label1 = "⚡ Tegangan V1"; valStr1 = `${physics.v1.toFixed(1)} Volt`; min1 = 1; max1 = 24; val1 = physics.v1;
    label2 = "⚡ Tegangan V2"; valStr2 = `${physics.v2.toFixed(1)} Volt`; min2 = 1; max2 = 24; val2 = physics.v2;
    label3 = "🔘 Hambatan Rk1"; valStr3 = `${physics.rk1.toFixed(1)} Ω`; min3 = 1; max3 = 50; val3 = physics.rk1;
  } else if (activeTab === 5) {
    label1 = "💡 Daya (P)"; valStr1 = `${physics.powerDeviceWatts.toFixed(0)} Watt`; min1 = 10; max1 = appliances[physics.selectedAppliance].maxWatts; val1 = physics.powerDeviceWatts;
    label2 = "⏱️ Pemakaian Harian"; valStr2 = `${physics.hoursPerDay.toFixed(1)} Jam`; min2 = 0.5; max2 = 24; val2 = physics.hoursPerDay;
  }

  // Render Custom Slider 1
  if (label1 !== "") {
    drawCustomSlider(35, 622, 270, label1, valStr1, val1, min1, max1, 'SLIDER1');
  }

  // Render Custom Slider 2
  if (label2 !== "") {
    drawCustomSlider(330, 622, 270, label2, valStr2, val2, min2, max2, 'SLIDER2');
  }

  // Render Custom Slider 3
  if (label3 !== "" && (activeTab === 3 || activeTab === 4)) {
    drawCustomSlider(625, 622, 270, label3, valStr3, val3, min3, max3, 'SLIDER3');
  }

  // Action Buttons: KUIS & REFLEKSI (Kanan Bawah)
  let kuisX = 920, kuisY = 625, kuisW = 155, kuisH = 58;
  let isKuisHover = vm.x > kuisX && vm.x < kuisX + kuisW && vm.y > kuisY && vm.y < kuisY + kuisH;
  fill(isKuisHover ? color(2, 132, 199) : color(14, 165, 233));
  stroke(255); strokeWeight(2);
  rect(kuisX, kuisY, kuisW, kuisH, 12);
  fill(255); noStroke(); textSize(13.5); textStyle(BOLD); textAlign(CENTER, CENTER);
  text("📋 KUIS\nINTERAKTIF", kuisX + kuisW / 2, kuisY + kuisH / 2);

  let refX = 1090, refY = 625, refW = 155, refH = 58;
  let isRefHover = vm.x > refX && vm.x < refX + refW && vm.y > refY && vm.y < refY + refH;
  fill(isRefHover ? color(5, 150, 105) : color(16, 185, 129));
  stroke(255); strokeWeight(2);
  rect(refX, refY, refW, refH, 12);
  fill(255); noStroke(); textSize(13.5); textStyle(BOLD); textAlign(CENTER, CENTER);
  text("🪞 REFLEKSI\nDIRI", refX + refW / 2, refY + refH / 2);

  pop();
}

function drawCustomSlider(x, y, w, title, valStr, val, minVal, maxVal, id) {
  push();
  fill(15, 23, 42); textSize(11.5); textStyle(BOLD); textAlign(LEFT, TOP);
  text(title, x, y);
  textAlign(RIGHT, TOP); fill(225, 29, 72);
  text(valStr, x + w, y);

  let trackY = y + 28;
  stroke(203, 213, 225); strokeWeight(8);
  line(x, trackY, x + w, trackY);

  let normVal = norm(val, minVal, maxVal);
  stroke(14, 165, 233);
  line(x, trackY, x + normVal * w, trackY);

  let handleX = x + normVal * w;
  fill(255); stroke(14, 165, 233); strokeWeight(3);
  ellipse(handleX, trackY, 20, 20);

  pop();
}

function updateSliderDrag() {
  let vm = getVirtualMouse();
  let minVal = 1, maxVal = 50;

  if (draggingSlider === 'SLIDER1') {
    if (activeTab === 1 || activeTab === 3) { minVal = 1; maxVal = 24; physics.voltage = constrain(map(vm.x, 35, 305, minVal, maxVal), minVal, maxVal); }
    else if (activeTab === 2) { minVal = 5; maxVal = 200; physics.wireLength = constrain(map(vm.x, 35, 305, minVal, maxVal), minVal, maxVal); }
    else if (activeTab === 4) { minVal = 1; maxVal = 24; physics.v1 = constrain(map(vm.x, 35, 305, minVal, maxVal), minVal, maxVal); }
    else if (activeTab === 5) { minVal = 10; maxVal = appliances[physics.selectedAppliance].maxWatts; physics.powerDeviceWatts = constrain(map(vm.x, 35, 305, minVal, maxVal), minVal, maxVal); }
  }
  else if (draggingSlider === 'SLIDER2') {
    if (activeTab === 1) { minVal = 1; maxVal = 50; physics.resistance = constrain(map(vm.x, 330, 600, minVal, maxVal), minVal, maxVal); }
    else if (activeTab === 2) { minVal = 0.5; maxVal = 10; physics.wireArea = constrain(map(vm.x, 330, 600, minVal, maxVal), minVal, maxVal); }
    else if (activeTab === 3) { minVal = 1; maxVal = 50; physics.r1 = constrain(map(vm.x, 330, 600, minVal, maxVal), minVal, maxVal); physics.r2 = physics.r1; }
    else if (activeTab === 4) { minVal = 1; maxVal = 24; physics.v2 = constrain(map(vm.x, 330, 600, minVal, maxVal), minVal, maxVal); }
    else if (activeTab === 5) { minVal = 0.5; maxVal = 24; physics.hoursPerDay = constrain(map(vm.x, 330, 600, minVal, maxVal), minVal, maxVal); }
  }
  else if (draggingSlider === 'SLIDER3') {
    if (activeTab === 3) { minVal = 1; maxVal = 50; physics.r3 = constrain(map(vm.x, 625, 895, minVal, maxVal), minVal, maxVal); }
    else if (activeTab === 4) { minVal = 1; maxVal = 50; physics.rk1 = constrain(map(vm.x, 625, 895, minVal, maxVal), minVal, maxVal); }
  }
}

function drawKUISModal() {
  push();
  fill(15, 23, 42, 200); 
  rect(0, 0, VIRTUAL_W, VIRTUAL_H);

  fill(255); 
  stroke(14, 165, 233); 
  strokeWeight(3);
  rect(60, 40, VIRTUAL_W - 120, VIRTUAL_H - 80, 24);

  fill(224, 242, 254); 
  noStroke();
  rect(60, 40, VIRTUAL_W - 120, 56, 24, 24, 0, 0);
  fill(3, 105, 161); 
  textSize(18); 
  textStyle(BOLD); 
  textAlign(CENTER, CENTER);
  text("📋 KUIS INTERAKTIF - LISTRIK ARUS SEARAH", VIRTUAL_W / 2, 68);

  fill(244, 63, 94); 
  ellipse(VIRTUAL_W - 100, 68, 34, 34);
  fill(255); 
  textSize(16); 
  textAlign(CENTER, CENTER);
  text("✕", VIRTUAL_W - 100, 68);

  let tabW = 160, startX = 90;
  
  [0, 1, 2, 3, 4].forEach(q => {
    let qx = startX + q * (tabW + 12);
    let qy = 115;
    let isActive = (activeKuisQuestion === q);
    let isAnswered = (KuisAnswers[q] !== -1);

    fill(isActive ? color(14, 165, 233) : (isAnswered ? color(220, 252, 231) : color(241, 245, 249)));
    stroke(isActive ? color(3, 105, 161) : (isAnswered ? color(34, 197, 94) : color(203, 213, 225)));
    strokeWeight(2);
    rect(qx, qy, tabW, 36, 10);
    fill(isActive ? 255 : (isAnswered ? color(21, 128, 61) : 50));
    noStroke(); textSize(13); textStyle(BOLD); textAlign(CENTER, CENTER);
    text(`Soal ${q + 1} ${isAnswered ? "✓" : ""}`, qx + tabW / 2, qy + 18);
  });

  let currQ = KuisQuestions[activeKuisQuestion];
  fill(15, 23, 42); textSize(16); textStyle(BOLD); textAlign(LEFT, TOP);
  text(currQ.title, 90, 170);

  fill(51, 65, 85); textSize(14); textStyle(NORMAL);
  text(currQ.question, 90, 198, VIRTUAL_W - 180, 50);

  let userChoice = KuisAnswers[activeKuisQuestion];
  
  currQ.options.forEach((opt, o) => {
    let ox = 90;
    let oy = 260 + o * 50;
    let ow = VIRTUAL_W - 180;
    let oh = 42;

    let isSelected = (userChoice === o);
    let isCorrectOption = (o === currQ.correct);

    if (userChoice !== -1) {
      if (isSelected && isCorrectOption) {
        fill(220, 252, 231); stroke(34, 197, 94); strokeWeight(2.5);
      } else if (isSelected && !isCorrectOption) {
        fill(254, 226, 226); stroke(239, 68, 68); strokeWeight(2.5);
      } else {
        fill(248, 250, 252); stroke(226, 232, 240); strokeWeight(1.5);
      }
    } else {
      fill(241, 245, 249);
      stroke(203, 213, 225);
      strokeWeight(1.5);
    }

    rect(ox, oy, ow, oh, 10);

    fill(15, 23, 42); noStroke(); textSize(13.5); textStyle(NORMAL); textAlign(LEFT, CENTER);
    let prefix = String.fromCharCode(65 + o) + ". ";
    text(prefix + opt, ox + 20, oy + oh / 2);
  });

  if (userChoice !== -1) {
    let isWin = (userChoice === currQ.correct);
    fill(isWin ? color(240, 253, 244) : color(254, 242, 242));
    stroke(isWin ? color(34, 197, 94) : color(239, 68, 68));
    strokeWeight(2);
    rect(90, 475, VIRTUAL_W - 180, 95, 12);

    fill(isWin ? color(21, 128, 61) : color(185, 28, 28));
    noStroke(); textSize(14); textStyle(BOLD); textAlign(LEFT, TOP);
    text(isWin ? "✅ JAWABAN BENAR!" : "❌ KURANG TEPAT", 110, 488);

    fill(30, 41, 59); textSize(12.5); textStyle(NORMAL);
    text(currQ.explanation, 110, 515, VIRTUAL_W - 220, 50);
  }

  let correctCount = 0;
  [0, 1, 2, 3, 4].forEach(a => {
    if (KuisAnswers[a] === KuisQuestions[a].correct) correctCount++;
  });
  fill(15, 23, 42); textSize(14); textStyle(BOLD); textAlign(LEFT, CENTER);
  text(`📊 Skor Anda: ${correctCount * 20} / 100 (${correctCount} dari 5 soal benar)`, 90, 598);

  pop();
}

// =========================================================================
// 1. INISIALISASI VARIABEL PERSISTEN (Wajib di luar fungsi / Global Scope)
// =========================================================================
if (window.activeApersepsiTab === undefined) { window.activeApersepsiTab = 0; }
if (window.lastMousePressedInApersepsi === undefined) { window.lastMousePressedInApersepsi = false; }
if (window.chargeX === undefined) { window.chargeX = 0; }
if (window.bulbState === undefined) { window.bulbState = true; }
if (window.lastBulbClick === undefined) { window.lastBulbClick = false; }

// =========================================================================
// 2. FUNGSI UTAMA MODAL APERSEPSI
// =========================================================================
function drawApersepsiModal() {
  push();
  
  // Data Tab Menu Utama
  let tabs = [
    "🔗 Jembatan Konsep", 
    "🔥 Tantangan Berpikir", 
    "🎯 Target & Urgensi"   
  ];
  
  // --- 1. Overlay Latar Belakang (Gelap Transparan) ---
  fill(15, 23, 42, 225);
  noStroke();
  rect(0, 0, VIRTUAL_W, VIRTUAL_H);

  // --- 2. Kotak Modal Utama ---
  fill(255);
  stroke(245, 158, 11);
  strokeWeight(3);
  rect(100, 60, VIRTUAL_W - 200, VIRTUAL_H - 120, 24);

  // --- 3. Header Modal ---
  fill(254, 243, 199);
  noStroke();
  rect(100, 60, VIRTUAL_W - 200, 60, 24, 24, 0, 0);
  
  fill(180, 83, 9);
  textSize(18);
  textStyle(BOLD);
  textAlign(LEFT, CENTER);
  text("💡 JENDELA APERSEPSI: SEBELUM KITA MEMULAI LAB", 140, 90);

  // --- 4. Tombol Close (✕) Interaktif ---
  let closeX = VIRTUAL_W - 140;
  let closeY = 90;
  let isHoverClose = dist(mouseX, mouseY, closeX, closeY) < 17;
  
  if (isHoverClose) {
    fill(225, 29, 72);
  } else {
    fill(244, 63, 94);
  }
  noStroke();
  ellipse(closeX, closeY, 34, 34);
  
  fill(255);
  textSize(16);
  textAlign(CENTER, CENTER);
  text("✕", closeX, closeY);

  if (mouseIsPressed && !window.lastMousePressedInApersepsi && isHoverClose) {
    if (typeof showApersepsi !== 'undefined') { showApersepsi = false; }
  }

  // --- 5. Sidebar Menu Tab Kiri ---
  let sidebarW = 200;
  let startTabY = 150;
  let tabH = 50;
  let gap = 12;

  for (let i = 0; i < tabs.length; i++) {
    let tabY = startTabY + (i * (tabH + gap));
    let isHoverTab = mouseX > 130 && mouseX < 130 + sidebarW && mouseY > tabY && mouseY < tabY + tabH;
    
    if (window.activeApersepsiTab === i) {
      fill(245, 158, 11); 
      stroke(245, 158, 11);
    } else if (isHoverTab) {
      fill(254, 243, 199); 
      stroke(245, 158, 11);
    } else {
      fill(248, 250, 252); 
      stroke(226, 232, 240);
    }
    strokeWeight(1.5);
    rect(130, tabY, sidebarW, tabH, 12);
    
    noStroke();
    if (window.activeApersepsiTab === i) {
      fill(255);
    } else {
      fill(71, 85, 105);
    }
    textSize(14);
    textStyle(window.activeApersepsiTab === i ? BOLD : NORMAL);
    textAlign(LEFT, CENTER);
    text("  " + tabs[i], 135, tabY + tabH / 2);

    if (mouseIsPressed && !window.lastMousePressedInApersepsi && isHoverTab) {
      window.activeApersepsiTab = i;
    }
  }

  // --- 6. Area Konten Dinamis Kanan ---
  let textX = 130 + sidebarW + 30;
  let contentY = 155;
  let textW = (VIRTUAL_W - textX - 140) * 0.55; 
  let imgX = textX + textW + 30;                 
  let imgW = (VIRTUAL_W - textX - 140) * 0.40;

  fill(15, 23, 42);
  textAlign(LEFT, TOP);

  // ==========================================
  // TAB 1: PENGAITAN KONSEP & DUNIA NYATA
  // ==========================================
  if (window.activeApersepsiTab === 0) {
    textSize(18); textStyle(BOLD); fill(180, 83, 9);
    text("🔗 Mengaitkan Konsep & Dunia Nyata", textX, contentY);
    
    textSize(13); textStyle(NORMAL); fill(15, 23, 42);
    let txt1 = "\n🔄 Ingat Elektrostatika?\n" +
      "Muatan listrik yang kemarin diam, sekarang di Listrik DC akan MENGALIR karena ada beda potensial (Tegangan) dari baterai.\n\n" +
      "🔌 Analogi Kabel Fast Charging:\n" +
      "Mengapa kabel charger HP yang bagus itu tebal? Menurut rumus R = ρ·L/A, luas penampang (A) yang besar membuat hambatan (R) menjadi kecil. Hambatan kecil membuat arus listrik mengalir deras sehingga baterai HP lebih cepat penuh!";
    text(txt1, textX, contentY + 20, textW);

    // --- ILUSTRASI TAB 1 ---
    push();
    stroke(100); strokeWeight(2); fill(240);
    rect(imgX, contentY + 60, imgW, 40, 5); 
    rect(imgX, contentY + 140, imgW, 15, 3); 
    
    window.chargeX = (window.chargeX + 2) % imgW;
    fill(245, 158, 11); noStroke();
    
    ellipse(imgX + window.chargeX, contentY + 70, 8, 8);
    ellipse(imgX + ((window.chargeX + imgW/3) % imgW), contentY + 80, 8, 8);
    ellipse(imgX + ((window.chargeX + 2*imgW/3) % imgW), contentY + 90, 8, 8);
    
    ellipse(imgX + (window.chargeX * 0.6) % imgW, contentY + 147.5, 6, 6);
    
    fill(71, 85, 105); textSize(11); textStyle(BOLD);
    text("Kabel Tebal (A Besar = Hambatan Kecil = Arus Deras)", imgX, contentY + 38);
    text("Kabel Tipis (A Kecil = Hambatan Besar = Arus Terhambat)", imgX, contentY + 120);
    pop();
  } 
  
  // ==========================================
  // TAB 2: PEMANCING PERHATIAN / STIMULUS (HOTS)
  // ==========================================
  else if (window.activeApersepsiTab === 1) {
    textSize(18); textStyle(BOLD); fill(180, 83, 9);
    text("🔥 Teka-Teki & Stimulus Berpikir", textX, contentY);
    
    textSize(13); textStyle(NORMAL); fill(15, 23, 42);
    let txt2 = "\n🤔 Masalah Lampu Kamar:\n" +
      "Jika kamu merangkai lampu hias secara SERI, saat ada SATU lampu saja yang putus, maka SELURUH lampu lain akan ikut mati total! Mengapa hal itu bisa terjadi?\n\n" +
      "Berbeda dengan rangkaian PARALEL, jika satu lampu mati, lampu di cabang lain tetap menyala terang.\n\n" +
      "👇 KLIK SAKELAR pada ilustrasi kanan untuk memutus jalur rangkaian Seri dan lihat dampaknya secara langsung!";
    text(txt2, textX, contentY + 20, textW);

    // --- ILUSTRASI TAB 2 ---
    push();
    let circuitY = contentY + 70;
    
    fill(220, 38, 38); rect(imgX, circuitY, 30, 20, 3);
    fill(15, 23, 42); rect(imgX + 30, circuitY + 5, 5, 10);
    
    stroke(51); strokeWeight(2); noFill();
    line(imgX + 35, circuitY + 10, imgX + 60, circuitY + 10);
    
    let swX = imgX + 60; let swY = circuitY + 10;
    let isHoverSwitch = mouseX > swX - 10 && mouseX < swX + 30 && mouseY > swY - 20 && mouseY < swY + 20;
    
    if (mouseIsPressed && !window.lastBulbClick && isHoverSwitch) {
      window.bulbState = !window.bulbState; 
      window.lastBulbClick = true;
    }
    if (!mouseIsPressed) { window.lastBulbClick = false; }

    if (window.bulbState) {
      line(swX, swY, swX + 20, swY); 
    } else {
      line(swX, swY, swX + 15, swY - 15); 
    }
    
    line(swX + 20, swY, imgX + imgW - 40, swY);
    line(imgX + imgW - 40, swY, imgX + imgW - 40, swY + 80);
    line(imgX, circuitY + 10, imgX, swY + 80);
    line(imgX, swY + 80, imgX + imgW - 40, swY + 80);

    let bulb1X = imgX + 100;
    let bulb2X = imgX + 160;
    let bulbY = swY + 80;
    
    stroke(0);
    if (window.bulbState) {
      fill(253, 224, 71); 
    } else {
      fill(203, 213, 225); 
    }
    ellipse(bulb1X, bulbY, 24, 24);
    ellipse(bulb2X, bulbY, 24, 24);
    
    noStroke(); 
    if (window.bulbState) {
      fill(180, 83, 9);
      text("💡 NYALA", bulb1X, bulbY + 25);
      text("💡 NYALA", bulb2X, bulbY + 25);
    } else {
      fill(71, 85, 105);
      text("⚫ MATI", bulb1X, bulbY + 25);
      text("⚫ MATI", bulb2X, bulbY + 25);
    }
    
    fill(225, 29, 72); textStyle(BOLD); textAlign(LEFT);
    text(window.bulbState ? "[ Klik Sakelar untuk Memutus ]" : "[ Klik Sakelar untuk Menyambung ]", imgX, circuitY - 25);
    pop();
  } 
  
  // ==========================================
  // TAB 3: PENYAMPAIAN MANFAAT & TUJUAN
  // ==========================================
  else if (window.activeApersepsiTab === 2) {
    textSize(18); textStyle(BOLD); fill(180, 83, 9);
    text("🎯 Mengapa Ini Penting Bagi Kita?", textX, contentY);
    
    textSize(13); textStyle(NORMAL); fill(15, 23, 42);
    let txt3 = "\n🌱 Urgensi Lingkungan (Daya & Energi):\n" +
      "Setiap peralatan elektronik menghabiskan daya listrik (P = V·I). Mengosongkan daya baterai atau menyalakan alat secara berlebihan berarti memaksa pembangkit listrik membakar lebih banyak batubara, menghasilkan emisi karbon berbahaya.\n\n" +
      "🚀 Target Belajarmu Hari Ini:\n" +
      "• Memahami kaitan arus, hambatan, dan tegangan.\n" +
      "• Mampu merancang konfigurasi seri & paralel.\n" +
      "• Membuktikan Hukum Kirchhoff secara valid.";
    text(txt3, textX, contentY + 20, textW);

    // --- ILUSTRASI TAB 3 ---
    push();
    let chartBaseY = contentY + 160;
    
    stroke(51); strokeWeight(2);
    line(imgX, chartBaseY, imgX + imgW - 20, chartBaseY); 
    line(imgX, chartBaseY, imgX, chartBaseY - 100);       
    
    noStroke(); fill(239, 68, 68);
    rect(imgX + 25, chartBaseY - 85, 35, 85);
    
    fill(34, 197, 94);
    rect(imgX + imgW - 75, chartBaseY - 30, 35, 30);
    
    fill(15, 23, 42); textSize(10); textStyle(BOLD); textAlign(CENTER);
    text("Boros", imgX + 42, chartBaseY + 15);
    text("Hemat", imgX + imgW - 57, chartBaseY + 15);
    
    fill(220, 38, 38); text("CO₂ Tinggi 🏭", imgX + 42, chartBaseY - 95);
    fill(22, 163, 74); text("Hijau 🌱", imgX + imgW - 57, chartBaseY - 40);
    
    textAlign(LEFT); fill(71, 85, 105); textSize(11);
    text("Grafik Dampak Emisi Karbon (CO₂)", imgX, chartBaseY - 120);
    pop();
  }

  // Menyimpan status klik untuk validasi debounce klik frame berikutnya
  window.lastMousePressedInApersepsi = mouseIsPressed;
  pop();
}

function drawRefleksiModal() {
  push();
  fill(15, 23, 42, 200); rect(0, 0, VIRTUAL_W, VIRTUAL_H);
  fill(255); stroke(16, 185, 129); strokeWeight(3);
  rect(100, 60, VIRTUAL_W - 200, VIRTUAL_H - 120, 24);

  fill(220, 252, 231); noStroke();
  rect(100, 60, VIRTUAL_W - 200, 60, 24, 24, 0, 0);
  fill(21, 128, 61); textSize(18); textStyle(BOLD); textAlign(CENTER, CENTER);
  text("🪞 REFLEKSI DIRI & PEMAHAMAN KONSEP", VIRTUAL_W / 2, 90);

  fill(244, 63, 94); ellipse(VIRTUAL_W - 140, 90, 34, 34);
  fill(255); textSize(16); text("✕", VIRTUAL_W - 140, 90);

  fill(15, 23, 42); textAlign(CENTER, TOP); textSize(16); textStyle(BOLD);
  text("Seberapa baik pemahaman Anda terhadap konsep simulasi ini?", VIRTUAL_W / 2, 150);

  [1, 2, 3, 4, 5].forEach(s => {
    let sx = VIRTUAL_W / 2 - 160 + (s - 1) * 80;
    let sy = 190;
    fill(s <= refleksiRating ? color(245, 158, 11) : color(203, 213, 225));
    noStroke();
    textSize(40);
    text("★", sx, sy);
  });

  fill(51, 65, 85); textAlign(LEFT, TOP); textSize(14); textStyle(NORMAL);
  text("Catatan Pemahaman & Kesimpulan:", 140, 260);

  fill(248, 250, 252); stroke(203, 213, 225); strokeWeight(2);
  rect(140, 290, VIRTUAL_W - 280, 180, 14);

  fill(15, 23, 42); noStroke(); textSize(14); textStyle(NORMAL);
  text(refleksiNotes, 160, 310, VIRTUAL_W - 320, 140);

  pop();
}

function mousePressed() {
  let vm = getVirtualMouse();

  if (currentScreen === 'HOME') {
    let btnX = VIRTUAL_W / 2 - 200, btnY = 560;
    if (vm.x > btnX && vm.x < btnX + 400 && vm.y > btnY && vm.y < btnY + 75) {
      currentScreen = 'LAB';
    }
  } 
  else if (currentScreen === 'LAB') {
    if (activeModal !== null) {
      let closeX = (activeModal === 'KUIS') ? VIRTUAL_W - 100 : VIRTUAL_W - 140;
      let closeY = (activeModal === 'KUIS') ? 68 : 90;
      if (dist(vm.x, vm.y, closeX, closeY) < 25) {
        activeModal = null;
        return;
      }

      if (activeModal === 'KUIS') {
        let tabW = 160, startX = 90;
        [0, 1, 2, 3, 4].forEach(q => {
          let qx = startX + q * (tabW + 12);
          if (vm.x > qx && vm.x < qx + tabW && vm.y > 115 && vm.y < 151) {
            activeKuisQuestion = q;
          }
        });

        [0, 1, 2, 3].forEach(o => {
          let ox = 90, oy = 260 + o * 50, ow = VIRTUAL_W - 180, oh = 42;
          if (vm.x > ox && vm.x < ox + ow && vm.y > oy && vm.y < oy + oh) {
            KuisAnswers[activeKuisQuestion] = o;
          }
        });
      }

      if (activeModal === 'REFLEKSI') {
        [1, 2, 3, 4, 5].forEach(s => {
          let sx = VIRTUAL_W / 2 - 160 + (s - 1) * 80, sy = 190;
          if (dist(vm.x, vm.y, sx, sy) < 25) {
            refleksiRating = s;
          }
        });
      }
      return;
    }

    // --- TOP NAVIGATION (PERBAIKAN KOORDINAT KLIK) ---
    
    // 1. Tombol HOME (X: 30 - 130)
    if (vm.x > 30 && vm.x < 130 && vm.y > 24 && vm.y < 68) {
      currentScreen = 'HOME';
      return;
    }

    // 2. Tombol APERSEPSI (Posisi Baru di Sebelah Kiri, X: 142 - 269)
    if (vm.x > 142 && vm.x < 269 && vm.y > 24 && vm.y < 68) {
      activeModal = 'APERSEPSI';
      return;
    }

    // 3. Tab MATERI (Posisi Baru Geser ke Kanan, StartX = 280)
    let startX = 280, tabW = 188;
    [0, 1, 2, 3, 4].forEach(i => {
      let tx = startX + i * (tabW + 6);
      if (vm.x > tx && vm.x < tx + tabW && vm.y > 24 && vm.y < 68) {
        activeTab = i + 1; // Pindah tab 1, 2, 3, 4, atau 5
      }
    });

    // --- BOTTOM ACTION BUTTONS ---
    if (vm.x > 920 && vm.x < 1075 && vm.y > 625 && vm.y < 683) {
      activeModal = 'KUIS';
      return;
    }
    if (vm.x > 1090 && vm.x < 1245 && vm.y > 625 && vm.y < 683) {
      activeModal = 'REFLEKSI';
      return;
    }

    // Tab 2: Material Selectors & Micro View Toggle
    if (activeTab === 2) {
      if (vm.y > 235 && vm.y < 267) {
        let bw = 64;
        materials.forEach((mItem, m) => {
          let bx = 35 + m * (bw + 6);
          if (vm.x > bx && vm.x < bx + bw) {
            physics.materialIndex = m;
          }
        });
      }
      if (vm.x > 35 && vm.x < 315 && vm.y > 445 && vm.y < 483) {
        physics.showMicroView = !physics.showMicroView;
      }
    }

    // Tab 3: Circuit Type Mode Selectors
    if (activeTab === 3 && vm.y > 90 && vm.y < 126) {
      let modes = ['SERI', 'PARALEL', 'GABUNGAN'];
      let btnW = 95;
      modes.forEach((mode, m) => {
        let mx = 20 + m * (btnW + 8);
        if (vm.x > mx && vm.x < mx + btnW) {
          physics.circuitType = mode;
        }
      });
    }

    // Tab 5: Appliances Selectors
    if (activeTab === 5 && vm.y > 135 && vm.y < 175) {
      let btnW = 52;
      appliances.forEach((app, i) => {
        let bx = 35 + i * (btnW + 4);
        if (vm.x > bx && vm.x < bx + btnW) {
          physics.selectedAppliance = i;
          physics.powerDeviceWatts = app.defaultWatts;
        }
      });
    }

    // Slider Press Detection
    if (vm.y > 610 && vm.y < 650) {
      if (vm.x > 35 && vm.x < 305) draggingSlider = 'SLIDER1';
      else if (vm.x > 330 && vm.x < 600) draggingSlider = 'SLIDER2';
      else if (vm.x > 625 && vm.x < 895) draggingSlider = 'SLIDER3';
    }
  }
}

function mouseReleased() {
  draggingSlider = null;
}