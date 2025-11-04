import React, { useState } from "react";
import FeedbackModal from "./FeedbackModal";
import Profile from "./Profile";
import { FaUserCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // PCOS Knowledge Hub Links (Updated with more trusted blogs)
  const blogLinks = [
    {
      title: "PCOS FAQs – ACOG",
      link: "https://www.acog.org/womens-health/faqs/polycystic-ovary-syndrome-pcos",
      desc: "Clear, expert-reviewed FAQs on causes, symptoms, and treatments.",
    },
    {
      title: "Myth-busters – Cedars-Sinai",
      link: "https://www.cedars-sinai.org/blog/confused-about-pcos-weve-got-the-facts.html",
      desc: "PCOS is a common but misunderstood hormonal disorder with a wide range of symptoms and treatment options, affecting more than just fertility.",
    },
    {
      title: "PCOS Myths Debunked – Endocrine Society",
      link: "https://www.endocrine.org/patient-engagement/endocrine-library/pdf-library/fact-or-fiction-pcos-myths-debunked",
      desc: "Fact vs fiction - Debunking common myths about PCOS and raising awareness.",
    },
    {
      title: "PCOS Facts – WHO",
      link: "https://www.who.int/news-room/fact-sheets/detail/polycystic-ovary-syndrome",
      desc: "Global overview: prevalence, causes, and long-term risks.",
    },
    {
      title: "PCOS Myths & Facts – Inspira Health",
      link: "https://www.inspirahealthnetwork.org/news/healthy-living/pcos-myths-and-facts-debunking-common-misconceptions?utm_source=chatgpt.com",
      desc: "Debunks myths like “PCOS always causes cysts” ,“only affects fertility” and more.",
    },
    {
      title: "PCOS & Menopause – Healthline (Medically Reviewed)",
      link: "https://www.healthline.com/health/menopause/pcos-and-menopause",
      desc: "PCOS doesn't end with menopause — symptoms and health risks can persist.",
    },
    {
      title: "PCOS Myths vs. Facts – Aspire HFI",
      link: "https://www.aspirehfi.com/blog/debunking-common-myths-about-pcos-separating-fact-from-fiction",
      desc: "The blog debunks common PCOS myths, stressing it's manageable and not just about fertility or lifestyle.",
    },
  ];

  return (
    <div className="home-container">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <FaUserCircle
            className="profile-icon"
            onClick={() => setShowProfile(true)}
          />
        </div>
        <div className="header-center">
          <img src="/images/App_logo.jpg" alt="logo" className="home-logo" />
        </div>
        <div className="header-right">
          <p className="slogan">You speak, we heal!</p>
          <img
            src="/images/Feedback.png"
            alt="Feedback"
            className="feedback-icon"
            onClick={() => setShowFeedback(true)}
          />
        </div>
      </header>

      {/* Intro */}
      <p className="intro">
        Swastha is a supportive AI-powered wellness app designed to help women
        manage PCOS with confidence. From early risk detection and personalized
        lifestyle tips to daily mood journaling and mental health support.
        Swastha empowers users to take charge of their hormonal and emotional
        well-being—every step of the way.
      </p>

      {/* Features */}
      <div className="features">
        <div className="feature-card">
          <Link to="/PcosRisk">
            <img src="/images/Detection_logo.jpg" alt="PCOS Risk" />
          </Link>
        </div>
        <div className="feature-card">
          <Link to="/PcosBot">
            <img src="/images/Bot_logo.jpg" alt="Chatbot" />
          </Link>
        </div>
        <div className="feature-card">
          <Link to="/PcosJournal">
            <img src="/images/Journal_logo.jpg" alt="Journal" />
          </Link>
        </div>
        <div className="feature-card">
          <Link to="/PcosCycleTracker">
            <img src="/images/Track-Cycle_logo.jpg" alt="Track Cycle" />
          </Link>
        </div>
        <div className="feature-card">
          <Link to="/PcosRecomendations">
            <img src="/images/Recomendation_logo.jpg" alt="Recomendation" />
          </Link>
        </div>
      </div>

      {/* Knowledge Hub Section */}
      <section className="knowledge-hub">
        <h2 className="hub-title">PCOS Knowledge Hub</h2>
        <p className="hub-subtitle">
          Articles, FAQs, myth-busters, medically reviewed blogs, and expert resources.
        </p>
        <div className="hub-cards">
          {blogLinks.map((item, index) => (
            <a
              key={index}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="hub-card"
            >
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </a>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="footer-left">
          <p>Contact: swasthayourpeeceesakhi@gmail.com</p>
        </div>
        <div className="footer-right">
          <a href="/Privacy">Privacy Policy</a>
          <span>© All Rights Reserved</span>
        </div>
      </footer>

      {/* Modals */}
      {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}
      {showProfile && <Profile onClose={() => setShowProfile(false)} />}
    </div>
  );
};

export default Home;
