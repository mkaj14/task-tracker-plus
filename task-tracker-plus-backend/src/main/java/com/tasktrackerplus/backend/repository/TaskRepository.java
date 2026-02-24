package com.tasktrackerplus.backend.repository;

import com.tasktrackerplus.backend.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<Task, Long> {
}
