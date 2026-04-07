document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_KEY = 'calorie_tracker_data';
    
    const elements = {
        dateDisplay: document.getElementById('date-display'),
        goalBtn: document.getElementById('goal-btn'),
        goalValue: document.getElementById('goal-value'),
        goalInput: document.getElementById('goal-input'),
        progressBar: document.getElementById('progress-bar'),
        calorieCount: document.getElementById('calorie-count'),
        remainingValue: document.getElementById('remaining-value'),
        mealsValue: document.getElementById('meals-value'),
        proteinTotal: document.getElementById('protein-total'),
        carbsTotal: document.getElementById('carbs-total'),
        fatTotal: document.getElementById('fat-total'),
        addForm: document.getElementById('add-form'),
        foodName: document.getElementById('food-name'),
        foodCalories: document.getElementById('food-calories'),
        foodProtein: document.getElementById('food-protein'),
        foodCarbs: document.getElementById('food-carbs'),
        foodFat: document.getElementById('food-fat'),
        foodList: document.getElementById('food-list'),
        emptyState: document.getElementById('empty-state')
    };

    const trashIcon = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 6h18"></path>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
    `;

    let data = loadData();
    
    init();
    
    function init() {
        displayDate();
        updateUI();
        setupEventListeners();
    }

    function getTodayString() {
        return new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    function getTodayKey() {
        return new Date().toISOString().split('T')[0];
    }

    function displayDate() {
        elements.dateDisplay.textContent = getTodayString();
    }

    function loadData() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.date === getTodayKey()) {
                return parsed;
            }
        }
        return {
            goal: 2000,
            entries: [],
            date: getTodayKey()
        };
    }

    function saveData() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    function getTotals() {
        return data.entries.reduce((acc, entry) => ({
            calories: acc.calories + entry.calories,
            protein: acc.protein + entry.protein,
            carbs: acc.carbs + entry.carbs,
            fat: acc.fat + entry.fat
        }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
    }

    function updateUI() {
        const totals = getTotals();
        const percentage = data.goal > 0 ? (totals.calories / data.goal) * 100 : 0;
        const remaining = data.goal - totals.calories;

        elements.goalValue.textContent = data.goal;
        elements.calorieCount.textContent = totals.calories;
        elements.mealsValue.textContent = data.entries.length;

        const displayRemaining = Math.abs(remaining);
        elements.remainingValue.textContent = remaining < 0 ? `-${displayRemaining}` : displayRemaining;
        elements.remainingValue.classList.toggle('negative', remaining < 0);

        elements.proteinTotal.textContent = totals.protein;
        elements.carbsTotal.textContent = totals.carbs;
        elements.fatTotal.textContent = totals.fat;

        const circumference = 2 * Math.PI * 52;
        const offset = circumference - (Math.min(percentage, 100) / 100) * circumference;
        elements.progressBar.style.strokeDashoffset = offset;

        elements.progressBar.classList.remove('warning', 'danger');
        if (percentage > 100) {
            elements.progressBar.classList.add('danger');
        } else if (percentage >= 80) {
            elements.progressBar.classList.add('warning');
        }

        renderFoodList();
    }

    function renderFoodList() {
        elements.foodList.innerHTML = '';
        
        if (data.entries.length === 0) {
            elements.emptyState.classList.remove('hidden');
            elements.foodList.classList.add('hidden');
            return;
        }

        elements.emptyState.classList.add('hidden');
        elements.foodList.classList.remove('hidden');

        data.entries.slice().reverse().forEach(entry => {
            const li = createFoodElement(entry);
            elements.foodList.appendChild(li);
        });
    }

    function createFoodElement(entry) {
        const li = document.createElement('li');
        li.className = 'food-item';
        li.dataset.id = entry.id;

        const macros = [];
        if (entry.protein > 0) macros.push(`P: ${entry.protein}g`);
        if (entry.carbs > 0) macros.push(`C: ${entry.carbs}g`);
        if (entry.fat > 0) macros.push(`F: ${entry.fat}g`);

        li.innerHTML = `
            <span class="calorie-badge">${entry.calories} cal</span>
            <div class="food-info">
                <span class="food-name">${escapeHTML(entry.name)}</span>
                ${macros.length > 0 ? `<div class="food-meta">${macros.map(m => `<span>${m}</span>`).join('')}</div>` : ''}
            </div>
            <div class="food-actions">
                <button class="delete-btn" aria-label="Delete entry">${trashIcon}</button>
            </div>
        `;

        return li;
    }

    function addEntry(name, calories, protein, carbs, fat) {
        const entry = {
            id: Date.now().toString(),
            name: name.trim(),
            calories: parseInt(calories) || 0,
            protein: parseInt(protein) || 0,
            carbs: parseInt(carbs) || 0,
            fat: parseInt(fat) || 0,
            timestamp: Date.now()
        };

        data.entries.push(entry);
        saveData();
        
        const li = createFoodElement(entry);
        if (data.entries.length === 1) {
            elements.emptyState.classList.add('hidden');
            elements.foodList.classList.remove('hidden');
        }
        elements.foodList.prepend(li);
        
        updateUI();
    }

    function deleteEntry(id) {
        const li = document.querySelector(`.food-item[data-id="${id}"]`);
        if (li) {
            li.classList.add('removing');
            li.addEventListener('animationend', () => {
                data.entries = data.entries.filter(e => e.id !== id);
                saveData();
                li.remove();
                updateUI();
            });
        }
    }

    function setupEventListeners() {
        elements.addForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            let valid = true;
            const name = elements.foodName.value.trim();
            const calories = elements.foodCalories.value;

            if (!name) {
                elements.foodName.classList.add('error');
                valid = false;
            } else {
                elements.foodName.classList.remove('error');
            }

            if (!calories || parseInt(calories) < 0) {
                elements.foodCalories.classList.add('error');
                valid = false;
            } else {
                elements.foodCalories.classList.remove('error');
            }

            if (!valid) {
                setTimeout(() => {
                    elements.foodName.classList.remove('error');
                    elements.foodCalories.classList.remove('error');
                }, 400);
                return;
            }

            addEntry(
                name,
                calories,
                elements.foodProtein.value,
                elements.foodCarbs.value,
                elements.foodFat.value
            );

            elements.addForm.reset();
            elements.foodName.focus();
        });

        elements.goalBtn.addEventListener('click', () => {
            elements.goalValue.classList.add('hidden');
            elements.goalBtn.classList.add('hidden');
            elements.goalInput.value = data.goal;
            elements.goalInput.classList.remove('hidden');
            elements.goalInput.focus();
            elements.goalInput.select();
        });

        elements.goalInput.addEventListener('blur', saveGoal);
        elements.goalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveGoal();
            } else if (e.key === 'Escape') {
                cancelGoalEdit();
            }
        });

        elements.foodList.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.delete-btn');
            if (deleteBtn) {
                const li = deleteBtn.closest('.food-item');
                if (li) {
                    deleteEntry(li.dataset.id);
                }
            }
        });
    }

    function saveGoal() {
        const newGoal = parseInt(elements.goalInput.value);
        if (newGoal && newGoal >= 500 && newGoal <= 10000) {
            data.goal = newGoal;
            saveData();
        }
        cancelGoalEdit();
        updateUI();
    }

    function cancelGoalEdit() {
        elements.goalInput.classList.add('hidden');
        elements.goalValue.classList.remove('hidden');
        elements.goalBtn.classList.remove('hidden');
    }

    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
});
