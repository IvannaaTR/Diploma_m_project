import {Link, useParams} from "react-router-dom";
import AccountNav from "../AccountNav";
import UserAccountNav from "../UserAccountNav";
import {useContext, useEffect, useState} from "react";
import axios from "axios";
import PhotoImg from "../PhotoImg";
import {UserContext} from "../UserContext.jsx";

export default function InitiantivesPage() {
  const {user} = useContext(UserContext);
  const [initiatives,setInitiatives] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedInitiative, setSelectedInitiative] = useState(null);
  useEffect(() => {
    axios.get('/user-initiantives').then(({data}) => {
      setInitiatives(data);
    });
  }, []);

  async function handleDeleteInitiative(initiativeId) {
    try {
      await axios.delete('/initiantives/' + initiativeId);
      axios.get('/user-initiantives').then(({ data }) => {
        setInitiatives(data); 
      });
      setSelectedInitiative(null);
      setShowModal(false);
    } catch (error) {
      console.error("Помилка при видаленні ініціативи:", error);
    }
  }
  const handleCancel = () => {
    setShowModal(false);
    setSelectedInitiative(null);
  };
  const renderInitiative = (initiative) => (
    <div key={initiative._id} className="flex items-center justify-left gap-2 bg-gray-100 p-1 rounded-2xl mb-4 border border-2 border-primary">
     <div className="flex w-24 h-24 bg-gray-300 grow-0 shrink-0 mt-1 rounded-2xl border border-2 border-primary">
       <PhotoImg item={initiative} className="w-full h-full rounded-2xl"/>
     </div>
       <div>
         <h2 className="text-lg font-semibold font-arial">{initiative.title}</h2>
         <p className="text-sm mt-2 mr-2 overflow-hidden line-clamp-2 text-justify">{initiative.description}</p>
         <div className="inline-flex">
           <Link to={'/account/initiantives/'+initiative._id}>
             <button className="mt-2 flex items-center justify-center rounded-md w-8 h-8">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
               </svg>
             </button>
           </Link>
           <button
           className="mx-1 mt-2 flex items-center justify-center rounded-md w-8 h-8"
           onClick={() => {
             setSelectedInitiative(initiative._id);
             setShowModal(true);
           }}
           >
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
               <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
             </svg>
           </button>
         </div>
       </div>
     </div>
   )


  return (
    <div>
      {user.isAdmin === true ? (
        <AccountNav />
      ) : (
        <UserAccountNav />
      )}
        <div className="text-center">
          <Link className="inline-flex gap-1 bg-primary text-white py-2 px-6 rounded-full" to={'/account/initiantives/new'}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
            </svg>
            Додати
          </Link>
        </div>
        <div className="mt-4">
        {initiatives.length > 0 ? initiatives.map(renderInitiative) : <p>Loading...</p>}
        </div>
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Чи дійсно ви бажаєте видалити ініціативу?</h2>
              <div className="flex justify-end space-x-4 mt-2">
                <button className="bg-red-500 text-white rounded-full px-4 py-2" onClick={() => handleDeleteInitiative(selectedInitiative)}>Видалити</button>
                <button className="bg-gray-500 text-white rounded-full px-4 py-2" onClick={handleCancel}>Скасувати</button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}