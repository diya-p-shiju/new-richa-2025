import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFoundPage = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/"); // Redirect to homepage
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r  text-red-500">
      <div className="text-center">
        <h1 className="text-6xl font-bold animate-bounce">404</h1>
        <h2 className="text-3xl mt-4 font-semibold">Whoops! Page not found!</h2>
        <p className="mt-2 text-xl">It looks like the page you are looking for doesn't exist.</p>
        <p className="mt-4 text-lg">But don't worry, you can always go back home!</p>
        
        <Button
          onClick={handleGoHome}
          className="mt-6 bg-yellow-400 text-black px-6 py-3 rounded-full hover:bg-yellow-500 transition-all"
        >
          Take me Home
        </Button>
      </div>

      {/* Adding some funky elements */}
      <div className="absolute bottom-0 left-0 right-0 text-center text-xl text-gray-200">
        <p className="font-semibold animate-pulse">Oops! Don't stay lost forever! 😜</p>
      </div>
    </div>
  );
};

export default NotFoundPage;
