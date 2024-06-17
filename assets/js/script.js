// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Generate a unique task id
function generateTaskId() {
    return nextId++;
}

// Save tasks and nextId to localStorage
function saveToLocalStorage() {
    localStorage.setItem("tasks", JSON.stringify(taskList));
    localStorage.setItem("nextId", JSON.stringify(nextId));
}

// Create a task card
function createTaskCard(task) {
    const card = $(`
        <div class="card mb-3" data-id="${task.id}" draggable="true">
            <div class="card-body">
                <h5 class="card-title">${task.title}</h5>
                <p class="card-text">${task.description}</p>
                <p class="card-text"><small class="text-muted">Deadline: ${task.deadline}</small></p>
                <button class="btn btn-danger btn-sm delete-button">Delete</button>
            </div>
        </div>
    `);

    const now = dayjs();
    const deadline = dayjs(task.deadline);
    if (deadline.isBefore(now)) {
        card.addClass('bg-danger text-white');
    } else if (deadline.diff(now, 'day') < 3) {
        card.addClass('bg-warning text-dark');
    }

    card.find('.delete-button').click(() => handleDeleteTask(task.id));

    return card;
}

// Render the task list and make cards draggable
function renderTaskList() {
    $("#todo-cards, #in-progress-cards, #done-cards").empty();

    taskList.forEach(task => {
        const card = createTaskCard(task);
        $(`#${task.state}-cards`).append(card);
    });

    $(".card[draggable=true]").on('dragstart', function (event) {
        event.originalEvent.dataTransfer.setData('text/plain', $(this).data('id'));
    });
}

// Handle adding a new task
function handleAddTask(event) {
    event.preventDefault();
    
    const title = $("#task-title").val();
    const description = $("#task-description").val();
    const deadline = $("#task-deadline").val();
    const taskId = generateTaskId();
    const task = { id: taskId, title, description, deadline, state: 'todo' };

    taskList.push(task);
    saveToLocalStorage();
    renderTaskList();

    $("#task-form")[0].reset();
    $('#formModal').modal('hide');
}

// Handle deleting a task
function handleDeleteTask(taskId) {
    taskList = taskList.filter(task => task.id !== taskId);
    saveToLocalStorage();
    renderTaskList();
}

// Handle dropping a task into a new status lane
function handleDrop(event) {
    event.preventDefault(); // Prevent default behavior
    
    const taskId = event.originalEvent.dataTransfer.getData('text/plain');
    const newState = $(this).attr('id');
    
    if (!newState) {
        console.error('Drop target does not have an id attribute.');
        return;
    }

    const newStateTrimmed = newState.replace('-cards', '');
    
    console.log('Dropping task:', taskId, 'into new state:', newStateTrimmed);
    
    taskList = taskList.map(task => {
        if (task.id == taskId) {
            task.state = newStateTrimmed;
        }
        return task;
    });

    saveToLocalStorage();
    renderTaskList();
}

$(document).ready(function () {
    renderTaskList();

    $("#task-form").on('submit', handleAddTask);

    $(".lane").on('dragover', function (event) {
        event.preventDefault();
    }).on('drop', handleDrop);

    $("#task-deadline").datepicker({
        dateFormat: 'yy-mm-dd'
    });
});