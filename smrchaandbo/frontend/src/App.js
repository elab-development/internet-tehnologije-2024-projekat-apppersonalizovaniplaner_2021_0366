import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import Account from './pages/Account.jsx';
import CreatePlanner from './pages/CreatePlanner.jsx';
import PlaceOrder from './pages/PlaceOrder.jsx';
import RedirectAuth from './routes/RedirectAuth.jsx';
import AdminRoute from './routes/AdminRoute.jsx';
import PrivateRoute from './routes/PrivateRoute.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path='/' element={<Home />} />
        <Route
          path='/login'
          element={
            <RedirectAuth>
              <Login />
            </RedirectAuth>
          }
        />
        <Route
          path='/register'
          element={
            <RedirectAuth>
              <Register />
            </RedirectAuth>
          }
        />

        <Route
          path='/account'
          element={
            <PrivateRoute>
              <Account />
            </PrivateRoute>
          }
        />
        <Route
          path='/planners/new'
          element={
            <PrivateRoute>
              <CreatePlanner />
            </PrivateRoute>
          }
        />
<Route
          path='/orders/new'
          element={
            <PrivateRoute>
              <PlaceOrder />
            </PrivateRoute>
          }
        />
        <Route
          path='/admin'
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />  
      </Route>
    </Routes>
  );
}