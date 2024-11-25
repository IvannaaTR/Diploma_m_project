import React, { useContext, useState, useEffect } from "react";
import { UserContext } from "../UserContext.jsx";
import { Link, Navigate, useParams } from "react-router-dom";
import axios from "axios";
import AccountNav from "../AccountNav";
import UserAccountNav from "../UserAccountNav";

export default function ProfilePage() {
  const [redirect, setRedirect] = useState(null);
  const [selectedStation, setSelectedStation] = useState();
  const [successMessage, setSuccessMessage] = useState('');
  const [users, setUsers] = useState([]);

  const { ready, user, setUser } = useContext(UserContext);
  let { subpage } = useParams();
  if (subpage === undefined) {
    subpage = 'profile';
  }

  useEffect(() => {
    if (user && user.isAdmin) {
      axios.get('/users')
        .then(response => {
          setUsers(response.data);
        })
        .catch(error => {
          console.error("Помилка при отриманні користувачів", error);
        });
    }
  }, [user]);

  async function logout() {
    await axios.post('/logout');
    setRedirect('/');
    setUser(null);
  }

  async function saveStation() {
    if (selectedStation) {
      try {
        const response = await axios.put('/user/station', {
          selectedStation: selectedStation 
        });
        if (response.data.success) {
          setUser({
            ...user, 
            selectedStation: selectedStation  
          });
        setSuccessMessage('Дані успішно збережено.');
        }
      } catch (error) {
        console.error("Помилка при оновленні статусу користувача", error);
      }
      
    }
  }

  async function makeUserVerified(userId) {
    try {
      const response = await axios.put('/user/confirm', {
        userId: userId 
      });
      if (response.data.success) {
        setUsers(users.map(user => {
          return user._id === userId ? { ...user, coeficient: 3 } : user;
        }));
      }
    } catch (error) {
      console.error("Помилка при оновленні статусу користувача", error);
    }
  }
  async function makeUserBlocked(userId) {
    try {
      const response = await axios.put('/user/block', {
        userId: userId 
      });
      if (response.data.success) {
        const updatedUsers = users.map(user =>
          user._id === userId ? { ...user, isBlocked: null, coeficient: 1  } : user
        );
        setUsers(updatedUsers); 
      }
    } catch (error) {
      console.error("Помилка при оновленні статусу користувача", error);
    }
  }

  if (!ready) {
    return 'Loading...';
  }

  if (ready && !user && !redirect) {
    return <Navigate to={'/login'} />;
  }

  if (redirect) {
    return <Navigate to={redirect} />;
  }
  function getUserStatus(coefficient) {
    switch (coefficient) {
      case 1:
        return "Новий користувач";
      case 2:
        return "Активний користувач";
      case 3:
        return "Підтверджений користувач";
      default:
        return "Статус невідомий";
    }
  }
  return (
    <div>
      
      {user.isAdmin === true ? (
        <AccountNav />
      ) : (
        <UserAccountNav />
      )}
      {subpage === 'profile' && (
        <div className="grow flex items-center justify-center">
          <div className="bg-gray-200 shadow-lg p-6 rounded-2xl max-w-md border border-2 border-primary">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>
              <p className="font-bold">{`Статус: ${getUserStatus(user.coeficient)}`}</p>
            </div>
            <div className="text-left">
              
              {user.selectedStation ? (
                <p className="mb-4 text-justify">Ви стежите за станцією: {user.selectedStation}</p>
              ) : (
                <p className="mb-4 text-justify">Оберіть станцію за якою бажаєте стежити. Сповіщення про перевищення рівня забруднення надходитимуть Вам на email</p>
              )}
              <div className="mb-4">
                <select
                  value={selectedStation}
                  onChange={(e) => setSelectedStation(e.target.value)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border border-2 border-primary"
                >
                  <option value="">Оберіть станцію</option>
                  <option value="Street Kyivska">Жовква вулиця Київська</option>
                  <option value="Street Horodotska, 276">Львів вулиця Боднарська 7</option>
                  <option value="Street Sumska, 10">Львів вулиця Сумська 10</option>
                  <option value="Street Zelena, 27">Львів вулиця Зелена 27</option>
                  <option value="Street Hrushevskoho, 5">Пустомити вулиця Грушевсього 5</option>
                  <option value="ploshcha Rynok, 1">Самбір Площа Ринок 1</option>
                  <option value="Dolishnoluzhetska SZSh Drohobytskoi miskoi rady">Долішній Лужок СЗШ</option>
                  <option value="Street Hrushevskoho, 170">Дрогобич вулиця Грушевського 170</option>
                  <option value="Street Mazepy">Стебник вулиця Мазепи</option>
                </select>
              </div>
                <div className="text-center mb-4">
                  <button onClick={saveStation} className="primary mr-2">
                    {user.selectedStation ? 'Змінити' : 'Зберегти'}
                  </button>
                  {successMessage && <span className="text-green-500">{successMessage}</span>}
                </div>
              <button onClick={logout} className="primary">Вихід</button>
            </div>
          </div>
        </div>
      )}
      {user.isAdmin && (
        <div className="flex flex-col items-start mt-6">
          <h3 className="text-lg font-semibold mb-4">Список користувачів</h3>
          <div className="w-full max-h-96 overflow-y-auto bg-gray-100 border border-2 border-primary p-4 rounded-2xl">
            {users.length > 0 ? (
              users.map((userItem) => (
                <div key={userItem._id} className="flex flex-wrap items-center justify-left gap-2 border-primary bg-gray-200 p-2 rounded-2xl mb-4 w-full">
                  <div>
                    <p>Електронна адреса: {userItem.email}</p>
                    <p>Ім'я: {userItem.name}</p>
                    <p>Статус: {getUserStatus(userItem.coeficient)}</p>
                    <p>Загальна кількість спостережень: {userItem.totalObservations}</p>
                    <p>Кількість верифікованих: {userItem.verifiedObservations}</p>
                  </div>
                  {userItem.coeficient <= 2 && (
                    <button
                      title="Підтвердити користувача"
                      onClick={() => makeUserVerified(userItem._id)}
                      className="ml-2 bg-primary text-white px-4 py-2 rounded-2xl"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className=" h-4 w-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    </button>
                  )}
                  {!(userItem.isBlocked && (userItem.isBlocked !== null && userItem.isBlocked !== '1970-01-01T00:00:00.000Z'))  &&(
                  <button 
                      title="Заблокувати"
                      onClick={() => makeUserBlocked(userItem._id)}
                      className="ml-2 bg-primary text-white px-4 py-2 rounded-2xl"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p>Немає користувачів для відображення.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
