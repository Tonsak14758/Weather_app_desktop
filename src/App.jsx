import React, { useState, useEffect } from 'react';
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

// NEW: 10 Highly Specific Icons for ALL 7 Weather Categories
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
  { city: "Cardiff", uni: "University of Cardiff", campus: "Cathays Park", lat: 51.4883, lon: -3.1769 }
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

  const [customColors, setCustomColors] = useState({
    bgDayClear: '#3B82F6', bgNightClear: '#0F3460',
    bgDayCloudy: '#60A5FA', bgNightCloudy: '#1E3A8A',
    bgDayFog: '#94A3B8', bgNightFog: '#334155',
    bgDayRain: '#475569', bgNightRain: '#0F172A',
    bgDaySnow: '#7DD3FC', bgNightSnow: '#1D4ED8',
    bgDayThunder: '#374151', bgNightThunder: '#000000',
    // UPDATED: Added dedicated colors for all 7 weather elements
    sun: '#FBBF24', moon: '#FDE047', rain: '#9CA3AF', 
    cloud: '#A1A1AA', fog: '#94A3B8', snow: '#BAE6FD', thunder: '#A78BFA',
    text: '#FFFFFF', navSelected: '#FBBF24' 
  });
  
  const [customSizes, setCustomSizes] = useState({
    flag: 1, temp: 1, weather: 1, text: 1, nav: 1, topTemp: 1 
  });
  
  // UPDATED: Now stores custom icon selections for ALL 7 weather types
  const [customIcons, setCustomIcons] = useState({
    sun: 'Sun', moon: 'Moon', cloudy: 'Cloud', fog: 'CloudFog', rain: 'CloudRain', snow: 'Snowflake', thunder: 'CloudLightning'
  });

  // NEW: Stores individual fill/outline preferences for ALL 7 weather types
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
      { isDay: true, wmoCode: 0 }, { isDay: false, wmoCode: 0 },       // Clear
      { isDay: true, wmoCode: 3 }, { isDay: false, wmoCode: 3 },       // Cloudy
      { isDay: true, wmoCode: 61 }, { isDay: false, wmoCode: 61 },     // Rain
      { isDay: true, wmoCode: 45 }, { isDay: false, wmoCode: 45 },     // Fog
      { isDay: true, wmoCode: 71 }, { isDay: false, wmoCode: 71 },     // Snow
      { isDay: true, wmoCode: 95 }, { isDay: false, wmoCode: 95 }      // Thunder
    ];
    const currentIndex = states.findIndex(s => s.isDay === weatherState.isDay && s.wmoCode === weatherState.wmoCode);
    const nextIndex = (currentIndex + 1) % states.length;
    setWeatherState(states[nextIndex]);
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
      default: break;
    }
    const { wmoCode, isDay } = weatherState;
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

  // UPDATED: Included "fillIcon" translation for all languages
  const text = {
    EN: { gearClearDay: "Gear: Sunglasses", gearClearNight: "Gear: Jacket", gearRain: "Gear: Umbrella", searchPlaceholder: "Search UK Campus...", optionsTitle: "Settings", langPrefTitle: "Languages", primaryLangLabel: "Primary Language", secondaryLangLabel: "Secondary Language", studentProfile: "Profile", manageId: "Manage ID", notifications: "Notifications", weatherAlerts: "Alerts", mapTitle: "Campus Map", mapComingSoon: "Map coming in Phase 2!", themeTitle: "Theme", themeDesc: "Customize appearance", themeDynamic: "Dynamic", themeMidnight: "Midnight", themeSunset: "Sunset", themeQMUL: "QMUL Blue", themeForest: "Forest", themeProtanopia: "Protanopia", themeDeuteranopia: "Deuteranopia", themeTritanopia: "Tritanopia", previewTitle: "Live Preview", themeCustom: "Custom Theme", bgClear: "Clear", bgCloudy: "Cloudy", bgFog: "Fog", bgRain: "Rain", bgSnow: "Snow", bgThunder: "Thunder", dayStr: "Day", nightStr: "Night", styleSun: "Sun Icon", styleMoon: "Moon Icon", styleCloudy: "Cloudy Icon", styleFog: "Fog Icon", styleRain: "Rain Icon", styleSnow: "Snow Icon", styleThunder: "Thunder Icon", tapToToggle: "Tap to cycle weather", bgColors: "Backgrounds", elementColors: "Elements", colorSun: "Sun", colorMoon: "Moon", colorRain: "Rain", colorCloud: "Cloud", colorFog: "Fog", colorSnow: "Snow", colorThunder: "Thunder", colorText: "Text", colorNavSelected: "Nav", modeTitle: "App Mode", modeSimple: "Simple Mode", modeComplex: "Complex Mode", modeBattery: "Battery Saver", humidity: "Humidity", wind: "Wind", uv: "UV Index", pollution: "Pollution", pressure: "Pressure", sunrise: "Sunrise", sunset: "Sunset", sizesTitle: "Sizes", sizeFlag: "Flag", sizeTemp: "Temp", sizeWeather: "Weather", sizeText: "Text", sizeNav: "Nav", sizeTopTemp: "Top Temp", forecastTitle: "7-Day Forecast", descClear: "Clear", descCloudy: "Cloudy", descFog: "Foggy", descRain: "Rain", descSnow: "Snow", descThunder: "Thunder", gearSnow: "Gear: Heavy Coat", gearThunder: "Gear: Indoors", simpleForecastTitle: "This Week", fillIcon: "Fill Icon" },
    TH: { gearClearDay: "อุปกรณ์: แว่นกันแดด", gearClearNight: "อุปกรณ์: แจ็คเก็ต", gearRain: "อุปกรณ์: ร่ม", searchPlaceholder: "ค้นหาวิทยาเขต...", optionsTitle: "การตั้งค่า", langPrefTitle: "ภาษา", primaryLangLabel: "ภาษาหลัก", secondaryLangLabel: "ภาษารอง", studentProfile: "โปรไฟล์", manageId: "จัดการ ID", notifications: "การแจ้งเตือน", weatherAlerts: "เตือนสภาพอากาศ", mapTitle: "แผนที่", mapComingSoon: "มาในเฟส 2!", themeTitle: "ธีม", themeDesc: "ปรับแต่งแอป", themeDynamic: "ไดนามิก", themeMidnight: "มิดไนท์", themeSunset: "แสงอาทิตย์ตก", themeQMUL: "สีฟ้า QMUL", themeForest: "สีเขียวป่า", themeProtanopia: "ตาบอดสีแดง", themeDeuteranopia: "ตาบอดสีเขียว", themeTritanopia: "ตาบอดสีน้ำเงิน", previewTitle: "แสดงตัวอย่างสด", themeCustom: "ธีมกำหนดเอง", bgClear: "แจ่มใส", bgCloudy: "มีเมฆ", bgFog: "มีหมอก", bgRain: "ฝนตก", bgSnow: "หิมะตก", bgThunder: "พายุฝนฟ้าคะนอง", dayStr: "กลางวัน", nightStr: "กลางคืน", styleSun: "ไอคอนพระอาทิตย์", styleMoon: "ไอคอนพระจันทร์", styleCloudy: "ไอคอนเมฆ", styleFog: "ไอคอนหมอก", styleRain: "ไอคอนฝน", styleSnow: "ไอคอนหิมะ", styleThunder: "ไอคอนพายุ", tapToToggle: "แตะเพื่อสลับ", bgColors: "พื้นหลัง", elementColors: "องค์ประกอบ", colorSun: "พระอาทิตย์", colorMoon: "พระจันทร์", colorRain: "ฝน", colorCloud: "เมฆ", colorFog: "หมอก", colorSnow: "หิมะ", colorThunder: "พายุ", colorText: "ข้อความ", colorNavSelected: "เมนู", modeTitle: "โหมด", modeSimple: "โหมดปกติ", modeComplex: "โหมดรายละเอียด", modeBattery: "ประหยัดแบต", humidity: "ความชื้น", wind: "ลม", uv: "ดัชนี UV", pollution: "มลพิษ", pressure: "ความกดอากาศ", sunrise: "พระอาทิตย์ขึ้น", sunset: "พระอาทิตย์ตก", sizesTitle: "ขนาด", sizeFlag: "ธง", sizeTemp: "อุณหภูมิ", sizeWeather: "ไอคอน", sizeText: "ข้อความ", sizeNav: "แถบนำทาง", sizeTopTemp: "อุณหภูมิด้านบน", forecastTitle: "พยากรณ์ 7 วัน", descClear: "แจ่มใส", descCloudy: "มีเมฆ", descFog: "มีหมอก", descRain: "ฝนตก", descSnow: "หิมะตก", descThunder: "พายุ", gearSnow: "อุปกรณ์: เสื้อกันหนาว", gearThunder: "อุปกรณ์: อยู่ในร่ม", simpleForecastTitle: "สัปดาห์นี้", fillIcon: "เติมสีไอคอน" },
    ZH: { gearClearDay: "装备：太阳镜", gearClearNight: "装备：外套", gearRain: "装备：雨伞", searchPlaceholder: "搜索校园...", optionsTitle: "设置", langPrefTitle: "语言偏好", primaryLangLabel: "主要语言", secondaryLangLabel: "次要语言", studentProfile: "档案", manageId: "管理 ID", notifications: "通知", weatherAlerts: "天气警报", mapTitle: "校园地图", mapComingSoon: "第二阶段推出！", themeTitle: "主题", themeDesc: "自定义外观", themeDynamic: "动态", themeMidnight: "午夜", themeSunset: "日落", themeQMUL: "QMUL 蓝", themeForest: "森林绿", themeProtanopia: "红色盲", themeDeuteranopia: "绿色盲", themeTritanopia: "蓝色盲", previewTitle: "实时预览", themeCustom: "自定义主题", bgClear: "晴朗", bgCloudy: "多云", bgFog: "雾", bgRain: "雨", bgSnow: "雪", bgThunder: "雷", dayStr: "白天", nightStr: "夜晚", styleSun: "太阳图标", styleMoon: "月亮图标", styleCloudy: "多云图标", styleFog: "雾图标", styleRain: "雨图标", styleSnow: "雪图标", styleThunder: "雷暴图标", tapToToggle: "点击切换", bgColors: "背景颜色", elementColors: "元素颜色", colorSun: "太阳", colorMoon: "月亮", colorRain: "雨水", colorCloud: "云", colorFog: "雾", colorSnow: "雪", colorThunder: "雷", colorText: "文本", colorNavSelected: "导航", modeTitle: "模式", modeSimple: "简单模式", modeComplex: "复杂模式", modeBattery: "省电模式", humidity: "湿度", wind: "风速", uv: "紫外线", pollution: "污染", pressure: "气压", sunrise: "日出", sunset: "日落", sizesTitle: "大小", sizeFlag: "国旗", sizeTemp: "温度", sizeWeather: "天气图标", sizeText: "文本", sizeNav: "导航栏", sizeTopTemp: "顶部温度", forecastTitle: "7天预报", descClear: "晴朗", descCloudy: "多云", descFog: "有雾", descRain: "下雨", descSnow: "下雪", descThunder: "雷暴", gearSnow: "装备：厚外套", gearThunder: "装备：室内", simpleForecastTitle: "本周", fillIcon: "填充图标" },
    FA: { gearClearDay: "تجهیزات: عینک آفتابی", gearClearNight: "تجهیزات: ژاکت", gearRain: "تجهیزات: چتر", searchPlaceholder: "جستجوی پردیس...", optionsTitle: "تنظیمات", langPrefTitle: "زبان‌ها", primaryLangLabel: "زبان اصلی", secondaryLangLabel: "زبان دوم", studentProfile: "پروفایل", manageId: "مدیریت شناسه", notifications: "اعلان‌ها", weatherAlerts: "هشدارها", mapTitle: "نقشه", mapComingSoon: "فاز 2 اضافه می‌شود!", themeTitle: "تم", themeDesc: "سفارشی سازی", themeDynamic: "پویا", themeMidnight: "نیمه شب", themeSunset: "غروب", themeQMUL: "آبی QMUL", themeForest: "جنگل", themeProtanopia: "کوررنگی قرمز", themeDeuteranopia: "کوررنگی سبز", themeTritanopia: "کوررنگی آبی", previewTitle: "پیش‌نمایش", themeCustom: "تم سفارشی", bgClear: "صاف", bgCloudy: "ابری", bgFog: "مه", bgRain: "باران", bgSnow: "برف", bgThunder: "رعد و برق", dayStr: "روز", nightStr: "شب", styleSun: "نماد خورشید", styleMoon: "نماد ماه", styleCloudy: "نماد ابری", styleFog: "نماد مه", styleRain: "نماد باران", styleSnow: "نماد برف", styleThunder: "نماد رعد و برق", tapToToggle: "ضربه بزنید", bgColors: "پس‌زمینه", elementColors: "عناصر", colorSun: "خورشید", colorMoon: "ماه", colorRain: "باران", colorCloud: "ابر", colorFog: "مه", colorSnow: "برف", colorThunder: "رعد و برق", colorText: "متن", colorNavSelected: "ناوبری", modeTitle: "حالت", modeSimple: "ساده", modeComplex: "پیشرفته", modeBattery: "ذخیره باتری", humidity: "رطوبت", wind: "باد", uv: "UV", pollution: "آلودگی", pressure: "فشار", sunrise: "طلوع", sunset: "غروب", sizesTitle: "اندازه‌ها", sizeFlag: "پرچم", sizeTemp: "دما", sizeWeather: "نماد", sizeText: "متن", sizeNav: "ناوبری", sizeTopTemp: "دمای بالا", forecastTitle: "پیش بینی 7 روزه", descClear: "صاف", descCloudy: "ابری", descFog: "مه آلود", descRain: "باران", descSnow: "برف", descThunder: "رعد و برق", gearSnow: "تجهیزات: پالتو", gearThunder: "تجهیزات: در خانه", simpleForecastTitle: "این هفته", fillIcon: "پر کردن نماد" },
    AR: { gearClearDay: "المعدات: نظارات شمسية", gearClearNight: "المعدات: سترة", gearRain: "المعدات: مظلة", searchPlaceholder: "ابحث عن حرم جامعي...", optionsTitle: "الإعدادات", langPrefTitle: "اللغات", primaryLangLabel: "اللغة الأساسية", secondaryLangLabel: "اللغة الثانوية", studentProfile: "الملف الشخصي", manageId: "إدارة المعرف", notifications: "الإشعارات", weatherAlerts: "تنبيهات", mapTitle: "خريطة", mapComingSoon: "قادمة في المرحلة 2!", themeTitle: "السمة", themeDesc: "تخصيص المظهر", themeDynamic: "ديناميكي", themeMidnight: "منتصف الليل", themeSunset: "غروب", themeQMUL: "أزرق QMUL", themeForest: "غابة", themeProtanopia: "عمى أحمر", themeDeuteranopia: "عمى أخضر", themeTritanopia: "عمى أزرق", previewTitle: "معاينة", themeCustom: "سمة مخصصة", bgClear: "صافي", bgCloudy: "غائم", bgFog: "ضباب", bgRain: "مطر", bgSnow: "ثلج", bgThunder: "رعد", dayStr: "نهار", nightStr: "ليل", styleSun: "أيقونة الشمس", styleMoon: "أيقونة القمر", styleCloudy: "أيقونة غائم", styleFog: "أيقونة ضباب", styleRain: "أيقونة المطر", styleSnow: "أيقونة ثلج", styleThunder: "أيقونة رعد", tapToToggle: "انقر للتبديل", bgColors: "الخلفيات", elementColors: "العناصر", colorSun: "الشمس", colorMoon: "القمر", colorRain: "المطر", colorCloud: "سحابة", colorFog: "ضباب", colorSnow: "ثلج", colorThunder: "رعد", colorText: "النص", colorNavSelected: "التنقل", modeTitle: "الوضع", modeSimple: "بسيط", modeComplex: "متقدم", modeBattery: "توفير البطارية", humidity: "الرطوبة", wind: "الرياح", uv: "UV", pollution: "التلوث", pressure: "الضغط", sunrise: "شروق", sunset: "غروب", sizesTitle: "الأحجام", sizeFlag: "العلم", sizeTemp: "الحرارة", sizeWeather: "الطقس", sizeText: "النص", sizeNav: "التنقل", sizeTopTemp: "الحرارة العليا", forecastTitle: "توقعات 7 أيام", descClear: "صافي", descCloudy: "غائم", descFog: "ضبابي", descRain: "ممطر", descSnow: "ثلج", descThunder: "عاصفة", gearSnow: "المعدات: معطف", gearThunder: "المعدات: بالداخل", simpleForecastTitle: "هذا الأسبوع", fillIcon: "تعبئة الأيقونة" },
    HI: { gearClearDay: "गियर: धूप का चश्मा", gearClearNight: "गियर: जैकेट", gearRain: "गियर: छाता", searchPlaceholder: "कैंपस खोजें...", optionsTitle: "सेटिंग्स", langPrefTitle: "भाषा", primaryLangLabel: "प्राथमिक भाषा", secondaryLangLabel: "द्वितीयक भाषा", studentProfile: "प्रोफ़ाइल", manageId: "आईडी प्रबंधित करें", notifications: "सूचनाएं", weatherAlerts: "अलर्ट", mapTitle: "नक्शा", mapComingSoon: "चरण 2 में आ रहा है!", themeTitle: "थीम", themeDesc: "अनुकूलित करें", themeDynamic: "डायनामिक", themeMidnight: "मिडनाइट", themeSunset: "सनसेट", themeQMUL: "QMUL ब्लू", themeForest: "फॉरेस्ट", themeProtanopia: "लाल-अंधा", themeDeuteranopia: "हरा-अंधा", themeTritanopia: "नीला-अंधा", previewTitle: "पूर्वावलोकन", themeCustom: "कस्टम थीम", bgClear: "साफ़", bgCloudy: "बादल", bgFog: "कोहरा", bgRain: "बारिश", bgSnow: "बर्फ", bgThunder: "आंधी", dayStr: "दिन", nightStr: "रात", styleSun: "सूर्य आइकन", styleMoon: "चंद्रमा आइकन", styleCloudy: "बादल आइकन", styleFog: "कोहरा आइकन", styleRain: "बारिश आइकन", styleSnow: "बर्फ आइकन", styleThunder: "आंधी आइकन", tapToToggle: "बदलने के लिए टैप करें", bgColors: "पृष्ठभूमि", elementColors: "तत्व", colorSun: "सूर्य", colorMoon: "चंद्रमा", colorRain: "बारिश", colorCloud: "बादल", colorFog: "कोहरा", colorSnow: "बर्फ", colorThunder: "आंधी", colorText: "टेक्स्ट", colorNavSelected: "नेव", modeTitle: "मोड", modeSimple: "सरल", modeComplex: "जटिल", modeBattery: "बैटरी सेवर", humidity: "नमी", wind: "हवा", uv: "यूवी", pollution: "प्रदूषण", pressure: "दबाव", sunrise: "सूर्योदय", sunset: "सूर्यास्त", sizesTitle: "आकार", sizeFlag: "ध्वज", sizeTemp: "तापमान", sizeWeather: "मौसम", sizeText: "टेक्स्ट", sizeNav: "नेव", sizeTopTemp: "शीर्ष तापमान", forecastTitle: "7-दिन का पूर्वानुमान", descClear: "साफ", descCloudy: "बादल", descFog: "कोहरा", descRain: "बारिश", descSnow: "बर्फ", descThunder: "आंधी", gearSnow: "गियर: भारी कोट", gearThunder: "गियर: घर के अंदर", simpleForecastTitle: "इस सप्ताह", fillIcon: "आइकन भरें" },
    BN: { gearClearDay: "গিয়ার: সানগ্লাস", gearClearNight: "গিয়ার: জ্যাকেট", gearRain: "গিয়ার: ছাতা", searchPlaceholder: "ক্যাম্পাস খুঁজুন...", optionsTitle: "সেটিংস", langPrefTitle: "ভাষা", primaryLangLabel: "প্রাথমিক ভাষা", secondaryLangLabel: "মাধ্যমিক ভাষা", studentProfile: "প্রোফাইল", manageId: "আইডি পরিচালনা", notifications: "বিজ্ঞপ্তি", weatherAlerts: "সতর্কতা", mapTitle: "মানচিত্র", mapComingSoon: "ফেজ 2 এ আসছে!", themeTitle: "থিম", themeDesc: "কাস্টমাইজ করুন", themeDynamic: "ডায়নামিক", themeMidnight: "মিডনাইট", themeSunset: "সানসেট", themeQMUL: "QMUL নীল", themeForest: "ফরেস্ট", themeProtanopia: "লাল-অন্ধ", themeDeuteranopia: "সবুজ-অন্ধ", themeTritanopia: "নীল-অন্ধ", previewTitle: "প্রিভিউ", themeCustom: "কাস্টম থিম", bgClear: "পরিষ্কার", bgCloudy: "মেঘলা", bgFog: "কুয়াশা", bgRain: "বৃষ্টি", bgSnow: "তুষার", bgThunder: "বজ্রপাত", dayStr: "দিন", nightStr: "রাত", styleSun: "সূর্য আইকন", styleMoon: "চাঁদ আইকন", styleCloudy: "মেঘলা আইকন", styleFog: "কুয়াশা আইকন", styleRain: "বৃষ্টির আইকন", styleSnow: "তুষার আইকন", styleThunder: "বজ্রপাত আইকন", tapToToggle: "পরিবর্তন করতে আলতো চাপুন", bgColors: "পটভূমি", elementColors: "উপাদান", colorSun: "সূর্য", colorMoon: "চাঁদ", colorRain: "বৃষ্টি", colorCloud: "মেঘ", colorFog: "কুয়াশা", colorSnow: "তুষার", colorThunder: "বজ্রপাত", colorText: "টেক্সট", colorNavSelected: "নেভ", modeTitle: "মোড", modeSimple: "সাধারণ", modeComplex: "জটিল", modeBattery: "ব্যাটারি সেভার", humidity: "আর্দ্রতা", wind: "বাতাস", uv: "ইউভি", pollution: "দূষণ", pressure: "চাপ", sunrise: "সূর্যোদয়", sunset: "সূর্যাস্ত", sizesTitle: "আকার", sizeFlag: "পতাকা", sizeTemp: "তাপমাত্রা", sizeWeather: "আবহাওয়া", sizeText: "টেক্সট", sizeNav: "নেভিগেশন", sizeTopTemp: "শীর্ষ তাপমাত্রা", forecastTitle: "৭ দিনের পূর্বাভাস", descClear: "পরিষ্কার", descCloudy: "মেঘলা", descFog: "কুয়াশা", descRain: "বৃষ্টি", descSnow: "তুষার", descThunder: "বজ্রপাত", gearSnow: "গিয়ার: ভারী কোট", gearThunder: "গিয়ার: ঘরে থাকুন", simpleForecastTitle: "এই সপ্তাহ", fillIcon: "আইকন পূরণ করুন" }
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

  // UPDATED: Added current variables for the 4 new weather elements
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

  const isColorBlindMode = ['protanopia', 'deuteranopia', 'tritanopia'].includes(appTheme);
  const showTextFlag = isBatterySave || isColorBlindMode;

  if (isBatterySave) {
    currentTextColor = '#FFFFFF'; currentSunColor = '#FFFFFF'; currentMoonColor = '#FFFFFF';
    currentRainColor = '#FFFFFF'; currentCloudColor = '#FFFFFF'; currentFogColor = '#FFFFFF';
    currentSnowColor = '#FFFFFF'; currentThunderColor = '#FFFFFF'; currentNavActive = '#22C55E'; currentNavInactive = '#9CA3AF';
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
  }

  // UPDATED: Fill property is now dynamically bound to the customFills state for each individual category!
  const tc = { color: currentTextColor };
  const sunStyle = { color: currentSunColor, fill: customFills.sun ? currentSunColor : 'transparent' };
  const moonStyle = { color: currentMoonColor, fill: customFills.moon ? currentMoonColor : 'transparent' };
  const rainStyle = { color: currentRainColor, fill: customFills.rain ? currentRainColor : 'transparent' };
  const cloudStyle = { color: currentCloudColor, fill: customFills.cloudy ? currentCloudColor : 'transparent' };
  const fogStyle = { color: currentFogColor, fill: customFills.fog ? currentFogColor : 'transparent' };
  const snowStyle = { color: currentSnowColor, fill: customFills.snow ? currentSnowColor : 'transparent' };
  const thunderStyle = { color: currentThunderColor, fill: customFills.thunder ? currentThunderColor : 'transparent' };
  const accentStyle = { color: currentNavActive };
  const activeNavStyle = { color: currentNavActive }; 
  const inactiveNavStyle = { color: currentNavInactive }; 

  const flagMult = appTheme === 'custom' && !isBatterySave ? customSizes.flag : 1;
  const tempMult = appTheme === 'custom' && !isBatterySave ? customSizes.temp : 1;
  const weatherMult = appTheme === 'custom' && !isBatterySave ? customSizes.weather : 1;
  const textMult = appTheme === 'custom' && !isBatterySave ? customSizes.text : 1;
  const navMult = appTheme === 'custom' && !isBatterySave ? customSizes.nav : 1;
  const topTempMult = appTheme === 'custom' && !isBatterySave ? customSizes.topTemp : 1;

  // HIGH DETAIL ENGINE: Maps WMO codes to accurate icons and translated text/gear
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
    
    // UPDATED: Now maps to the precise color style for each overlay/weather condition
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
      <div className={`h-20 md:h-full w-full md:w-24 flex flex-row md:flex-col items-center justify-around md:justify-center md:gap-12 px-4 md:py-8 border-t md:border-t-0 md:border-r border-white/10 order-last md:order-first z-20 flex-shrink-0 ${isBatterySave ? 'bg-gray-900' : 'bg-black/10 backdrop-blur-md'}`}>
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

        {/* ROUTING CONTAINER */}
        <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
          
          {/* --- PAGE: HOME --- */}
          {activePage === 'home' && (
            <div className={`flex-1 flex flex-col ${isComplex ? 'lg:flex-row lg:items-start lg:justify-center lg:gap-16 max-w-6xl' : 'items-center justify-start max-w-4xl'} pt-0 md:pt-4 pb-20 px-6 md:px-12 animate-in fade-in duration-500 mx-auto w-full min-h-full`}>
              
              {/* Left Column / Central Weather */}
              <div className={`flex flex-col items-center justify-center flex-shrink-0 w-full lg:w-auto ${isComplex ? 'mb-8 lg:mb-0' : 'mb-8 mt-[-2rem]'}`}>
                
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
                  
                  {isSearching && searchQuery && (
                    <div className={`absolute top-full left-0 right-0 mt-2 rounded-2xl overflow-hidden max-h-56 overflow-y-auto custom-scrollbar shadow-2xl ${isBatterySave ? 'bg-gray-900 border border-gray-700' : 'bg-slate-800/90 backdrop-blur-xl border border-white/20'}`}>
                      {UK_UNIVERSITIES.filter(u => u.uni.toLowerCase().includes(searchQuery.toLowerCase()) || u.city.toLowerCase().includes(searchQuery.toLowerCase())).map((uni, idx) => (
                        <div
                          key={idx}
                          className="px-5 py-4 hover:bg-white/10 cursor-pointer border-b border-white/5 last:border-0 transition-colors"
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
                    // UPDATED: High-Detail Main Composite Icon Render
                    <div className="relative flex items-center justify-center w-[160px] h-[160px]">
                      <currentDetails.baseIcon size={120 * weatherMult} className="drop-shadow-lg" style={currentDetails.baseStyle} />
                      {currentDetails.overlayIcon && (
                        <div className={`absolute bottom-2 ${isRTL ? 'left-2' : 'right-2'} bg-black/30 backdrop-blur-md rounded-full p-2.5 border border-white/10 shadow-2xl`}>
                          <currentDetails.overlayIcon size={46 * weatherMult} style={currentDetails.overlayStyle} />
                        </div>
                      )}
                    </div>
                  )}
                </button>

                <h1 className="text-[80px] md:text-[140px] font-bold leading-none tracking-tighter mb-4 shadow-black/10 drop-shadow-lg" style={{ ...tc, transform: `scale(${tempMult})`, transformOrigin: 'center' }}>
                  {isLoading ? "--°" : getDisplayTemperature()}
                </h1>

                <div className={`flex items-center gap-3 px-6 py-3 rounded-full mb-8 ${isBatterySave ? 'bg-gray-900 border border-gray-800' : 'bg-white/10 backdrop-blur-sm'}`} style={{ transform: `scale(${textMult})`, transformOrigin: 'center' }}>
                  <currentDetails.gearIcon className={`rounded-full p-1.5 flex-shrink-0 ${isBatterySave ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`} size={32} />
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

                {/* UPDATED: Simple Mode 7-Day Forecast (No Scrollbar, Full Width Grid) */}
                {!isComplex && weatherData?.forecast && (
                  <div className="w-full max-w-2xl mt-10 animate-in slide-in-from-bottom-8 duration-500">
                    <h4 className="text-sm font-bold mb-3 px-2 opacity-80 text-center md:text-left" style={tc}>{t.simpleForecastTitle}</h4>
                    <div className="grid grid-cols-7 gap-1.5 md:gap-3 w-full">
                      {weatherData.forecast.map((day, idx) => {
                        const wmo = getForecastDetails(day.weatherCode, true);
                        const dateStr = new Date(day.dateRaw).toLocaleDateString(activeLang.toLowerCase(), { weekday: 'short' });
                        return (
                          <div key={idx} className={`flex flex-col items-center justify-center py-3 px-1 md:px-2 rounded-2xl ${isBatterySave ? 'bg-gray-900 border border-gray-800' : 'bg-white/10 backdrop-blur-md shadow-sm border border-white/5'}`}>
                            <span className="text-[10px] md:text-xs font-bold capitalize mb-2" style={tc}>{dateStr}</span>
                            
                            {/* Composite Icon for Simple Mode */}
                            <div className="relative w-6 h-6 md:w-8 md:h-8 flex items-center justify-center mb-2">
                                <wmo.baseIcon size={20} className="md:w-6 md:h-6 opacity-90" style={wmo.baseStyle} />
                                {wmo.overlayIcon && (
                                  <div className={`absolute -bottom-1 ${isRTL ? '-left-1' : '-right-1'} bg-black/50 backdrop-blur-sm rounded-full p-0.5 md:p-1`}>
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

                  {/* UPDATED: 7-Day Forecast List with Composite Icons */}
                  {weatherData.forecast && weatherData.forecast.length > 0 && (
                    <div className="w-full pb-8">
                      <h4 className="text-xl font-bold mb-4 px-1" style={tc}>{t.forecastTitle}</h4>
                      <div className="flex flex-col gap-3">
                        {weatherData.forecast.map((day, idx) => {
                          const wmo = getForecastDetails(day.weatherCode, true);
                          const formattedDate = new Date(day.dateRaw).toLocaleDateString(activeLang.toLowerCase(), { weekday: 'long', day: 'numeric', month: 'long' });
                          return (
                            <div key={idx} className={`flex items-center justify-between p-4 rounded-2xl ${isBatterySave ? 'bg-gray-900 border border-gray-800' : 'bg-white/10 backdrop-blur-md shadow-lg border border-white/5 hover:bg-white/20 transition-colors cursor-default'}`}>
                              <div className="flex items-center gap-4">
                                
                                {/* Composite Icon for List View */}
                                <div className="relative flex items-center justify-center w-10 h-10 flex-shrink-0">
                                    <wmo.baseIcon size={32} style={wmo.baseStyle} className="opacity-90" />
                                    {wmo.overlayIcon && (
                                      <div className={`absolute -bottom-1 ${isRTL ? '-left-1' : '-right-1'} bg-black/40 backdrop-blur-md rounded-full p-1`}>
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
                    {/* UPDATED: Live Preview box also accurately shows composite icons */}
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
                    
                    {/* EXPANDED CUSTOM BACKGROUND COLORS FOR DETAILED WEATHER */}
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
                    {/* UPDATED: Added color pickers for Cloud, Fog, Snow, and Thunder elements */}
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

                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2" style={tc}>
                      <Settings size={18} style={accentStyle} /> 
                      {t.sizesTitle}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-4 mb-8">
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

                  {/* UPDATED: ALL 7 ICON CATEGORY SELECTIONS NOW FEATURE FILL TOGGLES */}
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