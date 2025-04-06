# 📚 Smart Course Recommendation System

An intelligent, full-stack academic course recommendation platform powered by LLMs. Built with a **Node.js + Express** backend and a **React** frontend, the system generates tailored course suggestions based on user preferences, academic history, and career goals.

---
## 🧱 Tech Stack

**Frontend:**  
- React  
- Axios 

**Backend:**  
- Node.js  
- Express.js  
- REST API architecture

**Database:**  
- MongoDB  
- Mongoose (for schema-based modeling)

**AI Integration:**  
- Ollama Runtime (local LLM engine)  
- Gemma:2B LLM for generating course recommendations and chat responses

**Development & Hosting:**  
- Vite (for local frontend development)  
- Ollama server running locally for LLM inference
---

## 💬 Chatbot Integration

Students can interact with an AI-powered chatbot to get deeper insights into their recommendations.  
Example queries:
- _"Why was Machine Learning recommended for me?"_
- _"How does this course fit into my long-term career plan?"_

The chatbot responds **contextually**, leveraging:
- Previously recommended courses  
- Student profile data (skills, goals, preferences)  
- Live course database (MongoDB)  
- Real-time LLM inference via **Gemma:2B** using **Ollama**

Supports both **instant** and **streamed** responses for a natural conversational flow.

---

## 🛠️ Setup Instructions

> ⚠️ `node_modules/` and `.env` files are excluded from version control.

## 🌐 Running the Project Locally

Follow these steps to run both the **frontend** and **backend** along with the **Ollama LLM server** for local development:

---

### ✅ Prerequisites

Make sure the following are installed and running on your system:

- [Node.js](https://nodejs.org/) (v16+ recommended)
- [MongoDB](https://www.mongodb.com/) (local or remote instance)
- [Ollama](https://ollama.com/) (used to run the `gemma:2b` LLM model)

---

### 🧩 Step-by-Step Guide

#### 🌀 Clone the Repository

```bash
git clone https://github.com/YashaswiniSampath/CoursRecommendationSystem.git
cd smart-course-advisor

cd server
npm install
npm start

cd ../client
npm install
npm run dev

#Run Ollama with Gemma:2B Model
#Ensure Ollama is installed and running, then run:

ollama run gemma:2b
```

---

## 🌟 Support

If you found this project helpful, please consider leaving a ⭐️ on GitHub — it really helps us grow!

[![Star on GitHub](https://img.shields.io/github/stars/YashaswiniSampath/CoursRecommendationSystem?style=social)](https://github.com/YashaswiniSampath/CoursRecommendationSystem)

---

## 🎥 Demo Video

Check out the full walkthrough of the project on YouTube:  
[📺 Watch Now](https://www.youtube.com/watch?v=rUpop8_ctis)

---

## 🔗 Repository

GitHub Source Code:  
[🔗 https://github.com/YashaswiniSampath/CoursRecommendationSystem](https://github.com/YashaswiniSampath/CoursRecommendationSystem)

## 👥 Contributors

- [Yashaswini Sampath](https://github.com/YashaswiniSampath) – Backend Developer, Chatbot Integration, Full-Stack Developer  
- [Inchara Srinivas](https://github.com/IncharaS) – Frontend Development, AI Integration, Full-Stack Developer

