import {useState} from "react";
import Image from "./Image.jsx";

export default function AllPhotos({item}) {

  const [isModalVisible,setIsModalVisible] = useState(false);

  if (isModalVisible) {
    return (
      <div className="fixed inset-0 bg-gray-200 text-black min-h-screen flex justify-center item-center">
        <div className="bg-gray-200 p-8 w-full max-w-3xl mx-auto rounded-xl relative">
          <button 
            onClick={() => setIsModalVisible(false)} 
            className="absolute -top-4 -right-4 bg-primary text-white p-2 rounded-full shadow-lg hover:bg-primary-dark focus:outline-none ">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
            </svg>
          </button>
  
          <div className="flex flex-col gap-6 overflow-auto max-h-[calc(100vh-120px)]">
            {item?.photos?.length > 0 && item.photos.map((photo, index) => (
              <div key={index} className="relative w-full">
                <Image 
                  src={photo} 
                  alt={`Фото ${index + 1}`} 
                  className="w-full h-auto object-cover rounded-xl shadow-lg" 
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-gray-200 border border-2 border-primary p-4 rounded-3xl shadow-xl">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4 rounded-2xl overflow-hidden">
        <div className="relative group">
          {item.photos?.[0] && (
            <Image onClick={() => setIsModalVisible(true)} className="aspect-square cursor-pointer object-cover group-hover:scale-105 transition-transform duration-300" src={item.photos[0]} alt=""/>
          )}
        </div>
        <div className="relative group">
          {item.photos?.[1] && (
            <Image onClick={() => setIsModalVisible(true)} className="aspect-square cursor-pointer object-cover group-hover:scale-105 transition-transform duration-300" src={item.photos[1]} alt=""/>
          )}
        </div>
        <div className="relative group">
          {item.photos?.[2] && (
            <Image onClick={() => setIsModalVisible(true)} className="aspect-square cursor-pointer object-cover group-hover:scale-105 transition-transform duration-300" src={item.photos[2]} alt=""/>
          )}
        </div>
      </div>
      {item.photos?.length > 4 && (
        <button onClick={() => setIsModalVisible(true)} className="mt-4 py-2 px-4 bg-white rounded-2xl shadow-md border border-primary text-black hover:bg-gray-100 transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" />
          </svg>
          Всі фото
        </button>
      )}
    </div>
  );
}