let courses = [];

function addCourse() {
    const name = document.getElementById("courseName").value;
    const grade = parseFloat(document.getElementById("courseGrade").value);
    const weight = parseFloat(document.getElementById("courseWeight").value);

    if (!name || isNaN(grade) || isNaN(weight)) {
        alert("Please fill all fields correctly!");
        return;
    }

    courses.push({ name, grade, weight });
    updateTable();
}

function updateTable() {
    const table = document.getElementById("courseTable");

    table.innerHTML = `
        <tr>
            <th>Course</th>
            <th>Grade (%)</th>
            <th>Weight</th>
            <th>Remove</th>
        </tr>
    `;

    courses.forEach((c, index) => {
        const row = table.insertRow();
        row.innerHTML = `
            <td>${c.name}</td>
            <td>${c.grade}</td>
            <td>${c.weight}</td>
            <td><button class="remove-btn" onclick="removeCourse(${index})">X</button></td>
        `;
    });
}

function removeCourse(index) {
    courses.splice(index, 1);
    updateTable();
}

function calculateGPA() {
    if (courses.length === 0) {
        alert("Add courses first!");
        return;
    }

    let totalWeighted = 0;
    let totalCredits = 0;

    courses.forEach(c => {
        const gpa = convertToGPA(c.grade);
        totalWeighted += gpa * c.weight;
        totalCredits += c.weight;
    });

    const finalGPA = (totalWeighted / totalCredits).toFixed(2);
    document.getElementById("gpaOutput").innerHTML = "Your GPA: " + finalGPA;
}

function convertToGPA(grade) {
    if (grade >= 90) return 4.0;
    if (grade >= 85) return 3.7;
    if (grade >= 80) return 3.3;
    if (grade >= 75) return 3.0;
    if (grade >= 70) return 2.7;
    if (grade >= 65) return 2.3;
    if (grade >= 60) return 2.0;
    if (grade >= 55) return 1.7;
    if (grade >= 50) return 1.0;
    return 0.0;
}

