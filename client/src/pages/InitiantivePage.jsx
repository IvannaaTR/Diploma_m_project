import {Link, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import axios from "axios";
import AllPhotos from "../AllPhotos";
import MapLink from "../MapLink";

export default function InitiantivePage() {
  const {id} = useParams();
  const [initiative,setInitiantive] = useState(null);
  useEffect(() => {
    if (!id) {
      return;
    }
    axios.get(`/ginitiantive/${id}`).then(response => {
      setInitiantive(response.data);
    });
  }, [id]);

  if (!initiative) return '';
  return (
    <div className="my-4 bg-gray-200 -mx-8 px-8 pt-8 border border-2 border-primary rounded-2xl">
      <h1 className="text-3xl font-semibold font-helevetica ">{initiative.title}</h1>
      <MapLink>{initiative.address}</MapLink>
      <div className="mt-4 flex flex-wrap ">
        <AllPhotos item={initiative}/>
      </div>
      <div>
        <div className="my-8 border-t border-primary">
          <h2 className="my-4 font-semibold text-2xl">Опис</h2>
          <p className="text-justify">{initiative.description}</p>
        </div>
        <div className="my-8">
          <h2 className="my-2 font-semibold text-xl">Додаткова інформація</h2>
          <p className="text-justify text-sm text-gray-700 leading-5 ">{initiative.extraInfo}</p>
        </div>
      </div>
    </div>
  );
}
