import Image from "./Image.jsx";
export default function PhotoImg({ item, index = 0, className = 'object-cover' }) {
    if (!item?.photos?.length) {
      return null;
    }
  
    return (
      <Image className={className} src={item.photos[index]} alt="" />
    );
  }