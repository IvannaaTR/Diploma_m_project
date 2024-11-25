import PhotosUploader from "../PhotosUploader.jsx";
import {useContext, useEffect, useState} from "react";
import axios from "axios";
import AccountNav from "../AccountNav.jsx";
import UserAccountNav from "../UserAccountNav.jsx";
import {Navigate, useParams} from "react-router-dom";
import MapPicker from './MapPicker.jsx';
import {UserContext} from "../UserContext.jsx";

export default function ObservationCreationPage() {
  const {user} = useContext(UserContext);
  const [error, setError] = useState(null);
  const {id} = useParams();
  const [category,setCategory] = useState('Вода');
  const [latitude, setLatitude] = useState();
  const [longitude, setLongitude] = useState();
  const [addedPhotos,setAddedPhotos] = useState([]);
  const [mark,setMark] = useState(1);
  const [area,setArea] = useState(5);
  const [description,setDescription] = useState();
  const [redirect,setRedirect] = useState(false);
  const [categoryPreview, setCategoryPreview] = useState('');
  useEffect(() => {
    if (!id) {
      return;
    }
    axios.get('/observations/'+id).then(response => {
       const {data} = response;
       setCategory(data.category);
       setLatitude(data.latitude);
       setLongitude(data.longitude);
       setAddedPhotos(data.photos);
       setMark(data.mark);
       setArea(data.area);
       setDescription(data.description);
    }).catch(error => {
      setError(`Увага! ${error.response.data.error}`);
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
    const defaultDescriptionStyle = "my-1 text-gray-500 text-sm font-helvetica text-justify";
    
    return (
      <div>
        {createTextElement('h2', defaultHeaderStyle, header)}
        {createTextElement('p', defaultDescriptionStyle, description)}
      </div>
    );
  };
  async function saveObservation(ev) {
    ev.preventDefault();
    const observationData = {
      category, latitude, longitude, addedPhotos, mark, area,
      description, 
    };
    if (!category || !latitude || !longitude || !mark || !area || !description) {
      alert("Будь ласка, заповніть усі обов'язкові поля.");
      return
    }
    if (id) {
      await axios.put('/observations', {
        id, ...observationData
      }).catch(error => {
        alert(`Увага! ${error.response.data.error}`);
      });
      setRedirect(true);
    } else {
      await axios.post('/observations', observationData).catch(error => {
        alert(`Увага! ${error.response.data.error}`);
      });
      setRedirect(true);
    }

  }
  const StarRating = ({ value, onChange }) => {
    const stars = [1, 2, 3, 4];

    return (
      <div style={{ fontSize: '24px' }}>
        {stars.map((star, index) => (
          <span
            key={index}
            onClick={() => onChange(star)}
            style={{ cursor: 'pointer', color: star <= value ? 'gold' : 'gray' }}
          >
            &#9733; 
          </span>
        ))}
      </div>
    );
  };

  if (redirect) {
    return <Navigate to={'/account/observations'} />
  }
  const categories = [
    {
      name: 'Вода',
      preview: 'Категорія включає: промислові відходи, стічні води, мінеральні добрива, що потрапляють у воду, нафтопродукти, термічне забруднення тощо.',
    },
    {
      name: 'Грунт',
      preview: 'Категорія включає: промислові та будівельні відходи, надлишок мінеральних добрив, нафтопродукти тощо.',
    },
    {
      name: 'Відходи',
      preview: 'Категорія включає побутові відходи, здебільшого органічні відходи, пластик, метал, скло та папір.',
    },
  ];
  const handleCategoryChange = (e) => {
    const categoryName = e.target.value;
    setCategory(categoryName);
    const category = categories.find((cat) => cat.name === categoryName);
    setCategoryPreview(category ? category.preview : '');
  };
  return (
    <div>
      
      {error ? ( 
      <div>
        <p>{error}</p> 
      </div>
    ) : (
      <>
      {user.isAdmin === true ? (
        <AccountNav />
      ) : (
        <UserAccountNav />
      )}
      <form onSubmit={saveObservation} className="text-sm mt-4">
      <InputLabel 
        header="Категорія" 
        description="Оберіть категорію:" 
      />
        <p className="my-1 text-gray-500 text-sm text-justify">{categoryPreview}</p>
        <div style={{ border: '2px solid rgb(7, 122, 41)', padding: '8px', borderRadius: '1rem', marginBottom: '10px', backgroundColor: '#E5E7EB', width: 'fit-content' }}>
        <select value={category} onChange={handleCategoryChange} className="input-field bg-gray-200 rounded-2xl border border-1 border-primary w-full">
            <option value="Вода">Забруднення водойм</option>
            <option value="Грунт">Забруднення ґрунту</option>
            <option value="Відходи">Забруднення відходами</option>
        </select>
        </div>
        <div>
        <InputLabel 
            header="Координати спостереження" 
            description="Оберіть координати на карті:" 
          />
          <MapPicker 
            initialLatitude={latitude} 
            initialLongitude={longitude} 
            onLocationChange={(location) => {
              setLatitude(location.lat);
              setLongitude(location.lng);
            }}
            />
        </div>
        <InputLabel 
          header="Фото" 
          description="Додайте фото:" 
        />
        <PhotosUploader addedPhotos={addedPhotos} onChange={setAddedPhotos} />
        <InputLabel 
          header="Оцінка" 
          description="Оцініть стан довкілля від 1 до 4: 1 - Незначне забруднення.
        2 - Середнє забруднення, може вимагати певних заходів для видалення.
        3 - Високе забруднення, потребує негайних заходів для видалення.
        4 - Максимальне забруднення, негайно потрібні серйозні заходи для видалення та відновлення стану довкілля."
        />
        <StarRating value={mark} onChange={setMark} />
        <InputLabel 
          header="Площа забрудення" 
          description="Вкажіть приблизну площу в м2:" 
        />
        <input
          type="number"
          value={area}
          onChange={(ev) => setArea(ev.target.value)}
          className="input-field"
          min="0" 
          step="any" 
          placeholder="Введіть число"
        />
        <InputLabel 
          header="Опис" 
          description="Додайте опис:" 
        />
        <textarea value={description} onChange={ev => setDescription(ev.target.value)} className="input-field text-justify" />
        <button type="submit" className="primary ">Зберегти</button>
      </form>
      </>
      )}
    </div>
  );
}
