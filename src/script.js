let isUpdating = false; // Global flag to track if we're updating or adding
let currentWorkoutId = null; // Global variable to track current workout ID being updated

// Function to add a new workout entry with Update, Delete, and View functionality
function addWorkoutEntry(workout) {
  const workoutLog = document.querySelector("#workout-log");

  // Create the elements dynamically
  const workoutCol = document.createElement("div");
  workoutCol.classList.add("col");
  workoutCol.id = `workout-${workout.id}`;

  const workoutCard = document.createElement("div");
  workoutCard.classList.add("card", "mb-3", "h-100", "workout-card");

  const workoutBody = document.createElement("div");
  workoutBody.classList.add("card-body");

  const workoutTitle = document.createElement("h3");
  workoutTitle.classList.add("card-title");
  workoutTitle.textContent = workout.exercise;

  const workoutHowTo = document.createElement("p");
  workoutHowTo.classList.add("card-text");
  workoutHowTo.innerHTML = `<strong>How To Perform:</strong> ${workout.howTo}`;

  const workoutReps = document.createElement("p");
  workoutReps.classList.add("card-text");
  workoutReps.innerHTML = `<strong>Reps:</strong> ${workout.reps} repetitions`;

  const workoutSets = document.createElement("p");
  workoutSets.classList.add("card-text");
  workoutSets.innerHTML = `<strong>Sets:</strong> ${workout.sets}`;

  const workoutDuration = document.createElement("p");
  workoutDuration.classList.add("card-text");
  workoutDuration.innerHTML = `<strong>Duration:</strong> ${workout.duration} mins`;

  // Create View button
  const viewBtn = document.createElement("button");
  viewBtn.classList.add("viewBtn", "btn", "btn-success", "btn-sm");
  viewBtn.textContent = "View";

  // Attach event listener for View button
  viewBtn.addEventListener("click", () => openViewModal(workout.id));

  // Create Update and Delete buttons
  const updateBtn = document.createElement("button");
  updateBtn.classList.add("updateBtn", "btn", "btn-info", "btn-sm");
  updateBtn.textContent = "Update";
  
  // Attach event listener for Update button
  updateBtn.addEventListener("click", () => openUpdateModal(workout.id));

  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add("deleteBtn", "btn", "btn-dark", "btn-sm", "text-danger");
  deleteBtn.textContent = "Delete";
  
  // Attach event listener for Delete button
  deleteBtn.addEventListener("click", () => deleteWorkout(workout.id));

  // Append elements to build the card
  workoutBody.appendChild(workoutTitle);
  workoutBody.appendChild(workoutHowTo);
  workoutBody.appendChild(workoutReps);
  workoutBody.appendChild(workoutSets);
  workoutBody.appendChild(workoutDuration);
  workoutBody.appendChild(viewBtn);
  workoutBody.appendChild(updateBtn);
  workoutBody.appendChild(deleteBtn);

  workoutCard.appendChild(workoutBody);
  workoutCol.appendChild(workoutCard);

  // Append the complete workout card to the log
  workoutLog.appendChild(workoutCol);
}

// Open Modal for Viewing Workout Details
function openViewModal(id) {
  fetch(`http://localhost:3000/workoutData/${id}`)
    .then((res) => res.json())
    .then((workout) => {
      const modalTitle = document.getElementById("viewModalLabel");
      modalTitle.textContent = workout.exercise;

      const viewDetails = document.getElementById("view-details");
      viewDetails.innerHTML = `
        <p><strong>How To Perform:</strong> ${workout.howTo}</p>
        <p><strong>Reps:</strong> ${workout.reps}</p>
        <p><strong>Sets:</strong> ${workout.sets}</p>
        <p><strong>Duration:</strong> ${workout.duration} mins</p>
      `;

      const viewModal = new bootstrap.Modal(document.getElementById("viewModal"));
      viewModal.show();
    })
    .catch((error) => console.error("Error fetching workout:", error));
}

// Open Modal for both Adding and Updating
function openModal(isUpdate = false, workout = null) {
  isUpdating = isUpdate; // Set the global flag

  const modalTitle = document.getElementById("exampleModalLabel1");
  const submitButton = document.querySelector('#workout-form button[type="submit"]');

  if (isUpdating && workout) {
    modalTitle.textContent = "Update Workout Session";
    submitButton.textContent = "Update Workout";

    // Pre-fill the form with workout data
    document.getElementById("exerciseInput").value = workout.exercise;
    document.getElementById("howtoInput").value = workout.howTo;
    document.getElementById("durationInput").value = workout.duration;
    document.getElementById("repsInput").value = workout.reps;
    document.getElementById("setsInput").value = workout.sets;

    currentWorkoutId = workout.id; // Set the current workout ID
  } else {
    modalTitle.textContent = "Add Workout Session";
    submitButton.textContent = "Add Workout";

    // Clear the form for new entry
    document.getElementById("workout-form").reset();
  }

  // Open the modal
  const workoutModal = new bootstrap.Modal(document.getElementById("exampleModal1"));
  workoutModal.show();
}

// Function to handle form submission (add/update workout)
document.getElementById("workout-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const exercise = document.getElementById("exerciseInput").value;
  const howTo = document.getElementById("howtoInput").value;
  const reps = document.getElementById("repsInput").value;
  const sets = document.getElementById("setsInput").value;
  const duration = document.getElementById("durationInput").value;

  const workoutData = { exercise, duration, howTo, reps, sets };

  if (isUpdating && currentWorkoutId !== null) {
    updateWorkout(currentWorkoutId, workoutData);
  } else {
    addNewWorkout(workoutData);
  }
});

// Add a new workout function
function addNewWorkout(workoutData) {
  fetch("http://localhost:3000/workoutData", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(workoutData),
  })
    .then((res) => res.json())
    .then((newWorkout) => {
      addWorkoutEntry(newWorkout);
      const workoutModal = bootstrap.Modal.getInstance(document.getElementById("exampleModal1"));
      workoutModal.hide();
      document.getElementById("workout-form").reset();
    });
}

// Update workout function
function updateWorkout(id, workoutData) {
  fetch(`http://localhost:3000/workoutData/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(workoutData),
  })
    .then((res) => res.json())
    .then((updatedWorkout) => {
      const workoutElement = document.getElementById(`workout-${id}`);
      workoutElement.querySelector(".card-title").textContent = updatedWorkout.exercise;
      workoutElement.querySelector(".card-text").innerHTML = `
        <strong>How To Perform:</strong> ${updatedWorkout.howTo}
        <br><strong>Reps:</strong> ${updatedWorkout.reps}
        <br><strong>Sets:</strong> ${updatedWorkout.sets}
        <br><strong>Duration:</strong> ${updatedWorkout.duration} mins
      `;
      const workoutModal = bootstrap.Modal.getInstance(document.getElementById("exampleModal1"));
      workoutModal.hide();
      document.getElementById("workout-form").reset();
    });
}

// Delete Workout Function
function deleteWorkout(id) {
  fetch(`http://localhost:3000/workoutData/${id}`, {
    method: "DELETE",
  })
    .then(() => {
      document.getElementById(`workout-${id}`).remove();
    });
}

// Open the modal for updating workout
function openUpdateModal(id) {
  fetch(`http://localhost:3000/workoutData/${id}`)
    .then((res) => res.json())
    .then((workout) => openModal(true, workout))
    .catch((error) => console.error("Error fetching workout:", error));
}

// Fetch workout data and populate the workout log
function fetchWorkoutData() {
  fetch("http://localhost:3000/workoutData")
    .then((res) => res.json())
    .then((workouts) => workouts.forEach(addWorkoutEntry));
}

// Fetch data on page load
fetchWorkoutData();

function fetchData() {
    fetch("http://localhost:3000/bodyMeasurements")
      .then((res) => res.json())
      .then(displayBodyMeasurements);
  
    fetch("http://localhost:3000/fitnessGoals")
      .then((res) => res.json())
      .then(displayFitnessGoals);
  }
  
  // Display body measurements
  function displayBodyMeasurements(bodyMeasurements) {
    const bodyStatsContainer = document.getElementById("body-stats");
    const stats = bodyMeasurements[0]; // Assuming only one set of measurements for simplicity
  
    bodyStatsContainer.innerHTML = `
        <img src="${stats.image}" alt="body stats image" class="progress-image" />
      <p><strong>Weight:</strong> ${stats.weight_kg} kg</p>
      <p><strong>Height:</strong> ${stats.height_cm} cm</p>
      <p><strong>Muscle Mass:</strong> ${stats.muscle_mass}%</p>
    `;
  
    // Pre-fill modal with existing data
    document.getElementById("weightInput").value = stats.weight_kg;
    document.getElementById("heightInput").value = stats.height_cm;
    document.getElementById("muscleMassInput").value = stats.muscle_mass;
  }
  
  // Display fitness goals
  function displayFitnessGoals(fitnessGoals) {
    const goalContainer = document.getElementById("fitness-goals");
    const goal = fitnessGoals[0]; // Assuming only one goal for simplicity
  
    goalContainer.innerHTML = `
    <img src="${goal.image}" alt="fitness goal image" class="progress-image" />
      <p><strong>Goal Type:</strong> ${goal.goal_type}</p>
      <p><strong>Target:</strong> ${goal.target}</p>
      <p><strong>Progress:</strong> ${goal.progress}%</p>
    `;
  
    // Pre-fill modal with existing data
    document.getElementById("goalTypeInput").value = goal.goal_type;
    document.getElementById("targetInput").value = goal.target;
    document.getElementById("progressInput").value = goal.progress;
  }
  
  // Handle form submission for updating body measurements
  document.getElementById("body-measurements-form").addEventListener("submit", function (e) {
    e.preventDefault();
  
    const weight = document.getElementById("weightInput").value;
    const height = document.getElementById("heightInput").value;
    const muscleMass = document.getElementById("muscleMassInput").value;
  
    const updatedData = {
      weight_kg: weight,
      height_cm: height,
      muscle_mass: muscleMass
    };
  
    fetch(`http://localhost:3000/bodyMeasurements/1`, { // Assuming id=1 for simplicity
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
    })
      .then((res) => res.json())
      .then(() => {
        displayBodyMeasurements([updatedData]);
        const modal = bootstrap.Modal.getInstance(document.getElementById("bodyMeasurementsModal"));
        modal.hide();
      });
  });
  
  // Handle form submission for updating fitness goals
  document.getElementById("fitness-goals-form").addEventListener("submit", function (e) {
    e.preventDefault();
  
    const goalType = document.getElementById("goalTypeInput").value;
    const target = document.getElementById("targetInput").value;
    const progress = document.getElementById("progressInput").value;
  
    const updatedGoal = {
      goal_type: goalType,
      target: target,
      progress: progress
    };
  
    fetch(`http://localhost:3000/fitnessGoals/1`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedGoal),
    })
      .then((res) => res.json())
      .then(() => {
        displayFitnessGoals([updatedGoal]); // Update UI with new data
        const modal = bootstrap.Modal.getInstance(document.getElementById("fitnessGoalsModal"));
        modal.hide();
      });
  });
  
  // Fetch and display data on page load
  fetchData();
  
  // Event listeners to open modals
  document.getElementById("editBodyMeasurementsBtn").addEventListener("click", function () {
    const modal = new bootstrap.Modal(document.getElementById("bodyMeasurementsModal"));
    modal.show();
  });
  
  document.getElementById("editFitnessGoalsBtn").addEventListener("click", function () {
    const modal = new bootstrap.Modal(document.getElementById("fitnessGoalsModal"));
    modal.show();
  });
  