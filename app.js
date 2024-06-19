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

let records = JSON.parse(localStorage.getItem('records')) || [];
let selectedExercise = null;

const categorySelect = document.getElementById('category');
const exerciseSelect = document.getElementById('exercise');
const recordTypeInputs = document.getElementById('recordTypeInputs');
const exerciseList = document.getElementById('exerciseList');
const recordDisplay = document.getElementById('recordDisplay');
const currentExerciseTitle = document.getElementById('exerciseTitle');
const firstPlaceName = document.getElementById('firstPlaceName');
const secondPlaceName = document.getElementById('secondPlaceName');
const thirdPlaceName = document.getElementById('thirdPlaceName');
const firstPlaceImg = document.getElementById('firstPlaceImg');
const secondPlaceImg = document.getElementById('secondPlaceImg');
const thirdPlaceImg = document.getElementById('thirdPlaceImg');

// Populate categories
function populateCategories() {
    categorySelect.innerHTML = '';
    Object.keys(categories).forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
}

// Populate exercises
function populateExercises() {
    const selectedCategory = categorySelect.value;
    exerciseSelect.innerHTML = '';
    categories[selectedCategory].forEach(exercise => {
        const option = document.createElement('option');
        option.value = exercise;
        option.textContent = exercise;
        exerciseSelect.appendChild(option);
    });
    updateRecordTypeInputs();
}

function updateRecordTypeInputs() {
    const selectedCategory = categorySelect.value;
    let inputFields = '';

    if (["POWER LIFTS", "OLYMPIC LIFTS"].includes(selectedCategory)) {
        inputFields = `
            <input type="number" id="record" name="record" placeholder="Record (LBS)" required>
            <input type="hidden" id="recordType" value="weight">
        `;
    } else if (selectedCategory === "GYMNASTIC MAXES") {
        inputFields = `
            <input type="number" id="record" name="record" placeholder="Record (Reps)" required>
            <input type="hidden" id="recordType" value="reps">
        `;
    } else {
        inputFields = `
            <input type="number" id="minutes" name="minutes" placeholder="Minutes" min="0" required>
            <input type="number" id="seconds" name="seconds" placeholder="Seconds" min="0" max="59" required>
            <input type="hidden" id="recordType" value="time">
        `;
    }
    recordTypeInputs.innerHTML = inputFields;
}

// Populate exercise list
function populateExerciseList() {
    exerciseList.innerHTML = '';
    for (const category in categories) {
        const categoryDiv = document.createElement('div');
        categoryDiv.classList.add('category');

        const categoryHeader = document.createElement('h3');
        categoryHeader.textContent = category;
        categoryDiv.appendChild(categoryHeader);

        const exerciseUl = document.createElement('ul');
        categories[category].forEach(exercise => {
            const exerciseLi = document.createElement('li');
            exerciseLi.textContent = exercise;
            exerciseLi.addEventListener('click', () => {
                selectedExercise = exercise;
                displayRecords(exercise);
            });
            exerciseUl.appendChild(exerciseLi);
        });

        categoryDiv.appendChild(exerciseUl);
        exerciseList.appendChild(categoryDiv);
    }
}

// Display records for the selected exercise
function displayRecords(exercise) {
    recordDisplay.innerHTML = '';
    currentExerciseTitle.textContent = exercise;

    const exerciseRecords = records.filter(record => record.exercise === exercise);
    const sortedRecords = exerciseRecords.sort((a, b) => {
        if (a.recordType === 'weight') return b.recordValue - a.recordValue;
        if (a.recordType === 'reps') return b.recordValue - a.recordValue;
        return a.recordValue - b.recordValue;
    });

    if (sortedRecords.length > 0) {
        const [first, second, third] = sortedRecords;
        firstPlaceName.textContent = first ? first.username : '-';
        secondPlaceName.textContent = second ? second.username : '-';
        thirdPlaceName.textContent = third ? third.username : '-';
    }

    sortedRecords.forEach((record, index) => {
        const recordElement = document.createElement('div');
        recordElement.classList.add('record', `rank-${index + 1}`);
        recordElement.innerHTML = `
            <span>${index + 1}</span>
            <span>${record.username}</span>
            <span>${record.date}</span>
            <span>${record.recordType === 'time' ? `${Math.floor(record.recordValue / 60)}m ${record.recordValue % 60}s` : record.recordValue} ${record.recordType}</span>
            <button onclick="promptDeleteRecord(${record.id})">Delete</button>
        `;
        recordDisplay.appendChild(recordElement);
    });
}

// Handle form submission
function handleFormSubmit(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const category = categorySelect.value;
    const exercise = exerciseSelect.value;
    const recordType = document.getElementById('recordType').value;

    let recordValue;
    if (recordType === 'time') {
        const minutes = parseInt(document.getElementById('minutes').value, 10);
        const seconds = parseInt(document.getElementById('seconds').value, 10);
        recordValue = minutes * 60 + seconds;
    } else {
        recordValue = parseFloat(document.getElementById('record').value);
    }

    const date = new Date().toISOString().split('T')[0].replace(/-/g, '.').slice(2);
    const recordId = Date.now();

    records.push({ id: recordId, username, date, category, exercise, recordType, recordValue });
    localStorage.setItem('records', JSON.stringify(records));

    displayRecords(selectedExercise);
    document.getElementById('recordForm').reset();
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
    displayRecords(selectedExercise);
}

// Image upload handlers
document.getElementById('firstPlaceFile').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            firstPlaceImg.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('secondPlaceFile').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            secondPlaceImg.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('thirdPlaceFile').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            thirdPlaceImg.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Initialize
document.getElementById('recordForm').addEventListener('submit', handleFormSubmit);
categorySelect.addEventListener('change', populateExercises);
populateCategories();
populateExercises();
populateExerciseList();
