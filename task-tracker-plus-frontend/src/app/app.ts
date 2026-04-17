import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from './task.service';
import { Task } from './task';

type CalendarDay = {
  date: Date | null;
  isCurrentMonth: boolean;
  isToday: boolean;
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  tasks: Task[] = [];
  filterStatus: string = 'INCOMPLETE';
  filterCategory: string = 'ALL';
  showCompletedSection: boolean = false;
  showCreateModal: boolean = false;

  selectedCalendarTask: Task | null = null;

  currentMonthDate: Date = new Date();
  calendarView: 'DAY' | 'WEEK' | 'MONTH' = 'MONTH';

  weekDays: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  categories: string[] = [
    'Assignments',
    'Projects',
    'Meetings',
    'Important Dates',
    'Work',
    'Personal',
    'Shopping',
    'Health',
    'School'
  ];

  editingTaskId: number | null = null;

  editTask: Task = {
    title: '',
    description: '',
    priority: 'LOW',
    completed: false,
    dueDate: '',
    category: ''
  };

  newTask: Task = {
    title: '',
    description: '',
    priority: 'LOW',
    completed: false,
    dueDate: '',
    category: ''
  };

  constructor(
    private taskService: TaskService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.taskService.getTasks().subscribe(data => {
      this.tasks = data;
      this.cdr.markForCheck();
    });
  }

  openCreateModal(): void {
    this.showCreateModal = true;
    this.cdr.markForCheck();
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.newTask = {
      title: '',
      description: '',
      priority: 'LOW',
      completed: false,
      dueDate: '',
      category: ''
    };
    this.cdr.markForCheck();
  }

  openCalendarTask(task: Task): void {
    this.selectedCalendarTask = task;
    this.cdr.markForCheck();
  }

  closeCalendarTask(): void {
    this.selectedCalendarTask = null;
    this.cdr.markForCheck();
  }

  setCalendarView(view: 'DAY' | 'WEEK' | 'MONTH'): void {
    this.calendarView = view;
    this.cdr.markForCheck();
  }

  addTask(): void {
    this.taskService.addTask(this.newTask).subscribe(() => {
      this.newTask = {
        title: '',
        description: '',
        priority: 'LOW',
        completed: false,
        dueDate: '',
        category: ''
      };
      this.showCreateModal = false;
      this.loadTasks();
      this.cdr.markForCheck();
    });
  }

  deleteTask(id?: number): void {
    if (!id) return;

    this.taskService.deleteTask(id).subscribe(() => {
      this.loadTasks();
      this.cdr.markForCheck();
    });
  }

  toggleCompleted(task: Task): void {
    if (!task.id) return;

    const updatedTask: Task = {
      ...task,
      completed: !task.completed
    };

    this.taskService.updateTask(task.id, updatedTask).subscribe(() => {
      this.loadTasks();
      this.cdr.markForCheck();
    });
  }

  startEdit(task: Task): void {
    this.editingTaskId = task.id ?? null;
    this.editTask = { ...task };
    this.cdr.markForCheck();
  }

  cancelEdit(): void {
    this.editingTaskId = null;
    this.editTask = {
      title: '',
      description: '',
      priority: 'LOW',
      completed: false,
      dueDate: '',
      category: ''
    };
    this.cdr.markForCheck();
  }

  saveEdit(): void {
    if (!this.editingTaskId) return;

    this.taskService.updateTask(this.editingTaskId, this.editTask).subscribe(() => {
      this.cancelEdit();
      this.loadTasks();
      this.cdr.markForCheck();
    });
  }

  toggleCompletedSection(): void {
    this.showCompletedSection = !this.showCompletedSection;
    this.cdr.markForCheck();
  }

  isOverdue(task: Task): boolean {
    if (!task.dueDate || task.completed) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(task.dueDate);
    due.setHours(0, 0, 0, 0);

    return due < today;
  }

  isSameDate(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  get totalTasks(): number {
    return this.tasks.length;
  }

  get completedTasks(): number {
    return this.tasks.filter(task => task.completed).length;
  }

  get incompleteTasks(): number {
    return this.tasks.filter(task => !task.completed).length;
  }

  private compareTasks(a: Task, b: Task): number {
    const aOverdue = this.isOverdue(a);
    const bOverdue = this.isOverdue(b);

    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;

    const priorityOrder: Record<string, number> = {
      HIGH: 1,
      MEDIUM: 2,
      LOW: 3
    };

    const priorityCompare = priorityOrder[a.priority] - priorityOrder[b.priority];

    if (priorityCompare !== 0) {
      return priorityCompare;
    }

    const aDueDate = a.dueDate
      ? new Date(a.dueDate).getTime()
      : Number.MAX_SAFE_INTEGER;

    const bDueDate = b.dueDate
      ? new Date(b.dueDate).getTime()
      : Number.MAX_SAFE_INTEGER;

    if (aDueDate !== bDueDate) {
      return aDueDate - bDueDate;
    }

    return a.title.localeCompare(b.title);
  }

  get filteredTasks(): Task[] {
    let result: Task[];

    if (this.filterStatus === 'COMPLETED') {
      result = this.tasks.filter(task => task.completed);
    } else {
      result = this.tasks.filter(task => !task.completed);
    }

    if (this.filterCategory !== 'ALL') {
      result = result.filter(task => task.category === this.filterCategory);
    }

    return [...result].sort((a, b) => this.compareTasks(a, b));
  }

  get completedTaskList(): Task[] {
    return [...this.tasks.filter(task => task.completed)].sort((a, b) =>
      this.compareTasks(a, b)
    );
  }

  get currentMonthLabel(): string {
    return this.currentMonthDate.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  }

  get currentDayLabel(): string {
    return this.currentMonthDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }

  get currentWeekLabel(): string {
    const week = this.currentWeekDays;
    if (week.length === 0) return '';
    const start = week[0];
    const end = week[6];

    const startLabel = start.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });

    const endLabel = end.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    return `${startLabel} - ${endLabel}`;
  }

  previousMonth(): void {
    if (this.calendarView === 'MONTH') {
      this.currentMonthDate = new Date(
        this.currentMonthDate.getFullYear(),
        this.currentMonthDate.getMonth() - 1,
        1
      );
    } else if (this.calendarView === 'WEEK') {
      const newDate = new Date(this.currentMonthDate);
      newDate.setDate(newDate.getDate() - 7);
      this.currentMonthDate = newDate;
    } else {
      const newDate = new Date(this.currentMonthDate);
      newDate.setDate(newDate.getDate() - 1);
      this.currentMonthDate = newDate;
    }

    this.cdr.markForCheck();
  }

  nextMonth(): void {
    if (this.calendarView === 'MONTH') {
      this.currentMonthDate = new Date(
        this.currentMonthDate.getFullYear(),
        this.currentMonthDate.getMonth() + 1,
        1
      );
    } else if (this.calendarView === 'WEEK') {
      const newDate = new Date(this.currentMonthDate);
      newDate.setDate(newDate.getDate() + 7);
      this.currentMonthDate = newDate;
    } else {
      const newDate = new Date(this.currentMonthDate);
      newDate.setDate(newDate.getDate() + 1);
      this.currentMonthDate = newDate;
    }

    this.cdr.markForCheck();
  }

  get calendarDays(): CalendarDay[] {
    const year = this.currentMonthDate.getFullYear();
    const month = this.currentMonthDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const startDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days: CalendarDay[] = [];

    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({
        date: null,
        isCurrentMonth: false,
        isToday: false
      });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      currentDate.setHours(0, 0, 0, 0);

      days.push({
        date: currentDate,
        isCurrentMonth: true,
        isToday: currentDate.getTime() === today.getTime()
      });
    }

    while (days.length % 7 !== 0) {
      days.push({
        date: null,
        isCurrentMonth: false,
        isToday: false
      });
    }

    return days;
  }

  get currentWeekDays(): Date[] {
    const current = new Date(this.currentMonthDate);
    current.setHours(0, 0, 0, 0);

    const start = new Date(current);
    start.setDate(current.getDate() - current.getDay());

    const week: Date[] = [];

    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      week.push(day);
    }

    return week;
  }

  get currentDayTasks(): Task[] {
    return this.getTasksForDate(this.currentMonthDate);
  }

  getTasksForDate(date: Date | null): Task[] {
    if (!date) return [];

    const target = date.toISOString().split('T')[0];

    return this.tasks
      .filter(task => task.dueDate === target)
      .sort((a, b) => this.compareTasks(a, b));
  }
}