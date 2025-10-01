// src/pages/OneRegionMapPage.jsx
import dayjs from 'dayjs';

import { useEffect, useState } from 'react';

import { useParams } from 'react-router';

import ButtonGoBack from '../components/ButtonGoBack';
import DateRangePicker from '../components/DatePicker/DatePicker';
import FlightStatisticsOneReg from '../components/FlightStatisticsOneReg';
import { useFlightData } from '../hooks/useFlightData';
import { useGzipRegionFlightData } from '../hooks/useGzipRegionFlightData';
import { useRegions } from '../hooks/useRegions';
// Обновленный хук
import MapComponent from '../modules/MapComponent';
import { initialDateRange } from '../utils/constant';
import { timeToDateConverter } from '../utils/functions';
import { loadYmapsScript } from '../utils/loadYmaps';

const OneRegionMapPage = () => {
  const { id } = useParams();

  const [errorLoadYmaps, setErrorLoadYmaps] = useState(false);
  const [ymapsLoading, setYmapsLoading] = useState(true);
  const [dateRange, setDateRange] = useState(null);
  const [dateQuery, setDateQuery] = useState(initialDateRange);

  const from = timeToDateConverter(dateQuery[0].toDate());
  const to = timeToDateConverter(dateQuery[1].toDate());

  // Используем хук для получения данных полетов конкретного региона
  const {
    data: flightData,
    loading: flightLoading,
    error: flightError,
  } = useGzipRegionFlightData(id, from, to);

  // Используем обновленный хук для получения данных регионов
  const { data: regionsPolygons, loading: regionsLoading, error: regionsError } = useRegions();

  const {
    filteredFlights,
    dailyFlights,
    // peakHourlyFlightsData,
    peakHourlyFlights,
    // flightsByRegion,
    flightsDurationByRegion,
    flightsByTimeOfDay,
  } = useFlightData(flightData, dateRange);

  const oneRegionData = regionsPolygons?.features?.find(
    (obj) => String(obj.properties?.region_id) === String(id),
  );
  const regionCenter = oneRegionData?.properties?.center || [69, 100];

  useEffect(() => {
    let isMounted = true;

    setYmapsLoading(true);
    loadYmapsScript()
      .then(() => {
        if (isMounted) {
          setErrorLoadYmaps(false);
        }
      })
      .catch((error) => {
        console.error('Ошибка загрузки Yandex Maps API:', error);
        if (isMounted) {
          setErrorLoadYmaps(true);
        }
      })
      .finally(() => {
        if (isMounted) {
          setYmapsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const loading = ymapsLoading || flightLoading || regionsLoading;
  const error = flightError || regionsError;

  if (loading) {
    return (
      <div className="main">
        <div className="btn-back-container">
          <ButtonGoBack />
          <div className="header-region">
            <h1>Загрузка региона...</h1>
          </div>
        </div>

        <div
          style={{
            height: '600px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          Загрузка данных...
        </div>
      </div>
    );
  }

  if (!regionsPolygons) {
    return (
      <div className="main">
        <div className="btn-back-container">
          <ButtonGoBack />
          <div className="header-region">
            <h1>Загрузка карты...</h1>
          </div>
        </div>

        <div
          style={{
            height: '600px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          Загрузка геоданных...
        </div>
      </div>
    );
  }

  if (!oneRegionData) {
    return (
      <div className="main">
        <div className="btn-back-container">
          <ButtonGoBack />
          <div className="header-region">
            <h1>Регион не найден</h1>
          </div>
        </div>

        <div
          style={{
            height: '600px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          Регион с ID {id} не найден.
        </div>
      </div>
    );
  }

  if (ymapsLoading) {
    return (
      <div className="main">
        <div className="btn-back-container">
          <ButtonGoBack />
          <div className="header-region">
            <h1>{oneRegionData?.properties?.region || 'Регион России'}</h1>
          </div>
        </div>
        <div
          style={{
            height: '600px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          Загрузка Яндекс.Карт...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main">
        <div className="btn-back-container">
          <ButtonGoBack />
          <div className="header-region">
            <h1>{oneRegionData?.properties?.region || 'Регион России'}</h1>
          </div>
        </div>
        <div
          style={{
            height: '600px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {`Ошибка: ${error}`}
        </div>
      </div>
    );
  }

  return (
    <div className="main">
      <div className="btn-back-container">
        <ButtonGoBack />
        <div className="header-region">
          <h1>{oneRegionData?.properties?.region || 'Регион России'}</h1>
        </div>
      </div>

      <MapComponent
        regionsData={oneRegionData}
        points={filteredFlights}
        errorLoadYmaps={errorLoadYmaps}
        center={regionCenter}
        zoom={6}
      />
      <DateRangePicker dateRange={dateQuery} setDateRange={setDateQuery} />

      <FlightStatisticsOneReg
        dailyFlights={dailyFlights}
        flightsData={flightData}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        peakHourlyFlights={peakHourlyFlights}
        flightsByTimeOfDay={flightsByTimeOfDay}
        flightsDurationByRegion={flightsDurationByRegion}
        // peakHourlyFlightsData={peakHourlyFlightsData}
      />
    </div>
  );
};

export default OneRegionMapPage;

// // src/pages/OneRegionMapPage.jsx
// import dayjs from 'dayjs';
// import { useEffect, useState } from 'react';
// import { useParams } from 'react-router';

// import ButtonGoBack from '../components/ButtonGoBack';
// import FlightStatisticsOneReg from '../components/FlightStatisticsOneReg';
// import { useFlightData } from '../hooks/useFlightData';
// import { useGzipRegionFlightData } from '../hooks/useGzipRegionFlightData'; // Наш новый хук
// import { useRegions } from '../hooks/useRegions';
// import MapComponent from '../modules/MapComponent';
// import { timeToDateConverter } from '../utils/functions';
// import { loadYmapsScript } from '../utils/loadYmaps';
// import DateRangePicker from './DatePicker/DatePicker';

// const OneRegionMapPage = () => {
//   const { id } = useParams();

//   const [errorLoadYmaps, setErrorLoadYmaps] = useState(false);
//   const [ymapsLoading, setYmapsLoading] = useState(true);
//   const [dateRange, setDateRange] = useState(null);
//   const [dateQuery, setDateQuery] = useState([dayjs().subtract(1, 'month'), dayjs()]);

//   const from = timeToDateConverter(dateQuery[0].toDate());
//   const to = timeToDateConverter(dateQuery[1].toDate());

//   // Используем наш новый хук для получения данных конкретного региона
//   const { data: flightData, loading, error, refetch } = useGzipRegionFlightData(id, from, to);

//   const regionsPolygons = useRegions();

//   const {
//     filteredFlights,
//     dailyFlights,
//     peakHourlyFlightsData,
//     peakHourlyFlights,
//     flightsByRegion,
//     flightsDurationByRegion,
//     flightsByTimeOfDay,
//   } = useFlightData(flightData, dateRange);

//   const oneRegionData = regionsPolygons?.features?.find(
//     (obj) => String(obj.properties?.region_id) === String(id),
//   );
//   const regionCenter = oneRegionData?.properties?.center || [69, 100];

//   useEffect(() => {
//     let isMounted = true;

//     setYmapsLoading(true);
//     loadYmapsScript()
//       .then(() => {
//         if (isMounted) {
//           setErrorLoadYmaps(false);
//         }
//       })
//       .catch((error) => {
//         console.error('Ошибка загрузки Yandex Maps API:', error);
//         if (isMounted) {
//           setErrorLoadYmaps(true);
//         }
//       })
//       .finally(() => {
//         if (isMounted) {
//           setYmapsLoading(false);
//         }
//       });

//     return () => {
//       isMounted = false;
//     };
//   }, []);

//   if (loading || !flightData) {
//     return (
//       <div className="main">
//         <div className="btn-back-container">
//           <ButtonGoBack />
//           <div className="header-region">
//             <h1>Загрузка региона...</h1>
//           </div>
//         </div>

//         <div
//           style={{
//             height: '600px',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//           }}
//         >
//           Загрузка данных...
//         </div>
//       </div>
//     );
//   }

//   if (!regionsPolygons) {
//     return (
//       <div className="main">
//         <div className="btn-back-container">
//           <ButtonGoBack />
//           <div className="header-region">
//             <h1>Загрузка карты...</h1>
//           </div>
//         </div>

//         <div
//           style={{
//             height: '600px',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//           }}
//         >
//           Загрузка геоданных...
//         </div>
//       </div>
//     );
//   }

//   if (!oneRegionData) {
//     return (
//       <div className="main">
//         <div className="btn-back-container">
//           <ButtonGoBack />
//           <div className="header-region">
//             <h1>Регион не найден</h1>
//           </div>
//         </div>

//         <div
//           style={{
//             height: '600px',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//           }}
//         >
//           Регион с ID {id} не найден.
//         </div>
//       </div>
//     );
//   }

//   if (ymapsLoading) {
//     return (
//       <div className="main">
//         <div className="btn-back-container">
//           <ButtonGoBack />
//           <div className="header-region">
//             <h1>{oneRegionData?.properties?.region || 'Регион России'}</h1>
//           </div>
//         </div>
//         <div
//           style={{
//             height: '600px',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//           }}
//         >
//           Загрузка Яндекс.Карт...
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="main">
//         <div className="btn-back-container">
//           <ButtonGoBack />
//           <div className="header-region">
//             <h1>{oneRegionData?.properties?.region || 'Регион России'}</h1>
//           </div>
//         </div>
//         <div
//           style={{
//             height: '600px',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//           }}
//         >
//           {`Ошибка: ${error}`}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="main">
//       <div className="btn-back-container">
//         <ButtonGoBack />
//         <div className="header-region">
//           <h1>{oneRegionData?.properties?.region || 'Регион России'}</h1>
//         </div>
//       </div>

//       <MapComponent
//         regionsData={oneRegionData}
//         points={filteredFlights}
//         errorLoadYmaps={errorLoadYmaps}
//         center={regionCenter}
//         zoom={6}
//       />
//       <DateRangePicker dateRange={dateQuery} setDateRange={setDateQuery} />

//       <FlightStatisticsOneReg
//         dailyFlights={dailyFlights}
//         flightsData={flightData}
//         onDateRangeChange={setDateRange}
//         peakHourlyFlights={peakHourlyFlights}
//         flightsByTimeOfDay={flightsByTimeOfDay}
//         dateRange={dateRange}
//         peakHourlyFlightsData={peakHourlyFlightsData}
//       />
//     </div>
//   );
// };

// export default OneRegionMapPage;

// import dayjs from 'dayjs';

// import { useEffect, useState } from 'react';

// import { useParams } from 'react-router';

// import ButtonGoBack from '../components/ButtonGoBack';
// import FlightStatisticsOneReg from '../components/FlightStatisticsOneReg';
// import { useData } from '../hooks/useData';
// import { useFlightData } from '../hooks/useFlightData';
// import { useRegions } from '../hooks/useRegions';
// import MapComponent from '../modules/MapComponent';
// import { timeToDateConverter } from '../utils/functions';
// import { loadYmapsScript } from '../utils/loadYmaps';
// import { useRegionById } from '../utils/queries';
// import { usePolygonsData } from '../utils/queries';
// import DateRangePicker from './DatePicker/DatePicker';

// const OneRegionMapPage = () => {
//   const { id } = useParams();

//   const [errorLoadYmaps, setErrorLoadYmaps] = useState(false);
//   const [ymapsLoading, setYmapsLoading] = useState(true);
//   const { data: flightData, loading, error } = useData();
//   const regionsPolygons = useRegions();
//   // const { polygons: regionsPolygons } = usePolygonsData(); // @TODO

//   const [dateRange, setDateRange] = useState(null);

//   const [dateQuery, setDateQuery] = useState([dayjs().subtract(1, 'month'), dayjs()]);
//   const from = timeToDateConverter(dateQuery[0].toDate());
//   const to = timeToDateConverter(dateQuery[1].toDate());

//   // const {
//   //   data: region, // flightData flightData @TODO
//   //   isLoading: isRegionLoading,
//   //   error: regionError,
//   // } = useRegionById(id, from, to);
//   // console.log('test regionId data >', region);

//   const {
//     filteredFlights,
//     dailyFlights,
//     peakHourlyFlightsData,
//     peakHourlyFlights,
//     flightsByRegion,
//     flightsDurationByRegion,
//     flightsByTimeOfDay,
//     // setDateRange,
//   } = useFlightData(flightData, dateRange);
//   // console.log('filteredFlights OneRegionMapPage ', filteredFlights);
//   // } = useFlightData(flightData, dateRange);
//   const oneRegionData = regionsPolygons?.features?.find(
//     (obj) => String(obj.properties?.region_id) === String(id),
//   );
//   const regionCenter = oneRegionData?.properties?.center || [69, 100];

//   useEffect(() => {
//     let isMounted = true;

//     setYmapsLoading(true);
//     loadYmapsScript()
//       .then(() => {
//         if (isMounted) {
//           setErrorLoadYmaps(false);
//         }
//       })
//       .catch((error) => {
//         console.error('Ошибка загрузки Yandex Maps API:', error);
//         if (isMounted) {
//           setErrorLoadYmaps(true);
//         }
//       })
//       .finally(() => {
//         if (isMounted) {
//           setYmapsLoading(false);
//         }
//       });

//     return () => {
//       isMounted = false;
//     };
//   }, []);

//   if (loading || !flightData) {
//     return (
//       <div className="main">
//         <div className="btn-back-container">
//           <ButtonGoBack />
//           <div className="header-region">
//             <h1>Загрузка региона...</h1>
//           </div>
//         </div>

//         <div
//           style={{
//             height: '600px',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//           }}
//         >
//           Загрузка данных...
//         </div>
//       </div>
//     );
//   }

//   if (!regionsPolygons) {
//     return (
//       <div className="main">
//         <div className="btn-back-container">
//           <ButtonGoBack />
//           <div className="header-region">
//             <h1>Загрузка карты...</h1>
//           </div>
//         </div>

//         <div
//           style={{
//             height: '600px',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//           }}
//         >
//           Загрузка геоданных...
//         </div>
//       </div>
//     );
//   }

//   if (!oneRegionData) {
//     return (
//       <div className="main">
//         <div className="btn-back-container">
//           <ButtonGoBack />
//           <div className="header-region">
//             <h1>Регион не найден</h1>
//           </div>
//         </div>

//         <div
//           style={{
//             height: '600px',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//           }}
//         >
//           Регион с ID {id} не найден.
//         </div>
//       </div>
//     );
//   }

//   if (ymapsLoading) {
//     return (
//       <div className="main">
//         <div className="btn-back-container">
//           <ButtonGoBack />
//           <div className="header-region">
//             <h1>{oneRegionData?.properties?.region || 'Регион России'}</h1>
//           </div>
//         </div>
//         <div
//           style={{
//             height: '600px',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//           }}
//         >
//           Загрузка Яндекс.Карт...
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="main">
//         <div className="btn-back-container">
//           <ButtonGoBack />
//           <div className="header-region">
//             <h1>{oneRegionData?.properties?.region || 'Регион России'}</h1>
//           </div>
//         </div>
//         <div
//           style={{
//             height: '600px',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//           }}
//         >
//           {`Ошибка: ${error}`}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="main">
//       <div className="btn-back-container">
//         <ButtonGoBack />
//         <div className="header-region">
//           <h1>{oneRegionData?.properties?.region || 'Регион России'}</h1>
//         </div>
//       </div>

//       <MapComponent
//         regionsData={oneRegionData}
//         points={filteredFlights}
//         errorLoadYmaps={errorLoadYmaps}
//         center={regionCenter}
//         zoom={6}
//       />
//       <DateRangePicker dateRange={dateQuery} setDateRange={setDateQuery} />

//       <FlightStatisticsOneReg
//         dailyFlights={dailyFlights}
//         flightsData={flightData}
//         onDateRangeChange={setDateRange}
//         peakHourlyFlights={peakHourlyFlights}
//         flightsByTimeOfDay={flightsByTimeOfDay}
//         dateRange={dateRange}
//       />
//     </div>
//   );
// };

// export default OneRegionMapPage;
/*

// src/pages/OneRegionMapPage.jsx
import { useEffect, useState } from 'react';

import { useParams } from 'react-router-dom';

import FallBackMap from '../components/FallBackMap/FallBackMap';
import { useData } from '../hooks/useData';
import { useFlightDataFallBack } from '../hooks/useFlightDataFallBack';
import { useMapData } from '../hooks/useMapData';
import { swapMapDataCoordinates } from '../utils/swapMapDataCoordinates';

const OneRegionMapPage = () => {
  const { id } = useParams();
  const { data: flightData, loading, error } = useData();
  const { mapData, loading: mapLoading } = useMapData();
  const { filteredFlights, flightsByRegion } = useFlightDataFallBack(flightData);
  const [selectedRegion, setSelectedRegion] = useState(null);

  useEffect(() => {
    if (flightData && mapData) {
      const swappedMapData = swapMapDataCoordinates(mapData);
      const foundFeature = swappedMapData.features.find(
        (feature) =>
          feature.properties?.region_id === parseInt(id, 10) ||
          feature.properties?.region === parseInt(id, 10),
      );

      if (foundFeature) {
        setSelectedRegion(foundFeature.properties);
      }
    }
  }, [flightData, mapData, id]);

  if (loading || mapLoading) {
    return (
      <div className="main">
        <h1>Карта России</h1>
        <div
          style={{
            height: '600px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          Загрузка данных...
        </div>
      </div>
    );
  }

  if (!flightData || !mapData || !selectedRegion) {
    return (
      <div className="main">
        <h1>Карта России</h1>
        <div
          style={{
            height: '600px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          Нет данных для отображения
        </div>
      </div>
    );
  }

  return (
    <div className="main">
      <h1>Карта России</h1>
      <FallBackMap geoData={mapData} flightsData={flightData} selectedRegion={selectedRegion} />
    </div>
  );
};

export default OneRegionMapPage;

*/

// import { useNavigate, useParams } from 'react-router-dom'
// import ReactMarkdown from 'react-markdown'
// import { useSelector } from 'react-redux'
// import { toast, ToastContainer } from 'react-toastify'
// import { useCallback } from 'react'

// import ROUTES from '@/services/routes'
// import {
//   useGetArticleBySlugQuery,
//   useDeleteArticleMutation,
// } from '@/redux/articleApi'
// import Item from '@/components/Item'

// function OneArticlePage() {
//   const { slug } = useParams()
//   const navigate = useNavigate()
//   const token = useSelector((state) => state.user.token)
//   const username = useSelector((state) => state.user.username)
//   const { data = {}, isLoading, isError } = useGetArticleBySlugQuery(slug)
//   const [deleteArticle] = useDeleteArticleMutation()

//   const handleArticleDelete = useCallback(
//     async (slugData) => {
//       try {
//         await deleteArticle(slugData).unwrap()
//         toast.success('Article updated successfully!')
//         navigate(ROUTES.ARTICLES, { replace: true })
//       } catch (err) {
//         if (err.data?.errors) {
//           const { error, message } = err.data.errors
//           toast.error(`${error.name || 'Error'}: ${message}`)
//         } else {
//           toast.error('An unknown error occurred')
//         }
//       }
//     },
//     [navigate, deleteArticle],
//   )

//   if (isLoading) {
//     return <h1 className="text-center">Loading...</h1>
//   }
//   if (isError) {
//     return <h1 className="text-center">Error Loading!</h1>
//   }
//   if (!data?.article) return <h1 className="text-center">Article not found</h1>

//   const { article } = data
//   const isSameUser = article.author.username === username

//   return (
//     <div className="mb-6 block">
//       <div className="mb-20 bg-white shadow">
//         <Item
//           item={article}
//           isAuth={!!token}
//           isSameUser={isSameUser}
//           onDelete={handleArticleDelete}
//         />

//         <div className="bg-white p-4 sm:p-5">
//           {article.body ? (
//             <ReactMarkdown
//               class="prose max-w-none"
//               disallowedElements={['script', 'iframe', 'object', 'embed']}
//             >
//               {article.body}
//             </ReactMarkdown>
//           ) : (
//             <p>No content available</p>
//           )}
//         </div>
//       </div>
//       <ToastContainer
//         position="bottom-right"
//         autoClose={5000}
//         hideProgressBar={false}
//         newestOnTop={false}
//         closeOnClick
//         rtl={false}
//         pauseOnFocusLoss
//         draggable={false}
//         pauseOnHover
//         theme="light"
//       />
//     </div>
//   )
// }

// export default OneArticlePage
