import React, { useState, useEffect, useRef } from 'react';
import { 
  Sun, SunDim, SunMedium, Sunrise, Sunset, CloudSun, Flame, Sparkles, Target, Aperture,
  Moon, MoonStar, CloudMoon, Star, StarHalf, Circle, Disc, Shield, Hexagon,
  Cloud, Wind, AlignJustify, AlignLeft, Menu, MoreHorizontal, GripHorizontal,
  CloudFog, Waves, Tornado, 
  CloudRain, CloudDrizzle, Droplet, Droplets, Umbrella, CloudRainWind, CloudHail, ArrowDown, GlassWater,
  Snowflake, CloudSnow, Asterisk, MountainSnow, Diamond, Thermometer,
  CloudLightning, Zap, ZapOff, Activity, Signal, Radio, Wifi, Flashlight, Triangle,
  Home, Map, Glasses, Settings, User, Bell, Globe, Palette, ChevronLeft, CheckCircle2, Battery, 
  Gauge, ArrowUp, Loader2, Search
} from 'lucide-react';

// Integrated CampusMap Component using CDN Leaflet to avoid module resolution errors
function CampusMap({ userLocation, campusLocation, currentCity, t, isRTL }) {
  const [mapError, setMapError] = useState(false);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const userMarker = useRef(null);
  const campusMarker = useRef(null);
  
  const defaultCenter = userLocation || campusLocation;
  const defaultZoom = userLocation ? 15 : 13;

  // Dynamically load Leaflet CSS and JS
  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
    if (!document.getElementById('leaflet-js')) {
      const script = document.createElement('script');
      script.id = 'leaflet-js';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => setLeafletLoaded(true);
      document.head.appendChild(script);
    } else {
      if (window.L) setLeafletLoaded(true);
      else document.getElementById('leaflet-js').addEventListener('load', () => setLeafletLoaded(true));
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Initialize and update map
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current || !defaultCenter) return;

    if (!mapInstance.current) {
      try {
        mapInstance.current = window.L.map(mapRef.current).setView([defaultCenter.lat, defaultCenter.lng], defaultZoom);
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(mapInstance.current);

        // Fix for default marker icons missing in CDN setup
        delete window.L.Icon.Default.prototype._getIconUrl;
        window.L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });
      } catch (e) {
        setMapError(true);
        return;
      }
    } else {
      mapInstance.current.setView([defaultCenter.lat, defaultCenter.lng], defaultZoom);
    }

    // Update user marker with translated popups and RTL support
    if (userLocation?.lat) {
      if (!userMarker.current) {
        userMarker.current = window.L.marker([userLocation.lat, userLocation.lng]).addTo(mapInstance.current)
          .bindPopup(`<div dir="${isRTL ? 'rtl' : 'ltr'}" style="text-align: ${isRTL ? 'right' : 'left'}"><b>${t.mapYourLocation}</b><br/>${t.mapYouAreHere}</div>`);
      } else {
        userMarker.current.setLatLng([userLocation.lat, userLocation.lng])
          .bindPopup(`<div dir="${isRTL ? 'rtl' : 'ltr'}" style="text-align: ${isRTL ? 'right' : 'left'}"><b>${t.mapYourLocation}</b><br/>${t.mapYouAreHere}</div>`);
      }
    }

    // Update campus marker
    if (campusLocation?.lat) {
      if (!campusMarker.current) {
        campusMarker.current = window.L.marker([campusLocation.lat, campusLocation.lng]).addTo(mapInstance.current)
          .bindPopup(`<div dir="${isRTL ? 'rtl' : 'ltr'}" style="text-align: ${isRTL ? 'right' : 'left'}"><b>${currentCity?.uni || 'University'}</b><br/>${currentCity?.campus || 'Campus'}</div>`);
      } else {
        campusMarker.current.setLatLng([campusLocation.lat, campusLocation.lng])
          .bindPopup(`<div dir="${isRTL ? 'rtl' : 'ltr'}" style="text-align: ${isRTL ? 'right' : 'left'}"><b>${currentCity?.uni || 'University'}</b><br/>${currentCity?.campus || 'Campus'}</div>`);
      }
    }
  }, [leafletLoaded, defaultCenter?.lat, defaultCenter?.lng, userLocation, campusLocation, currentCity, defaultZoom, t, isRTL]);

  if (!defaultCenter || !defaultCenter.lat || !defaultCenter.lng) {
    return (
      <div className="bg-red-500/20 rounded-2xl p-8 text-center">
        <p className="text-white">Unable to load map: Invalid coordinates</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-lg z-0">
      {!mapError ? (
        <div ref={mapRef} style={{ height: '100%', width: '100%' }} className="z-0" />
      ) : (
        <div className="bg-red-500/20 rounded-2xl p-8 text-center h-full flex items-center justify-center">
          <div>
            <p className="text-white mb-2">{t.mapFailLoad}</p>
            <button 
              onClick={() => { setMapError(false); setLeafletLoaded(false); setTimeout(() => setLeafletLoaded(true), 100); }}
              className="text-xs bg-white/20 px-3 py-1 rounded-full"
            >
              {t.mapRetry}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const sunIconMap = { Sun, SunDim, SunMedium, Sunrise, Sunset, CloudSun, Flame, Sparkles, Target, Aperture };
const moonIconMap = { Moon, MoonStar, CloudMoon, Star, StarHalf, Sparkles, Circle, Disc, Shield, Hexagon };
const cloudyIconMap = { Cloud, CloudSun, CloudMoon, CloudRain, CloudSnow, CloudLightning, CloudFog, CloudDrizzle, Wind, CloudHail };
const fogIconMap = { CloudFog, Waves, Wind, Tornado, Cloud, AlignJustify, AlignLeft, Menu, MoreHorizontal, GripHorizontal };
const rainIconMap = { CloudRain, CloudDrizzle, Droplet, Droplets, Umbrella, CloudRainWind, CloudHail, Waves, ArrowDown, GlassWater };
const snowIconMap = { Snowflake, CloudSnow, Asterisk, MountainSnow, Hexagon, Diamond, CloudHail, Sparkles, Wind, Thermometer };
const thunderIconMap = { CloudLightning, Zap, ZapOff, Activity, Signal, Radio, Wifi, Flashlight, Triangle, Flame };

const UK_UNIVERSITIES = [
  { city: "London", uni: "Queen Mary University", campus: "Main Campus", lat: 51.5230, lon: -0.0402 },
  { city: "Oxford", uni: "University of Oxford", campus: "Central Campus", lat: 51.7548, lon: -1.2544 },
  { city: "Cambridge", uni: "University of Cambridge", campus: "Central Campus", lat: 52.2053, lon: 0.1192 },
  { city: "Manchester", uni: "University of Manchester", campus: "Oxford Road", lat: 53.4668, lon: -2.2339 },
  { city: "Edinburgh", uni: "University of Edinburgh", campus: "Central Area", lat: 55.9445, lon: -3.1892 },
  { city: "Bristol", uni: "University of Bristol", campus: "Clifton Campus", lat: 51.4585, lon: -2.6021 },
  { city: "Glasgow", uni: "University of Glasgow", campus: "Gilmorehill", lat: 55.8724, lon: -4.2900 },
  { city: "Leeds", uni: "University of Leeds", campus: "Woodhouse", lat: 53.8067, lon: -1.5550 },
  { city: "Nottingham", uni: "University of Nottingham", campus: "University Park", lat: 52.9381, lon: -1.1973 },
  { city: "Cardiff", uni: "Cardiff University", campus: "Cathays Park", lat: 51.4883, lon: -3.1769 },
  { city: "London", uni: "University College London (UCL)", campus: "Bloomsbury", lat: 51.5246, lon: -0.1340 },
  { city: "London", uni: "Imperial College London", campus: "South Kensington", lat: 51.4988, lon: -0.1749 },
  { city: "London", uni: "King's College London", campus: "Strand Campus", lat: 51.5115, lon: -0.1160 },
  { city: "London", uni: "London School of Economics (LSE)", campus: "Houghton Street", lat: 51.5144, lon: -0.1165 },
  { city: "Coventry", uni: "University of Warwick", campus: "Main Campus", lat: 52.3793, lon: -1.5615 },
  { city: "Birmingham", uni: "University of Birmingham", campus: "Edgbaston", lat: 52.4508, lon: -1.9305 },
  { city: "Sheffield", uni: "University of Sheffield", campus: "Western Bank", lat: 53.3814, lon: -1.4884 },
  { city: "Southampton", uni: "University of Southampton", campus: "Highfield Campus", lat: 50.9346, lon: -1.3960 },
  { city: "St Andrews", uni: "University of St Andrews", campus: "Central Campus", lat: 56.3398, lon: -2.7967 },
  { city: "Durham", uni: "Durham University", campus: "City Campus", lat: 54.7650, lon: -1.5782 },
  { city: "Newcastle", uni: "Newcastle University", campus: "City Campus", lat: 54.9790, lon: -1.6132 },
  { city: "York", uni: "University of York", campus: "Heslington Campus", lat: 53.9481, lon: -1.0524 },
  { city: "Exeter", uni: "University of Exeter", campus: "Streatham Campus", lat: 50.7371, lon: -3.5351 },
  { city: "Bath", uni: "University of Bath", campus: "Claverton Down", lat: 51.3782, lon: -2.3264 },
  { city: "Lancaster", uni: "Lancaster University", campus: "Bailrigg", lat: 54.0104, lon: -2.7877 },
  { city: "Loughborough", uni: "Loughborough University", campus: "Epinal Way", lat: 52.7650, lon: -1.2321 },
  { city: "Guildford", uni: "University of Surrey", campus: "Stag Hill", lat: 51.2435, lon: -0.5916 },
  { city: "Brighton", uni: "University of Sussex", campus: "Falmer", lat: 50.8679, lon: -0.0875 },
  { city: "Liverpool", uni: "University of Liverpool", campus: "City Campus", lat: 53.4065, lon: -2.9644 },
  { city: "Leicester", uni: "University of Leicester", campus: "University Road", lat: 52.6214, lon: -1.1245 },
  { city: "Aberdeen", uni: "University of Aberdeen", campus: "King's College", lat: 57.1648, lon: -2.1017 },
  { city: "Dundee", uni: "University of Dundee", campus: "City Campus", lat: 56.4583, lon: -2.9822 },
  { city: "Belfast", uni: "Queen's University Belfast", campus: "Main Campus", lat: 54.5843, lon: -5.9340 },
  { city: "Coleraine", uni: "Ulster University", campus: "Coleraine Campus", lat: 55.1666, lon: -6.6713 },
  { city: "Swansea", uni: "Swansea University", campus: "Singleton Park", lat: 51.6096, lon: -3.9806 },
  { city: "Aberystwyth", uni: "Aberystwyth University", campus: "Penglais", lat: 52.4155, lon: -4.0630 },
  { city: "Reading", uni: "University of Reading", campus: "Whiteknights", lat: 51.4414, lon: -0.9418 },
  { city: "Canterbury", uni: "University of Kent", campus: "Giles Lane", lat: 51.2965, lon: 1.0691 },
  { city: "Norwich", uni: "University of East Anglia (UEA)", campus: "Norwich Research Park", lat: 52.6219, lon: 1.2386 },
  { city: "Colchester", uni: "University of Essex", campus: "Wivenhoe Park", lat: 51.8784, lon: 0.9490 },
  { city: "Newcastle-under-Lyme", uni: "Keele University", campus: "Keele Campus", lat: 53.0033, lon: -2.2699 },
  { city: "Hull", uni: "University of Hull", campus: "Cottingham Road", lat: 53.7719, lon: -0.3665 },
  { city: "Plymouth", uni: "University of Plymouth", campus: "City Centre", lat: 50.3755, lon: -4.1385 },
  { city: "Portsmouth", uni: "University of Portsmouth", campus: "City Campus", lat: 50.7963, lon: -1.0960 },
  { city: "Birmingham", uni: "Aston University", campus: "Aston Triangle", lat: 52.4868, lon: -1.8882 },
  { city: "Bournemouth", uni: "Bournemouth University", campus: "Talbot Campus", lat: 50.7428, lon: -1.8973 },
  { city: "Lincoln", uni: "University of Lincoln", campus: "Brayford Pool", lat: 53.2285, lon: -0.5478 },
  { city: "Bradford", uni: "University of Bradford", campus: "City Campus", lat: 53.7915, lon: -1.7641 },
  { city: "London", uni: "Brunel University London", campus: "Uxbridge", lat: 51.5328, lon: -0.4734 },
  { city: "London", uni: "City, University of London", campus: "Northampton Square", lat: 51.5278, lon: -0.1025 },
  { city: "London", uni: "Goldsmiths, University of London", campus: "New Cross", lat: 51.4743, lon: -0.0354 },
  { city: "Egham", uni: "Royal Holloway, University of London", campus: "Main Campus", lat: 51.4256, lon: -0.5630 },
  { city: "London", uni: "University of Roehampton", campus: "Roehampton Lane", lat: 51.4550, lon: -0.2443 },
  { city: "London", uni: "University of Westminster", campus: "Regent Campus", lat: 51.5173, lon: -0.1415 },
  { city: "London", uni: "London South Bank University", campus: "Southwark Campus", lat: 51.4984, lon: -0.1013 },
  { city: "London", uni: "Middlesex University", campus: "Hendon Campus", lat: 51.5898, lon: -0.2286 },
  { city: "London", uni: "University of the Arts London", campus: "High Holborn", lat: 51.5176, lon: -0.1197 },
  { city: "Cranfield", uni: "Cranfield University", campus: "Main Campus", lat: 52.0736, lon: -0.6276 },
  { city: "Leicester", uni: "De Montfort University", campus: "City Campus", lat: 52.6288, lon: -1.1396 },
  { city: "Stirling", uni: "University of Stirling", campus: "Main Campus", lat: 56.1465, lon: -3.9202 },
  { city: "Glasgow", uni: "University of Strathclyde", campus: "John Anderson Campus", lat: 55.8624, lon: -4.2425 },
  { city: "Edinburgh", uni: "Heriot-Watt University", campus: "Riccarton", lat: 55.9123, lon: -3.3211 },
  { city: "Edinburgh", uni: "Edinburgh Napier University", campus: "Craiglockhart", lat: 55.9186, lon: -3.2384 },
  { city: "Aberdeen", uni: "Robert Gordon University", campus: "Garthdee", lat: 57.1190, lon: -2.1350 },
  { city: "Glasgow", uni: "Glasgow Caledonian University", campus: "Cowcaddens Road", lat: 55.8669, lon: -4.2502 },
  { city: "Winchester", uni: "University of Winchester", campus: "Sparkford Road", lat: 51.0583, lon: -1.3283 },
  { city: "Chichester", uni: "University of Chichester", campus: "Bishop Otter Campus", lat: 50.8447, lon: -0.7788 },
  { city: "Brighton", uni: "University of Brighton", campus: "Moulsecoomb", lat: 50.8406, lon: -0.1179 },
  { city: "Salford", uni: "University of Salford", campus: "Peel Park", lat: 53.4869, lon: -2.2741 },
  { city: "Manchester", uni: "Manchester Metropolitan University", campus: "All Saints", lat: 53.4707, lon: -2.2393 },
  { city: "Sheffield", uni: "Sheffield Hallam University", campus: "City Campus", lat: 53.3792, lon: -1.4651 },
  { city: "Leeds", uni: "Leeds Beckett University", campus: "City Campus", lat: 53.8052, lon: -1.5475 },
  { city: "Nottingham", uni: "Nottingham Trent University", campus: "City Campus", lat: 52.9582, lon: -1.1517 },
  { city: "Derby", uni: "University of Derby", campus: "Kedleston Road", lat: 52.9365, lon: -1.4962 },
  { city: "Stoke-on-Trent", uni: "Staffordshire University", campus: "College Road", lat: 53.0101, lon: -2.1764 },
  { city: "Wolverhampton", uni: "University of Wolverhampton", campus: "City Campus", lat: 52.5888, lon: -2.1264 },
  { city: "Coventry", uni: "Coventry University", campus: "City Campus", lat: 52.4069, lon: -1.5033 },
  { city: "Cambridge", uni: "Anglia Ruskin University", campus: "East Road", lat: 52.2033, lon: 0.1332 },
  { city: "Luton", uni: "University of Bedfordshire", campus: "University Square", lat: 51.8785, lon: -0.4101 },
  { city: "Hatfield", uni: "University of Hertfordshire", campus: "College Lane", lat: 51.7523, lon: -0.2429 },
  { city: "Northampton", uni: "University of Northampton", campus: "Waterside Campus", lat: 52.2333, lon: -0.8872 },
  { city: "Oxford", uni: "Oxford Brookes University", campus: "Headington Campus", lat: 51.7535, lon: -1.2266 },
  { city: "Buckingham", uni: "University of Buckingham", campus: "Hunter Street", lat: 51.9961, lon: -0.9880 },
  { city: "Cheltenham", uni: "University of Gloucestershire", campus: "Park Campus", lat: 51.8888, lon: -2.0837 },
  { city: "Bath", uni: "Bath Spa University", campus: "Newton Park", lat: 51.3732, lon: -2.4395 },
  { city: "Bristol", uni: "University of the West of England (UWE)", campus: "Frenchay Campus", lat: 51.5002, lon: -2.5484 },
  { city: "Pontypridd", uni: "University of South Wales", campus: "Treforest Campus", lat: 51.5937, lon: -3.3260 },
  { city: "Bangor", uni: "Bangor University", campus: "Main Campus", lat: 53.2287, lon: -4.1293 },
  { city: "Wrexham", uni: "Wrexham Glyndŵr University", campus: "Plas Coch", lat: 53.0526, lon: -3.0041 },
  { city: "Carmarthen", uni: "University of Wales Trinity Saint David", campus: "Carmarthen Campus", lat: 51.8540, lon: -4.3168 },
  { city: "Ormskirk", uni: "Edge Hill University", campus: "Main Campus", lat: 53.5604, lon: -2.8732 },
  { city: "Preston", uni: "University of Central Lancashire (UCLan)", campus: "City Campus", lat: 53.7632, lon: -2.7044 },
  { city: "Chester", uni: "University of Chester", campus: "Parkgate Road", lat: 53.1979, lon: -2.8953 },
  { city: "Liverpool", uni: "Liverpool John Moores University", campus: "Mount Pleasant", lat: 53.4035, lon: -2.9691 },
  { city: "Liverpool", uni: "Liverpool Hope University", campus: "Hope Park", lat: 53.3917, lon: -2.8803 },
  { city: "Sunderland", uni: "University of Sunderland", campus: "City Campus", lat: 54.9048, lon: -1.3888 },
  { city: "Middlesbrough", uni: "Teesside University", campus: "City Campus", lat: 54.5724, lon: -1.2336 },
  { city: "Newcastle", uni: "Northumbria University", campus: "City Campus", lat: 54.9781, lon: -1.6067 },
  { city: "York", uni: "York St John University", campus: "Lord Mayor's Walk", lat: 53.9654, lon: -1.0792 }
];

export default function App() {
  const [weatherState, setWeatherState] = useState({ isDay: true, wmoCode: 0 });
  const [unit, setUnit] = useState('C'); 
  const [activePage, setActivePage] = useState('home');
  const [appTheme, setAppTheme] = useState('dynamic');
  
  const [appMode, setAppMode] = useState('simple'); 
  const [isBatterySave, setIsBatterySave] = useState(false); 
  const isComplex = appMode === 'complex';
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(UK_UNIVERSITIES[0]); 

  const [weatherData, setWeatherData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const [customColors, setCustomColors] = useState({
    bgDayClear: '#3B82F6', bgNightClear: '#0F3460',
    bgDayCloudy: '#60A5FA', bgNightCloudy: '#1E3A8A',
    bgDayFog: '#94A3B8', bgNightFog: '#334155',
    bgDayRain: '#475569', bgNightRain: '#0F172A',
    bgDaySnow: '#7DD3FC', bgNightSnow: '#1D4ED8',
    bgDayThunder: '#374151', bgNightThunder: '#000000',
    sun: '#FBBF24', moon: '#FDE047', rain: '#9CA3AF', 
    cloud: '#A1A1AA', fog: '#94A3B8', snow: '#BAE6FD', thunder: '#A78BFA',
    text: '#FFFFFF', navSelected: '#FBBF24' 
  });
  
  const [customSizes, setCustomSizes] = useState({
    flag: 1, temp: 1, weather: 1, text: 1, nav: 1, topTemp: 1, complexGrid: 1, complexForecast: 1
  });
  
  const [customIcons, setCustomIcons] = useState({
    sun: 'Sun', moon: 'Moon', cloudy: 'Cloud', fog: 'CloudFog', rain: 'CloudRain', snow: 'Snowflake', thunder: 'CloudLightning'
  });

  const [customFills, setCustomFills] = useState({
    sun: true, moon: true, cloudy: false, fog: false, rain: false, snow: false, thunder: false
  });

  const [primaryLang, setPrimaryLang] = useState('EN');
  const [secondaryLang, setSecondaryLang] = useState('ZH'); 
  const [activeLang, setActiveLang] = useState('EN');
  const [isViewingPrimary, setIsViewingPrimary] = useState(true); 

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setActiveLang(isViewingPrimary ? primaryLang : secondaryLang);
  }, [isViewingPrimary, primaryLang, secondaryLang]);

  useEffect(() => {
    if (navigator.geolocation) {
      setIsLoadingLocation(true);
      const options = {
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 60000
      };
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setIsLoadingLocation(false);
        },
        (error) => {
          let errorMessage = 'Unable to get your location';
          if (error.code === 1) {
            errorMessage = 'Location permission denied. Please allow location access.';
          } else if (error.code === 2) {
            errorMessage = 'Location unavailable. Check your device settings.';
          } else if (error.code === 3) {
            errorMessage = 'Location request timed out. Please try again.';
          } else {
            errorMessage = 'Location access is restricted in this environment.';
          }
          setLocationError(errorMessage);
          setIsLoadingLocation(false);
        },
        options
      );
    } else {
      setLocationError('Geolocation is not supported by your browser');
      setIsLoadingLocation(false);
    }
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      setIsLoading(true);
      try {
        const { lat, lon } = selectedLocation;
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,is_day,precipitation,wind_speed_10m,surface_pressure,weather_code&daily=sunrise,sunset,uv_index_max,temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&forecast_days=8`);
        const aqiRes = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=european_aqi`);
        
        if (!weatherRes.ok || !aqiRes.ok) throw new Error('Open-Meteo API Request Failed');
        
        const data = await weatherRes.json();
        const aqiData = await aqiRes.json();
        
        const current = data.current;
        const daily = data.daily;
        
        const formatTime = (isoString) => new Date(isoString).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

        const aqi = aqiData.current.european_aqi;
        let pollutionText = `${aqi} (Good)`;
        if (aqi > 20) pollutionText = `${aqi} (Fair)`;
        if (aqi > 40) pollutionText = `${aqi} (Moderate)`;
        if (aqi > 60) pollutionText = `${aqi} (Poor)`;
        if (aqi > 80) pollutionText = `${aqi} (Very Poor)`;

        const forecastArr = [];
        for (let i = 1; i <= 7; i++) {
            if (daily.time[i]) {
                forecastArr.push({
                    dateRaw: daily.time[i],
                    minTemp: daily.temperature_2m_min[i],
                    maxTemp: daily.temperature_2m_max[i],
                    weatherCode: daily.weather_code[i]
                });
            }
        }

        setWeatherData({
          temp: current.temperature_2m,
          humidity: `${current.relative_humidity_2m}%`,
          wind: `${current.wind_speed_10m} km/h`, 
          pressure: `${current.surface_pressure} hPa`,
          sunrise: daily.sunrise && daily.sunrise[0] ? formatTime(daily.sunrise[0]) : "--:--",
          sunset: daily.sunset && daily.sunset[0] ? formatTime(daily.sunset[0]) : "--:--",
          uv: daily.uv_index_max && daily.uv_index_max[0] !== null ? daily.uv_index_max[0].toString() : "0", 
          pollution: pollutionText,
          forecast: forecastArr
        });

        setWeatherState({ isDay: current.is_day === 1, wmoCode: current.weather_code });
        setApiError(null);

      } catch (error) {
        console.warn("Open-Meteo API Notice:", error.message);
        loadMockData("API Offline");
      } finally {
        setIsLoading(false);
      }
    };

    const loadMockData = (errMsg = "API Defaulted") => {
        setApiError(errMsg);
        setWeatherData({
          temp: 11, humidity: "68%", wind: "14.2 km/h", pressure: "1012 hPa",
          sunrise: "06:14 AM", sunset: "18:42 PM", uv: "4", pollution: "22 (Low)",
          forecast: [
            { dateRaw: "2026-03-27", minTemp: 5, maxTemp: 12, weatherCode: 3 },
            { dateRaw: "2026-03-28", minTemp: 7, maxTemp: 14, weatherCode: 61 },
            { dateRaw: "2026-03-29", minTemp: 2, maxTemp: 8, weatherCode: 71 },
            { dateRaw: "2026-03-30", minTemp: 10, maxTemp: 16, weatherCode: 0 },
            { dateRaw: "2026-03-31", minTemp: 9, maxTemp: 15, weatherCode: 95 },
            { dateRaw: "2026-04-01", minTemp: 8, maxTemp: 13, weatherCode: 45 },
            { dateRaw: "2026-04-02", minTemp: 11, maxTemp: 18, weatherCode: 0 }
          ]
        });
    };

    fetchWeather();
  }, [selectedLocation.lat, selectedLocation.lon]);

  const getDisplayTemperature = () => {
    if (!weatherData) return "--°";
    const temp = weatherData.temp;
    if (unit === 'C') return `${Math.round(temp)}°C`;
    if (unit === 'F') return `${Math.round(temp * 9/5 + 32)}°F`;
    if (unit === 'K') return `${Math.round(temp + 273.15)}K`;
  };

  const convertTemp = (val) => {
    if (unit === 'C') return Math.round(val);
    if (unit === 'F') return Math.round(val * 9/5 + 32);
    if (unit === 'K') return Math.round(val + 273.15);
  };

  const cycleWeather = () => {
    const states = [
      { isDay: true, wmoCode: 0 }, { isDay: false, wmoCode: 0 },       
      { isDay: true, wmoCode: 3 }, { isDay: false, wmoCode: 3 },       
      { isDay: true, wmoCode: 61 }, { isDay: false, wmoCode: 61 },     
      { isDay: true, wmoCode: 45 }, { isDay: false, wmoCode: 45 },     
      { isDay: true, wmoCode: 71 }, { isDay: false, wmoCode: 71 },     
      { isDay: true, wmoCode: 95 }, { isDay: false, wmoCode: 95 }      
    ];
    const currentIndex = states.findIndex(s => s.isDay === weatherState.isDay && s.wmoCode === weatherState.wmoCode);
    const nextIndex = (currentIndex + 1) % states.length;
    setWeatherState(states[nextIndex]);
  };

  const getThemeBackground = () => {
    if (isBatterySave) return 'bg-black'; 
    if (appTheme === 'custom') return ''; 
    const { wmoCode, isDay } = weatherState;

    switch(appTheme) {
      case 'midnight': return 'bg-slate-900';
      case 'sunset': return 'bg-gradient-to-br from-orange-500 to-purple-800';
      case 'qmul': return 'bg-blue-800'; 
      case 'forest': return 'bg-emerald-900';
      case 'protanopia': return 'bg-[#002B5B]'; 
      case 'deuteranopia': return 'bg-[#172B4D]'; 
      case 'tritanopia': return 'bg-[#212121]'; 
      case 'achromatopsia': return 'bg-[#18181b]'; 
      case 'colorful': 
        if (wmoCode === 0) return isDay ? 'bg-gradient-to-tr from-yellow-300 via-orange-400 to-pink-500' : 'bg-gradient-to-tr from-indigo-900 via-purple-900 to-black';
        if (wmoCode <= 3) return isDay ? 'bg-gradient-to-tr from-cyan-300 via-blue-400 to-indigo-400' : 'bg-gradient-to-tr from-slate-800 via-indigo-900 to-blue-900';
        if (wmoCode <= 48) return isDay ? 'bg-gradient-to-tr from-gray-300 via-slate-400 to-gray-500' : 'bg-gradient-to-tr from-gray-700 via-slate-800 to-black';
        if (wmoCode <= 69 || (wmoCode >= 80 && wmoCode <= 82)) return isDay ? 'bg-gradient-to-tr from-blue-600 via-indigo-700 to-slate-800' : 'bg-gradient-to-tr from-slate-900 via-blue-900 to-black';
        if (wmoCode <= 79 || wmoCode === 85 || wmoCode === 86) return isDay ? 'bg-gradient-to-tr from-blue-200 via-cyan-300 to-white' : 'bg-gradient-to-tr from-slate-700 via-blue-800 to-indigo-900';
        if (wmoCode >= 95) return isDay ? 'bg-gradient-to-tr from-purple-800 via-slate-900 to-black' : 'bg-gradient-to-tr from-fuchsia-900 via-purple-900 to-black';
        return isDay ? 'bg-gradient-to-tr from-yellow-300 via-orange-400 to-pink-500' : 'bg-gradient-to-tr from-indigo-900 via-purple-900 to-black';
      default: break;
    }
    
    if (wmoCode === 0) return isDay ? 'bg-[#3B82F6]' : 'bg-[#0F3460]'; 
    if (wmoCode <= 3) return isDay ? 'bg-[#60A5FA]' : 'bg-[#1E3A8A]'; 
    if (wmoCode <= 48) return isDay ? 'bg-[#94A3B8]' : 'bg-[#334155]'; 
    if (wmoCode <= 69 || (wmoCode >= 80 && wmoCode <= 82)) return isDay ? 'bg-[#475569]' : 'bg-[#0F172A]'; 
    if (wmoCode <= 79 || wmoCode === 85 || wmoCode === 86) return isDay ? 'bg-[#7DD3FC]' : 'bg-[#1D4ED8]'; 
    if (wmoCode >= 95) return isDay ? 'bg-[#374151]' : 'bg-[#000000]'; 
    return isDay ? 'bg-[#3B82F6]' : 'bg-[#0F3460]';
  };

  const getCustomBackgroundColor = () => {
    if (isBatterySave) return '#000000'; 
    if (appTheme !== 'custom') return undefined;
    const { wmoCode, isDay } = weatherState;
    if (wmoCode === 0) return isDay ? customColors.bgDayClear : customColors.bgNightClear;
    if (wmoCode <= 3) return isDay ? customColors.bgDayCloudy : customColors.bgNightCloudy;
    if (wmoCode <= 48) return isDay ? customColors.bgDayFog : customColors.bgNightFog;
    if (wmoCode <= 69 || (wmoCode >= 80 && wmoCode <= 82)) return isDay ? customColors.bgDayRain : customColors.bgNightRain;
    if (wmoCode <= 79 || wmoCode === 85 || wmoCode === 86) return isDay ? customColors.bgDaySnow : customColors.bgNightSnow;
    if (wmoCode >= 95) return isDay ? customColors.bgDayThunder : customColors.bgNightThunder;
    return isDay ? customColors.bgDayClear : customColors.bgNightClear;
  };

  function calculateDistance(point1, point2) {
    const R = 6371; 
    const lat1 = point1.lat * Math.PI / 180;
    const lat2 = point2.lat * Math.PI / 180;
    const deltaLat = (point2.lat - point1.lat) * Math.PI / 180;
    const deltaLng = (point2.lng - point1.lng) * Math.PI / 180;
    
    const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLng/2) * Math.sin(deltaLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    return (R * c).toFixed(2);
  }

  const text = {
    EN: { gearClearDay: "Gear: Sunglasses", gearClearNight: "Gear: Jacket", gearRain: "Gear: Umbrella", searchPlaceholder: "Search UK Campus...", optionsTitle: "Settings", langPrefTitle: "Languages", primaryLangLabel: "Primary Language", secondaryLangLabel: "Secondary Language", studentProfile: "Profile", manageId: "Manage ID", notifications: "Notifications", weatherAlerts: "Alerts", mapTitle: "Campus Map", mapComingSoon: "Map coming in Phase 2!", themeTitle: "Theme", themeDesc: "Customize appearance", themeDynamic: "Dynamic (Weather)", themeMidnight: "Midnight Dark", themeSunset: "Sunset Glow", themeQMUL: "QMUL Blue", themeForest: "Forest Green", themeProtanopia: "Protanopia (Red-Blind)", themeDeuteranopia: "Deuteranopia (Green-Blind)", themeTritanopia: "Tritanopia (Blue-Blind)", previewTitle: "Live Preview", themeCustom: "Custom Theme", bgClear: "Clear", bgCloudy: "Cloudy", bgFog: "Fog", bgRain: "Rain", bgSnow: "Snow", bgThunder: "Thunder", dayStr: "Day", nightStr: "Night", styleSun: "Sun Icon", styleMoon: "Moon Icon", styleCloudy: "Cloudy Icon", styleFog: "Fog Icon", styleRain: "Rain Icon", styleSnow: "Snow Icon", styleThunder: "Thunder Icon", tapToToggle: "Tap to cycle weather", bgColors: "Backgrounds", elementColors: "Elements", colorSun: "Sun", colorMoon: "Moon", colorRain: "Rain", colorCloud: "Cloud", colorFog: "Fog", colorSnow: "Snow", colorThunder: "Thunder", colorText: "Text", colorNavSelected: "Nav", modeTitle: "App Mode", modeSimple: "Simple Mode", modeComplex: "Complex Mode", modeBattery: "Battery Saver", humidity: "Humidity", wind: "Wind", uv: "UV Index", pollution: "Pollution", pressure: "Pressure", sunrise: "Sunrise", sunset: "Sunset", sizesTitle: "Sizes", sizeFlag: "Flag", sizeTemp: "Temp", sizeWeather: "Weather", sizeText: "Text", sizeNav: "Nav", sizeTopTemp: "Top Temp", forecastTitle: "7-Day Forecast", descClear: "Clear", descCloudy: "Cloudy", descFog: "Foggy", descRain: "Rain", descSnow: "Snow", descThunder: "Thunder", gearSnow: "Gear: Heavy Coat", gearThunder: "Gear: Indoors", simpleForecastTitle: "This Week", fillIcon: "Fill Icon", sizeComplexGrid: "Complex Grid", sizeForecast: "Forecast List", mapYourLocation: "Your Location", mapYouAreHere: "You are here!", mapCurrentUni: "Current University", mapLocAccessReq: "Location access required", mapDistanceTo: "Distance to", mapTip: "💡 Tip: Use the search bar on the home page to explore different UK universities. The map will update to show each campus location!", mapGettingLoc: "Getting your location...", mapFailLoad: "Failed to load map", mapRetry: "Retry", themeDisabledTitle: "Themes Disabled", themeDisabledDesc: "You are currently in Battery Saver mode. To customize your theme, please switch back to Simple or Complex Mode in the Settings menu.", backToSettings: "Go back to Settings", themeAchromatopsia: "Achromatopsia (B&W)", themeColorful: "Colorful", categoryDynamic: "Dynamic Themes", categoryMonotone: "Monotone Themes", categoryAccessibility: "Accessibility Themes", categoryCustom: "Custom Theme" },
    TH: { gearClearDay: "อุปกรณ์: แว่นกันแดด", gearClearNight: "อุปกรณ์: แจ็คเก็ต", gearRain: "อุปกรณ์: ร่ม", searchPlaceholder: "ค้นหาวิทยาเขต...", optionsTitle: "การตั้งค่า", langPrefTitle: "ภาษา", primaryLangLabel: "ภาษาหลัก", secondaryLangLabel: "ภาษารอง", studentProfile: "โปรไฟล์", manageId: "จัดการ ID", notifications: "การแจ้งเตือน", weatherAlerts: "เตือนสภาพอากาศ", mapTitle: "แผนที่", mapComingSoon: "มาในเฟส 2!", themeTitle: "ธีม", themeDesc: "ปรับแต่งแอป", themeDynamic: "ไดนามิก (ตามสภาพอากาศ)", themeMidnight: "มิดไนท์ดาร์ก", themeSunset: "แสงอาทิตย์ตก", themeQMUL: "สีฟ้า QMUL", themeForest: "สีเขียวป่า", themeProtanopia: "ตาบอดสีแดง (Protanopia)", themeDeuteranopia: "ตาบอดสีเขียว (Deuteranopia)", themeTritanopia: "ตาบอดสีน้ำเงิน (Tritanopia)", previewTitle: "แสดงตัวอย่างสด", themeCustom: "ธีมกำหนดเอง", bgClear: "แจ่มใส", bgCloudy: "มีเมฆ", bgFog: "มีหมอก", bgRain: "ฝนตก", bgSnow: "หิมะตก", bgThunder: "พายุฝนฟ้าคะนอง", dayStr: "กลางวัน", nightStr: "กลางคืน", styleSun: "ไอคอนพระอาทิตย์", styleMoon: "ไอคอนพระจันทร์", styleCloudy: "ไอคอนเมฆ", styleFog: "ไอคอนหมอก", styleRain: "ไอคอนฝน", styleSnow: "ไอคอนหิมะ", styleThunder: "ไอคอนพายุ", tapToToggle: "แตะเพื่อสลับ", bgColors: "พื้นหลัง", elementColors: "องค์ประกอบ", colorSun: "พระอาทิตย์", colorMoon: "พระจันทร์", colorRain: "ฝน", colorCloud: "เมฆ", colorFog: "หมอก", colorSnow: "หิมะ", colorThunder: "พายุ", colorText: "ข้อความ", colorNavSelected: "เมนู", modeTitle: "โหมด", modeSimple: "โหมดปกติ", modeComplex: "โหมดรายละเอียด", modeBattery: "ประหยัดแบต", humidity: "ความชื้น", wind: "ลม", uv: "ดัชนี UV", pollution: "มลพิษ", pressure: "ความกดอากาศ", sunrise: "พระอาทิตย์ขึ้น", sunset: "พระอาทิตย์ตก", sizesTitle: "ขนาด", sizeFlag: "ธง", sizeTemp: "อุณหภูมิ", sizeWeather: "ไอคอน", sizeText: "ข้อความ", sizeNav: "แถบนำทาง", sizeTopTemp: "อุณหภูมิด้านบน", forecastTitle: "พยากรณ์ 7 วัน", descClear: "แจ่มใส", descCloudy: "มีเมฆ", descFog: "มีหมอก", descRain: "ฝนตก", descSnow: "หิมะตก", descThunder: "พายุ", gearSnow: "อุปกรณ์: เสื้อกันหนาว", gearThunder: "อุปกรณ์: อยู่ในร่ม", simpleForecastTitle: "สัปดาห์นี้", fillIcon: "เติมสีไอคอน", sizeComplexGrid: "ขนาดกริด", sizeForecast: "ขนาดพยากรณ์", mapYourLocation: "ตำแหน่งของคุณ", mapYouAreHere: "คุณอยู่ที่นี่!", mapCurrentUni: "มหาวิทยาลัยปัจจุบัน", mapLocAccessReq: "ต้องเข้าถึงตำแหน่ง", mapDistanceTo: "ระยะทางถึง", mapTip: "💡 เคล็ดลับ: ใช้แถบค้นหาบนหน้าแรกเพื่อสำรวจมหาวิทยาลัยต่างๆ ในสหราชอาณาจักร แผนที่จะอัปเดตเพื่อแสดงตำแหน่งของแต่ละวิทยาเขต!", mapGettingLoc: "กำลังหาตำแหน่งของคุณ...", mapFailLoad: "โหลดแผนที่ล้มเหลว", mapRetry: "ลองอีกครั้ง", themeDisabledTitle: "ปิดใช้งานธีม", themeDisabledDesc: "คุณกำลังอยู่ในโหมดประหยัดแบตเตอรี่ หากต้องการปรับแต่งธีม โปรดสลับกลับเป็นโหมดปกติหรือโหมดรายละเอียดในการตั้งค่า", backToSettings: "กลับไปที่การตั้งค่า", themeAchromatopsia: "ตาบอดสีทั้งหมด (ขาวดำ)", themeColorful: "สีสันสดใส", categoryDynamic: "ธีมไดนามิก", categoryMonotone: "ธีมสีเดียว (Monotone)", categoryAccessibility: "ธีมเพื่อการเข้าถึง", categoryCustom: "ธีมกำหนดเอง" },
    ZH: { gearClearDay: "装备：太阳镜", gearClearNight: "装备：外套", gearRain: "装备：雨伞", searchPlaceholder: "搜索校园...", optionsTitle: "设置", langPrefTitle: "语言偏好", primaryLangLabel: "主要语言", secondaryLangLabel: "次要语言", studentProfile: "档案", manageId: "管理 ID", notifications: "通知", weatherAlerts: "天气警报", mapTitle: "校园地图", mapComingSoon: "第二阶段推出！", themeTitle: "主题", themeDesc: "自定义外观", themeDynamic: "动态 (天气)", themeMidnight: "午夜深黑", themeSunset: "日落晚霞", themeQMUL: "QMUL 蓝", themeForest: "森林绿", themeProtanopia: "红色盲 (Protanopia)", themeDeuteranopia: "绿色盲 (Deuteranopia)", themeTritanopia: "蓝色盲 (Tritanopia)", previewTitle: "实时预览", themeCustom: "自定义主题", bgClear: "晴朗", bgCloudy: "多云", bgFog: "雾", bgRain: "雨", bgSnow: "雪", bgThunder: "雷", dayStr: "白天", nightStr: "夜晚", styleSun: "太阳图标", styleMoon: "月亮图标", styleCloudy: "多云图标", styleFog: "雾图标", styleRain: "雨图标", styleSnow: "雪图标", styleThunder: "雷暴图标", tapToToggle: "点击切换", bgColors: "背景颜色", elementColors: "元素颜色", colorSun: "太阳", colorMoon: "月亮", colorRain: "雨水", colorCloud: "云", colorFog: "雾", colorSnow: "雪", colorThunder: "雷", colorText: "文本", colorNavSelected: "导航", modeTitle: "模式", modeSimple: "简单模式", modeComplex: "复杂模式", modeBattery: "省电模式", humidity: "湿度", wind: "风速", uv: "紫外线", pollution: "污染", pressure: "气压", sunrise: "日出", sunset: "日落", sizesTitle: "大小", sizeFlag: "国旗", sizeTemp: "温度", sizeWeather: "天气图标", sizeText: "文本", sizeNav: "导航栏", sizeTopTemp: "顶部温度", forecastTitle: "7天预报", descClear: "晴朗", descCloudy: "多云", descFog: "有雾", descRain: "下雨", descSnow: "下雪", descThunder: "雷暴", gearSnow: "装备：厚外套", gearThunder: "装备：室内", simpleForecastTitle: "本周", fillIcon: "填充图标", sizeComplexGrid: "复杂网格", sizeForecast: "预报大小", mapYourLocation: "您的位置", mapYouAreHere: "你在这里！", mapCurrentUni: "当前大学", mapLocAccessReq: "需要位置权限", mapDistanceTo: "距离", mapTip: "💡 提示：使用主页上的搜索栏探索不同的英国大学。地图将更新以显示每个校园的位置！", mapGettingLoc: "正在获取您的位置...", mapFailLoad: "地图加载失败", mapRetry: "重试", themeDisabledTitle: "主题已禁用", themeDisabledDesc: "您当前处于省电模式。要自定义主题，请在设置菜单中切换回简单或复杂模式。", backToSettings: "返回设置", themeAchromatopsia: "全色盲 (黑白)", themeColorful: "色彩缤纷", categoryDynamic: "动态主题", categoryMonotone: "单色主题", categoryAccessibility: "无障碍主题", categoryCustom: "自定义主题" },
    FA: { gearClearDay: "تجهیزات: عینک آفتابی", gearClearNight: "تجهیزات: ژاکت", gearRain: "تجهیزات: چتر", searchPlaceholder: "جستجوی پردیس...", optionsTitle: "تنظیمات", langPrefTitle: "زبان‌ها", primaryLangLabel: "زبان اصلی", secondaryLangLabel: "زبان دوم", studentProfile: "پروفایل", manageId: "مدیریت شناسه", notifications: "اعلان‌ها", weatherAlerts: "هشدارها", mapTitle: "نقشه", mapComingSoon: "فاز 2 اضافه می‌شود!", themeTitle: "تم", themeDesc: "سفارشی سازی", themeDynamic: "پویا (آب و هوا)", themeMidnight: "تاریکی نیمه شب", themeSunset: "درخشش غروب", themeQMUL: "آبی QMUL", themeForest: "سبز جنگلی", themeProtanopia: "کوررنگی قرمز (Protanopia)", themeDeuteranopia: "کوررنگی سبز (Deuteranopia)", themeTritanopia: "کوررنگی آبی (Tritanopia)", previewTitle: "پیش‌نمایش زنده", themeCustom: "تم سفارشی", bgClear: "صاف", bgCloudy: "ابری", bgFog: "مه", bgRain: "باران", bgSnow: "برف", bgThunder: "رعد و برق", dayStr: "روز", nightStr: "شب", styleSun: "نماد خورشید", styleMoon: "نماد ماه", styleCloudy: "نماد ابری", styleFog: "نماد مه", styleRain: "نماد باران", styleSnow: "نماد برف", styleThunder: "نماد رعد و برق", tapToToggle: "برای تغییر ضربه بزنید", bgColors: "پس‌زمینه", elementColors: "عناصر", colorSun: "خورشید", colorMoon: "ماه", colorRain: "باران", colorCloud: "ابر", colorFog: "مه", colorSnow: "برف", colorThunder: "رعد و برق", colorText: "متن", colorNavSelected: "ناوبری", modeTitle: "حالت", modeSimple: "ساده", modeComplex: "پیشرفته", modeBattery: "ذخیره باتری", humidity: "رطوبت", wind: "باد", uv: "UV", pollution: "آلودگی", pressure: "فشار", sunrise: "طلوع", sunset: "غروب", sizesTitle: "اندازه‌ها", sizeFlag: "پرچم", sizeTemp: "دما", sizeWeather: "نماد", sizeText: "متن", sizeNav: "ناوبری", sizeTopTemp: "دمای بالا", forecastTitle: "پیش بینی 7 روزه", descClear: "صاف", descCloudy: "ابری", descFog: "مه آلود", descRain: "باران", descSnow: "برف", descThunder: "رعد و برق", gearSnow: "تجهیزات: پالتو", gearThunder: "تجهیزات: در خانه", simpleForecastTitle: "این هفته", fillIcon: "پر کردن نماد", sizeComplexGrid: "شبکه پیشرفته", sizeForecast: "اندازه پیش‌بینی", mapYourLocation: "مکان شما", mapYouAreHere: "شما اینجا هستید!", mapCurrentUni: "دانشگاه فعلی", mapLocAccessReq: "دسترسی به مکان لازم است", mapDistanceTo: "فاصله تا", mapTip: "💡 نکته: از نوار جستجو در صفحه اصلی برای کاوش در دانشگاه‌های مختلف انگلستان استفاده کنید. نقشه برای نشان دادن مکان هر پردیس به روز می شود!", mapGettingLoc: "در حال یافتن مکان شما...", mapFailLoad: "بارگیری نقشه ناموفق بود", mapRetry: "تلاش مجدد", themeDisabledTitle: "تم‌ها غیرفعال شدند", themeDisabledDesc: "شما در حال حاضر در حالت ذخیره باتری هستید. برای سفارشی کردن تم خود، لطفاً در منوی تنظیمات به حالت ساده یا پیشرفته برگردید.", backToSettings: "بازگشت به تنظیمات", themeAchromatopsia: "کوررنگی کامل (سیاه و سفید)", themeColorful: "رنگارنگ", categoryDynamic: "تم‌های پویا", categoryMonotone: "تم‌های یکنواخت", categoryAccessibility: "تم‌های دسترسی‌پذیری", categoryCustom: "تم سفارشی" },
    AR: { gearClearDay: "المعدات: نظارات شمسية", gearClearNight: "المعدات: سترة", gearRain: "المعدات: مظلة", searchPlaceholder: "ابحث عن حرم جامعي...", optionsTitle: "الإعدادات", langPrefTitle: "اللغات", primaryLangLabel: "اللغة الأساسية", secondaryLangLabel: "اللغة الثانوية", studentProfile: "الملف الشخصي", manageId: "إدارة المعرف", notifications: "الإشعارات", weatherAlerts: "تنبيهات", mapTitle: "خريطة", mapComingSoon: "قادمة في المرحلة 2!", themeTitle: "السمة", themeDesc: "تخصيص المظهر", themeDynamic: "ديناميكي (الطقس)", themeMidnight: "الظلام في منتصف الليل", themeSunset: "توهج الغروب", themeQMUL: "أزرق QMUL", themeForest: "أخضر الغابة", themeProtanopia: "عمى الألوان الأحمر (Protanopia)", themeDeuteranopia: "عمى الألوان الأخضر (Deuteranopia)", themeTritanopia: "عمى الألوان الأزرق (Tritanopia)", previewTitle: "معاينة حية", themeCustom: "سمة مخصصة", bgClear: "صافي", bgCloudy: "غائم", bgFog: "ضباب", bgRain: "مطر", bgSnow: "ثلج", bgThunder: "رعد", dayStr: "نهار", nightStr: "ليل", styleSun: "أيقونة الشمس", styleMoon: "أيقونة القمر", styleCloudy: "أيقونة غائم", styleFog: "أيقونة ضباب", styleRain: "أيقونة المطر", styleSnow: "أيقونة ثلج", styleThunder: "أيقونة رعد", tapToToggle: "انقر للتبديل", bgColors: "الخلفيات", elementColors: "العناصر", colorSun: "الشمس", colorMoon: "القمر", colorRain: "المطر", colorCloud: "سحابة", colorFog: "ضباب", colorSnow: "ثلج", colorThunder: "رعد", colorText: "النص", colorNavSelected: "التنقل", modeTitle: "الوضع", modeSimple: "بسيط", modeComplex: "متقدم", modeBattery: "توفير البطارية", humidity: "الرطوبة", wind: "الرياح", uv: "UV", pollution: "التلوث", pressure: "الضغط", sunrise: "شروق", sunset: "غروب", sizesTitle: "الأحجام", sizeFlag: "العلم", sizeTemp: "الحرارة", sizeWeather: "الطقس", sizeText: "النص", sizeNav: "التنقل", sizeTopTemp: "الحرارة العليا", forecastTitle: "توقعات 7 أيام", descClear: "صافي", descCloudy: "غائم", descFog: "ضبابي", descRain: "ممطر", descSnow: "ثلج", descThunder: "عاصفة", gearSnow: "المعدات: معطف", gearThunder: "المعدات: بالداخل", simpleForecastTitle: "هذا الأسبوع", fillIcon: "تعبئة الأيقونة", sizeComplexGrid: "الشبكة المتقدمة", sizeForecast: "حجم التوقعات", mapYourLocation: "موقعك", mapYouAreHere: "أنت هنا!", mapCurrentUni: "الجامعة الحالية", mapLocAccessReq: "الوصول إلى الموقع مطلوب", mapDistanceTo: "المسافة إلى", mapTip: "💡 نصيحة: استخدم شريط البحث في الصفحة الرئيسية لاستكشاف جامعات المملكة المتحدة المختلفة. سيتم تحديث الخريطة لإظهار موقع كل حرم جامعي!", mapGettingLoc: "جاري تحديد موقعك...", mapFailLoad: "فشل تحميل الخريطة", mapRetry: "إعادة المحاولة", themeDisabledTitle: "تم تعطيل السمات", themeDisabledDesc: "أنت حاليا في وضع توفير البطارية. لتخصيص السمة الخاصة بك ، يرجى التبديل مرة أخرى إلى الوضع البسيط أو المتقدم في قائمة الإعدادات.", backToSettings: "العودة إلى الإعدادات", themeAchromatopsia: "عمى الألوان الكلي (أبيض وأسود)", themeColorful: "ملون", categoryDynamic: "سمات ديناميكية", categoryMonotone: "سمات أحادية اللون", categoryAccessibility: "سمات إمكانية الوصول", categoryCustom: "سمة مخصصة" },
    HI: { gearClearDay: "गियर: धूप का चश्मा", gearClearNight: "गियर: जैकेट", gearRain: "गियर: छाता", searchPlaceholder: "कैंपस खोजें...", optionsTitle: "सेटिंग्स", langPrefTitle: "भाषा", primaryLangLabel: "प्राथमिक भाषा", secondaryLangLabel: "द्वितीयक भाषा", studentProfile: "प्रोफ़ाइल", manageId: "आईडी प्रबंधित करें", notifications: "सूचनाएं", weatherAlerts: "अलर्ट", mapTitle: "नक्शा", mapComingSoon: "चरण 2 में आ रहा है!", themeTitle: "थीम", themeDesc: "अनुकूलित करें", themeDynamic: "डायनामिक (मौसम)", themeMidnight: "मिडनाइट डार्क", themeSunset: "सनसेट ग्लो", themeQMUL: "QMUL ब्लू", themeForest: "फॉरेस्ट ग्रीन", themeProtanopia: "प्रोटानोपिया (लाल-अंधा)", themeDeuteranopia: "ड्यूटेरानोपिया (हरा-अंधा)", themeTritanopia: "ट्रिटानोपिया (नीला-अंधा)", previewTitle: "लाइव पूर्वावलोकन", themeCustom: "कस्टम थीम", bgClear: "साफ़", bgCloudy: "बादल", bgFog: "कोहरा", bgRain: "बारिश", bgSnow: "बर्फ", bgThunder: "आंधी", dayStr: "दिन", nightStr: "रात", styleSun: "सूर्य आइकन", styleMoon: "चंद्रमा आइकन", styleCloudy: "बादल आइकन", styleFog: "कोहरा आइकन", styleRain: "बारिश आइकन", styleSnow: "बर्फ आइकन", styleThunder: "आंधी आइकन", tapToToggle: "बदलने के लिए टैप करें", bgColors: "पृष्ठभूमि", elementColors: "तत्व", colorSun: "सूर्य", colorMoon: "चंद्रमा", colorRain: "बारिश", colorCloud: "बादल", colorFog: "कोहरा", colorSnow: "बर्फ", colorThunder: "आंधी", colorText: "टेक्स्ट", colorNavSelected: "नेव", modeTitle: "मोड", modeSimple: "सरल", modeComplex: "जटिल", modeBattery: "बैटरी सेवर", humidity: "नमी", wind: "हवा", uv: "यूवी", pollution: "प्रदूषण", pressure: "दबाव", sunrise: "सूर्योदय", sunset: "सूर्यास्त", sizesTitle: "आकार", sizeFlag: "ध्वज", sizeTemp: "तापमान", sizeWeather: "मौसम", sizeText: "टेक्स्ट", sizeNav: "नेव", sizeTopTemp: "शीर्ष तापमान", forecastTitle: "7-दिन का पूर्वानुमान", descClear: "साफ", descCloudy: "बादल", descFog: "कोहरा", descRain: "बारिश", descSnow: "बर्फ", descThunder: "आंधी", gearSnow: "गियर: भारी कोट", gearThunder: "गियर: घर के अंदर", simpleForecastTitle: "इस सप्ताह", fillIcon: "आइकन भरें", sizeComplexGrid: "जटिल ग्रिड", sizeForecast: "पूर्वानुमान का आकार", mapYourLocation: "आपका स्थान", mapYouAreHere: "आप यहाँ हैं!", mapCurrentUni: "वर्तमान विश्वविद्यालय", mapLocAccessReq: "स्थान पहुँच आवश्यक है", mapDistanceTo: "दूरी", mapTip: "💡 टिप: विभिन्न यूके विश्वविद्यालयों का पता लगाने के लिए होम पेज पर सर्च बार का उपयोग करें। नक्शा प्रत्येक परिसर का स्थान दिखाने के लिए अपडेट होगा!", mapGettingLoc: "आपका स्थान प्राप्त कर रहा है...", mapFailLoad: "नक्शा लोड करने में विफल", mapRetry: "पुनः प्रयास करें", themeDisabledTitle: "थीम अक्षम हैं", themeDisabledDesc: "आप वर्तमान में बैटरी सेवर मोड में हैं। अपनी थीम को अनुकूलित करने के लिए, कृपया सेटिंग्स मेनू में वापस सरल या जटिल मोड पर स्विच करें।", backToSettings: "सेटिंग्स पर वापस जाएं", themeAchromatopsia: "अक्रोमेटोप्सिया (ब्लैक एंड व्हाइट)", themeColorful: "रंगीन", categoryDynamic: "डायनामिक थीम", categoryMonotone: "मोनोटोन थीम", categoryAccessibility: "एक्सेसिबिलिटी थीम", categoryCustom: "कस्टम थीम" },
    BN: { gearClearDay: "গিয়ার: সানগ্লাস", gearClearNight: "গিয়ার: জ্যাকেট", gearRain: "গিয়ার: ছাতা", searchPlaceholder: "ক্যাম্পাস খুঁজুন...", optionsTitle: "সেটিংস", langPrefTitle: "ভাষা", primaryLangLabel: "প্রাথমিক ভাষা", secondaryLangLabel: "মাধ্যমিক ভাষা", studentProfile: "প্রোফাইল", manageId: "আইডি পরিচালনা", notifications: "বিজ্ঞপ্তি", weatherAlerts: "সতর্কতা", mapTitle: "মানচিত্র", mapComingSoon: "ফেজ 2 এ আসছে!", themeTitle: "থিম", themeDesc: "কাস্টমাইজ করুন", themeDynamic: "ডায়নামিক (আবহাওয়া)", themeMidnight: "মিডনাইট ডার্ক", themeSunset: "সানসেট গ্লো", themeQMUL: "QMUL নীল", themeForest: "ফরেস্ট গ্রিন", themeProtanopia: "প্রোটানোপিয়া (লাল-অন্ধ)", themeDeuteranopia: "ডিউটেরানোপিয়া (সবুজ-অন্ধ)", themeTritanopia: "ট্রিটানোপিয়া (নীল-অন্ধ)", previewTitle: "লাইভ প্রিভিউ", themeCustom: "কাস্টম থিম", bgClear: "পরিষ্কার", bgCloudy: "মেঘলা", bgFog: "কুয়াশা", bgRain: "বৃষ্টি", bgSnow: "তুষার", bgThunder: "বজ্রপাত", dayStr: "দিন", nightStr: "রাত", styleSun: "সূর্য আইকন", styleMoon: "চাঁদ আইকন", styleCloudy: "মেঘলা আইকন", styleFog: "কুয়াশা আইকন", styleRain: "বৃষ্টির আইকন", styleSnow: "তুষার আইকন", styleThunder: "বজ্রপাত আইকন", tapToToggle: "পরিবর্তন করতে আলতো চাপুন", bgColors: "পটভূমি", elementColors: "উপাদান", colorSun: "সূর্য", colorMoon: "চাঁদ", colorRain: "বৃষ্টি", colorCloud: "মেঘ", colorFog: "কুয়াশা", colorSnow: "তুষার", colorThunder: "বজ্রপাত", colorText: "টেক্সট", colorNavSelected: "নেভ", modeTitle: "মোড", modeSimple: "সাধারণ", modeComplex: "জটিল", modeBattery: "ব্যাটারি সেভার", humidity: "আর্দ্রতা", wind: "বাতাস", uv: "ইউভি", pollution: "দূষণ", pressure: "চাপ", sunrise: "সূর্যোদয়", sunset: "সূর্যাস্ত", sizesTitle: "আকার", sizeFlag: "পতাকা", sizeTemp: "তাপমাত্রা", sizeWeather: "আবহাওয়া", sizeText: "টেক্সট", sizeNav: "নেভিগেশন", sizeTopTemp: "শীর্ষ তাপমাত্রা", forecastTitle: "৭ দিনের পূর্বাভাস", descClear: "পরিষ্কার", descCloudy: "মেঘলা", descFog: "কুয়াশা", descRain: "বৃষ্টি", descSnow: "তুষার", descThunder: "বজ্রপাত", gearSnow: "গিয়ার: ভারী কোট", gearThunder: "গিয়ার: ঘরে থাকুন", simpleForecastTitle: "এই সপ্তাহ", fillIcon: "আইকন পূরণ করুন", sizeComplexGrid: "জটিল গ্রিড", sizeForecast: "পূর্বাভাসের আকার", mapYourLocation: "আপনার অবস্থান", mapYouAreHere: "আপনি এখানে আছেন!", mapCurrentUni: "বর্তমান বিশ্ববিদ্যালয়", mapLocAccessReq: "অবস্থান অ্যাক্সেস প্রয়োজন", mapDistanceTo: "দূরত্ব", mapTip: "💡 টিপ: বিভিন্ন ইউকে বিশ্ববিদ্যালয় অন্বেষণ করতে হোম পৃষ্ঠায় অনুসন্ধান বার ব্যবহার করুন। মানচিত্র প্রতিটি ক্যাম্পাসের অবস্থান দেখানোর জন্য আপডেট হবে!", mapGettingLoc: "আপনার অবস্থান পাওয়া যাচ্ছে...", mapFailLoad: "মানচিত্র লোড করতে ব্যর্থ", mapRetry: "পুনরায় চেষ্টা করুন", themeDisabledTitle: "থিম নিষ্ক্রিয়", themeDisabledDesc: "আপনি বর্তমানে ব্যাটারি সেভার মোডে আছেন। আপনার থিম কাস্টমাইজ করতে, অনুগ্রহ করে সেটিংস মেনুতে ফিরে সাধারণ বা জটিল মোডে যান।", backToSettings: "সেটিংসে ফিরে যান", themeAchromatopsia: "অ্যাক্রোমাটোপসিয়া (সাদাকালো)", themeColorful: "রঙিন", categoryDynamic: "ডায়নামিক থিম", categoryMonotone: "মনোটোন থিম", categoryAccessibility: "অ্যাক্সেসিবিলিটি থিম", categoryCustom: "কাস্টম থিম" }
  };

  const languages = [
    { code: 'EN', name: 'English', flag: 'gb' },
    { code: 'TH', name: 'ภาษาไทย (Thai)', flag: 'th' },
    { code: 'ZH', name: '中文 (Chinese)', flag: 'cn' },
    { code: 'FA', name: 'فارسی (Persian)', flag: 'ir' },
    { code: 'AR', name: 'العربية (Arabic)', flag: 'sa' },
    { code: 'HI', name: 'हिन्दी (Hindi)', flag: 'in' },
    { code: 'BN', name: 'বাংলা (Bengali)', flag: 'bd' }
  ];

  const t = text[activeLang];
  const activeFlagCode = languages.find(l => l.code === activeLang)?.flag;

  const toggleUnit = () => {
    if (unit === 'C') setUnit('F');
    else if (unit === 'F') setUnit('K');
    else setUnit('C');
  };
  const toggleLanguage = () => setIsViewingPrimary(!isViewingPrimary);
  const isRTL = activeLang === 'AR' || activeLang === 'FA';

  let currentTextColor = '#FFFFFF';
  let currentSunColor = '#FBBF24'; 
  let currentMoonColor = '#FDE047'; 
  let currentRainColor = '#9CA3AF'; 
  let currentCloudColor = '#A1A1AA'; 
  let currentFogColor = '#94A3B8'; 
  let currentSnowColor = '#BAE6FD'; 
  let currentThunderColor = '#A78BFA'; 
  let currentNavActive = '#FBBF24'; 
  let currentNavInactive = '#FFFFFF';

  const isColorBlindMode = ['protanopia', 'deuteranopia', 'tritanopia', 'achromatopsia'].includes(appTheme);
  const showTextFlag = isBatterySave || isColorBlindMode;

  if (isBatterySave) {
    currentTextColor = '#22C55E'; currentSunColor = '#22C55E'; currentMoonColor = '#22C55E';
    currentRainColor = '#22C55E'; currentCloudColor = '#22C55E'; currentFogColor = '#22C55E';
    currentSnowColor = '#22C55E'; currentThunderColor = '#22C55E'; currentNavActive = '#4ADE80'; currentNavInactive = '#166534';
  } else if (appTheme === 'custom') {
    currentTextColor = customColors.text; currentSunColor = customColors.sun; currentMoonColor = customColors.moon;
    currentRainColor = customColors.rain; currentCloudColor = customColors.cloud; currentFogColor = customColors.fog;
    currentSnowColor = customColors.snow; currentThunderColor = customColors.thunder; currentNavActive = customColors.navSelected; currentNavInactive = customColors.text;
  } else if (appTheme === 'protanopia' || appTheme === 'deuteranopia') {
    currentSunColor = '#FFC20A'; currentMoonColor = '#E2E8F0'; currentRainColor = '#0C7BDC'; 
    currentCloudColor = '#E2E8F0'; currentFogColor = '#E2E8F0'; currentSnowColor = '#E2E8F0'; currentThunderColor = '#FFC20A';
    currentNavActive = '#FFC20A'; 
  } else if (appTheme === 'tritanopia') {
    currentSunColor = '#FF5252'; currentMoonColor = '#E2E8F0'; currentRainColor = '#00BFA5'; 
    currentCloudColor = '#E2E8F0'; currentFogColor = '#E2E8F0'; currentSnowColor = '#E2E8F0'; currentThunderColor = '#FF5252';
    currentNavActive = '#00BFA5'; 
  } else if (appTheme === 'achromatopsia') {
    currentSunColor = '#FFFFFF'; currentMoonColor = '#D4D4D8'; currentRainColor = '#A1A1AA'; 
    currentCloudColor = '#A1A1AA'; currentFogColor = '#71717A'; currentSnowColor = '#F4F4F5'; currentThunderColor = '#FFFFFF';
    currentNavActive = '#FFFFFF'; currentNavInactive = '#71717A'; 
  }

  const tc = { color: currentTextColor };
  const sunStyle = { color: currentSunColor, fill: isBatterySave ? 'transparent' : (customFills.sun ? currentSunColor : 'transparent') };
  const moonStyle = { color: currentMoonColor, fill: isBatterySave ? 'transparent' : (customFills.moon ? currentMoonColor : 'transparent') };
  const rainStyle = { color: currentRainColor, fill: isBatterySave ? 'transparent' : (customFills.rain ? currentRainColor : 'transparent') };
  const cloudStyle = { color: currentCloudColor, fill: isBatterySave ? 'transparent' : (customFills.cloudy ? currentCloudColor : 'transparent') };
  const fogStyle = { color: currentFogColor, fill: isBatterySave ? 'transparent' : (customFills.fog ? currentFogColor : 'transparent') };
  const snowStyle = { color: currentSnowColor, fill: isBatterySave ? 'transparent' : (customFills.snow ? currentSnowColor : 'transparent') };
  const thunderStyle = { color: currentThunderColor, fill: isBatterySave ? 'transparent' : (customFills.thunder ? currentThunderColor : 'transparent') };
  
  const accentStyle = { color: currentNavActive };
  const activeNavStyle = { color: currentNavActive }; 
  const inactiveNavStyle = { color: currentNavInactive }; 

  const flagMult = appTheme === 'custom' && !isBatterySave ? customSizes.flag : 1;
  const tempMult = appTheme === 'custom' && !isBatterySave ? customSizes.temp : 1;
  const weatherMult = appTheme === 'custom' && !isBatterySave ? customSizes.weather : 1;
  const textMult = appTheme === 'custom' && !isBatterySave ? customSizes.text : 1;
  const navMult = appTheme === 'custom' && !isBatterySave ? customSizes.nav : 1;
  const topTempMult = appTheme === 'custom' && !isBatterySave ? customSizes.topTemp : 1;
  const complexGridMult = appTheme === 'custom' && !isBatterySave ? customSizes.complexGrid : 1;
  const complexForecastMult = appTheme === 'custom' && !isBatterySave ? customSizes.complexForecast : 1;

  const getForecastDetails = (wmoCode, isDayTime = true) => {
    const ActiveSun = sunIconMap[customIcons.sun] || Sun;
    const ActiveMoon = moonIconMap[customIcons.moon] || Moon;
    const ActiveCloudy = cloudyIconMap[customIcons.cloudy] || Cloud;
    const ActiveFog = fogIconMap[customIcons.fog] || CloudFog;
    const ActiveRain = rainIconMap[customIcons.rain] || CloudRain;
    const ActiveSnow = snowIconMap[customIcons.snow] || Snowflake;
    const ActiveThunder = thunderIconMap[customIcons.thunder] || Zap;

    const baseIcon = isDayTime ? ActiveSun : ActiveMoon;
    const baseStyle = isDayTime ? sunStyle : moonStyle;
    
    if (wmoCode === 0) return { baseIcon, overlayIcon: null, desc: t.descClear, gear: isDayTime ? t.gearClearDay : t.gearClearNight, baseStyle, overlayStyle: null, gearIcon: isDayTime ? Glasses : MoonStar };
    if (wmoCode <= 3) return { baseIcon, overlayIcon: ActiveCloudy, desc: t.descCloudy, gear: t.gearClearNight, baseStyle, overlayStyle: cloudStyle, gearIcon: Cloud };
    if (wmoCode <= 48) return { baseIcon, overlayIcon: ActiveFog, desc: t.descFog, gear: t.gearClearNight, baseStyle, overlayStyle: fogStyle, gearIcon: CloudFog };
    if (wmoCode <= 69 || (wmoCode >= 80 && wmoCode <= 82)) return { baseIcon, overlayIcon: ActiveRain, desc: t.descRain, gear: t.gearRain, baseStyle, overlayStyle: rainStyle, gearIcon: Umbrella };
    if (wmoCode <= 79 || wmoCode === 85 || wmoCode === 86) return { baseIcon, overlayIcon: ActiveSnow, desc: t.descSnow, gear: t.gearSnow, baseStyle, overlayStyle: snowStyle, gearIcon: Snowflake };
    if (wmoCode >= 95) return { baseIcon, overlayIcon: ActiveThunder, desc: t.descThunder, gear: t.gearThunder, baseStyle, overlayStyle: thunderStyle, gearIcon: Shield };
    
    return { baseIcon, overlayIcon: ActiveCloudy, desc: t.descCloudy, gear: "", baseStyle, overlayStyle: cloudStyle, gearIcon: Cloud };
  };

  const currentDetails = getForecastDetails(weatherState.wmoCode, weatherState.isDay);

  return (
    <div 
      className={`relative w-full h-screen overflow-hidden flex flex-col md:flex-row transition-colors duration-700 font-sans ${getThemeBackground()}`}
      style={{ backgroundColor: getCustomBackgroundColor() }}
    >
      
      {/* Sidebar */}
      <div className={`h-20 md:h-full w-full md:w-24 flex flex-row md:flex-col items-center justify-around md:justify-center md:gap-12 px-4 md:py-8 border-t md:border-t-0 md:border-r flex-shrink-0 z-20 ${isBatterySave ? 'bg-black border-green-500/20' : 'bg-black/10 backdrop-blur-md border-white/10'} order-last md:order-first`}>
        <button onClick={() => setActivePage('home')} className={`flex flex-col items-center gap-1 transition-transform ${activePage === 'home' ? 'scale-110' : 'hover:scale-110'}`} style={activePage === 'home' ? activeNavStyle : inactiveNavStyle}>
          <Home size={28 * navMult} />
        </button>
        <button onClick={() => setActivePage('map')} className={`flex flex-col items-center gap-1 transition-transform ${activePage === 'map' ? 'scale-110' : 'hover:scale-110'}`} style={activePage === 'map' ? activeNavStyle : inactiveNavStyle}>
          <Map size={28 * navMult} />
        </button>
        <button onClick={() => setActivePage('options')} className={`flex flex-col items-center gap-1 transition-transform ${activePage === 'options' ? 'scale-110' : 'hover:scale-110'}`} style={activePage === 'options' ? activeNavStyle : inactiveNavStyle}>
          <Menu size={28 * navMult} />
        </button>
      </div>

      {/* MAIN CONTENT AREA */}
      <div dir={isRTL ? 'rtl' : 'ltr'} className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* HEADER */}
        <div dir="ltr" className="flex justify-between items-start p-6 md:p-8 pt-12 md:pt-8 w-full z-20 flex-shrink-0">
          <div style={{ transform: `scale(${flagMult})`, transformOrigin: 'top left' }}>
            <button onClick={toggleLanguage} className={`h-8 rounded shadow-md overflow-hidden hover:scale-105 transition-transform w-12 flex items-center justify-center ${showTextFlag ? (isBatterySave ? 'bg-black border border-green-500/30' : 'bg-black/20 border border-white/20') : 'bg-white'}`} title="Toggle Language">
              {showTextFlag ? (
                <span className="text-xs font-bold" style={tc}>{activeLang}</span>
              ) : (
                <img src={`https://flagcdn.com/${activeFlagCode}.svg`} alt={`${activeLang} Flag`} className="w-full h-full object-cover"/>
              )}
            </button>
          </div>

          {apiError && (
             <div className="bg-orange-500/20 border border-orange-500/50 text-orange-100 text-[10px] md:text-xs px-3 py-1 rounded-full backdrop-blur-sm animate-pulse text-center" title="Using offline mock data">
               {apiError}
             </div>
          )}

          <div style={{ transform: `scale(${topTempMult})`, transformOrigin: 'top right' }}>
            <button onClick={toggleUnit} className={`h-10 px-3 flex items-center justify-center gap-1 rounded-full transition-all font-bold shadow-sm ${isBatterySave ? 'bg-black border border-green-500/30' : 'bg-white/20 hover:bg-white/30'}`} style={tc}>
              <Thermometer size={20} />
              <span className="text-sm">{unit === 'K' ? 'K' : `°${unit}`}</span>
            </button>
          </div>
        </div>

        {/* ROUTING CONTAINER */}
        <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
          
          {/* --- PAGE: HOME --- */}
          {activePage === 'home' && (
            <div className={`flex-1 flex flex-col ${isComplex ? 'lg:flex-row lg:items-start lg:justify-center lg:gap-16 max-w-6xl' : 'items-center justify-start max-w-4xl'} pt-0 md:pt-4 pb-20 px-6 md:px-12 animate-in fade-in duration-500 mx-auto w-full min-h-full`}>
              
              {/* Left Column / Central Weather */}
              <div className={`flex flex-col items-center justify-center flex-shrink-0 w-full lg:w-auto ${isComplex ? 'mb-8 lg:mb-0' : 'mb-8'}`}>
                
                <div className="relative w-full max-w-sm mb-6 md:mb-10 z-30">
                  <div className={`flex items-center px-4 py-3 rounded-full transition-all shadow-lg ${isBatterySave ? 'bg-black border border-green-500/40' : 'bg-black/20 backdrop-blur-md border border-white/10'}`}>
                    <Search size={20} style={{ color: tc.color, opacity: 0.7 }} />
                    <input
                      type="text"
                      placeholder={t.searchPlaceholder}
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); setIsSearching(true); }}
                      onFocus={() => setIsSearching(true)}
                      className={`bg-transparent border-none outline-none placeholder-white/60 ${isRTL ? 'mr-3' : 'ml-3'} w-full text-sm font-medium`}
                      style={tc}
                    />
                  </div>
                  
                  {isSearching && searchQuery && (
                    <div className={`absolute top-full left-0 right-0 mt-2 rounded-2xl overflow-hidden max-h-56 overflow-y-auto custom-scrollbar shadow-2xl ${isBatterySave ? 'bg-black border border-green-500/40' : 'bg-slate-800/90 backdrop-blur-xl border border-white/20'}`}>
                      {UK_UNIVERSITIES.filter(u => u.uni.toLowerCase().includes(searchQuery.toLowerCase()) || u.city.toLowerCase().includes(searchQuery.toLowerCase())).map((uni, idx) => (
                        <div
                          key={idx}
                          className="px-5 py-4 cursor-pointer border-b last:border-0 transition-colors"
                          style={{ borderColor: isBatterySave ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255,255,255,0.05)' }}
                          onClick={() => { setSelectedLocation(uni); setSearchQuery(''); setIsSearching(false); }}
                        >
                          <p className="font-bold text-sm" style={tc}>{uni.uni}</p>
                          <p className="text-xs mt-1" style={{ color: tc.color, opacity: 0.8 }}>{uni.city} - {uni.campus}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-center mb-6 text-center" style={{ ...tc, transform: `scale(${textMult})`, transformOrigin: 'center' }}>
                  <p className="text-xl md:text-2xl font-medium capitalize tracking-wide drop-shadow-md">
                    {currentTime.toLocaleDateString(activeLang.toLowerCase(), { weekday: 'long', day: 'numeric', month: 'long' })}
                  </p>
                  <p className="text-sm md:text-base opacity-80 font-light tracking-widest drop-shadow-md mt-0.5">
                    {currentTime.toLocaleTimeString(activeLang.toLowerCase(), { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <button onClick={cycleWeather} className="mb-6 hover:scale-105 transition-transform cursor-pointer" title="Tap to cycle weather states">
                  {isLoading ? (
                    <div className="w-32 h-32 flex items-center justify-center">
                      <Loader2 size={64 * weatherMult} className="animate-spin opacity-50" style={tc} />
                    </div>
                  ) : (
                    <div className="relative flex items-center justify-center w-[160px] h-[160px]">
                      <currentDetails.baseIcon size={120 * weatherMult} className="drop-shadow-lg" style={currentDetails.baseStyle} />
                      {currentDetails.overlayIcon && (
                        <div className={`absolute bottom-2 ${isRTL ? 'left-2' : 'right-2'} rounded-full p-2.5 shadow-2xl ${isBatterySave ? 'bg-black border border-green-500/50' : 'bg-black/30 backdrop-blur-md border border-white/10'}`}>
                          <currentDetails.overlayIcon size={46 * weatherMult} style={currentDetails.overlayStyle} />
                        </div>
                      )}
                    </div>
                  )}
                </button>

                <h1 className="text-[80px] md:text-[140px] font-bold leading-none tracking-tighter mb-4 shadow-black/10 drop-shadow-lg" style={{ ...tc, transform: `scale(${tempMult})`, transformOrigin: 'center' }}>
                  {isLoading ? "--°" : getDisplayTemperature()}
                </h1>

                <div className={`flex items-center gap-3 px-6 py-3 rounded-full mb-8 ${isBatterySave ? 'bg-black border border-green-500/30' : 'bg-white/10 backdrop-blur-sm'}`} style={{ transform: `scale(${textMult})`, transformOrigin: 'center' }}>
                  <currentDetails.gearIcon className={`rounded-full p-1.5 flex-shrink-0 ${isBatterySave ? 'bg-black border border-green-500 text-green-500' : 'bg-white text-gray-800'}`} size={32} />
                  <span className="font-medium text-lg md:text-xl tracking-wide" style={tc}>
                    {currentDetails.gear}
                  </span>
                </div>

                <div className="flex flex-col items-center gap-2" style={{ transform: `scale(${textMult})`, transformOrigin: 'center' }}>
                  <div className="flex items-center gap-2">
                    <Home size={28} style={accentStyle} />
                    <h2 className="text-3xl md:text-4xl font-bold tracking-wide" style={tc}>{selectedLocation.city}</h2>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-3xl" style={accentStyle}>♚</span>
                    <div className={`flex flex-col items-center md:items-start text-center ${isRTL ? 'md:text-right' : 'md:text-left'}`}>
                      <p className="font-semibold text-sm md:text-base" style={tc}>{selectedLocation.uni}</p>
                      <p className="text-xs md:text-sm" style={{ color: tc.color, opacity: 0.8 }}>{selectedLocation.campus}</p>
                    </div>
                  </div>
                </div>

                {!isComplex && weatherData?.forecast && (
                  <div className="w-full max-w-2xl mt-10 animate-in slide-in-from-bottom-8 duration-500">
                    <h4 className="text-sm font-bold mb-3 px-2 opacity-80 text-center md:text-left" style={tc}>{t.simpleForecastTitle}</h4>
                    <div className="grid grid-cols-7 gap-1.5 md:gap-3 w-full">
                      {weatherData.forecast.map((day, idx) => {
                        const wmo = getForecastDetails(day.weatherCode, true);
                        const dateStr = new Date(day.dateRaw).toLocaleDateString(activeLang.toLowerCase(), { weekday: 'short' });
                        return (
                          <div key={idx} className={`flex flex-col items-center justify-center py-3 px-1 md:px-2 rounded-2xl ${isBatterySave ? 'bg-black border border-green-500/30' : 'bg-white/10 backdrop-blur-md shadow-sm border border-white/5'}`}>
                            <span className="text-[10px] md:text-xs font-bold capitalize mb-2" style={tc}>{dateStr}</span>
                            
                            <div className="relative w-6 h-6 md:w-8 md:h-8 flex items-center justify-center mb-2">
                                <wmo.baseIcon size={20} className="md:w-6 md:h-6 opacity-90" style={wmo.baseStyle} />
                                {wmo.overlayIcon && (
                                  <div className={`absolute -bottom-1 ${isRTL ? '-left-1' : '-right-1'} rounded-full p-0.5 md:p-1 ${isBatterySave ? 'bg-black border border-green-500/50' : 'bg-black/50 backdrop-blur-sm'}`}>
                                    <wmo.overlayIcon size={10} className="md:w-3 md:h-3" style={wmo.overlayStyle} />
                                  </div>
                                )}
                            </div>

                            <span className="text-xs md:text-sm font-bold" style={tc}>{convertTemp(day.maxTemp)}°</span>
                            <span className="text-[10px] md:text-xs opacity-60" style={tc}>{convertTemp(day.minTemp)}°</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column / Complex Mode Data Grid & Forecast */}
              {isComplex && weatherData && (
                <div className={`w-full lg:w-[480px] lg:mt-24 mt-6 animate-in slide-in-from-bottom-8 ${isRTL ? 'lg:slide-in-from-left-8' : 'lg:slide-in-from-right-8'} duration-700 flex-shrink-0 z-10`}>
                  <div className="w-16 h-1 bg-white/20 rounded-full mx-auto mb-6 lg:hidden"></div>
                  
                  <div className="mb-6 transition-transform" style={{ transform: `scale(${complexGridMult})`, transformOrigin: isRTL ? 'top right' : 'top left' }}>
                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                      <div className={`p-4 rounded-2xl flex flex-col gap-2 ${isBatterySave ? 'bg-black border border-green-500/30' : 'bg-white/10 backdrop-blur-md shadow-lg border border-white/5'}`}>
                        <Sunrise size={22} style={sunStyle} />
                        <div>
                          <p className="text-xs opacity-80" style={tc}>{t.sunrise}</p>
                          <p className="text-lg font-bold" style={tc}>{weatherData.sunrise}</p>
                        </div>
                      </div>
                      <div className={`p-4 rounded-2xl flex flex-col gap-2 ${isBatterySave ? 'bg-black border border-green-500/30' : 'bg-white/10 backdrop-blur-md shadow-lg border border-white/5'}`}>
                        <Sunset size={22} style={sunStyle} />
                        <div>
                          <p className="text-xs opacity-80" style={tc}>{t.sunset}</p>
                          <p className="text-lg font-bold" style={tc}>{weatherData.sunset}</p>
                        </div>
                      </div>
                      <div className={`p-4 rounded-2xl flex flex-col gap-2 ${isBatterySave ? 'bg-black border border-green-500/30' : 'bg-white/10 backdrop-blur-md shadow-lg border border-white/5'}`}>
                        <Droplets size={22} style={rainStyle} />
                        <div>
                          <p className="text-xs opacity-80" style={tc}>{t.humidity}</p>
                          <p className="text-lg font-bold" style={tc}>{weatherData.humidity}</p>
                        </div>
                      </div>
                      <div className={`p-4 rounded-2xl flex flex-col gap-2 ${isBatterySave ? 'bg-black border border-green-500/30' : 'bg-white/10 backdrop-blur-md shadow-lg border border-white/5'}`}>
                        <Wind size={22} style={rainStyle} />
                        <div>
                          <p className="text-xs opacity-80" style={tc}>{t.wind}</p>
                          <p className="text-lg font-bold" style={tc}>{weatherData.wind}</p>
                        </div>
                      </div>
                      <div className={`p-4 rounded-2xl flex flex-col gap-2 ${isBatterySave ? 'bg-black border border-green-500/30' : 'bg-white/10 backdrop-blur-md shadow-lg border border-white/5'}`}>
                        <Activity size={22} style={accentStyle} />
                        <div>
                          <p className="text-xs opacity-80" style={tc}>{t.uv}</p>
                          <p className="text-lg font-bold" style={tc}>{weatherData.uv}</p>
                        </div>
                      </div>
                      <div className={`p-4 rounded-2xl flex flex-col gap-2 ${isBatterySave ? 'bg-black border border-green-500/30' : 'bg-white/10 backdrop-blur-md shadow-lg border border-white/5'}`}>
                        <CloudFog size={22} style={tc} />
                        <div>
                          <p className="text-xs opacity-80" style={tc}>{t.pollution}</p>
                          <p className="text-sm font-bold" style={tc}>{weatherData.pollution}</p>
                        </div>
                      </div>
                      <div className={`p-4 rounded-2xl flex flex-col gap-2 col-span-2 ${isBatterySave ? 'bg-black border border-green-500/30' : 'bg-white/10 backdrop-blur-md shadow-lg border border-white/5'}`}>
                        <div className="flex justify-between items-center w-full">
                          <div className="flex gap-2 items-center">
                            <Gauge size={22} style={accentStyle} />
                            <div>
                              <p className="text-xs opacity-80" style={tc}>{t.pressure}</p>
                              <p className="text-lg font-bold" style={tc}>{weatherData.pressure}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <ArrowDown size={20} style={{ color: currentRainColor }} />
                            <ArrowUp size={20} style={{ color: currentSunColor, opacity: 0.5 }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {weatherData.forecast && weatherData.forecast.length > 0 && (
                    <div className="w-full pb-8 transition-transform" style={{ transform: `scale(${complexForecastMult})`, transformOrigin: isRTL ? 'top right' : 'top left' }}>
                      <h4 className="text-xl font-bold mb-4 px-1" style={tc}>{t.forecastTitle}</h4>
                      <div className="flex flex-col gap-3">
                        {weatherData.forecast.map((day, idx) => {
                          const wmo = getForecastDetails(day.weatherCode, true);
                          const formattedDate = new Date(day.dateRaw).toLocaleDateString(activeLang.toLowerCase(), { weekday: 'long', day: 'numeric', month: 'long' });
                          return (
                            <div key={idx} className={`flex items-center justify-between p-4 rounded-2xl transition-colors cursor-default ${isBatterySave ? 'bg-black border border-green-500/30 hover:bg-green-900/20' : 'bg-white/10 backdrop-blur-md shadow-lg border border-white/5 hover:bg-white/20'}`}>
                              <div className="flex items-center gap-4">
                                
                                <div className="relative flex items-center justify-center w-10 h-10 flex-shrink-0">
                                    <wmo.baseIcon size={32} style={wmo.baseStyle} className="opacity-90" />
                                    {wmo.overlayIcon && (
                                      <div className={`absolute -bottom-1 ${isRTL ? '-left-1' : '-right-1'} rounded-full p-1 ${isBatterySave ? 'bg-black border border-green-500/50' : 'bg-black/40 backdrop-blur-md'}`}>
                                        <wmo.overlayIcon size={14} style={wmo.overlayStyle} />
                                      </div>
                                    )}
                                </div>

                                <div className="flex flex-col">
                                  <span className="font-bold text-sm md:text-base capitalize" style={tc}>{formattedDate}</span>
                                  <span className="text-xs opacity-80 mt-0.5" style={tc}>{wmo.desc} • {wmo.gear}</span>
                                </div>
                              </div>
                              <div className="flex flex-col items-end pl-2">
                                <div className="font-bold text-lg leading-tight" style={tc}>
                                  {convertTemp(day.maxTemp)}°
                                </div>
                                <div className="text-sm opacity-60 leading-tight" style={tc}>
                                  {convertTemp(day.minTemp)}°
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>
          )}

          {/* --- PAGE: OPTIONS --- */}
          {activePage === 'options' && (
            <div className="flex-1 flex flex-col pt-4 px-6 md:px-12 pb-12 animate-in fade-in duration-500">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 border-b border-white/20 pb-3 flex items-center gap-2" style={tc}>
                <Settings size={28} />
                {t.optionsTitle}
              </h2>
              
              <div className={`p-5 rounded-2xl flex flex-col gap-4 mb-4 ${isBatterySave ? 'bg-black border border-green-500/30' : 'bg-white/10 backdrop-blur-sm'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Activity size={22} style={accentStyle} />
                  <p className="font-semibold text-lg" style={tc}>{t.modeTitle}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button 
                    onClick={() => setAppMode('simple')} 
                    className={`py-2.5 rounded-xl border text-sm md:text-base font-bold transition-all ${appMode === 'simple' ? (!isBatterySave ? 'text-black shadow-lg' : 'bg-green-500/20 text-green-500 border-green-500 shadow-lg shadow-green-500/20') : (isBatterySave ? 'border-green-500/30 text-green-700 hover:bg-green-500/10' : 'border-white/20 hover:bg-white/10')}`}
                    style={appMode === 'simple' && !isBatterySave ? { backgroundColor: currentNavActive, borderColor: currentNavActive } : { color: tc.color }}
                  >
                    {t.modeSimple}
                  </button>
                  <button 
                    onClick={() => setAppMode('complex')} 
                    className={`py-2.5 rounded-xl border text-sm md:text-base font-bold transition-all ${appMode === 'complex' ? (!isBatterySave ? 'text-black shadow-lg' : 'bg-green-500/20 text-green-500 border-green-500 shadow-lg shadow-green-500/20') : (isBatterySave ? 'border-green-500/30 text-green-700 hover:bg-green-500/10' : 'border-white/20 hover:bg-white/10')}`}
                    style={appMode === 'complex' && !isBatterySave ? { backgroundColor: currentNavActive, borderColor: currentNavActive } : { color: tc.color }}
                  >
                    {t.modeComplex}
                  </button>
                  <button 
                    onClick={() => setIsBatterySave(!isBatterySave)} 
                    className={`py-2.5 rounded-xl border text-sm md:text-base font-bold transition-all flex items-center justify-center gap-2 ${isBatterySave ? 'bg-green-500 text-black border-green-500 shadow-lg shadow-green-500/20' : 'border-white/20 text-white hover:bg-white/10'}`}
                  >
                    <Battery size={18} /> {t.modeBattery} {isBatterySave ? ': ON' : ': OFF'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-5 rounded-2xl flex flex-col gap-4 ${isBatterySave ? 'bg-black border border-green-500/30' : 'bg-white/10 backdrop-blur-sm'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Globe size={22} style={accentStyle} />
                    <p className="font-semibold text-lg" style={tc}>{t.langPrefTitle}</p>
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm" style={{ color: tc.color, opacity: 0.8 }}>{t.primaryLangLabel}</label>
                    <select value={primaryLang} onChange={(e) => setPrimaryLang(e.target.value)} className="bg-black/20 rounded-lg p-2.5 outline-none border border-white/10" style={tc}>
                      {languages.map(lang => (<option key={`pri-${lang.code}`} value={lang.code} className="bg-black text-white">{lang.name}</option>))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm" style={{ color: tc.color, opacity: 0.8 }}>{t.secondaryLangLabel}</label>
                    <select value={secondaryLang} onChange={(e) => setSecondaryLang(e.target.value)} className="bg-black/20 rounded-lg p-2.5 outline-none border border-white/10" style={tc}>
                      {languages.map(lang => (<option key={`sec-${lang.code}`} value={lang.code} className="bg-black text-white">{lang.name}</option>))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div onClick={() => setActivePage('theme-selection')} className={`p-5 rounded-2xl flex items-center justify-between transition-colors cursor-pointer shadow-sm ${isBatterySave ? 'bg-black border border-green-500/30 opacity-50 cursor-not-allowed' : 'bg-white/10 backdrop-blur-sm hover:bg-white/20'}`}>
                    <div className="flex items-center gap-4">
                      <Palette size={26} style={isBatterySave ? { color: '#22C55E' } : accentStyle} />
                      <div>
                        <p className="font-semibold text-lg" style={tc}>{t.themeTitle}</p>
                        <p className="text-sm" style={{ color: tc.color, opacity: 0.8 }}>{isBatterySave ? 'Disabled in Battery Saver' : t.themeDesc}</p>
                      </div>
                    </div>
                    <div className="text-xs font-bold tracking-wider px-3 py-1.5 rounded-full capitalize" style={{ ...tc, backgroundColor: isBatterySave ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.2)' }}>{isBatterySave ? 'Off' : appTheme}</div>
                  </div>

                  <div className={`p-5 rounded-2xl flex items-center gap-4 transition-colors cursor-pointer ${isBatterySave ? 'bg-black border border-green-500/30 hover:bg-green-900/30' : 'bg-white/10 backdrop-blur-sm hover:bg-white/20'}`}>
                    <User size={26} style={accentStyle} />
                    <div>
                      <p className="font-semibold text-lg" style={tc}>{t.studentProfile}</p>
                      <p className="text-sm" style={{ color: tc.color, opacity: 0.8 }}>{t.manageId}</p>
                    </div>
                  </div>

                  <div className={`p-5 rounded-2xl flex items-center gap-4 transition-colors cursor-pointer ${isBatterySave ? 'bg-black border border-green-500/30 hover:bg-green-900/30' : 'bg-white/10 backdrop-blur-sm hover:bg-white/20'}`}>
                    <Bell size={26} style={accentStyle} />
                    <div>
                      <p className="font-semibold text-lg" style={tc}>{t.notifications}</p>
                      <p className="text-sm" style={{ color: tc.color, opacity: 0.8 }}>{t.weatherAlerts}</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}
          
          {/* --- PAGE: THEME SELECTION --- */}
          {activePage === 'theme-selection' && !isBatterySave && (
            <div className="flex-1 flex flex-col pt-4 px-6 md:px-12 pb-12 animate-in slide-in-from-right duration-300">
              
              <div className="flex items-center gap-2 mb-6 border-b border-white/20 pb-3">
                <button onClick={() => setActivePage('options')} className="p-1.5 hover:bg-white/20 rounded-full transition-colors">
                  <ChevronLeft size={32} style={tc} />
                </button>
                <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2" style={tc}>
                  <Palette size={28} />
                  {t.themeTitle}
                </h2>
              </div>

              <div className="mb-6 md:mb-8 max-w-lg mx-auto w-full">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm md:text-base" style={{ color: tc.color, opacity: 0.8 }}>{t.previewTitle}</p>
                  <p className="text-xs md:text-sm italic" style={{ color: tc.color, opacity: 0.5 }}>{t.tapToToggle}</p>
                </div>
                
                {/* UPDATED: Fully comprehensive live preview for both Simple and Complex states */}
                <div onClick={cycleWeather} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 flex flex-col shadow-lg cursor-pointer hover:bg-white/20 hover:scale-[1.02] active:scale-95 transition-all w-full">
                  <div className="flex items-center justify-between w-full">
                    <div className={`flex flex-col ${isRTL ? 'items-end' : 'items-start'}`}>
                      <h3 className="text-4xl md:text-5xl font-bold mb-1 transition-transform" style={{ ...tc, transform: `scale(${tempMult})`, transformOrigin: isRTL ? 'right center' : 'left center' }}>
                        {isLoading ? "--°" : getDisplayTemperature()}
                      </h3>
                      <div className="flex flex-col gap-1 mt-2 transition-transform" style={{ color: tc.color, transform: `scale(${textMult})`, transformOrigin: isRTL ? 'right top' : 'left top' }}>
                        <div className="flex items-center gap-1.5 text-sm md:text-base opacity-90"><Home size={16} /> {selectedLocation.city}</div>
                        <div className="flex items-center gap-1.5 text-xs md:text-sm opacity-80"><currentDetails.gearIcon size={14} /> {currentDetails.gear}</div>
                        <div className="text-xs md:text-sm opacity-80">{currentTime.toLocaleDateString(activeLang.toLowerCase(), { weekday: 'short', day: 'numeric', month: 'short' })}</div>
                      </div>
                    </div>

                    <div className="bg-white/10 p-4 rounded-full flex items-center justify-center">
                      <div className="relative flex items-center justify-center w-16 h-16">
                          <currentDetails.baseIcon size={48 * weatherMult} className="drop-shadow-md" style={currentDetails.baseStyle} />
                          {currentDetails.overlayIcon && (
                            <div className={`absolute -bottom-1 ${isRTL ? '-left-1' : '-right-1'} bg-black/30 backdrop-blur-md rounded-full p-1 border border-white/10`}>
                              <currentDetails.overlayIcon size={20 * weatherMult} style={currentDetails.overlayStyle} />
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                  
                  {isComplex && (
                    <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/20 w-full transition-transform" style={{ transform: `scale(${complexGridMult})`, transformOrigin: 'top center' }}>
                       <div className="flex flex-col items-center justify-center bg-white/5 rounded-lg py-2"><Droplets size={18} style={rainStyle}/><span className="text-xs font-bold mt-1" style={tc}>{weatherData?.humidity || '--'}</span></div>
                       <div className="flex flex-col items-center justify-center bg-white/5 rounded-lg py-2"><Wind size={18} style={rainStyle}/><span className="text-xs font-bold mt-1" style={tc}>{weatherData?.wind || '--'}</span></div>
                       <div className="flex flex-col items-center justify-center bg-white/5 rounded-lg py-2"><Activity size={18} style={accentStyle}/><span className="text-xs font-bold mt-1" style={tc}>UV: {weatherData?.uv || '--'}</span></div>
                    </div>
                  )}
                </div>

              </div>

              <div className="mb-6">
                <h4 className="text-sm font-semibold mb-3 px-1 opacity-80" style={tc}>{t.categoryDynamic}</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { id: 'dynamic', name: t.themeDynamic, color: 'bg-gradient-to-br from-blue-500 to-blue-800' },
                    { id: 'colorful', name: t.themeColorful, color: 'bg-gradient-to-tr from-yellow-300 via-orange-400 to-pink-500' },
                    { id: 'custom', name: t.themeCustom, color: 'bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500' }
                  ].map((themeOpt) => (
                    <button
                      key={themeOpt.id}
                      onClick={() => setAppTheme(themeOpt.id)}
                      className={`relative flex flex-col items-center justify-center p-5 md:p-6 rounded-2xl border-2 transition-all overflow-hidden ${
                        appTheme === themeOpt.id ? 'scale-105 shadow-lg' : 'border-white/10 hover:border-white/30'
                      }`}
                      style={{ borderColor: appTheme === themeOpt.id ? currentNavActive : undefined }}
                    >
                      <div className={`absolute inset-0 opacity-50 ${themeOpt.color}`}></div>
                      <div className="relative z-10 flex flex-col items-center gap-2">
                        {appTheme === themeOpt.id && <CheckCircle2 size={24} className={`absolute -top-3 ${isRTL ? 'left-[-24px]' : 'right-[-24px]'}`} style={accentStyle} />}
                        <span className="font-medium text-center text-sm md:text-base" style={tc}>{themeOpt.name}</span>
                      </div>
                    </button>
                  ))}
                </div>

                <h4 className="text-sm font-semibold mb-3 px-1 opacity-80" style={tc}>{t.categoryMonotone}</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { id: 'midnight', name: t.themeMidnight, color: 'bg-slate-900' },
                    { id: 'sunset', name: t.themeSunset, color: 'bg-gradient-to-br from-orange-500 to-purple-800' },
                    { id: 'qmul', name: t.themeQMUL, color: 'bg-blue-800' },
                    { id: 'forest', name: t.themeForest, color: 'bg-emerald-900' }
                  ].map((themeOpt) => (
                    <button
                      key={themeOpt.id}
                      onClick={() => setAppTheme(themeOpt.id)}
                      className={`relative flex flex-col items-center justify-center p-5 md:p-6 rounded-2xl border-2 transition-all overflow-hidden ${
                        appTheme === themeOpt.id ? 'scale-105 shadow-lg' : 'border-white/10 hover:border-white/30'
                      }`}
                      style={{ borderColor: appTheme === themeOpt.id ? currentNavActive : undefined }}
                    >
                      <div className={`absolute inset-0 opacity-50 ${themeOpt.color}`}></div>
                      <div className="relative z-10 flex flex-col items-center gap-2">
                        {appTheme === themeOpt.id && <CheckCircle2 size={24} className={`absolute -top-3 ${isRTL ? 'left-[-24px]' : 'right-[-24px]'}`} style={accentStyle} />}
                        <span className="font-medium text-center text-sm md:text-base" style={tc}>{themeOpt.name}</span>
                      </div>
                    </button>
                  ))}
                </div>

                <h4 className="text-sm font-semibold mb-3 px-1 opacity-80" style={tc}>{t.categoryAccessibility}</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { id: 'protanopia', name: t.themeProtanopia, color: 'bg-[#002B5B]' },
                    { id: 'deuteranopia', name: t.themeDeuteranopia, color: 'bg-[#172B4D]' },
                    { id: 'tritanopia', name: t.themeTritanopia, color: 'bg-[#212121]' },
                    { id: 'achromatopsia', name: t.themeAchromatopsia, color: 'bg-[#18181b] grayscale' }
                  ].map((themeOpt) => (
                    <button
                      key={themeOpt.id}
                      onClick={() => setAppTheme(themeOpt.id)}
                      className={`relative flex flex-col items-center justify-center p-5 md:p-6 rounded-2xl border-2 transition-all overflow-hidden ${
                        appTheme === themeOpt.id ? 'scale-105 shadow-lg' : 'border-white/10 hover:border-white/30'
                      }`}
                      style={{ borderColor: appTheme === themeOpt.id ? currentNavActive : undefined }}
                    >
                      <div className={`absolute inset-0 opacity-50 ${themeOpt.color}`}></div>
                      <div className="relative z-10 flex flex-col items-center gap-2">
                        {appTheme === themeOpt.id && <CheckCircle2 size={24} className={`absolute -top-3 ${isRTL ? 'left-[-24px]' : 'right-[-24px]'}`} style={accentStyle} />}
                        <span className="font-medium text-center text-xs md:text-sm" style={tc}>{themeOpt.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {appTheme === 'custom' && (
                <div className="bg-black/20 border border-white/20 rounded-2xl p-5 md:p-6 animate-in fade-in slide-in-from-bottom-4 mb-4">
                  <h3 className="text-lg md:text-xl font-bold mb-5 flex items-center gap-2" style={tc}>
                    <Palette size={22} style={accentStyle} />
                    {t.themeCustom} Options
                  </h3>

                  {/* SIZES SECTION */}
                  <div className="mb-8">
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2" style={tc}>
                      <Settings size={18} style={accentStyle} /> 
                      {t.sizesTitle}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-x-4 gap-y-4">
                      <label className="flex flex-col gap-1.5 text-sm" style={{ color: tc.color, opacity: 0.8 }}>
                        {t.sizeFlag} ({customSizes.flag}x)
                        <input type="range" min="0.5" max="1.5" step="0.1" value={customSizes.flag} onChange={e => setCustomSizes({...customSizes, flag: parseFloat(e.target.value)})} className="w-full" style={{ accentColor: currentNavActive }} />
                      </label>
                      <label className="flex flex-col gap-1.5 text-sm" style={{ color: tc.color, opacity: 0.8 }}>
                        {t.sizeTemp} ({customSizes.temp}x)
                        <input type="range" min="0.5" max="1.5" step="0.1" value={customSizes.temp} onChange={e => setCustomSizes({...customSizes, temp: parseFloat(e.target.value)})} className="w-full" style={{ accentColor: currentNavActive }} />
                      </label>
                      <label className="flex flex-col gap-1.5 text-sm" style={{ color: tc.color, opacity: 0.8 }}>
                        {t.sizeTopTemp} ({customSizes.topTemp}x)
                        <input type="range" min="0.5" max="1.5" step="0.1" value={customSizes.topTemp} onChange={e => setCustomSizes({...customSizes, topTemp: parseFloat(e.target.value)})} className="w-full" style={{ accentColor: currentNavActive }} />
                      </label>
                      <label className="flex flex-col gap-1.5 text-sm" style={{ color: tc.color, opacity: 0.8 }}>
                        {t.sizeWeather} ({customSizes.weather}x)
                        <input type="range" min="0.5" max="1.5" step="0.1" value={customSizes.weather} onChange={e => setCustomSizes({...customSizes, weather: parseFloat(e.target.value)})} className="w-full" style={{ accentColor: currentNavActive }} />
                      </label>
                      <label className="flex flex-col gap-1.5 text-sm" style={{ color: tc.color, opacity: 0.8 }}>
                        {t.sizeText} ({customSizes.text}x)
                        <input type="range" min="0.5" max="1.5" step="0.1" value={customSizes.text} onChange={e => setCustomSizes({...customSizes, text: parseFloat(e.target.value)})} className="w-full" style={{ accentColor: currentNavActive }} />
                      </label>
                      <label className="flex flex-col gap-1.5 text-sm" style={{ color: tc.color, opacity: 0.8 }}>
                        {t.sizeNav} ({customSizes.nav}x)
                        <input type="range" min="0.5" max="1.5" step="0.1" value={customSizes.nav} onChange={e => setCustomSizes({...customSizes, nav: parseFloat(e.target.value)})} className="w-full" style={{ accentColor: currentNavActive }} />
                      </label>
                      <label className="flex flex-col gap-1.5 text-sm" style={{ color: tc.color, opacity: 0.8 }}>
                        {t.sizeComplexGrid} ({customSizes.complexGrid}x)
                        <input type="range" min="0.5" max="1.5" step="0.1" value={customSizes.complexGrid} onChange={e => setCustomSizes({...customSizes, complexGrid: parseFloat(e.target.value)})} className="w-full" style={{ accentColor: currentNavActive }} />
                      </label>
                      <label className="flex flex-col gap-1.5 text-sm" style={{ color: tc.color, opacity: 0.8 }}>
                        {t.sizeForecast} ({customSizes.complexForecast}x)
                        <input type="range" min="0.5" max="1.5" step="0.1" value={customSizes.complexForecast} onChange={e => setCustomSizes({...customSizes, complexForecast: parseFloat(e.target.value)})} className="w-full" style={{ accentColor: currentNavActive }} />
                      </label>
                    </div>
                  </div>
                  
                  <div className="mb-8">
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2" style={tc}>
                      <div className="w-4 h-4 rounded bg-white/50 border border-white" style={{ borderColor: tc.color }}></div> 
                      {t.bgColors}
                    </h4>
                    
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-x-4 gap-y-4 mb-8">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: tc.color, opacity: 0.6 }}>
                          <Sun size={14} /> {t.bgClear}
                        </label>
                        <div className="flex flex-col gap-2">
                          <label className="flex flex-col gap-1 text-xs" style={{ color: tc.color, opacity: 0.8 }}>
                            {t.dayStr} <input type="color" value={customColors.bgDayClear} onChange={e => setCustomColors({...customColors, bgDayClear: e.target.value})} className="w-full h-6 rounded cursor-pointer border-0 bg-transparent p-0" />
                          </label>
                          <label className="flex flex-col gap-1 text-xs" style={{ color: tc.color, opacity: 0.8 }}>
                            {t.nightStr} <input type="color" value={customColors.bgNightClear} onChange={e => setCustomColors({...customColors, bgNightClear: e.target.value})} className="w-full h-6 rounded cursor-pointer border-0 bg-transparent p-0" />
                          </label>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: tc.color, opacity: 0.6 }}>
                          <Cloud size={14} /> {t.bgCloudy}
                        </label>
                        <div className="flex flex-col gap-2">
                          <label className="flex flex-col gap-1 text-xs" style={{ color: tc.color, opacity: 0.8 }}>
                            {t.dayStr} <input type="color" value={customColors.bgDayCloudy} onChange={e => setCustomColors({...customColors, bgDayCloudy: e.target.value})} className="w-full h-6 rounded cursor-pointer border-0 bg-transparent p-0" />
                          </label>
                          <label className="flex flex-col gap-1 text-xs" style={{ color: tc.color, opacity: 0.8 }}>
                            {t.nightStr} <input type="color" value={customColors.bgNightCloudy} onChange={e => setCustomColors({...customColors, bgNightCloudy: e.target.value})} className="w-full h-6 rounded cursor-pointer border-0 bg-transparent p-0" />
                          </label>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: tc.color, opacity: 0.6 }}>
                          <CloudFog size={14} /> {t.bgFog}
                        </label>
                        <div className="flex flex-col gap-2">
                          <label className="flex flex-col gap-1 text-xs" style={{ color: tc.color, opacity: 0.8 }}>
                            {t.dayStr} <input type="color" value={customColors.bgDayFog} onChange={e => setCustomColors({...customColors, bgDayFog: e.target.value})} className="w-full h-6 rounded cursor-pointer border-0 bg-transparent p-0" />
                          </label>
                          <label className="flex flex-col gap-1 text-xs" style={{ color: tc.color, opacity: 0.8 }}>
                            {t.nightStr} <input type="color" value={customColors.bgNightFog} onChange={e => setCustomColors({...customColors, bgNightFog: e.target.value})} className="w-full h-6 rounded cursor-pointer border-0 bg-transparent p-0" />
                          </label>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: tc.color, opacity: 0.6 }}>
                          <CloudRain size={14} /> {t.bgRain}
                        </label>
                        <div className="flex flex-col gap-2">
                          <label className="flex flex-col gap-1 text-xs" style={{ color: tc.color, opacity: 0.8 }}>
                            {t.dayStr} <input type="color" value={customColors.bgDayRain} onChange={e => setCustomColors({...customColors, bgDayRain: e.target.value})} className="w-full h-6 rounded cursor-pointer border-0 bg-transparent p-0" />
                          </label>
                          <label className="flex flex-col gap-1 text-xs" style={{ color: tc.color, opacity: 0.8 }}>
                            {t.nightStr} <input type="color" value={customColors.bgNightRain} onChange={e => setCustomColors({...customColors, bgNightRain: e.target.value})} className="w-full h-6 rounded cursor-pointer border-0 bg-transparent p-0" />
                          </label>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: tc.color, opacity: 0.6 }}>
                          <Snowflake size={14} /> {t.bgSnow}
                        </label>
                        <div className="flex flex-col gap-2">
                          <label className="flex flex-col gap-1 text-xs" style={{ color: tc.color, opacity: 0.8 }}>
                            {t.dayStr} <input type="color" value={customColors.bgDaySnow} onChange={e => setCustomColors({...customColors, bgDaySnow: e.target.value})} className="w-full h-6 rounded cursor-pointer border-0 bg-transparent p-0" />
                          </label>
                          <label className="flex flex-col gap-1 text-xs" style={{ color: tc.color, opacity: 0.8 }}>
                            {t.nightStr} <input type="color" value={customColors.bgNightSnow} onChange={e => setCustomColors({...customColors, bgNightSnow: e.target.value})} className="w-full h-6 rounded cursor-pointer border-0 bg-transparent p-0" />
                          </label>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: tc.color, opacity: 0.6 }}>
                          <CloudLightning size={14} /> {t.bgThunder}
                        </label>
                        <div className="flex flex-col gap-2">
                          <label className="flex flex-col gap-1 text-xs" style={{ color: tc.color, opacity: 0.8 }}>
                            {t.dayStr} <input type="color" value={customColors.bgDayThunder} onChange={e => setCustomColors({...customColors, bgDayThunder: e.target.value})} className="w-full h-6 rounded cursor-pointer border-0 bg-transparent p-0" />
                          </label>
                          <label className="flex flex-col gap-1 text-xs" style={{ color: tc.color, opacity: 0.8 }}>
                            {t.nightStr} <input type="color" value={customColors.bgNightThunder} onChange={e => setCustomColors({...customColors, bgNightThunder: e.target.value})} className="w-full h-6 rounded cursor-pointer border-0 bg-transparent p-0" />
                          </label>
                        </div>
                      </div>
                    </div>

                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2" style={tc}>
                      <Sun size={18} style={sunStyle} /> 
                      {t.elementColors}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-4 mb-8">
                      <label className="flex flex-col gap-1.5 text-sm" style={{ color: tc.color, opacity: 0.8 }}>
                        {t.colorSun}
                        <input type="color" value={customColors.sun} onChange={e => setCustomColors({...customColors, sun: e.target.value})} className="w-full h-10 rounded cursor-pointer border-0 bg-transparent p-0" />
                      </label>
                      <label className="flex flex-col gap-1.5 text-sm" style={{ color: tc.color, opacity: 0.8 }}>
                        {t.colorMoon}
                        <input type="color" value={customColors.moon} onChange={e => setCustomColors({...customColors, moon: e.target.value})} className="w-full h-10 rounded cursor-pointer border-0 bg-transparent p-0" />
                      </label>
                      <label className="flex flex-col gap-1.5 text-sm" style={{ color: tc.color, opacity: 0.8 }}>
                        {t.colorCloud}
                        <input type="color" value={customColors.cloud} onChange={e => setCustomColors({...customColors, cloud: e.target.value})} className="w-full h-10 rounded cursor-pointer border-0 bg-transparent p-0" />
                      </label>
                      <label className="flex flex-col gap-1.5 text-sm" style={{ color: tc.color, opacity: 0.8 }}>
                        {t.colorFog}
                        <input type="color" value={customColors.fog} onChange={e => setCustomColors({...customColors, fog: e.target.value})} className="w-full h-10 rounded cursor-pointer border-0 bg-transparent p-0" />
                      </label>
                      <label className="flex flex-col gap-1.5 text-sm" style={{ color: tc.color, opacity: 0.8 }}>
                        {t.colorRain}
                        <input type="color" value={customColors.rain} onChange={e => setCustomColors({...customColors, rain: e.target.value})} className="w-full h-10 rounded cursor-pointer border-0 bg-transparent p-0" />
                      </label>
                      <label className="flex flex-col gap-1.5 text-sm" style={{ color: tc.color, opacity: 0.8 }}>
                        {t.colorSnow}
                        <input type="color" value={customColors.snow} onChange={e => setCustomColors({...customColors, snow: e.target.value})} className="w-full h-10 rounded cursor-pointer border-0 bg-transparent p-0" />
                      </label>
                      <label className="flex flex-col gap-1.5 text-sm" style={{ color: tc.color, opacity: 0.8 }}>
                        {t.colorThunder}
                        <input type="color" value={customColors.thunder} onChange={e => setCustomColors({...customColors, thunder: e.target.value})} className="w-full h-10 rounded cursor-pointer border-0 bg-transparent p-0" />
                      </label>
                      <label className="flex flex-col gap-1.5 text-sm" style={{ color: tc.color, opacity: 0.8 }}>
                        {t.colorText}
                        <input type="color" value={customColors.text} onChange={e => setCustomColors({...customColors, text: e.target.value})} className="w-full h-10 rounded cursor-pointer border-0 bg-transparent p-0" />
                      </label>
                      <label className="flex flex-col gap-1.5 text-sm" style={{ color: tc.color, opacity: 0.8 }}>
                        {t.colorNavSelected}
                        <input type="color" value={customColors.navSelected} onChange={e => setCustomColors({...customColors, navSelected: e.target.value})} className="w-full h-10 rounded cursor-pointer border-0 bg-transparent p-0" />
                      </label>
                    </div>

                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold" style={tc}>{t.styleSun}</h4>
                        <label className="flex items-center gap-1.5 text-xs cursor-pointer hover:opacity-80 transition-opacity" style={tc}>
                          <input type="checkbox" checked={customFills.sun} onChange={e => setCustomFills({...customFills, sun: e.target.checked})} className="cursor-pointer" />
                          {t.fillIcon}
                        </label>
                      </div>
                      <div className="flex md:flex-wrap gap-2 overflow-x-auto pb-2 custom-scrollbar">
                        {Object.keys(sunIconMap).map(iconKey => {
                          const IconObj = sunIconMap[iconKey];
                          return (
                            <button key={iconKey} onClick={() => setCustomIcons({...customIcons, sun: iconKey})} className={`p-2 md:p-3 rounded-xl flex-shrink-0 transition-all ${customIcons.sun === iconKey ? 'bg-white/20 border-2' : 'bg-white/10 border-2 border-transparent hover:bg-white/20'}`} style={customIcons.sun === iconKey ? { borderColor: currentNavActive } : {}}>
                              <IconObj size={24} style={customIcons.sun === iconKey ? sunStyle : tc} />
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold" style={tc}>{t.styleMoon}</h4>
                        <label className="flex items-center gap-1.5 text-xs cursor-pointer hover:opacity-80 transition-opacity" style={tc}>
                          <input type="checkbox" checked={customFills.moon} onChange={e => setCustomFills({...customFills, moon: e.target.checked})} className="cursor-pointer" />
                          {t.fillIcon}
                        </label>
                      </div>
                      <div className="flex md:flex-wrap gap-2 overflow-x-auto pb-2 custom-scrollbar">
                        {Object.keys(moonIconMap).map(iconKey => {
                          const IconObj = moonIconMap[iconKey];
                          return (
                            <button key={iconKey} onClick={() => setCustomIcons({...customIcons, moon: iconKey})} className={`p-2 md:p-3 rounded-xl flex-shrink-0 transition-all ${customIcons.moon === iconKey ? 'bg-white/20 border-2' : 'bg-white/10 border-2 border-transparent hover:bg-white/20'}`} style={customIcons.moon === iconKey ? { borderColor: currentNavActive } : {}}>
                              <IconObj size={24} style={customIcons.moon === iconKey ? moonStyle : tc} />
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold" style={tc}>{t.styleCloudy}</h4>
                        <label className="flex items-center gap-1.5 text-xs cursor-pointer hover:opacity-80 transition-opacity" style={tc}>
                          <input type="checkbox" checked={customFills.cloudy} onChange={e => setCustomFills({...customFills, cloudy: e.target.checked})} className="cursor-pointer" />
                          {t.fillIcon}
                        </label>
                      </div>
                      <div className="flex md:flex-wrap gap-2 overflow-x-auto pb-2 custom-scrollbar">
                        {Object.keys(cloudyIconMap).map(iconKey => {
                          const IconObj = cloudyIconMap[iconKey];
                          return (
                            <button key={iconKey} onClick={() => setCustomIcons({...customIcons, cloudy: iconKey})} className={`p-2 md:p-3 rounded-xl flex-shrink-0 transition-all ${customIcons.cloudy === iconKey ? 'bg-white/20 border-2' : 'bg-white/10 border-2 border-transparent hover:bg-white/20'}`} style={customIcons.cloudy === iconKey ? { borderColor: currentNavActive } : {}}>
                              <IconObj size={24} style={customIcons.cloudy === iconKey ? cloudStyle : tc} />
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold" style={tc}>{t.styleFog}</h4>
                        <label className="flex items-center gap-1.5 text-xs cursor-pointer hover:opacity-80 transition-opacity" style={tc}>
                          <input type="checkbox" checked={customFills.fog} onChange={e => setCustomFills({...customFills, fog: e.target.checked})} className="cursor-pointer" />
                          {t.fillIcon}
                        </label>
                      </div>
                      <div className="flex md:flex-wrap gap-2 overflow-x-auto pb-2 custom-scrollbar">
                        {Object.keys(fogIconMap).map(iconKey => {
                          const IconObj = fogIconMap[iconKey];
                          return (
                            <button key={iconKey} onClick={() => setCustomIcons({...customIcons, fog: iconKey})} className={`p-2 md:p-3 rounded-xl flex-shrink-0 transition-all ${customIcons.fog === iconKey ? 'bg-white/20 border-2' : 'bg-white/10 border-2 border-transparent hover:bg-white/20'}`} style={customIcons.fog === iconKey ? { borderColor: currentNavActive } : {}}>
                              <IconObj size={24} style={customIcons.fog === iconKey ? fogStyle : tc} />
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold" style={tc}>{t.styleRain}</h4>
                        <label className="flex items-center gap-1.5 text-xs cursor-pointer hover:opacity-80 transition-opacity" style={tc}>
                          <input type="checkbox" checked={customFills.rain} onChange={e => setCustomFills({...customFills, rain: e.target.checked})} className="cursor-pointer" />
                          {t.fillIcon}
                        </label>
                      </div>
                      <div className="flex md:flex-wrap gap-2 overflow-x-auto pb-2 custom-scrollbar">
                        {Object.keys(rainIconMap).map(iconKey => {
                          const IconObj = rainIconMap[iconKey];
                          return (
                            <button key={iconKey} onClick={() => setCustomIcons({...customIcons, rain: iconKey})} className={`p-2 md:p-3 rounded-xl flex-shrink-0 transition-all ${customIcons.rain === iconKey ? 'bg-white/20 border-2' : 'bg-white/10 border-2 border-transparent hover:bg-white/20'}`} style={customIcons.rain === iconKey ? { borderColor: currentNavActive } : {}}>
                              <IconObj size={24} style={customIcons.rain === iconKey ? rainStyle : tc} />
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold" style={tc}>{t.styleSnow}</h4>
                        <label className="flex items-center gap-1.5 text-xs cursor-pointer hover:opacity-80 transition-opacity" style={tc}>
                          <input type="checkbox" checked={customFills.snow} onChange={e => setCustomFills({...customFills, snow: e.target.checked})} className="cursor-pointer" />
                          {t.fillIcon}
                        </label>
                      </div>
                      <div className="flex md:flex-wrap gap-2 overflow-x-auto pb-2 custom-scrollbar">
                        {Object.keys(snowIconMap).map(iconKey => {
                          const IconObj = snowIconMap[iconKey];
                          return (
                            <button key={iconKey} onClick={() => setCustomIcons({...customIcons, snow: iconKey})} className={`p-2 md:p-3 rounded-xl flex-shrink-0 transition-all ${customIcons.snow === iconKey ? 'bg-white/20 border-2' : 'bg-white/10 border-2 border-transparent hover:bg-white/20'}`} style={customIcons.snow === iconKey ? { borderColor: currentNavActive } : {}}>
                              <IconObj size={24} style={customIcons.snow === iconKey ? snowStyle : tc} />
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold" style={tc}>{t.styleThunder}</h4>
                        <label className="flex items-center gap-1.5 text-xs cursor-pointer hover:opacity-80 transition-opacity" style={tc}>
                          <input type="checkbox" checked={customFills.thunder} onChange={e => setCustomFills({...customFills, thunder: e.target.checked})} className="cursor-pointer" />
                          {t.fillIcon}
                        </label>
                      </div>
                      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                        {Object.keys(thunderIconMap).map(iconKey => {
                          const IconObj = thunderIconMap[iconKey];
                          return (
                            <button key={iconKey} onClick={() => setCustomIcons({...customIcons, thunder: iconKey})} className={`p-2 md:p-3 rounded-xl flex-shrink-0 transition-all ${customIcons.thunder === iconKey ? 'bg-white/20 border-2' : 'bg-white/10 border-2 border-transparent hover:bg-white/20'}`} style={customIcons.thunder === iconKey ? { borderColor: currentNavActive } : {}}>
                              <IconObj size={24} style={customIcons.thunder === iconKey ? thunderStyle : tc} />
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                </div>
              )}

            </div>
          )}

          {/* --- PAGE: THEME SELECTION ERROR PREVENTION --- */}
          {activePage === 'theme-selection' && isBatterySave && (
            <div className="flex-1 flex flex-col items-center justify-center pt-4 animate-in fade-in" dir={isRTL ? "rtl" : "ltr"}>
              <Battery size={60} className="text-green-500 mb-4" />
              <h2 className="text-2xl font-bold text-green-500 mb-2">{t.themeDisabledTitle}</h2>
              <p className="text-green-600 text-center px-6 max-w-md">{t.themeDisabledDesc}</p>
              <button onClick={() => setActivePage('options')} className="mt-6 px-6 py-2 bg-black border border-green-500 text-green-500 rounded-lg hover:bg-green-900/30 transition-colors">
                {t.backToSettings}
              </button>
            </div>
          )}

          {/* --- PAGE: MAP --- */}
          {activePage === 'map' && (
            <div className="flex-1 flex flex-col pt-4 px-6 md:px-12 pb-12 animate-in fade-in duration-500" dir={isRTL ? "rtl" : "ltr"}>
              <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-2" style={tc}>
                <Map size={28} />
                {t.mapTitle}
              </h2>
              
              {/* Show loading state */}
              {isLoadingLocation && (
                <div className={`rounded-2xl p-8 text-center ${isBatterySave ? 'bg-black border border-green-500/30' : 'bg-white/10'}`}>
                  <div className="animate-pulse" style={tc}>{t.mapGettingLoc}</div>
                </div>
              )}
              
              {/* Show error state */}
              {locationError && !isLoadingLocation && (
                <div className="bg-red-500/20 backdrop-blur-sm rounded-2xl p-4 mb-4">
                  <p className="text-white text-sm">{locationError}</p>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="mt-2 text-xs bg-white/20 px-3 py-1 rounded-full"
                  >
                    {t.mapRetry}
                  </button>
                </div>
              )}
              
              {/* Display the map */}
              {!isLoadingLocation && (
                <div className="space-y-4">
                  <CampusMap 
                    userLocation={userLocation}
                    campusLocation={{
                      lat: selectedLocation.lat,
                      lng: selectedLocation.lon
                    }}
                    currentCity={selectedLocation}
                    t={t}
                    isRTL={isRTL}
                  />
                  
                  {/* Location info panel */}
                  <div className={`p-5 rounded-2xl ${isBatterySave ? 'bg-black border border-green-500/30' : 'bg-white/10 backdrop-blur-sm'}`}>
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className={isRTL ? 'text-start' : 'text-left'}>
                        <p className="text-sm font-semibold" style={tc}>{t.mapYourLocation}</p>
                        {userLocation ? (
                          <p className="text-xs mt-1" style={{ color: tc.color, opacity: 0.8 }}>
                            Lat: {userLocation.lat.toFixed(4)}° | Lng: {userLocation.lng.toFixed(4)}°
                          </p>
                        ) : (
                          <p className="text-xs mt-1" style={{ color: tc.color, opacity: 0.8 }}>{t.mapLocAccessReq}</p>
                        )}
                      </div>
                      <div className={isRTL ? 'text-start md:text-end' : 'text-left md:text-right'}>
                        <p className="text-sm font-semibold" style={tc}>{t.mapCurrentUni}</p>
                        <p className="text-xs mt-1" style={{ color: tc.color, opacity: 0.8 }}>
                          {selectedLocation.uni} - {selectedLocation.campus}
                        </p>
                        <p className="text-xs" style={{ color: tc.color, opacity: 0.6 }}>
                          {selectedLocation.city}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Distance indicator */}
                  {userLocation && (
                    <div className={`p-5 rounded-2xl ${isBatterySave ? 'bg-black border border-green-500/30' : 'bg-white/10 backdrop-blur-sm'}`}>
                      <p className="text-sm" style={tc}>
                        📍 {t.mapDistanceTo} {selectedLocation.uni}: ~{calculateDistance(userLocation, { lat: selectedLocation.lat, lng: selectedLocation.lon })} km
                      </p>
                    </div>
                  )}
                  
                  {/* Info note about university search */}
                  <div className={`p-4 rounded-2xl ${isBatterySave ? 'bg-green-500/10 border border-green-500/30' : 'bg-white/5'}`}>
                    <p className={`text-xs ${isRTL ? 'text-start' : 'text-center'}`} style={{ color: tc.color, opacity: 0.6 }}>
                      {t.mapTip}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

    </div>
  );
}