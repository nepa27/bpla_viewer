import { useEffect, useState } from 'react';

import { useParams } from 'react-router';

import FlightStatisticsOneReg from '../components/FlightStatisticsOneReg';
import { useData } from '../hooks/useData';
import { useFlightData } from '../hooks/useFlightData';
import { useRegions } from '../hooks/useRegions';
import MapComponent from '../modules/MapComponent';
import { loadYmapsScript } from '../utils/loadYmaps';

const OneRegionMapPage = () => {
  const { id } = useParams();

  const [errorLoadYmaps, setErrorLoadYmaps] = useState(false);
  const [ymapsLoading, setYmapsLoading] = useState(true);
  const { data: flightData, loading, error } = useData();
  const regionsPolygons = useRegions(); // Это может быть null/undefined до загрузки

  const { filteredFlights, dailyFlights, flightsByRegion, flightsDurationByRegion, setDateRange } =
    useFlightData(flightData);

  // Найдите регион ТОЛЬКО когда regionsPolygons станет доступен
  const oneRegionData = regionsPolygons?.features?.find(
    (obj) => String(obj.properties?.region_id) === String(id)
  );

  // Вычислите центр региона ТОЛЬКО если он найден
  const regionCenter = oneRegionData?.properties?.center || [69, 100]; // Центр России по умолчанию

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

  // Проверка загрузки общих данных
  if (loading || !flightData) {
    return (
      <div className="main">
        <h1>Загрузка региона...</h1>
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

  // Проверка загрузки геоданных регионов
  if (!regionsPolygons) {
    return (
      <div className="main">
        <h1>Загрузка карты...</h1>
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

  // Проверка, найден ли регион по ID
  if (!oneRegionData) {
    return (
      <div className="main">
        <h1>Регион не найден</h1>
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

  // Оптимизированное условие загрузки Яндекс.Карт
  if (ymapsLoading) {
    return (
      <div className="main">
        <h1>{oneRegionData?.properties?.region || 'Регион России'}</h1>
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

  // // Проверка ошибки загрузки Яндекс.Карт
  // if (errorLoadYmaps) {
  //   return (
  //     <div className="main">
  //       <h1>{oneRegionData?.properties?.region || 'Регион России'}</h1>
  //       <div
  //         style={{
  //           height: '600px',
  //           display: 'flex',
  //           alignItems: 'center',
  //           justifyContent: 'center',
  //         }}
  //       >
  //         Ошибка загрузки Яндекс.Карт
  //       </div>
  //     </div>
  //   );
  // }

  // Проверка ошибки загрузки данных полетов
  if (error) {
    return (
      <div className="main">
        <h1>{oneRegionData?.properties?.region || 'Регион России'}</h1>
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
      <h1>{oneRegionData?.properties?.region || 'Регион России'}</h1>
      <MapComponent
        regionsData={oneRegionData}
        points={filteredFlights}
        errorLoadYmaps={errorLoadYmaps}
        center={regionCenter} // Передаем центр региона
        zoom={6} // Увеличим масштаб для одного региона
      />
      <FlightStatisticsOneReg dailyFlights={dailyFlights} onDateRangeChange={setDateRange} />
    </div>
  );
};

export default OneRegionMapPage;
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
