// Run our code after the DOM content is loaded
document.addEventListener('DOMContentLoaded', () => {
  const taskList = document.getElementById('task-list');
  const taskInput = document.getElementById('new-task');
  const addBtn = document.getElementById('add-btn');
  
  // Function to add a task item to the DOM list
  function addTaskToDOM(task) {
    const li = document.createElement('li');
    li.dataset.id = task.id;
    li.textContent = task.description;
    if (task.done) {
      li.classList.add('done');
    }
    
    // Create a checkbox to mark done/undone
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = !!task.done;
    checkbox.addEventListener('change', () => {
      const newDoneState = checkbox.checked;
      // Send PUT request to update task's done status
      fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ done: newDoneState })
      })
      .then(response => {
        if (!response.ok) throw new Error('Failed to update task');
        return response.json();
      })
      .then(updatedTask => {
        // Update the class based on new done status
        if (updatedTask.done) {
          li.classList.add('done');
        } else {
          li.classList.remove('done');
        }
      })
      .catch(err => {
        console.error(err);
        // If an error occurs, revert the checkbox state in the UI
        checkbox.checked = !newDoneState;
      });
    });
    
    // Create a delete button for the task
    const delBtn = document.createElement('button');
    delBtn.textContent = 'Delete';
    delBtn.style.marginLeft = '10px';
    delBtn.addEventListener('click', () => {
      // Send DELETE request to delete the task
      fetch(`/api/tasks/${task.id}`, { method: 'DELETE' })
      .then(response => {
        if (!response.ok) throw new Error('Failed to delete task');
        // Remove the task <li> from the DOM
        taskList.removeChild(li);
      })
      .catch(err => console.error(err));
    });
    
    // Assemble the list item
    li.prepend(checkbox);       // put checkbox at the start
    li.appendChild(delBtn);     // put delete button at the end
    taskList.appendChild(li);
  }
  
  // Fetch existing tasks from the server on page load
  fetch('/api/tasks')
    .then(response => response.json())
    .then(tasks => {
      tasks.forEach(task => addTaskToDOM(task));
    })
    .catch(err => console.error('Error loading tasks:', err));
  
  // Handle the Add button click to create a new task
  addBtn.addEventListener('click', () => {
    const description = taskInput.value.trim();
    if (description === '') return;  // ignore empty input
    // Send POST request to create a new task
    fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: description })
    })
    .then(response => {
      if (!response.ok) throw new Error('Failed to add task');
      return response.json();
    })
    .then(newTask => {
      addTaskToDOM(newTask);   // add the new task to the list
      taskInput.value = '';    // clear the input field
    })
    .catch(err => console.error(err));
  });
});
