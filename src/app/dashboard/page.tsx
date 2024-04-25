'use client';
import 'react-toastify/dist/ReactToastify.css';
import React from "react";
import Link from "next/link";
import Cookies from "js-cookie";
import TaskCard from "@/components/task-card";
import { ToastContainer, toast } from "react-toastify";
import { useAuth } from '@/lib/auth';
import { NavItem } from '@/components/nav-item';

const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
export const getAllTaskListing = async (token: string): Promise<any[]> => {
  const res = await fetch(`${baseUrl}/tasks`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const todos = await res.json();
  return todos;
};

const createNewTask = async (token: string, newTaskData: any) => {
  try {
    const res = await fetch(`${baseUrl}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newTaskData),
    });
    const data = await res.json();
    return data;
  } catch (error) {
    throw new Error("Failed to create task");
  }
};

export default function RootLayout() {
  const [myTaskList, setMyTaskList] = React.useState<any[]>([]);
  const [token, setToken] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [showPopup, setShowPopup] = React.useState<boolean>(false);
  const { getToken, logout } = useAuth();
  const statusOptions = ["pending", "in_progress", "done"];

  React.useEffect(() => {
    const token = getToken();
    if (!token) {
      logout();
    }
  }, [getToken, logout]);

  React.useEffect(() => {
    const fetchToken = async () => {
      const tokenFromCookie = Cookies.get("token");
      if (tokenFromCookie) {
        setToken(tokenFromCookie);
      }
      setLoading(false);
    };
    fetchToken();
  }, []);

  React.useEffect(() => {
    const fetchTodos = async () => {
      if (token) {
        try {
          const todos = await getAllTaskListing(token);
          setMyTaskList(todos);
        } catch (error) {
          console.error("Error fetching todos:", error);
        }
      }
    };
    if (token) {
      fetchTodos();
    }
  }, [token]);

  const [newTaskData, setNewTaskData] = React.useState<{ title: string; description: string; status: string }>({
    title: "",
    description: "",
    status: "",
  });

  const [formErrors, setFormErrors] = React.useState<{ [key: string]: string }>({
    title: "",
    description: "",
    status: "",
  });

  const handleSuccess = (obj : any) => {
    toast.success(obj.msg, {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: true,
    });
  };

  const handleFailure = () => {
    toast.error("Failed to add task!", {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: true,
    });
  };

  const handleNewTaskClick = () => {
    setShowPopup(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewTaskData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validateForm = () => {
    let isValid = true;
    const errors: { [key: string]: string } = {};

    if (!newTaskData.title.trim()) {
      errors.title = "Title is required";
      isValid = false;
    }

    if (!newTaskData.description.trim()) {
      errors.description = "Description is required";
      isValid = false;
    }

    if (!newTaskData.status.trim()) {
      errors.status = "Status is required";
      isValid = false;
    }
    setFormErrors(errors);
    return isValid;
  };

  const handleAddTask = async () => {
    if (validateForm()) {
      try {
        const data = await createNewTask(token!, newTaskData);
        handleSuccess({msg : "New task has been added successfully."});
        setNewTaskData({
          title: "",
          description: "",
          status: "",
        });
        setShowPopup(false);
        const updatedTaskList = await getAllTaskListing(token!);
        setMyTaskList(updatedTaskList);
      } catch (error) {
        console.error("Error creating task:");
      }
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const tokenFromCookie = Cookies.get('token');
      if (!tokenFromCookie) {
        throw new Error('Token not found');
      }
      const response = await fetch(`${baseUrl}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${tokenFromCookie}`,
        },
      });
      if (!response.ok) {
        throw new Error('Delete request failed');
      }
      handleSuccess({msg : "Task has been deleted successfully."});
      const updatedTaskList = myTaskList.filter((task) => task.id !== taskId);
      setMyTaskList(updatedTaskList);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleUpdateTaskList = async (token : any) => {
    try {
      handleSuccess({msg : "Task has been updated successfully."});
      const updatedTaskList = await getAllTaskListing(token);
      setMyTaskList(updatedTaskList);
    } catch (error) {
      console.error('Error fetching updated task list:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-gray-100/40 lg:block dark:bg-gray-800/40">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-[60px] items-center border-b px-5">
            <Link href="/">
              <span className="flex items-center gap-2 font-semibold">TASK MANAGER</span>
            </Link>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <nav className="grid items-start px-4 text-sm font-medium">
              <NavItem href="/dashboard">Home</NavItem>
              <NavItem href="/dashboard">About</NavItem>
              <NavItem href="/dashboard">Services</NavItem>
              <NavItem href="/dashboard">Contact</NavItem>
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-gray-100/40 px-6 dark:bg-gray-800/40 justify-between lg:justify-end">
          {token ? (
              <button className="text-blue-500 hover:underline" onClick={logout}>
              Hi there! Logout
              </button>
            ) : (
              <Link href="/login">
                <button className="text-blue-500 hover:underline">Login</button>
              </Link>
            )}
        </header>

        <main className="flex flex-1 flex-col p-4 md:p-6">
          <div className="flex justify-center mt-4">
            <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleNewTaskClick}>
              New Task
            </button>
          </div>
          <ToastContainer />
          {showPopup && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white p-4 rounded-md shadow-md w-[30rem] md:w-[40rem]">
                <h2 className="text-lg font-semibold mb-4">Add New Task</h2>
                <div className="mb-4">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={newTaskData.title}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md border ${
                      formErrors.title ? "border-red-500" : "border-gray-300"
                    } shadow-sm focus:border-blue-500 focus:ring-blue-500`}
                  />
                  {formErrors.title && <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>}
                </div>
                <div className="mb-4">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={newTaskData.description}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md border ${
                      formErrors.description ? "border-red-500" : "border-gray-300"
                    } shadow-sm focus:border-blue-500 focus:ring-blue-500`}
                  />
                  {formErrors.description && <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>}
                </div>

                <div className="mb-4">
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700"> Status </label>
                  <select
                    id="status"
                    name="status"
                    value={newTaskData.status}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md border ${
                      formErrors.status ? "border-red-500" : "border-gray-300"
                    } shadow-sm focus:border-blue-500 focus:ring-blue-500`}
                  >
                    <option value="">Select Status</option>
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  {formErrors.status && <p className="text-red-500 text-sm mt-1">{formErrors.status}</p>}
                </div>

                <div className="flex justify-end">
                  <button className="bg-green-500 text-white px-4 py-2 rounded mr-2" onClick={handleAddTask}> Add Task </button>
                  <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={() => setShowPopup(false)} > Cancel </button>
                </div>
              </div>
            </div>
          )}

          {myTaskList.map((task) => (
            <TaskCard key={task.id} task={task} onDelete={handleDeleteTask} onUpdate={handleUpdateTaskList} />
          ))}
        </main>
      </div>
    </div>
  );
}
