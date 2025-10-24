import React from 'react';
import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectItem,
} from '../components/ui';
import { X } from 'lucide-react';

export function AddStudentModal({ isOpen, onClose, onSubmit, isLoading, departments }) {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      department: formData.get('department'),
    };
    onSubmit(data);
  };

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative w-full max-w-lg transform overflow-hidden rounded-lg bg-white dark:bg-gray-900 text-left shadow-xl transition-all">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add New Student</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter first and last name"
                  required
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Enter both first and last name (e.g., John Smith)
                </p>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="student@example.com"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="department">Department</Label>
                <Select 
                  id="department" 
                  name="department" 
                  defaultValue={departments[0]?.name}
                  className="mt-1"
                >
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.name}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? 'Adding...' : 'Add Student'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}