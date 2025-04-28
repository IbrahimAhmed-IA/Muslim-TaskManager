"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAppSettings } from "@/context/app-settings-context";
import { useProjectContext } from "@/context/project-context";
import { useState } from "react";
import { FaEdit, FaFolder, FaPlus, FaTrash } from "react-icons/fa";

const COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#6366f1", // indigo
  "#14b8a6", // teal
];

interface Project {
  id: string;
  name: string;
  color: string;
}

export default function ProjectManager() {
  const { projects, addProject, editProject, deleteProject } =
    useProjectContext();
  const { settings } = useAppSettings();
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState("");

  const handleAddProject = () => {
    if (name.trim()) {
      if (editMode && editId) {
        editProject(editId, { name, color });
        setEditMode(false);
        setEditId("");
      } else {
        addProject(name, color);
      }
      setName("");
    }
  };

  const startEdit = (project: Project) => {
    setEditMode(true);
    setEditId(project.id);
    setName(project.name);
    setColor(project.color);
  };

  const cancelEdit = () => {
    setEditMode(false);
    setEditId("");
    setName("");
  };

  if (!settings.advancedMode) {
    return null; // Only show in advanced mode
  }

  return (
    <Card
      className={`p-4 mb-6 ${
        settings.advancedMode ? "bg-slate-800 border-slate-700 text-white" : ""
      }`}
    >
      <h3 className="text-lg font-medium mb-3 flex items-center">
        <FaFolder className="mr-2" />
        {editMode ? "Edit Project" : "Add Project"}
      </h3>

      <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
        <Input
          placeholder="Project name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`flex-1 ${
            settings.advancedMode ? "bg-slate-700 border-slate-600 text-white" : ""
          }`}
        />

        <div className="flex items-center space-x-2">
          <span className="text-sm text-slate-200">Color:</span>
          <div className="flex space-x-1">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                className={`w-6 h-6 rounded-full cursor-pointer transition-transform ${
                  color === c ? "ring-2 ring-white scale-110" : ""
                }`}
                style={{ backgroundColor: c }}
                onClick={() => setColor(c)}
                aria-label={`Select color ${c}`}
              />
            ))}
          </div>
        </div>

        <div className="flex space-x-2">
          <Button
            onClick={handleAddProject}
            className={`${
              settings.advancedMode ? "bg-blue-600 hover:bg-blue-700" : ""
            }`}
          >
            {editMode ? (
              "Update"
            ) : (
              <>
                <FaPlus className="mr-1" /> Add
              </>
            )}
          </Button>

          {editMode && (
            <Button
              onClick={cancelEdit}
              variant="outline"
              className={
                settings.advancedMode
                  ? "border-slate-600 text-white hover:bg-slate-700"
                  : ""
              }
            >
              Cancel
            </Button>
          )}
        </div>
      </div>

      {projects.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-slate-200 mb-2">
            Your Projects
          </h4>
          <div className="space-y-2">
            {projects.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-700"
              >
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: project.color }}
                  />
                  <span>{project.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => startEdit(project)}
                    className="text-slate-200 hover:text-white"
                    aria-label={`Edit project ${project.name}`}
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => deleteProject(project.id)}
                    className="text-slate-200 hover:text-red-500"
                    aria-label={`Delete project ${project.name}`}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
