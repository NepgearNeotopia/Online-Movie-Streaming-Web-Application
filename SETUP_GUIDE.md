# คู่มือการติดตั้งและใช้งาน (สำหรับ Windows)

คู่มือนี้สำหรับผู้ที่ดาวน์โหลดโปรเจกต์ **Online Movie Streaming Web Application** จาก GitHub แล้วต้องการติดตั้งและเปิดใช้งานบนเครื่องคอมพิวเตอร์ Windows ของตนเอง

โปรเจกต์นี้ประกอบด้วย:
- **Frontend:** React + Vite (เปิดที่ `http://localhost:5173`)
- **Backend:** Node.js + Express (เปิดที่ `http://localhost:5000`)
- **Database:** MySQL หรือ MariaDB ที่มาพร้อม XAMPP

> หมายเหตุ: ระบบรองรับเฉพาะการดูหนังรายเรื่อง ไม่รองรับซีรีส์หลายตอน และไม่มีข้อมูลตัวอย่างมาให้ ผู้ใช้ต้องสร้างหนังเองผ่านหน้า Admin

---

## 1. โปรแกรมที่ต้องติดตั้งก่อน

| โปรแกรม | เวอร์ชันที่แนะนำ | วิธีตรวจสอบ |
| --- | --- | --- |
| Node.js | 18 ขึ้นไป (แนะนำ 20/22/24) | เปิด PowerShell พิมพ์ `node -v` |
| npm | มาพร้อม Node.js | พิมพ์ `npm -v` |
| XAMPP (ต้องมี MySQL/MariaDB) | 8.x ขึ้นไป | เปิด XAMPP Control Panel |

ดาวน์โหลด Node.js ได้จาก https://nodejs.org/ และติดตั้งแบบค่าเริ่มต้น (ติ๊ก "Add to PATH" ระหว่างติดตั้ง)

ดาวน์โหลด XAMPP ได้จาก https://www.apachefriends.org/

---

## 2. ดาวน์โหลดโปรเจกต์จาก GitHub

1. เปิดหน้าโปรเจกต์บน GitHub
2. กดปุ่ม **Code** (สีเขียว) แล้วเลือก **Download ZIP**
3. แตกไฟล์ ZIP ลงโฟลเดอร์ที่ต้องการ
4. ควรแตกไฟล์ไปยัง path ที่สั้นและไม่มีอักขระพิเศษ เช่น `C:\projects\movie-streaming`
5. เข้าไปในโฟลเดอร์ที่มีไฟล์ `setup.bat` อยู่

> หาก path มีช่องว่าง (เช่น `C:\Users\Your Name\Downloads\...`) ระบบยังรองรับ แต่แนะนำให้ใช้ path แบบมีช่องว่างน้อยเพื่อความสะดวก

---

## 3. เปิด MySQL ผ่าน XAMPP

1. เปิด **XAMPP Control Panel**
2. ในบรรทัด **MySQL** ให้กดปุ่ม **Start**
3. เมื่อสถานะเปลี่ยนเป็นสีเขียวและขึ้นข้อความ `MySQL` แสดงว่าพร้อมใช้งาน
4. **ไม่จำเป็นต้องเปิด Apache** เพราะโปรเจกต์ใช้ Vite (Frontend) และ Express (Backend) แทน

หาก MySQL ไม่ทำงาน สคริปต์ Setup จะแจ้งเตือนและให้คุณกด Enter เพื่อตรวจสอบใหม่หลังเปิด MySQL แล้ว โดยสคริปต์จะไม่เปิด MySQL ให้อัตโนมัติ

---

## 4. เตรียมไฟล์ `.env` ของ Backend

ไฟล์ `backend/.env` เป็นค่าตั้งค่าส่วนตัวของคุณ และจะไม่ถูกอัปโหลด lên GitHub (ถูกใส่ไว้ใน `.gitignore` แล้ว)

### 4.1 สร้างไฟล์จาก `.env.example`

คัดลอกไฟล์ `backend/.env.example` ไปสร้างเป็น `backend/.env`:

```powershell
Copy-Item -LiteralPath "backend\.env.example" -Destination "backend\.env"
```

### 4.2 แก้ไขค่าใน `backend/.env`

เปิด `backend/.env` ด้วย Notepad หรือ VS Code แล้วตั้งค่าต่อไปนี้:

```ini
PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_database_password
DB_NAME=movie_streaming

JWT_SECRET=replace_with_a_secure_secret
```

| ตัวแปร | คำอธิบาย |
| --- | --- |
| `PORT` | พอร์ตของ Backend (ค่าเริ่มต้น 5000) |
| `DB_HOST` | โฮสต์ของ MySQL (โดยทั่วไปเป็น `localhost`) |
| `DB_PORT` | พอร์ตของ MySQL (ค่าเริ่มต้น 3306) |
| `DB_USER` | ชื่อผู้ใช้ MySQL (XAMPP มักใช้ `root`) |
| `DB_PASSWORD` | รหัสผ่าน MySQL (หากไม่ตั้งไว้ใน XAMPP ให้เว้นว่างไว้) |
| `DB_NAME` | ชื่อ database (ใช้ค่า `movie_streaming`) |
| `JWT_SECRET` | คีย์ลับสำหรับเซ็น token (ต้องสุ่มและยาว) |

### 4.3 สร้าง `JWT_SECRET` แบบสุ่ม

รันคำสั่งนี้ใน PowerShell แล้วนำผลลัพธ์ไปวางในค่า `JWT_SECRET`:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

> ห้ามใช้ค่าตัวอย่าง `replace_with_a_secure_secret` ในการใช้งานจริง และห้ามแชร์ไฟล์ `.env` ให้ผู้อื่น

---

## 5. ใช้งาน `setup.bat`

1. ดับเบิลไฟล์ `setup.bat` (หรือรันจาก PowerShell ด้วย `.\setup.bat`)
2. สคริปต์จะตรวจสอบตามลำดับ:
   - Windows, Node.js และ npm
   - ไฟล์ `backend/.env` และคีย์ที่จำเป็น (โดยไม่แสดงค่าภายใน)
   - การติดตั้งโปรแกรม `mysql.exe` ของ XAMPP
   - การเชื่อมต่อ MySQL
   - ฐานข้อมูล ตาราะ และคอลัมน์ที่จำเป็น
   -  dependencies ของ Backend และ Frontend
3. หาก MySQL ยังไม่ทำงาน ให้กดเปิด XAMPP แล้วกด Start ที่ MySQL จากนั้นกด Enter เพื่อตรวจสอบใหม่
4. หากต้องสร้าง database ตาราะ หรือเพิ่มคอลัมน์ `video_url` สคริปต์จะแสดง SQL ที่จะใช้และถามให้ยืนยันก่อนเสมอ
5. เมื่อเสร็จ สคริปต์จะแสดงวิธีเปิดเว็บไซต์

### สิ่งที่ Setup จะไม่ทำ

- ไม่ลบและไม่แก้ไขข้อมูลหนังหรือบัญชีผู้ใช้เดิม
- ไม่สร้าง Admin อัตโนมัติ
- ไม่สร้างข้อมูลตัวอย่าง
- ไม่รัน `crud-test.js`
- ไม่แก้ไขหรือเขียนทับ `backend/.env`
- ไม่แก้ไขไฟล์ Source Code หรือ `package.json` / `package-lock.json`

### โหมดทดสอบแบบไม่แก้ไขอะไร

หากต้องการดูว่าสคริปต์จะทำอะไรบ้างโดยไม่แตะต้องฐานข้อมูลหรือติดตั้ง dependencies:

```powershell
.\setup.ps1 -DryRun
```

---

## 6. ใช้งาน `start.bat`

1. ดับเบิลไฟล์ `start.bat`
2. สคริปต์จะตรวจสอบว่า MySQL ทำงานอยู่หรือไม่
   - หากไม่ทำงาน ให้เปิด XAMPP และกด Start ที่ MySQL แล้วรัน `start.bat` ใหม่
3. สคริปต์จะเปิดหน้าต่างใหม่ 2 หน้าต่าง:
   - Backend (Express)
   - Frontend (Vite)
4. เมื่อทุกอย่างพร้อม ให้เปิดที่อยู่เหล่านี้ในเบราว์เซอร์:

| รายการ | URL |
| --- | --- |
| Frontend (เว็บไซต์) | http://localhost:5173 |
| Backend API | http://localhost:5000 |
| Backend Health | http://localhost:5000/api/health |

> ปิดหน้าต่างทั้งสองเพื่อหยุดเซิร์ฟเวอร์

---

## 7. สร้างบัญชี Admin เองภายหลัง

ระบบไม่สร้าง Admin ให้อัตโนมัติ ให้สร้างเองด้วยคำสั่งนี้:

```powershell
cd backend
node scripts/create-admin.js
```

สคริปต์จะถาม:
- Admin Email
- Admin Name
- Admin Password (อย่างน้อย 6 ตัวอักษร)

หากมีอีเมลนั้นอยู่แล้ว สคริปต์จะยกเลิกและไม่สร้างซ้ำ

หลังสร้าง Admin แล้ว ให้เข้าเว็บไซต์ที่ `http://localhost:5173` แล้วล็อกอินด้วยอีเมลและรหัสผ่านที่เพิ่งสร้าง

---

## 8. การเพิ่มหนังและเริ่มใช้งาน

1. ล็อกอินเป็น Admin
2. เข้าเมนู **Admin** หรือไปที่ `http://localhost:5173/admin`
3. กรอกข้อมูลหนังแล้วกด **Add Movie**
4. ในช่อง `Video URL` ให้ใส่:
   - ลิงก์วิดีโอโดยตรง เช่น `https://example.com/movie.mp4` (รองรับ `.mp4`, `.webm`, `.ogg`, `.ogv`, `.mov`, `.m4v`)
   - หรือลิงก์ YouTube เช่น `https://www.youtube.com/watch?v=VIDEO_ID` หรือ `https://youtu.be/VIDEO_ID`
5. หลังบันทึก หนังจะแสดงบนหน้าแรกและสามารถกดเพิ่มในรายการโปรดได้

ผู้ใช้ทั่วไปสามารถสมัครสมาชิกและเข้าสู่ระบบเพื่อจัดการรายการโปรดได้เอง

---

## 9. การแก้ปัญหาเบื้องต้น

| อาการ | สาเหตุที่เป็นไปได้ | วิธีแก้ |
| --- | --- | --- |
| `Node.js and/or npm was not found` | ยังไม่ได้ติดตั้ง Node.js หรือไม่ได้เปิด terminal ใหม่ | ติดตั้ง Node.js 18+ แล้วเปิด PowerShell ใหม่ |
| `MySQL is not reachable` | ยังไม่ได้เปิด MySQL ใน XAMPP | เปิด XAMPP Control Panel กด Start ที่ MySQL แล้วกด Enter ใน Setup |
| `Could not connect to MySQL` | ชื่อผู้ใช้/รหัสผ่านไม่ถูกต้อง | ตรวจ `DB_USER` และ `DB_PASSWORD` ใน `backend/.env` |
| `backend/.env was not found` | ยังไม่ได้สร้างไฟล์ `.env` | คัดลอก `backend/.env.example` เป็น `backend/.env` แล้วแก้ค่า |
| `Database 'movie_streaming' does not exist` | ยังไม่มี database | ตอบ `y` เมื่อ Setup ถามสร้าง database |
| `Missing tables` | ยังไม่มีตาราะ | ตอบ `y` เมื่อ Setup ถามสร้างตาราะ |
| `Column 'movies.video_url' is missing` | ตาราะ movies ยังไม่มีคอลัมน์วิดีโอ | ตอบ `y` เมื่อ Setup ถามเพิ่มคอลัมน์ |
| `Setup failed` | มีข้อผิดพลาดระหว่างติดตั้ง | อ่านข้อความด้านบนและตรวจสอบตารางนี้ |
| Port 5000 หรือ 5173 ไม่ว่าง | มีโปรแกรมอื่นใช้พอร์ต | ปิดโปรแกรมนั้น หรือแก้ `PORT` ใน `backend/.env` และปรับ `vite.config.js` |
| หน้าเว็บไม่ขึ้น | Frontend/Backend ยังไม่พร้อม | รอสักครู่แล้วรีเฟรช หรือดูข้อความในหน้าต่างที่เปิดไว้ |
| วิดีโอไม่เล่น | `video_url` ไม่ถูกต้อง | ใช้ `.mp4` หรือลิงก์ YouTube ที่ถูกต้อง และตรวจว่าโดเมนเป็น YouTube เท่านั้น |

### หาก Setup ค้างที่การรอ MySQL

สคริปต์จะรอให้คุณกด Enter หลังจากเปิด MySQL แล้ว หากต้องการยกเลิกให้กด `Ctrl+C`

### หากใช้งาน path ที่มีช่องว่าง

สคริปต์ใช้ `%~dp0` จึงรองรับ path ที่มีช่องว่าง แต่หากเกิดปัญหาแนะนำให้ย้ายโปรเจกต์ไปยัง path ที่สั้น เช่น `C:\projects\movie-streaming`

---

## 10. ข้อควรระวังด้านความปลอดภัย

- **ห้าม Commit ไฟล์ `backend/.env`** ขึ้น GitHub เพราะมีรหัสผ่านและ `JWT_SECRET`
- ไฟล์ `.env` ถูกใส่ไว้ใน `.gitignore` แล้ว แต่ควรตรวจสอบก่อนอัปโหลดทุกครั้ง
- ห้ามแชร์ค่า `JWT_SECRET` หรือรหัสผ่านฐานข้อมูลให้ผู้อื่น
- หากใช้เปิดเผยสาธารณะ ควรเปลี่ยนรหัสผ่าน MySQL และตั้ง `JWT_SECRET` ใหม่
- โปรเจกต์นี้ไม่มีข้อมูลตัวอย่าง ผู้ใช้ต้องสร้างหนังและ Admin เอง

---

## 11. การหยุดระบบ

- ปิดหน้าต่าง PowerShell สอง cửa sổที่เปิดด้วย `start.bat`
- หากใช้ XAMPP สามารถกด Stop ที่ MySQL ใน XAMPP Control Panel ได้

---

## สรุปไฟล์ที่เกี่ยวข้อง

| ไฟล์ | หน้าที่ |
| --- | --- |
| `setup.bat` | เปิด `setup.ps1` เพื่อตรวจสอบและติดตั้งระบบ |
| `setup.ps1` | สคริปต์หลักสำหรับตรวจสอบและติดตั้ง |
| `start.bat` | เปิด Backend และ Frontend |
| `backend/.env.example` | เทมเพลตสำหรับสร้าง `backend/.env` |
| `SETUP_GUIDE.md` | คู่มือนี้ |