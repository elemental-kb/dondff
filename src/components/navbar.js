import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase-config';

function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (current) => {
      setUser(current);
    });
    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <nav className="flex justify-between items-center bg-gray-800 p-4">
      <div className="flex space-x-4">
        <Link to="/" className="font-bold hover:text-dond-green">
          Home
        </Link>
        {user && (
          <Link to="/dashboard" className="font-bold hover:text-dond-green">
            Dashboard
          </Link>
        )}
      </div>
      <div className="flex items-center space-x-4">
        {!user ? (
          <>
            <Link
              to="/login"
              className="px-4 py-2 btn rounded"
            >
              Sign In
            </Link>
            <Link
              to="/login"
              className={
                "px-4 py-2 btn rounded"
              }
            >
              Create Account
            </Link>
          </>
        ) : (
          <>
            <span className="font-semibold">{user.email || user.displayName}</span>
            <button
              onClick={logout}
              className="px-4 py-2 font-bold btn rounded"
            >
              Sign Out
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
