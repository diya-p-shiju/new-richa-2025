import axios, {AxiosInstance} from "axios";

const newRequest : AxiosInstance = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials:false,

});

export default newRequest;