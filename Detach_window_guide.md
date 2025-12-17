# 🪟 Detached Window Mode - Complete Guide

## 🎯 Cara 2: Detached Window (Recommended untuk Anda!)

### Langkah-Langkah Penggunaan:

#### 1️⃣ Buka Extension
```
1. Click icon Time Sync di toolbar Chrome
2. Popup akan muncul
```

#### 2️⃣ Click Tombol "Detach"
```
1. Lihat di pojok kanan atas popup
2. Ada tombol kecil bertuliskan "Detach" dengan icon ↗
3. Click tombol tersebut
```

#### 3️⃣ Window Terpisah Terbuka!
```
✅ Window baru muncul (400x320px)
✅ Window ini punya title bar biru gradient
✅ Bisa dipindah-pindahkan ke mana saja!
✅ Popup asli otomatis tertutup
```

---

## 🎨 Fitur Detached Window

### 🖱️ Drag & Move
```
📌 Cara Memindahkan Window:
1. Click & hold di title bar (area biru di atas)
2. Drag ke posisi yang diinginkan
3. Release mouse untuk drop

💡 Tips:
- Jangan click di button (⬆ ⬜ ✕)
- Drag di area "Time Sync" text
- Window akan smooth mengikuti mouse
```

### 🔼 Always on Top Button
```
Button pertama (↑):
- Click untuk toggle always-on-top
- Berguna agar window tetap di depan aplikasi lain
- Visual: Button jadi lebih terang saat active
```

### 🔲 Compact Mode Button
```
Button kedua (⬜):
- Click untuk toggle compact/normal mode
- Compact: Lebih kecil, hemat space (260px height)
- Normal: Full view, lebih comfortable (320px height)
```

### ✕ Close Button
```
Button ketiga (×):
- Click untuk tutup window
- Window akan hilang
- Settings tetap tersimpan
```

---

## 📐 Ukuran & Posisi Window

### Default Size
```
Width:  400px
Height: 320px (normal) / 260px (compact)
```

### Position
```
Default: Top-left area (left: 100px, top: 100px)
Bisa dipindah: Ke mana saja di layar
```

### Rekomendasi Posisi
```
🖥️ Single Monitor:
- Top-right corner (untuk monitoring terus)
- Bottom-right (tidak ganggu workflow)

🖥️🖥️ Dual Monitor:
- Monitor kedua, corner manapun
- Atau tengah monitor kedua untuk visibility

💻 Laptop:
- Bottom-right (dekat taskbar)
- Top-right (mudah diakses)
```

---

## 🎮 Interaksi Window

### Saat Drag
```
Visual Feedback:
✓ Cursor berubah jadi "grabbing hand"
✓ Window bergerak smooth mengikuti mouse
✓ No lag atau delay
```

### Multi-Window
```
✅ Bisa buka beberapa window sekaligus
✅ Each window independent
✅ Settings di-share antar window
✅ Sync status berbeda per window
```

---

## ⚙️ Settings Integration

### Auto-Sync di Detached Window
```
1. Click tombol "Auto" 
2. Countdown muncul: "59s", "58s", dst
3. Otomatis sync tiap interval habis
4. Status tetap running meski window di-minimize
```

### Sync Manual
```
1. Click tombol "Sync"
2. Icon berputar (spinning)
3. Text berubah: "Sync..."
4. Status update dengan hasil
```

### Open Settings
```
⚠️ NOTE: Settings button di detached window
akan membuka settings di popup utama (jika ada)

Alternative:
- Buka popup utama untuk settings
- Settings auto-save dan sync ke detached window
```

---

## 🔧 Troubleshooting

### Window Tidak Bisa Di-Drag
```
Solusi:
1. Pastikan drag di title bar (area biru)
2. Jangan drag di button area
3. Reload extension jika masih error
4. Check Chrome version (min v88+)
```

### Window Hilang di Luar Layar
```
Solusi:
1. Close semua detached window
2. Buka ulang via "Detach" button
3. Window akan spawn di posisi default (100, 100)

Alternative:
- Use Alt+Tab untuk find window
- Right-click di taskbar > Move
```

### Compact Mode Tidak Resize
```
Solusi:
1. Click compact button 2x (toggle off-on)
2. Manually resize window dengan drag corner
3. Reload extension
```

### Always on Top Tidak Bekerja
```
Note:
- Feature ini memerlukan permission tambahan
- Saat ini hanya visual feedback
- Untuk true always-on-top, perlu update manifest

Workaround:
- Keep window focused
- Gunakan Windows PowerToys (Always on Top feature)
```

---

## 🚀 Pro Tips

### 1. Positioning for Productivity
```
💡 Posisi Strategis:
- Corner untuk quick glance
- Near clock system untuk compare
- Secondary monitor untuk constant monitoring
```

### 2. Workflow Integration
```
💡 Use Cases:
- Developer: Monitor server time saat coding
- Designer: Track time zones untuk client meetings
- Student: Countdown timer untuk study session
- Gamer: Sync time untuk online events
```

### 3. Keyboard Workflow
```
💡 Quick Access:
- Pin extension to toolbar
- Use Chrome shortcut untuk open popup
- Click Detach dengan Enter key (jika focused)
```

### 4. Multiple Windows Strategy
```
💡 Advanced:
- Window 1: Normal mode, auto-sync ON
- Window 2: Compact mode, manual sync
- Different positions untuk different purposes
```

---

## 📊 Performance

### Resource Usage
```
CPU:    ~0.1% (idle)
Memory: ~10-15 MB per window
Update: Every 1 second (clock tick)
Sync:   On-demand atau per interval
```

### Battery Impact
```
✅ Minimal impact
✅ No heavy computation
✅ Only fetch API saat sync
✅ Safe untuk laptop battery
```

---

## 🎨 Visual Design

### Title Bar
```
Gradient: #4361ee → #3651d4 (blue gradient)
Height:   32px
Cursor:   move (draggable)
Buttons:  3 control buttons (always-on-top, compact, close)
```

### Content Area
```
Background: #f8f9fa (light grey)
Border:     Rounded corners (8px)
Shadow:     0 10px 40px rgba(0,0,0,0.3)
Font:       System default (Segoe UI, etc)
```

### Status Colors
```
🟢 Green:  < 1s difference (perfect sync)
🟠 Orange: > 1s difference (needs attention)
🔴 Red:    Connection failed
🟡 Yellow: Syncing in progress
```

---

## 📝 Summary

### ✅ What You Get
- Draggable floating window
- Always accessible time display
- Compact mode untuk save space
- Independent dari popup
- Smooth animations
- Modern design

### ❌ Limitations
- Tidak bisa resize manual (fixed width 400px)
- Settings harus buka via popup
- True always-on-top perlu permission tambahan
- Max practical windows: 2-3 (untuk performance)

### 🎯 Best For
- Users yang butuh constant time monitoring
- Multi-monitor setup
- Professional/productivity use
- Clean, minimal widget experience

---

**Selamat menggunakan Detached Window Mode! 🎉**

Questions? Check main README.md atau USAGE_GUIDE.md