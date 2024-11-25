
import Image from "./Image.jsx";

export default function ObservationPhotos({ photos, onClose }) {
    return (
      <div className="fixed inset-0 bg-gray-200 text-black min-h-screen flex justify-center items-center ">
        <div className="bg-gray-200 p-8 w-full max-w-3xl mx-auto rounded-xl relative">
          <button
            onClick={onClose}
            className="absolute -top-4 -right-4 bg-primary text-white p-2 rounded-full shadow-lg hover:bg-primary-dark focus:outline-none "
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6"
            >
              <path
                fillRule="evenodd"
                d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </button>
  
          <div className="flex flex-col gap-6 overflow-auto max-h-[calc(100vh-120px)]">
            {photos?.length > 0 &&
              photos.map((photo, index) => (
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
  
  