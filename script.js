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
// تشغيل Firebase
// ======================================

const app = initializeApp(firebaseConfig);

const db = getDatabase(app);

const ledRef = ref(db, "led");


// ======================================
// عناصر الصفحة
// ======================================

const yearsInput =
    document.getElementById("years");

const monthsInput =
    document.getElementById("months");

const daysInput =
    document.getElementById("days");

const hoursInput =
    document.getElementById("hours");

const minutesInput =
    document.getElementById("minutes");


const confirmBtn =
    document.getElementById("confirmBtn");

const resetBtn =
    document.getElementById("resetBtn");

const cancelBtn =
    document.getElementById("cancelBtn");


const ledStatus =
    document.getElementById("ledStatus");

const remaining =
    document.getElementById("remaining");


// ======================================
// متغير عداد الوقت
// ======================================

// نخزن هنا setInterval حتى نستطيع إيقافه
// عند الإلغاء أو انتهاء المؤقت.

let countdownInterval = null;


// ======================================
// الحصول على رقم صحيح من صندوق الإدخال
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

    const years =
        getNumber(yearsInput);

    const months =
        getNumber(monthsInput);

    const days =
        getNumber(daysInput);

    const hours =
        getNumber(hoursInput);

    const minutes =
        getNumber(minutesInput);


    // ==================================
    // تحويل المدة كلها إلى دقائق
    // ==================================

    // السنة = 365 يوم
    // الشهر = 30 يوم

    const totalMinutes =
        (years * 365 * 24 * 60) +
        (months * 30 * 24 * 60) +
        (days * 24 * 60) +
        (hours * 60) +
        minutes;


    // ==================================
    // التأكد من وجود مدة
    // ==================================

    if (totalMinutes <= 0) {

        alert("يجب إدخال مدة أكبر من صفر");

        return;
    }


    // ==================================
    // حساب وقت البداية والنهاية
    // ==================================

    const now = Date.now();

    const endTime =
        now + (totalMinutes * 60 * 1000);


    // رقم فريد للأمر

    const commandId = Date.now();


    // ==================================
    // إرسال الأمر إلى Firebase
    // ==================================

    try {

        await set(ledRef, {

            active: true,

            startTime: now,

            endTime: endTime,

            commandId: commandId

        });


        console.log(
            "تم تشغيل المؤقت:",
            totalMinutes,
            "دقيقة"
        );


    } catch (error) {

        console.error(
            "Firebase Error:",
            error
        );


        alert(
            "حدث خطأ أثناء الاتصال بقاعدة البيانات:\n\n" +
            error.code +
            "\n\n" +
            error.message
        );
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


        console.log(
            "تم إلغاء المؤقت"
        );


    } catch (error) {

        console.error(
            "Firebase Error:",
            error
        );


        alert(
            "فشل إلغاء المؤقت:\n\n" +
            error.code +
            "\n\n" +
            error.message
        );
    }

});


// ======================================
// مراقبة Firebase
// ======================================

onValue(ledRef, (snapshot) => {

    const data = snapshot.val();


    // ==================================
    // لا يوجد مؤقت أو المؤقت متوقف
    // ==================================

    if (!data || data.active !== true) {

        ledStatus.textContent =
            "متوقف";


        remaining.textContent =
            "لا يوجد مؤقت";


        // إيقاف أي عداد يعمل حالياً

        if (countdownInterval !== null) {

            clearInterval(
                countdownInterval
            );

            countdownInterval = null;
        }


        return;
    }


    // ==================================
    // المؤقت يعمل
    // ==================================

    ledStatus.textContent =
        "يعمل";


    // تشغيل العداد

    updateRemaining(
        data.endTime
    );

});


// ======================================
// تحديث الوقت المتبقي
// ======================================

function updateRemaining(endTime) {

    // ==================================
    // إيقاف أي عداد قديم
    // ==================================

    if (countdownInterval !== null) {

        clearInterval(
            countdownInterval
        );

        countdownInterval = null;
    }


    // ==================================
    // دالة تحديث الوقت
    // ==================================

    function update() {

        const remainingMs =
            endTime - Date.now();


        // ==================================
        // انتهى المؤقت
        // ==================================

        if (remainingMs <= 0) {

            remaining.textContent =
                "انتهى المؤقت";


            // إيقاف العداد

            if (countdownInterval !== null) {

                clearInterval(
                    countdownInterval
                );

                countdownInterval = null;
            }


            return;
        }


        // ==================================
        // تحويل المدة إلى ثواني
        // ==================================

        const totalSeconds =
            Math.floor(
                remainingMs / 1000
            );


        // ==================================
        // حساب الأيام
        // ==================================

        const days =
            Math.floor(
                totalSeconds / 86400
            );


        // ==================================
        // حساب الساعات
        // ==================================

        const hours =
            Math.floor(
                (totalSeconds % 86400) / 3600
            );


        // ==================================
        // حساب الدقائق
        // ==================================

        const minutes =
            Math.floor(
                (totalSeconds % 3600) / 60
            );


        // ==================================
        // حساب الثواني
        // ==================================

        const seconds =
            totalSeconds % 60;


        // ==================================
        // عرض الوقت
        // ==================================

        remaining.textContent =
            `${days} يوم - ` +
            `${hours} ساعة - ` +
            `${minutes} دقيقة - ` +
            `${seconds} ثانية`;
    }


    // ==================================
    // تحديث أول مرة مباشرة
    // ==================================

    update();


    // ==================================
    // تحديث كل ثانية
    // ==================================

    countdownInterval =
        setInterval(
            update,
            1000
        );
}
```
