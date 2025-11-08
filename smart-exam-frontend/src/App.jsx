import React, { useState, useEffect, useMemo, Fragment } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import { 
  AnimatePresence, motion 
} from 'framer-motion';
import { 
  User, Shield, BookUser, LayoutDashboard, GraduationCap, 
  ClipboardCheck, CalendarCheck, BarChart3, Settings, LogOut, 
  ChevronDown, Bell, Sun, Moon, Check, UserPlus, UserX, Percent,
  Menu, X, Users, Plus, Search, Trash2, Eye, Filter, BookOpen, BookCopy,
  Loader2 // Added for loading states
} from 'lucide-react';

// Import the ExamManagement component
import ExamManagement from './components/ExamManagement';

// --- CONFIGURATION ---

// Define the base URL for the API. Allow overriding via Vite env var VITE_API_URL
// Example: VITE_API_URL="http://localhost:3001/api" in .env
const API_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) || 'http://localhost:3001/api';

// Role-based navigation config
const ROLES_CONFIG = {
  student: {
    name: "Student",
    icon: GraduationCap,
    nav: [
      { name: "Dashboard", icon: LayoutDashboard, page: "dashboard" },
      { name: "My Courses", icon: BookUser, page: "courses" },
      { name: "My Scores", icon: ClipboardCheck, page: "scores" },
      { name: "Exams", icon: BookCopy, page: "exams" },
      { name: "Attendance", icon: CalendarCheck, page: "attendance" },
    ]
  },
  faculty: {
    name: "Faculty",
    icon: User,
    nav: [
      { name: "Dashboard", icon: LayoutDashboard, page: "dashboard" },
      { name: "My Sections", icon: BookUser, page: "sections" },
      { name: "Students", icon: Users, page: "students" },
      { name: "Grade Entry", icon: ClipboardCheck, page: "grades" },
      { name: "Exams", icon: BookCopy, page: "exams" },
      { name: "Attendance", icon: CalendarCheck, page: "attendance" },
      { name: "Timetable", icon: CalendarCheck, page: "timetable" },
    ]
  },
  admin: {
    name: "Admin",
    icon: Shield,
    nav: [
      { name: "Dashboard", icon: LayoutDashboard, page: "dashboard" },
      { name: "Faculty Management", icon: UserPlus, page: "faculty" }, 
      { name: "Student Management", icon: Users, page: "students" },
      { name: "Available Courses", icon: BookOpen, page: "courses" },
      { name: "Exam Management", icon: BookCopy, page: "exams" },
      { name: "Attendance", icon: CalendarCheck, page: "attendance" },
      { name: "Timetable", icon: CalendarCheck, page: "timetable" },
    ]
  }
};

// Mock data for charts (static for now, can be fetched from API later)
const scoreData = [
  { name: 'DBMS', score: 85, fullMark: 100 },
  { name: 'Web Tech', score: 92, fullMark: 100 },
  { name: 'DSA', score: 78, fullMark: 100 },
  { name: 'ML', score: 88, fullMark: 100 },
  { name: 'Software Eng.', score: 95, fullMark: 100 },
];

const attendancePieData = [
  { name: 'Present', value: 450 },
  { name: 'Absent', value: 50 },
];
const PIE_COLORS = ['#34d399', '#f87171']; // Green-400, Red-400

// Mock data for tables that are not yet fetched from API
// We will fetch students, faculty, and courses from API
const mockAttendance = [
  { id: 1, studentId: 'CS2023001', studentName: "MIDHUN P", date: "2025-09-01", course: "Database Management Systems", status: "Present", remarks: "" },
  { id: 2, studentId: 'IT2023001', studentName: "Mohamed Aaashik", date: "2025-09-01", course: "Web Technologies", status: "Present", remarks: "" },
  { id: 3, studentId: 'CS2023001', studentName: "MIDHUN P", date: "2025-09-02", course: "Database Management Systems", status: "Absent", remarks: "Sick leave" },
  { id: 4, studentId: 'IT2023001', studentName: "Mohamed Aaashik", date: "2025-09-02", course: "Web Technologies", status: "Present", remarks: "" },
  { id: 5, studentId: 'AI2023001', studentName: "Praveen Kumar", date: "2025-09-02", course: "AI & Data Science", status: "Present", remarks: "" },
  { id: 6, studentId: 'CS2023002', studentName: "Student2 CS2", date: "2025-09-01", course: "Database Management Systems", status: "Present", remarks: "" },
];

// These will be loaded from the API
const mockDepartments = [
  { id: 1, name: "Computer Science & Engineering" },
  { id: 2, name: "Information Technology" },
  { id: 3, name: "Artificial Intelligence & Data Science" },
  { id: 4, name: "Electronics & Communication" },
];

const mockPrograms = [
  { id: 1, name: "B.Tech Computer Science", deptId: 1 },
  { id: 2, name: "B.Tech Information Technology", deptId: 2 },
  { id: 3, name: "B.Tech AI & Data Science", deptId: 3 },
  { id: 4, name: "M.Tech Computer Science", deptId: 1 },
];


// --- UTILITY FUNCTIONS ---

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

// --- PROFESSIONAL UI COMPONENTS ---

const Button = React.forwardRef(({ className, variant = 'default', size = 'default', isLoading, ...props }, ref) => {
  const variants = {
    default: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md',
    destructive: 'bg-red-600 text-white hover:bg-red-700 shadow-md',
    outline: 'border border-gray-300 bg-white text-gray-800 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700',
    ghost: 'hover:bg-gray-200 dark:hover:bg-gray-800',
    link: 'text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400',
  };
  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3',
    lg: 'h-11 rounded-md px-8',
    icon: 'h-10 w-10',
  };
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none text-gray-800 dark:text-gray-200',
        variants[variant],
        sizes[size],
        isLoading && 'opacity-75 cursor-not-allowed',
        className
      )}
      ref={ref}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : props.children}
    </button>
  );
});

const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('rounded-xl border border-gray-200 bg-white text-gray-900 shadow-lg dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100', className)}
    {...props}
  />
));
const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
));
const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn('font-semibold leading-none tracking-tight text-lg', className)} {...props} />
));
const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm text-gray-600 dark:text-gray-400', className)} {...props} />
));
const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />
));

const Input = React.forwardRef(({ className, type, icon, ...props }, ref) => {
  const Icon = icon;
  return (
    <div className="relative">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <Icon className="h-4 w-4" />
        </div>
      )}
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-lg border border-gray-300 bg-white py-2 text-sm',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-400',
          Icon ? 'pl-9 pr-3' : 'px-3',
          className
        )}
        ref={ref}
        {...props}
      />
    </div>
  );
});

const Label = React.forwardRef(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn('text-sm font-medium leading-none text-gray-800 dark:text-gray-200 peer-disabled:cursor-not-allowed peer-disabled:opacity-70', className)}
    {...props}
  />
));

const RadioGroup = React.forwardRef(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn('grid gap-2', className)} {...props} />;
});

const RadioGroupItem = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <input
      type="radio"
      ref={ref}
      className={cn(
        'aspect-square h-4 w-4 rounded-full border border-gray-400 text-indigo-600',
        'focus:ring-indigo-500 focus-visible:ring-2 focus-visible:ring-offset-2',
        'dark:border-gray-600 dark:bg-gray-800 dark:text-indigo-500',
        className
      )}
      {...props}
    />
  );
});

const Select = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <select
      className={cn(
        'flex h-10 w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm',
        'placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-400',
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </select>
  );
});
const SelectItem = React.forwardRef(({ className, ...props }, ref) => {
  return <option ref={ref} className={cn('', className)} {...props} />;
});

const Table = React.forwardRef(({ className, ...props }, ref) => (
  <div className="w-full overflow-auto">
    <table ref={ref} className={cn('w-full caption-bottom text-sm', className)} {...props} />
  </div>
));
const TableHeader = React.forwardRef(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn('[&_tr]:border-b', className)} {...props} />
));
const TableBody = React.forwardRef(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn('[&_tr:last-child]:border-0', className)} {...props} />
));
const TableRow = React.forwardRef(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn('border-b border-gray-200 transition-colors hover:bg-gray-100/50 dark:border-gray-800 dark:hover:bg-gray-800/50', className)}
    {...props}
  />
));
const TableHead = React.forwardRef(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn('h-12 px-4 text-left align-middle font-medium text-gray-600 dark:text-gray-400', className)}
    {...props}
  />
));
const TableCell = React.forwardRef(({ className, ...props }, ref) => (
  <td ref={ref} className={cn('p-4 align-middle', className)} {...props} />
));

function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  
  console.log('Modal rendering with isOpen:', isOpen);
  
  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
        
        <div className="relative w-full max-w-lg transform overflow-hidden rounded-lg bg-white dark:bg-gray-900 text-left shadow-xl transition-all">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}


// --- PAGE COMPONENTS ---

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6">
          <Card className="border-rose-300 dark:border-rose-800">
            <CardHeader>
              <CardTitle>Something went wrong</CardTitle>
              <CardDescription className="text-rose-600 dark:text-rose-300">{String(this.state.error)}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">Try navigating to another page and back, or refresh. Check console for details.</p>
            </CardContent>
          </Card>
        </div>
      );
    }
    return this.props.children;
  }
}

function LoginPage({ onLogin, setNotification, darkMode, toggleDarkMode }) {
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setNotification(null); // Clear previous notifications

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed.');
      }

      // Login successful
      onLogin(data); // data should be the user object { id, username, email, role }
      setNotification({ type: 'success', message: `Welcome, ${data.username}!` });

    } catch (error) {
      console.error('Login error:', error);
      setNotification({ type: 'error', message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedRoleConfig = ROLES_CONFIG[role];
  
  const loginVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.3, ease: "easeOut" }
    })
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      {/* Theme Toggle Button - Top Right */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        onClick={toggleDarkMode}
        className="fixed top-6 right-6 z-50 p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-gray-200 dark:border-gray-700"
        aria-label="Toggle theme"
      >
        {darkMode ? (
          <Sun className="w-6 h-6 text-yellow-500" />
        ) : (
          <Moon className="w-6 h-6 text-indigo-600" />
        )}
      </motion.button>

      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem] dark:bg-gray-950 dark:bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)]">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_500px_at_50%_200px,#c084fc,transparent)] dark:bg-[radial-gradient(circle_500px_at_50%_200px,#5b21b6,transparent)] opacity-30"></div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Card className="w-full max-w-md shadow-2xl backdrop-blur-sm bg-white/80 dark:bg-gray-950/80">
          <CardHeader>
            <motion.div custom={0} initial="hidden" animate="visible" variants={loginVariants}>
              <div className="flex justify-center mb-4">
                <div className={cn(
                  'flex h-16 w-16 items-center justify-center rounded-full text-white shadow-lg',
                  role === 'student' && 'bg-gradient-to-br from-indigo-500 to-indigo-700',
                  role === 'faculty' && 'bg-gradient-to-br from-blue-500 to-blue-700',
                  role === 'admin' && 'bg-gradient-to-br from-purple-500 to-purple-700'
                )}>
                  <selectedRoleConfig.icon size={32} />
                </div>
              </div>
            </motion.div>
            <motion.div custom={1} initial="hidden" animate="visible" variants={loginVariants}>
              <CardTitle className="text-2xl font-bold text-center">
                Smart Exam Cell
              </CardTitle>
            </motion.div>
            <motion.div custom={2} initial="hidden" animate="visible" variants={loginVariants}>
              <CardDescription className="text-center">
                Sign in as a {selectedRoleConfig.name}
              </CardDescription>
            </motion.div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <motion.div custom={3} initial="hidden" animate="visible" variants={loginVariants} className="space-y-4">
                <RadioGroup className="grid grid-cols-3 gap-3">
                  {Object.entries(ROLES_CONFIG).map(([key, { name, icon: Icon }]) => (
                    <Label
                      key={key}
                      htmlFor={key}
                      className={cn(
                        'flex flex-col items-center justify-center rounded-lg border-2 p-3 cursor-pointer transition-all duration-200',
                        role === key
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-500 dark:text-white'
                          : 'border-gray-300 bg-white hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800',
                         role === 'faculty' && role === key && 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:border-blue-500',
                         role === 'admin' && role === key && 'border-purple-600 bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:border-purple-500'
                      )}
                    >
                      <RadioGroupItem 
                        value={key} 
                        id={key} 
                        className="sr-only"
                        checked={role === key}
                        onChange={(e) => setRole(e.target.value)}
                      />
                      <Icon className="mb-1 h-5 w-5" />
                      {name}
                    </Label>
                  ))}
                </RadioGroup>

                <div className="space-y-1">
                  <Label htmlFor="email">Email (Username)</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@college.edu"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Hint: Use 'password' for the demo (if you haven't set up bcrypt).
                  </p>
                </div>
              </motion.div>
              <motion.div custom={4} initial="hidden" animate="visible" variants={loginVariants} className="mt-6">
                <Button 
                  type="submit" 
                  className={cn(
                    'w-full text-lg font-semibold shadow-xl',
                    role === 'student' && 'bg-gradient-to-r from-indigo-500 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800',
                    role === 'faculty' && 'bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800',
                    role === 'admin' && 'bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800'
                  )}
                  isLoading={isLoading}
                >
                  Login
                </Button>
              </motion.div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// DataContext to hold all fetched data
const DataContext = React.createContext();

function DataProvider({ children, setNotification, user }) {
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiAvailable, setApiAvailable] = useState(true);
  // Cross-page selection: allow admin to pick a faculty and jump to Timetable
  const [selectedFacultyIdForTimetable, setSelectedFacultyIdForTimetable] = useState(null);

  // Utility: normalize API responses that may be { value: [...] } or an array
  function asArray(payload) {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;
    if (payload.value && Array.isArray(payload.value)) return payload.value;
    if (payload.rows && Array.isArray(payload.rows)) return payload.rows;
    return [];
  }

  // Normalize a student record from backend to the UI shape we use across the app
  const normalizeStudent = (s) => {
    const originalId = s.id || s._id || null;
    const sid = s.student_id || originalId || '';
    const first = s.first_name || s.firstName || '';
    const last = s.last_name || s.lastName || '';
    const displayName = s.name || [first, last].filter(Boolean).join(' ').trim() || sid || 'Unknown';
    const statusRaw = (s.status ?? 'Active').toString();
    const normalizedStatus = /active/i.test(statusRaw) ? 'Active' : (/inactive|disabled/i.test(statusRaw) ? 'Inactive' : statusRaw);
    return {
      // Preserve original fields
      ...s,
      backend_id: originalId, // keep server-generated id if any
      // Canonical UI fields
      id: sid, // Treat student_id as id in UI so searches are consistent
      student_id: sid,
      name: displayName,
      first_name: first,
      last_name: last,
      email: s.email || '',
      department: s.department || s.dept || s.dept_name || '',
      program: s.program || s.program_name || s.programme || '',
      status: normalizedStatus,
    };
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Build courses URL with student filter if user is a student
      const coursesUrl = user && user.role === 'student' && user.id 
        ? `${API_URL}/courses?student_id=${user.id}`
        : `${API_URL}/courses`;

      // Fetch all data in parallel
      const [studentsRes, facultyRes, coursesRes] = await Promise.all([
        fetch(`${API_URL}/students`),
        fetch(`${API_URL}/faculty`),
        fetch(coursesUrl),
      ]);

      if (!studentsRes.ok || !facultyRes.ok || !coursesRes.ok) {
        // Try to read error details if available
        const details = await Promise.all([
          studentsRes.json().catch(() => ({})),
          facultyRes.json().catch(() => ({})),
          coursesRes.json().catch(() => ({})),
        ]).catch(() => ({}));
        throw new Error('Failed to fetch initial data from backend: ' + JSON.stringify(details));
      }

      const studentsDataRaw = await studentsRes.json();
      const facultyDataRaw = await facultyRes.json();
      const coursesDataRaw = await coursesRes.json();

  const studentsData = asArray(studentsDataRaw).map(normalizeStudent);
      const facultyData = asArray(facultyDataRaw);
      const coursesData = asArray(coursesDataRaw);

  setStudents(studentsData);
      setFaculty(facultyData);
      setCourses(coursesData);
      setApiAvailable(true);

    } catch (error) {
      console.error("Data fetch error:", error);
      // Mark API as unavailable and surface a notification. Keep UI usable with local state.
      setApiAvailable(false);
      setNotification({ type: 'error', message: 'Failed to fetch initial data from backend. Working in offline/local mode.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]); // Re-fetch when user changes

  const contextValue = {
    students, setStudents,
    faculty, setFaculty,
    courses, setCourses,
    isLoading,
    refetchData: fetchData // Function to allow refetching
    , apiAvailable,
    // Timetable cross-navigation selection
    selectedFacultyIdForTimetable,
    setSelectedFacultyIdForTimetable,
  };

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
}


function MainDashboard({ user, onLogout, setNotification }) {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [darkMode, setDarkMode] = useState(true);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 'n1', title: 'Welcome to SmartExam', message: 'You are logged in.', time: 'Just now', read: false },
    { id: 'n2', title: 'System Update', message: 'Scores module supports updates.', time: '1h ago', read: true },
  ]);

  // Data context
  const dataContext = React.useContext(DataContext);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setIsSidebarOpen(!mobile);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const userConfig = ROLES_CONFIG[user.role];

  const handleLogout = () => {
    onLogout();
    setNotification({ type: 'info', message: 'You have been logged out.' });
  };
  
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.4
  };

  return (
    <div className={cn("flex h-screen bg-gray-100 dark:bg-gray-900", darkMode ? 'dark' : '')}>
      {/* Sidebar */}
      <motion.div
        className={cn(
          'absolute md:static z-20 flex flex-col bg-white dark:bg-gray-950 shadow-2xl transition-all duration-300 ease-in-out',
          isMobile ? 'inset-y-0 left-0' : 'h-full'
        )}
        animate={isSidebarOpen ? 'open' : 'closed'}
        variants={{
          open: { width: isMobile ? '300px' : '300px', x: 0 },
          closed: { width: isMobile ? '0px' : '80px', x: isMobile ? '-300px' : '0px' }
        }}
        transition={{ type: 'tween', duration: 0.3 }}
      >
        <div className="flex flex-shrink-0 items-center justify-between h-16 px-4 border-b dark:border-gray-800">
          <motion.span 
            className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 overflow-hidden whitespace-nowrap"
            animate={{ 
              opacity: isSidebarOpen || !isMobile ? 1 : 0, 
              width: isSidebarOpen || !isMobile ? 'auto' : 0,
            }}
          >
            {isSidebarOpen || !isMobile ? 'SmartExam' : ''}
          </motion.span>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsSidebarOpen(false)}>
            <X />
          </Button>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {userConfig.nav.map((item) => (
            <NavItem
              key={item.name}
              item={item}
              isActive={currentPage === item.page}
              isSidebarOpen={isSidebarOpen || !isMobile}
              onClick={() => {
                setCurrentPage(item.page);
                if (isMobile) setIsSidebarOpen(false);
              }}
            />
          ))}
        </nav>
        <div className="p-4 border-t dark:border-gray-800">
          <NavItem
            item={{ name: "Logout", icon: LogOut }}
            isSidebarOpen={isSidebarOpen || !isMobile}
            onClick={handleLogout}
          />
        </div>
      </motion.div>
      
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 z-10 bg-black/30" 
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex h-16 w-full flex-shrink-0 items-center justify-between border-b dark:border-gray-800 bg-white dark:bg-gray-950 px-4 md:px-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X /> : <Menu />}
          </Button>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <Sun /> : <Moon />}
            </Button>
            <Button variant="ghost" size="icon" className="relative" onClick={() => setIsNotifOpen(o => !o)}>
              <Bell />
              {notifications.some(n => !n.read) && (
                <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-gray-950" />
              )}
            </Button>
            <div className="flex items-center space-x-2">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium">
                {user.username.charAt(0)}
              </div>
              <div className="hidden md:block">
                <div className="text-sm font-medium dark:text-gray-200">{user.username}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{userConfig.name}</div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {dataContext.isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                variants={pageVariants}
                initial="initial"
                animate="in"
                exit="out"
                transition={pageTransition}
              >
                <ErrorBoundary>
                  <PageContent page={currentPage} user={user} setNotification={setNotification} setPage={setCurrentPage} />
                </ErrorBoundary>
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>
      {/* Notification Panel */}
      <NotificationPanel
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        notifications={notifications}
        onMarkAllRead={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
        onClear={() => setNotifications([])}
        onToggleRead={(id) => setNotifications(prev => prev.map(n => n.id === id ? ({ ...n, read: !n.read }) : n))}
      />
    </div>
  );
}

function NavItem({ item, isActive, isSidebarOpen, onClick }) {
  const { icon: Icon, name } = item;
  return (
    <Button
      variant={isActive ? 'secondary' : 'ghost'}
      size="lg"
      className={cn(
        "w-full justify-start text-base",
        !isSidebarOpen && "justify-center",
        isActive && "text-indigo-600 dark:text-indigo-400 font-semibold"
      )}
      onClick={onClick}
      title={isSidebarOpen ? '' : name}
    >
      {/* Fixed-width icon column to align labels perfectly */}
      <span className={cn("w-6 flex-shrink-0 flex items-center justify-center", isSidebarOpen && "mr-3")}> 
        <Icon className="h-5 w-5" />
      </span>
      <motion.span
        className="overflow-hidden whitespace-nowrap text-left flex-1 min-w-0"
        animate={{ 
          opacity: isSidebarOpen ? 1 : 0, 
          width: isSidebarOpen ? 'auto' : 0,
          display: isSidebarOpen ? 'inline' : 'none'
        }}
        transition={{ duration: 0.2 }}
      >
        {name}
      </motion.span>
    </Button>
  );
}

function PageContent({ page, user, setNotification, setPage }) {
  // Simple router
  switch (page) {
    case 'dashboard':
      return <DashboardPage user={user} />;
    case 'courses':
    case 'sections':
      return <CoursesPage user={user} setNotification={setNotification} />;
    case 'scores':
    case 'grades':
      return <ScoresPage user={user} />;
    case 'attendance':
      return <AttendancePage user={user} />;
    case 'exams':
      // Show ExamManagement for admin, ExamsPage for others
      if (user.role === 'admin') {
        return <ExamManagement />;
      }
      return <ExamsPage user={user} />;
    case 'timetable':
      return <TimetablePage user={user} />;
    case 'students':
      return <StudentManagementPage user={user} setNotification={setNotification} />;
    case 'faculty':
      return <FacultyManagementPage user={user} setNotification={setNotification} setPage={setPage} />;
    default:
      return <DashboardPage user={user} />;
  }
}

// --- FULL PAGE COMPONENTS ---

function DashboardPage({ user }) {
  const config = ROLES_CONFIG[user.role];
  const { students, courses, faculty } = React.useContext(DataContext);
  const [studentAttendance, setStudentAttendance] = useState(null);
  const [adminStats, setAdminStats] = useState(null);
  const [facultyStats, setFacultyStats] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Fetch real attendance data for students
  useEffect(() => {
    if (user.role === 'student' && user.id) {
      const fetchStudentAttendance = async () => {
        setLoading(true);
        try {
          // Fetch attendance records
          const attRes = await fetch(`${API_URL}/attendance?student_id=${user.id}`);
          const attData = await attRes.json().catch(() => []);
          
          // Fetch enrollments
          const enrollRes = await fetch(`${API_URL}/enrollments?student_id=${user.id}`);
          const enrollData = await enrollRes.json().catch(() => []);
          
          const rows = Array.isArray(attData) ? attData : [];
          const enrollments = Array.isArray(enrollData) ? enrollData : [];
          
          let total = 0;
          let present = 0;
          
          for (const row of rows) {
            total++;
            if (/present/i.test(String(row.status || ''))) {
              present++;
            }
          }
          
          const percent = total === 0 ? 0 : Math.round((present / total) * 100);
          
          setStudentAttendance({
            total,
            present,
            absent: total - present,
            percent,
            enrollmentCount: enrollments.length
          });
        } catch (error) {
          console.error('Error fetching student attendance:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchStudentAttendance();
    }
  }, [user]);

  // Fetch admin statistics
  useEffect(() => {
    if (user.role === 'admin') {
      const fetchAdminStats = async () => {
        setLoading(true);
        try {
          // Fetch all necessary data for admin dashboard
          const [examsRes, attendanceRes] = await Promise.all([
            fetch(`${API_URL}/exams`),
            fetch(`${API_URL}/attendance`)
          ]);
          
          const examsData = await examsRes.json().catch(() => []);
          const attendanceData = await attendanceRes.json().catch(() => []);
          
          const exams = Array.isArray(examsData) ? examsData : [];
          const allAttendance = Array.isArray(attendanceData) ? attendanceData : [];
          
          // Calculate attendance statistics
          let totalRecords = allAttendance.length;
          let presentCount = allAttendance.filter(record => /present/i.test(String(record.status || ''))).length;
          let avgAttendance = totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0;
          
          setAdminStats({
            totalExams: exams.length,
            avgAttendance,
            totalAttendanceRecords: totalRecords
          });
        } catch (error) {
          console.error('Error fetching admin stats:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchAdminStats();
    }
  }, [user]);

  // Fetch faculty statistics
  useEffect(() => {
    if (user.role === 'faculty' && user.id) {
      const fetchFacultyStats = async () => {
        setLoading(true);
        try {
          // Fetch faculty's assigned exams and courses
          const [examsRes, sectionsRes] = await Promise.all([
            fetch(`${API_URL}/teacher-exams/${user.id}`),
            fetch(`${API_URL}/sections?faculty_id=${user.id}`)
          ]);
          
          const examsData = await examsRes.json().catch(() => []);
          const sectionsData = await sectionsRes.json().catch(() => []);
          
          const exams = Array.isArray(examsData) ? examsData : [];
          const sections = Array.isArray(sectionsData) ? sectionsData : [];
          
          // Count unique students across all sections
          const uniqueStudents = new Set();
          sections.forEach(section => {
            if (section.student_count) {
              // If we have student count from backend
              uniqueStudents.add(section.section_id);
            }
          });
          
          setFacultyStats({
            totalSections: sections.length,
            totalExams: exams.length,
            totalStudents: sections.reduce((sum, s) => sum + (s.student_count || 0), 0) || 0
          });
        } catch (error) {
          console.error('Error fetching faculty stats:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchFacultyStats();
    }
  }, [user]);
  
  const listVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };
  
  const studentCount = students.length;
  const facultyCount = faculty?.length || 0;
  
  // Use real attendance data for students, mock data for others
  const attendanceValue = user.role === 'student' && studentAttendance 
    ? `${studentAttendance.percent}%` 
    : user.role === 'admin' && adminStats
    ? `${adminStats.avgAttendance}%`
    : "92.0%";
    
  const attendancePieData = user.role === 'student' && studentAttendance
    ? [
        { name: 'Present', value: studentAttendance.present },
        { name: 'Absent', value: studentAttendance.absent }
      ]
    : [
        { name: 'Present', value: 450 },
        { name: 'Absent', value: 50 }
      ];

  return (
    <div className="space-y-6">
      <motion.h1 
        className="text-3xl font-bold dark:text-white"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Welcome, {user.username}!
      </motion.h1>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={listVariants}
        initial="hidden"
        animate="visible"
      >
        {user.role === 'admin' ? (
          // Admin-specific dashboard cards
          <>
            <motion.div variants={itemVariants}>
              <StatCard 
                title="Total Students" 
                value={studentCount}
                icon={Users} 
                color="indigo" 
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard 
                title="Total Faculty"
                value={facultyCount}
                icon={User} 
                color="emerald" 
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard 
                title="Total Courses"
                value={courses.length}
                icon={BookOpen} 
                color="amber" 
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard 
                title="Total Exams"
                value={loading ? '...' : (adminStats?.totalExams || 0)}
                icon={BookCopy}
                color="rose" 
              />
            </motion.div>
          </>
        ) : user.role === 'faculty' ? (
          // Faculty-specific dashboard cards
          <>
            <motion.div variants={itemVariants}>
              <StatCard 
                title="My Sections" 
                value={loading ? '...' : (facultyStats?.totalSections || 0)}
                icon={BookUser} 
                color="indigo" 
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard 
                title="Total Students"
                value={loading ? '...' : (facultyStats?.totalStudents || 0)}
                icon={Users} 
                color="emerald" 
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard 
                title="My Courses"
                value={courses.length}
                icon={BookOpen} 
                color="amber" 
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard 
                title="Assigned Exams"
                value={loading ? '...' : (facultyStats?.totalExams || 0)}
                icon={BookCopy}
                color="rose" 
              />
            </motion.div>
          </>
        ) : (
          // Student dashboard cards
          <>
            <motion.div variants={itemVariants}>
              <StatCard 
                title="Active Courses" 
                value={courses.length}
                icon={BookUser} 
                color="indigo" 
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard 
                title="Overall Score"
                value="88.5%" // Static data
                icon={GraduationCap} 
                color="emerald" 
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard 
                title="Attendance"
                value={loading && user.role === 'student' ? '...' : attendanceValue}
                icon={CalendarCheck} 
                color="amber" 
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard 
                title="Active Courses"
                value={studentAttendance ? studentAttendance.enrollmentCount : courses.length}
                icon={BookOpen}
                color="rose" 
              />
            </motion.div>
          </>
        )}
      </motion.div>

      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        variants={listVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Scores</CardTitle>
              <CardDescription>Performance in recent assessments.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scoreData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" strokeOpacity={0.2} />
                    <XAxis dataKey="name" stroke="currentColor" fontSize={12} />
                    <YAxis stroke="currentColor" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        backdropFilter: "blur(4px)",
                        border: "1px solid #e5e7eb",
                        borderRadius: "0.5rem",
                        color: "#1f2937"
                      }}
                      wrapperClassName="dark:!bg-gray-900/80 dark:!border-gray-700 dark:!text-gray-100"
                    />
                    <Legend />
                    <Bar dataKey="score" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Attendance</CardTitle>
              <CardDescription>Overall attendance record.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={attendancePieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      labelLine={false}
                      label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                        const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                        const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                        return (
                          <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={14} fontWeight="bold">
                            {`${(percent * 100).toFixed(0)}%`}
                          </text>
                        );
                      }}
                    >
                      {attendancePieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      wrapperClassName="dark:!bg-gray-900/80 dark:!border-gray-700 dark:!text-gray-100"
                    />
                    <Legend 
                      wrapperStyle={{ color: 'inherit' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  const colors = {
    indigo: { bg: 'bg-indigo-100 dark:bg-indigo-900/50', text: 'text-indigo-600 dark:text-indigo-400', shadow: 'shadow-indigo-500/30' },
    emerald: { bg: 'bg-emerald-100 dark:bg-emerald-900/50', text: 'text-emerald-600 dark:text-emerald-400', shadow: 'shadow-emerald-500/30' },
    amber: { bg: 'bg-amber-100 dark:bg-amber-900/50', text: 'text-amber-600 dark:text-amber-400', shadow: 'shadow-amber-500/30' },
    rose: { bg: 'bg-rose-100 dark:bg-rose-900/50', text: 'text-rose-600 dark:text-rose-400', shadow: 'shadow-rose-500/30' },
  }
  const colorClasses = colors[color] || colors.indigo;

  return (
    <Card className={cn("overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1", colorClasses.shadow)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</CardTitle>
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-full", colorClasses.bg, colorClasses.text)}>
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold dark:text-white">{value}</div>
      </CardContent>
    </Card>
  );
}

// Timetable Page (read-only for faculty)
function TimetablePage({ user }) {
  const isFaculty = user.role === 'faculty';
  const isAdmin = user.role === 'admin';
  const { faculty, courses, selectedFacultyIdForTimetable, setSelectedFacultyIdForTimetable } = React.useContext(DataContext);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [facultyFilter, setFacultyFilter] = useState('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    faculty_id: '',
    course_id: '',
    day_of_week: 1,
    start_time: '09:00',
    end_time: '10:00',
    room: '',
    section: ''
  });

  const days = [
    { n: 1, name: 'Monday' },
    { n: 2, name: 'Tuesday' },
    { n: 3, name: 'Wednesday' },
    { n: 4, name: 'Thursday' },
    { n: 5, name: 'Friday' },
    { n: 6, name: 'Saturday' },
  ];

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (isFaculty) params.set('faculty_id', user.id);
      if (isAdmin && facultyFilter !== 'all') params.set('faculty_id', facultyFilter);
      const res = await fetch(`${API_URL}/timetable?${params.toString()}`);
      const data = await res.json().catch(() => []);
      const arr = Array.isArray(data) ? data : (data.value || []);
      setSlots(arr);
    } catch (_) {
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [user.id, facultyFilter]);

  // If admin navigated here with a specific faculty selected, apply it once
  useEffect(() => {
    if (isAdmin && selectedFacultyIdForTimetable) {
      setFacultyFilter(String(selectedFacultyIdForTimetable));
      // Optional: clear after applying so future visits aren't sticky
      setSelectedFacultyIdForTimetable(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFacultyIdForTimetable, isAdmin]);

  const slotsByDay = useMemo(() => {
    const m = new Map();
    for (const d of days) m.set(d.n, []);
    for (const s of slots) {
      const dn = Number(s.day_of_week || s.day || 0);
      if (!m.has(dn)) m.set(dn, []);
      m.get(dn).push(s);
    }
    for (const [k, arr] of m) {
      arr.sort((a, b) => String(a.start_time).localeCompare(String(b.start_time)));
    }
    return m;
  }, [slots]);

  const fmtTime = (t) => (t ? String(t).slice(0,5) : '');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <h1 className="text-3xl font-bold dark:text-white">{isFaculty ? 'My Timetable' : 'Timetable'}</h1>
        <div className="flex items-center gap-2 w-full md:w-auto">
          {isAdmin && (
            <div className="min-w-[220px]">
              <Select value={facultyFilter} onChange={(e) => setFacultyFilter(e.target.value)}>
                <SelectItem value="all">All Faculty</SelectItem>
                {faculty.map(f => (
                  <SelectItem key={f.id} value={String(f.id)}>{f.name} ({f.id})</SelectItem>
                ))}
              </Select>
            </div>
          )}
          <Button onClick={load} isLoading={loading}>Refresh</Button>
          {isAdmin && (
            <Button onClick={() => {
              const firstFaculty = faculty[0]?.id || '';
              const firstCourse = courses[0]?.id || '';
              setForm(prev => ({ ...prev, faculty_id: String(firstFaculty), course_id: String(firstCourse) }));
              setIsAddOpen(true);
            }}>
              <Plus className="h-4 w-4 mr-2" /> Add Slot
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Day</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Course</TableHead>
                {isAdmin && <TableHead>Faculty</TableHead>}
                <TableHead>Room</TableHead>
                <TableHead>Section</TableHead>
                {isAdmin && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {days.map((d) => {
                const daySlots = slotsByDay.get(d.n) || [];
                if (daySlots.length === 0) {
                  return (
                    <TableRow key={d.n}>
                      <TableCell className="font-medium">{d.name}</TableCell>
                      <TableCell colSpan={isAdmin ? 6 : 4} className="text-gray-500">No classes</TableCell>
                    </TableRow>
                  );
                }
                return (
                  <Fragment key={d.n}>
                    <TableRow>
                      <TableCell colSpan={isAdmin ? 7 : 5} className="bg-gray-50 dark:bg-gray-800/50 font-semibold text-gray-700 dark:text-gray-200">{d.name}</TableCell>
                    </TableRow>
                    {daySlots.map((s, idx) => (
                      <TableRow key={`${d.n}-${idx}`}>
                        <TableCell className="text-gray-500">{''}</TableCell>
                        <TableCell>{fmtTime(s.start_time)} - {fmtTime(s.end_time)}</TableCell>
                        <TableCell>{s.course_title || courses.find(c => c.id === s.course_id)?.title || s.course_id}</TableCell>
                        {isAdmin && (
                          <TableCell>{faculty.find(f => String(f.id) === String(s.faculty_id))?.name || s.faculty_id}</TableCell>
                        )}
                        <TableCell>{s.room || '-'}</TableCell>
                        <TableCell>{s.section || '-'}</TableCell>
                        {isAdmin && (
                          <TableCell>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={async () => {
                                if (!s.id) { alert('Missing slot id.'); return; }
                                const yes = confirm('Delete this timetable slot?');
                                if (!yes) return;
                                try {
                                  const res = await fetch(`${API_URL}/timetable/${encodeURIComponent(s.id)}`, { method: 'DELETE' });
                                  if (!(res.ok || res.status === 204)) {
                                    let msg = '';
                                    try { const j = await res.json(); msg = j.message || ''; } catch (_) {}
                                    throw new Error(msg || `Failed to delete (${res.status}).`);
                                  }
                                  await load();
                                } catch (e) {
                                  alert(e.message);
                                }
                              }}
                            >
                              Delete
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Slot Modal (Admin) */}
      {isAdmin && (
        <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Timetable Slot">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Faculty</Label>
              <Select value={form.faculty_id} onChange={(e) => setForm(prev => ({ ...prev, faculty_id: e.target.value }))}>
                {faculty.length === 0 && <SelectItem value="">No faculty</SelectItem>}
                {faculty.map(f => (
                  <SelectItem key={f.id} value={String(f.id)}>{f.name} ({f.id})</SelectItem>
                ))}
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Course</Label>
              <Select value={form.course_id} onChange={(e) => setForm(prev => ({ ...prev, course_id: e.target.value }))}>
                {courses.length === 0 && <SelectItem value="">No courses</SelectItem>}
                {courses.map(c => (
                  <SelectItem key={c.id} value={String(c.id)}>{c.title} ({c.id})</SelectItem>
                ))}
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Day</Label>
              <Select value={String(form.day_of_week)} onChange={(e) => setForm(prev => ({ ...prev, day_of_week: Number(e.target.value) }))}>
                <SelectItem value="1">Monday</SelectItem>
                <SelectItem value="2">Tuesday</SelectItem>
                <SelectItem value="3">Wednesday</SelectItem>
                <SelectItem value="4">Thursday</SelectItem>
                <SelectItem value="5">Friday</SelectItem>
                <SelectItem value="6">Saturday</SelectItem>
                <SelectItem value="7">Sunday</SelectItem>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Start Time</Label>
              <Input type="time" value={form.start_time} onChange={(e) => setForm(prev => ({ ...prev, start_time: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>End Time</Label>
              <Input type="time" value={form.end_time} onChange={(e) => setForm(prev => ({ ...prev, end_time: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Room</Label>
              <Input value={form.room} onChange={(e) => setForm(prev => ({ ...prev, room: e.target.value }))} placeholder="A-101" />
            </div>
            <div className="space-y-1">
              <Label>Section</Label>
              <Input value={form.section} onChange={(e) => setForm(prev => ({ ...prev, section: e.target.value }))} placeholder="CSE-3A" />
            </div>
          </div>
          <CardFooter className="justify-end gap-2 mt-4">
            <Button variant="outline" type="button" onClick={() => setIsAddOpen(false)} disabled={isSaving}>Cancel</Button>
            <Button type="button" isLoading={isSaving} onClick={async () => {
              // Basic validation
              if (!form.faculty_id || !form.course_id) { alert('Select faculty and course'); return; }
              if (!form.start_time || !form.end_time) { alert('Select time range'); return; }
              if (form.end_time <= form.start_time) { alert('End time must be after start time'); return; }
              setIsSaving(true);
              try {
                const payload = { ...form, faculty_id: Number(form.faculty_id), course_id: Number(form.course_id) };
                const res = await fetch(`${API_URL}/timetable`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload)
                });
                if (!res.ok) {
                  const err = await res.json().catch(() => ({}));
                  throw new Error(err.message || 'Failed to save');
                }
                setIsAddOpen(false);
                await load();
              } catch (e) {
                alert(e.message);
              } finally {
                setIsSaving(false);
              }
            }}>Save</Button>
          </CardFooter>
        </Modal>
      )}
    </div>
  );
}

function ExamsPage({ user }) {
  const isFaculty = user.role === 'faculty';
  const isStudent = user.role === 'student';
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateFilter, setDateFilter] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateFilter) params.set('date', dateFilter);
      // The backend enforces scope if we send X-User-Id/X-User-Role headers
      const headers = {
        'Accept': 'application/json',
        'X-User-Id': String(user.id),
        'X-User-Role': String(user.role),
      };
      const res = await fetch(`${API_URL}/exams?${params.toString()}`, { headers });
      const data = await res.json().catch(() => []);
      const arr = Array.isArray(data) ? data : (data.value || []);
      setExams(arr);
    } catch (e) {
      console.error('Load exams error:', e);
      setExams([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [user, dateFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold dark:text-white">{isStudent ? 'My Exams' : (isFaculty ? 'Assigned Exams' : 'Exams')}</h1>
        <div className="flex items-center gap-2">
          <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
          <Button onClick={load} isLoading={loading}>Refresh</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Exam Schedule</CardTitle>
          <CardDescription>{isStudent ? 'Exams allocated to you' : (isFaculty ? 'Exams you are assigned to' : 'All scheduled exams')}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Hall</TableHead>
                <TableHead>Paper</TableHead>
                {isFaculty && <TableHead>Faculty</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {exams.map((e) => (
                <TableRow key={e.exam_id || `${e.course_id}-${e.date}-${e.start_time}`}>
                  <TableCell>{e.date || '-'}</TableCell>
                  <TableCell>{(e.start_time ? String(e.start_time).slice(0,5) : '')}{e.end_time ? ` - ${String(e.end_time).slice(0,5)}` : ''}</TableCell>
                  <TableCell>{e.course_title || e.course_id || '-'}</TableCell>
                  <TableCell>{e.title || '-'}</TableCell>
                  <TableCell>{e.hall || '-'}</TableCell>
                  <TableCell>{e.paper || '-'}</TableCell>
                  {isFaculty && <TableCell>{e.faculty_name || e.faculty_id || '-'}</TableCell>}
                </TableRow>
              ))}
              {exams.length === 0 && (
                <TableRow>
                  <TableCell colSpan={isFaculty ? 7 : 6} className="text-center h-24 text-gray-500 dark:text-gray-400">No exams found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * CoursesPage
 * Updated for Admin role (Add Course)
 */
function CoursesPage({ user, setNotification }) {
  const { courses, setCourses, students } = React.useContext(DataContext);
  const isFaculty = user.role === 'faculty';
  const isAdmin = user.role === 'admin';
  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newCourse, setNewCourse] = useState({ 
    id: '', title: '', credits: 4, deptId: mockDepartments[0].id 
  });
  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');

  // Find the logged-in student's record (if role is student) to show home department
  const myStudent = (user.role === 'student' && Array.isArray(students))
    ? students.find(s => String(s.id) === String(user.id) || String(s.student_id) === String(user.id))
    : null;

  const handleDeleteCourse = async (rawId) => {
    const id = Number(rawId);
    if (!Number.isFinite(id)) {
      alert('Invalid course id.');
      return;
    }
    const yes = confirm('Delete this course? This action is permanent.');
    if (!yes) return;
    try {
      let res = await fetch(`${API_URL}/courses/${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (!(res.ok || res.status === 204)) {
        let msg = '';
        try { const j = await res.json(); msg = j.message || ''; } catch (_) {}
        if (res.status === 409 && /related\s+records/i.test(msg)) {
          const doCascade = confirm('This course has related records (scores/attendance/timetable). Delete them as well?');
          if (doCascade) {
            res = await fetch(`${API_URL}/courses/${encodeURIComponent(id)}?cascade=true`, { method: 'DELETE' });
            if (!(res.ok || res.status === 204)) {
              let msg2 = '';
              try { const j2 = await res.json(); msg2 = j2.message || ''; } catch (_) {}
              throw new Error(msg2 || `Failed to delete course (${res.status}).`);
            }
          } else {
            throw new Error(msg || 'Delete cancelled.');
          }
        } else {
          throw new Error(msg || `Failed to delete course (${res.status}).`);
        }
      }
      setCourses(prev => prev.filter(c => Number(c.id) !== id));
      setNotification && setNotification({ type: 'success', message: 'Course deleted.' });
    } catch (error) {
      setNotification && setNotification({ type: 'error', message: error.message });
    }
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCourse),
      });
      const addedCourse = await response.json();
      if (!response.ok) {
        throw new Error(addedCourse.message || 'Failed to add course.');
      }
      // Normalize department id field for UI rendering
      const normalized = {
        ...addedCourse,
        dept_id: addedCourse.dept_id ?? addedCourse.deptId ?? addedCourse.department_id ?? newCourse.deptId,
      };
      setCourses([normalized, ...courses]);
      setIsAddCourseModalOpen(false);
      setNewCourse({ id: '', title: '', credits: 4, deptId: mockDepartments[0].id });
      setNotification({ type: 'success', message: 'Course added successfully!' });

    } catch (error) {
      console.error(error);
      setNotification({ type: 'error', message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCourseFormChange = (e) => {
    const { name, value } = e.target;
    setNewCourse(prev => ({ ...prev, [name]: name === 'credits' || name === 'deptId' ? parseInt(value) : value }));
  };
  
  const getDepartmentName = (deptLike) => {
    if (!deptLike && deptLike !== 0) return 'Unknown';
    // If a string name is provided, return if recognized
    if (typeof deptLike === 'string') {
     const byName = mockDepartments.find(d => d.name === deptLike);
     return byName ? byName.name : deptLike;
    }
    const dept = mockDepartments.find(d => d.id === deptLike);
    return dept ? dept.name : 'Unknown';
  };

  // Helper to extract department id from a course, tolerant to various field names
  const getDeptId = (course) => {
    let id = course.dept_id ?? course.deptId ?? course.department_id;
    if ((id == null || Number.isNaN(id)) && course.department_name) {
      const byName = mockDepartments.find(d => d.name === course.department_name);
      if (byName) id = byName.id;
    }
    return id;
  };

  // Apply search and department filter
  const filteredCourses = React.useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return courses.filter((c) => {
      const deptId = getDeptId(c);
      if (deptFilter !== 'all' && String(deptId) !== String(deptFilter)) return false;
      if (!q) return true;
      const deptName = getDepartmentName(deptId).toLowerCase();
      return (
        String(c.id).toLowerCase().includes(q) ||
        String(c.title || '').toLowerCase().includes(q) ||
        deptName.includes(q)
      );
    });
  }, [courses, deptFilter, searchTerm]);

  // Group by department when viewing all departments
  const groupedCourses = React.useMemo(() => {
    if (deptFilter !== 'all') {
      const deptName = getDepartmentName(Number(deptFilter));
      return [{ deptId: deptFilter, deptName, items: filteredCourses }];
    }
    const map = new Map();
    for (const c of filteredCourses) {
      const dId = getDeptId(c);
      const key = dId ?? 'unknown';
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(c);
    }
    return Array.from(map.entries()).map(([deptId, items]) => ({
      deptId,
      deptName: getDepartmentName(deptId),
      items,
    }));
  }, [filteredCourses, deptFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold dark:text-white">
          {isAdmin ? "Available Courses" : (isFaculty ? "My Sections" : "My Courses")}
        </h1>
        {isAdmin && (
          <Button onClick={() => setIsAddCourseModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Course
          </Button>
        )}
      </div>
      {/* Student home department (show for students) */}
      {myStudent && (
        <div className="mb-2">
          <div className="text-sm text-gray-500 dark:text-gray-400">Department:</div>
          <div className="text-lg font-semibold text-gray-800 dark:text-gray-100">{myStudent.department || myStudent.program || 'Unknown'}</div>
        </div>
      )}

      {/* Filters/Search - Hide for students, show for faculty and admin */}
      {(isAdmin || isFaculty) && (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-full md:w-80">
              <Input
                placeholder="Search by course id, title, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="min-w-[180px]">
              <Select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
                <SelectItem key="all" value="all">All Departments</SelectItem>
                {mockDepartments.map((d) => (
                  <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                ))}
              </Select>
            </div>
          </div>
        </div>
      )}
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course ID</TableHead>
                <TableHead>Title</TableHead>
                {isAdmin && <TableHead>Department</TableHead>}
                {!isAdmin && <TableHead>{isFaculty ? "Students" : "Faculty"}</TableHead>}
                <TableHead>Credits</TableHead>
                {!isFaculty && !isAdmin && <TableHead className="text-right">Grade</TableHead>}
                {isAdmin && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {(() => {
                const columnCount = 2 /* id,title */ + 1 /* credits */ + (isAdmin ? 1 : 0) + (!isAdmin ? 1 : 0) + ((!isFaculty && !isAdmin) ? 1 : 0) + (isAdmin ? 1 : 0);
                if (groupedCourses.length === 0 || groupedCourses.every(g => g.items.length === 0)) {
                  return (
                    <TableRow>
                      <TableCell colSpan={columnCount} className="text-center h-24 text-gray-500 dark:text-gray-400">
                        No courses found.
                      </TableCell>
                    </TableRow>
                  );
                }
                return groupedCourses.map((group) => (
                  <React.Fragment key={String(group.deptId)}>
                    <TableRow>
                      <TableCell colSpan={columnCount} className="bg-gray-50 dark:bg-gray-800/50 font-semibold text-gray-700 dark:text-gray-200">
                        {group.deptName}
                      </TableCell>
                    </TableRow>
                    {group.items.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell className="font-medium">{course.id}</TableCell>
                        <TableCell>{course.title}</TableCell>
                        {isAdmin && (
                          <TableCell>
                            {getDepartmentName(
                              course.dept_id ?? course.deptId ?? course.department_id ?? course.department_name ?? course.department
                            )}
                          </TableCell>
                        )}
                        {!isAdmin && <TableCell>{isFaculty ? "45 / 60" : course.faculty}</TableCell>}
                        <TableCell>{course.credits}</TableCell>
                        {!isFaculty && !isAdmin && <TableCell className="text-right font-bold">{course.grade || 'N/A'}</TableCell>}
                        {isAdmin && 
                  <TableCell className="flex gap-2">
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteCourse(Number(course.id))}>
                               Delete
                             </Button>
                          </TableCell>
                        }
                      </TableRow>
                    ))}
                  </React.Fragment>
                ));
              })()}
              
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Add Course Modal */}
       <Modal 
        isOpen={isAddCourseModalOpen} 
        onClose={() => setIsAddCourseModalOpen(false)} 
        title="Add New Course"
      >
        <form onSubmit={handleAddCourse}>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="courseId">Course ID</Label>
              <Input id="courseId" name="id" value={newCourse.id} onChange={handleCourseFormChange} placeholder="e.g., CS401 (Optional)" />
              <p className="text-xs text-gray-500">Leave blank for auto-increment (if DB is set up for it).</p>
            </div>
             <div className="space-y-1">
              <Label htmlFor="credits">Credits</Label>
              <Input id="credits" name="credits" type="number" value={newCourse.credits} onChange={handleCourseFormChange} required min="1" max="5"/>
            </div>
            <div className="space-y-1 col-span-2">
              <Label htmlFor="title">Course Title</Label>
              <Input id="title" name="title" value={newCourse.title} onChange={handleCourseFormChange} required />
            </div>
            <div className="space-y-1 col-span-2">
              <Label htmlFor="deptId">Department</Label>
              <Select id="deptId" name="deptId" value={newCourse.deptId} onChange={handleCourseFormChange}>
                {mockDepartments.map(dept => (
                  <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                ))}
              </Select>
            </div>
          </CardContent>
          <CardFooter className="justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setIsAddCourseModalOpen(false)} disabled={isLoading}>Cancel</Button>
            <Button type="submit" isLoading={isLoading}>Add Course</Button>
          </CardFooter>
        </form>
      </Modal>
    </div>
  );
}

function ScoresPage({ user }) {
  const isFaculty = user.role === 'faculty';
  const { students, courses, /* optional future: setScores */ } = React.useContext(DataContext);
  const { apiAvailable } = React.useContext(DataContext);

  const [scores, setScores] = useState([]);
  // Inline edit a single score row
  const [rowEditKey, setRowEditKey] = useState(null);
  const [rowEditScore, setRowEditScore] = useState('');
  // Batch grade entry state (faculty)
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || '');
  const [assessment, setAssessment] = useState('Mid-Term');
  const [maxMarks, setMaxMarks] = useState(100);
  const [gradeEntries, setGradeEntries] = useState({}); // { student_id: number }
  const [changedIds, setChangedIds] = useState(new Set());
  const [isLoadingBatch, setIsLoadingBatch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newScore, setNewScore] = useState({
    course_id: courses[0]?.id || '',
    student_id: students[0]?.student_id || students[0]?.id || '',
    assessment: 'Mid-Term',
    max_marks: 100,
    score: 0,
  });

  useEffect(() => {
    // Attempt to fetch scores if endpoint exists; otherwise work locally
    // If the logged-in user is a student, request only that student's scores
    (async () => {
      try {
        const params = new URLSearchParams();
        if (user?.role === 'student' && user?.id) {
          params.append('student_id', String(user.id));
        }
        const url = params.toString() ? `${API_URL}/scores?${params.toString()}` : `${API_URL}/scores`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('no-scores-endpoint');
        const data = await res.json();
        const arr = Array.isArray(data) ? data : (data.value || []);
        setScores(arr);
      } catch (_) {
        // Fallback to empty list if API not available
        setScores([]);
      }
    })();
  }, [user]);

  useEffect(() => {
    // When courses/students change, fill defaults for the form if empty
    setNewScore(prev => ({
      ...prev,
      course_id: prev.course_id || courses[0]?.id || '',
      student_id: prev.student_id || students[0]?.student_id || students[0]?.id || '',
    }));
  }, [courses, students]);

  const handleAddScore = async (e) => {
    e.preventDefault();
    const { course_id, student_id, assessment, max_marks, score } = newScore;
    if (!course_id || !student_id) return;
    if (Number(score) > Number(max_marks)) {
      alert('Score cannot exceed Max Marks');
      return;
    }
    setIsLoading(true);
    try {
      const payload = { course_id, student_id, assessment, max_marks: Number(max_marks), score: Number(score) };
      const res = await fetch(`${API_URL}/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      });
      let created;
      if (res.ok) {
        const raw = await res.json().catch(() => ({}));
        created = raw && raw.value ? raw.value : raw;
      } else {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to add score');
      }
      setScores(prev => [created, ...prev]);
      setIsAddOpen(false);
      setNewScore({ course_id: courses[0]?.id || '', student_id: students[0]?.student_id || students[0]?.id || '', assessment: 'Mid-Term', max_marks: 100, score: 0 });
    } catch (error) {
      // Local fallback when API missing
      if (!apiAvailable || /Failed to fetch|network/i.test(error.message)) {
        const local = { id: `LOCAL-${Date.now()}`, ...newScore, score: Number(newScore.score), max_marks: Number(newScore.max_marks), _local: true };
        setScores(prev => [local, ...prev]);
        setIsAddOpen(false);
        setNewScore({ course_id: courses[0]?.id || '', student_id: students[0]?.student_id || students[0]?.id || '', assessment: 'Mid-Term', max_marks: 100, score: 0 });
      } else {
        alert(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewScore(prev => ({ ...prev, [name]: name === 'max_marks' || name === 'score' ? Number(value) : value }));
  };

  const courseName = (id) => courses.find(c => c.id === id)?.title || id;
  const studentName = (sid) => {
    const s = students.find(st => (st.student_id || st.id) === sid);
    return s ? (s.name || [s.first_name, s.last_name].filter(Boolean).join(' ')) : sid;
  };

  // Prefill batch entries from server for selected course/assessment
  const loadExistingScores = async () => {
    if (!selectedCourseId) return;
    setIsLoadingBatch(true);
    try {
      const params = new URLSearchParams({ course_id: String(selectedCourseId), exam_type: assessment });
      const res = await fetch(`${API_URL}/scores?${params.toString()}`);
      const data = await res.json().catch(() => []);
      const arr = Array.isArray(data) ? data : (data.value || []);
      const map = {};
      for (const r of arr) {
        if (r.student_id != null) map[r.student_id] = Number(r.score);
      }
      setGradeEntries(map);
      // merge into local scores view as well
      setScores(prev => {
        const others = prev.filter(r => !(r.course_id === selectedCourseId && (r.exam_type || 'internal') === (assessment || 'internal')));
        return [...arr, ...others];
      });
    } catch (_) {
      // ignore
    } finally {
      setIsLoadingBatch(false);
    }
  };

  // Compute filtered students for batch entry
  const filteredStudents = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return students;
    return students.filter(s =>
      (s.name || '').toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q) ||
      String(s.student_id || s.id).toLowerCase().includes(q)
    );
  }, [students, searchTerm]);

  // Pagination for batch grade entry (faculty/admin)
  const [gradePage, setGradePage] = useState(1);
  const [gradePageSize, setGradePageSize] = useState(10);
  const totalGradePages = Math.max(1, Math.ceil(filteredStudents.length / gradePageSize));
  const paginatedStudents = useMemo(() => {
    const start = (gradePage - 1) * gradePageSize;
    return filteredStudents.slice(start, start + gradePageSize);
  }, [filteredStudents, gradePage, gradePageSize]);

  useEffect(() => { setGradePage(1); }, [searchTerm, selectedCourseId, assessment]);

  const setEntry = (sid, val) => {
    const num = val === '' ? '' : Number(val);
    setGradeEntries(prev => ({ ...prev, [sid]: num }));
    setChangedIds(prev => new Set(prev).add(sid));
  };

  const saveAllGrades = async () => {
    if (!selectedCourseId) return alert('Select a course');
    setIsLoadingBatch(true);
    try {
      const toSaveIds = Array.from(changedIds);
      for (const sid of toSaveIds) {
        const val = gradeEntries[sid];
        if (val === '' || val == null) continue; // skip empty
        if (Number(val) > Number(maxMarks)) {
          throw new Error(`Score for ${studentName(sid)} exceeds Max Marks`);
        }
        const payload = { student_id: sid, course_id: selectedCourseId, faculty_id: user.id, score: Number(val), exam_type: assessment };
        const res = await fetch(`${API_URL}/scores`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) {
          const msg = await res.json().catch(() => ({}));
          throw new Error(msg.message || `Failed to save score for ${studentName(sid)}`);
        }
      }
      // Update local scores list for table view
      setScores(prev => {
        const others = prev.filter(r => !(r.course_id === selectedCourseId && (r.exam_type || 'internal') === (assessment || 'internal') && changedIds.has(r.student_id)));
        const newOnes = Array.from(changedIds).map(sid => ({ student_id: sid, course_id: selectedCourseId, score: Number(gradeEntries[sid] || 0), exam_type: assessment }));
        return [...newOnes, ...others];
      });
      setChangedIds(new Set());
      alert('Grades saved');
    } catch (e) {
      alert(e.message);
    } finally {
      setIsLoadingBatch(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold dark:text-white">{isFaculty ? 'Grade Entry' : 'Scores'}</h1>
        {isFaculty && (
          <div className="flex items-center gap-2">
            <Button onClick={() => setIsAddOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add Score
            </Button>
          </div>
        )}
      </div>
      {isFaculty && (
        <Card>
          <CardHeader>
            <CardTitle>Batch Grade Entry</CardTitle>
            <CardDescription>Enter scores for each student in a course/assessment.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label>Course</Label>
                <Select value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)}>
                  {courses.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                  ))}
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Assessment</Label>
                <Input value={assessment} onChange={(e) => setAssessment(e.target.value)} placeholder="e.g., Mid-Term" />
              </div>
              <div className="space-y-1">
                <Label>Max Marks</Label>
                <Input type="number" min="1" value={maxMarks} onChange={(e) => setMaxMarks(Number(e.target.value))} />
              </div>
              <div className="flex items-end">
                <Button className="w-full" onClick={loadExistingScores} isLoading={isLoadingBatch}>Load Existing</Button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Input icon={Search} placeholder="Search students..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              <div className="text-sm text-gray-600 dark:text-gray-400">Unsaved: {changedIds.size}</div>
              <div className="flex-1" />
              <Button onClick={saveAllGrades} isLoading={isLoadingBatch}>Save All</Button>
            </div>
            <div className="border rounded-lg overflow-hidden dark:border-gray-800">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedStudents.map(s => (
                    <TableRow key={s.student_id || s.id}>
                      <TableCell>{s.name} <span className="text-xs text-gray-500">({s.student_id || s.id})</span></TableCell>
                      <TableCell>{s.email}</TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          min="0"
                          max={maxMarks}
                          value={(gradeEntries[s.student_id || s.id] ?? '')}
                          onChange={(e) => setEntry(s.student_id || s.id, e.target.value)}
                          className="w-24 ml-auto"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {paginatedStudents.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center h-24 text-gray-500 dark:text-gray-400">No students found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between gap-2 mt-2">
              <div className="text-sm text-gray-600 dark:text-gray-400">Showing {Math.min(paginatedStudents.length, filteredStudents.length)} of {filteredStudents.length}</div>
              <div className="flex items-center gap-2">
                <Label className="mr-2">Rows</Label>
                <Select value={gradePageSize} onChange={(e) => { setGradePageSize(Number(e.target.value)); setGradePage(1); }}>
                  {[5,10,20,50].map(sz => (
                    <SelectItem key={sz} value={sz}>{sz}</SelectItem>
                  ))}
                </Select>
                <Button variant="outline" size="sm" onClick={() => setGradePage(p => Math.max(1, p - 1))} disabled={gradePage <= 1}>Prev</Button>
                <div className="text-sm dark:text-gray-200">Page {gradePage} / {totalGradePages}</div>
                <Button variant="outline" size="sm" onClick={() => setGradePage(p => Math.min(totalGradePages, p + 1))} disabled={gradePage >= totalGradePages}>Next</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Assessment Scores</CardTitle>
          <CardDescription>{isFaculty ? 'Enter grades for your sections.' : 'Your scores for the current term.'}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Assessment</TableHead>
                <TableHead>Max</TableHead>
                <TableHead className="text-right">Score</TableHead>
                {isFaculty && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {scores.map((r) => {
                const key = r.id || `${r.student_id}-${r.course_id}-${r.exam_type || r.assessment || 'internal'}`;
                const editing = rowEditKey === key;
                const examLabel = r.exam_type || r.assessment || 'internal';
                const maxLabel = r.max_marks ?? '';
                return (
                  <TableRow key={key}>
                    <TableCell>{studentName(r.student_id)}</TableCell>
                    <TableCell>{courseName(r.course_id)}</TableCell>
                    <TableCell>{examLabel}</TableCell>
                    <TableCell>{maxLabel}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {editing ? (
                        <Input
                          type="number"
                          value={rowEditScore}
                          onChange={(e) => setRowEditScore(e.target.value)}
                          className="w-24 ml-auto"
                        />
                      ) : (
                        r.score
                      )}
                    </TableCell>
                    {isFaculty && (
                      <TableCell className="text-right">
                        {editing ? (
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="secondary" onClick={() => { setRowEditKey(null); setRowEditScore(''); }}>Cancel</Button>
                            <Button size="sm" onClick={async () => {
                              try {
                                const val = rowEditScore === '' ? '' : Number(rowEditScore);
                                if (val === '') return; // ignore empty
                                const payload = {
                                  student_id: r.student_id,
                                  course_id: r.course_id,
                                  faculty_id: user.id,
                                  score: Number(val),
                                  exam_type: examLabel,
                                };
                                const resp = await fetch(`${API_URL}/scores`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify(payload)
                                });
                                if (!resp.ok) {
                                  const j = await resp.json().catch(() => ({}));
                                  throw new Error(j.message || 'Failed to update score');
                                }
                                setScores(prev => prev.map(x =>
                                  ( (x.student_id === r.student_id) && (x.course_id === r.course_id) && ((x.exam_type || x.assessment || 'internal') === examLabel) )
                                    ? { ...x, score: Number(val), exam_type: examLabel }
                                    : x
                                ));
                                setRowEditKey(null);
                                setRowEditScore('');
                              } catch (e) {
                                alert(e.message);
                              }
                            }}>Save</Button>
                          </div>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => { setRowEditKey(key); setRowEditScore(r.score ?? ''); }}>Edit</Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
              {scores.length === 0 && (
                <TableRow>
                  <TableCell colSpan={isFaculty ? 6 : 5} className="text-center h-24 text-gray-500 dark:text-gray-400">No scores yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Score Modal */}
      {isFaculty && (
        <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Score">
          <form onSubmit={handleAddScore}>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="course_id">Course</Label>
                <Select id="course_id" name="course_id" value={newScore.course_id} onChange={handleChange} required>
                  {courses.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                  ))}
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="student_id">Student</Label>
                <Select id="student_id" name="student_id" value={newScore.student_id} onChange={handleChange} required>
                  {students.map(s => (
                    <SelectItem key={s.student_id || s.id} value={s.student_id || s.id}>{s.name}</SelectItem>
                  ))}
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="assessment">Assessment</Label>
                <Input id="assessment" name="assessment" value={newScore.assessment} onChange={handleChange} placeholder="e.g., Mid-Term" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="max_marks">Max Marks</Label>
                <Input id="max_marks" name="max_marks" type="number" min="1" value={newScore.max_marks} onChange={handleChange} required />
              </div>
              <div className="space-y-1 md:col-span-2">
                <Label htmlFor="score">Score</Label>
                <Input id="score" name="score" type="number" min="0" max={newScore.max_marks} value={newScore.score} onChange={handleChange} required />
              </div>
            </CardContent>
            <CardFooter className="justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} disabled={isLoading}>Cancel</Button>
              <Button type="submit" isLoading={isLoading}>Add Score</Button>
            </CardFooter>
          </form>
        </Modal>
      )}
    </div>
  );
}

function AttendancePage({ user }) {
  const isFaculty = user.role === 'faculty';
  const isStudent = user.role === 'student';
  const { students, courses } = React.useContext(DataContext);
  // Faculty/admin attendance entry state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptName, setSelectedDeptName] = useState('all');
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0,10));
  const [isLoading, setIsLoading] = useState(false);
  const [attendanceMap, setAttendanceMap] = useState({}); // { student_id: 'Present'|'Absent' }
  const [changedIds, setChangedIds] = useState(new Set());
  const [attPage, setAttPage] = useState(1);
  const [attPageSize, setAttPageSize] = useState(10);

  // Student-specific view state
  const [studentAttendanceRows, setStudentAttendanceRows] = useState([]); // raw attendance rows for the student
  const [studentEnrollments, setStudentEnrollments] = useState([]); // enrolled courses for the student
  const [activeTab, setActiveTab] = useState('subject-wise');

  // Common helpers for faculty/admin (kept as before)
  const filteredStudents = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    const byDept = selectedDeptName === 'all' ? students : students.filter(s => s.department === selectedDeptName);
    if (!q) return byDept;
    return byDept.filter(s =>
      (s.name || '').toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q) ||
      String(s.student_id || s.id).toLowerCase().includes(q)
    );
  }, [students, searchTerm, selectedDeptName]);

  const totalAttPages = Math.max(1, Math.ceil(filteredStudents.length / attPageSize));
  const paginatedStudents = useMemo(() => {
    const start = (attPage - 1) * attPageSize;
    return filteredStudents.slice(start, start + attPageSize);
  }, [filteredStudents, attPage, attPageSize]);

  useEffect(() => { setAttPage(1); }, [searchTerm]);
  useEffect(() => { setAttPage(1); }, [selectedCourseId, selectedDate, selectedDeptName]);
  useEffect(() => {
    if (!selectedCourseId && courses[0]?.id) setSelectedCourseId(courses[0].id);
  }, [courses]);

  // Helper to get dept id from name
  const selectedDeptId = useMemo(() => {
    if (selectedDeptName === 'all') return null;
    const d = mockDepartments.find(d => d.name === selectedDeptName);
    return d ? d.id : null;
  }, [selectedDeptName]);

  // When department changes, ensure selected course belongs to that dept; else reset to first
  useEffect(() => {
    if (!selectedDeptId) return; // 'all' - allow any
    const inDept = courses.filter(c => c.dept_id === selectedDeptId);
    if (inDept.length === 0) {
      setSelectedCourseId('');
    } else if (!inDept.some(c => c.id === selectedCourseId)) {
      setSelectedCourseId(inDept[0].id);
    }
  }, [selectedDeptId, courses]);

  // Load attendance for faculty/admin (existing behavior)
  const loadExisting = async () => {
    if (!selectedCourseId || !selectedDate) return;
    setIsLoading(true);
    try {
      // If logged-in user is a student, limit attendance fetch to that student only
      const paramsObj = { course_id: String(selectedCourseId), date: selectedDate };
      if (user?.role === 'student' && user?.id) paramsObj.student_id = String(user.id);
      const params = new URLSearchParams(paramsObj);
      const res = await fetch(`${API_URL}/attendance?${params.toString()}`);
      const data = await res.json().catch(() => []);
      const map = {};
      if (Array.isArray(data)) {
        for (const r of data) {
          if (r.student_id) map[r.student_id] = r.status || 'Absent';
        }
      }
      setAttendanceMap(map);
      setChangedIds(new Set());
    } catch (_) {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  const setStatus = (sid, status) => {
    setAttendanceMap(prev => ({ ...prev, [sid]: status }));
    setChangedIds(prev => new Set(prev).add(sid));
  };

  const saveAll = async () => {
    if (!selectedCourseId || !selectedDate) return alert('Select course and date');
    setIsLoading(true);
    try {
      const toSave = Array.from(changedIds);
      for (const sid of toSave) {
        const status = attendanceMap[sid] || 'Absent';
        const payload = { student_id: sid, course_id: selectedCourseId, date: selectedDate, status };
        const res = await fetch(`${API_URL}/attendance`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.message || `Failed to save attendance for ${sid}`);
        }
      }
      setChangedIds(new Set());
      alert('Attendance saved');
    } catch (e) {
      alert(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Student view: load attendance rows for this student and compute aggregates
  useEffect(() => {
    if (!isStudent) return;
    let mounted = true;
    (async () => {
      try {
        const params = new URLSearchParams({ student_id: String(user.id) });
        const res = await fetch(`${API_URL}/attendance?${params.toString()}`);
        const data = await res.json().catch(() => []);
        let rows = Array.isArray(data) ? data : (data.value || []);

        // If API returned no rows for the student, fall back to bundled mock data so the UI isn't empty
        if ((!rows || rows.length === 0) && Array.isArray(mockAttendance) && mockAttendance.length > 0) {
          // Try to pick mock rows matching the logged-in student by username or id
          const uname = String(user.username || '').toLowerCase();
          const byUser = mockAttendance.filter(m => {
            try {
              return String(m.studentName || '').toLowerCase().includes(uname) || String(m.studentId || '').toLowerCase() === String(user.id).toLowerCase();
            } catch { return false; }
          });
          const source = byUser.length > 0 ? byUser : mockAttendance.slice(0, 8);
          rows = source.map(m => ({
            date: m.date,
            status: m.status,
            course_title: m.course,
            course_id: m.course,
            // keep original student identifiers to help debugging if needed
            _mock_studentId: m.studentId,
            _mock_studentName: m.studentName
          }));
        }

        if (!mounted) return;
        setStudentAttendanceRows(rows);

        // Also fetch enrolled courses so we can show subjects with zero attendance
        try {
          const enrRes = await fetch(`${API_URL}/enrollments?student_id=${encodeURIComponent(String(user.id))}`);
          const enrData = await enrRes.json().catch(() => []);
          const enrolls = Array.isArray(enrData) ? enrData : (enrData.value || []);
          if (mounted) setStudentEnrollments(enrolls || []);
        } catch (e) {
          // ignore enrollment fetch errors silently
          if (mounted) setStudentEnrollments([]);
        }
      } catch (e) {
        console.error('Failed to load student attendance:', e);
        // fallback to a minimal mock set so UI shows something
        const fallback = mockAttendance.slice(0, 6).map(m => ({ date: m.date, status: m.status, course_title: m.course, course_id: m.course }));
        setStudentAttendanceRows(fallback);
        setStudentEnrollments([]);
      }
    })();
    return () => { mounted = false; };
  }, [isStudent, user.id]);

  // Utilities to compute student stats
  const studentSummary = useMemo(() => {
    if (!isStudent) return null;
    const rows = studentAttendanceRows || [];
    const total = rows.length;
    const present = rows.filter(r => /present/i.test(String(r.status || ''))).length;
    const percent = total === 0 ? 0 : Math.round((present / total) * 100);

    // Group by course
    const byCourse = {};
    for (const r of rows) {
      const key = r.course_title || r.course_id || 'Unknown';
      if (!byCourse[key]) byCourse[key] = { course: key, total: 0, present: 0 };
      byCourse[key].total += 1;
      if (/present/i.test(String(r.status || ''))) byCourse[key].present += 1;
    }

    // Ensure enrolled courses appear even if they have zero attendance rows
    try {
      for (const e of (studentEnrollments || [])) {
        const key = e.course_title || e.course_id || e.course || String(e.course || e.course_title || e.course_id || 'Unknown');
        if (!byCourse[key]) {
          byCourse[key] = { course: key, total: 0, present: 0 };
        }
      }
    } catch (e) {
      // ignore
    }

    const subjectWise = Object.values(byCourse).map(c => ({
      course: c.course,
      present: c.present,
      total: c.total,
      percent: c.total === 0 ? 0 : Math.round((c.present / c.total) * 100)
    }));

    const absenceLog = rows.filter(r => !/present/i.test(String(r.status || ''))).sort((a,b) => String(b.date || '').localeCompare(String(a.date || '')));

    return { total, present, percent, subjectWise, absenceLog };
  }, [studentAttendanceRows, studentEnrollments, isStudent]);

  // Render student-focused UI
  if (isStudent) {
    const summary = studentSummary || { total:0, present:0, percent:0, subjectWise:[], absenceLog:[] };
    const pieData = [ { name: 'Present', value: summary.present }, { name: 'Absent', value: Math.max(0, summary.total - summary.present) } ];
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold dark:text-white">Attendance % / {new Date().getFullYear()}-{new Date().getFullYear()+1}</h1>
          <div>
            <Select value="term"> 
              <SelectItem value="term">2025-2026, , ODD UG-II, B.TE...</SelectItem>
            </Select>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-4 border-b border-gray-200 dark:border-gray-700 pb-2">
          <button className={cn('px-3 py-2 font-medium transition-colors', activeTab==='subject-wise' ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200')} onClick={() => setActiveTab('subject-wise')}>SUBJECT-WISE</button>
          <button className={cn('px-3 py-2 font-medium transition-colors', activeTab==='absence-log' ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200')} onClick={() => setActiveTab('absence-log')}>ABSENCE LOG</button>
          <button className={cn('px-3 py-2 font-medium transition-colors', activeTab==='present' ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200')} onClick={() => setActiveTab('present')}>PRESENT</button>
          <button className={cn('px-3 py-2 font-medium transition-colors', activeTab==='overall' ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200')} onClick={() => setActiveTab('overall')}>OVER ALL</button>
        </div>

        {activeTab === 'subject-wise' && (
          <Card>
            <CardContent>
              <div style={{ width: '100%', height: 360 }}>
                <ResponsiveContainer width="100%" height={360}>
                  <BarChart data={summary.subjectWise} margin={{ top: 20, right: 20, left: 20, bottom: 80 }} barSize={60}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-300 dark:stroke-gray-700" strokeOpacity={0.3} />
                    <XAxis 
                      dataKey="course" 
                      tick={{ fontSize: 11, fill: 'currentColor' }} 
                      className="text-gray-700 dark:text-gray-300"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      stroke="currentColor"
                    />
                    <YAxis 
                      domain={[0,100]} 
                      tickFormatter={(v) => `${v}%`}
                      tick={{ fontSize: 12, fill: 'currentColor' }}
                      className="text-gray-700 dark:text-gray-300"
                      stroke="currentColor"
                    />
                    <Tooltip 
                      formatter={(v) => `${v}%`}
                      contentStyle={{
                        backgroundColor: 'var(--tooltip-bg)',
                        border: '1px solid var(--tooltip-border)',
                        borderRadius: '0.5rem',
                        color: 'var(--tooltip-text)'
                      }}
                      labelStyle={{ color: 'inherit', fontWeight: '600' }}
                      wrapperClassName="[--tooltip-bg:white] [--tooltip-border:#e5e7eb] [--tooltip-text:#1f2937] dark:[--tooltip-bg:#1f2937] dark:[--tooltip-border:#374151] dark:[--tooltip-text:#f3f4f6]"
                    />
                    <Bar dataKey="percent" fill="#6366f1" radius={[4,4,0,0]} maxBarSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'absence-log' && (
          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>DATE</TableHead>
                    <TableHead>TYPE</TableHead>
                    <TableHead>COURSE</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summary.absenceLog.map((r, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{String(r.date || r.attendance_date || '-')}</TableCell>
                      <TableCell>{r.status || 'Absent'}</TableCell>
                      <TableCell>{r.course_title || r.course_id || '-'}</TableCell>
                    </TableRow>
                  ))}
                  {summary.absenceLog.length === 0 && (
                    <TableRow><TableCell colSpan={3} className="text-center text-gray-500">No absence records.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {activeTab === 'present' && (
          <Card>
            <CardContent className="flex items-center gap-6">
              <div style={{ width: 150, height: 150 }}>
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" innerRadius={50} outerRadius={70} paddingAngle={4}>
                      <Cell fill="#0ea5e9" />
                      <Cell fill="#f97316" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div>
                <div className="text-4xl font-bold">{summary.percent}%</div>
                <div className="text-sm text-gray-600">Current semester attendance</div>
                <div className="mt-2 text-sm">No. of periods present : {summary.present}/{summary.total}</div>
                <div className="mt-1 text-sm">Current month : {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'overall' && (
          <Card>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">{summary.percent}%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Overall attendance</div>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                  <div className="text-lg text-gray-700 dark:text-gray-300">No. of periods present</div>
                  <div className="text-xl font-semibold text-gray-900 dark:text-white">{summary.present}/{summary.total}</div>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                  <div className="text-lg text-gray-700 dark:text-gray-300">Current month</div>
                  <div className="text-xl font-semibold text-gray-900 dark:text-white">{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Default render (faculty/admin) - unchanged from earlier flow
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold dark:text-white">Attendance</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Attendance Entry</CardTitle>
          <CardDescription>Select a course and date, then mark Present/Absent for each student.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label>Department</Label>
              <Select value={selectedDeptName} onChange={(e) => setSelectedDeptName(e.target.value)}>
                <SelectItem value="all">All Departments</SelectItem>
                {mockDepartments.map(d => (
                  <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
                ))}
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Course</Label>
              <Select value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)}>
                {courses.length === 0 ? (
                  <SelectItem value="">No courses</SelectItem>
                ) : (
                  (selectedDeptId ? courses.filter(c => c.dept_id === selectedDeptId) : courses).map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                  ))
                )}
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Date</Label>
              <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
            </div>
            <div className="space-y-1 md:col-span-2 flex items-end gap-2">
              <Input icon={Search} placeholder="Search students..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              <Button variant="secondary" onClick={loadExisting} isLoading={isLoading}>Load</Button>
              <Button onClick={saveAll} isLoading={isLoading}>Save All</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mark Attendance</CardTitle>
          <CardDescription>All students listed. Use the selector to mark status.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedStudents.map(s => {
                const sid = s.student_id || s.id;
                const val = attendanceMap[sid] || 'Absent';
                return (
                  <TableRow key={sid}>
                    <TableCell>{s.name} <span className="text-xs text-gray-500">({sid})</span></TableCell>
                    <TableCell>{s.email}</TableCell>
                    <TableCell className="text-right">
                      <Select value={val} onChange={(e) => setStatus(sid, e.target.value)} className="w-32 ml-auto">
                        <SelectItem value="Present">Present</SelectItem>
                        <SelectItem value="Absent">Absent</SelectItem>
                      </Select>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredStudents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center h-24 text-gray-500 dark:text-gray-400">No students found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-2">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {paginatedStudents.length} of {filteredStudents.length}
        </div>
        <div className="flex items-center gap-2">
          <Label className="mr-2">Rows</Label>
          <Select value={attPageSize} onChange={(e) => { setAttPageSize(Number(e.target.value)); setAttPage(1); }}>
            {[5,10,20,50].map(sz => (
              <SelectItem key={sz} value={sz}>{sz}</SelectItem>
            ))}
          </Select>
          <Button variant="outline" size="sm" onClick={() => setAttPage(p => Math.max(1, p - 1))} disabled={attPage <= 1}>Prev</Button>
          <div className="text-sm dark:text-gray-200">Page {attPage} / {totalAttPages}</div>
          <Button variant="outline" size="sm" onClick={() => setAttPage(p => Math.min(totalAttPages, p + 1))} disabled={attPage >= totalAttPages}>Next</Button>
        </div>
      </div>
    </div>
  );
}

function StudentManagementPage({ user, setNotification }) {
  const { students, setStudents } = React.useContext(DataContext);
  const { apiAvailable } = React.useContext(DataContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [studentPage, setStudentPage] = useState(1);
  const [studentPageSize, setStudentPageSize] = useState(10);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newStudent, setNewStudent] = useState({
    student_id: '', first_name: '', last_name: '', email: '', department: mockDepartments[0].name, program: mockPrograms[0].name
  });

  const deptCounts = useMemo(() => {
    const counts = { total: students.length };
    mockDepartments.forEach(dept => {
      counts[dept.name] = students.filter(s => s.department === dept.name).length;
    });
    return counts;
  }, [students]);
  
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const nameMatch = (s.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      const emailMatch = (s.email || '').toLowerCase().includes(searchTerm.toLowerCase());
      const idValue = (s.student_id || s.id || '').toString();
      const idMatch = idValue.toLowerCase().includes(searchTerm.toLowerCase());
      const deptMatch = selectedDept === 'all' || s.department === selectedDept;
      return (nameMatch || emailMatch || idMatch) && deptMatch;
    });
  }, [students, searchTerm, selectedDept]);

  const totalStudentPages = Math.max(1, Math.ceil(filteredStudents.length / studentPageSize));
  const paginatedStudents = useMemo(() => {
    const start = (studentPage - 1) * studentPageSize;
    return filteredStudents.slice(start, start + studentPageSize);
  }, [filteredStudents, studentPage, studentPageSize]);

  useEffect(() => {
    setStudentPage(1);
  }, [searchTerm, selectedDept]);

  const handleAddNewStudent = (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Read fields from the form (we render student_id, first_name & last_name inputs)
    const formData = new FormData(e.target);
    const student_id = (formData.get('student_id') || '').toString().trim();
    const first_name = (formData.get('first_name') || '').toString().trim();
    const last_name = (formData.get('last_name') || '').toString().trim();
    const email = (formData.get('email') || '').toString().trim();
    const department = (formData.get('department') || '').toString().trim();

    if (!student_id) {
      setNotification({ type: 'error', message: 'Student ID is required.' });
      setIsLoading(false);
      return;
    }

    if (!first_name || !last_name || !email) {
      setNotification({ type: 'error', message: 'Please provide both first name and last name' });
      setIsLoading(false);
      return;
    }

    (async () => {
      try {
  const payload = { student_id, first_name, last_name, email, department };
        console.log('Making POST request to:', `${API_URL}/students`);
        console.log('Request payload:', JSON.stringify(payload, null, 2));

        const res = await fetch(`${API_URL}/students`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(payload)
        });

        const raw = await res.text();
        let parsed;
        try { parsed = raw ? JSON.parse(raw) : {}; } catch (e) { parsed = {}; }

        if (!res.ok) {
          const msg = parsed?.message || `Server responded with ${res.status}`;
          throw new Error(msg);
        }

        const rawCreated = parsed && parsed.value ? parsed.value : parsed;
        // Normalize shape similar to DataProvider and preserve backend id
        const created = normalizeStudent(rawCreated);
        setStudents(prev => [created, ...prev]);
        setNotification({ type: 'success', message: 'Student added successfully.' });
  setIsAddModalOpen(false);
  setNewStudent({ student_id: '', first_name: '', last_name: '', email: '', department: mockDepartments[0].name, program: mockPrograms[0].name });
      } catch (error) {
        console.error('Add student error:', error);
        const isNetwork = !apiAvailable || /failed to fetch|network/i.test(error.message);
        if (isNetwork) {
          const fallback = {
            id: student_id || `LOCAL-${Date.now()}`,
            student_id: student_id || `LOCAL-${Date.now()}`,
            name: [first_name, last_name].filter(Boolean).join(' ').trim(),
            first_name,
            last_name,
            email,
            department,
            status: 'Active',
            _local: true
          };
          setStudents(prev => [fallback, ...prev]);
          setNotification({ type: 'info', message: 'Student added locally (backend unreachable).' });
          setIsAddModalOpen(false);
          setNewStudent({ student_id: '', first_name: '', last_name: '', email: '', department: mockDepartments[0].name, program: mockPrograms[0].name });
        } else {
          setNotification({ type: 'error', message: `Failed to add student: ${error.message}` });
        }
      } finally {
        setIsLoading(false);
      }
    })();
  };
  
  const handleDeleteStudent = (student) => {
    if (!confirm('Delete this student? This action is permanent.')) return;
    setIsLoading(true);
    (async () => {
      try {
        // Helper to attempt delete, optionally with cascade=true
        const candidatesRaw = [student.backend_id, student._id, student.student_id, student.id]
          .filter(Boolean)
          .map(v => v.toString());
        const candidates = Array.from(new Set([
          ...candidatesRaw,
          ...candidatesRaw.map(v => v.toUpperCase()),
        ]));

        const attemptDelete = async (withCascade = false) => {
          let lastStatus = 0;
          let lastMsg = '';
          for (const cand of candidates) {
            const url = `${API_URL}/students/${encodeURIComponent(cand)}${withCascade ? '?cascade=true' : ''}`;
            const res = await fetch(url, { method: 'DELETE' });
            if (res.ok) return { ok: true, usedId: cand };
            lastStatus = res.status;
            try {
              const err = await res.json();
              lastMsg = err?.message || '';
            } catch (_) {
              lastMsg = await res.text().catch(() => '');
            }
            if (res.status && res.status !== 404) break; // stop early on non-404 error
          }
          return { ok: false, lastStatus, lastMsg };
        };

        // First try a normal delete
        let result = await attemptDelete(false);
        if (!result.ok) {
          const related = /related\s+records|foreign\s+key|constraint/i.test(result.lastMsg || '');
          if (related) {
            const confirmCascade = confirm('This student has related records (scores/enrollments/attendance). Delete them as well?');
            if (confirmCascade) {
              result = await attemptDelete(true);
            }
          }
        }

        if (!result.ok) {
          const attempted = candidates.join(', ');
          const msg = result.lastMsg || `Server responded with ${result.lastStatus || 'unknown status'}`;
          throw new Error(`Delete failed. Tried IDs: [${attempted}]. ${msg}`);
        }

        // Remove from local state using the id that succeeded
        const usedId = result.usedId;
        setStudents(prev => prev.filter(s => {
          const ids = [s.backend_id, s._id, s.student_id, s.id].filter(Boolean).map(v => v.toString());
          return !ids.includes(usedId);
        }));
        setNotification({ type: 'success', message: 'Student deleted.' });
      } catch (error) {
        console.error('Delete student error:', error);
        const isNetwork = !apiAvailable || /failed to fetch|network/i.test(error.message);
        if (isNetwork) {
          // If backend unreachable, remove locally so UI remains consistent and inform user.
          const deleteId = (student.backend_id || student._id || student.student_id || student.id || '').toString();
          setStudents(prev => prev.filter(s => {
            const ids = [s.backend_id, s._id, s.student_id, s.id].filter(Boolean).map(v => v.toString());
            return !ids.includes(deleteId);
          }));
          setNotification({ type: 'info', message: 'Student deleted locally (backend unreachable).'});
        } else {
          setNotification({ type: 'error', message: `Failed to delete student: ${error.message}` });
        }
      } finally {
        setIsLoading(false);
      }
    })();
  };
  
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'department') {
        const newDeptId = mockDepartments.find(d => d.name === value)?.id;
        const relevantPrograms = mockPrograms.filter(p => p.deptId === newDeptId);
        const firstProgramName = relevantPrograms.length > 0 ? relevantPrograms[0].name : '';
        setNewStudent(prev => ({ 
            ...prev, 
            department: value,
            program: firstProgramName
        }));
    } else {
        setNewStudent(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const availablePrograms = useMemo(() => {
      const selectedDeptObj = mockDepartments.find(d => d.name === newStudent.department);
      return selectedDeptObj ? mockPrograms.filter(p => p.deptId === selectedDeptObj.id) : [];
  }, [newStudent.department]);


  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold dark:text-white">Student Management</h1>
          <div className={cn('text-sm px-3 py-1 rounded-full font-medium', apiAvailable ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200' : 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-200') }>
            {apiAvailable ? `API: ${API_URL} (connected)` : `API: ${API_URL} (offline)`}
          </div>
        </div>
        {(user.role === 'admin' || user.role === 'faculty') && (
          <>
            <Button 
              onClick={() => {
                console.log('Add Student button clicked');
                setIsAddModalOpen(true);
                console.log('Setting isAddModalOpen to true');
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Student
            </Button>

            {isAddModalOpen && (
              <Modal
                isOpen={isAddModalOpen}
                onClose={() => {
                  console.log('Closing modal');
                  setIsAddModalOpen(false);
                }}
                title="Add New Student"
              >
                <form onSubmit={handleAddNewStudent} className="space-y-4">
                  <div>
                    <Label htmlFor="student_id">Student ID</Label>
                    <Input
                      id="student_id"
                      name="student_id"
                      placeholder="e.g., CS2025001"
                      required
                      className="mt-1"
                      value={newStudent.student_id}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      name="first_name"
                      value={newStudent.first_name}
                      onChange={handleFormChange}
                      required
                      className="mt-1"
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      name="last_name"
                      value={newStudent.last_name}
                      onChange={handleFormChange}
                      required
                      className="mt-1"
                      placeholder="Enter last name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={newStudent.email}
                      onChange={handleFormChange}
                      required
                      className="mt-1"
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Select
                      id="department"
                      name="department"
                      value={newStudent.department}
                      onChange={handleFormChange}
                      className="mt-1"
                    >
                      {mockDepartments.map(dept => (
                        <SelectItem key={dept.id} value={dept.name}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Add Student</Button>
                  </div>
                </form>
              </Modal>
            )}
          </>
        )}
      </div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { staggerChildren: 0.1 } }}
      >
        <StatCard title="Total Students" value={deptCounts.total} icon={Users} color="indigo" />
        <StatCard title="CSE" value={deptCounts[mockDepartments[0].name]} icon={User} color="emerald" />
        <StatCard title="IT" value={deptCounts[mockDepartments[1].name]} icon={User} color="amber" />
        <StatCard title="AI & DS" value={deptCounts[mockDepartments[2].name]} icon={User} color="rose" />
        <StatCard title="ECE" value={deptCounts[mockDepartments[3].name]} icon={User} color="indigo" />
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4">
          <Input
            icon={Search}
            placeholder="Search students by name, ID, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="md:w-1/2"
          />
          <Select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="md:w-1/2"
          >
            <SelectItem value="all">All Departments</SelectItem>
            {mockDepartments.map(dept => (
              <SelectItem key={dept.id} value={dept.name}>
                {dept.name}
              </SelectItem>
            ))}
          </Select>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Student Records</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Status</TableHead>
                {(user.role === 'admin' || user.role === 'faculty') && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedStudents.map((student) => (
                <TableRow key={student.backend_id || student.student_id || student.id}>
                  <TableCell className="font-medium">{student.student_id || student.id}</TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>{student.department || 'N/A'}</TableCell>
                  <TableCell>{student.program || 'N/A'}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-full text-xs font-medium',
                        (student.status || '').toLowerCase() === 'active'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200'
                      )}
                    >
                      {/active/i.test(student.status || '') ? 'Active' : (student.status || 'Inactive')}
                    </span>
                  </TableCell>
                  {(user.role === 'admin' || user.role === 'faculty') && 
                    <TableCell className="flex gap-2">
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteStudent(student)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  }
                </TableRow>
              ))}
              {filteredStudents.length === 0 && (
                 <TableRow>
                  <TableCell colSpan={(user.role === 'admin' || user.role === 'faculty') ? 7 : 6} className="text-center h-24 text-gray-500 dark:text-gray-400">
                    No records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-2">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {paginatedStudents.length} of {filteredStudents.length}
        </div>
        <div className="flex items-center gap-2">
          <Label className="mr-2">Rows</Label>
          <Select value={studentPageSize} onChange={(e) => { setStudentPageSize(Number(e.target.value)); setStudentPage(1); }}>
            {[5,10,20,50].map(sz => (
              <SelectItem key={sz} value={sz}>{sz}</SelectItem>
            ))}
          </Select>
          <Button variant="outline" size="sm" onClick={() => setStudentPage(p => Math.max(1, p - 1))} disabled={studentPage <= 1}>Prev</Button>
          <div className="text-sm dark:text-gray-200">Page {studentPage} / {totalStudentPages}</div>
          <Button variant="outline" size="sm" onClick={() => setStudentPage(p => Math.min(totalStudentPages, p + 1))} disabled={studentPage >= totalStudentPages}>Next</Button>
        </div>
      </div>
      
      {/* Add Student modal is rendered inline above (to avoid duplicate/old forms). */}
    </div>
  );
}

/**
 * FacultyManagementPage
 * New page for Admins to add faculty
 */
function FacultyManagementPage({ user, setNotification, setPage }) {
  const { faculty, setFaculty, courses, setSelectedFacultyIdForTimetable } = React.useContext(DataContext);
  const [isAddFacultyModalOpen, setIsAddFacultyModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [facPage, setFacPage] = useState(1);
  const [facPageSize, setFacPageSize] = useState(10);
  const [newFaculty, setNewFaculty] = useState({
      id: '', name: '', email: '', department: mockDepartments[0].name, designation: 'Assistant Professor', courses: ''
  });

  const handleAddFaculty = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Prepare data for backend
    const facultyData = {
      ...newFaculty,
      courses: newFaculty.courses.split(',').map(s => s.trim()).filter(Boolean)
    };

    try {
      const response = await fetch(`${API_URL}/faculty`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(facultyData)
      });
      
      const addedFaculty = await response.json();
      if (!response.ok) {
        throw new Error(addedFaculty.message || 'Failed to add faculty.');
      }

      setFaculty([addedFaculty, ...faculty]);
      setIsAddFacultyModalOpen(false);
      setNewFaculty({ id: '', name: '', email: '', department: mockDepartments[0].name, designation: 'Assistant Professor', courses: '' });
      setNotification({ type: 'success', message: 'Faculty added successfully!' });

    } catch (error) {
      console.error(error);
      setNotification({ type: 'error', message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFaculty = async (id) => {
    if (!confirm('Delete this faculty? This action is permanent.')) return;
    setIsLoading(true);
    try {
      let res = await fetch(`${API_URL}/faculty/${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (!(res.ok || res.status === 204)) {
        let msg = '';
        try { const j = await res.json(); msg = j.message || ''; } catch (_) {}
        // If related records block deletion, ask to cascade and retry
        if (res.status === 409 && /related\s+records/i.test(msg)) {
          const doCascade = confirm('This faculty has related records (scores/sections). Delete them as well?');
          if (doCascade) {
            res = await fetch(`${API_URL}/faculty/${encodeURIComponent(id)}?cascade=true`, { method: 'DELETE' });
            if (!(res.ok || res.status === 204)) {
              let msg2 = '';
              try { const j2 = await res.json(); msg2 = j2.message || ''; } catch (_) {}
              throw new Error(msg2 || `Failed to delete faculty (${res.status}).`);
            }
          } else {
            throw new Error(msg || 'Delete cancelled.');
          }
        } else {
          throw new Error(msg || `Failed to delete faculty (${res.status}).`);
        }
      }
      setFaculty(prev => prev.filter(f => f.id !== id));
      setNotification({ type: 'success', message: 'Faculty deleted.' });
    } catch (error) {
      setNotification({ type: 'error', message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacultyFormChange = (e) => {
    const { name, value } = e.target;
    setNewFaculty(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold dark:text-white">Faculty Management</h1>
        <Button onClick={() => setIsAddFacultyModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Faculty
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Faculty Records</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Faculty ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Courses</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {faculty.slice((facPage-1)*facPageSize, (facPage-1)*facPageSize + facPageSize).map((faculty) => (
                <TableRow key={faculty.id}>
                  <TableCell className="font-medium">{faculty.id}</TableCell>
                  <TableCell>{faculty.name}</TableCell>
                  <TableCell>{faculty.email}</TableCell>
                  <TableCell>{faculty.department}</TableCell>
                  <TableCell>{faculty.designation}</TableCell>
                  <TableCell>{faculty.courses.join(', ')}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedFacultyIdForTimetable(faculty.id);
                        setPage && setPage('timetable');
                      }}
                    >
                      View Timetable
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteFaculty(faculty.id)}
                      disabled={isLoading}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
               {faculty.length === 0 && (
                 <TableRow>
                  <TableCell colSpan="7" className="text-center h-24 text-gray-500 dark:text-gray-400">
                    No faculty records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-2">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {Math.min(faculty.length - (facPage-1)*facPageSize, facPageSize)} of {faculty.length}
        </div>
        <div className="flex items-center gap-2">
          <Label className="mr-2">Rows</Label>
          <Select value={facPageSize} onChange={(e) => { setFacPageSize(Number(e.target.value)); setFacPage(1); }}>
            {[5,10,20,50].map(sz => (
              <SelectItem key={sz} value={sz}>{sz}</SelectItem>
            ))}
          </Select>
          <Button variant="outline" size="sm" onClick={() => setFacPage(p => Math.max(1, p - 1))} disabled={facPage <= 1}>Prev</Button>
          <div className="text-sm dark:text-gray-200">Page {facPage} / {Math.max(1, Math.ceil(faculty.length / facPageSize))}</div>
          <Button variant="outline" size="sm" onClick={() => setFacPage(p => Math.min(Math.max(1, Math.ceil(faculty.length / facPageSize)), p + 1))} disabled={facPage >= Math.max(1, Math.ceil(faculty.length / facPageSize))}>Next</Button>
        </div>
      </div>

      {/* Add Faculty Modal */}
       <Modal 
        isOpen={isAddFacultyModalOpen} 
        onClose={() => setIsAddFacultyModalOpen(false)} 
        title="Add New Faculty"
      >
        <form onSubmit={handleAddFaculty}>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="facultyId">Faculty ID</Label>
              <Input id="facultyId" name="id" value={newFaculty.id} onChange={handleFacultyFormChange} placeholder="e.g., F101 (Optional)" />
               <p className="text-xs text-gray-500">Leave blank for auto-increment.</p>
            </div>
            <div className="space-y-1">
              <Label htmlFor="facultyName">Full Name</Label>
              <Input id="facultyName" name="name" value={newFaculty.name} onChange={handleFacultyFormChange} required />
            </div>
            <div className="space-y-1 col-span-2">
              <Label htmlFor="facultyEmail">Email</Label>
              <Input id="facultyEmail" name="email" type="email" value={newFaculty.email} onChange={handleFacultyFormChange} required />
            </div>
             <div className="space-y-1">
              <Label htmlFor="facultyDepartment">Department</Label>
              <Select id="facultyDepartment" name="department" value={newFaculty.department} onChange={handleFacultyFormChange}>
                {mockDepartments.map(dept => (
                  <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                ))}
              </Select>
            </div>
             <div className="space-y-1">
              <Label htmlFor="designation">Designation</Label>
              <Select id="designation" name="designation" value={newFaculty.designation} onChange={handleFacultyFormChange}>
                <SelectItem value="Assistant Professor">Assistant Professor</SelectItem>
                <SelectItem value="Associate Professor">Associate Professor</SelectItem>
                <SelectItem value="Professor">Professor</SelectItem>
              </Select>
            </div>
            <div className="space-y-1 col-span-2">
              <Label htmlFor="facultyCourses">Courses (Comma-separated IDs)</Label>
              <Input 
                id="facultyCourses" 
                name="courses" 
                value={newFaculty.courses} 
                onChange={handleFacultyFormChange} 
                placeholder="e.g., CS101, IT202" 
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Available: {courses.map(c => c.id).join(', ')}
              </p>
            </div>
          </CardContent>
          <CardFooter className="justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setIsAddFacultyModalOpen(false)} disabled={isLoading}>Cancel</Button>
            <Button type="submit" isLoading={isLoading}>Add Faculty</Button>
          </CardFooter>
        </form>
      </Modal>
    </div>
  );
}

function AdminPage({ title }) {
  // This is now just a placeholder
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold dark:text-white">{title}</h1>
      <Card>
        <CardHeader>
          <CardTitle>Admin Panel</CardTitle>
          <CardDescription>This area is under construction.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="dark:text-gray-300">Future admin components will go here.</p>
        </CardContent>
      </Card>
    </div>
  );
}

function Notification({ notification, onDismiss }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        handleDismiss();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300);
  };

  const colors = {
    success: 'bg-emerald-500 border-emerald-600',
    error: 'bg-rose-500 border-rose-600',
    info: 'bg-blue-500 border-blue-600',
  };
  
  const Icon = notification?.type === 'success' ? Check : notification?.type === 'error' ? X : Bell;

  return (
    <AnimatePresence>
      {isVisible && notification && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={cn(
            'fixed bottom-5 right-5 z-50 w-full max-w-sm rounded-lg shadow-2xl text-white p-4 border-l-4',
            colors[notification.type] || colors.info
          )}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Icon className="h-6 w-6" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
            <button
              onClick={handleDismiss}
              className="ml-4 flex-shrink-0 rounded-full p-1 text-white/70 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// NotificationPanel: dropdown panel that opens when clicking the bell icon
function NotificationPanel({ isOpen, onClose, notifications = [], onMarkAllRead, onClear, onToggleRead }) {
  if (!isOpen) return null;
  return (
    <div className="fixed top-16 right-4 z-[10000] w-80 max-h-[70vh] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-950">
      <div className="flex items-center justify-between px-4 py-3 border-b dark:border-gray-800">
        <div className="font-semibold dark:text-white">Notifications</div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onMarkAllRead}>Mark all read</Button>
          <Button variant="ghost" size="sm" onClick={onClear}>Clear</Button>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
        </div>
      </div>
      <div className="max-h-[60vh] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-4 text-sm text-gray-500 dark:text-gray-400">No notifications</div>
        ) : (
          notifications.map(n => (
            <div key={n.id} className={cn("px-4 py-3 border-b last:border-b-0 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900", !n.read && "bg-indigo-50/60 dark:bg-indigo-900/20")}
                 onClick={() => onToggleRead && onToggleRead(n.id)}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className={cn("text-sm font-medium", n.read ? "text-gray-700 dark:text-gray-300" : "text-indigo-700 dark:text-indigo-300")}>{n.title}</div>
                  {n.message && <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{n.message}</div>}
                </div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400 whitespace-nowrap">{n.time || ''}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


// --- MAIN APP COMPONENT ---

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [notification, setNotification] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage or system preference
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      return JSON.parse(saved);
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Apply dark mode class to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const handleLogin = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const clearNotification = () => {
    setNotification(null);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <Fragment>
      <AnimatePresence mode="wait">
        {currentUser ? (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <DataProvider setNotification={setNotification} user={currentUser}>
              <MainDashboard 
                user={currentUser} 
                onLogout={handleLogout} 
                setNotification={setNotification} 
              />
            </DataProvider>
          </motion.div>
        ) : (
          <motion.div
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <LoginPage 
              onLogin={handleLogin} 
              setNotification={setNotification}
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <Notification 
        notification={notification} 
        onDismiss={clearNotification} 
      />
    </Fragment>
  );
}

