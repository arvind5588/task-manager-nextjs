import React, { useState } from 'react';
import Cookies from 'js-cookie';

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}
interface TaskCardProps {
    task: Task;
    onDelete: (taskId: string) => void;
    onUpdate: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDescription, setEditedDescription] = useState(task.description);
  const [editedStatus, setEditedStatus] = useState(task.status);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    let isValid = true;

    if (!editedTitle.trim()) {
      errors.title = 'Title is required';
      isValid = false;
    }

    if (!editedDescription.trim()) {
      errors.description = 'Description is required';
      isValid = false;
    }

    if (!editedStatus.trim()) {
      errors.status = 'Status is required';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleUpdate = async () => {
    const isValid = validateForm();
    if (isValid) {
      try {
        const token = Cookies.get('token');
        if (!token) {
          throw new Error('Token not found');
        }

        const response = await fetch(`http://localhost:3000/tasks/${task.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: editedTitle,
            description: editedDescription,
            status: editedStatus,
          }),
        });
        if (response.ok) {
            setIsEditing(false);
            // Call callback function to refresh task list in RootLayout
            onUpdate(token);
        } else {
          throw new Error('Failed to update task');
        }
      } catch (error) {
        console.error('Error updating task:', error);
        // Handle error
      }
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleDelete = () => {
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = async () => {
    onDelete(task.id);
    setShowDeleteConfirmation(false);
  };

  const cancelDelete = () => {
    setShowDeleteConfirmation(false);
  };

  return (
    <div className="border rounded-lg p-4 mb-4">
      <h2 className="text-lg font-semibold">{task.title}</h2>
      <p className="text-gray-500">{task.description}</p>
      <p>Status: {task.status}</p>
      <p>Created At: {new Date(task.createdAt).toLocaleString()}</p>
      <p>Updated At: {new Date(task.updatedAt).toLocaleString()}</p>
      <div className="flex justify-between mt-4">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
          onClick={handleEdit}
        >
          Edit
        </button>
        <button
          className="bg-red-500 text-white px-4 py-2 rounded"
          onClick={handleDelete}
        >
          Delete
        </button>
      </div>
      {showDeleteConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
          <div className="bg-white p-8 rounded-lg">
            <p>Are you sure you want to delete this task?</p>
            <div className="flex justify-end">
              <button className="bg-blue-500 text-white px-4 py-2 rounded mr-2" onClick={confirmDelete}>Yes</button>
              <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={cancelDelete}>No</button>
            </div>
          </div>
        </div>
      )}
      {isEditing && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
          <div className="bg-white p-8 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Edit Task</h2>
            <input
              type="text"
              className={`border p-2 mb-2 w-full ${formErrors.title ? 'border-red-500' : 'border-gray-300'}`}
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
            />
            {formErrors.title && <p className="text-red-500 text-sm">{formErrors.title}</p>}
            <textarea
              className={`border p-2 mb-2 w-full ${formErrors.description ? 'border-red-500' : 'border-gray-300'}`}
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
            />
            {formErrors.description && <p className="text-red-500 text-sm">{formErrors.description}</p>}
            <select
              className={`border p-2 mb-2 w-full ${formErrors.status ? 'border-red-500' : 'border-gray-300'}`}
              value={editedStatus}
              onChange={(e) => setEditedStatus(e.target.value)}
            >
              <option value="">Select Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
            {formErrors.status && <p className="text-red-500 text-sm">{formErrors.status}</p>}
            <div className="flex justify-end">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                onClick={handleUpdate}
              >
                Update
              </button>
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
