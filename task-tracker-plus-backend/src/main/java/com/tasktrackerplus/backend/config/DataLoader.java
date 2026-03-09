package com.tasktrackerplus.backend.config;

import com.tasktrackerplus.backend.model.Priority;
import com.tasktrackerplus.backend.model.Task;
import com.tasktrackerplus.backend.repository.TaskRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDate;

@Configuration
public class DataLoader {

    @Bean
    CommandLineRunner loadData(TaskRepository taskRepository) {
        return args -> {
            if (taskRepository.count() == 0) {
                Task task1 = new Task();
                task1.setTitle("Finish backend setup");
                task1.setDescription("Complete Spring Boot configuration for Task Tracker Plus.");
                task1.setPriority(Priority.HIGH);
                task1.setCompleted(false);
                task1.setDueDate(LocalDate.now().plusDays(3));

                Task task2 = new Task();
                task2.setTitle("Connect Angular frontend");
                task2.setDescription("Prepare frontend to consume backend API endpoints.");
                task2.setPriority(Priority.MEDIUM);
                task2.setCompleted(false);
                task2.setDueDate(LocalDate.now().plusDays(7));

                Task task3 = new Task();
                task3.setTitle("Review project board");
                task3.setDescription("Check Kanban board and update task progress.");
                task3.setPriority(Priority.LOW);
                task3.setCompleted(true);

                taskRepository.save(task1);
                taskRepository.save(task2);
                taskRepository.save(task3);
            }
        };
    }
}
