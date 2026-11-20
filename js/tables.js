/* =====================================================================
   MacrOman - js/tables.js  (Part 3 - Member C)
   Dynamic tables for:
     - food-database.html  -> Food Database table
     - progress.html       -> 7-Day Macro History table
   Contents:
     1. Two constructors: Food() and DayLog()
     2. Two arrays with real data: foods[] and dayLogs[]
     3. Two functions that fill the empty tables: displayFoods() and displayDayLogs()
     4. Add forms: push a new object into the array, then refresh the table
     5. Search (filter) + Show all for both tables
     6. Bootstrap modal confirmation after adding ("Food added ✓")
   No CSS is used here - only Bootstrap classes already in the HTML.
   ===================================================================== */


/* ---------------------------------------------------------------------
   1. CONSTRUCTORS
   --------------------------------------------------------------------- */

/**
 * Food constructor - creates one food item for the Food Database.
 * @param {string} name     - dish name, e.g. "Omani Shuwa"
 * @param {string} category - "Traditional Omani", "Gulf Specialties", "Beverages" or "Dates & Sweets"
 * @param {string} portion  - standard portion size, e.g. "1 plate (250g)"
 * @param {number} calories - energy per portion in kcal
 * @param {number} protein  - protein per portion in grams
 * @param {number} carbs    - carbohydrates per portion in grams
 * @param {number} fat      - fat per portion in grams
 */
function Food(name, category, portion, calories, protein, carbs, fat) {
    this.name = name;
    this.category = category;
    this.portion = portion;
    this.calories = calories;
    this.protein = protein;
    this.carbs = carbs;
    this.fat = fat;
}

/**
 * DayLog constructor - creates one day of logged intake for the Progress page.
 * @param {string} day      - weekday name, e.g. "Monday"
 * @param {string} date     - display date, e.g. "19 Oct 2026"
 * @param {number} calories - total calories eaten that day (kcal)
 * @param {number} protein  - total protein eaten that day (g)
 * @param {number} carbs    - total carbs eaten that day (g)
 * @param {number} fat      - total fat eaten that day (g)
 */
function DayLog(day, date, calories, protein, carbs, fat) {
    this.day = day;
    this.date = date;
    this.calories = calories;
    this.protein = protein;
    this.carbs = carbs;
    this.fat = fat;
}


/* ---------------------------------------------------------------------
   2. ARRAYS WITH REAL DATA
   Values are approximate per standard portion (local recipes vary).
   --------------------------------------------------------------------- */

// array of Food objects shown in the Food Database table
var foods = [
    new Food("Omani Shuwa", "Traditional Omani", "1 plate (250g)", 580, 42, 35, 28),
    new Food("Chicken Majboos", "Traditional Omani", "1 plate", 650, 38, 75, 20),
    new Food("Harees", "Traditional Omani", "1 bowl", 400, 25, 45, 12),
    new Food("Mashuai (Grilled Kingfish with Rice)", "Traditional Omani", "1 plate", 620, 45, 70, 16),
    new Food("Omani Bread (Rakhal) with Honey", "Traditional Omani", "1 piece", 250, 6, 45, 5),
    new Food("Chicken Mishkak", "Gulf Specialties", "3 skewers", 300, 35, 6, 14),
    new Food("Balaleet", "Gulf Specialties", "1 plate", 420, 12, 60, 14),
    new Food("Luqaimat", "Dates & Sweets", "5 pieces", 280, 4, 38, 13),
    new Food("Omani Halwa", "Dates & Sweets", "1 small cup (50g)", 200, 2, 30, 8),
    new Food("Khalas Dates", "Dates & Sweets", "5 dates", 120, 1, 32, 0),
    new Food("Karak Tea", "Beverages", "1 cup", 120, 3, 18, 4),
    new Food("Laban", "Beverages", "1 cup", 90, 6, 10, 3),
    new Food("Omani Kahwa", "Beverages", "1 small cup", 5, 0, 1, 0)
];

// array of DayLog objects shown in the 7-Day Macro History table
var dayLogs = [
    new DayLog("Monday", "19 Oct 2026", 2150, 130, 240, 68),
    new DayLog("Tuesday", "20 Oct 2026", 2200, 135, 245, 70),
    new DayLog("Wednesday", "21 Oct 2026", 1980, 115, 210, 60),
    new DayLog("Thursday", "22 Oct 2026", 2300, 140, 260, 72),
    new DayLog("Friday", "23 Oct 2026", 2050, 120, 220, 65),
    new DayLog("Saturday", "24 Oct 2026", 2160, 131, 235, 66),
    new DayLog("Sunday", "25 Oct 2026", 1630, 79, 225, 44)
];

// daily goal targets (same values as the Dashboard page)
var GOAL_CALORIES = 2200;
var GOAL_PROTEIN = 138;


/* ---------------------------------------------------------------------
   HELPER FUNCTIONS
   --------------------------------------------------------------------- */

/**
 * Adds one cell (<td>) to a table row.
 * textContent is used (not innerHTML) so text typed by the user is never run as HTML.
 * @param {HTMLTableRowElement} row - the row to add the cell to
 * @param {string|number} value     - the value shown in the cell
 * @param {boolean} isNumber        - true = right-align the cell with Bootstrap "text-end"
 */
function addCell(row, value, isNumber) {
    var cell = row.insertCell();
    cell.textContent = value;
    if (isNumber) {
        cell.className = "text-end";
    }
}

/**
 * Formats a number with thousands separators, e.g. 2150 -> "2,150".
 * @param {number} value - the number to format
 * @returns {string} the formatted number
 */
function formatNumber(value) {
    return Number(value).toLocaleString("en-US");
}

/**
 * Shows a "no results" message across the whole table body.
 * @param {HTMLElement} tbody - the table body to write into
 * @param {number} columns    - how many columns the message should span
 * @param {string} message    - the text to show
 */
function showEmptyRow(tbody, columns, message) {
    var row = tbody.insertRow();
    var cell = row.insertCell();
    cell.colSpan = columns;
    cell.className = "text-center text-muted py-3";
    cell.textContent = message;
}

/**
 * Opens the Bootstrap modal on the page and writes a message in its body.
 * @param {string} title   - text for the modal title, e.g. "Food added ✓"
 * @param {string} message - text for the modal body
 */
function showAddedModal(title, message) {
    document.getElementById("addedModalLabel").textContent = title;
    document.getElementById("addedModalBody").textContent = message;
    var modal = bootstrap.Modal.getOrCreateInstance(document.getElementById("addedModal"));
    modal.show();
}


/* ---------------------------------------------------------------------
   3a. FOOD DATABASE TABLE (food-database.html)
   --------------------------------------------------------------------- */

/**
 * Fills the empty Food Database table with the foods in the given list.
 * Clears the old rows first, then adds one row per Food object.
 * @param {Food[]} list - the foods to show (the full array, or a filtered one)
 */
function displayFoods(list) {
    var tbody = document.getElementById("foodTableBody");
    tbody.innerHTML = "";   // remove the old rows

    if (list.length === 0) {
        showEmptyRow(tbody, 7, "No foods match your search.");
    }

    for (var i = 0; i < list.length; i++) {
        var row = tbody.insertRow();
        addCell(row, list[i].name, false);
        addCell(row, list[i].category, false);
        addCell(row, list[i].portion, false);
        addCell(row, formatNumber(list[i].calories), true);
        addCell(row, list[i].protein, true);
        addCell(row, list[i].carbs, true);
        addCell(row, list[i].fat, true);
    }

    // show how many foods are visible out of the total
    document.getElementById("foodCount").textContent =
        "Showing " + list.length + " of " + foods.length + " foods";
}

/**
 * Search (filter): keeps only the foods whose name contains the search text
 * AND whose category matches the selected category (or any category if "All").
 * Runs when the Search form is submitted.
 * @param {Event} event - the submit event (stopped so the page does not reload)
 */
function searchFoods(event) {
    event.preventDefault();
    var text = document.getElementById("searchQuery").value.trim().toLowerCase();
    var category = document.getElementById("categoryFilter").value;

    var results = foods.filter(function (food) {
        var nameMatches = food.name.toLowerCase().indexOf(text) !== -1;
        var categoryMatches = category === "" || food.category === category;
        return nameMatches && categoryMatches;
    });

    displayFoods(results);
}

/**
 * Show all: clears the search box and category filter, then shows every food again.
 */
function showAllFoods() {
    document.getElementById("searchForm").reset();
    displayFoods(foods);
}

/**
 * Add Food form: checks the inputs with Bootstrap validation, creates a new Food,
 * pushes it into the foods array, refreshes the table and shows the modal.
 * @param {Event} event - the submit event (stopped so the page does not reload)
 */
function addFood(event) {
    event.preventDefault();
    var form = document.getElementById("addFoodForm");

    // Bootstrap validation: show red/green feedback and stop if a field is invalid
    if (!form.checkValidity()) {
        form.classList.add("was-validated");
        return;
    }

    var newFood = new Food(
        document.getElementById("foodName").value.trim(),
        document.getElementById("foodCategory").value,
        document.getElementById("foodPortion").value.trim(),
        Number(document.getElementById("foodCalories").value),
        Number(document.getElementById("foodProtein").value),
        Number(document.getElementById("foodCarbs").value),
        Number(document.getElementById("foodFat").value)
    );

    foods.push(newFood);    // add to the array
    showAllFoods();         // refresh the table so the new food appears

    form.reset();
    form.classList.remove("was-validated");
    showAddedModal("Food added ✓", newFood.name + " was added to the Food Database.");
}


/* ---------------------------------------------------------------------
   3b. PROGRESS TABLE (progress.html)
   --------------------------------------------------------------------- */

/**
 * Fills the empty 7-Day Macro History table with the day logs in the given list.
 * Days that reach the calorie goal get a green "Met" badge, others a grey "Under" badge.
 * @param {DayLog[]} list - the days to show (the full array, or a filtered one)
 */
function displayDayLogs(list) {
    var tbody = document.getElementById("progressTableBody");
    tbody.innerHTML = "";   // remove the old rows

    if (list.length === 0) {
        showEmptyRow(tbody, 7, "No days match your search.");
    }

    for (var i = 0; i < list.length; i++) {
        var row = tbody.insertRow();
        addCell(row, list[i].day, false);
        addCell(row, list[i].date, false);
        addCell(row, formatNumber(list[i].calories), true);
        addCell(row, list[i].protein, true);
        addCell(row, list[i].carbs, true);
        addCell(row, list[i].fat, true);

        // status badge: Met goal if calories are within 5% of the target or above it
        var badge = document.createElement("span");
        if (list[i].calories >= GOAL_CALORIES * 0.95) {
            badge.className = "badge text-bg-success";
            badge.textContent = "Met";
        } else {
            badge.className = "badge text-bg-secondary";
            badge.textContent = "Under";
        }
        row.insertCell().appendChild(badge);
    }

    updateSummary();
}

/**
 * Works out the weekly averages and goal adherence from ALL day logs
 * and writes them into the summary cards and the progress bars.
 */
function updateSummary() {
    var totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;

    for (var i = 0; i < dayLogs.length; i++) {
        totalCalories += dayLogs[i].calories;
        totalProtein += dayLogs[i].protein;
        totalCarbs += dayLogs[i].carbs;
        totalFat += dayLogs[i].fat;
    }

    var days = dayLogs.length;
    var avgCalories = Math.round(totalCalories / days);
    var avgProtein = Math.round(totalProtein / days);

    document.getElementById("avgCalories").textContent = formatNumber(avgCalories);
    document.getElementById("avgProtein").textContent = avgProtein + " g";
    document.getElementById("avgCarbs").textContent = Math.round(totalCarbs / days) + " g";
    document.getElementById("avgFat").textContent = Math.round(totalFat / days) + " g";

    // adherence = average as a percent of the goal, capped at 100%
    var calorieAdherence = Math.min(100, Math.round(avgCalories / GOAL_CALORIES * 100));
    var proteinAdherence = Math.min(100, Math.round(avgProtein / GOAL_PROTEIN * 100));

    document.getElementById("calorieAdherence").value = calorieAdherence;
    document.getElementById("calorieAdherenceText").textContent = calorieAdherence + "%";
    document.getElementById("proteinAdherence").value = proteinAdherence;
    document.getElementById("proteinAdherenceText").textContent = proteinAdherence + "%";
}

/**
 * Search (filter): keeps only the days whose name contains the search text
 * AND that match the selected goal status (all / met / under).
 * Runs when the Search form is submitted.
 * @param {Event} event - the submit event (stopped so the page does not reload)
 */
function searchDays(event) {
    event.preventDefault();
    var text = document.getElementById("daySearch").value.trim().toLowerCase();
    var status = document.getElementById("statusFilter").value;

    var results = dayLogs.filter(function (log) {
        var nameMatches = log.day.toLowerCase().indexOf(text) !== -1;
        var metGoal = log.calories >= GOAL_CALORIES * 0.95;
        var statusMatches = status === "" || (status === "met" && metGoal) || (status === "under" && !metGoal);
        return nameMatches && statusMatches;
    });

    displayDayLogs(results);
}

/**
 * Show all: clears the search filters, then shows every logged day again.
 */
function showAllDays() {
    document.getElementById("daySearchForm").reset();
    displayDayLogs(dayLogs);
}

/**
 * Turns the value of a date input ("2026-10-26") into a weekday name and a display date.
 * The date is built from its parts so the day is not shifted by the time zone.
 * @param {string} value - the value from <input type="date">
 * @returns {{day: string, date: string}} e.g. {day: "Monday", date: "26 Oct 2026"}
 */
function readDate(value) {
    var parts = value.split("-");
    var d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    var dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return {
        day: dayNames[d.getDay()],
        date: d.getDate() + " " + monthNames[d.getMonth()] + " " + d.getFullYear()
    };
}

/**
 * Add Day form: checks the inputs with Bootstrap validation, creates a new DayLog,
 * pushes it into the dayLogs array, refreshes the table and summary, and shows the modal.
 * @param {Event} event - the submit event (stopped so the page does not reload)
 */
function addDayLog(event) {
    event.preventDefault();
    var form = document.getElementById("addDayForm");

    // Bootstrap validation: show red/green feedback and stop if a field is invalid
    if (!form.checkValidity()) {
        form.classList.add("was-validated");
        return;
    }

    var when = readDate(document.getElementById("logDate").value);
    var newLog = new DayLog(
        when.day,
        when.date,
        Number(document.getElementById("logCalories").value),
        Number(document.getElementById("logProtein").value),
        Number(document.getElementById("logCarbs").value),
        Number(document.getElementById("logFat").value)
    );

    dayLogs.push(newLog);   // add to the array
    showAllDays();          // refresh the table and the summary cards

    form.reset();
    form.classList.remove("was-validated");
    showAddedModal("Day added ✓", newLog.day + ", " + newLog.date + " was added to your history.");
}


/* ---------------------------------------------------------------------
   4. START-UP
   --------------------------------------------------------------------- */

/**
 * Runs once the page has loaded. This one file is shared by two pages,
 * so it checks which table exists, fills it, and connects that page's forms and buttons.
 */
function initTables() {
    // Food Database page
    if (document.getElementById("foodTableBody")) {
        displayFoods(foods);
        document.getElementById("searchForm").addEventListener("submit", searchFoods);
        document.getElementById("showAllFoods").addEventListener("click", showAllFoods);
        document.getElementById("addFoodForm").addEventListener("submit", addFood);
    }

    // Progress page
    if (document.getElementById("progressTableBody")) {
        displayDayLogs(dayLogs);
        document.getElementById("daySearchForm").addEventListener("submit", searchDays);
        document.getElementById("showAllDays").addEventListener("click", showAllDays);
        document.getElementById("addDayForm").addEventListener("submit", addDayLog);
    }
}

document.addEventListener("DOMContentLoaded", initTables);
