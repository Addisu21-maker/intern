import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Help from './pages/Help';
import Header from './components/Header';
import Login from './pages/login';
import QuizPage from './pages/quizPage.jsx';
import Result from './pages/resultPage.jsx';
import FooterPage from './components/Footer.jsx';
import QuizList from './components/quizList.jsx';
import QuizCard from './components/quizCard.jsx';
import ResultCard from './components/resultCard.jsx';
import UserMessages from './pages/UserMessages';

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
        <Route path="/messages" element={<UserMessages />} />
        <Route path="/quizPage" element={<QuizPage />} />
        <Route path="/resultPage" element={<Result />} />
        <Route path="/quizzes" element={<QuizList />} />
        <Route path="/quiz/:id" element={<QuizCard />} />
        <Route path="/quiz/result/:score" element={<ResultCard />} />
      </Routes>

      <FooterPage />
    </div>
  );
};

export default App;
