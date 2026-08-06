const STORAGE_KEY = "gradeGeniusCourses";
const SCALE_KEY = "gradeGeniusScale";

let courses = loadCourses();

const courseForm = document.getElementById("courseForm");
const courseNameInput = document.getElementById("courseName");
const courseGradeInput = document.getElementById("courseGrade");
const courseWeightInput = document.getElementById("courseWeight");
const gpaScaleSelect = document.getElementById("gpaScale");

const courseTableBody = document.getElementById("courseTableBody");
const courseCountOutput = document.getElementById("courseCount");
const totalCreditsOutput = document.getElementById("totalCredits");
const gpaOutput = document.getElementById("gpaOutput");

const calculateButton = document.getElementById("calculateButton");
const resetButton = document.getElementById("resetButton");

const messageOutput = document.getElementById("message");
const scaleNote = document.getElementById("scaleNote");

function getSelectedScale() {
    return Number(gpaScaleSelect.value);
}

function loadCourses() {
    try {
        const savedCourses = localStorage.getItem(STORAGE_KEY);

        if (!savedCourses) {
            return [];
        }

        const parsedCourses = JSON.parse(savedCourses);

        return Array.isArray(parsedCourses) ? parsedCourses : [];
    } catch (error) {
        console.error("Could not load saved courses:", error);
        return [];
    }
}

function saveCourses() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
}

function showMessage(text, type = "error") {
    messageOutput.textContent = text;
    messageOutput.className = `message ${type}`;

    window.clearTimeout(showMessage.timeoutId);

    showMessage.timeoutId = window.setTimeout(() => {
        messageOutput.textContent = "";
        messageOutput.className = "message";
    }, 3500);
}

function updateScaleSettings() {
    const scale = getSelectedScale();

    courseGradeInput.max = String(scale);
    courseGradeInput.placeholder = `0.0 – ${scale.toFixed(1)}`;

    scaleNote.textContent =
        `Enter grade points from 0.0 to ${scale.toFixed(1)}.`;

    localStorage.setItem(SCALE_KEY, String(scale));

    const invalidCourseExists = courses.some(
        course => course.grade > scale
    );

    if (invalidCourseExists) {
        courses = [];
        saveCourses();

        showMessage(
            "Courses were cleared because the GPA scale changed.",
            "info"
        );
    }

    updateTable();
}

function addCourse(event) {
    event.preventDefault();

    const name = courseNameInput.value.trim();
    const grade = Number(courseGradeInput.value);
    const weight = Number(courseWeightInput.value);
    const scale = getSelectedScale();

    if (!name) {
        showMessage("Enter a course name.");
        courseNameInput.focus();
        return;
    }

    if (
        !Number.isFinite(grade) ||
        grade < 0 ||
        grade > scale
    ) {
        showMessage(
            `Grade point must be between 0.0 and ${scale.toFixed(1)}.`
        );
        courseGradeInput.focus();
        return;
    }

    if (!Number.isFinite(weight) || weight <= 0) {
        showMessage("Credit weight must be greater than zero.");
        courseWeightInput.focus();
        return;
    }

    courses.push({
        id: crypto.randomUUID(),
        name,
        grade,
        weight
    });

    saveCourses();
    updateTable();

    courseForm.reset();
    courseNameInput.focus();

    showMessage(`${name} was added.`, "success");
}

function removeCourse(courseId) {
    courses = courses.filter(course => course.id !== courseId);

    saveCourses();
    updateTable();
}

function calculateGPA() {
    if (courses.length === 0) {
        showMessage("Add at least one course before calculating.");
        return;
    }

    const totalWeightedPoints = courses.reduce(
        (sum, course) => sum + course.grade * course.weight,
        0
    );

    const totalCredits = courses.reduce(
        (sum, course) => sum + course.weight,
        0
    );

    if (totalCredits <= 0) {
        showMessage("Total credit weight must be greater than zero.");
        return;
    }

    const finalGPA = totalWeightedPoints / totalCredits;

    gpaOutput.textContent =
        `${finalGPA.toFixed(2)} / ${getSelectedScale().toFixed(1)}`;
}

function resetAllCourses() {
    if (courses.length === 0) {
        showMessage("There are no courses to reset.", "info");
        return;
    }

    const shouldReset = window.confirm(
        "Remove every course and reset the GPA?"
    );

    if (!shouldReset) {
        return;
    }

    courses = [];
    saveCourses();
    updateTable();

    showMessage("All courses were removed.", "info");
}

function updateTable() {
    courseTableBody.innerHTML = "";

    if (courses.length === 0) {
        courseTableBody.innerHTML = `
            <tr class="empty-row">
                <td colspan="5">No courses added yet.</td>
            </tr>
        `;
    } else {
        courses.forEach(course => {
            const row = document.createElement("tr");
            const weightedPoints = course.grade * course.weight;

            row.innerHTML = `
                <td data-label="Course">
                    ${escapeHtml(course.name)}
                </td>

                <td data-label="Grade Point">
                    ${course.grade.toFixed(2)}
                </td>

                <td data-label="Credits">
                    ${course.weight.toFixed(2)}
                </td>

                <td data-label="Weighted Points">
                    ${weightedPoints.toFixed(2)}
                </td>

                <td data-label="Remove">
                    <button
                        type="button"
                        class="remove-btn"
                        aria-label="Remove ${escapeHtml(course.name)}"
                        data-course-id="${course.id}"
                    >
                        Remove
                    </button>
                </td>
            `;

            courseTableBody.appendChild(row);
        });
    }

    updateSummary();
}

function updateSummary() {
    const totalCredits = courses.reduce(
        (sum, course) => sum + course.weight,
        0
    );

    courseCountOutput.textContent = String(courses.length);
    totalCreditsOutput.textContent = totalCredits.toFixed(1);

    if (courses.length === 0) {
        gpaOutput.textContent = "—";
        return;
    }

    calculateGPA();
}

function escapeHtml(value) {
    const element = document.createElement("div");
    element.textContent = value;
    return element.innerHTML;
}

courseForm.addEventListener("submit", addCourse);

calculateButton.addEventListener("click", calculateGPA);

resetButton.addEventListener("click", resetAllCourses);

gpaScaleSelect.addEventListener("change", updateScaleSettings);

courseTableBody.addEventListener("click", event => {
    const removeButton = event.target.closest(".remove-btn");

    if (!removeButton) {
        return;
    }

    removeCourse(removeButton.dataset.courseId);
});

const savedScale = localStorage.getItem(SCALE_KEY);

if (savedScale === "12") {
    gpaScaleSelect.value = "12";
}

updateScaleSettings();