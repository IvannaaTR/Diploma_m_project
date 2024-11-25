import PhotosUploader from "../PhotosUploader.jsx";
import {useEffect, useState} from "react";
import axios from "axios";
import AccountNav from "../AccountNav.jsx";
import {Navigate, useParams} from "react-router-dom";

export default function InitiantivesFormPage() {
  const {id} = useParams();
  const [title,setTitle] = useState('');
  const [address,setAddressLink] = useState('');
  const [addedPhotos,setPhotos] = useState([]);
  const [description,setDescription] = useState('');
  const [extraInfo,setExtraInfo] = useState('');
  const [redirect,setRedirect] = useState(false);
  useEffect(() => {
    if (!id) {
      return;
    }
    axios.get('/initiantives/'+id).then(response => {
       const {data} = response;
       setTitle(data.title);
       setAddressLink(data.address);
       setPhotos(data.photos);
       setDescription(data.description);
       setExtraInfo(data.extraInfo);
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
    const defaultHeaderStyle = "text-sm mt-4 bg-gray-200 border-2 border-primary inline-block p-2 rounded-2xl font-helvetica";
    const defaultDescriptionStyle = "my-1 text-gray-500 text-sm font-helvetica";
    
    return (
      <div>
        {createTextElement('h2', defaultHeaderStyle, header)}
        {createTextElement('p', defaultDescriptionStyle, description)}
      </div>
    );
  };

  async function saveInitiative(ev) {
    ev.preventDefault();
    const initiativeData = {
      title, address, addedPhotos,
      description, extraInfo,
    };
    if (id) {
      await axios.put('/initiantives', {
        id, ...initiativeData
      });
      setRedirect(true);
    } else {
      await axios.post('/initiantives', initiativeData);
      setRedirect(true);
    }

  }

  if (redirect) {
    return <Navigate to={'/account/initiantives'} />
  }

  return (
    <div>
      <AccountNav />
      <form onSubmit={saveInitiative} className="text-sm mt-4">
        <InputLabel  
          header="Назва" 
          description="Введіть назву ініціативи:" 
        />
        <input 
          type="text" 
          value={title} 
          onChange={ev => setTitle(ev.target.value)} 
          placeholder="Назва" 
          className="input-field" 
        />
        
        <InputLabel  
          header="Адреса" 
          description="Введіть адресу:" 
        />
        <input 
          type="text" 
          value={address} 
          onChange={ev => setAddressLink(ev.target.value)} 
          placeholder="Адреса" 
          className="input-field" 
        />
  
        <InputLabel  
          header="Фото" 
          description="Додайте фото:" 
        />
        <PhotosUploader addedPhotos={addedPhotos} onChange={setPhotos} />
  
        <InputLabel  
          header="Опис" 
          description="Додайте опис:" 
        />
        <textarea 
          value={description} 
          onChange={ev => setDescription(ev.target.value)} 
          className="input-field text-justify" 
        />
  
        <InputLabel  
          header="Додаткова інформація" 
          description="Введіть додаткову інформацію:" 
        />
        <textarea 
          value={extraInfo} 
          onChange={ev => setExtraInfo(ev.target.value)} 
          className="input-field text-justify" 
        />
  
        <button type="submit" className="primary p-2 w-24 mx-auto">Зберегти</button>
      </form>
    </div>
  );
}
