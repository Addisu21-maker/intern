import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Help from './pages/Help';
import Header from './components/Header';
import Login from './pages/login';
import ExamPage from './pages/ExamPage.jsx';
import Result from './pages/resultPage.jsx';
import FooterPage from './components/Footer.jsx';
import ExamList from './components/ExamList.jsx';
import ExamCard from './components/ExamCard.jsx';
import ResultCard from './components/resultCard.jsx';
import UserMessages from './pages/UserMessages';
import Signup from './pages/Signup';
import Profile from './pages/Profile';

const App = () => {
  return (
    <div>
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/help" element={<Help />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/messages" element={<UserMessages />} />
        <Route path="/exams" element={<ExamPage />} />
        <Route path="/resultPage" element={<Result />} />
        <Route path="/exam-list" element={<ExamList />} />
        <Route path="/exam/:id" element={<ExamCard />} />
        <Route path="/exam/result/:score" element={<ResultCard />} />
      </Routes>

      <FooterPage />
    </div>
  );
};

export default App;
