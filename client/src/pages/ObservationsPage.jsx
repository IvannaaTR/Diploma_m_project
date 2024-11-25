import React, { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AccountNav from "../AccountNav";
import UserAccountNav from "../UserAccountNav";
import axios from "axios";
import PhotoImg from "../PhotoImg";
import {UserContext} from "../UserContext.jsx";

export default function ObservationsPage() {
  const [sortOption, setSortOption] = useState('date_desc'); 
  const [filterCategory, setFilterCategory] = useState('');
  const [filterMyObservations, setFilterMyObservations] = useState(false);
  const [observations, setObservations] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedObservation, setSelectedObservation] = useState(null);
  const {user} = useContext(UserContext);

  useEffect(() => {
    const params = { sort: sortOption };
    if (filterCategory) {
      params.category = filterCategory; 
    }
    if (filterMyObservations) {
      params.ownerId = user._id; 
    }
  
    axios.get('/user-observations', { params })
      .then(({ data }) => {
        setObservations(data);
      })
      .catch(error => {
        alert(`Увага! ${error.response?.data?.error || 'Не вдалося отримати дані'}`);
      });
  }, [sortOption, filterCategory, filterMyObservations]);

  const handleSortChange = (event) => {
    setSortOption(event.target.value); 
  };
  const handleFilterChange = (event) => {
    setFilterCategory(event.target.value);
  };
  async function handleDeleteObservation(observationId) {
    try {
      await axios.delete('/observations/' + observationId);
      axios.get('/user-observations').then(({ data }) => {
        setObservations(data); 
      });
      setSelectedObservation(null);
      setShowDeleteModal(false);
    } catch (error) {
      alert(`Увага! ${error.response.data.error}`);
    }
  }
  const handleDeleteCancel = () => {
    setShowDeleteModal(false); 
    setSelectedObservation(null);
  };


  const handleShowModal = (type, observation) => {
    setModalType(type);
    setSelectedObservation(observation);
    setShowModal(true);
  };
  const handleAction = () => {
    if (modalType === "verify") {
      handleVerificationObservation(selectedObservation);
    } else if (modalType === "actualize") {
      handleActualizationObservation(selectedObservation);
    }
    setShowModal(false);
    setSelectedObservation(null);
  };

  const handleCancel = () => {
    setShowModal(false);
    setSelectedObservation(null);
  };
  async function handleVerificationObservation(observationId) {
    try {
      await axios.put('observations/verification/' + observationId);
      axios.get('/user-observations').then(({ data }) => {
        setObservations(data); 
      });
      setSelectedObservation(null);
      setShowVerificationModal(false);
    } catch (error) {
      alert(`Увага! ${error.response.data.error}`);
    }
  }
  async function handleActualizationObservation(observationId) {
    try {
      await axios.put('observations/actualization/' + observationId);
      axios.get('/user-observations').then(({ data }) => {
        setObservations(data); 
      });
      setSelectedObservation(null);
      setShowVerificationModal(false);
    } catch (error) {
      alert(`Увага! ${error.response.data.error}`);
    }
  }
  return (
    <div>
      {user.isAdmin === true ? (
        <AccountNav />
      ) : (
        <UserAccountNav />
      )}
      <div className="text-center mb-4">
        <Link className="inline-flex gap-1 bg-primary text-white py-2 px-6 rounded-full" to={'/account/observations/new'}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
          </svg>
          Додати
        </Link>
      </div>
      <div style={{ border: '2px solid rgb(7, 122, 41)', padding: '8px', borderRadius: '1rem', marginBottom: '10px', backgroundColor: '#E5E7EB',   }}>
          <div className="flex flex-wrap justify-between gap-2">
            <select 
              value={sortOption} 
              onChange={handleSortChange} 
              className="bg-gray-200 rounded-2xl border border-1 border-primary w-full sm:w-1/2"
            >
              <option value="date_desc">Сортувати за датою (найновіші спершу)</option>
              <option value="date_asc">Сортувати за датою (старіші спершу)</option>
              <option value="verified">Сортувати за верифікацією (верифіковані спершу)</option>
              <option value="unverified">Сортувати за верифікацією (неверифіковані спершу)</option>
            </select>
            <select 
              value={filterCategory} 
              onChange={handleFilterChange} 
              className="bg-gray-200 rounded-2xl border border-1 border-primary w-full sm:w-1/2"
            >
              <option value="">Фільтрувати за категоріями</option>
              <option value="Вода">Забруднення водойм</option>
              <option value="Відходи">Забруднення побутовими відходами</option>
              <option value="Грунт">Забруднення грунту</option>
            </select>
            {user.isAdmin && (
            <label className="flex items-center mt-2">
              <input
                type="checkbox"
                checked={filterMyObservations}
                onChange={(e) => setFilterMyObservations(e.target.checked)}
                className="mr-2"
              />
              Мої спостереження
            </label>
            )}
        </div>
      </div>
      <div className="mt-4">
        {observations.length > 0 && observations.map(observation => (
          <div key={observation._id} className="flex items-center justify-left gap-2 bg-gray-100 p-1 rounded-2xl mb-4 border border-2 border-primary">
            <div className="flex w-24 h-24 bg-gray-300 grow-0 shrink-0 mt-1 rounded-2xl border border-2 border-primary">
              <PhotoImg item={observation} className="w-full h-full object-cover rounded-2xl"/>
            </div>
            <div className="flex-wrap">
              <div className="flex flex-wrap">
                <h2 className="text-lg font-semibold font-arial">{observation.category}</h2>
                {user.isAdmin && user._id === observation.owner ? (
                    <span title="Моє" className="text-lg text-primary ml-2">&#9733; </span>
                ):(<span className="text-sm text-gray-600 ml-2">{observation.ownerEmail}</span>)}
              </div>
              <div className="flex flex-wrap items-center">
                <span>
                  {"Статус: "}{observation.status}
                </span>
                {user.isAdmin && ( 
                  observation.status === "Неверифіковано" ? (
                    <button
                      title = "Верифікувати"
                      className="ml-2 primary text-white rounded-full flex items-center justify-center px-2 py-1"
                      onClick={() => {
                        handleShowModal("verify", observation._id)
                      }}
                      style={{ height: '30px', width: '50px' }} 
                    >
                      <span className="mr-1 text-sm">{observation.overallRating}</span> 
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="size-6 h-4 w-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    </button>
                  ):
                  (<button
                    className="ml-2 bg-grey-400 text-white rounded-full flex items-center justify-center px-2 py-1 "
                    style={{ height: '30px', width: '50px' }} 
                    disabled
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="size-6 h-4 w-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  </button>)
                )}       
              </div>
              <div className="mt-2 flex flex-wrap items-center">
                <span>
                Статус: {observation.isVisible ? "Актуальне" : "Виправлене"}
                </span>
                {user.isAdmin && ( 
                  observation.isVisible === true ? (
                    <button
                      title = "Призначити статус 'Виправлено' "
                      className="ml-2 primary text-white rounded-full flex items-center justify-center px-2 py-1"
                      onClick={() => {
                        handleShowModal("actualize", observation._id);
                      }}
                      style={{ height: '30px', width: '50px' }} 
                    >
                      <span className="mr-1 text-sm">{observation.relevanceRating}</span> 
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="size-6 h-4 w-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                          </svg>
                    </button>
                  ):
                  (<button
                    className="ml-2 bg-grey-400 text-white rounded-full flex items-center justify-center px-2 py-1"
                    style={{ height: '30px', width: '50px' }} 
                    disabled
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="size-6 h-4 w-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                    </svg>
                  </button>)
                )}       
              </div>
              <p className="text-sm mt-2 overflow-hidden line-clamp-2 text-justify w-full">{observation.description}</p>
              <div className="inline-flex">
                <Link to={'/account/observations/'+observation._id}>
                  <button className="mt-2 flex items-center justify-center rounded-md w-8 h-8">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                  </button>
                </Link>
                <button
                  className="mx-1 mt-2 flex items-center justify-center rounded-md w-8 h-8"
                  onClick={() => {
                    setSelectedObservation(observation._id);
                    setShowDeleteModal(true);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Чи дійсно ви бажаєте видалити спостереження?</h2>
            <div className="flex justify-end space-x-4 mt-2">
              <button className="bg-red-500 text-white rounded-full px-4 py-2" onClick={() => handleDeleteObservation(selectedObservation)}>Видалити</button>
              <button className="bg-gray-500 text-white rounded-full px-4 py-2" onClick={handleDeleteCancel}>Скасувати</button>
            </div>
          </div>
        </div>
      )}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>
              {modalType === "verify"
                ? "Чи дійсно ви бажаєте присвоїти статус 'Верифіковано' спостереженню? Ви не зможете скасувати цю дію пізніше!"
                : "Чи дійсно ви бажаєте присвоїти статус 'Виправлено' спостереженню? Ви не зможете скасувати цю дію пізніше!"}
            </h2>
            <div className="flex justify-end space-x-4 mt-2">
              <button
                className="bg-primary text-white rounded-full px-4 py-2"
                onClick={handleAction}
              >
                {modalType === "verify" ? "Верифікувати" : "Актуалізувати"}
              </button>
              <button
                className="bg-gray-500 text-white rounded-full px-4 py-2"
                onClick={handleCancel}
              >
                Скасувати
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
