const categories = {
    "POWER LIFTS": ["DEADLIFT", "BENCH PRESS", "SHOULDER PRESS", "BACK SQUAT"],
    "OLYMPIC LIFTS": ["SNATCH", "CLEAN", "JERK"],
    "ENDURANCE": [
        "1 MILE RUN", "2 MILE RUN", "RUN 5KM", "RUN 10KM",
        "2 KM ROW", "3 KM ROW", "5 KM ROW", "10 KM ROW"
    ],
    "SPEEDS": [
        "100 M RUN", "200 M RUN", "400 M RUN", "800 M RUN",
        "100 M ROW", "250 M ROW", "500 M ROW", "1 KM ROW"
    ],
    "BODYWEIGHT METCONS": [
        "CINDY", "ANGIE", "ANNIE", "BASELINE", "CROSSFIT OPEN 12.1 RX'D", 
        "JT", "MARY", "100 BURPEES FOR TIME", "TABATA THIS!", "30 MUSCLE-UPS FOR TIME"
    ],
    "LIGHT METCONS": [
        "FRAN", "HELEN", "GRACE", "DIANE", "FIGHT GONE BAD", 
        "NANCY", "KAREN", "ELIZABETH", "JACKIE"
    ],
    "HEAVY METCONS": [
        "ISABEL", "NATE", "DT", "AMANDA", "CROSSFIT OPEN 13.1 RX'D",
        "CROSSFIT OPEN 16.2 RX'D", "LINDA", "2008 CF GAMES - DEADLIFT & BURPEES"
    ],
    "LONG METCONS": [
        "MURPH", "FILTHY FIFTY", "KELLY", "BARBARA", "CROSSFIT OPEN 14.5/16.5 RX'D",
        "THE GHOST", "THE SEVEN", "LOREDO", "WITTMAN", "JERRY"
    ],
    "GYMNASTIC MAXES": [
        "MAX STRICT PULL-UPS", "MAX KIPPING PULL-UPS", "MAX PUSH-UPS", "MAX RING DIPS", 
        "MAX STRICT RING DIPS", "MAX BAR MUSCLE-UPS", "MAX RING MUSCLE-UPS",
        "MAX STRICT RING MUSCLE-UPS", "MAX HANDSTAND PUSH-UPS", 
        "MAX STRICT HANDSTAND PUSH-UPS"
    ]
};

const categorySelect = document.getElementById('category');
const exerciseSelect = document.getElementById('exercise');
const mainContainer = document.getElementById('mainContainer');

let records = JSON.parse(localStorage.getItem('records')) || [];
let currentIndex = {};

// Populate categories
function populateCategories() {
    for (const category in categories) {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    }
}

// Populate exercises
function populateExercises() {
    const selectedCategory = categorySelect.value;
    exerciseSelect.innerHTML = '';
    if (categories[selectedCategory]) {
        categories[selectedCategory].forEach(exercise => {
            const option = document.createElement('option');
            option.value = exercise;
            option.textContent = exercise;
            exerciseSelect.appendChild(option);
        });
    }
}

// Handle form submission
function handleFormSubmit(event) {
    event.preventDefault();
    const username = document.getElementById('username').value.trim();
    const category = categorySelect.value;
    const exercise = exerciseSelect.value;
    const recordType = document.getElementById('recordType').value;
    const recordValue = parseFloat(document.getElementById('record').value);
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '.');

    if (!username || !category || !exercise || isNaN(recordValue)) return;

    records.push({ id: Date.now(), username, date, category, exercise, recordType, recordValue });
    localStorage.setItem('records', JSON.stringify(records));

    updateRankings();
    document.getElementById('recordForm').reset();
}

// Update rankings
function updateRankings() {
    mainContainer.innerHTML = '';

    // Group records by exercise
    const groupedByExercise = {};
    records.forEach(record => {
        if (!groupedByExercise[record.exercise]) {
            groupedByExercise[record.exercise] = [];
        }
        groupedByExercise[record.exercise].push(record);
    });

    // Create layout for each exercise
    for (const exercise in groupedByExercise) {
        const section = document.createElement('section');
        section.classList.add('exercise');

        const table = document.createElement('table');
        table.classList.add('ranking-table');

        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>Rank</th>
                <th>Username</th>
                <th>Date</th>
                <th>Record</th>
                <th>Type</th>
                <th>Action</th>
            </tr>
        `;
        table.appendChild(thead);

        const tbody = document.createElement('tbody');

        const sortedRecords = groupedByExercise[exercise].sort((a, b) => {
            if (a.recordType === 'weight') return b.recordValue - a.recordValue;
            return a.recordValue - b.recordValue;
        });

        sortedRecords.forEach((record, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${record.username}</td>
                <td>${record.date}</td>
                <td>${record.recordValue}</td>
                <td>${record.recordType}</td>
                <td><button onclick="promptDeleteRecord(${record.id})">Delete</button></td>
            `;
            tbody.appendChild(row);
        });

        table.appendChild(tbody);

        const exerciseHeader = document.createElement('h3');
        exerciseHeader.textContent = exercise;
        section.appendChild(exerciseHeader);
        section.appendChild(table);

        mainContainer.appendChild(section);

        currentIndex[exercise] = 0;
        setInterval(() => rotateRecords(exercise, tbody), 3000);
    }
}

// Rotate the records displayed for an exercise
function rotateRecords(exercise, tbody) {
    const recordsForExercise = tbody.children;
    const length = recordsForExercise.length;
    if (length > 3) {
        Array.from(recordsForExercise).forEach((record, index) => {
            record.style.display = 'none';
        });

        for (let i = currentIndex[exercise]; i < currentIndex[exercise] + 1; i++) {
            const idx = i % length;
            recordsForExercise[idx].style.display = '';
        }

        currentIndex[exercise] = (currentIndex[exercise] + 1) % length;
    }
}

// Prompt for password before deleting a record
function promptDeleteRecord(recordId) {
    const password = prompt('Enter admin password to delete record:');
    if (password === '4587') {
        deleteRecord(recordId);
    } else {
        alert('Incorrect password.');
    }
}

// Delete a record
function deleteRecord(recordId) {
    records = records.filter(record => record.id !== recordId);
    localStorage.setItem('records', JSON.stringify(records));
    updateRankings();
}

// Initialize
populateCategories();
populateExercises();
updateRankings();

categorySelect.addEventListener('change', populateExercises);
document.getElementById('recordForm').addEventListener('submit', handleFormSubmit);
