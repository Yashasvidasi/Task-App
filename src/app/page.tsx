"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";

type Priority = "low" | "medium" | "high";

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: Priority;
}

export default function TodoApp() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortCriteria, setSortCriteria] = useState<
    "priority" | "alphabetical" | "completion"
  >("priority");
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTasks = localStorage.getItem("tasks");
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("tasks", JSON.stringify(tasks));
    }
  }, [tasks]);

  const addTask = useCallback(() => {
    if (newTask.trim()) {
      setTasks((prevTasks) => [
        ...prevTasks,
        {
          id: Date.now().toString(),
          title: newTask.trim(),
          description: newTaskDescription.trim(),
          completed: false,
          priority: "medium",
        },
      ]);
      setNewTask("");
      setNewTaskDescription("");
    }
  }, [newTask, newTaskDescription]);

  const deleteTask = useCallback((id: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
  }, []);

  const toggleTaskCompletion = useCallback((id: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  }, []);

  const updateTaskPriority = useCallback((id: string, priority: Priority) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === id ? { ...task, priority } : task))
    );
  }, []);

  const toggleExpandTask = useCallback((id: string) => {
    setExpandedTask((prevId) => (prevId === id ? null : id));
  }, []);

  const filteredAndSortedTasks = useMemo(() => {
    return tasks
      .filter((task) =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        if (sortCriteria === "priority") {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        } else if (sortCriteria === "alphabetical") {
          return a.title.localeCompare(b.title);
        } else {
          return Number(b.completed) - Number(a.completed);
        }
      });
  }, [tasks, searchTerm, sortCriteria]);

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
      <h1 className="text-2xl font-bold mb-6 text-center">Todo App</h1>

      <div className="space-y-4 mb-6">
        <Input
          type="text"
          placeholder="Add a new task"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && addTask()}
        />
        <Textarea
          placeholder="Add a description (optional)"
          value={newTaskDescription}
          onChange={(e) => setNewTaskDescription(e.target.value)}
        />
        <Button onClick={addTask} className="w-full">
          <Plus className="h-4 w-4 mr-2" /> Add Task
        </Button>
      </div>

      <div className="flex mb-4">
        <div className="relative flex-grow mr-2">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search tasks"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select
          value={sortCriteria}
          onValueChange={(value: "priority" | "alphabetical" | "completion") =>
            setSortCriteria(value)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="priority">Priority</SelectItem>
            <SelectItem value="alphabetical">Alphabetical</SelectItem>
            <SelectItem value="completion">Completion</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <motion.ul layout className="space-y-2">
        <AnimatePresence>
          {filteredAndSortedTasks.map((task) => (
            <motion.li
              key={task.id}
              layout
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="bg-gray-100 rounded overflow-hidden"
            >
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center flex-grow mr-4">
                  <Checkbox
                    id={`task-${task.id}`}
                    checked={task.completed}
                    onCheckedChange={() => toggleTaskCompletion(task.id)}
                    className="mr-2"
                  />
                  <label
                    htmlFor={`task-${task.id}`}
                    className={`flex-grow ${
                      task.completed ? "line-through text-gray-500" : ""
                    }`}
                  >
                    {task.title}
                  </label>
                </div>
                <div className="flex items-center">
                  <Select
                    value={task.priority}
                    onValueChange={(value: Priority) =>
                      updateTaskPriority(task.id, value)
                    }
                  >
                    <SelectTrigger className="w-[100px] mr-2">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteTask(task.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleExpandTask(task.id)}
                  >
                    {expandedTask === task.id ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <AnimatePresence>
                {expandedTask === task.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="px-4 pb-4"
                  >
                    <p className="text-sm text-gray-600">
                      {task.description || "No description provided."}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </div>
  );
}
