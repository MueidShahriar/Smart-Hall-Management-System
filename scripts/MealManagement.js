document.addEventListener("DOMContentLoaded", () => {
  const calendar = document.getElementById("calendar");
  const monthLabel = document.getElementById("monthLabel");
  const prevMonthBtn = document.getElementById("prevMonth");
  const nextMonthBtn = document.getElementById("nextMonth");
  const submitBtn = document.getElementById("submitMeals");
  const totalCostDisplay = document.getElementById("totalCost");

  const urlParams = new URLSearchParams(window.location.search);
  const studentId = urlParams.get('id');

  let currentMonth = new Date();
  let mealsOn = {};
  let today = new Date();
  today.setHours(0, 0, 0, 0);

  const db = firebase.firestore();

  async function loadMealData() {
    if (!studentId) {
      console.error("No student ID found in URL");
      return;
    }

    try {
      const year = currentMonth.getFullYear();
      const month = String(currentMonth.getMonth() + 1).padStart(2, "0");
      const monthStart = `${year}-${month}-01`;
      const monthEnd = `${year}-${month}-31`;

      const mealDoc = await db.collection('meals').doc(studentId).get();

      if (mealDoc.exists) {
        const mealData = mealDoc.data();

        for (const date in mealData) {

          if (date.match(/^\d{4}-\d{2}-\d{2}$/) && date >= monthStart && date <= monthEnd) {

            if (mealData[date] && typeof mealData[date].on === 'boolean') {

              mealsOn[date] = mealData[date].on;
            }
          }
        }

        const checkboxes = document.querySelectorAll('.meal-toggle');
        checkboxes.forEach(checkbox => {
          const dateId = checkbox.id.replace('meal-toggle-', '');
          if (mealsOn[dateId] !== undefined) {
            checkbox.checked = mealsOn[dateId];
          }
        });

        updateTotalCost();
      } else {

      }
    } catch (error) {
      console.error("Error loading meal data:", error);
    }
  }

  function isPastDate(dateStr) {
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    return date < today;
  }

  function generateCalendar(month) {
    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
    const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    monthLabel.textContent = `${firstDay.toLocaleString("default", { month: "long" })} ${month.getFullYear()}`;
    calendar.innerHTML = "";

    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    daysOfWeek.forEach((day) => {
      const dayLabel = document.createElement("div");
      dayLabel.className = "day-label";
      dayLabel.textContent = day;
      calendar.appendChild(dayLabel);
    });

    for (let i = 0; i < startingDay; i++) {
      const emptySlot = document.createElement("div");
      emptySlot.className = "empty-slot";
      calendar.appendChild(emptySlot);
    }

    renderCalendarDays();
  }

  function renderCalendarDays() {

    const dayElements = calendar.querySelectorAll('.day');
    dayElements.forEach(el => el.remove());

    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const dateKey = date.toISOString().split("T")[0];
      const isPast = isPastDate(dateKey);

      const dayElement = document.createElement("div");
      dayElement.className = "day";
      if (isPast) {
        dayElement.classList.add("past-date");
      }

      let mealStatus;
      if (mealsOn[dateKey] !== undefined) {
        mealStatus = mealsOn[dateKey];
      } else {

        mealStatus = !isPast;
        mealsOn[dateKey] = mealStatus;
      }

      dayElement.innerHTML = `
        <span class="day-number">${day}</span>
        <input type="checkbox" id="meal-toggle-${dateKey}" class="meal-toggle" ${mealStatus ? 'checked' : ''} ${isPast ? 'disabled' : ''} />
        <div class="day-cost">৳180</div>
      `;

      const checkbox = dayElement.querySelector(`#meal-toggle-${dateKey}`);
      checkbox.addEventListener("change", () => {
        if (!isPast) {
          mealsOn[dateKey] = checkbox.checked;
          updateTotalCost();
        } else {

          checkbox.checked = mealsOn[dateKey];
          showToast("You cannot change meal status for past dates.", "warning");
        }
      });

      calendar.appendChild(dayElement);
    }

    updateTotalCost();
  }

  function updateTotalCost() {
    const mealCostPerDay = 180;
    let totalCost = 0;
    let totalMeals = 0;
    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, "0");

    const checkboxes = document.querySelectorAll('.meal-toggle');
    checkboxes.forEach(checkbox => {
      const dateId = checkbox.id.replace('meal-toggle-', '');
      if (dateId.startsWith(`${year}-${month}`) && mealsOn[dateId] !== undefined) {
        checkbox.checked = mealsOn[dateId];
      }
    });

    for (const date in mealsOn) {
      if (date.startsWith(`${year}-${month}`)) {
        if (mealsOn[date]) {
          totalCost += mealCostPerDay;
          totalMeals++;
        }
      }
    }

    totalCostDisplay.textContent = `৳${totalCost}`;
  }

  function refreshCalendar() {

    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, "0");

    for (const date in mealsOn) {
      if (date.startsWith(`${year}-${month}`)) {
        delete mealsOn[date];
      }
    }

    generateCalendar(currentMonth);

    loadMealData();
  }

  prevMonthBtn.addEventListener("click", () => {
    currentMonth.setMonth(currentMonth.getMonth() - 1);
    refreshCalendar();
  });

  nextMonthBtn.addEventListener("click", () => {
    currentMonth.setMonth(currentMonth.getMonth() + 1);
    refreshCalendar();
  });

  submitBtn.addEventListener("click", async () => {
    if (!studentId) {
      showToast("No student ID found. Please log in again.", "error");
      return;
    }

    const loader = document.createElement('div');
    loader.className = 'page-loader-overlay';
    loader.id = 'mealSubmitLoader';
    loader.innerHTML = '<div class="preloader-content"><div class="loader"></div><p class="preloader-text">Submitting meal plan<span class="dot-animation">...</span></p></div>';
    document.body.appendChild(loader);

    submitBtn.classList.add('btn-loading');
    submitBtn.disabled = true;

    try {
      const mealDocRef = db.collection('meals').doc(studentId);

      const doc = await mealDocRef.get();
      let existingData = {};
      if (doc.exists) {
        existingData = doc.data();
      }

      const nowISO = new Date().toISOString();
      const updatedData = {
        lastUpdated: nowISO
      };

      for (const date in mealsOn) {
        if (mealsOn[date] === undefined) continue;

        if (!isPastDate(date)) {
          updatedData[date] = {
            on: Boolean(mealsOn[date]),
            timestamp: nowISO
          };
        } else if (existingData[date] && typeof existingData[date].on === 'boolean') {

          updatedData[date] = {
            on: Boolean(existingData[date].on),
            timestamp: typeof existingData[date].timestamp === 'string'
              ? existingData[date].timestamp
              : (existingData[date].timestamp && existingData[date].timestamp.toDate
                ? existingData[date].timestamp.toDate().toISOString()
                : nowISO)
          };
        } else {
          updatedData[date] = {
            on: Boolean(mealsOn[date]),
            timestamp: nowISO
          };
        }
      }

      await mealDocRef.set(updatedData, { merge: true });

      showToast("Meal plan submitted successfully!", "success");
      const ml = document.getElementById('mealSubmitLoader');
      if (ml) { ml.classList.add('hidden'); setTimeout(() => { if (ml.parentNode) ml.parentNode.removeChild(ml); }, 1200); }
      submitBtn.classList.remove('btn-loading');
      submitBtn.disabled = false;
    } catch (error) {
      console.error("Error submitting meal plan:", error);
      showToast("There was an error submitting the meal plan: " + error.message, "error");
      const ml2 = document.getElementById('mealSubmitLoader');
      if (ml2) { ml2.classList.add('hidden'); setTimeout(() => { if (ml2.parentNode) ml2.parentNode.removeChild(ml2); }, 1200); }
      submitBtn.classList.remove('btn-loading');
      submitBtn.disabled = false;
    }
  });

  if (studentId) {
    const links = document.querySelectorAll('.sidebar a');
    links.forEach(link => {
      if (!link.querySelector('h3')) return;

      if (link.querySelector('h3').textContent === 'Logout') return;

      const href = link.getAttribute('href');

      if (href && href !== '#') {

        if (href.includes('?')) {
          link.setAttribute('href', `${href}&id=${studentId}`);
        } else {
          link.setAttribute('href', `${href}?id=${studentId}`);
        }
      }
    });
  }

  refreshCalendar();
});
