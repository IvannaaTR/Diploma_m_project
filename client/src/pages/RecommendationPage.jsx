import {Link, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import axios from "axios";
import AllPhotos from "../AllPhotos";


export default function RecommendationPage() {
  const {id} = useParams();
  const [recommendation,setRecommendation] = useState(null);
  useEffect(() => {
    if (!id) {
      return;
    }
    axios.get(`/grecommendation/${id}`).then(response => {
        setRecommendation(response.data);
    });
  }, [id]);

  if (!recommendation) return '';
  return (
    <div className="my-4 bg-gray-200 -mx-8 px-8 pt-8 border border-2 border-primary rounded-2xl">
      <h1 className="text-3xl font-semibold font-helevetica">{recommendation.title}</h1>
      <div className="mt-4 flex flex-wrap">
        <AllPhotos item={recommendation} />
      </div>
        <div>
          <div className="my-8 border-t border-primary">
            <h2 className="my-4 font-semibold text-2xl">Опис</h2>
            <p className="mt-4 text-justify">{recommendation.description}</p>
          </div>
        </div>
    </div>
  );
}
