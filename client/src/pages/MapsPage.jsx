import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MapComponent from './MapComponent';
import MainNav from "../MainNav";

const MapsPage = () => {
  const today = new Date().toISOString().split('T')[0]; 
  const [selectedCategory, setSelectedCategory] = useState('Станції');
  const [categoryPreview, setCategoryPreview] = useState('');
  const [selectedDate, setSelectedDate] = useState(today); 
  const [summaryData, setSummaryData] = useState({
    totalStations: 0,
    totalObservations: 0,
    verifiedPercentage: 0,
    correctedPercentage: 0,
  });

  useEffect(() => {
    if (selectedCategory === 'Забруднення') {
      axios.get('/observations-summary')
        .then(({ data }) => {
          setSummaryData(data);
          console.log(data)
        })
        .catch(error => {
          console.error('Error fetching summary data:', error);
        });
    }
  }, [selectedCategory]);

  const { totalStations, totalObservations, verifiedPercentage, correctedPercentage } = summaryData;
  const handleCategoryChange = (e) => {
    const categoryName = e.target.value;
    setSelectedCategory(categoryName);
    const category = categories.find((cat) => cat.name === categoryName);
    setCategoryPreview(category ? category.preview : '');
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };
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
  const categories = [
    {
      name: 'Станції',
      preview: 'Відображаються дані зі станцій моніторингу якості повітря.',
    },
    {
      name: 'Вода',
      preview: 'Відображаються дані про забруднення водойм додані користувачами. Категорія включає: промислові відходи, стічні води, мінеральні добрива, що потрапляють у воду, нафтопродукти, термічне забруднення тощо.',
    },
    {
      name: 'Грунт',
      preview: 'Відображаються дані про забруднення грунту додані користувачами. Категорія включає: промислові та будівельні відходи, надлишок мінеральних добрив, нафтопродукти тощо.',
    },
    {
      name: 'Відходи',
      preview: 'Відображаються дані про забруднення побутовими відходами додані користувачами. Категорія включає побутові відходи, здебільшого органічні відходи, пластик, метал, скло та папір.',
    },
    {
      name: 'Забруднення',
      preview: 'Загальний стан довкілля, відображаються дані зі станцій моніторингу якості повітря та верифіковані користувацькі спостереження.',
    }
  ];
  return (
    <div>
      <MainNav />
      <InputLabel  
          header="Категорія" 
          description="Оберіть категорію для відображення:" 
        />
      <p className="my-1 text-gray-500 text-sm text-justify">{categoryPreview}</p>
      <div style={{ border: '2px solid rgb(7, 122, 41)', padding: '8px', borderRadius: '1rem', marginBottom: '10px', backgroundColor: '#E5E7EB', width: 'fit-content' }}>
        <select id="category" value={selectedCategory} onChange={handleCategoryChange} className="bg-gray-200 rounded-2xl border border-1 border-primary w-full">
            <option value="Станції">Станції моніторингу якості повітря</option>
            <option value="Вода">Забруднення водойм</option>
            <option value="Грунт">Забруднення ґрунту</option>
            <option value="Відходи">Забруднення побутовими відходами</option>
            <option value="Забруднення">Карта стану навколишнього середовища</option>
        </select>
        </div>
        {selectedCategory === 'Станції' && (
        <div className=' bg-gray-200 mt-4 mb-4 border border-2 border-primary rounded-2xl text-justify'>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', marginLeft: '10px', marginTop: '10px',marginRight: '10px' }}>
            AQI - індекс якості повітря:
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', marginLeft: '10px',marginRight: '10px' }}>
            <div style={{ width: '20px', height: '20px', backgroundColor: 'limegreen', marginRight: '5px', borderRadius: '50%' }}></div>
            1-50: Повітря чисте. Можна провітрювати, активно проводити час просто неба.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', marginLeft: '10px',marginRight: '10px' }}>
            <div style={{ width: '20px', height: '20px', backgroundColor: 'palegreen', marginRight: '5px', borderRadius: '50%'  }}></div>
            51-100: Повітря прийнятне. Не варто хвилюватися, це нормальний показник.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', marginLeft: '10px',marginRight: '10px' }}>
              <div style={{ width: '20px', height: '20px', backgroundColor: 'lightsalmon', marginRight: '5px', borderRadius: '50%', flexShrink: 0 }}></div>
              101-150: Повітря нездорове для чутливих людей. Якщо маєте серцеві чи легеневі захворювання, варто обмежити активності на вулиці. Це ж стосується дітей.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', marginLeft: '10px',marginRight: '10px' }}>
            <div style={{ width: '20px', height: '20px', backgroundColor: 'orangered', marginRight: '5px', borderRadius: '50%'  }}></div>
            151-200: Повітря нездорове. Варто відмовитися від прогулянки та припинити провітрювання квартири.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', marginLeft: '10px',marginRight: '10px' }}>
            <div style={{ width: '20px', height: '20px', backgroundColor: 'red', marginRight: '5px', borderRadius: '50%'  }}></div>
            201-300: Повітря дуже нездорове. Закривайте вікна та за можливості увімкніть очищувач повітря.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', marginLeft: '10px',marginRight: '10px' }}>
            <div style={{ width: '20px', height: '20px', backgroundColor: 'maroon', marginRight: '5px', borderRadius: '50%'  }}></div>
            від 301: Повітря небезпечне. Побережіть себе, увімкнувши очищувач чи зволожувач повітря.
          </div>
        </div>
      )}
      {selectedCategory !== 'Станції' && selectedCategory !== 'Забруднення' &&(
        <div className=' bg-gray-200 mt-4 mb-4 border border-2 border-primary rounded-2xl text-justify'>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', marginLeft: '10px',marginRight: '10px' }}>
            <div style={{ width: '20px', height: '20px', backgroundColor: 'yellow', marginRight: '5px', borderRadius: '50%'  }}></div>
            1: Незначне забруднення.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', marginLeft: '10px',marginRight: '10px' }}>
              <div style={{ width: '20px', height: '20px', backgroundColor: 'orange', marginRight: '5px', borderRadius: '50%', flexShrink: 0 }}></div>
              2: Середнє забруднення, може вимагати певних заходів для видалення.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', marginLeft: '10px',marginRight: '10px' }}>
            <div style={{ width: '20px', height: '20px', backgroundColor: 'orangered', marginRight: '5px', borderRadius: '50%'  }}></div>
            3: Високе забруднення, потребує негайних заходів для видалення.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', marginLeft: '10px',marginRight: '10px' }}>
            <div style={{ width: '20px', height: '20px', backgroundColor: 'red', marginRight: '5px', borderRadius: '50%'  }}></div>
            4: Максимальне забруднення, негайно потрібні серйозні заходи для видалення та відновлення стану довкілля.
          </div>
        </div>
      )}
      {selectedCategory === 'Забруднення' && (
        <div className="bg-gray-200 border-2 border-primary rounded-2xl p-4 mt-4 mb-4">
          <div className="grid grid-cols-4 gap-4 justify-items-center">
            <div className="w-16 h-16 flex items-center justify-center rounded-full border-4 border-primary text-xl font-semibold bg-gray-200">
            {totalStations}
            </div>
            <div className="w-16 h-16 flex items-center justify-center rounded-full border-4 border-primary text-xl font-semibold bg-gray-200">
            {totalObservations}
            </div>
            <div
              className="w-16 h-16 flex items-center justify-center rounded-full border-4 border-primary text-xl font-semibold bg-gray-200"
              style={{
                background: `conic-gradient(rgb(7, 122, 41) ${verifiedPercentage}%, #E5E7EB ${verifiedPercentage}% 100%)`
              }}
            >
              {Math.round(verifiedPercentage)}%
            </div>
            <div
              className="w-16 h-16 flex items-center justify-center rounded-full border-4 border-primary text-xl font-semibold bg-gray-200"
              style={{
                background: `conic-gradient(rgb(7, 122, 41) ${correctedPercentage}%, #E5E7EB ${correctedPercentage}% 100%)`
              }}
            >
              {Math.round(correctedPercentage)}%
            </div>
            <div className="text-center text-sm font-medium">Кількість активних станцій моніторингу</div>
            <div className="text-center text-sm font-medium">Кількість спостережень</div>
            <div className="text-center text-sm font-medium">Відсоток верифікованих</div>
            <div className="text-center text-sm font-medium">Відсоток виправлених</div>
          </div>
        </div>
      )}
    
      <MapComponent selectedCategory={selectedCategory}/>
    </div>
  );
};

export default MapsPage;
