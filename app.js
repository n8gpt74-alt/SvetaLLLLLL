/**
 * Sveta Calendar Dashboard
 * Modern Calendar Application with PWA Support
 * Features: Categories, Push Notifications, Sound Alerts
 */

(function () {
  "use strict";

  // ========================================
  // Constants & Configuration
  // ========================================
  const STORAGE_KEY = "sveta_calendar_data";
  const SETTINGS_KEY = "sveta_calendar_settings";
  const CATEGORIES_KEY = "sveta_calendar_categories";

  const MONTHS_RU = [
    "Январь",
    "Февраль",
    "Март",
    "Апрель",
    "Май",
    "Июнь",
    "Июль",
    "Август",
    "Сентябрь",
    "Октябрь",
    "Ноябрь",
    "Декабрь",
  ];
  const MONTHS_GENITIVE = [
    "января",
    "февраля",
    "марта",
    "апреля",
    "мая",
    "июня",
    "июля",
    "августа",
    "сентября",
    "октября",
    "ноября",
    "декабря",
  ];
  const DAYS_RU = [
    "Воскресенье",
    "Понедельник",
    "Вторник",
    "Среда",
    "Четверг",
    "Пятница",
    "Суббота",
  ];

  // Default categories
  const DEFAULT_CATEGORIES = [
    { id: "work", name: "Работа", color: "#3b82f6", icon: "work" },
    { id: "personal", name: "Личное", color: "#22c55e", icon: "personal" },
    { id: "health", name: "Здоровье", color: "#ef4444", icon: "health" },
  ];

  // Category icons SVG paths
  const CATEGORY_ICONS = {
    work: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>',
    personal:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',
    health:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>',
    education:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>',
    shopping:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>',
    travel:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"></path></svg>',
    finance:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>',
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>',
  };

  // ========================================
  // State Management
  // ========================================
  const state = {
    currentDate: new Date(),
    selectedDate: null,
    viewDate: new Date(),
    items: {
      notes: [],
      reminders: [],
    },
    categories: [],
    settings: {
      pushNotifications: false,
      soundAlerts: true,
    },
    activeCategory: "all",
    editingItem: null,
    notificationTimers: [],
    searchQuery: "",
  };

  // Delete state
  let pendingDelete = null;
  let editingCategory = null;

  // Tags state
  let currentTags = [];

  // ========================================
  // DOM Elements
  // ========================================
  const elements = {
    // Header
    dayName: document.getElementById("dayName"),
    currentDate: document.getElementById("currentDate"),
    monthYear: document.getElementById("monthYear"),
    todayBtn: document.getElementById("todayBtn"),
    settingsBtn: document.getElementById("settingsBtn"),
    todayNotesList: document.getElementById("todayNotesList"),

    // Calendar
    calendarTitle: document.getElementById("calendarTitle"),
    calendarGrid: document.getElementById("calendarGrid"),
    prevMonth: document.getElementById("prevMonth"),
    nextMonth: document.getElementById("nextMonth"),
    categoryBtns: document.querySelectorAll(".category-btn"),

    // Panel
    datePanel: document.getElementById("datePanel"),
    panelDate: document.getElementById("panelDate"),
    closePanel: document.getElementById("closePanel"),
    notesList: document.getElementById("notesList"),
    remindersList: document.getElementById("remindersList"),
    addNoteBtn: document.getElementById("addNoteBtn"),
    addReminderBtn: document.getElementById("addReminderBtn"),

    // Modal
    modalOverlay: document.getElementById("modalOverlay"),
    modal: document.getElementById("modal"),
    modalTitle: document.getElementById("modalTitle"),
    modalForm: document.getElementById("modalForm"),
    closeModal: document.getElementById("closeModal"),
    cancelBtn: document.getElementById("cancelBtn"),
    itemId: document.getElementById("itemId"),
    itemType: document.getElementById("itemType"),
    itemTitle: document.getElementById("itemTitle"),
    itemContent: document.getElementById("itemContent"),
    itemTime: document.getElementById("itemTime"),
    timeGroup: document.getElementById("timeGroup"),
    categorySelect: document.getElementById("categorySelect"),
    notifyGroup: document.getElementById("notifyGroup"),
    enableNotify: document.getElementById("enableNotify"),
    notifyOptions: document.getElementById("notifyOptions"),
    notifyBefore: document.getElementById("notifyBefore"),
    enableSound: document.getElementById("enableSound"),

    // Delete Modal
    deleteModalOverlay: document.getElementById("deleteModalOverlay"),
    deleteItemTitle: document.getElementById("deleteItemTitle"),
    cancelDeleteBtn: document.getElementById("cancelDeleteBtn"),
    confirmDeleteBtn: document.getElementById("confirmDeleteBtn"),

    // Settings Modal
    settingsModalOverlay: document.getElementById("settingsModalOverlay"),
    closeSettingsModal: document.getElementById("closeSettingsModal"),
    enablePushNotifications: document.getElementById("enablePushNotifications"),
    enableSoundAlerts: document.getElementById("enableSoundAlerts"),
    testNotificationBtn: document.getElementById("testNotificationBtn"),
    categoriesList: document.getElementById("categoriesList"),
    addCategoryBtn: document.getElementById("addCategoryBtn"),

    // Category Modal
    categoryModalOverlay: document.getElementById("categoryModalOverlay"),
    categoryModalTitle: document.getElementById("categoryModalTitle"),
    categoryForm: document.getElementById("categoryForm"),
    closeCategoryModal: document.getElementById("closeCategoryModal"),
    cancelCategoryBtn: document.getElementById("cancelCategoryBtn"),
    categoryId: document.getElementById("categoryId"),
    categoryName: document.getElementById("categoryName"),

    // Tags
    itemTags: document.getElementById("itemTags"),
    tagsList: document.getElementById("tagsList"),

    // Notifications
    toastContainer: document.getElementById("toastContainer"),
    offlineIndicator: document.getElementById("offlineIndicator"),

    // Search
    searchInput: document.getElementById("searchInput"),
    searchResults: document.getElementById("searchResults"),
    searchClear: document.getElementById("searchClear"),
  };

  // ========================================
  // Utility Functions
  // ========================================
  function formatDate(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  function parseDate(dateStr) {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  function isSameDay(date1, date2) {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // ========================================
  // Storage Functions
  // ========================================
  function saveData() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch (error) {
      console.error("Error saving data:", error);
      showToast("Ошибка сохранения данных", "error");
    }
  }

  function loadData() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        state.items = JSON.parse(data);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      state.items = { notes: [], reminders: [] };
    }
  }

  function saveSettings() {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings));
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  }

  function loadSettings() {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      if (data) {
        state.settings = { ...state.settings, ...JSON.parse(data) };
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  }

  function saveCategories() {
    try {
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(state.categories));
    } catch (error) {
      console.error("Error saving categories:", error);
    }
  }

  function loadCategories() {
    try {
      const data = localStorage.getItem(CATEGORIES_KEY);
      if (data) {
        state.categories = JSON.parse(data);
      } else {
        state.categories = [...DEFAULT_CATEGORIES];
        saveCategories();
      }
    } catch (error) {
      console.error("Error loading categories:", error);
      state.categories = [...DEFAULT_CATEGORIES];
    }
  }

  // ========================================
  // Tags Functions
  // ========================================
  function renderTags() {
    if (!elements.tagsList) return;

    elements.tagsList.innerHTML = currentTags
      .map(
        (tag, index) => `
            <div class="tag-badge">
                ${escapeHtml(tag)}
                <button type="button" class="tag-badge-remove" data-index="${index}"></button>
            </div>
        `,
      )
      .join("");

    // Add remove listeners
    elements.tagsList.querySelectorAll(".tag-badge-remove").forEach((btn) => {
      btn.addEventListener("click", () => {
        const index = parseInt(btn.dataset.index);
        removeTag(index);
      });
    });
  }

  function addTag(tag) {
    const trimmedTag = tag.trim().toLowerCase();
    if (!trimmedTag) return;

    // Avoid duplicates
    if (currentTags.includes(trimmedTag)) {
      showToast("Этот тег уже добавлен", "warning");
      return;
    }

    // Max tags limit
    if (currentTags.length >= 10) {
      showToast("Максимум 10 тегов", "warning");
      return;
    }

    currentTags.push(trimmedTag);
    renderTags();
    elements.itemTags.value = "";
  }

  function removeTag(index) {
    currentTags.splice(index, 1);
    renderTags();
  }

  // ========================================
  // Header Functions
  // ========================================
  function updateHeader() {
    const today = state.currentDate;
    elements.dayName.textContent = DAYS_RU[today.getDay()];
    elements.currentDate.textContent = today.getDate();
    elements.monthYear.textContent = `${MONTHS_GENITIVE[today.getMonth()]} ${today.getFullYear()}`;
    updateTodayNotes();
  }

  function updateTodayNotes() {
    const todayStr = formatDate(state.currentDate);
    const todayItems = [
      ...state.items.notes
        .filter((n) => n.date === todayStr)
        .map((n) => ({ ...n, type: "notes" })),
      ...state.items.reminders
        .filter((r) => r.date === todayStr)
        .map((r) => ({ ...r, type: "reminders" })),
    ];

    if (todayItems.length === 0) {
      elements.todayNotesList.innerHTML =
        '<p class="no-notes">Нет заметок на сегодня</p>';
      return;
    }

    todayItems.sort((a, b) => {
      if (a.time && b.time) return a.time.localeCompare(b.time);
      if (a.time) return -1;
      if (b.time) return 1;
      return 0;
    });

    elements.todayNotesList.innerHTML = todayItems
      .map((item) => {
        const category = state.categories.find((c) => c.id === item.category);
        const color = category
          ? category.color
          : item.type === "notes"
            ? "#a855f7"
            : "#f97316";
        return `
                <div class="today-note-item ${item.type === "reminders" ? "reminder" : ""}" style="border-left-color: ${color}">
                    <span class="today-note-dot ${item.type}" style="background: ${color}; box-shadow: 0 0 8px ${color}"></span>
                    <span>${item.time ? item.time + " - " : ""}${escapeHtml(item.title)}</span>
                </div>
            `;
      })
      .join("");
  }

  // ========================================
  // Calendar Functions
  // ========================================
  function updateCalendarTitle() {
    elements.calendarTitle.textContent = `${MONTHS_RU[state.viewDate.getMonth()]} ${state.viewDate.getFullYear()}`;
  }

  function getItemsForDate(date) {
    const dateStr = formatDate(date);
    return {
      notes: state.items.notes.filter((n) => n.date === dateStr),
      reminders: state.items.reminders.filter((r) => r.date === dateStr),
    };
  }

  function renderCalendar() {
    updateCalendarTitle();

    const year = state.viewDate.getFullYear();
    const month = state.viewDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Рассчитываем смещение для начала недели с понедельника
    // getDay() возвращает: 0=Вс, 1=Пн, 2=Вт, 3=Ср, 4=Чт, 5=Пт, 6=Сб
    // Вычитаем 1, чтобы Пн=0, Вт=1, ..., Вс=6
    let startDay = firstDay.getDay() - 1;
    if (startDay < 0) startDay = 6; // Если воскресенье (0-1=-1), то делаем 6

    const daysInMonth = lastDay.getDate();
    const prevMonthLastDay = new Date(year, month, 0).getDate();

    let html = "";
    let dayCounter = 1;
    let nextMonthDay = 1;

    const totalCells = Math.ceil((startDay + daysInMonth) / 7) * 7;

    for (let i = 0; i < totalCells; i++) {
      let dayNum,
        dateObj,
        isOtherMonth = false;

      if (i < startDay) {
        dayNum = prevMonthLastDay - startDay + i + 1;
        dateObj = new Date(year, month - 1, dayNum);
        isOtherMonth = true;
      } else if (dayCounter > daysInMonth) {
        dayNum = nextMonthDay++;
        dateObj = new Date(year, month + 1, dayNum);
        isOtherMonth = true;
      } else {
        dayNum = dayCounter++;
        dateObj = new Date(year, month, dayNum);
      }

      const dateStr = formatDate(dateObj);
      const isToday = isSameDay(dateObj, state.currentDate);
      const isSelected =
        state.selectedDate && isSameDay(dateObj, state.selectedDate);
      const items = getItemsForDate(dateObj);
      const hasNotes = items.notes.length > 0;
      const hasReminders = items.reminders.length > 0;

      let classes = ["calendar-day"];
      if (isOtherMonth) classes.push("other-month");
      if (isToday) classes.push("today");
      if (isSelected) classes.push("selected");

      let showIndicators = {
        notes:
          hasNotes &&
          (state.activeCategory === "all" || state.activeCategory === "notes"),
        reminders:
          hasReminders &&
          (state.activeCategory === "all" ||
            state.activeCategory === "reminders"),
      };

      let indicators = "";
      if (showIndicators.notes || showIndicators.reminders) {
        indicators = '<div class="day-indicators">';
        if (showIndicators.notes)
          indicators += '<span class="day-indicator notes"></span>';
        if (showIndicators.reminders)
          indicators += '<span class="day-indicator reminders"></span>';
        indicators += "</div>";
      }

      html += `
                <div class="${classes.join(" ")}" data-date="${dateStr}">
                    ${dayNum}
                    ${indicators}
                </div>
            `;
    }

    elements.calendarGrid.innerHTML = html;

    elements.calendarGrid.querySelectorAll(".calendar-day").forEach((day) => {
      day.addEventListener("click", handleDayClick);
    });
  }

  function handleDayClick(e) {
    const dateStr = e.currentTarget.dataset.date;
    state.selectedDate = parseDate(dateStr);

    elements.calendarGrid.querySelectorAll(".calendar-day").forEach((day) => {
      day.classList.remove("selected");
    });
    e.currentTarget.classList.add("selected");

    openDatePanel();
  }

  function navigateMonth(direction) {
    state.viewDate.setMonth(state.viewDate.getMonth() + direction);
    renderCalendar();
  }

  // ========================================
  // Date Panel Functions
  // ========================================
  function openDatePanel() {
    if (!state.selectedDate) return;

    const dateStr = formatDate(state.selectedDate);
    const dayName = DAYS_RU[state.selectedDate.getDay()];
    const day = state.selectedDate.getDate();
    const month = MONTHS_GENITIVE[state.selectedDate.getMonth()];

    elements.panelDate.textContent = `${dayName}, ${day} ${month}`;

    renderPanelItems();
    elements.datePanel.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeDatePanel() {
    elements.datePanel.classList.remove("active");
    document.body.style.overflow = "";
  }

  function sortItems(items) {
    return [...items].sort((a, b) => {
      // Pinned non-completed first
      if (a.pinned && !a.completed && !(b.pinned && !b.completed)) return -1;
      if (b.pinned && !b.completed && !(a.pinned && !a.completed)) return 1;
      // Completed items last
      if (a.completed && !b.completed) return 1;
      if (b.completed && !a.completed) return -1;
      return 0;
    });
  }

  function renderPanelItems() {
    if (!state.selectedDate) return;

    const items = getItemsForDate(state.selectedDate);
    const sortedNotes = sortItems(items.notes);
    const sortedReminders = sortItems(items.reminders);

    elements.notesList.innerHTML = "";
    elements.remindersList.innerHTML = "";

    let staggerDelay = 0;

    if (sortedNotes.length === 0) {
      elements.notesList.innerHTML =
        '<div class="empty-state">Нет заметок</div>';
    } else {
      sortedNotes.forEach((note) => {
        const card = createItemCardElement(note, "note");
        card.classList.add("stagger-item");
        card.style.animationDelay = `${staggerDelay}s`;
        staggerDelay += 0.05;
        elements.notesList.appendChild(card);
      });
    }

    if (sortedReminders.length === 0) {
      elements.remindersList.innerHTML =
        '<div class="empty-state">Нет напоминаний</div>';
    } else {
      sortedReminders.forEach((reminder) => {
        const card = createItemCardElement(reminder, "reminder");
        card.classList.add("stagger-item");
        card.style.animationDelay = `${staggerDelay}s`;
        staggerDelay += 0.05;
        elements.remindersList.appendChild(card);
      });
    }
  }

  function createItemCardElement(item, type) {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = renderItemCard(item, type);
    const card = tempDiv.firstElementChild;
    addItemCardListeners(card, type === "note" ? "notes" : "reminders");
    return card;
  }

  function renderItemCard(item, type) {
    const priorityLabels = {
      low: "Низкий",
      medium: "Средний",
      high: "Высокий",
    };
    const category = state.categories.find((c) => c.id === item.category);
    const categoryColor = category
      ? category.color
      : type === "note"
        ? "#a855f7"
        : "#f97316";

    let categoryBadge = "";
    if (category) {
      categoryBadge = `<span class="item-category" style="background: ${category.color}20; color: ${category.color}">${escapeHtml(category.name)}</span>`;
    }

    const extraClasses = [
      item.completed ? "completed" : "",
      item.pinned ? "pinned" : "",
    ]
      .filter(Boolean)
      .join(" ");

    return `
            <div class="item-card ${type} priority-${item.priority} ${extraClasses}" data-id="${item.id}" style="border-left-color: ${categoryColor}">
                <div class="item-header">
                    <span class="item-title">
                        ${item.pinned ? '<span class="pin-marker" title="Закреплено">📌</span> ' : ""}
                        ${escapeHtml(item.title)}
                    </span>
                    <div class="item-actions">
                        <button class="item-action-btn complete ${item.completed ? "active" : ""}" title="${item.completed ? "Отметить невыполненным" : "Отметить выполненным"}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </button>
                        <button class="item-action-btn pin ${item.pinned ? "active" : ""}" title="${item.pinned ? "Открепить" : "Закрепить"}">
                            <svg viewBox="0 0 24 24" fill="${item.pinned ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                            </svg>
                        </button>
                        <button class="item-action-btn edit" title="Редактировать">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                        <button class="item-action-btn delete" title="Удалить">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>
                </div>
                ${item.content ? `<div class="item-content">${escapeHtml(item.content)}</div>` : ""}
                <div class="item-meta">
                    ${
                      item.time
                        ? `
                        <span class="item-time">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            ${item.time}
                        </span>
                    `
                        : ""
                    }
                    ${categoryBadge}
                    <span class="item-priority ${item.priority}">${priorityLabels[item.priority]}</span>
                </div>
                ${
                  item.tags && item.tags.length > 0
                    ? `
                    <div class="item-tags">
                        ${item.tags.map((tag) => `<span class="item-tag">${escapeHtml(tag)}</span>`).join("")}
                    </div>
                `
                    : ""
                }
            </div>
        `;
  }

  function addItemCardListeners(card, type) {
    const editBtn = card.querySelector(".edit");
    const deleteBtn = card.querySelector(".delete");
    const completeBtn = card.querySelector(".complete");
    const pinBtn = card.querySelector(".pin");
    const itemId = card.dataset.id;

    editBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      openEditModal(itemId, type);
    });

    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      deleteItem(itemId, type);
    });

    completeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleComplete(itemId, type);
    });

    pinBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      togglePin(itemId, type);
    });
  }

  function toggleComplete(itemId, type) {
    const item = state.items[type].find((i) => i.id === itemId);
    if (!item) return;
    item.completed = !item.completed;
    saveData();
    renderPanelItems();
    renderCalendar();
    updateTodayNotes();
    showToast(
      item.completed ? "✅ Отмечено выполненным" : "Отметка снята",
      "success",
    );
  }

  function togglePin(itemId, type) {
    const item = state.items[type].find((i) => i.id === itemId);
    if (!item) return;
    item.pinned = !item.pinned;
    saveData();
    renderPanelItems();
    showToast(item.pinned ? "📌 Закреплено" : "Откреплено", "success");
  }

  // ========================================
  // Modal Functions
  // ========================================
  function renderCategorySelect(selectedCategoryId = null) {
    elements.categorySelect.innerHTML = state.categories
      .map(
        (cat) => `
            <div class="category-select-item ${cat.id === selectedCategoryId ? "selected" : ""}" data-id="${cat.id}">
                <span class="category-select-dot" style="background: ${cat.color}"></span>
                ${escapeHtml(cat.name)}
            </div>
        `,
      )
      .join("");

    elements.categorySelect
      .querySelectorAll(".category-select-item")
      .forEach((item) => {
        item.addEventListener("click", () => {
          elements.categorySelect
            .querySelectorAll(".category-select-item")
            .forEach((i) => i.classList.remove("selected"));
          item.classList.add("selected");
        });
      });
  }

  function openModal(type, item = null) {
    const isEdit = item !== null;
    const isReminder = type === "reminders";

    elements.modalTitle.textContent = isEdit
      ? isReminder
        ? "Редактировать напоминание"
        : "Редактировать заметку"
      : isReminder
        ? "Добавить напоминание"
        : "Добавить заметку";

    elements.itemId.value = isEdit ? item.id : "";
    elements.itemType.value = type;
    elements.itemTitle.value = isEdit ? item.title : "";
    elements.itemContent.value = isEdit ? item.content || "" : "";
    elements.itemTime.value = isEdit ? item.time || "" : "";

    const priority = isEdit ? item.priority : "medium";
    document.querySelector(
      `input[name="priority"][value="${priority}"]`,
    ).checked = true;

    // Category select
    renderCategorySelect(isEdit ? item.category : null);

    // Show/hide time and notify fields for reminders
    elements.timeGroup.classList.toggle("visible", isReminder);
    elements.notifyGroup.classList.toggle("visible", isReminder);

    if (isReminder && isEdit) {
      elements.enableNotify.checked = item.notify || false;
      elements.notifyOptions.classList.toggle("visible", item.notify);
      if (item.notifyBefore !== undefined) {
        elements.notifyBefore.value = item.notifyBefore;
      }
      elements.enableSound.checked = item.notifySound !== false;
    } else {
      elements.enableNotify.checked = false;
      elements.notifyOptions.classList.remove("visible");
      elements.enableSound.checked = true;
    }

    // Tags
    currentTags = isEdit && item.tags ? [...item.tags] : [];
    renderTags();

    elements.modalOverlay.classList.add("active");
    document.body.style.overflow = "hidden";

    setTimeout(() => elements.itemTitle.focus(), 300);
  }

  function closeModal() {
    elements.modalOverlay.classList.remove("active");
    elements.modalForm.reset();
    currentTags = [];
    renderTags();
    if (!elements.datePanel.classList.contains("active")) {
      document.body.style.overflow = "";
    }
  }

  function openEditModal(itemId, type) {
    const item = state.items[type].find((i) => i.id === itemId);
    if (item) {
      openModal(type, item);
    }
  }

  function handleFormSubmit(e) {
    e.preventDefault();

    const type = elements.itemType.value;
    const isEdit = elements.itemId.value !== "";
    const priority = document.querySelector(
      'input[name=\"priority\"]:checked',
    ).value;
    const selectedCategory = elements.categorySelect.querySelector(
      ".category-select-item.selected",
    );

    // Валидация
    if (!elements.itemTitle.value.trim()) {
      showToast("Заголовок обязателен", "error");
      elements.itemTitle.focus();
      return;
    }

    let itemData;

    if (isEdit) {
      // При редактировании: находим существующую заметку и обновляем её
      const index = state.items[type].findIndex(
        (i) => i.id === elements.itemId.value,
      );
      if (index === -1) {
        showToast("Ошибка: заметка не найдена", "error");
        return;
      }

      // Берём существующий объект и обновляем только изменённые поля
      itemData = {
        ...state.items[type][index], // Сохраняем все существующие поля
        title: elements.itemTitle.value.trim(),
        content: elements.itemContent.value.trim(),
        date: formatDate(state.selectedDate),
        priority: priority,
        category: selectedCategory ? selectedCategory.dataset.id : null,
        updatedAt: new Date().toISOString(),
      };

      // Обновляем поля для напоминаний
      if (type === "reminders") {
        if (elements.itemTime.value) {
          itemData.time = elements.itemTime.value;
        } else {
          delete itemData.time; // Удаляем время, если оно было очищено
        }
        itemData.notify = elements.enableNotify.checked;
        if (itemData.notify) {
          itemData.notifyBefore = parseInt(elements.notifyBefore.value);
          itemData.notifySound = elements.enableSound.checked;
        } else {
          delete itemData.notifyBefore;
          delete itemData.notifySound;
        }
      }

      // Сохраняем теги
      if (currentTags.length > 0) {
        itemData.tags = [...currentTags];
      } else {
        delete itemData.tags;
      }

      // Сохраняем обновлённую заметку
      state.items[type][index] = itemData;
      showToast(
        type === "reminders" ? "Напоминание обновлено" : "Заметка обновлена",
        "success",
      );
    } else {
      // При создании новой заметки
      itemData = {
        id: generateId(),
        title: elements.itemTitle.value.trim(),
        content: elements.itemContent.value.trim(),
        date: formatDate(state.selectedDate),
        priority: priority,
        category: selectedCategory ? selectedCategory.dataset.id : null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (type === "reminders") {
        if (elements.itemTime.value) {
          itemData.time = elements.itemTime.value;
        }
        itemData.notify = elements.enableNotify.checked;
        if (itemData.notify) {
          itemData.notifyBefore = parseInt(elements.notifyBefore.value);
          itemData.notifySound = elements.enableSound.checked;
        }
      }

      // Сохраняем теги
      if (currentTags.length > 0) {
        itemData.tags = [...currentTags];
      }

      state.items[type].push(itemData);
      showToast(
        type === "reminders" ? "Напоминание добавлено" : "Заметка добавлено",
        "success",
      );
    }

    saveData();
    closeModal();
    renderPanelItems();
    renderCalendar();
    updateTodayNotes();
    scheduleNotifications();
  }

  function deleteItem(itemId, type) {
    const item = state.items[type].find((i) => i.id === itemId);
    if (!item) return;

    pendingDelete = { itemId, type };
    elements.deleteItemTitle.textContent = item.title;
    elements.deleteModalOverlay.classList.add("active");
  }

  function confirmDelete() {
    if (!pendingDelete) return;

    const { itemId, type } = pendingDelete;
    const index = state.items[type].findIndex((i) => i.id === itemId);

    if (index !== -1) {
      state.items[type].splice(index, 1);
      saveData();
      renderPanelItems();
      renderCalendar();
      updateTodayNotes();
      showToast(
        type === "reminders" ? "Напоминание удалено" : "Заметка удалена",
        "success",
      );
    }

    closeDeleteModal();
  }

  function closeDeleteModal() {
    elements.deleteModalOverlay.classList.remove("active");
    pendingDelete = null;
  }

  // ========================================
  // Settings Functions
  // ========================================
  function openSettingsModal() {
    elements.enablePushNotifications.checked = state.settings.pushNotifications;
    elements.enableSoundAlerts.checked = state.settings.soundAlerts;
    renderCategoriesList();
    elements.settingsModalOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeSettingsModal() {
    elements.settingsModalOverlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  function renderCategoriesList() {
    elements.categoriesList.innerHTML = state.categories
      .map(
        (cat) => `
            <div class="category-item" data-id="${cat.id}">
                <span class="category-item-color" style="background: ${cat.color}; color: ${cat.color}"></span>
                <span class="category-item-icon">${CATEGORY_ICONS[cat.icon] || CATEGORY_ICONS.work}</span>
                <span class="category-item-name">${escapeHtml(cat.name)}</span>
                <div class="category-item-actions">
                    <button class="category-item-btn edit" title="Редактировать">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="category-item-btn delete" title="Удалить">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `,
      )
      .join("");

    elements.categoriesList
      .querySelectorAll(".category-item")
      .forEach((item) => {
        const catId = item.dataset.id;
        item
          .querySelector(".edit")
          .addEventListener("click", () => openCategoryModal(catId));
        item
          .querySelector(".delete")
          .addEventListener("click", () => deleteCategory(catId));
      });
  }

  // ========================================
  // Category Modal Functions
  // ========================================
  function openCategoryModal(categoryId = null) {
    editingCategory = categoryId;
    const isEdit = categoryId !== null;
    const category = isEdit
      ? state.categories.find((c) => c.id === categoryId)
      : null;

    elements.categoryModalTitle.textContent = isEdit
      ? "Редактировать категорию"
      : "Новая категория";
    elements.categoryId.value = isEdit ? category.id : "";
    elements.categoryName.value = isEdit ? category.name : "";

    // Set color
    const colorRadio = document.querySelector(
      `input[name="categoryColor"][value="${isEdit ? category.color : "#ef4444"}"]`,
    );
    if (colorRadio) colorRadio.checked = true;

    // Set icon
    const iconRadio = document.querySelector(
      `input[name="categoryIcon"][value="${isEdit ? category.icon : "work"}"]`,
    );
    if (iconRadio) iconRadio.checked = true;

    elements.categoryModalOverlay.classList.add("active");
  }

  function closeCategoryModal() {
    elements.categoryModalOverlay.classList.remove("active");
    elements.categoryForm.reset();
    editingCategory = null;
  }

  function handleCategoryFormSubmit(e) {
    e.preventDefault();

    const isEdit = editingCategory !== null;
    const color = document.querySelector(
      'input[name="categoryColor"]:checked',
    ).value;
    const icon = document.querySelector(
      'input[name="categoryIcon"]:checked',
    ).value;

    const categoryData = {
      id: isEdit ? editingCategory : generateId(),
      name: elements.categoryName.value.trim(),
      color: color,
      icon: icon,
    };

    if (isEdit) {
      const index = state.categories.findIndex((c) => c.id === editingCategory);
      if (index !== -1) {
        state.categories[index] = categoryData;
      }
      showToast("Категория обновлена", "success");
    } else {
      state.categories.push(categoryData);
      showToast("Категория добавлена", "success");
    }

    saveCategories();
    closeCategoryModal();
    renderCategoriesList();
  }

  function deleteCategory(categoryId) {
    if (!confirm("Удалить эту категорию?")) return;

    const index = state.categories.findIndex((c) => c.id === categoryId);
    if (index !== -1) {
      state.categories.splice(index, 1);
      saveCategories();
      renderCategoriesList();
      showToast("Категория удалена", "success");
    }
  }

  // ========================================
  // Notifications & Sound
  // ========================================
  async function requestNotificationPermission() {
    if (!("Notification" in window)) {
      showToast("Уведомления не поддерживаются", "error");
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }

    return false;
  }

  function scheduleNotifications() {
    // Clear existing timers
    state.notificationTimers.forEach((timer) => clearTimeout(timer));
    state.notificationTimers = [];

    if (!state.settings.pushNotifications) return;

    const now = new Date();
    const todayStr = formatDate(now);

    state.items.reminders.forEach((reminder) => {
      if (!reminder.notify || !reminder.time || reminder.date !== todayStr)
        return;

      const [hours, minutes] = reminder.time.split(":").map(Number);
      const reminderTime = new Date(now);
      reminderTime.setHours(hours, minutes, 0, 0);

      // Subtract notify before time
      const notifyTime = new Date(
        reminderTime.getTime() - (reminder.notifyBefore || 0) * 60 * 1000,
      );

      const delay = notifyTime.getTime() - now.getTime();

      if (delay > 0) {
        const timer = setTimeout(() => {
          showNotification(reminder);
        }, delay);
        state.notificationTimers.push(timer);
      }
    });
  }

  function showNotification(reminder) {
    if (Notification.permission === "granted") {
      const notification = new Notification("Sveta Calendar", {
        body: reminder.title,
        icon: "icons/icon.svg",
        badge: "icons/icon.svg",
        tag: reminder.id,
        requireInteraction: true,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }

    if (state.settings.soundAlerts && reminder.notifySound !== false) {
      playNotificationSound();
    }

    showToast(`Напоминание: ${reminder.title}`, "warning");
  }

  function playNotificationSound() {
    try {
      const audioContext = new (
        window.AudioContext || window.webkitAudioContext
      )();

      // Create a pleasant notification sound
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.5,
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);

      // Second tone
      setTimeout(() => {
        const osc2 = audioContext.createOscillator();
        const gain2 = audioContext.createGain();
        osc2.connect(gain2);
        gain2.connect(audioContext.destination);
        osc2.frequency.setValueAtTime(1108.73, audioContext.currentTime); // C#6
        osc2.type = "sine";
        gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
        gain2.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 0.5,
        );
        osc2.start(audioContext.currentTime);
        osc2.stop(audioContext.currentTime + 0.5);
      }, 150);
    } catch (error) {
      console.log("Could not play sound:", error);
    }
  }

  async function testNotification() {
    const hasPermission = await requestNotificationPermission();

    if (hasPermission) {
      new Notification("Sveta Calendar", {
        body: "Тестовое уведомление работает!",
        icon: "icons/icon.svg",
      });
    }

    if (state.settings.soundAlerts) {
      playNotificationSound();
    }

    showToast("Тестовое уведомление отправлено", "success");
  }

  // ========================================
  // Category Filter Functions
  // ========================================
  function setActiveCategory(category) {
    state.activeCategory = category;

    elements.categoryBtns.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.category === category);
    });

    renderCalendar();
  }

  // ========================================
  // Toast Notifications
  // ========================================
  function showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                ${
                  type === "success"
                    ? '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>'
                    : type === "error"
                      ? '<circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>'
                      : type === "warning"
                        ? '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>'
                        : '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>'
                }
            </svg>
            <span>${message}</span>
        `;

    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(20px)";
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // ========================================
  // Offline Detection
  // ========================================
  function updateOnlineStatus() {
    const isOffline = !navigator.onLine;
    elements.offlineIndicator.classList.toggle("visible", isOffline);
  }

  // ========================================
  // Search Functions
  // ========================================
  let searchDebounceTimer = null;

  function highlightMatch(text, query) {
    if (!query) return escapeHtml(text);
    const escaped = escapeHtml(text);
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return escaped.replace(
      new RegExp(`(${escapedQuery})`, "gi"),
      "<mark>$1</mark>",
    );
  }

  function searchItems(query) {
    if (!query || query.length < 2) {
      clearSearchResults();
      return;
    }

    const q = query.toLowerCase();
    const results = [];

    ["notes", "reminders"].forEach((type) => {
      state.items[type].forEach((item) => {
        const inTitle = item.title.toLowerCase().includes(q);
        const inContent =
          item.content && item.content.toLowerCase().includes(q);
        const inTags =
          item.tags && item.tags.some((t) => t.toLowerCase().includes(q));
        if (inTitle || inContent || inTags) {
          results.push({ ...item, _type: type });
        }
      });
    });

    renderSearchResults(results, query);
  }

  function renderSearchResults(results, query) {
    const container = elements.searchResults;
    container.classList.add("visible");

    if (results.length === 0) {
      container.innerHTML = '<div class="search-empty">Ничего не найдено</div>';
      return;
    }

    container.innerHTML = results
      .map((item) => {
        const category = state.categories.find((c) => c.id === item.category);
        const color = category
          ? category.color
          : item._type === "notes"
            ? "#a855f7"
            : "#f97316";
        const date = parseDate(item.date);
        const dateStr = `${date.getDate()} ${MONTHS_GENITIVE[date.getMonth()]} ${date.getFullYear()}`;
        const typeLabel = item._type === "notes" ? "Заметка" : "Напоминание";
        return `
                <div class="search-result-item" data-date="${item.date}" data-id="${item.id}">
                    <span class="search-result-dot" style="background:${color}"></span>
                    <div class="search-result-body">
                        <div class="search-result-title">${highlightMatch(item.title, query)}</div>
                        <div class="search-result-meta">${typeLabel} · ${dateStr}${item.time ? " · " + item.time : ""}</div>
                    </div>
                </div>
            `;
      })
      .join("");

    container.querySelectorAll(".search-result-item").forEach((el) => {
      el.addEventListener("click", () => {
        const date = parseDate(el.dataset.date);
        state.selectedDate = date;
        state.viewDate = new Date(date.getFullYear(), date.getMonth(), 1);
        renderCalendar();
        openDatePanel();
        clearSearch();
      });
    });
  }

  function clearSearchResults() {
    elements.searchResults.classList.remove("visible");
    elements.searchResults.innerHTML = "";
  }

  function clearSearch() {
    elements.searchInput.value = "";
    elements.searchClear.classList.remove("visible");
    clearSearchResults();
    state.searchQuery = "";
  }

  // ========================================
  // Touch Gestures
  // ========================================
  let touchStartX = 0;
  let touchStartY = 0;

  function handleTouchStart(e) {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }

  function handleTouchEnd(e) {
    const touchEndX = e.changedTouches[0].screenX;
    const touchEndY = e.changedTouches[0].screenY;
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
      if (diffX > 0) {
        navigateMonth(-1);
      } else {
        navigateMonth(1);
      }
    }
  }

  // ========================================
  // Keyboard Navigation
  // ========================================
  function handleKeydown(e) {
    if (e.key === "Escape") {
      if (elements.categoryModalOverlay.classList.contains("active")) {
        closeCategoryModal();
      } else if (elements.settingsModalOverlay.classList.contains("active")) {
        closeSettingsModal();
      } else if (elements.deleteModalOverlay.classList.contains("active")) {
        closeDeleteModal();
      } else if (elements.modalOverlay.classList.contains("active")) {
        closeModal();
      } else if (elements.datePanel.classList.contains("active")) {
        closeDatePanel();
      }
    }

    if (
      document.activeElement.tagName !== "INPUT" &&
      document.activeElement.tagName !== "TEXTAREA" &&
      document.activeElement.tagName !== "SELECT"
    ) {
      if (e.key === "ArrowLeft") {
        navigateMonth(-1);
      } else if (e.key === "ArrowRight") {
        navigateMonth(1);
      }
    }
  }

  // ========================================
  // Service Worker Registration
  // ========================================
  function registerServiceWorker() {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("sw.js")
        .then((registration) => {
          console.log("ServiceWorker registered:", registration.scope);
        })
        .catch((error) => {
          console.log("ServiceWorker registration failed:", error);
        });
    }
  }

  // ========================================
  // Event Listeners Setup
  // ========================================
  function setupEventListeners() {
    // Navigation
    elements.prevMonth.addEventListener("click", () => navigateMonth(-1));
    elements.nextMonth.addEventListener("click", () => navigateMonth(1));
    elements.todayBtn.addEventListener("click", () => {
      state.viewDate = new Date();
      state.selectedDate = new Date();
      renderCalendar();
      openDatePanel();
    });

    // Settings
    elements.settingsBtn.addEventListener("click", openSettingsModal);
    elements.closeSettingsModal.addEventListener("click", closeSettingsModal);
    elements.settingsModalOverlay.addEventListener("click", (e) => {
      if (e.target === elements.settingsModalOverlay) closeSettingsModal();
    });

    // Settings toggles
    elements.enablePushNotifications.addEventListener("change", async (e) => {
      if (e.target.checked) {
        const hasPermission = await requestNotificationPermission();
        if (!hasPermission) {
          e.target.checked = false;
          showToast("Разрешение на уведомления отклонено", "error");
          return;
        }
      }
      state.settings.pushNotifications = e.target.checked;
      saveSettings();
      scheduleNotifications();
    });

    elements.enableSoundAlerts.addEventListener("change", (e) => {
      state.settings.soundAlerts = e.target.checked;
      saveSettings();
    });

    elements.testNotificationBtn.addEventListener("click", testNotification);

    // Categories
    elements.addCategoryBtn.addEventListener("click", () =>
      openCategoryModal(),
    );
    elements.closeCategoryModal.addEventListener("click", closeCategoryModal);
    elements.cancelCategoryBtn.addEventListener("click", closeCategoryModal);
    elements.categoryForm.addEventListener("submit", handleCategoryFormSubmit);
    elements.categoryModalOverlay.addEventListener("click", (e) => {
      if (e.target === elements.categoryModalOverlay) closeCategoryModal();
    });

    // Category filters
    elements.categoryBtns.forEach((btn) => {
      btn.addEventListener("click", () =>
        setActiveCategory(btn.dataset.category),
      );
    });

    // Panel
    elements.closePanel.addEventListener("click", closeDatePanel);
    elements.addNoteBtn.addEventListener("click", () => openModal("notes"));
    elements.addReminderBtn.addEventListener("click", () =>
      openModal("reminders"),
    );

    // Modal
    elements.closeModal.addEventListener("click", closeModal);
    elements.cancelBtn.addEventListener("click", closeModal);
    elements.modalOverlay.addEventListener("click", (e) => {
      if (e.target === elements.modalOverlay) closeModal();
    });
    elements.modalForm.addEventListener("submit", handleFormSubmit);

    // Notify checkbox toggle
    elements.enableNotify.addEventListener("change", (e) => {
      elements.notifyOptions.classList.toggle("visible", e.target.checked);
    });

    // Tags input
    elements.itemTags.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const tag = elements.itemTags.value.trim();
        if (tag) {
          addTag(tag);
        }
      }
    });

    // Delete modal
    elements.cancelDeleteBtn.addEventListener("click", closeDeleteModal);
    elements.confirmDeleteBtn.addEventListener("click", confirmDelete);
    elements.deleteModalOverlay.addEventListener("click", (e) => {
      if (e.target === elements.deleteModalOverlay) closeDeleteModal();
    });

    // Search
    elements.searchInput.addEventListener("input", (e) => {
      const query = e.target.value.trim();
      state.searchQuery = query;
      elements.searchClear.classList.toggle("visible", query.length > 0);
      clearTimeout(searchDebounceTimer);
      if (query.length === 0) {
        clearSearchResults();
        return;
      }
      searchDebounceTimer = setTimeout(() => searchItems(query), 200);
    });

    elements.searchClear.addEventListener("click", () => {
      clearSearch();
      elements.searchInput.focus();
    });

    // Close search results when clicking outside
    document.addEventListener("click", (e) => {
      if (!e.target.closest("#searchBarWrapper")) {
        clearSearchResults();
      }
    });

    // Touch gestures
    elements.calendarGrid.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    elements.calendarGrid.addEventListener("touchend", handleTouchEnd, {
      passive: true,
    });

    // Keyboard
    document.addEventListener("keydown", handleKeydown);

    // Online/offline
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    // Panel swipe to close
    let panelTouchStartY = 0;
    elements.datePanel.addEventListener(
      "touchstart",
      (e) => {
        panelTouchStartY = e.changedTouches[0].screenY;
      },
      { passive: true },
    );

    elements.datePanel.addEventListener(
      "touchend",
      (e) => {
        const diffY = e.changedTouches[0].screenY - panelTouchStartY;
        if (diffY > 100) {
          closeDatePanel();
        }
      },
      { passive: true },
    );

    // Mobile FAB
    const mobileFab = document.getElementById("mobileFab");
    if (mobileFab) {
      mobileFab.addEventListener("click", () => {
        openModal("note");
      });
    }

    // Cursor Glow for Item Cards (Desktop)
    document.addEventListener("mousemove", (e) => {
      const card = e.target.closest(".item-card");
      if (card) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty("--mouse-x", `${x}px`);
        card.style.setProperty("--mouse-y", `${y}px`);
      }
    });
  }

  // ========================================
  // Scratchpad (Quick Notepad)
  // ========================================
  const SCRATCHPAD_KEY = "sveta_scratchpad";

  function initScratchpad() {
    const textarea = document.getElementById("scratchpadText");
    const savedIndicator = document.getElementById("scratchpadSaved");
    if (!textarea) return;

    // Load saved text
    try {
      textarea.value = localStorage.getItem(SCRATCHPAD_KEY) || "";
    } catch (e) {
      /* ignore */
    }

    let saveTimer = null;
    let hideTimer = null;

    textarea.addEventListener("input", () => {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        try {
          localStorage.setItem(SCRATCHPAD_KEY, textarea.value);
          // Show saved indicator
          savedIndicator.textContent = "✓ Сохранено";
          savedIndicator.classList.add("visible");
          clearTimeout(hideTimer);
          hideTimer = setTimeout(() => {
            savedIndicator.classList.remove("visible");
          }, 2000);
        } catch (e) {
          /* ignore */
        }
      }, 600);
    });
  }

  // ========================================
  // Initialize Application
  // ========================================
  function init() {
    loadData();
    loadSettings();
    loadCategories();
    updateHeader();
    renderCalendar();
    setupEventListeners();
    updateOnlineStatus();
    registerServiceWorker();
    scheduleNotifications();
    initScratchpad();

    // Update current date every minute
    setInterval(() => {
      const now = new Date();
      if (!isSameDay(now, state.currentDate)) {
        state.currentDate = now;
        updateHeader();
        renderCalendar();
        scheduleNotifications();
      }
    }, 60000);

    console.log("Sveta Calendar initialized with categories and notifications");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
