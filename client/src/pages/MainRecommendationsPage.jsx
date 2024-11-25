import {useEffect, useState} from "react";
import axios from "axios";
import {Link} from "react-router-dom";
import Image from "../Image.jsx";
import MainNav from "../MainNav";

export default function MainRecommendationsPage() {
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    axios.get('/recommendations').then(response => {
      setRecommendations(response.data);
    });
  }, []);

  const renderRecommendation = (recommendation) => (
    <Link to={`/recommendation/${recommendation._id}`} key={recommendation._id} className="flex flex-col items-center">
      <div className="bg-gray-500 w-48 mb-2 rounded-2xl overflow-hidden">
        {recommendation.photos?.[0] && (
          <Image
            className="object-cover w-full h-16 md:h-24 lg:h-32"
            src={recommendation.photos?.[0]}
            alt=""
          />
        )}
      </div>
      <h3 className="font-bold text-sm text-black text-center">{recommendation.title}</h3>
    </Link>
  );

  return (
    <div>
      <MainNav />
      <div className="mt-8 grid gap-x-6 gap-y-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
        {recommendations.length > 0 ? recommendations.map(renderRecommendation) : <p>Loading...</p>}
      </div>
    </div>
  );
}
