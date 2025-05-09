/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// Wait for the deviceready event before using any of Cordova's device APIs.
document.addEventListener('deviceready', onDeviceReady, false);

// Global variables for storing tasks
let tasks = [];
let completedTasks = [];

function onDeviceReady() {
    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
    document.getElementById('deviceready').classList.add('ready');
    
    // Initialize the app
    initApp();
}

function initApp() {
    // Load tasks from local storage if available
    loadTasks();
    
    // Add event listeners
    document.getElementById('add-task').addEventListener('click', addTask);
    document.getElementById('task-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTask();
        }
    });
    
    // Initial render of tasks
    renderTasks();
    renderCompletedTasks();
}

function loadTasks() {
    // Retrieve tasks from local storage
    const savedTasks = localStorage.getItem('tasks');
    const savedCompletedTasks = localStorage.getItem('completedTasks');
    
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    }
    
    if (savedCompletedTasks) {
        completedTasks = JSON.parse(savedCompletedTasks);
    }
}

function saveTasks() {
    // Save tasks to local storage
    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('completedTasks', JSON.stringify(completedTasks));
}

function addTask() {
    const taskInput = document.getElementById('task-input');
    const taskText = taskInput.value.trim();
    
    if (taskText !== '') {
        // Create new task object
        const newTask = {
            id: Date.now(),
            text: taskText,
            date: new Date().toLocaleString()
        };
        
        // Add to tasks array
        tasks.push(newTask);
        
        // Save tasks
        saveTasks();
        
        // Clear input
        taskInput.value = '';
        
        // Render tasks
        renderTasks();
        
        // Add a gentle animation to show success
        const tasksList = document.getElementById('tasks-list');
        tasksList.classList.add('flash');
        setTimeout(() => {
            tasksList.classList.remove('flash');
        }, 500);
    }
}

function completeTask(id) {
    // Find the task
    const taskIndex = tasks.findIndex(task => task.id === id);
    
    if (taskIndex !== -1) {
        // Move the task to completed tasks
        const completedTask = tasks[taskIndex];
        completedTask.completedDate = new Date().toLocaleString();
        completedTasks.push(completedTask);
        
        // Remove from pending tasks
        tasks.splice(taskIndex, 1);
        
        // Save tasks
        saveTasks();
        
        // Render both lists
        renderTasks();
        renderCompletedTasks();
    }
}

function deleteTask(id, isCompleted = false) {
    if (isCompleted) {
        // Remove from completed tasks
        const taskIndex = completedTasks.findIndex(task => task.id === id);
        if (taskIndex !== -1) {
            completedTasks.splice(taskIndex, 1);
        }
    } else {
        // Remove from pending tasks
        const taskIndex = tasks.findIndex(task => task.id === id);
        if (taskIndex !== -1) {
            tasks.splice(taskIndex, 1);
        }
    }
    
    // Save tasks
    saveTasks();
    
    // Render both lists
    renderTasks();
    renderCompletedTasks();
}

function restoreTask(id) {
    // Find the task in completed tasks
    const taskIndex = completedTasks.findIndex(task => task.id === id);
    
    if (taskIndex !== -1) {
        // Move the task back to pending tasks
        const task = completedTasks[taskIndex];
        delete task.completedDate; // Remove the completed date
        tasks.push(task);
        
        // Remove from completed tasks
        completedTasks.splice(taskIndex, 1);
        
        // Save tasks
        saveTasks();
        
        // Render both lists
        renderTasks();
        renderCompletedTasks();
    }
}

function renderTasks() {
    const tasksList = document.getElementById('tasks-list');
    tasksList.innerHTML = '';
    
    if (tasks.length === 0) {
        tasksList.innerHTML = '<li class="empty-message">No tasks yet. Add one above!</li>';
        return;
    }
    
    tasks.forEach(task => {
        const li = document.createElement('li');
        
        const taskText = document.createElement('span');
        taskText.className = 'task-text';
        taskText.textContent = task.text;
        
        const taskDate = document.createElement('small');
        taskDate.className = 'task-date';
        taskDate.textContent = `Added: ${task.date}`;
        
        const buttonsDiv = document.createElement('div');
        buttonsDiv.className = 'task-buttons';
        
        const completeButton = document.createElement('button');
        completeButton.className = 'complete-btn';
        completeButton.textContent = 'Complete';
        completeButton.addEventListener('click', () => completeTask(task.id));
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-btn';
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => deleteTask(task.id));
        
        buttonsDiv.appendChild(completeButton);
        buttonsDiv.appendChild(deleteButton);
        
        li.appendChild(taskText);
        li.appendChild(document.createElement('br'));
        li.appendChild(taskDate);
        li.appendChild(buttonsDiv);
        
        tasksList.appendChild(li);
    });
}

function renderCompletedTasks() {
    const completedList = document.getElementById('completed-list');
    completedList.innerHTML = '';
    
    if (completedTasks.length === 0) {
        completedList.innerHTML = '<li class="empty-message">No completed tasks yet.</li>';
        return;
    }
    
    completedTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'completed';
        
        const taskText = document.createElement('span');
        taskText.className = 'task-text';
        taskText.textContent = task.text;
        
        const taskDates = document.createElement('small');
        taskDates.className = 'task-date';
        taskDates.innerHTML = `Added: ${task.date}<br>Completed: ${task.completedDate}`;
        
        const buttonsDiv = document.createElement('div');
        buttonsDiv.className = 'task-buttons';
        
        const restoreButton = document.createElement('button');
        restoreButton.className = 'restore-btn';
        restoreButton.textContent = 'Restore';
        restoreButton.addEventListener('click', () => restoreTask(task.id));
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-btn';
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => deleteTask(task.id, true));
        
        buttonsDiv.appendChild(restoreButton);
        buttonsDiv.appendChild(deleteButton);
        
        li.appendChild(taskText);
        li.appendChild(document.createElement('br'));
        li.appendChild(taskDates);
        li.appendChild(buttonsDiv);
        
        completedList.appendChild(li);
    });
}

// Add this to handle offline/online status
document.addEventListener('offline', function() {
    // Show offline message
    const container = document.querySelector('.container');
    const offlineMessage = document.createElement('div');
    offlineMessage.id = 'offline-message';
    offlineMessage.textContent = 'You are currently offline. Changes will be saved locally.';
    offlineMessage.style.backgroundColor = '#f39c12';
    offlineMessage.style.color = 'white';
    offlineMessage.style.padding = '10px';
    offlineMessage.style.textAlign = 'center';
    offlineMessage.style.position = 'fixed';
    offlineMessage.style.top = '0';
    offlineMessage.style.left = '0';
    offlineMessage.style.width = '100%';
    offlineMessage.style.zIndex = '1000';
    
    container.insertBefore(offlineMessage, container.firstChild);
}, false);

document.addEventListener('online', function() {
    // Remove offline message if it exists
    const offlineMessage = document.getElementById('offline-message');
    if (offlineMessage) {
        offlineMessage.remove();
    }
}, false);