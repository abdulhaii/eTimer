import { initializeApp } from
    "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
    getDatabase,
    ref,
    set,
    onValue
} from
    "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";


// ======================================
// Firebase configuration
// ======================================

const firebaseConfig = {

    apiKey: "AIzaSyBLbonz2yP9fI0RyeWeGbawlVj69yOmmDE",

    authDomain:
        "aaaaaa-8e6bb.firebaseapp.com",

    databaseURL:
        "https://aaaaaa-8e6bb-default-rtdb.firebaseio.com",

    projectId:
        "aaaaaa-8e6bb",

    storageBucket:
        "aaaaaa-8e6bb.firebasestorage.app",

    messagingSenderId:
        "196879657565",

    appId:
        "1:196879657565:web:4441a61531286180a17bb4"
};


// ======================================
// Firebase
// ======================================

const app = initializeApp(firebaseConfig);

const db = getDatabase(app);

const ledRef = ref(db, "led");


// ======================================
// عناصر الصفحة
// ======================================

const yearsInput = document.getElementById("years");
const monthsInput = document.getElementById("months");
const daysInput = document.getElementById("days");
const hoursInput = document.getElementById("hours");
const minutesInput = document.getElementById("minutes");

const confirmBtn = document.getElementById("confirmBtn");
const resetBtn = document.getElementById("resetBtn");
const cancelBtn = document.getElementById("cancelBtn");

const ledStatus = document.getElementById("ledStatus");
const remaining = document.getElementById("remaining");


// ======================================
// تحويل القيم إلى أرقام
// ======================================

function getNumber(input) {

    const value = Number(input.value);

    if (!Number.isFinite(value) || value < 0) {
        return 0;
    }

    return Math.floor(value);
}


// ======================================
// زر التأكيد
// ======================================

confirmBtn.addEventListener("click", async () => {

    const years = getNumber(yearsInput);
    const months = getNumber(monthsInput);
    const days = getNumber(daysInput);
    const hours = getNumber(hoursInput);
    const minutes = getNumber(minutesInput);


    // تحويل كل شيء إلى دقائق

    const totalMinutes =
        (years * 365 * 24 * 60) +
        (months * 30 * 24 * 60) +
        (days * 24 * 60) +
        (hours * 60) +
        minutes;


    if (totalMinutes <= 0) {

        alert("يجب إدخال مدة أكبر من صفر");

        return;
    }


    const now = Date.now();

    const endTime =
        now + (totalMinutes * 60 * 1000);


    const commandId = Date.now();


    try {

        await set(ledRef, {

            active: true,

            startTime: now,

            endTime: endTime,

            commandId: commandId

        });


        alert("تم تشغيل المؤقت");

    } catch (error) {

        console.error(error);

        alert("حدث خطأ أثناء الاتصال بقاعدة البيانات");
    }

});


// ======================================
// زر التصحيح
// ======================================

resetBtn.addEventListener("click", () => {

    yearsInput.value = 0;
    monthsInput.value = 0;
    daysInput.value = 0;
    hoursInput.value = 0;
    minutesInput.value = 0;

});


// ======================================
// زر الإلغاء
// ======================================

cancelBtn.addEventListener("click", async () => {

    try {

        await set(ledRef, {

            active: false,

            startTime: 0,

            endTime: 0,

            commandId: Date.now()

        });

    } catch (error) {

        console.error(error);

        alert("فشل إلغاء المؤقت");
    }

});


// ======================================
// مراقبة Firebase
// ======================================

onValue(ledRef, (snapshot) => {

    const data = snapshot.val();


    if (!data || data.active !== true) {

        ledStatus.textContent = "متوقف";

        remaining.textContent =
            "لا يوجد مؤقت";

        return;
    }


    ledStatus.textContent = "يعمل";


    updateRemaining(data.endTime);

});


// ======================================
// حساب الوقت المتبقي
// ======================================

function updateRemaining(endTime) {

    function update() {

        const remainingMs =
            endTime - Date.now();


        if (remainingMs <= 0) {

            remaining.textContent =
                "انتهى المؤقت";

            return;
        }


        const totalSeconds =
            Math.floor(remainingMs / 1000);


        const days =
            Math.floor(totalSeconds / 86400);


        const hours =
            Math.floor(
                (totalSeconds % 86400) / 3600
            );


        const minutes =
            Math.floor(
                (totalSeconds % 3600) / 60
            );


        const seconds =
            totalSeconds % 60;


        remaining.textContent =
            `${days} يوم - ${hours} ساعة - ` +
            `${minutes} دقيقة - ${seconds} ثانية`;
    }


    update();

    setInterval(update, 1000);
}