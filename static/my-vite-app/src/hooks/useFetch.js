import { useState, useEffect } from 'react';
import axios from "axios";


const useFetch = (url, method = 'GET', body = null, setLoading, setError, dependencies = []) => {
  const [data, setData] = useState(null);

  const fetchData = async (overrideUrl = url) => {
    if (!overrideUrl) return null;
  
    setLoading(true);
    setError(null);
    try {
      const options = { method, url: overrideUrl };
      if (body) options.data = body;
  
      const response = await axios(options);
      setData(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching data');
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, dependencies);  

  return { data, fetchData };
};

export default useFetch;
