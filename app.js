document.addEventListener('DOMContentLoaded', () => {
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const todoList = document.getElementById('todo-list');

    // State
    let todos = JSON.parse(localStorage.getItem('premium_todos')) || [];

    // Icons
    const checkIcon = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
    `;

    const trashIcon = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 6h18"></path>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
    `;

    // Render Initial Todos
    renderTodos();

    // Event Listeners
    todoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = todoInput.value.trim();
        if (text !== '') {
            addTodo(text);
            todoInput.value = '';
            todoInput.focus();
        }
    });

    todoList.addEventListener('click', (e) => {
        // Handle Complete
        const checkbox = e.target.closest('.checkbox');
        const todoText = e.target.closest('.todo-text');
        
        if (checkbox || todoText) {
            const li = (checkbox || todoText).closest('.todo-item');
            toggleTodo(li.dataset.id);
        }

        // Handle Delete
        const deleteBtn = e.target.closest('.delete-btn');
        if (deleteBtn) {
            const li = deleteBtn.closest('.todo-item');
            deleteTodoWithAnimation(li);
        }
    });

    // Functions
    function renderTodos() {
        todoList.innerHTML = '';
        todos.forEach(todo => {
            const li = createTodoElement(todo);
            todoList.appendChild(li);
        });
    }

    function createTodoElement(todo) {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.dataset.id = todo.id;

        li.innerHTML = `
            <div class="todo-item-left">
                <div class="checkbox" aria-label="Toggle Complete">
                    ${checkIcon}
                </div>
                <span class="todo-text">${escapeHTML(todo.text)}</span>
            </div>
            <button class="delete-btn" aria-label="Delete Todo">
                ${trashIcon}
            </button>
        `;

        return li;
    }

    function addTodo(text) {
        const newTodo = {
            id: Date.now().toString(),
            text: text,
            completed: false
        };
        todos.push(newTodo);
        saveTodos();
        
        const li = createTodoElement(newTodo);
        todoList.appendChild(li);
    }

    function toggleTodo(id) {
        const todoIndex = todos.findIndex(t => t.id === id);
        if (todoIndex > -1) {
            todos[todoIndex].completed = !todos[todoIndex].completed;
            saveTodos();
            
            const li = document.querySelector(`.todo-item[data-id="${id}"]`);
            if (li) {
                li.classList.toggle('completed');
            }
        }
    }

    function deleteTodoWithAnimation(li) {
        const id = li.dataset.id;
        li.classList.add('removing');
        
        // Wait for animation to finish
        li.addEventListener('animationend', () => {
            todos = todos.filter(t => t.id !== id);
            saveTodos();
            li.remove();
        });
    }

    function saveTodos() {
        localStorage.setItem('premium_todos', JSON.stringify(todos));
    }

    // Utility
    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }
});
