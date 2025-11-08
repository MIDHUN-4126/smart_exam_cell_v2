import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectItem } from './ui/select';

const API_BASE = 'http://localhost:3001/api';

export default function ExamManagement() {
  const [activeTab, setActiveTab] = useState('create');
  const [exams, setExams] = useState([]);
  const [timetables, setTimetables] = useState([]);
  const [courses, setCourses] = useState([]);
  const [sections, setSections] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form states for creating exam
  const [examForm, setExamForm] = useState({
    title: '',
    exam_date: '',
    start_time: '',
    end_time: '',
    course_id: '',
    section_id: '',
    hall: '',
    exam_type: 'Regular'
  });

  // Form for teacher assignment
  const [teacherForm, setTeacherForm] = useState({
    exam_id: '',
    faculty_id: '',
    course_id: '',
    role_type: 'both'
  });

  // Form for timetable
  const [timetableForm, setTimetableForm] = useState({
    exam_id: '',
    section_id: '',
    course_id: '',
    exam_date: '',
    start_time: '',
    end_time: '',
    hall: '',
    instructions: ''
  });

  // Selected teachers for bulk assignment
  const [selectedTeachers, setSelectedTeachers] = useState([]);

  useEffect(() => {
    fetchExams();
    fetchCourses();
    fetchSections();
    fetchFaculty();
    fetchTimetables();
  }, []);

  const fetchExams = async () => {
    try {
      const res = await fetch(`${API_BASE}/exams`);
      const data = await res.json();
      setExams(data);
    } catch (error) {
      console.error('Error fetching exams:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await fetch(`${API_BASE}/courses`);
      const data = await res.json();
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchSections = async () => {
    try {
      const res = await fetch(`${API_BASE}/sections`);
      const data = await res.json();
      // Add display name for sections
      const sectionsWithNames = data.map(s => ({
        ...s,
        display_name: `${s.section_no || ''} ${s.term || ''} ${s.year || ''}`.trim() || `Section ${s.section_id}`
      }));
      setSections(sectionsWithNames);
    } catch (error) {
      console.error('Error fetching sections:', error);
    }
  };

  const fetchFaculty = async () => {
    try {
      const res = await fetch(`${API_BASE}/faculty`);
      const data = await res.json();
      setFaculty(data);
    } catch (error) {
      console.error('Error fetching faculty:', error);
    }
  };

  const fetchTimetables = async () => {
    try {
      const res = await fetch(`${API_BASE}/exam-timetable`);
      const data = await res.json();
      setTimetables(data);
    } catch (error) {
      console.error('Error fetching timetables:', error);
    }
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch(`${API_BASE}/exams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...examForm,
          teacher_assignments: selectedTeachers
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        alert('Exam created successfully!');
        setExamForm({
          title: '',
          exam_date: '',
          start_time: '',
          end_time: '',
          course_id: '',
          section_id: '',
          hall: '',
          exam_type: 'Regular'
        });
        setSelectedTeachers([]);
        fetchExams();
      } else {
        alert('Error creating exam: ' + data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error creating exam');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTeacher = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch(`${API_BASE}/exams/${teacherForm.exam_id}/assign-teacher`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          faculty_id: teacherForm.faculty_id,
          course_id: teacherForm.course_id,
          role_type: teacherForm.role_type
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        alert('Teacher assigned successfully!');
        setTeacherForm({
          exam_id: '',
          faculty_id: '',
          course_id: '',
          role_type: 'both'
        });
      } else {
        alert('Error assigning teacher: ' + data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error assigning teacher');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTimetable = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch(`${API_BASE}/exam-timetable`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(timetableForm)
      });
      
      const data = await res.json();
      
      if (data.success) {
        alert('Timetable entry created successfully!');
        setTimetableForm({
          exam_id: '',
          section_id: '',
          course_id: '',
          exam_date: '',
          start_time: '',
          end_time: '',
          hall: '',
          instructions: ''
        });
        fetchTimetables();
      } else {
        alert('Error creating timetable: ' + data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error creating timetable');
    } finally {
      setLoading(false);
    }
  };

  const addTeacherAssignment = () => {
    if (!teacherForm.faculty_id || !teacherForm.course_id) {
      alert('Please select both teacher and course');
      return;
    }
    
    const teacher = faculty.find(f => f.faculty_id === parseInt(teacherForm.faculty_id));
    const course = courses.find(c => c.course_id === parseInt(teacherForm.course_id));
    
    setSelectedTeachers([...selectedTeachers, {
      faculty_id: teacherForm.faculty_id,
      course_id: teacherForm.course_id,
      role_type: teacherForm.role_type,
      faculty_name: teacher ? `${teacher.first_name} ${teacher.last_name}` : '',
      course_title: course ? course.title : ''
    }]);
    
    setTeacherForm({ ...teacherForm, faculty_id: '', course_id: '', role_type: 'both' });
  };

  const removeTeacherAssignment = (index) => {
    setSelectedTeachers(selectedTeachers.filter((_, i) => i !== index));
  };

  const handleDeleteExam = async (examId) => {
    if (!confirm('Are you sure you want to delete this exam?')) return;
    
    try {
      const res = await fetch(`${API_BASE}/exams/${examId}`, {
        method: 'DELETE'
      });
      
      const data = await res.json();
      
      if (data.success) {
        alert('Exam deleted successfully!');
        fetchExams();
      } else {
        alert('Error deleting exam: ' + data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error deleting exam');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold dark:text-white">Exam Management</h1>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-gray-200 dark:border-gray-700 pb-2">
        <button 
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'create' 
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' 
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
          onClick={() => setActiveTab('create')}
        >
          Create Exam
        </button>
        <button 
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'assign' 
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' 
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
          onClick={() => setActiveTab('assign')}
        >
          Assign Teachers
        </button>
        <button 
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'timetable' 
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' 
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
          onClick={() => setActiveTab('timetable')}
        >
          Exam Timetable
        </button>
        <button 
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'view' 
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' 
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
          onClick={() => setActiveTab('view')}
        >
          View Exams
        </button>
      </div>

      {/* Create Exam Tab */}
      {activeTab === 'create' && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Exam</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateExam} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300">Exam Title</label>
                  <Input
                    type="text"
                    value={examForm.title}
                    onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
                    required
                    placeholder="e.g., Mid Term Exam - I"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300">Exam Type</label>
                  <select
                    className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    value={examForm.exam_type}
                    onChange={(e) => setExamForm({ ...examForm, exam_type: e.target.value })}
                  >
                    <option value="Regular">Regular</option>
                    <option value="Mid Term">Mid Term</option>
                    <option value="Final">Final</option>
                    <option value="Supplementary">Supplementary</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300">Course</label>
                  <select
                    className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    value={examForm.course_id}
                    onChange={(e) => setExamForm({ ...examForm, course_id: e.target.value })}
                    required
                  >
                    <option value="">Select Course</option>
                    {courses.map(course => (
                      <option key={course.course_id} value={course.course_id}>
                        {course.title || course.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300">Section</label>
                  <select
                    className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    value={examForm.section_id}
                    onChange={(e) => setExamForm({ ...examForm, section_id: e.target.value })}
                  >
                    <option value="">Select Section (Optional)</option>
                    {sections.map(section => (
                      <option key={section.section_id} value={section.section_id}>
                        {section.display_name || section.section_no || `Section ${section.section_id}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300">Date</label>
                  <Input
                    type="date"
                    value={examForm.exam_date}
                    onChange={(e) => setExamForm({ ...examForm, exam_date: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300">Hall</label>
                  <Input
                    type="text"
                    value={examForm.hall}
                    onChange={(e) => setExamForm({ ...examForm, hall: e.target.value })}
                    placeholder="e.g., Main Hall, Lab 101"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300">Start Time</label>
                  <Input
                    type="time"
                    value={examForm.start_time}
                    onChange={(e) => setExamForm({ ...examForm, start_time: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300">End Time</label>
                  <Input
                    type="time"
                    value={examForm.end_time}
                    onChange={(e) => setExamForm({ ...examForm, end_time: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Teacher Assignment Section */}
              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold mb-3 dark:text-white">Assign Teachers (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                  <select
                    className="p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    value={teacherForm.faculty_id}
                    onChange={(e) => setTeacherForm({ ...teacherForm, faculty_id: e.target.value })}
                  >
                    <option value="">Select Teacher</option>
                    {faculty.map(f => (
                      <option key={f.faculty_id} value={f.faculty_id}>
                        {f.first_name} {f.last_name}
                      </option>
                    ))}
                  </select>

                  <select
                    className="p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    value={teacherForm.course_id}
                    onChange={(e) => setTeacherForm({ ...teacherForm, course_id: e.target.value })}
                  >
                    <option value="">Select Course</option>
                    {courses.map(course => (
                      <option key={course.course_id} value={course.course_id}>
                        {course.title || course.name}
                      </option>
                    ))}
                  </select>

                  <select
                    className="p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    value={teacherForm.role_type}
                    onChange={(e) => setTeacherForm({ ...teacherForm, role_type: e.target.value })}
                  >
                    <option value="both">Inspector & Corrector</option>
                    <option value="inspector">Inspector Only</option>
                    <option value="corrector">Corrector Only</option>
                  </select>

                  <Button type="button" onClick={addTeacherAssignment}>
                    Add Teacher
                  </Button>
                </div>

                {selectedTeachers.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm dark:text-gray-300">Assigned Teachers:</h4>
                    {selectedTeachers.map((teacher, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <span className="text-sm dark:text-gray-300">
                          {teacher.faculty_name} - {teacher.course_title} ({teacher.role_type})
                        </span>
                        <button
                          type="button"
                          onClick={() => removeTeacherAssignment(index)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Creating...' : 'Create Exam'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Assign Teachers Tab */}
      {activeTab === 'assign' && (
        <Card>
          <CardHeader>
            <CardTitle>Assign Teacher to Existing Exam</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAssignTeacher} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300">Select Exam</label>
                  <select
                    className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    value={teacherForm.exam_id}
                    onChange={(e) => setTeacherForm({ ...teacherForm, exam_id: e.target.value })}
                    required
                  >
                    <option value="">Select Exam</option>
                    {exams.map(exam => (
                      <option key={exam.exam_id} value={exam.exam_id}>
                        {exam.title} - {exam.exam_date} ({exam.course_title})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300">Select Teacher</label>
                  <select
                    className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    value={teacherForm.faculty_id}
                    onChange={(e) => setTeacherForm({ ...teacherForm, faculty_id: e.target.value })}
                    required
                  >
                    <option value="">Select Teacher</option>
                    {faculty.map(f => (
                      <option key={f.faculty_id} value={f.faculty_id}>
                        {f.first_name} {f.last_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300">Course/Subject</label>
                  <select
                    className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    value={teacherForm.course_id}
                    onChange={(e) => setTeacherForm({ ...teacherForm, course_id: e.target.value })}
                    required
                  >
                    <option value="">Select Course</option>
                    {courses.map(course => (
                      <option key={course.course_id} value={course.course_id}>
                        {course.title || course.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300">Role</label>
                  <select
                    className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    value={teacherForm.role_type}
                    onChange={(e) => setTeacherForm({ ...teacherForm, role_type: e.target.value })}
                  >
                    <option value="both">Inspector & Corrector</option>
                    <option value="inspector">Inspector Only</option>
                    <option value="corrector">Corrector Only</option>
                  </select>
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Assigning...' : 'Assign Teacher'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Exam Timetable Tab */}
      {activeTab === 'timetable' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create Exam Timetable Entry</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateTimetable} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 dark:text-gray-300">Exam (Optional)</label>
                    <select
                      className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      value={timetableForm.exam_id}
                      onChange={(e) => setTimetableForm({ ...timetableForm, exam_id: e.target.value })}
                    >
                      <option value="">Select Exam (Optional)</option>
                      {exams.map(exam => (
                        <option key={exam.exam_id} value={exam.exam_id}>
                          {exam.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 dark:text-gray-300">Section</label>
                    <select
                      className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      value={timetableForm.section_id}
                      onChange={(e) => setTimetableForm({ ...timetableForm, section_id: e.target.value })}
                      required
                    >
                      <option value="">Select Section</option>
                      {sections.map(section => (
                        <option key={section.section_id} value={section.section_id}>
                          {section.display_name || section.section_no || `Section ${section.section_id}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 dark:text-gray-300">Course</label>
                    <select
                      className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      value={timetableForm.course_id}
                      onChange={(e) => setTimetableForm({ ...timetableForm, course_id: e.target.value })}
                      required
                    >
                      <option value="">Select Course</option>
                      {courses.map(course => (
                        <option key={course.course_id} value={course.course_id}>
                          {course.title || course.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 dark:text-gray-300">Exam Date</label>
                    <Input
                      type="date"
                      value={timetableForm.exam_date}
                      onChange={(e) => setTimetableForm({ ...timetableForm, exam_date: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 dark:text-gray-300">Start Time</label>
                    <Input
                      type="time"
                      value={timetableForm.start_time}
                      onChange={(e) => setTimetableForm({ ...timetableForm, start_time: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 dark:text-gray-300">End Time</label>
                    <Input
                      type="time"
                      value={timetableForm.end_time}
                      onChange={(e) => setTimetableForm({ ...timetableForm, end_time: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 dark:text-gray-300">Hall</label>
                    <Input
                      type="text"
                      value={timetableForm.hall}
                      onChange={(e) => setTimetableForm({ ...timetableForm, hall: e.target.value })}
                      placeholder="e.g., Main Hall"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2 dark:text-gray-300">Instructions</label>
                    <textarea
                      className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      rows="3"
                      value={timetableForm.instructions}
                      onChange={(e) => setTimetableForm({ ...timetableForm, instructions: e.target.value })}
                      placeholder="Special instructions for this exam..."
                    />
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'Creating...' : 'Create Timetable Entry'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Timetable List */}
          <Card>
            <CardHeader>
              <CardTitle>Exam Timetables</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium dark:text-gray-300">Exam</th>
                      <th className="px-4 py-2 text-left text-sm font-medium dark:text-gray-300">Section</th>
                      <th className="px-4 py-2 text-left text-sm font-medium dark:text-gray-300">Course</th>
                      <th className="px-4 py-2 text-left text-sm font-medium dark:text-gray-300">Date</th>
                      <th className="px-4 py-2 text-left text-sm font-medium dark:text-gray-300">Time</th>
                      <th className="px-4 py-2 text-left text-sm font-medium dark:text-gray-300">Hall</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-gray-700">
                    {timetables.map((tt) => (
                      <tr key={tt.timetable_id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-4 py-3 text-sm dark:text-gray-300">{tt.exam_title || '-'}</td>
                        <td className="px-4 py-3 text-sm dark:text-gray-300">{tt.section_name}</td>
                        <td className="px-4 py-3 text-sm dark:text-gray-300">{tt.course_title}</td>
                        <td className="px-4 py-3 text-sm dark:text-gray-300">{tt.exam_date}</td>
                        <td className="px-4 py-3 text-sm dark:text-gray-300">
                          {tt.start_time} - {tt.end_time}
                        </td>
                        <td className="px-4 py-3 text-sm dark:text-gray-300">{tt.hall || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* View Exams Tab */}
      {activeTab === 'view' && (
        <Card>
          <CardHeader>
            <CardTitle>All Exams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium dark:text-gray-300">Title</th>
                    <th className="px-4 py-2 text-left text-sm font-medium dark:text-gray-300">Course</th>
                    <th className="px-4 py-2 text-left text-sm font-medium dark:text-gray-300">Section</th>
                    <th className="px-4 py-2 text-left text-sm font-medium dark:text-gray-300">Date</th>
                    <th className="px-4 py-2 text-left text-sm font-medium dark:text-gray-300">Time</th>
                    <th className="px-4 py-2 text-left text-sm font-medium dark:text-gray-300">Hall</th>
                    <th className="px-4 py-2 text-left text-sm font-medium dark:text-gray-300">Type</th>
                    <th className="px-4 py-2 text-left text-sm font-medium dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-gray-700">
                  {exams.map((exam) => (
                    <tr key={exam.exam_id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-3 text-sm dark:text-gray-300">{exam.title}</td>
                      <td className="px-4 py-3 text-sm dark:text-gray-300">{exam.course_title || '-'}</td>
                      <td className="px-4 py-3 text-sm dark:text-gray-300">{exam.section_name || '-'}</td>
                      <td className="px-4 py-3 text-sm dark:text-gray-300">{exam.exam_date}</td>
                      <td className="px-4 py-3 text-sm dark:text-gray-300">
                        {exam.start_time} - {exam.end_time}
                      </td>
                      <td className="px-4 py-3 text-sm dark:text-gray-300">{exam.hall || '-'}</td>
                      <td className="px-4 py-3 text-sm dark:text-gray-300">{exam.exam_type || 'Regular'}</td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => handleDeleteExam(exam.exam_id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
