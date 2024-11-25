import PhotosUploader from "../PhotosUploader.jsx";
import {useEffect, useState} from "react";
import axios from "axios";
import AccountNav from "../AccountNav.jsx";
import {Navigate, useParams} from "react-router-dom";

export default function RecommendationCreationPage() {
  const [error, setError] = useState(null);
  const {id} = useParams();
  const [title,setTitle] = useState('');
  const [addedPhotos,setAddedPhotos] = useState([]);
  const [description,setDescription] = useState('');
  const [redirect,setRedirect] = useState(false);
  useEffect(() => {
    if (!id) {
      return;
    }
    axios.get('/recommendations/'+id).then(response => {
       const {data} = response;
       setTitle(data.title);
       setAddedPhotos(data.photos);
       setDescription(data.description);
    }).catch(error => {
      setError(`Увага! ${error.response}`);
    });
  }, [id]);
  const createTextElement = (Element, styles, children) => {
    return (
      <Element className={styles}>
        {children}
      </Element>
    );
  };
  
  const InputLabel  = ({ header, description }) => {
    const defaultHeaderStyle = "text-sm mt-4 bg-gray-200 border border-2 border-primary inline-block p-2 rounded-2xl font-helvetica";
    const defaultDescriptionStyle = "my-1 text-gray-500 text-sm font-helvetica";
    
    return (
      <div>
        {createTextElement('h2', defaultHeaderStyle, header)}
        {createTextElement('p', defaultDescriptionStyle, description)}
      </div>
    );
  };
  async function saveRecommendation(ev) {
    ev.preventDefault();
    const recommendationData = {
      title, addedPhotos,
      description,
    };
    if (id) {
      await axios.put('/recommendations', {
        id, ...recommendationData
      }).catch(error => {
        alert(`Увага! ${error.response.data.error}`);
      });
      setRedirect(true);
    } else {
      await axios.post('/recommendations', recommendationData).catch(error => {
        alert(`Увага! ${error.response.data.error}`);
      });
      setRedirect(true);
    }

  }

  if (redirect) {
    return <Navigate to={'/account/recommendations'} />
  }
  return (
    <div >
      {error ? ( 
      <div>
        <p>{error}</p> 
      </div>
    ) : (
      <>
      <AccountNav />
      <form onSubmit={saveRecommendation} className="text-sm mt-4 ">
      <InputLabel 
          header="Назва" 
          description="Введіть назву:" 
        />
        <input type="text" value={title} onChange={ev => setTitle(ev.target.value)} placeholder="Назва" className="input-field" />
        <InputLabel 
          header="Фото" 
          description="Додайте фото:" 
        />
        <PhotosUploader addedPhotos={addedPhotos} onChange={setAddedPhotos} />
        <InputLabel 
          header="Опис" 
          description="Додайте опис:" 
        />
        <textarea value={description} onChange={ev => setDescription(ev.target.value)} className="input-field text-justify" />
        <button type="submit" className="primary p-2 w-24 mx-auto">Зберегти</button>
      </form>
      </>
    )}
    </div>
  );
}
