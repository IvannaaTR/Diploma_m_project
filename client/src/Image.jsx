export default function Image({ src, ...rest }) {
  return (
    <div>
      <img {...rest} src={src} alt="" />
    </div>
  );
}
