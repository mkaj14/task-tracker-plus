package com.tasktrackerplus.backend.service;

import com.tasktrackerplus.backend.model.Task;
import com.tasktrackerplus.backend.repository.TaskRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;

    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    public Task createTask(Task task) {
        task.setId(null);
        return taskRepository.save(task);
    }

    public ResponseEntity<Task> updateTask(Long id, Task updatedTask) {
        return taskRepository.findById(id)
                .map(existing -> {
                    existing.setTitle(updatedTask.getTitle());
                    existing.setDescription(updatedTask.getDescription());
                    existing.setPriority(updatedTask.getPriority());
                    existing.setCompleted(updatedTask.isCompleted());
                    existing.setDueDate(updatedTask.getDueDate());
                    Task saved = taskRepository.save(existing);
                    return ResponseEntity.ok(saved);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    public ResponseEntity<Void> deleteTask(Long id) {
        if (!taskRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        taskRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
