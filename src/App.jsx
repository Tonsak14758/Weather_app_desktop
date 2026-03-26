import React, { useState, useEffect } from 'react';
import { 
  Sun, Moon, CloudRain, Thermometer, 
  Home, Map, Menu, Glasses, Umbrella,
  Settings, User, Bell, Globe, Palette, ChevronLeft, CheckCircle2, Battery, 
  SunDim, SunMedium, Sunrise, Sunset, CloudSun, Star, Sparkles, Flame, Zap,
  MoonStar, CloudMoon, StarHalf, Cloud, Snowflake,
  CloudDrizzle, CloudLightning, CloudSnow, CloudHail, Droplets, CloudRainWind, Tornado, Wind, Waves,
  Gauge, CloudFog, Activity, ArrowDown, ArrowUp, Loader2, Search
} from 'lucide-react';

// UPDATED: Completely overhauled icon maps to be highly coherent to a real weather app
const sunIconMap = { Sun, SunMedium, SunDim, Sunrise, Sunset, CloudSun, Thermometer, Glasses, Flame, Zap };
const moonIconMap = { Moon, MoonStar, CloudMoon, Star, StarHalf, Sparkles, Cloud, CloudFog, Wind, Snowflake };
const rainIconMap = { CloudRain, CloudDrizzle, CloudLightning, CloudSnow, CloudHail, CloudRainWind, Droplets, Umbrella, Tornado, Waves };

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
  { city: "Cardiff", uni: "University of Cardiff", campus: "Cathays Park", lat: 51.4883, lon: -3.1769 }
];

export default function App() {
  const [isDay, setIsDay] = useState(true);
  const [isRain, setIsRain] = useState(false); 
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
  const [forecastData, setForecastData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  const [customColors, setCustomColors] = useState({
    dayClear: '#3B82F6',
    nightClear: '#0F3460',
    dayRain: '#64748B',
    nightRain: '#1E293B',
    sun: '#FBBF24',     
    moon: '#FDE047',    
    rain: '#9CA3AF',    
    text: '#FFFFFF',     
    navSelected: '#FBBF24' 
  });
  
  const [customSizes, setCustomSizes] = useState({
    flag: 1,
    temp: 1,
    weather: 1,
    text: 1,
    nav: 1,
    topTemp: 1 
  });
  
  const [customIcons, setCustomIcons] = useState({
    sun: 'Sun',
    moon: 'Moon',
    rain: 'CloudRain'
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

  // --- OPEN-METEO API FETCH EFFECT ---
  useEffect(() => {
    const fetchWeather = async () => {
      setIsLoading(true);
      
      try {
        const { lat, lon } = selectedLocation;

        // UPDATED: Added daily parameters for the 7-day forecast (max temp, min temp, and WMO weather code) and limited to 8 days (today + 7)
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,is_day,precipitation,wind_speed_10m,surface_pressure&daily=sunrise,sunset,uv_index_max,temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&forecast_days=8`);
        
        // Fetch Air Quality Data
        const aqiRes = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=european_aqi`);
        
        if (!weatherRes.ok || !aqiRes.ok) {
           throw new Error('Open-Meteo API Request Failed');
        }
        
        const data = await weatherRes.json();
        const aqiData = await aqiRes.json();
        
        const current = data.current;
        const daily = data.daily;
        
        const isRainingNow = current.precipitation > 0;
        const isDaytimeNow = current.is_day === 1;

        const formatTime = (isoString) => {
          return new Date(isoString).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        };

        const aqi = aqiData.current.european_aqi;
        let pollutionText = `${aqi} (Good)`;
        if (aqi > 20) pollutionText = `${aqi} (Fair)`;
        if (aqi > 40) pollutionText = `${aqi} (Moderate)`;
        if (aqi > 60) pollutionText = `${aqi} (Poor)`;
        if (aqi > 80) pollutionText = `${aqi} (Very Poor)`;

        // Extract the 7-day forecast array (Starting at index 1 for tomorrow)
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
          forecast: forecastArr // Inject forecast into state
        });

        setIsDay(isDaytimeNow);
        setIsRain(isRainingNow);
        setApiError(null);

        setForecastData(forecastArr.map(d => ({ ...d, date: new Date(d.dateRaw) })));

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
          temp: 11,
          humidity: "68%",
          wind: "14.2 km/h",
          pressure: "1012 hPa",
          sunrise: "06:14 AM",
          sunset: "18:42 PM",
          uv: "4",
          pollution: "22 (Low)",
          forecast: [
            { dateRaw: "2026-03-26", minTemp: 5, maxTemp: 12, weatherCode: 3 },
            { dateRaw: "2026-03-27", minTemp: 7, maxTemp: 14, weatherCode: 61 },
            { dateRaw: "2026-03-28", minTemp: 2, maxTemp: 8, weatherCode: 71 },
            { dateRaw: "2026-03-29", minTemp: 10, maxTemp: 16, weatherCode: 0 },
            { dateRaw: "2026-03-30", minTemp: 9, maxTemp: 15, weatherCode: 95 },
            { dateRaw: "2026-03-31", minTemp: 8, maxTemp: 13, weatherCode: 2 },
            { dateRaw: "2026-04-01", minTemp: 11, maxTemp: 18, weatherCode: 0 }
          ]
        });
        const today = new Date();
        setForecastData(Array.from({ length: 6 }, (_, i) => {
          const d = new Date(today); d.setDate(today.getDate() + i + 1);
          return { date: d, maxTemp: [11,10,13,11,11,12][i], minTemp: [7,6,4,3,7,5][i], weatherCode: [0,2,61,3,4,0][i] };
        }));
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

  // Helper for rendering temperatures dynamically in the forecast list
  const convertTemp = (val) => {
    if (unit === 'C') return Math.round(val);
    if (unit === 'F') return Math.round(val * 9/5 + 32);
    if (unit === 'K') return Math.round(val + 273.15);
  };

  const cycleWeather = () => {
    if (isDay && !isRain) { setIsDay(false); setIsRain(false); } 
    else if (!isDay && !isRain) { setIsDay(true); setIsRain(true); } 
    else if (isDay && isRain) { setIsDay(false); setIsRain(true); } 
    else { setIsDay(true); setIsRain(false); } 
  };

  const getThemeBackground = () => {
    if (isBatterySave) return 'bg-black'; 
    if (appTheme === 'custom') return ''; 
    switch(appTheme) {
      case 'midnight': return 'bg-slate-900';
      case 'sunset': return 'bg-gradient-to-br from-orange-500 to-purple-800';
      case 'qmul': return 'bg-blue-800'; 
      case 'forest': return 'bg-emerald-900';
      case 'protanopia': return 'bg-[#002B5B]'; 
      case 'deuteranopia': return 'bg-[#172B4D]'; 
      case 'tritanopia': return 'bg-[#212121]'; 
      case 'dynamic':
      default:
        return isDay ? (isRain ? 'bg-slate-500' : 'bg-[#3B82F6]') : (isRain ? 'bg-slate-800' : 'bg-[#0F3460]');
    }
  };

  const getCustomBackgroundColor = () => {
    if (isBatterySave) return '#000000'; 
    if (appTheme !== 'custom') return undefined;
    if (isDay && !isRain) return customColors.dayClear;
    if (!isDay && !isRain) return customColors.nightClear;
    if (isDay && isRain) return customColors.dayRain;
    if (!isDay && isRain) return customColors.nightRain;
  };

  // UPDATED: Expanded Dictionary to support 7-Day Forecast
  const text = {
    EN: { gearClearDay: "Gear: Sunglasses only", gearClearNight: "Gear: Jacket recommended", gearRain: "Gear: Umbrella required", searchPlaceholder: "Search UK Campus...", optionsTitle: "Settings & Options", langPrefTitle: "Language Preferences", primaryLangLabel: "Primary Language", secondaryLangLabel: "Secondary Language (Header Toggle)", studentProfile: "Student Profile", manageId: "Manage your university ID", notifications: "Notifications", weatherAlerts: "Severe weather alerts", mapTitle: "Campus Map", mapComingSoon: "Interactive map feature coming in Phase 2!", themeTitle: "App Theme", themeDesc: "Customize your app's appearance", themeDynamic: "Dynamic (Weather)", themeMidnight: "Midnight Dark", themeSunset: "Sunset Glow", themeQMUL: "QMUL Blue", themeForest: "Forest Green", themeProtanopia: "Protanopia (Red-Blind)", themeDeuteranopia: "Deuteranopia (Green-Blind)", themeTritanopia: "Tritanopia (Blue-Blind)", previewTitle: "Live Preview", themeCustom: "Custom Theme", colorDayClear: "Day (Clear)", colorNightClear: "Night (Clear)", colorDayRain: "Day (Rain)", colorNightRain: "Night (Rain)", styleSun: "Sun Style", styleMoon: "Moon Style", styleRain: "Rain Style", tapToToggle: "Tap to cycle weather", bgColors: "Backgrounds", elementColors: "Elements & Text", colorSun: "Sun Color", colorMoon: "Moon Color", colorRain: "Rain Color", colorText: "Text Color", colorNavSelected: "Active Nav", modeTitle: "App Mode", modeSimple: "Simple Mode", modeComplex: "Complex Mode", modeBattery: "Battery Saver", humidity: "Humidity", wind: "Wind", uv: "UV Index", pollution: "Pollution (AQI)", pressure: "Pressure", sunrise: "Sunrise", sunset: "Sunset", sizesTitle: "Component Sizes", sizeFlag: "Flag Size", sizeTemp: "Temp Size", sizeWeather: "Weather Size", sizeText: "Text Size", sizeNav: "Nav Size", sizeTopTemp: "Top Temp Size", forecastTitle: "7-Day Forecast", descClear: "Clear Sky", descCloudy: "Partly Cloudy", descFog: "Foggy", descRain: "Rain Showers", descSnow: "Snowfall", descThunder: "Thunderstorms", gearSnow: "Gear: Heavy Coat", gearThunder: "Gear: Stay Indoors" },
    TH: { gearClearDay: "อุปกรณ์: ใส่แว่นกันแดด", gearClearNight: "อุปกรณ์: แนะนำเสื้อแจ็คเก็ต", gearRain: "อุปกรณ์: ต้องการร่ม", searchPlaceholder: "ค้นหาวิทยาเขตในสหราชอาณาจักร...", optionsTitle: "การตั้งค่าและตัวเลือก", langPrefTitle: "การตั้งค่าภาษา", primaryLangLabel: "ภาษาหลัก", secondaryLangLabel: "ภาษารอง (สลับที่ส่วนหัว)", studentProfile: "โปรไฟล์นักศึกษา", manageId: "จัดการรหัสนักศึกษา", notifications: "การแจ้งเตือน", weatherAlerts: "เตือนสภาพอากาศรุนแรง", mapTitle: "แผนที่วิทยาเขต", mapComingSoon: "แผนที่แบบโต้ตอบจะมาในเฟส 2!", themeTitle: "ธีมแอป", themeDesc: "ปรับแต่งลักษณะแอปของคุณ", themeDynamic: "ไดนามิก (ตามสภาพอากาศ)", themeMidnight: "มิดไนท์ดาร์ก", themeSunset: "แสงอาทิตย์ตก", themeQMUL: "สีฟ้า QMUL", themeForest: "สีเขียวป่า", themeProtanopia: "ตาบอดสีแดง (Protanopia)", themeDeuteranopia: "ตาบอดสีเขียว (Deuteranopia)", themeTritanopia: "ตาบอดสีน้ำเงิน (Tritanopia)", previewTitle: "แสดงตัวอย่างสด", themeCustom: "ธีมกำหนดเอง", colorDayClear: "กลางวัน (แจ่มใส)", colorNightClear: "กลางคืน (แจ่มใส)", colorDayRain: "กลางวัน (ฝนตก)", colorNightRain: "กลางคืน (ฝนตก)", styleSun: "สไตล์พระอาทิตย์", styleMoon: "สไตล์พระจันทร์", styleRain: "สไตล์ฝน", tapToToggle: "แตะเพื่อสลับสภาพอากาศ", bgColors: "สีพื้นหลัง", elementColors: "องค์ประกอบและข้อความ", colorSun: "สีพระอาทิตย์", colorMoon: "สีพระจันทร์", colorRain: "สีฝน", colorText: "สีข้อความ", colorNavSelected: "สีเมนูที่เลือก", modeTitle: "โหมดแอป", modeSimple: "โหมดปกติ", modeComplex: "โหมดรายละเอียด", modeBattery: "ประหยัดแบตเตอรี่", humidity: "ความชื้น", wind: "ลม", uv: "ดัชนี UV", pollution: "มลพิษ", pressure: "ความกดอากาศ", sunrise: "พระอาทิตย์ขึ้น", sunset: "พระอาทิตย์ตก", sizesTitle: "ขนาดองค์ประกอบ", sizeFlag: "ขนาดธง", sizeTemp: "ขนาดอุณหภูมิ", sizeWeather: "ขนาดไอคอน", sizeText: "ขนาดข้อความ", sizeNav: "ขนาดแถบนำทาง", sizeTopTemp: "ขนาดอุณหภูมิด้านบน", forecastTitle: "พยากรณ์ 7 วัน", descClear: "ท้องฟ้าแจ่มใส", descCloudy: "มีเมฆบางส่วน", descFog: "มีหมอก", descRain: "ฝนตก", descSnow: "หิมะตก", descThunder: "พายุฝนฟ้าคะนอง", gearSnow: "อุปกรณ์: เสื้อกันหนาวหนา", gearThunder: "อุปกรณ์: อยู่ในร่ม" },
    ZH: { gearClearDay: "装备：仅需太阳镜", gearClearNight: "装备：建议穿外套", gearRain: "装备：需要雨伞", searchPlaceholder: "搜索英国校园...", optionsTitle: "设置与选项", langPrefTitle: "语言偏好", primaryLangLabel: "主要语言", secondaryLangLabel: "次要语言 (顶部切换)", studentProfile: "学生档案", manageId: "管理您的大学 ID", notifications: "通知", weatherAlerts: "恶劣天气警报", mapTitle: "校园地图", mapComingSoon: "交互式地图功能将在第二阶段推出！", themeTitle: "应用主题", themeDesc: "自定义您的应用外观", themeDynamic: "动态 (天气)", themeMidnight: "午夜深黑", themeSunset: "日落晚霞", themeQMUL: "QMUL 蓝", themeForest: "森林绿", themeProtanopia: "红色盲安全", themeDeuteranopia: "绿色盲安全", themeTritanopia: "蓝色盲安全", previewTitle: "实时预览", themeCustom: "自定义主题", colorDayClear: "白天 (晴)", colorNightClear: "夜晚 (晴)", colorDayRain: "白天 (雨)", colorNightRain: "夜晚 (雨)", styleSun: "太阳样式", styleMoon: "月亮样式", styleRain: "雨天样式", tapToToggle: "点击切换天气", bgColors: "背景颜色", elementColors: "元素与文本", colorSun: "太阳颜色", colorMoon: "月亮颜色", colorRain: "雨水颜色", colorText: "文本颜色", colorNavSelected: "激活导航", modeTitle: "应用模式", modeSimple: "简单模式", modeComplex: "复杂模式", modeBattery: "省电模式", humidity: "湿度", wind: "风速", uv: "紫外线指数", pollution: "污染指数", pressure: "气压", sunrise: "日出", sunset: "日落", sizesTitle: "组件大小", sizeFlag: "国旗大小", sizeTemp: "温度大小", sizeWeather: "天气图标大小", sizeText: "文本大小", sizeNav: "导航栏大小", sizeTopTemp: "顶部温度大小", forecastTitle: "7天预报", descClear: "晴朗", descCloudy: "多云", descFog: "有雾", descRain: "下雨", descSnow: "下雪", descThunder: "雷暴", gearSnow: "装备：厚外套", gearThunder: "装备：留在室内" },
    FA: { gearClearDay: "تجهیزات: فقط عینک آفتابی", gearClearNight: "تجهیزات: ژاکت توصیه می‌شود", gearRain: "تجهیزات: چتر الزامی است", searchPlaceholder: "جستجوی پردیس بریتانیا...", optionsTitle: "تنظیمات و گزینه‌ها", langPrefTitle: "تنظیمات زبان", primaryLangLabel: "زبان اصلی", secondaryLangLabel: "زبان دوم (تغییر در سربرگ)", studentProfile: "پروفایل دانشجو", manageId: "مدیریت شناسه دانشگاه", notifications: "اعلان‌ها", weatherAlerts: "هشدارهای آب و هوای شدید", mapTitle: "نقشه پردیس", mapComingSoon: "ویژگی نقشه تعاملی در فاز 2 اضافه می‌شود!", themeTitle: "تم برنامه", themeDesc: "ظاهر برنامه خود را سفارشی کنید", themeDynamic: "پویا (آب و هوا)", themeMidnight: "تاریکی نیمه شب", themeSunset: "درخشش غروب", themeQMUL: "آبی QMUL", themeForest: "سبز جنگلی", themeProtanopia: "کوررنگی قرمز", themeDeuteranopia: "کوررنگی سبز", themeTritanopia: "کوررنگی آبی", previewTitle: "پیش‌نمایش زنده", themeCustom: "تم سفارشی", colorDayClear: "روز (صاف)", colorNightClear: "شب (صاف)", colorDayRain: "روز (بارانی)", colorNightRain: "شب (بارانی)", styleSun: "سبک خورشید", styleMoon: "سبک ماه", styleRain: "سبک باران", tapToToggle: "برای تغییر آب و هوا ضربه بزنید", bgColors: "رنگ‌های پس‌زمینه", elementColors: "عناصر و متن", colorSun: "رنگ خورشید", colorMoon: "رنگ ماه", colorRain: "رنگ باران", colorText: "رنگ متن", colorNavSelected: "ناوبری فعال", modeTitle: "حالت برنامه", modeSimple: "حالت ساده", modeComplex: "حالت پیشرفته", modeBattery: "ذخیره باتری", humidity: "رطوبت", wind: "باد", uv: "شاخص UV", pollution: "آلودگی", pressure: "فشار", sunrise: "طلوع آفتاب", sunset: "غروب آفتاب", sizesTitle: "اندازه اجزا", sizeFlag: "اندازه پرچم", sizeTemp: "اندازه دما", sizeWeather: "اندازه نماد آب و هوا", sizeText: "اندازه متن", sizeNav: "اندازه نوار ناوبری", sizeTopTemp: "اندازه دمای بالا", forecastTitle: "پیش بینی 7 روزه", descClear: "آسمان صاف", descCloudy: "نیمه ابری", descFog: "مه آلود", descRain: "بارانی", descSnow: "برفی", descThunder: "رعد و برق", gearSnow: "تجهیزات: پالتو سنگین", gearThunder: "تجهیزات: در خانه بمانید" },
    AR: { gearClearDay: "المعدات: نظارات شمسية فقط", gearClearNight: "المعدات: ينصح بسترة", gearRain: "المعدات: مظلة مطلوبة", searchPlaceholder: "ابحث عن حرم جامعي في المملكة المتحدة...", optionsTitle: "الإعدادات والخيارات", langPrefTitle: "تفضيلات اللغة", primaryLangLabel: "اللغة الأساسية", secondaryLangLabel: "اللغة الثانوية (تبديل في الأعلى)", studentProfile: "ملف الطالب", manageId: "إدارة معرف الجامعة", notifications: "الإشعارات", weatherAlerts: "تنبيهات الطقس القاسي", mapTitle: "خريطة الحرم الجامعي", mapComingSoon: "ميزة الخريطة التفاعلية قادمة في المرحلة الثانية!", themeTitle: "سمة التطبيق", themeDesc: "تخصيص مظهر التطبيق الخاص بك", themeDynamic: "ديناميكي (الطقس)", themeMidnight: "الظلام في منتصف الليل", themeSunset: "توهج الغروب", themeQMUL: "أزرق QMUL", themeForest: "أخضر الغابة", themeProtanopia: "عمى الألوان الأحمر", themeDeuteranopia: "عمى الألوان الأخضر", themeTritanopia: "عمى الألوان الأزرق", previewTitle: "معاينة حية", themeCustom: "سمة مخصصة", colorDayClear: "نهار (صافي)", colorNightClear: "ليل (صافي)", colorDayRain: "نهار (ممطر)", colorNightRain: "ليل (ممطر)", styleSun: "نمط الشمس", styleMoon: "نمط القمر", styleRain: "نمط المطر", tapToToggle: "انقر لتبديل الطقس", bgColors: "ألوان الخلفية", elementColors: "العناصر والنص", colorSun: "لون الشمس", colorMoon: "لون القمر", colorRain: "لون المطر", colorText: "لون النص", colorNavSelected: "التنقل النشط", modeTitle: "وضع التطبيق", modeSimple: "الوضع البسيط", modeComplex: "الوضع المتقدم", modeBattery: "توفير البطارية", humidity: "الرطوبة", wind: "الرياح", uv: "مؤشر UV", pollution: "التلوث", pressure: "الضغط", sunrise: "شروق الشمس", sunset: "غروب الشمس", sizesTitle: "أحجام المكونات", sizeFlag: "حجم العلم", sizeTemp: "حجم درجة الحرارة", sizeWeather: "حجم أيقونة الطقس", sizeText: "حجم النص", sizeNav: "حجم شريط التنقل", sizeTopTemp: "حجم الحرارة العلوي", forecastTitle: "توقعات 7 أيام", descClear: "سماء صافية", descCloudy: "غائم جزئيا", descFog: "ضبابي", descRain: "ممطر", descSnow: "ثلج", descThunder: "عاصفة رعدية", gearSnow: "المعدات: معطف ثقيل", gearThunder: "المعدات: ابق في الداخل" },
    HI: { gearClearDay: "गियर: केवल धूप का चश्मा", gearClearNight: "गियर: जैकेट की सलाह", gearRain: "गियर: छाता आवश्यक है", searchPlaceholder: "यूके कैंपस खोजें...", optionsTitle: "सेटिंग्स और विकल्प", langPrefTitle: "भाषा प्राथमिकताएँ", primaryLangLabel: "प्राथमिक भाषा", secondaryLangLabel: "द्वितीयक भाषा (हेडर टॉगल)", studentProfile: "छात्र प्रोफ़ाइल", manageId: "अपनी विश्वविद्यालय आईडी प्रबंधित करें", notifications: "सूचनाएं", weatherAlerts: "गंभीर मौसम की चेतावनी", mapTitle: "परिसर का नक्शा", mapComingSoon: "इंटरएक्टिव मैप सुविधा चरण 2 में आ रही है!", themeTitle: "ऐप थीम", themeDesc: "अपने ऐप का स्वरूप अनुकूलित करें", themeDynamic: "डायनामिक (मौसम)", themeMidnight: "मिडनाइट डार्क", themeSunset: "सनसेट ग्लो", themeQMUL: "QMUL ब्लू", themeForest: "फॉरेस्ट ग्रीन", themeProtanopia: "प्रोटानोपिया (लाल-अंधा)", themeDeuteranopia: "ड्यूटेरानोपिया (हरा-अंधा)", themeTritanopia: "ट्रिटानोपिया (नीला-अंधा)", previewTitle: "लाइव पूर्वावलोकन", themeCustom: "कस्टम थीम", colorDayClear: "दिन (साफ़)", colorNightClear: "रात (साफ़)", colorDayRain: "दिन (बारिश)", colorNightRain: "रात (बारिश)", styleSun: "सूर्य शैली", styleMoon: "चंद्रमा शैली", styleRain: "बारिश शैली", tapToToggle: "मौसम चक्र के लिए टैप करें", bgColors: "पृष्ठभूमि रंग", elementColors: "तत्व और पाठ", colorSun: "सूर्य का रंग", colorMoon: "चंद्रमा का रंग", colorRain: "बारिश का रंग", colorText: "टेक्स्ट का रंग", colorNavSelected: "सक्रिय नेव", modeTitle: "ऐप मोड", modeSimple: "सरल मोड", modeComplex: "जटिल मोड", modeBattery: "बैटरी सेवर", humidity: "नमी", wind: "हवा", uv: "यूवी इंडेक्स", pollution: "प्रदूषण", pressure: "दबाव", sunrise: "सूर्योदय", sunset: "सूर्यास्त", sizesTitle: "घटक आकार", sizeFlag: "ध्वज का आकार", sizeTemp: "तापमान का आकार", sizeWeather: "मौसम आइकन का आकार", sizeText: "टेक्स्ट का आकार", sizeNav: "नेव बार का आकार", sizeTopTemp: "शीर्ष तापमान आकार", forecastTitle: "7-दिन का पूर्वानुमान", descClear: "साफ आसमान", descCloudy: "आंशिक रूप से बादल", descFog: "कोहरा", descRain: "बारिश", descSnow: "बर्फ", descThunder: "आंधी", gearSnow: "गियर: भारी कोट", gearThunder: "गियर: घर के अंदर रहें" },
    BN: { gearClearDay: "গিয়ার: শুধুমাত্র সানগ্লাস", gearClearNight: "গিয়ার: জ্যাকেট প্রস্তাবিত", gearRain: "গিয়ার: ছাতা প্রয়োজন", searchPlaceholder: "ইউকে ক্যাম্পাস খুঁজুন...", optionsTitle: "সেটিংস এবং বিকল্প", langPrefTitle: "ভাষা পছন্দ", primaryLangLabel: "প্রাথমিক ভাষা", secondaryLangLabel: "মাধ্যমিক ভাষা (হেডার টগল)", studentProfile: "ছাত্র প্রোফাইল", manageId: "আপনার বিশ্ববিদ্যালয় আইডি পরিচালনা করুন", notifications: "বিজ্ঞপ্তি", weatherAlerts: "তীব্র আবহাওয়ার সতর্কতা", mapTitle: "ক্যাম্পাস মানচিত্র", mapComingSoon: "ইন্টারেক্টিভ মানচিত্র বৈশিষ্ট্য ফেজ 2 এ আসছে!", themeTitle: "অ্যাপ থিম", themeDesc: "আপনার অ্যাপের চেহারা কাস্টমাইজ করুন", themeDynamic: "ডায়নামিক (আবহাওয়া)", themeMidnight: "মিডনাইট ডার্ক", themeSunset: "সানসেট গ্লো", themeQMUL: "QMUL নীল", themeForest: "ফরেস্ট গ্রিন", themeProtanopia: "প্রোটানোপিয়া (লাল-অন্ধ)", themeDeuteranopia: "ডিউটেরানোপিয়া (সবুজ-অন্ধ)", themeTritanopia: "ট্রিটানোপিয়া (নীল-অন্ধ)", previewTitle: "লাইভ প্রিভিউ", themeCustom: "কাস্টম থিম", colorDayClear: "দিন (পরিষ্কার)", colorNightClear: "রাত (পরিষ্কার)", colorDayRain: "দিন (বৃষ্টি)", colorNightRain: "রাত (বৃষ্টি)", styleSun: "সূর্য শৈলী", styleMoon: "চাঁদ শৈলী", styleRain: "বৃষ্টি শৈলী", tapToToggle: "আবহাওয়া পরিবর্তন করতে আলতো চাপুন", bgColors: "পটভূমির রঙ", elementColors: "উপাদান এবং টেক্সট", colorSun: "সূর্যের রঙ", colorMoon: "চাঁদের রঙ", colorRain: "বৃষ্টির রঙ", colorText: "টেক্সটের রঙ", colorNavSelected: "সক্রিয় নেভ", modeTitle: "অ্যাপ মোড", modeSimple: "সাধারণ মোড", modeComplex: "জটিল মোড", modeBattery: "ব্যাটারি সেভার", humidity: "আর্দ্রতা", wind: "বাতাস", uv: "ইউভি সূচক", pollution: "দূষণ", pressure: "চাপ", sunrise: "সূর্যোদয়", sunset: "সূর্যাস্ত", sizesTitle: "উপাদানের আকার", sizeFlag: "পতাকার আকার", sizeTemp: "তাপমাত্রার আকার", sizeWeather: "আবহাওয়া আইকনের আকার", sizeText: "টেক্সটের আকার", sizeNav: "নেভিগেশন বারের আকার", sizeTopTemp: "শীর্ষ তাপমাত্রার আকার", forecastTitle: "৭ দিনের পূর্বাভাস", descClear: "পরিষ্কার আকাশ", descCloudy: "আংশিক মেঘলা", descFog: "কুয়াশা", descRain: "বৃষ্টি", descSnow: "তুষার", descThunder: "বজ্রপাত", gearSnow: "গিয়ার: ভারী কোট", gearThunder: "গিয়ার: ঘরে থাকুন" }
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

  const toggleLanguage = () => {
    setIsViewingPrimary(!isViewingPrimary);
  };

  const isRTL = activeLang === 'AR' || activeLang === 'FA';

  const ActiveSun = sunIconMap[customIcons.sun] || Sun;
  const ActiveMoon = moonIconMap[customIcons.moon] || Moon;
  const ActiveRain = rainIconMap[customIcons.rain] || CloudRain;

  let currentTextColor = '#FFFFFF';
  let currentSunColor = '#FBBF24'; 
  let currentMoonColor = '#FDE047'; 
  let currentRainColor = '#9CA3AF'; 
  let currentNavActive = '#FBBF24'; 
  let currentNavInactive = '#FFFFFF';

  const isColorBlindMode = ['protanopia', 'deuteranopia', 'tritanopia'].includes(appTheme);
  const showTextFlag = isBatterySave || isColorBlindMode;

  if (isBatterySave) {
    currentTextColor = '#FFFFFF';
    currentSunColor = '#FFFFFF';
    currentMoonColor = '#FFFFFF';
    currentRainColor = '#FFFFFF';
    currentNavActive = '#22C55E'; 
    currentNavInactive = '#9CA3AF';
  } else if (appTheme === 'custom') {
    currentTextColor = customColors.text;
    currentSunColor = customColors.sun;
    currentMoonColor = customColors.moon;
    currentRainColor = customColors.rain;
    currentNavActive = customColors.navSelected;
    currentNavInactive = customColors.text;
  } else if (appTheme === 'protanopia' || appTheme === 'deuteranopia') {
    currentSunColor = '#FFC20A'; 
    currentMoonColor = '#E2E8F0'; 
    currentRainColor = '#0C7BDC'; 
    currentNavActive = '#FFC20A'; 
  } else if (appTheme === 'tritanopia') {
    currentSunColor = '#FF5252'; 
    currentMoonColor = '#E2E8F0'; 
    currentRainColor = '#00BFA5'; 
    currentNavActive = '#00BFA5'; 
  }

  const wmoToEmoji = (code) => {
    if (code === 0) return '☀️';
    if (code <= 3) return '⛅';
    if (code <= 48) return '🌫️';
    if (code <= 57) return '🌦️';
    if (code <= 67) return '🌧️';
    if (code <= 77) return '❄️';
    if (code <= 82) return '🌧️';
    if (code <= 86) return '🌨️';
    return '⛈️';
  };

  const tc = { color: currentTextColor };
  const sunStyle = { color: currentSunColor, fill: currentSunColor };
  const moonStyle = { color: currentMoonColor, fill: currentMoonColor };
  const rainStyle = { color: currentRainColor, fill: currentRainColor };
  const accentStyle = { color: currentNavActive };
  const activeNavStyle = { color: currentNavActive }; 
  const inactiveNavStyle = { color: currentNavInactive }; 

  const flagMult = appTheme === 'custom' && !isBatterySave ? customSizes.flag : 1;
  const tempMult = appTheme === 'custom' && !isBatterySave ? customSizes.temp : 1;
  const weatherMult = appTheme === 'custom' && !isBatterySave ? customSizes.weather : 1;
  const textMult = appTheme === 'custom' && !isBatterySave ? customSizes.text : 1;
  const navMult = appTheme === 'custom' && !isBatterySave ? customSizes.nav : 1;
  const topTempMult = appTheme === 'custom' && !isBatterySave ? customSizes.topTemp : 1;

  // UPDATED: Algorithm to map WMO API weather codes to accurate icons and translated text/gear
  const getForecastDetails = (wmoCode) => {
    if (wmoCode === 0) return { icon: ActiveSun, desc: t.descClear, gear: t.gearClearDay, style: sunStyle };
    if (wmoCode <= 3) return { icon: Cloud, desc: t.descCloudy, gear: t.gearClearNight, style: tc };
    if (wmoCode <= 48) return { icon: CloudFog, desc: t.descFog, gear: t.gearClearNight, style: tc };
    if (wmoCode <= 69 || (wmoCode >= 80 && wmoCode <= 82)) return { icon: ActiveRain, desc: t.descRain, gear: t.gearRain, style: rainStyle };
    if (wmoCode <= 79 || wmoCode === 85 || wmoCode === 86) return { icon: CloudSnow, desc: t.descSnow, gear: t.gearSnow, style: tc };
    if (wmoCode >= 95) return { icon: CloudLightning, desc: t.descThunder, gear: t.gearThunder, style: accentStyle };
    return { icon: Cloud, desc: "Unknown", gear: "", style: tc };
  };

  // --- UI RENDERING ---
  return (
    <div 
      className={`relative w-full h-screen overflow-hidden flex flex-col md:flex-row transition-colors duration-700 font-sans ${getThemeBackground()}`}
      style={{ backgroundColor: getCustomBackgroundColor() }}
    >
      
      {/* Sidebar / Bottom Nav */}
      <div className={`h-20 md:h-full w-full md:w-24 flex flex-row md:flex-col items-center justify-around md:justify-center md:gap-12 px-4 md:py-8 border-t md:border-t-0 md:border-r border-white/10 order-last md:order-first z-20 ${isBatterySave ? 'bg-gray-900' : 'bg-black/10 backdrop-blur-md'}`}>
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
        
        {/* HEADER (Language & Unit) */}
        <div dir="ltr" className="flex justify-between items-start p-6 md:p-8 pt-12 md:pt-8 w-full z-20">
          
          <div style={{ transform: `scale(${flagMult})`, transformOrigin: 'top left' }}>
            <button onClick={toggleLanguage} className={`h-8 rounded shadow-md overflow-hidden hover:scale-105 transition-transform w-12 flex items-center justify-center ${showTextFlag ? (isBatterySave ? 'bg-gray-800 border border-gray-600' : 'bg-black/20 border border-white/20') : 'bg-white'}`} title="Toggle Language">
              {showTextFlag ? (
                <span className="text-xs font-bold" style={isBatterySave ? {color: 'white'} : tc}>{activeLang}</span>
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
            <button onClick={toggleUnit} className={`h-10 px-3 flex items-center justify-center gap-1 rounded-full transition-all font-bold shadow-sm ${isBatterySave ? 'bg-gray-800 border border-gray-600 text-white' : 'bg-white/20 hover:bg-white/30'}`} style={tc}>
              <Thermometer size={20} />
              <span className="text-sm">{unit === 'K' ? 'K' : `°${unit}`}</span>
            </button>
          </div>
        </div>

        {/* PAGE ROUTING CONTAINER */}
        <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
          
          {/* --- PAGE: HOME --- */}
          {activePage === 'home' && (
            <div className={`flex-1 flex flex-col ${isComplex ? 'lg:flex-row lg:items-start lg:justify-center lg:gap-16 max-w-6xl' : 'items-center justify-start max-w-4xl'} pt-0 md:pt-4 pb-20 px-6 md:px-12 animate-in fade-in duration-500 mx-auto w-full min-h-full`}>
              
              {/* Left Column / Central Weather Section */}
              <div className={`flex flex-col items-center justify-center flex-shrink-0 w-full lg:w-auto ${isComplex ? 'mb-8 lg:mb-0' : 'mb-8'}`}>
                
                {/* Campus Search Bar */}
                <div className="relative w-full max-w-sm mb-6 md:mb-10 z-30">
                  <div className={`flex items-center px-4 py-3 rounded-full ${isBatterySave ? 'bg-gray-800 border border-gray-600' : 'bg-black/20 backdrop-blur-md border border-white/10'} transition-all shadow-lg`}>
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
                  
                  {/* Search Dropdown */}
                  {isSearching && searchQuery && (
                    <div className={`absolute top-full left-0 right-0 mt-2 rounded-2xl overflow-hidden max-h-56 overflow-y-auto custom-scrollbar shadow-2xl ${isBatterySave ? 'bg-gray-900 border border-gray-700' : 'bg-slate-800/90 backdrop-blur-xl border border-white/20'}`}>
                      {UK_UNIVERSITIES.filter(u => u.uni.toLowerCase().includes(searchQuery.toLowerCase()) || u.city.toLowerCase().includes(searchQuery.toLowerCase())).map((uni, idx) => (
                        <div
                          key={idx}
                          className="px-5 py-4 hover:bg-white/10 cursor-pointer border-b border-white/5 last:border-0 transition-colors"
                          onClick={() => {
                            setSelectedLocation(uni);
                            setSearchQuery('');
                            setIsSearching(false);
                          }}
                        >
                          <p className="font-bold text-sm" style={tc}>{uni.uni}</p>
                          <p className="text-xs mt-1" style={{ color: tc.color, opacity: 0.8 }}>{uni.city} - {uni.campus}</p>
                        </div>
                      ))}
                      {UK_UNIVERSITIES.filter(u => u.uni.toLowerCase().includes(searchQuery.toLowerCase()) || u.city.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                        <div className="px-5 py-4">
                          <p className="text-sm opacity-70" style={tc}>No campuses found...</p>
                        </div>
                      )}
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
                  ) : isRain ? (
                    <div className="relative flex items-center justify-center">
                      {isDay ? <ActiveSun size={120 * weatherMult} className={`absolute -top-4 ${isRTL ? '-right-6' : '-left-6'}`} style={sunStyle} /> : <ActiveMoon size={120 * weatherMult} className={`absolute -top-4 ${isRTL ? '-right-6' : '-left-6'}`} style={moonStyle} />}
                      <ActiveRain size={130 * weatherMult} className="relative z-10" style={rainStyle} />
                    </div>
                  ) : (
                    <div className="relative">
                      {isDay ? <ActiveSun size={130 * weatherMult} style={sunStyle} /> : <ActiveMoon size={130 * weatherMult} style={moonStyle} />}
                      {isDay && !isBatterySave && <div className={`absolute top-12 ${isRTL ? '-left-4' : '-right-4'} bg-white w-14 h-10 rounded-full opacity-90`}></div>}
                    </div>
                  )}
                </button>

                <h1 className="text-[80px] md:text-[140px] font-bold leading-none tracking-tighter mb-4 shadow-black/10 drop-shadow-lg" style={{ ...tc, transform: `scale(${tempMult})`, transformOrigin: 'center' }}>
                  {isLoading ? "--°" : getDisplayTemperature()}
                </h1>

                <div className={`flex items-center gap-3 px-6 py-3 rounded-full mb-8 ${isBatterySave ? 'bg-gray-900 border border-gray-800' : 'bg-white/10 backdrop-blur-sm'}`} style={{ transform: `scale(${textMult})`, transformOrigin: 'center' }}>
                  {isRain ? (
                     <Umbrella size={32} style={rainStyle} />
                  ) : isDay ? (
                     <Glasses className={`rounded-full p-1.5 ${isBatterySave ? 'bg-gray-800' : 'bg-white text-gray-800'}`} size={32} style={isBatterySave ? tc : {}} />
                  ) : (
                     <MoonStar className={`rounded-full p-1.5 ${isBatterySave ? 'bg-gray-800' : 'bg-white text-gray-800'}`} size={32} style={isBatterySave ? tc : {}} />
                  )}
                  <span className="font-medium text-lg md:text-xl tracking-wide" style={tc}>
                    {isRain ? t.gearRain : (isDay ? t.gearClearDay : t.gearClearNight)}
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

                {forecastData.length > 0 && (
                  <div className="w-full mt-8 overflow-x-auto pb-2">
                    <div className="flex gap-2 min-w-max mx-auto">
                      {forecastData.map((day, idx) => {
                        const isToday = idx === 0;
                        const label = isToday ? 'Today' : day.date.toLocaleDateString([], { weekday: 'short' });
                        const high = unit==='F' ? Math.round(day.maxTemp*9/5+32) : unit==='K' ? Math.round(day.maxTemp+273.15) : Math.round(day.maxTemp);
                        const low  = unit==='F' ? Math.round(day.minTemp*9/5+32) : unit==='K' ? Math.round(day.minTemp+273.15) : Math.round(day.minTemp);
                        return (
                          <div key={idx} className={`flex flex-col items-center gap-1 px-3 py-3 rounded-2xl min-w-[72px] border ${isBatterySave ? (isToday ? 'bg-gray-700 border-gray-500' : 'bg-gray-900 border-gray-800') : (isToday ? 'bg-white/25 border-white/40' : 'bg-black/15 border-white/10')}`}>
                            <p className="text-sm font-bold" style={tc}>{day.date.getDate()}</p>
                            <p className="text-[11px] opacity-70" style={tc}>{label}</p>
                            <span className="text-4xl">{wmoToEmoji(day.weatherCode)}</span>
                            <p className="text-sm font-bold" style={tc}>{high}°</p>
                            <p className="text-xs opacity-55" style={tc}>{low}°</p>
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
                  
                  {/* Current Details 6-Grid */}
                  <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6">
                    <div className={`p-4 rounded-2xl flex flex-col gap-2 ${isBatterySave ? 'bg-gray-900 border border-gray-800' : 'bg-white/10 backdrop-blur-md shadow-lg border border-white/5'}`}>
                      <Sunrise size={22} style={sunStyle} />
                      <div>
                        <p className="text-xs opacity-80" style={tc}>{t.sunrise}</p>
                        <p className="text-lg font-bold" style={tc}>{weatherData.sunrise}</p>
                      </div>
                    </div>
                    <div className={`p-4 rounded-2xl flex flex-col gap-2 ${isBatterySave ? 'bg-gray-900 border border-gray-800' : 'bg-white/10 backdrop-blur-md shadow-lg border border-white/5'}`}>
                      <Sunset size={22} style={sunStyle} />
                      <div>
                        <p className="text-xs opacity-80" style={tc}>{t.sunset}</p>
                        <p className="text-lg font-bold" style={tc}>{weatherData.sunset}</p>
                      </div>
                    </div>
                    <div className={`p-4 rounded-2xl flex flex-col gap-2 ${isBatterySave ? 'bg-gray-900 border border-gray-800' : 'bg-white/10 backdrop-blur-md shadow-lg border border-white/5'}`}>
                      <Droplets size={22} style={rainStyle} />
                      <div>
                        <p className="text-xs opacity-80" style={tc}>{t.humidity}</p>
                        <p className="text-lg font-bold" style={tc}>{weatherData.humidity}</p>
                      </div>
                    </div>
                    <div className={`p-4 rounded-2xl flex flex-col gap-2 ${isBatterySave ? 'bg-gray-900 border border-gray-800' : 'bg-white/10 backdrop-blur-md shadow-lg border border-white/5'}`}>
                      <Wind size={22} style={rainStyle} />
                      <div>
                        <p className="text-xs opacity-80" style={tc}>{t.wind}</p>
                        <p className="text-lg font-bold" style={tc}>{weatherData.wind}</p>
                      </div>
                    </div>
                    <div className={`p-4 rounded-2xl flex flex-col gap-2 ${isBatterySave ? 'bg-gray-900 border border-gray-800' : 'bg-white/10 backdrop-blur-md shadow-lg border border-white/5'}`}>
                      <Activity size={22} style={accentStyle} />
                      <div>
                        <p className="text-xs opacity-80" style={tc}>{t.uv}</p>
                        <p className="text-lg font-bold" style={tc}>{weatherData.uv}</p>
                      </div>
                    </div>
                    <div className={`p-4 rounded-2xl flex flex-col gap-2 ${isBatterySave ? 'bg-gray-900 border border-gray-800' : 'bg-white/10 backdrop-blur-md shadow-lg border border-white/5'}`}>
                      <CloudFog size={22} style={tc} />
                      <div>
                        <p className="text-xs opacity-80" style={tc}>{t.pollution}</p>
                        <p className="text-sm font-bold" style={tc}>{weatherData.pollution}</p>
                      </div>
                    </div>
                    <div className={`p-4 rounded-2xl flex flex-col gap-2 col-span-2 ${isBatterySave ? 'bg-gray-900 border border-gray-800' : 'bg-white/10 backdrop-blur-md shadow-lg border border-white/5'}`}>
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

                  {/* UPDATED: 5-Day Forecast List */}
                  {weatherData.forecast && weatherData.forecast.length > 0 && (
                    <div className="w-full pb-8">
                      <h4 className="text-xl font-bold mb-4 px-1" style={tc}>{t.forecastTitle}</h4>
                      <div className="flex flex-col gap-3">
                        {weatherData.forecast.map((day, idx) => {
                          const wmo = getForecastDetails(day.weatherCode);
                          const DayIcon = wmo.icon;
                          const formattedDate = new Date(day.dateRaw).toLocaleDateString(activeLang.toLowerCase(), { weekday: 'long', day: 'numeric', month: 'long' });
                          return (
                            <div key={idx} className={`flex items-center justify-between p-4 rounded-2xl ${isBatterySave ? 'bg-gray-900 border border-gray-800' : 'bg-white/10 backdrop-blur-md shadow-lg border border-white/5 hover:bg-white/20 transition-colors cursor-default'}`}>
                              <div className="flex items-center gap-4">
                                <DayIcon size={32} style={wmo.style} className="flex-shrink-0" />
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
              
              <div className={`p-5 rounded-2xl flex flex-col gap-4 mb-4 ${isBatterySave ? 'bg-gray-900 border border-gray-800' : 'bg-white/10 backdrop-blur-sm'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Activity size={22} style={accentStyle} />
                  <p className="font-semibold text-lg" style={tc}>{t.modeTitle}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button 
                    onClick={() => setAppMode('simple')} 
                    className={`py-2.5 rounded-xl border text-sm md:text-base font-bold transition-all ${appMode === 'simple' ? (!isBatterySave ? 'text-black shadow-lg' : 'bg-gray-700 text-white border-gray-500 shadow-lg') : (isBatterySave ? 'border-gray-800 text-gray-500 hover:bg-gray-800' : 'border-white/20 hover:bg-white/10')}`}
                    style={appMode === 'simple' && !isBatterySave ? { backgroundColor: currentNavActive, borderColor: currentNavActive } : { color: tc.color }}
                  >
                    {t.modeSimple}
                  </button>
                  <button 
                    onClick={() => setAppMode('complex')} 
                    className={`py-2.5 rounded-xl border text-sm md:text-base font-bold transition-all ${appMode === 'complex' ? (!isBatterySave ? 'text-black shadow-lg' : 'bg-gray-700 text-white border-gray-500 shadow-lg') : (isBatterySave ? 'border-gray-800 text-gray-500 hover:bg-gray-800' : 'border-white/20 hover:bg-white/10')}`}
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
                
                <div className={`p-5 rounded-2xl flex flex-col gap-4 ${isBatterySave ? 'bg-gray-900 border border-gray-800' : 'bg-white/10 backdrop-blur-sm'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Globe size={22} style={accentStyle} />
                    <p className="font-semibold text-lg" style={tc}>{t.langPrefTitle}</p>
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm" style={{ color: tc.color, opacity: 0.8 }}>{t.primaryLangLabel}</label>
                    <select value={primaryLang} onChange={(e) => setPrimaryLang(e.target.value)} className="bg-black/20 rounded-lg p-2.5 outline-none border border-white/10" style={tc}>
                      {languages.map(lang => (<option key={`pri-${lang.code}`} value={lang.code} className="bg-slate-800 text-white">{lang.name}</option>))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm" style={{ color: tc.color, opacity: 0.8 }}>{t.secondaryLangLabel}</label>
                    <select value={secondaryLang} onChange={(e) => setSecondaryLang(e.target.value)} className="bg-black/20 rounded-lg p-2.5 outline-none border border-white/10" style={tc}>
                      {languages.map(lang => (<option key={`sec-${lang.code}`} value={lang.code} className="bg-slate-800 text-white">{lang.name}</option>))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div onClick={() => setActivePage('theme-selection')} className={`p-5 rounded-2xl flex items-center justify-between transition-colors cursor-pointer shadow-sm ${isBatterySave ? 'bg-gray-900 border border-gray-800 opacity-50 cursor-not-allowed' : 'bg-white/10 backdrop-blur-sm hover:bg-white/20'}`}>
                    <div className="flex items-center gap-4">
                      <Palette size={26} style={isBatterySave ? { color: '#6B7280' } : accentStyle} />
                      <div>
                        <p className="font-semibold text-lg" style={tc}>{t.themeTitle}</p>
                        <p className="text-sm" style={{ color: tc.color, opacity: 0.8 }}>{isBatterySave ? 'Disabled in Battery Saver' : t.themeDesc}</p>
                      </div>
                    </div>
                    <div className="text-xs font-bold tracking-wider bg-white/20 px-3 py-1.5 rounded-full capitalize" style={tc}>{isBatterySave ? 'Off' : appTheme}</div>
                  </div>

                  <div className={`p-5 rounded-2xl flex items-center gap-4 transition-colors cursor-pointer ${isBatterySave ? 'bg-gray-900 border border-gray-800' : 'bg-white/10 backdrop-blur-sm hover:bg-white/20'}`}>
                    <User size={26} style={accentStyle} />
                    <div>
                      <p className="font-semibold text-lg" style={tc}>{t.studentProfile}</p>
                      <p className="text-sm" style={{ color: tc.color, opacity: 0.8 }}>{t.manageId}</p>
                    </div>
                  </div>

                  <div className={`p-5 rounded-2xl flex items-center gap-4 transition-colors cursor-pointer ${isBatterySave ? 'bg-gray-900 border border-gray-800' : 'bg-white/10 backdrop-blur-sm hover:bg-white/20'}`}>
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
                <div onClick={cycleWeather} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 flex items-center justify-between shadow-lg cursor-pointer hover:bg-white/20 hover:scale-[1.02] active:scale-95 transition-all">
                  
                  <div className={`flex flex-col ${isRTL ? 'items-end' : 'items-start'}`}>
                    <h3 
                      className="text-4xl md:text-5xl font-bold mb-1 transition-transform" 
                      style={{ ...tc, transform: `scale(${tempMult})`, transformOrigin: isRTL ? 'right center' : 'left center' }}
                    >
                      {isLoading ? "--°" : getDisplayTemperature()}
                    </h3>
                    <div 
                      className="flex items-center gap-1.5 text-sm md:text-base mt-2 transition-transform" 
                      style={{ color: tc.color, opacity: 0.9, transform: `scale(${textMult})`, transformOrigin: isRTL ? 'right top' : 'left top' }}
                    >
                      <Home size={16} /> {selectedLocation.city}
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-full flex items-center justify-center">
                    {isRain ? (
                      <div className="relative w-10 h-10 flex items-center justify-center">
                        {isDay ? <ActiveSun size={24 * weatherMult} className={`absolute -top-1 ${isRTL ? '-right-2' : '-left-2'}`} style={sunStyle} /> : <ActiveMoon size={24 * weatherMult} className={`absolute -top-1 ${isRTL ? '-right-2' : '-left-2'}`} style={moonStyle} />}
                        <ActiveRain size={32 * weatherMult} className="relative z-10" style={rainStyle} />
                      </div>
                    ) : (
                      isDay ? <ActiveSun size={40 * weatherMult} className="drop-shadow-md" style={sunStyle} /> : <ActiveMoon size={40 * weatherMult} className="drop-shadow-md" style={moonStyle} />
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { id: 'dynamic', name: t.themeDynamic, color: 'bg-gradient-to-br from-blue-500 to-blue-800' },
                  { id: 'midnight', name: t.themeMidnight, color: 'bg-slate-900' },
                  { id: 'sunset', name: t.themeSunset, color: 'bg-gradient-to-br from-orange-500 to-purple-800' },
                  { id: 'qmul', name: t.themeQMUL, color: 'bg-blue-800' },
                  { id: 'forest', name: t.themeForest, color: 'bg-emerald-900' },
                  { id: 'protanopia', name: t.themeProtanopia, color: 'bg-[#002B5B]' },
                  { id: 'deuteranopia', name: t.themeDeuteranopia, color: 'bg-[#172B4D]' },
                  { id: 'tritanopia', name: t.themeTritanopia, color: 'bg-[#212121]' },
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

              {appTheme === 'custom' && (
                <div className="bg-black/20 border border-white/20 rounded-2xl p-5 md:p-6 animate-in fade-in slide-in-from-bottom-4 mb-4">
                  <h3 className="text-lg md:text-xl font-bold mb-5 flex items-center gap-2" style={tc}>
                    <Palette size={22} style={accentStyle} />
                    {t.themeCustom} Options
                  </h3>
                  
                  <div className="mb-8">
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2" style={tc}>
                      <div className="w-4 h-4 rounded bg-white/50 border border-white" style={{ borderColor: tc.color }}></div> 
                      {t.bgColors}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-4 mb-8">
                      <label className="flex flex-col gap-1.5 text-sm" style={{ color: tc.color, opacity: 0.8 }}>
                        {t.colorDayClear}
                        <input type="color" value={customColors.dayClear} onChange={e => setCustomColors({...customColors, dayClear: e.target.value})} className="w-full h-10 rounded cursor-pointer border-0 bg-transparent p-0" />
                      </label>
                      <label className="flex flex-col gap-1.5 text-sm" style={{ color: tc.color, opacity: 0.8 }}>
                        {t.colorNightClear}
                        <input type="color" value={customColors.nightClear} onChange={e => setCustomColors({...customColors, nightClear: e.target.value})} className="w-full h-10 rounded cursor-pointer border-0 bg-transparent p-0" />
                      </label>
                      <label className="flex flex-col gap-1.5 text-sm" style={{ color: tc.color, opacity: 0.8 }}>
                        {t.colorDayRain}
                        <input type="color" value={customColors.dayRain} onChange={e => setCustomColors({...customColors, dayRain: e.target.value})} className="w-full h-10 rounded cursor-pointer border-0 bg-transparent p-0" />
                      </label>
                      <label className="flex flex-col gap-1.5 text-sm" style={{ color: tc.color, opacity: 0.8 }}>
                        {t.colorNightRain}
                        <input type="color" value={customColors.nightRain} onChange={e => setCustomColors({...customColors, nightRain: e.target.value})} className="w-full h-10 rounded cursor-pointer border-0 bg-transparent p-0" />
                      </label>
                    </div>

                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2" style={tc}>
                      <Sun size={18} style={sunStyle} /> 
                      {t.elementColors}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-x-4 gap-y-4 mb-8">
                      <label className="flex flex-col gap-1.5 text-sm" style={{ color: tc.color, opacity: 0.8 }}>
                        {t.colorSun}
                        <input type="color" value={customColors.sun} onChange={e => setCustomColors({...customColors, sun: e.target.value})} className="w-full h-10 rounded cursor-pointer border-0 bg-transparent p-0" />
                      </label>
                      <label className="flex flex-col gap-1.5 text-sm" style={{ color: tc.color, opacity: 0.8 }}>
                        {t.colorMoon}
                        <input type="color" value={customColors.moon} onChange={e => setCustomColors({...customColors, moon: e.target.value})} className="w-full h-10 rounded cursor-pointer border-0 bg-transparent p-0" />
                      </label>
                      <label className="flex flex-col gap-1.5 text-sm" style={{ color: tc.color, opacity: 0.8 }}>
                        {t.colorRain}
                        <input type="color" value={customColors.rain} onChange={e => setCustomColors({...customColors, rain: e.target.value})} className="w-full h-10 rounded cursor-pointer border-0 bg-transparent p-0" />
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

                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2" style={tc}>
                      <Settings size={18} style={accentStyle} /> 
                      {t.sizesTitle}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-4">
                      <label className="flex flex-col gap-1.5 text-sm" style={{ color: tc.color, opacity: 0.8 }}>
                        {t.sizeFlag} ({customSizes.flag}x)
                        <input type="range" min="0.5" max="1.5" step="0.1" value={customSizes.flag} onChange={e => setCustomSizes({...customSizes, flag: parseFloat(e.target.value)})} className="w-full" style={{ accentColor: currentNavActive }} />
                      </label>
                      <label className="flex flex-col gap-1.5 text-sm" style={{ color: tc.color, opacity: 0.8 }}>
                        {t.sizeTemp} ({customSizes.temp}x)
                        <input type="range" min="0.5" max="1.5" step="0.1" value={customSizes.temp} onChange={e => setCustomSizes({...customSizes, temp: parseFloat(e.target.value)})} className="w-full" style={{ accentColor: currentNavActive }} />
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
                        {t.sizeTopTemp} ({customSizes.topTemp}x)
                        <input type="range" min="0.5" max="1.5" step="0.1" value={customSizes.topTemp} onChange={e => setCustomSizes({...customSizes, topTemp: parseFloat(e.target.value)})} className="w-full" style={{ accentColor: currentNavActive }} />
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="text-sm font-semibold mb-3" style={tc}>{t.styleSun}</h4>
                      <div className="flex md:flex-wrap gap-2 overflow-x-auto pb-2 custom-scrollbar">
                        {Object.keys(sunIconMap).map(iconKey => {
                          const IconObj = sunIconMap[iconKey];
                          return (
                            <button key={iconKey} onClick={() => setCustomIcons({...customIcons, sun: iconKey})} className={`p-2 md:p-3 rounded-xl flex-shrink-0 transition-all ${customIcons.sun === iconKey ? 'bg-white/20 border-2' : 'bg-white/10 border-2 border-transparent hover:bg-white/20'}`} style={customIcons.sun === iconKey ? { borderColor: currentNavActive } : {}}>
                              <IconObj size={28} style={customIcons.sun === iconKey ? sunStyle : tc} />
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold mb-3" style={tc}>{t.styleMoon}</h4>
                      <div className="flex md:flex-wrap gap-2 overflow-x-auto pb-2 custom-scrollbar">
                        {Object.keys(moonIconMap).map(iconKey => {
                          const IconObj = moonIconMap[iconKey];
                          return (
                            <button key={iconKey} onClick={() => setCustomIcons({...customIcons, moon: iconKey})} className={`p-2 md:p-3 rounded-xl flex-shrink-0 transition-all ${customIcons.moon === iconKey ? 'bg-white/20 border-2' : 'bg-white/10 border-2 border-transparent hover:bg-white/20'}`} style={customIcons.moon === iconKey ? { borderColor: currentNavActive } : {}}>
                              <IconObj size={28} style={customIcons.moon === iconKey ? moonStyle : tc} />
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold mb-3" style={tc}>{t.styleRain}</h4>
                      <div className="flex md:flex-wrap gap-2 overflow-x-auto pb-2 custom-scrollbar">
                        {Object.keys(rainIconMap).map(iconKey => {
                          const IconObj = rainIconMap[iconKey];
                          return (
                            <button key={iconKey} onClick={() => setCustomIcons({...customIcons, rain: iconKey})} className={`p-2 md:p-3 rounded-xl flex-shrink-0 transition-all ${customIcons.rain === iconKey ? 'bg-white/20 border-2' : 'bg-white/10 border-2 border-transparent hover:bg-white/20'}`} style={customIcons.rain === iconKey ? { borderColor: currentNavActive } : {}}>
                              <IconObj size={28} style={customIcons.rain === iconKey ? rainStyle : tc} />
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
            <div className="flex-1 flex flex-col items-center justify-center pt-4 animate-in fade-in">
              <Battery size={60} className="text-gray-600 mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Themes Disabled</h2>
              <p className="text-gray-400 text-center px-6">You are currently in Battery Saver mode. To customize your theme, please switch back to Simple or Complex Mode in the Settings menu.</p>
              <button onClick={() => setActivePage('options')} className="mt-6 px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">
                Go back to Settings
              </button>
            </div>
          )}

          {/* --- PAGE: MAP --- */}
          {activePage === 'map' && (
             <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in duration-500">
                <Map size={80} className="mb-6" style={{ color: tc.color, opacity: 0.5 }} />
                <h2 className="text-2xl md:text-3xl font-bold text-center" style={tc}>{t.mapTitle}</h2>
                <p className="text-center mt-3 text-base" style={{ color: tc.color, opacity: 0.8 }}>{t.mapComingSoon}</p>
             </div>
          )}

        </div>
      </div>

    </div>
  );
}