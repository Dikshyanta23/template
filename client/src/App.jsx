// client/src/App.jsx
import { Routes, Route } from 'react-router-dom';
import { createContext, useMemo, useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import TutorRegister from './pages/TutorRegister';
import Dashboard from './pages/Dashboard';
import AdminLayout from './pages/admin/AdminLayout';
import UserManagement from './pages/admin/UserManagement';
import Courses from './pages/Courses';
import QuestionManagement from './pages/admin/QuestionManagement';
import EnquiryManagement from './pages/admin/Enquiries';
import SessionManagement from './pages/admin/Sessions';
import PaymentManagement from './pages/admin/Payments';
import CollectionManagement from './pages/admin/CollectionManagement';
import CourseManagement from './pages/admin/AdminCourses';
import CourseDetail from './pages/CourseDetail';
import CourseTest from './pages/CourseTest';
import NotFound from './pages/NotFound';
import TutorDashboard from './pages/tutor/TutorDashboard';
import AttendanceManagement from './pages/tutor/AttendanceManagement';
import SessionOverview from './pages/tutor/SessionOverview';
import StudentProgress from './pages/tutor/StudentProgress';
import UserDetails from './pages/admin/UserDetails';
import CreateCourse from './pages/admin/CreateCourse';

export const ColorModeContext = createContext({ toggleColorMode: () => {} });

function App() {
  const [mode, setMode] = useState('light');
  
  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    [],
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: mode === 'light' ? '#1976d2' : '#90caf9',
          },
          secondary: {
            main: mode === 'light' ? '#f50057' : '#f48fb1',
          },
        },
      }),
    [mode],
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/tutor-application" element={<TutorRegister />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/:id" element={<CourseDetail />} />
              <Route path="/courses/:id/test" element={<CourseTest />} />
              
              {/* Student Dashboard */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Tutor Dashboard */}
              <Route 
                path="/tutor" 
                element={
                  <ProtectedRoute tutorOnly>
                    <TutorDashboard />
                  </ProtectedRoute>
                }
              >
                <Route path="sessions" element={<SessionOverview />} />
                <Route path="attendance" element={<AttendanceManagement />} />
                <Route path="students" element={<StudentProgress />} />
                <Route index element={<SessionOverview />} />
              </Route>
              
              {/* Admin Dashboard */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute adminOnly>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="users" element={<UserManagement />} />
                <Route path="users/:userId" element={<UserDetails />} /> 
                <Route path="courses" element={<CourseManagement />} />
                <Route path="courses/create" element={<CreateCourse />} />
                <Route path="collections" element={<CollectionManagement />} />
                <Route path="courses/:courseId/questions" element={<QuestionManagement />} />
                <Route path="sessions" element={<SessionManagement />} />
                <Route path="payments" element={<PaymentManagement />} />
                <Route path="enquiries" element={<EnquiryManagement />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </AuthProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;