document.addEventListener("DOMContentLoaded", () => {
  const calendar = document.getElementById("calendar");
  const monthLabel = document.getElementById("monthLabel");
  const prevMonthBtn = document.getElementById("prevMonth");
  const nextMonthBtn = document.getElementById("nextMonth");
  const submitBtn = document.getElementById("submitMeals");
  const totalCostDisplay = document.getElementById("totalCost");

  // Get student ID from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const studentId = urlParams.get('id');

  let currentMonth = new Date();
  let mealsOn = {};
  let today = new Date();
  today.setHours(0, 0, 0, 0); // Set to beginning of day for proper comparison
  
  // Initialize Firestore
  const db = firebase.firestore();

  // Function to load existing meal data from Firestore
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
        
        // Load saved meal data
        for (const date in mealData) {
          // Only process properties that are actual dates (not metadata like lastUpdated)
          if (date.match(/^\d{4}-\d{2}-\d{2}$/) && date >= monthStart && date <= monthEnd) {
            // Make sure we have valid data structure
            if (mealData[date] && typeof mealData[date].on === 'boolean') {
              // Store meal status for this date
              mealsOn[date] = mealData[date].on;
            }
          }
        }
        
        // Update the calendar with loaded data
        const checkboxes = document.querySelectorAll('.meal-toggle');
        checkboxes.forEach(checkbox => {
          const dateId = checkbox.id.replace('meal-toggle-', '');
          if (mealsOn[dateId] !== undefined) {
            checkbox.checked = mealsOn[dateId];
          }
        });
        
        // Update the total cost display
        updateTotalCost();
      } else {
        // No meal document found
      }
    } catch (error) {
      console.error("Error loading meal data:", error);
    }
  }

  function isPastDate(dateStr) {
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0); // Set to beginning of day for proper comparison
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
    // Clear existing days (but keep day labels and empty slots)
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

      // First check if we have saved data for this date
      let mealStatus;
      if (mealsOn[dateKey] !== undefined) {
        mealStatus = mealsOn[dateKey];
      } else {
        // No saved data, use default: ON for future days, OFF for past days
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
          // Prevent changing past date and reset the checkbox
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
    
    // Reset all checkboxes to match the mealsOn object
    const checkboxes = document.querySelectorAll('.meal-toggle');
    checkboxes.forEach(checkbox => {
      const dateId = checkbox.id.replace('meal-toggle-', '');
      if (dateId.startsWith(`${year}-${month}`) && mealsOn[dateId] !== undefined) {
        checkbox.checked = mealsOn[dateId];
      }
    });
    
    // Count all meals that are ON for the current month
    for (const date in mealsOn) {
      if (date.startsWith(`${year}-${month}`)) {
        if (mealsOn[date]) {
          totalCost += mealCostPerDay;
          totalMeals++;
        }
      }
    }

    // Update the display with the new total
    totalCostDisplay.textContent = `৳${totalCost}`;
  }

  function refreshCalendar() {
    // Clear data for the current month to avoid stale data
    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, "0");
    
    for (const date in mealsOn) {
      if (date.startsWith(`${year}-${month}`)) {
        delete mealsOn[date];
      }
    }
    
    // Generate calendar structure
    generateCalendar(currentMonth);
    
    // Load data from firestore
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

    submitBtn.classList.add('btn-loading');
    submitBtn.disabled = true;

    try {
      const mealDocRef = db.collection('meals').doc(studentId);
      
      // Get existing data first
      const doc = await mealDocRef.get();
      let existingData = {};
      if (doc.exists) {
        existingData = doc.data();
      }

      // Convert simple mealsOn object to proper structure
      const mealData = {};
      for (const date in mealsOn) {
        // Skip any undefined values to prevent Firestore errors
        if (mealsOn[date] === undefined) continue;
        
        // Only allow future dates to be updated
        if (!isPastDate(date)) {
          mealData[date] = {
            on: Boolean(mealsOn[date]), // Ensure it's a boolean
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
          };
        } else if (existingData[date] && typeof existingData[date].on === 'boolean') {
          // Preserve existing data for past dates if it has valid structure
          mealData[date] = existingData[date];
        } else {
          // Create a valid structure for past dates without valid existing data
          mealData[date] = {
            on: Boolean(mealsOn[date]), // Ensure it's a boolean
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
          };
        }
      }
      
      // Create final data object, filtering out any problematic fields
      const updatedData = {
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
      };
      
      // Add meal data
      for (const date in mealData) {
        if (mealData[date] && typeof mealData[date].on === 'boolean') {
          updatedData[date] = mealData[date];
        }
      }
      
      // Save to Firestore
      await mealDocRef.set(updatedData, { merge: true });
      
      showToast("Meal plan submitted successfully!", "success");
      submitBtn.classList.remove('btn-loading');
      submitBtn.disabled = false;
    } catch (error) {
      console.error("Error submitting meal plan:", error);
      showToast("There was an error submitting the meal plan: " + error.message, "error");
      submitBtn.classList.remove('btn-loading');
      submitBtn.disabled = false;
    }
  });

  // Update links with student ID
  if (studentId) {
    const links = document.querySelectorAll('.sidebar a');
    links.forEach(link => {
      if (!link.querySelector('h3')) return;
      
      // Skip if it's the logout button
      if (link.querySelector('h3').textContent === 'Logout') return;
      
      const href = link.getAttribute('href');
      // Only update links that point to actual pages (not #)
      if (href && href !== '#') {
        // Check if the URL already has parameters
        if (href.includes('?')) {
          link.setAttribute('href', `${href}&id=${studentId}`);
        } else {
          link.setAttribute('href', `${href}?id=${studentId}`);
        }
      }
    });
  }
  
  // Initialize the calendar
  refreshCalendar();
});