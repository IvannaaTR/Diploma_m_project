import './App.css'
import {Route, Routes} from "react-router-dom";
import MainInitiativesPage from './pages/MainInitiativesPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import Layout from './Layout.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import LoginConfirmationPage from  './pages/LoginConfirmationPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import ForgotPassPage from './pages/ForgotPassPage.jsx';
import ResetPassPage from './pages/ResetPassPage.jsx';

import axios from "axios";
import {UserContextProvider} from "./UserContext";
import InitiantivesPage from "./pages/InitiantivesPage.jsx";
import InitiantivesCreationPage from "./pages/InitiantivesCreationPage.jsx";
import InitiantivePage from "./pages/InitiantivePage.jsx";


import RecommendationsPage from "./pages/RecommendationsPage.jsx";
import RecommendationCreationPage from "./pages/RecommendationCreationPage.jsx";
import RecommendationPage from "./pages/RecommendationPage";

import ObservationsPage from "./pages/ObservationsPage.jsx";
import ObservationCreationPage from "./pages/ObservationCreationPage.jsx";
import MainRecommendationsPage from './pages/MainRecommendationsPage.jsx';

import MapsPage from './pages/MapsPage.jsx';
axios.defaults.baseURL = 'http://localhost:4000/'
axios.defaults.withCredentials = true;
function App() {
  return (
    <UserContextProvider>
        <Routes>
          <Route path="/" element={<Layout/>}>
            <Route index element={<MainInitiativesPage/>} />
            <Route index path="/initiatives" element={<MainInitiativesPage/>} />
            <Route path="/recommendations" element={<MainRecommendationsPage/>} />
            <Route path="/maps" element={<MapsPage/>} />
            <Route path="/login" element={<LoginPage/>} />
            <Route path="/register" element={<RegisterPage/>} />
            <Route path="/verify/:token" element={<LoginConfirmationPage/>} />
            <Route path="/forgotpass" element={<ForgotPassPage/>} />
            <Route path="/reset/:token" element={<ResetPassPage/>} />
            <Route path="/account" element={<ProfilePage />} />
            <Route path="/account/initiantives" element={<InitiantivesPage />} />
            <Route path="/account/initiantives/new" element={<InitiantivesCreationPage />} />
            <Route path="/account/initiantives/:id" element={<InitiantivesCreationPage />} />
            <Route path="/initiatives/initiative/:id" element={<InitiantivePage />} />
            <Route path="/initiative/:id" element={<InitiantivePage />} />
            <Route path="/account/recommendations" element={<RecommendationsPage />} />
            <Route path="/account/recommendations/new" element={<RecommendationCreationPage />} />
            <Route path="/account/recommendations/:id" element={<RecommendationCreationPage />} />
            <Route path="/recommendation/:id" element={<RecommendationPage />} />  
            <Route path="/account/observations" element={<ObservationsPage />} />
            <Route path="/account/observations/new" element={<ObservationCreationPage />} />
            <Route path="/account/observations/:id" element={<ObservationCreationPage />} />
          </Route>
        </Routes>
      </UserContextProvider>
    
      
  )
}
export default App
