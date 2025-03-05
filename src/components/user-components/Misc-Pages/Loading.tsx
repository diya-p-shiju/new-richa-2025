import { ClipLoader } from "react-spinners";

const LoadingPage = () => (
  <div className="loading-page">
    <h1>Loading...</h1>
    <ClipLoader color="#36d7b7" size={50} />
  </div>
);

export default LoadingPage;