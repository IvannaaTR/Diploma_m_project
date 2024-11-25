import {useEffect, useState} from "react";
import axios from "axios";
import {Link} from "react-router-dom";
import Image from "../Image.jsx";
import MainNav from "../MainNav.jsx";

export default function MainInitiativesPage() {
  const [initiatives, setInitiatives] = useState([]);

  useEffect(() => {
    axios.get('/initiantives').then(response => {
      setInitiatives(response.data);
    });
  }, []);

  const renderInitiative = (initiative) => (
    <Link to={'initiative/' + initiative._id} key={initiative._id} className="flex flex-col items-center">
      <div className="bg-gray-200 w-48 mb-2 rounded-2xl overflow-hidden">
        {initiative.photos?.[0] && (
          <Image
            className="object-cover w-full h-16 md:h-24 lg:h-32"
            src={initiative.photos?.[0]}
            alt=""
          />
        )}
      </div>
      <h2 className="font-bold text-center">{initiative.title}</h2>
      <h3 className="text-sm text-gray-500 text-center">{initiative.address}</h3>
    </Link>
  );

  return (
    <div>
      <MainNav />
      <div className="mt-8 grid gap-x-6 gap-y-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
        {initiatives.length > 0 ? initiatives.map(renderInitiative) : <p>Loading...</p>}
      </div>
    </div>
  );
}

