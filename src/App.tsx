import React, { useState, useEffect, useRef } from "react";
import { jsPDF } from "jspdf";
import amiriFont from "./amiri.tsx";
import {
  Users,
  HeartPulse,
  BookOpen,
  Languages,
  DollarSign,
  Building,
  PieChart,
  TrendingUp,
  Calendar,
  Download,
  X,
  Layers,
  BookText,
  ListOrdered,
  BarChart2, // Keep this for the button icon
} from "lucide-react";
import L, { icon } from "leaflet";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { Maximize2, Minimize2 } from "lucide-react";
import Loading from "./loading";
import {
  useMap,
  MapContainer,
  TileLayer,
  WMSTileLayer,
  Polygon,
  Polyline,
  Popup,
  Marker,
  ImageOverlay,
} from "react-leaflet";
import {
  Menu,
  Map,
  Home,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  Globe,
  Search,
} from "lucide-react";
import "leaflet/dist/leaflet.css";
import { translations, type Language } from "./translations";
import { polygons, polylines, points1 } from "./data.tsx";
import GraphPage from "./GraphPage";

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPolygon, setSelectedPolygon] = useState<
    (typeof polygons)[number] | null
  >(null);
  const handlePolygonClick = (polygon: (typeof polygons)[number]) => {
    setSelectedPolygon(polygon);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const [isNavOpen, setIsNavOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [language, setLanguage] = useState<Language>("fr");
  const t = translations[language];
  const [expandedSections, setExpandedSections] = useState({
    Demography: false,
    Health: false,
    education: false,
    langues: false,
    emploi: false,
    menages: false,
    economie: false,
    secac: false,
    cl_emp: false,
    creation: false,
  });
  const [currentPage, setCurrentPage] = useState("accueil"); // Can be "accueil", "map", "graph"
  const [activeLayers, setActiveLayers] = useState({
    province: false,
    region: false,
    commune: false,
    routenationale: false,
    routeprovinciale: false,
    routeregionale: false,
    barrage: false,
    bassin: false,
    oued: false,
    nappe: false,
    midelt_P: false,
    errachidia_P: false,
    pa1: false,
    class_viabl: false,
    ind_viabl: false,
    prox_bat: false,
    mnt: false,
    pente: false,
    prox_route: false,
    prox_eq: false,
    cn: false,
  });
  const [isPredictionExpanded, setIsPredictionExpanded] = useState({
    proximity: false,
    viability: false,
    elevation: false,
  });
  const predictionImageUrl = "/images/viability_classes1.png";
  const predictionImageBounds = L.latLngBounds(
    [31.9006944439999991, -4.4670833329999997],
    [31.9504166669999989, -4.3970833330000003]
  );
  const predictionImageUrl1 = "/images/indice_viab.png";
  const predictionImageBounds1 = L.latLngBounds(
    [31.9006944439999991, -4.4670833329999997],
    [31.9504166669999989, -4.3970833330000003]
  );
  const predictionImageUrl2 = "/images/prox_bat.png";
  const predictionImageBounds2 = L.latLngBounds(
    [31.900490241, -4.4706480449999999],
    [31.9551482789999994, -4.3970247130000004]
  );
  const predictionImageUrl3 = "/images/mnt.png";
  const predictionImageBounds3 = L.latLngBounds(
    [31.9006944439999991, -4.4670833329999997],
    [31.9504166669999989, -4.3970833330000003]
  );
  const predictionImageUrl4 = "/images/pente.png";
  const predictionImageBounds4 = L.latLngBounds(
    [31.9006944439999991, -4.4670833329999997],
    [31.9504166669999989, -4.3970833330000003]
  );
  const predictionImageUrl5 = "/images/prox_route.png";
  const predictionImageBounds5 = L.latLngBounds(
    [31.900490241, -4.4668999999999999],
    [31.9501482820000007, -4.3969814789999999]
  );
  const predictionImageUrl6 = "/images/prox_eq.png";
  const predictionImageBounds6 = L.latLngBounds(
    [31.900490241, -4.4668999999999999],
    [31.9501482820000007, -4.3969814789999999]
  );

  const barrageIcon = new L.Icon({
    iconUrl: "https://static.thenounproject.com/png/265-512.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [baseMap, setBaseMap] = useState<string>("osm");
  const baseMaps = {
    osm: {
      name: "OpenStreetMap",
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    },
    satellite: {
      name: "Satellite",
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution: "Tiles &copy; Esri",
    },
    topo: {
      name: "Topographique",
      url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
      attribution:
        'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    },
    dark: {
      name: "Mode Nuit",
      url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    },
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    if (value.trim() === "") {
      setSuggestions([]);
      return;
    }
    const results = [...polygons, ...polylines]
      .filter(
        (item) => t[item.name] && t[item.name].toLowerCase().includes(value)
      )
      .slice(0, 3);
    setSuggestions(results);
  };
  const pa1LegendImageUrl = "/images/legende_plan_amenagement_pa1.png";

  const [selectedFeature, setSelectedFeature] = useState(null);
  const [shouldZoom, setShouldZoom] = useState(false);
  const [showNgrokNotice, setShowNgrokNotice] = useState(false);
  const [hasShownNgrokNotice, setHasShownNgrokNotice] = useState(false);
  const [showPa1FloatingLegend, setShowPa1FloatingLegend] = useState(false);

  const MapZoomHandler = ({ selectedFeature }) => {
    const map = useMap();
    useEffect(() => {
      if (shouldZoom && selectedFeature && selectedFeature.positions) {
        map.flyToBounds(selectedFeature.positions, { padding: [50, 50] });
        setShouldZoom(false);
      }
    }, [shouldZoom, selectedFeature, map, setShouldZoom]);
    return null;
  };
  const zoomToFeature = (feature) => {
    setSelectedFeature(feature);
    setShouldZoom(true);
  };
  const matchesSearch = (name: string | undefined) => {
    return searchTerm && name && name.toLowerCase().includes(searchTerm);
  };
  const getHighlightClass = (name: string | undefined) => {
    return matchesSearch(name) ? "fill-yellow-800 stroke-yellow-800" : "";
  };
  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };
  const toggleFullscreen = () => {
    const element = document.getElementById("data-window");
    if (!isFullscreen) {
      if (element?.requestFullscreen) {
        element.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDownloadOptions) {
        setShowDownloadOptions(false);
      }
    };
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDownloadOptions]);

  const dataCategories = {
    Demography: [
      "pop2024",
      "pop2024 M",
      "pop2024 F",
      "%pop-15",
      "%pop-15 M",
      "%pop-15 F",
      "%pop15-59",
      "%p15-59 M",
      "%p15-59 F",
      "%pop+60",
      "%pop+60 M",
      "%pop+60 F",
      "%p celi+15",
      "%p ce+15 M",
      "%p ce+15 F",
      "%p mari+15",
      "%p mr+15 M",
      "%p mr+15 F",
      "%p div+15",
      "%p dv+15 M",
      "%p dv+15 F",
      "%p vf+15",
      "%p vf+15 M",
      "%p vf+15 F",
      "age 1r mar",
      "age 1r m M",
      "age 1r m F",
      "Parite 45-",
      "ISF",
    ],
    Health: ["%pre handi", "%pre han M", "%pre han F"],
    education: [
      "%ana10",
      "%ana10_M",
      "%ana10_F",
      "%ar",
      "%ar_M",
      "%ar_F",
      "%arfr",
      "%arfr_M",
      "%arfr_F",
      "%arfang",
      "%arfang_M",
      "%arfang_F",
      "%sco611",
      "%sco611_M",
      "%sco611_F",
      "%niv0",
      "%niv0_M",
      "%niv0_F",
      "%pre",
      "%pre_M",
      "%pre_F",
      "%pri",
      "%pri_M",
      "%pri_F",
      "%secC",
      "%secC_M",
      "%secC_F",
      "%secQ",
      "%secQ_M",
      "%secQ_F",
      "%sup",
      "%sup_M",
      "%sup_F",
    ],
    langues: [
      "%LM_ar",
      "%LM_ar_M",
      "%LM_ar_F",
      "%LM_am",
      "%LM_am_M",
      "%LM_am_F",
    ],
    emploi: [
      "%act15",
      "%act15_M",
      "%act15_F",
      "%chom",
      "%chom_M",
      "%chom_F",
      "%emp",
      "%emp_M",
      "%emp_F",
      "%ind",
      "%ind_M",
      "%ind_F",
      "%sal",
      "%sal_M",
      "%sal_F",
      "%aid",
      "%aid_M",
      "%aid_F",
      "%apr",
      "%apr_M",
      "%apr_F",
      "%ass",
      "%ass_M",
      "%ass_F",
    ],
    menages: [
      "Men_Nb",
      "Men_Tai",
      "Vil_%",
      "App_%",
      "MaiM_%",
      "MaiS_%",
      "LogR_%",
      "Occup_%",
      "Prop_%",
      "Loc_%",
      "Cuis_%",
      "WC_%",
      "Bain_%",
      "Eau_%",
      "Elec_%",
      "EauP_%",
      "EauF_%",
      "Log_10-%",
      "Log10_19",
      "Log20_49",
      "Log_50+",
    ],
    economie: ["EE_Tot", "EE_Pub", "EE_Ass", "EE_Sou", "EE_Luc", "EE_Empl"],
    secac: ["EE_Ind", "EE_Con", "EE_Com", "EE_Ser"],
    cl_emp: ["EE_E1", "EE_E2", "EE_E4", "EE_E10", "EE_E50"],
    creation: [
      "EE_1956",
      "EE_5680",
      "EE_8190",
      "EE_9100",
      "EE_0110",
      "EE_1119",
      "EE_20+",
    ],
  };
  const position: [number, number] = [31.300779713704344, -4.78346132014275];
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [dataWindowVisible, setDataWindowVisible] = useState(false);
  const [legendVisible, setLegendVisible] = useState(false);
  const [layersVisible, setLayersVisible] = useState(false);
  const [allPanelsVisible, setAllPanelsVisible] = useState(false);
  useEffect(() => {
    setAllPanelsVisible(dataWindowVisible && legendVisible && layersVisible);
  }, [dataWindowVisible, legendVisible, layersVisible]);
  const toggleAllPanels = () => {
    const newState = !allPanelsVisible;
    setDataWindowVisible(newState);
    setLegendVisible(newState);
    setLayersVisible(newState);
    setAllPanelsVisible(newState);
    setIsExpanded(false);
  };
  const [showTour, setShowTour] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const [isFirstSiteVisit, setIsFirstSiteVisit] = useState(true);
  const tourSteps = [
    {
      target: null,
      title: t.tourWelcomeTitle,
      content: t.tourWelcomeContent,
      position: "center",
    },
    {
      target: ".layers-control-btn",
      title: t.tourLayersTitle,
      content: t.tourLayersContent,
      position: "right",
    },
    {
      target: ".base-map-btn",
      title: t.tourBaseMapTitle,
      content: t.tourBaseMapContent,
      position: "left",
    },
    {
      target: ".legend-btn",
      title: t.tourLegendTitle,
      content: t.tourLegendContent,
      position: "left",
    },
    {
      target: ".search-control",
      title: t.tourSearchTitle,
      content: t.tourSearchContent,
      position: "bottom",
    },
    {
      target: ".data-window-btn",
      title: t.tourDataTitle,
      content: t.tourDataContent,
      position: "right",
    },
  ];
  const getTargetPosition = (selector: string) => {
    const element = document.querySelector(selector);
    if (!element) return { top: "50%", left: "50%" };
    const rect = element.getBoundingClientRect();
    return {
      top: `${rect.top + window.scrollY}px`,
      left: `${rect.left + window.scrollX}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
    };
  };
  const getWindowPosition = () => {
    if (!tourSteps[currentStep].target)
      return "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2";
    const targetRect = document
      .querySelector(tourSteps[currentStep].target)
      ?.getBoundingClientRect();
    if (!targetRect)
      return "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2";
    if (tourSteps[currentStep].target.includes("legend")) {
      return "left-[calc(100%-320px)] bottom-0 -translate-y-1/2";
    }
    if (tourSteps[currentStep].target.includes("layers")) {
      return "left-[calc(100%)] bottom-0 -translate-y-1/3";
    }
    const windowHeight = window.innerHeight;
    const spaceBelow = windowHeight - targetRect.bottom;
    return spaceBelow < 300
      ? "bottom-[calc(100%+20px)] left-1/2 transform -translate-x-1/2"
      : "top-[calc(100%+20px)] left-1/2 transform -translate-x-1/2";
  };
  const handleNextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setShowTour(false);
      setIsFirstVisit(false);
    }
  };
  const [showHomeTour, setShowHomeTour] = useState(true);
  const [currentHomeStep, setCurrentHomeStep] = useState(0);
  const [isFirstHomeVisit, setIsFirstHomeVisit] = useState(true);

  const homeTourSteps = [
    {
      target: null,
      title: t.homeTourWelcomeTitle,
      content: t.homeTourWelcomeContent,
      position: "center",
    },
    {
      target: ".nav-toggle-btn",
      title: t.homeTourNavTitle,
      content: t.homeTourNavContent,
      position: "right",
    },
    {
      target: ".theme-toggle-btn",
      title: t.homeTourThemeTitle,
      content: t.homeTourThemeContent,
      position: "right",
    },
    {
      target: ".lang-selector",
      title: t.homeTourLangTitle,
      content: t.homeTourLangContent,
      position: "right",
    },
    {
      target: ".map-access-btn",
      title: t.homeTourMapBtnTitle,
      content: t.homeTourMapBtnContent,
      position: "center",
    },
  ];

  const handleNextHomeStep = () => {
    if (currentHomeStep < homeTourSteps.length - 1) {
      setCurrentHomeStep((prev) => prev + 1);
    } else {
      setShowHomeTour(false);
      setIsFirstHomeVisit(false);
    }
  };

  const getHomeTargetPosition = (selector: string | null) => {
    if (!selector) return { top: "50%", left: "50%" };
    const element = document.querySelector(selector);
    if (!element) return { top: "50%", left: "50%" };
    const rect = element.getBoundingClientRect();
    return {
      top: `${rect.top + window.scrollY}px`,
      left: `${rect.left + window.scrollX}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
    };
  };

  const getHomeWindowPosition = () => {
    if (!homeTourSteps[currentHomeStep].target)
      return "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2";
    const targetRect = document
      .querySelector(homeTourSteps[currentHomeStep].target)
      ?.getBoundingClientRect();
    if (!targetRect)
      return "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2";
    if (homeTourSteps[currentHomeStep].target.includes("theme")) {
      return "left-[calc(100%+32px)] bottom-0 -translate-y-1/3";
    }
    const windowHeight = window.innerHeight;
    const spaceBelow = windowHeight - targetRect.bottom;
    return spaceBelow < 300
      ? "bottom-[calc(100%+20px)] left-1/2 transform -translate-x-1/2"
      : "top-[calc(100%+20px)] left-1/2 transform -translate-x-1/2";
  };
  const [activePanel, setActivePanel] = useState<"layers" | "baseMap">(
    "baseMap"
  );

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };
  useEffect(() => {
    if (
      (activeLayers.midelt_P ||
        activeLayers.errachidia_P ||
        activeLayers.pa1) &&
      !hasShownNgrokNotice
    ) {
      setShowNgrokNotice(true);
      setHasShownNgrokNotice(true);
    }
  }, [
    activeLayers.midelt_P,
    activeLayers.errachidia_P,
    activeLayers.pa1,
    hasShownNgrokNotice,
  ]);
  const LAYER_BOUNDS = {
    // commune: L.latLngBounds([30.0, -7.0], [33.0, -3.0]),
    // province: L.latLngBounds([30.0, -7.0], [33.0, -3.0]),
    // region: L.latLngBounds([30.0, -7.0], [33.0, -3.0]),

    // midelt_P: L.latLngBounds([32.5, -5.0], [32.8, -4.5]),
    // errachidia_P: L.latLngBounds([31.0, -4.8], [31.5, -4.2]),
    pa1: L.latLngBounds([31.93452, -4.43151], [31.92356, -4.41578]),
    class_viabl: L.latLngBounds(
      [31.9006944439999991, -4.4670833329999997],
      [31.9504166669999989, -4.3970833330000003]
    ),
    ind_viabl: L.latLngBounds(
      [31.9006944439999991, -4.4670833329999997],
      [31.9504166669999989, -4.3970833330000003]
    ),
    prox_bat: L.latLngBounds(
      [31.900490241, -4.4706480449999999],
      [31.9551482789999994, -4.3970247130000004]
    ),
    mnt: L.latLngBounds(
      [31.9006944439999991, -4.4670833329999997],
      [31.9504166669999989, -4.3970833330000003]
    ),
    pente: L.latLngBounds(
      [31.9006944439999991, -4.4670833329999997],
      [31.9504166669999989, -4.3970833330000003]
    ),
    prox_route: L.latLngBounds(
      [31.900490241, -4.4668999999999999],
      [31.9501482820000007, -4.3969814789999999]
    ),
    prox_eq: L.latLngBounds(
      [31.900490241, -4.4668999999999999],
      [31.9501482820000007, -4.3969814789999999]
    ),
    cn: L.latLngBounds(
      [31.900490241, -4.4668999999999999],
      [31.9501482820000007, -4.3969814789999999]
    ),

    // routenationale: L.latLngBounds([30.0, -7.0], [33.0, -3.0]),
    // routeprovinciale: L.latLngBounds([30.0, -7.0], [33.0, -3.0]),
    // routeregionale: L.latLngBounds([30.0, -7.0], [33.0, -3.0]),
    // barrage: L.latLngBounds([30.0, -7.0], [33.0, -3.0]),
    // bassin: L.latLngBounds([30.0, -7.0], [33.0, -3.0]),
    // oued: L.latLngBounds([30.0, -7.0], [33.0, -3.0]),
    // nappe: L.latLngBounds([30.0, -7.0], [33.0, -3.0]),
  };
  const MapLayerZoomer = ({ activeLayerName, setLayerZoomed }) => {
    const map = useMap(); // Accède à l'instance de la carte Leaflet

    useEffect(() => {
      if (activeLayerName && LAYER_BOUNDS[activeLayerName]) {
        const bounds = LAYER_BOUNDS[activeLayerName];
        map.flyToBounds(bounds, { padding: [50, 50] });
        setLayerZoomed(true); // Indique que le zoom a été effectué
      }
    }, [activeLayerName, map, setLayerZoomed]);

    return null; // Ce composant ne rend rien visuellement
  };
  const [layerToZoom, setLayerToZoom] = useState<string | null>(null);

  const toggleLayer = (layer: string) => {
    setActiveLayers((prevState) => {
      const newState = {
        ...prevState,
        [layer]: !prevState[layer],
      };

      if (newState[layer] === true) {
        setLayerToZoom(layer);
      } else {
        setLayerToZoom(null);
      }
      if (layer === "pa1") {
        setShowPa1FloatingLegend(newState[layer]);
      }

      return newState;
    });
  };

  const layers: {
    color: string;
    layer: string;
    type: string;
  }[] = [
    {
      color: "blue",
      layer: "commune",
      type: "polygone",
    },
    {
      color: "red",
      layer: "province",
      type: "polygone",
    },
    {
      color: "green",
      layer: "region",
      type: "polygone",
    },
    {
      color: "#ffff00",
      layer: "routenationale",
      type: "polyline",
    },
    {
      color: "#333333",
      layer: "routeregionale",
      type: "polyline",
    },
    {
      color: "#FF6600",
      layer: "routeprovinciale",
      type: "polyline",
    },
    {
      color: "yellow",
      layer: "barrage",
      type: "point",
    },
    {
      color: "#0981D1",
      layer: "bassin",
      type: "polygone",
    },
    {
      color: "#0F056B",
      layer: "oued",
      type: "polyline",
    },
    {
      color: "#7F00FF",
      layer: "nappe",
      type: "polygone",
    },
    {
      color: "#93ff8f",
      layer: "midelt_P",
      type: "polygone",
    },
    {
      color: "#EE00FF",
      layer: "errachidia_P",
      type: "polygone",
    },
    {
      color: "#9e9824",
      layer: "cn",
      type: "polyline",
    },
  ];
  const changeLanguage = () => {
    setLanguage((prevLang) => {
      switch (prevLang) {
        case "fr":
          return "en";
        case "en":
          return "ar";
        case "ar":
          return "fr";
        default:
          return "fr";
      }
    });
  };
  const [isAdminExpanded, setIsAdminExpanded] = useState(false);
  const [isRoadExpanded, setIsRoadExpanded] = useState(false);
  const [isHydroExpanded, setIsHydroExpanded] = useState(false);
  const [isLandExpanded, setisLandExpanded] = useState(false);
  const [isPAExpanded, setisPAExpanded] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  // Removed Chart generation logic and handleCommuneToggle from here. It's now in GraphPage.tsx

  const generatePdfReport = (selectedPolygon: any, t: any) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.addFileToVFS("Amiri-Regular.ttf", amiriFont);
    doc.addFont("Amiri-Regular.ttf", "Amiri", "normal");
    doc.setFont("Amiri");
    doc.setFontSize(24);
    doc.text(`${t.rapport}`, pageWidth / 2, 20, { align: "center" });

    doc.setFontSize(20);
    doc.text(`${t.Commune} ${t[selectedPolygon.name]}`, pageWidth / 2, 40, {
      align: "center",
    });

    doc.setFontSize(16);
    doc.text(`${t.Demography}`, pageWidth / 2, 60, { align: "center" });
    let yOffset = 70;
    doc.setFontSize(12);
    dataCategories.Demography.forEach((key) => {
      doc.text(
        `${t[key as keyof typeof t]}: ${selectedPolygon[key]}`,
        pageWidth / 2,
        yOffset,
        { align: "center" }
      );
      yOffset += 10;
      if (yOffset > 270) {
        doc.addPage();
        yOffset = 20;
      }
    });

    doc.setFontSize(16);
    doc.text(`${t.Health}`, pageWidth / 2, yOffset + 10, { align: "center" });
    yOffset += 20;
    doc.setFontSize(12);
    dataCategories.Health.forEach((key) => {
      doc.text(
        `${t[key as keyof typeof t]}: ${selectedPolygon[key]}`,
        pageWidth / 2,
        yOffset,
        { align: "center" }
      );
      yOffset += 10;
      if (yOffset > 270) {
        doc.addPage();
        yOffset = 20;
      }
    });

    doc.setFontSize(16);
    doc.text(`${t.education}`, pageWidth / 2, yOffset + 10, {
      align: "center",
    });
    yOffset += 20;
    doc.setFontSize(12);
    dataCategories.education.forEach((key) => {
      doc.text(
        `${t[key as keyof typeof t]}: ${selectedPolygon[key]}`,
        pageWidth / 2,
        yOffset,
        { align: "center" }
      );
      yOffset += 10;
      if (yOffset > 270) {
        doc.addPage();
        yOffset = 20;
      }
    });

    doc.setFontSize(16);
    doc.text(`${t.langues}`, pageWidth / 2, yOffset + 10, { align: "center" });
    yOffset += 20;
    doc.setFontSize(12);
    dataCategories.langues.forEach((key) => {
      doc.text(
        `${t[key as keyof typeof t]}: ${selectedPolygon[key]}`,
        pageWidth / 2,
        yOffset,
        { align: "center" }
      );
      yOffset += 10;
      if (yOffset > 270) {
        doc.addPage();
        yOffset = 20;
      }
    });

    doc.setFontSize(16);
    doc.text(`${t.emploi}`, pageWidth / 2, yOffset + 10, { align: "center" });
    yOffset += 20;
    doc.setFontSize(12);
    dataCategories.emploi.forEach((key) => {
      doc.text(
        `${t[key as keyof typeof t]}: ${selectedPolygon[key]}`,
        pageWidth / 2,
        yOffset,
        { align: "center" }
      );
      yOffset += 10;
      if (yOffset > 270) {
        doc.addPage();
        yOffset = 20;
      }
    });

    doc.setFontSize(16);
    doc.text(`${t.menages}`, pageWidth / 2, yOffset + 10, { align: "center" });
    yOffset += 20;
    doc.setFontSize(12);
    dataCategories.menages.forEach((key) => {
      doc.text(
        `${t[key as keyof typeof t]}: ${selectedPolygon[key]}`,
        pageWidth / 2,
        yOffset,
        { align: "center" }
      );
      yOffset += 10;
      if (yOffset > 270) {
        doc.addPage();
        yOffset = 20;
      }
    });

    doc.setFontSize(16);
    doc.text(`${t.economie}`, pageWidth / 2, yOffset + 10, { align: "center" });
    yOffset += 20;
    doc.setFontSize(12);
    dataCategories.economie.forEach((key) => {
      doc.text(
        `${t[key as keyof typeof t]}: ${selectedPolygon[key]}`,
        pageWidth / 2,
        yOffset,
        { align: "center" }
      );
      yOffset += 10;
      if (yOffset > 270) {
        doc.addPage();
        yOffset = 20;
      }
    });

    doc.setFontSize(16);
    doc.text(`${t.secac}`, pageWidth / 2, yOffset + 10, { align: "center" });
    yOffset += 20;
    doc.setFontSize(12);
    dataCategories.secac.forEach((key) => {
      doc.text(
        `${t[key as keyof typeof t]}: ${selectedPolygon[key]}`,
        pageWidth / 2,
        yOffset,
        { align: "center" }
      );
      yOffset += 10;
      if (yOffset > 270) {
        doc.addPage();
        yOffset = 20;
      }
    });

    doc.setFontSize(16);
    doc.text(`${t.cl_emp}`, pageWidth / 2, yOffset + 10, { align: "center" });
    yOffset += 20;
    doc.setFontSize(12);
    dataCategories.cl_emp.forEach((key) => {
      doc.text(
        `${t[key as keyof typeof t]}: ${selectedPolygon[key]}`,
        pageWidth / 2,
        yOffset,
        { align: "center" }
      );
      yOffset += 10;
      if (yOffset > 270) {
        doc.addPage();
        yOffset = 20;
      }
    });

    doc.setFontSize(16);
    doc.text(`${t.creation}`, pageWidth / 2, yOffset + 10, { align: "center" });
    yOffset += 20;
    doc.setFontSize(12);
    dataCategories.creation.forEach((key) => {
      doc.text(
        `${t[key as keyof typeof t]}: ${selectedPolygon[key]}`,
        pageWidth / 2,
        yOffset,
        { align: "center" }
      );
      yOffset += 10;
      if (yOffset > 270) {
        doc.addPage();
        yOffset = 20;
      }
    });

    doc.save(`rapport_recensement_${selectedPolygon.name}.pdf`);
  };

  const generateCsvReport = (selectedPolygon: any, t: any) => {
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    const headers = [t.Categories, t.indices, t.valeurs];
    csvContent += headers.join(",") + "\r\n";

    Object.keys(dataCategories).forEach((category) => {
      dataCategories[category].forEach((key) => {
        const row = [
          t[category],
          t[key as keyof typeof t],
          selectedPolygon[key],
        ].join(",");
        csvContent += row + "\r\n";
      });
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `rapport_recensement_${selectedPolygon.name}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div
      className={`flex h-screen ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-gray-400 text-black"
      } ${language === "ar" ? "rtl" : "ltr"}`}
    >
      {isFirstHomeVisit && showHomeTour && currentPage === "accueil" && (
        <div className="fixed inset-0 bg-black/50 z-[9998]">
          <div
            className="fixed z-[9999]"
            style={getHomeTargetPosition(homeTourSteps[currentHomeStep].target)}
          >
            {homeTourSteps[currentHomeStep].target && (
              <div className="absolute inset-0 border-4 border-blue-400 rounded-xl shadow-[0_0_20px_3px_rgba(96,165,250,0.5)] animate-pulse" />
            )}
            <div
              className={`
                absolute ${getHomeWindowPosition()}
                min-w-[300px] min-h-[150px]
                max-w-[90vw] max-h-[80vh]
                p-6 rounded-xl shadow-2xl
                ${
                  isDarkMode
                    ? "bg-gray-800 text-white"
                    : "bg-white text-gray-800"
                }
                transition-all duration-300
              `}
            >
              <h3 className="text-xl font-bold mb-3">
                {homeTourSteps[currentHomeStep].title}
              </h3>
              <p className="mb-6 text-lg leading-relaxed">
                {homeTourSteps[currentHomeStep].content}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-sm opacity-75">
                  {currentHomeStep + 1}/{homeTourSteps.length}
                </span>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowHomeTour(false);
                      setIsFirstHomeVisit(false);
                    }}
                    className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800"
                  >
                    {t.skipBtn}
                  </button>
                  <button
                    onClick={handleNextHomeStep}
                    className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    {currentHomeStep === homeTourSteps.length - 1
                      ? t.doneBtn
                      : t.nextBtn}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {isFirstVisit && showTour && currentPage === "map" && (
        <div className="fixed inset-0 bg-black/50 z-[9998]">
          <div
            className="fixed z-[9999]"
            style={getTargetPosition(tourSteps[currentStep].target)}
          >
            {tourSteps[currentStep].target && (
              <div className="absolute inset-0 border-4 border-blue-400 rounded-xl shadow-[0_0_20px_3px_rgba(96,165,250,0.5)] animate-pulse" />
            )}
            <div
              className={`
                absolute ${getWindowPosition()}
                min-w-[300px] min-h-[150px]
                max-w-[90vw] max-h-[80vh]
                p-6 rounded-xl shadow-2xl
                ${
                  isDarkMode
                    ? "bg-gray-800 text-white"
                    : "bg-white text-gray-800"
                }
                transition-all duration-300
              `}
            >
              <h3 className="text-xl font-bold mb-3">
                {tourSteps[currentStep].title}
              </h3>
              <p className="mb-6 text-lg leading-relaxed">
                {tourSteps[currentStep].content}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-sm opacity-75">
                  {currentStep + 1}/{tourSteps.length}
                </span>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowTour(false);
                      setIsFirstVisit(false);
                    }}
                    className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800"
                  >
                    {t.skipBtn}
                  </button>
                  <button
                    onClick={handleNextStep}
                    className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    {currentStep === tourSteps.length - 1
                      ? t.doneBtn
                      : t.nextBtn}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <div
        className={`${isNavOpen ? "w-64" : "w-20"} ${
          isDarkMode ? "bg-gray-900 text-white" : "bg-white text-black"
        } h-full transition-all duration-300 ease-in-out relative z-50`}
      >
        <button
          onClick={() => setIsNavOpen(!isNavOpen)}
          className={`nav-toggle-btn absolute -right-3 top-9 ${
            isDarkMode ? "bg-black" : "bg-gray-200"
          } rounded-full p-1 z-10`}
        >
          {isNavOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
        <div className="p-4">
          <div className="flex items-center mb-8">
            <Menu className="h-8 w-8" />
            {isNavOpen && (
              <span className="ml-2 text-xl font-bold">{t.controlPanel}</span>
            )}
          </div>
          <nav>
            <NavItem
              icon={<Home />}
              text={t.home}
              isOpen={isNavOpen}
              onClick={() => setCurrentPage("home")}
            />
            <NavItem
              icon={<Map />}
              text={t.map}
              isOpen={isNavOpen}
              onClick={() => setCurrentPage("map")}
            />
            <NavItem
              icon={<BarChart2 />} // Using BarChart2 for the graph icon
              text={t.graph} // Add 'graph' to your translations
              isOpen={isNavOpen}
              onClick={() => setCurrentPage("graph")}
            />
          </nav>
          <button
            onClick={toggleDarkMode}
            className={`theme-toggle-btn absolute -left-1/5 bottom-4 p-2 rounded-full ${
              isDarkMode ? "bg-black text-white" : "bg-gray-200 text-black"
            }`}
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          {isNavOpen && (
            <div className="lang-selector absolute bottom-4 right-4">
              <div className="relative inline-block">
                <Globe
                  size={24}
                  className={`absolute left-3 top-2.5 ${
                    isDarkMode ? "text-white" : "text-black"
                  }`}
                />
                <select
                  className={`pl-10 pr-4 py-2 border rounded-lg shadow-md ${
                    isDarkMode
                      ? "bg-black text-white"
                      : "bg-gray-200 text-black"
                  }`}
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                  <option value="ar">العربية</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        {" "}
        {/* This is your main content area next to the nav */}
        {currentPage === "map" ? (
          <div
            className={`${
              isDarkMode
                ? "bg-gradient-to-r from-gray-800 via-black to-gray-800 border-blue-400"
                : "bg-gradient-to-r from-white via-gray-200 to-white border-blue-700"
            } shadow-lg p-6 border-b-4 flex items-center justify-center gap-3`}
          >
            <Map
              size={32}
              className={`${isDarkMode ? "text-blue-300" : "text-blue-700"}`}
            />
            <h1
              className={`text-2xl font-extrabold ${
                isDarkMode ? "text-white" : "text-black"
              } drop-shadow-lg`}
            >
              {t.title}
            </h1>
          </div>
        ) : currentPage === "graph" ? ( // New header for graph page
          <div
            className={`${
              isDarkMode
                ? "bg-gradient-to-r from-gray-800 via-black to-gray-800 border-blue-400"
                : "bg-gradient-to-r from-white via-gray-200 to-white border-blue-700"
            } shadow-lg p-6 border-b-4 flex items-center justify-center gap-3`}
          >
            <BarChart2
              size={32}
              className={`${isDarkMode ? "text-blue-300" : "text-blue-700"}`}
            />
            <h1
              className={`text-2xl font-extrabold ${
                isDarkMode ? "text-white" : "text-black"
              } drop-shadow-lg`}
            >
              {t.graphComparison1}
            </h1>
          </div>
        ) : null}
        <div
          className={`flex-1 ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          } overflow-auto`}
        >
          {" "}
          {/* This wrapper needs overflow-auto */}{" "}
          {/* This div needs to manage its background based on content */}
          {currentPage === "map" ? (
            <>
              {showPa1FloatingLegend && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                  className={`
                     absolute top-24 right-4 z-40 p-4 rounded-lg shadow-lg
                     ${
                       isDarkMode
                         ? "bg-gray-900 text-white"
                         : "bg-white text-black"
                     }
                     max-w-[290px] max-h-[80vh] overflow-y-auto scrollbar-thin
                     ${isDarkMode ? "scrollbar-dark" : "scrollbar-light"}
                   `}
                >
                  <div className="flex justify-between items-center mb-3">
                    <h3
                      className={`font-bold text-lg ${
                        isDarkMode ? "text-blue-300" : "text-blue-700"
                      }`}
                    >
                      {t.pa1LegendAltText}
                    </h3>
                    <button
                      onClick={() => setShowPa1FloatingLegend(false)}
                      className={`p-1 rounded-full ${
                        isDarkMode
                          ? "text-gray-300 hover:bg-gray-700"
                          : "text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <img
                    src={pa1LegendImageUrl}
                    alt={t.pa1LegendAltText}
                    className="max-w-full h-auto"
                  />
                </motion.div>
              )}
              <div className="search-control absolute top-24 right-4 z-10">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearch}
                    placeholder={t.recherche}
                    className={`p-2 pl-10 pr-10 w-64 border rounded-md ${
                      isDarkMode
                        ? "bg-gray-900 text-white placeholder-gray-400 ring-2 ring-blue-400"
                        : "text-gray-700 placeholder-gray-400 ring-2 ring-blue-700"
                    }`}
                  />
                  <Search className="absolute left-2 top-2.5 w-5 h-5 text-gray-400" />
                  {suggestions.length > 0 && (
                    <div
                      className={`absolute top-full left-0 w-full ${
                        isDarkMode ? "bg-gray-900" : "bg-white"
                      } border rounded-md shadow-lg z-20`}
                    >
                      {suggestions.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => zoomToFeature(item)}
                          className={`p-2 cursor-pointer hover:bg-blue-500 ${
                            isDarkMode ? "hover:text-black" : "hover:text-white"
                          } transition`}
                        >
                          {t[item.name]}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <MapContainer
                center={position}
                zoom={7}
                style={{ height: "100%", width: "100%" }}
                id="main-map"
              >
                <TileLayer
                  url={baseMaps[baseMap].url}
                  attribution={baseMaps[baseMap].attribution}
                />
                <MapLayerZoomer
                  activeLayerName={layerToZoom}
                  setLayerZoomed={() => setLayerToZoom(null)}
                />

                {activeLayers.midelt_P && (
                  <WMSTileLayer
                    url="https://42f3-34-82-90-5.ngrok-free.app/geoserver/midelt/wms"
                    layers="midelt:midelt"
                    format="image/png"
                    transparent={true}
                    opacity={0.7}
                    version="1.1.0"
                    attribution="© Données cadastrales Midelt"
                  />
                )}

                {activeLayers.errachidia_P && (
                  <WMSTileLayer
                    url="https://42f3-34-82-90-5.ngrok-free.app/geoserver/Errachidia/wms"
                    layers="Errachidia:Errachidia"
                    format="image/png"
                    transparent={true}
                    opacity={0.7}
                    version="1.1.0"
                    attribution="© Données cadastrales Errachidia"
                  />
                )}
                {activeLayers.pa1 && ( // Assurez-vous d'avoir cet état dans activeLayers
                  <WMSTileLayer
                    url="https://42f3-34-82-90-5.ngrok-free.app/geoserver/Errachidia/wms" // URL de base de votre GeoServer avec le Workspace PlansCadastre
                    layers="Errachidia:poly_pa1" // Nom exact de la couche publiée dans GeoServer
                    format="image/png"
                    transparent={true}
                    opacity={0.7}
                    version="1.1.0"
                    attribution="© Plan d'aménagement"
                  />
                )}
                {/* Couche WMS ligne_pa1 */}
                {activeLayers.pa1 && ( // Assurez-vous d'avoir cet état dans activeLayers
                  <WMSTileLayer
                    url="https://42f3-34-82-90-5.ngrok-free.app/geoserver/Errachidia/wms" // URL de base de votre GeoServer avec le Workspace PlansCadastre
                    layers="Errachidia:ligne_pa1" // Nom exact de la couche publiée dans GeoServer
                    format="image/png"
                    transparent={true}
                    opacity={0.7}
                    version="1.1.0"
                    attribution=""
                  />
                )}
                {activeLayers.class_viabl && (
                  <ImageOverlay
                    url={predictionImageUrl} // L'URL de votre image locale (dans public/)
                    bounds={predictionImageBounds} // Les bornes géographiques de l'image (Lat/Lng)
                    opacity={1} // Opacité de la couche (0.0 à 1.0)
                    zIndex={10} // Ordre de superposition (plus le zIndex est élevé, plus la couche est au-dessus)
                  >
                    {/* Vous pouvez ajouter un Popup si l'utilisateur clique sur l'image */}
                    <Popup>
                      <div className="font-semibold">
                        {t.layer_class_viabl} <br />
                        {t.prediction_source_attribution}{" "}
                        {/* Attribution/source si vous avez une traduction pour ça */}
                      </div>
                    </Popup>
                  </ImageOverlay>
                )}
                {activeLayers.ind_viabl && (
                  <ImageOverlay
                    url={predictionImageUrl1} // L'URL de votre image locale (dans public/)
                    bounds={predictionImageBounds1} // Les bornes géographiques de l'image (Lat/Lng)
                    opacity={1} // Opacité de la couche (0.0 à 1.0)
                    zIndex={10} // Ordre de superposition (plus le zIndex est élevé, plus la couche est au-dessus)
                  >
                    {/* Vous pouvez ajouter un Popup si l'utilisateur clique sur l'image */}
                    <Popup>
                      <div className="font-semibold">
                        {t.layer_class_viabl} <br />
                        {t.prediction_source_attribution}{" "}
                        {/* Attribution/source si vous avez une traduction pour ça */}
                      </div>
                    </Popup>
                  </ImageOverlay>
                )}
                {activeLayers.prox_bat && (
                  <ImageOverlay
                    url={predictionImageUrl2} // L'URL de votre image locale (dans public/)
                    bounds={predictionImageBounds2} // Les bornes géographiques de l'image (Lat/Lng)
                    opacity={1} // Opacité de la couche (0.0 à 1.0)
                    zIndex={10} // Ordre de superposition (plus le zIndex est élevé, plus la couche est au-dessus)
                  >
                    {/* Vous pouvez ajouter un Popup si l'utilisateur clique sur l'image */}
                    <Popup>
                      <div className="font-semibold">
                        {t.layer_class_viabl} <br />
                        {t.prediction_source_attribution}{" "}
                        {/* Attribution/source si vous avez une traduction pour ça */}
                      </div>
                    </Popup>
                  </ImageOverlay>
                )}
                {activeLayers.mnt && (
                  <ImageOverlay
                    url={predictionImageUrl3} // L'URL de votre image locale (dans public/)
                    bounds={predictionImageBounds3} // Les bornes géographiques de l'image (Lat/Lng)
                    opacity={1} // Opacité de la couche (0.0 à 1.0)
                    zIndex={10} // Ordre de superposition (plus le zIndex est élevé, plus la couche est au-dessus)
                  >
                    {/* Vous pouvez ajouter un Popup si l'utilisateur clique sur l'image */}
                    <Popup>
                      <div className="font-semibold">
                        {t.layer_class_viabl} <br />
                        {t.prediction_source_attribution}{" "}
                        {/* Attribution/source si vous avez une traduction pour ça */}
                      </div>
                    </Popup>
                  </ImageOverlay>
                )}
                {activeLayers.pente && (
                  <ImageOverlay
                    url={predictionImageUrl4} // L'URL de votre image locale (dans public/)
                    bounds={predictionImageBounds4} // Les bornes géographiques de l'image (Lat/Lng)
                    opacity={1} // Opacité de la couche (0.0 à 1.0)
                    zIndex={10} // Ordre de superposition (plus le zIndex est élevé, plus la couche est au-dessus)
                  >
                    {/* Vous pouvez ajouter un Popup si l'utilisateur clique sur l'image */}
                    <Popup>
                      <div className="font-semibold">
                        {t.layer_class_viabl} <br />
                        {t.prediction_source_attribution}{" "}
                        {/* Attribution/source si vous avez une traduction pour ça */}
                      </div>
                    </Popup>
                  </ImageOverlay>
                )}
                {activeLayers.prox_route && (
                  <ImageOverlay
                    url={predictionImageUrl5} // L'URL de votre image locale (dans public/)
                    bounds={predictionImageBounds5} // Les bornes géographiques de l'image (Lat/Lng)
                    opacity={1} // Opacité de la couche (0.0 à 1.0)
                    zIndex={10} // Ordre de superposition (plus le zIndex est élevé, plus la couche est au-dessus)
                  >
                    {/* Vous pouvez ajouter un Popup si l'utilisateur clique sur l'image */}
                    <Popup>
                      <div className="font-semibold">
                        {t.layer_class_viabl} <br />
                        {t.prediction_source_attribution}{" "}
                        {/* Attribution/source si vous avez une traduction pour ça */}
                      </div>
                    </Popup>
                  </ImageOverlay>
                )}
                {activeLayers.prox_eq && (
                  <ImageOverlay
                    url={predictionImageUrl6} // L'URL de votre image locale (dans public/)
                    bounds={predictionImageBounds6} // Les bornes géographiques de l'image (Lat/Lng)
                    opacity={1} // Opacité de la couche (0.0 à 1.0)
                    zIndex={10} // Ordre de superposition (plus le zIndex est élevé, plus la couche est au-dessus)
                  >
                    {/* Vous pouvez ajouter un Popup si l'utilisateur clique sur l'image */}
                    <Popup>
                      <div className="font-semibold">
                        {t.layer_class_viabl} <br />
                        {t.prediction_source_attribution}{" "}
                        {/* Attribution/source si vous avez une traduction pour ça */}
                      </div>
                    </Popup>
                  </ImageOverlay>
                )}

                <MapZoomHandler
                  selectedFeature={selectedFeature}
                  shouldZoom={shouldZoom}
                  setShouldZoom={setShouldZoom}
                />
                {polygons.map((polygon, index) =>
                  activeLayers[polygon.layer] ? (
                    <Polygon
                      key={index}
                      positions={polygon.positions}
                      eventHandlers={{
                        click: () => handlePolygonClick(polygon),
                      }}
                      pathOptions={{
                        fillColor: matchesSearch(t[polygon.name])
                          ? "darkgoldenrod"
                          : polygon.color,
                        fillOpacity: matchesSearch(t[polygon.name]) ? 1 : 0.3,
                        weight: 2,
                        color: polygon.color,
                        opacity: 0.7,
                      }}
                    >
                      <Popup>
                        <div className="font-semibold">
                          {polygon.layer === "midelt_P"
                            ? polygon.name
                            : t[polygon.name]}
                        </div>
                      </Popup>
                    </Polygon>
                  ) : null
                )}
                {polylines.map((polyline, index) =>
                  activeLayers[polyline.layer] ? (
                    <Polyline
                      key={index}
                      positions={polyline.positions}
                      pathOptions={{
                        fillColor: matchesSearch(t[polyline.name])
                          ? "darkgoldenrod"
                          : polyline.color,
                        fillOpacity: 0.3,
                        weight: 2,
                        color: matchesSearch(t[polyline.layer])
                          ? "darkgoldenrod"
                          : polyline.color,
                        opacity: 0.7,
                      }}
                    >
                      <Popup>
                        <div className="font-semibold">{t[polyline.layer]}</div>
                      </Popup>
                    </Polyline>
                  ) : null
                )}
                {points1.map((point, index) =>
                  activeLayers[point.layer] ? (
                    <Marker
                      key={index}
                      position={point.positions}
                      icon={
                        matchesSearch(t[points1.name])
                          ? barrageIcon
                          : barrageIcon
                      }
                    >
                      <Popup>
                        <div className="font-semibold">
                          {t[point.name]} <br />
                          {t.nomoed} {t[point.nom_oued]} <br />
                          {t.Capacité} {point.capacite_i} {t.Mm3} <br />
                          {t.Hauteur} {point.hauteur} {t.metre}
                          <br />
                          {t.Annéemise} {point.annee_mise}
                        </div>
                      </Popup>
                    </Marker>
                  ) : null
                )}
              </MapContainer>
              <div
                className={`data-window-btn absolute top-24 transition-all duration-300 ease-in-out ${
                  isNavOpen ? "left-80" : "left-32"
                } ${
                  isExpanded
                    ? "top-24 w-96 h-[80vh] z-20"
                    : dataWindowVisible
                    ? "top-24 w-72 max-h-56 p-4"
                    : "top-24 w-14 max-h-56 p-[8px]"
                } ${
                  isDarkMode
                    ? "bg-gray-900 scrollbar-dark"
                    : "bg-white scrollbar-light"
                } rounded-lg shadow-lg z-10 overflow-y-auto`}
              >
                {dataWindowVisible ? (
                  <div>
                    <button
                      onClick={toggleExpand}
                      className={`absolute top-10 right-2 p-1 rounded-full ${
                        isDarkMode
                          ? "text-gray-300 hover:bg-gray-700"
                          : "text-gray-700 hover:bg-gray-200"
                      }`}
                      aria-label={
                        isExpanded
                          ? "Agrandir la fenêtre"
                          : "Réduire la fenêtre"
                      }
                    >
                      {isExpanded ? (
                        <Minimize2 className="w-5 h-5" />
                      ) : (
                        <Maximize2 className="w-5 h-5" />
                      )}
                    </button>
                    <h3
                      className={`text-lg font-bold mb-4 ${
                        isDarkMode ? "text-blue-300" : "text-blue-700"
                      }`}
                    >
                      {t.recens}
                    </h3>
                    <button
                      onClick={() => {
                        setDataWindowVisible(false);
                        setIsExpanded(false);
                      }}
                      className={`absolute top-2 right-2 p-1 rounded-full ${
                        isDarkMode
                          ? "text-gray-300 hover:bg-gray-700"
                          : "text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <X className="w-5 h-5" />
                    </button>
                    {selectedPolygon && (
                      <div className="absolute top-[70px] right-0 flex gap-2">
                        <div className="relative inline-block">
                          <button
                            onClick={() =>
                              setShowDownloadOptions(!showDownloadOptions)
                            }
                            className={`p-1 rounded-full ${
                              isDarkMode
                                ? "text-gray-300 hover:bg-gray-700"
                                : "text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            <Download className="w-5 h-5 mr-2" />
                          </button>
                          {showDownloadOptions && (
                            <div
                              className={`absolute right-0 z-20 mt-2 w-18 rounded-md shadow-lg ${
                                isDarkMode ? "bg-gray-800" : "bg-gray-200"
                              } ring-1 ring-black ring-opacity-5`}
                            >
                              <div className="py-1">
                                <button
                                  onClick={() => {
                                    generatePdfReport(selectedPolygon, t);
                                    setShowDownloadOptions(false);
                                  }}
                                  className={`block w-full px-4 py-2 text-sm ${
                                    isDarkMode
                                      ? "text-white hover:bg-gray-700"
                                      : "text-gray-900 hover:bg-gray-300"
                                  }`}
                                >
                                  PDF
                                </button>
                                <button
                                  onClick={() => {
                                    generateCsvReport(selectedPolygon, t);
                                    setShowDownloadOptions(false);
                                  }}
                                  className={`block w-full px-4 py-2 text-sm ${
                                    isDarkMode
                                      ? "text-white hover:bg-gray-700"
                                      : "text-gray-900 hover:bg-gray-300"
                                  }`}
                                >
                                  CSV
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                        {/* This button now navigates to the graph page */}
                        <button
                          onClick={() => {
                            setCurrentPage("graph");
                            setDataWindowVisible(false); // Close data window when navigating
                          }}
                          className={`p-1 rounded-full ${
                            isDarkMode
                              ? "text-gray-300 hover:bg-gray-700"
                              : "text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          <BarChart2 className="w-5 h-5 mr-2" />
                        </button>
                      </div>
                    )}
                    {!selectedPolygon || selectedPolygon.layer !== "commune" ? (
                      <p
                        className={`italic ${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {t.promp}
                      </p>
                    ) : (
                      <>
                        <h4 className="font-semibold text-lg mb-2">
                          {t[selectedPolygon.name]}
                        </h4>
                        <div
                          className={`border rounded-lg p-2 mb-3 ${
                            language === "ar"
                              ? "text-right flex-1"
                              : "text-left"
                          }`}
                        >
                          <div
                            className="flex items-center justify-between cursor-pointer"
                            onClick={() => toggleSection("Demography")}
                          >
                            <div className="flex items-center">
                              <Users className="w-5 h-5 mr-2" />
                              <h5 className="font-medium">{t.Demography}</h5>
                            </div>
                            <ChevronDownIcon
                              className={`w-5 h-5 transform transition-transform ${
                                expandedSections.Demography ? "rotate-180" : ""
                              }`}
                            />
                          </div>
                          {expandedSections.Demography && (
                            <ul className="mt-2 space-y-2">
                              {dataCategories.Demography.map((key) => (
                                <li
                                  key={key}
                                  className={`flex ${
                                    language === "ar"
                                      ? "flex-row-reverse"
                                      : "justify-between"
                                  } ${
                                    isDarkMode
                                      ? "text-gray-300"
                                      : "text-gray-700"
                                  }`}
                                >
                                  <span className="font-medium">
                                    {t[key as keyof typeof t]}
                                  </span>
                                  <span
                                    className={`${
                                      language === "ar"
                                        ? "text-left flex-1"
                                        : "ml-4"
                                    } `}
                                  >
                                    {typeof selectedPolygon[key] === "number"
                                      ? selectedPolygon[key].toLocaleString()
                                      : selectedPolygon[key]}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <div
                          className={`border rounded-lg p-2 mb-3 ${
                            language === "ar"
                              ? "text-right flex-1"
                              : "text-left"
                          }`}
                        >
                          <div
                            className="flex items-center justify-between cursor-pointer"
                            onClick={() => toggleSection("Health")}
                          >
                            <div className="flex items-center">
                              <HeartPulse className="w-5 h-5 mr-2" />
                              <h5 className="font-medium">{t.Health}</h5>
                            </div>
                            <ChevronDownIcon
                              className={`w-5 h-5 transform transition-transform ${
                                expandedSections.Health ? "rotate-180" : ""
                              }`}
                            />
                          </div>
                          {expandedSections.Health && (
                            <ul className="mt-2 space-y-2">
                              {dataCategories.Health.map((key) => (
                                <li
                                  key={key}
                                  className={`flex ${
                                    language === "ar"
                                      ? "flex-row-reverse"
                                      : "justify-between"
                                  } ${
                                    isDarkMode
                                      ? "text-gray-300"
                                      : "text-gray-700"
                                  }`}
                                >
                                  <span className="font-medium">
                                    {t[key as keyof typeof t]}
                                  </span>
                                  <span
                                    className={`${
                                      language === "ar"
                                        ? "text-left flex-1"
                                        : "ml-4"
                                    } `}
                                  >
                                    {typeof selectedPolygon[key] === "number"
                                      ? selectedPolygon[key].toLocaleString()
                                      : selectedPolygon[key]}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <div
                          className={`border rounded-lg p-2 mb-3 ${
                            language === "ar"
                              ? "text-right flex-1"
                              : "text-left"
                          }`}
                        >
                          <div
                            className="flex items-center justify-between cursor-pointer"
                            onClick={() => toggleSection("education")}
                          >
                            <div className="flex items-center">
                              <BookOpen className="w-5 h-5 mr-2" />
                              <h5 className="font-medium">{t.education}</h5>
                            </div>
                            <ChevronDownIcon
                              className={`w-5 h-5 transform transition-transform ${
                                expandedSections.education ? "rotate-180" : ""
                              }`}
                            />
                          </div>
                          {expandedSections.education && (
                            <ul className="mt-2 space-y-2">
                              {dataCategories.education.map((key) => (
                                <li
                                  key={key}
                                  className={`flex ${
                                    language === "ar"
                                      ? "flex-row-reverse"
                                      : "justify-between"
                                  } ${
                                    isDarkMode
                                      ? "text-gray-300"
                                      : "text-gray-700"
                                  }`}
                                >
                                  <span className="font-medium">
                                    {t[key as keyof typeof t]}
                                  </span>
                                  <span
                                    className={`${
                                      language === "ar"
                                        ? "text-left flex-1"
                                        : "ml-4"
                                    } `}
                                  >
                                    {typeof selectedPolygon[key] === "number"
                                      ? selectedPolygon[key].toLocaleString()
                                      : selectedPolygon[key]}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <div
                          className={`border rounded-lg p-2 mb-3 ${
                            language === "ar"
                              ? "text-right flex-1"
                              : "text-left"
                          }`}
                        >
                          <div
                            className="flex items-center justify-between cursor-pointer"
                            onClick={() => toggleSection("langues")}
                          >
                            <div className="flex items-center">
                              <Languages className="w-5 h-5 mr-2" />
                              <h5 className="font-medium">{t.langues}</h5>
                            </div>
                            <ChevronDownIcon
                              className={`w-5 h-5 transform transition-transform ${
                                expandedSections.langues ? "rotate-180" : ""
                              }`}
                            />
                          </div>
                          {expandedSections.langues && (
                            <ul className="mt-2 space-y-2">
                              {dataCategories.langues.map((key) => (
                                <li
                                  key={key}
                                  className={`flex ${
                                    language === "ar"
                                      ? "flex-row-reverse"
                                      : "justify-between"
                                  } ${
                                    isDarkMode
                                      ? "text-gray-300"
                                      : "text-gray-700"
                                  }`}
                                >
                                  <span className="font-medium">
                                    {t[key as keyof typeof t]}
                                  </span>
                                  <span
                                    className={`${
                                      language === "ar"
                                        ? "text-left flex-1"
                                        : "ml-4"
                                    } `}
                                  >
                                    {typeof selectedPolygon[key] === "number"
                                      ? selectedPolygon[key].toLocaleString()
                                      : selectedPolygon[key]}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <div
                          className={`border rounded-lg p-2 mb-3 ${
                            language === "ar"
                              ? "text-right flex-1"
                              : "text-left"
                          }`}
                        >
                          <div
                            className="flex items-center justify-between cursor-pointer"
                            onClick={() => toggleSection("emploi")}
                          >
                            <div className="flex items-center">
                              <DollarSign className="w-5 h-5 mr-2" />
                              <h5 className="font-medium">{t.emploi}</h5>
                            </div>
                            <ChevronDownIcon
                              className={`w-5 h-5 transform transition-transform ${
                                expandedSections.emploi ? "rotate-180" : ""
                              }`}
                            />
                          </div>
                          {expandedSections.emploi && (
                            <ul className="mt-2 space-y-2">
                              {dataCategories.emploi.map((key) => (
                                <li
                                  key={key}
                                  className={`flex ${
                                    language === "ar"
                                      ? "flex-row-reverse"
                                      : "justify-between"
                                  } ${
                                    isDarkMode
                                      ? "text-gray-300"
                                      : "text-gray-700"
                                  }`}
                                >
                                  <span className="font-medium">
                                    {t[key as keyof typeof t]}
                                  </span>
                                  <span
                                    className={`${
                                      language === "ar"
                                        ? "text-left flex-1"
                                        : "ml-4"
                                    } `}
                                  >
                                    {typeof selectedPolygon[key] === "number"
                                      ? selectedPolygon[key].toLocaleString()
                                      : selectedPolygon[key]}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <div
                          className={`border rounded-lg p-2 mb-3 ${
                            language === "ar"
                              ? "text-right flex-1"
                              : "text-left"
                          }`}
                        >
                          <div
                            className="flex items-center justify-between cursor-pointer"
                            onClick={() => toggleSection("menages")}
                          >
                            <div className="flex items-center">
                              <Home className="w-5 h-5 mr-2" />
                              <h5 className="font-medium">{t.menages}</h5>
                            </div>
                            <ChevronDownIcon
                              className={`w-5 h-5 transform transition-transform ${
                                expandedSections.menages ? "rotate-180" : ""
                              }`}
                            />
                          </div>
                          {expandedSections.menages && (
                            <ul className="mt-2 space-y-2">
                              {dataCategories.menages.map((key) => (
                                <li
                                  key={key}
                                  className={`flex ${
                                    language === "ar"
                                      ? "flex-row-reverse"
                                      : "justify-between"
                                  } ${
                                    isDarkMode
                                      ? "text-gray-300"
                                      : "text-gray-700"
                                  }`}
                                >
                                  <span className="font-medium">
                                    {t[key as keyof typeof t]}
                                  </span>
                                  <span
                                    className={`${
                                      language === "ar"
                                        ? "text-left flex-1"
                                        : "ml-4"
                                    } `}
                                  >
                                    {typeof selectedPolygon[key] === "number"
                                      ? selectedPolygon[key].toLocaleString()
                                      : selectedPolygon[key]}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <div
                          className={`border rounded-lg p-2 mb-3 ${
                            language === "ar"
                              ? "text-right flex-1"
                              : "text-left"
                          }`}
                        >
                          <div
                            className="flex items-center justify-between cursor-pointer"
                            onClick={() => toggleSection("economie")}
                          >
                            <div className="flex items-center">
                              <Building className="w-5 h-5 mr-2" />
                              <h5 className="font-medium">{t.economie}</h5>
                            </div>
                            <ChevronDownIcon
                              className={`w-5 h-5 transform transition-transform ${
                                expandedSections.economie ? "rotate-180" : ""
                              }`}
                            />
                          </div>
                          {expandedSections.economie && (
                            <ul className="mt-2 space-y-2">
                              {dataCategories.economie.map((key) => (
                                <li
                                  key={key}
                                  className={`flex ${
                                    language === "ar"
                                      ? "flex-row-reverse"
                                      : "justify-between"
                                  } ${
                                    isDarkMode
                                      ? "text-gray-300"
                                      : "text-gray-700"
                                  }`}
                                >
                                  <span className="font-medium">
                                    {t[key as keyof typeof t]}
                                  </span>
                                  <span
                                    className={`${
                                      language === "ar"
                                        ? "text-left flex-1"
                                        : "ml-4"
                                    } `}
                                  >
                                    {typeof selectedPolygon[key] === "number"
                                      ? selectedPolygon[key].toLocaleString()
                                      : selectedPolygon[key]}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <div
                          className={`border rounded-lg p-2 mb-3 ${
                            language === "ar"
                              ? "text-right flex-1"
                              : "text-left"
                          }`}
                        >
                          <div
                            className="flex items-center justify-between cursor-pointer"
                            onClick={() => toggleSection("secac")}
                          >
                            <div className="flex items-center">
                              <PieChart className="w-5 h-5 mr-2" />
                              <h5 className="font-medium">{t.secac}</h5>
                            </div>
                            <ChevronDownIcon
                              className={`w-5 h-5 transform transition-transform ${
                                expandedSections.secac ? "rotate-180" : ""
                              }`}
                            />
                          </div>
                          {expandedSections.secac && (
                            <ul className="mt-2 space-y-2">
                              {dataCategories.secac.map((key) => (
                                <li
                                  key={key}
                                  className={`flex ${
                                    language === "ar"
                                      ? "flex-row-reverse"
                                      : "justify-between"
                                  } ${
                                    isDarkMode
                                      ? "text-gray-300"
                                      : "text-gray-700"
                                  }`}
                                >
                                  <span className="font-medium">
                                    {t[key as keyof typeof t]}
                                  </span>
                                  <span
                                    className={`${
                                      language === "ar"
                                        ? "text-left flex-1"
                                        : "ml-4"
                                    } `}
                                  >
                                    {typeof selectedPolygon[key] === "number"
                                      ? selectedPolygon[key].toLocaleString()
                                      : selectedPolygon[key]}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <div
                          className={`border rounded-lg p-2 mb-3 ${
                            language === "ar"
                              ? "text-right flex-1"
                              : "text-left"
                          }`}
                        >
                          <div
                            className="flex items-center justify-between cursor-pointer"
                            onClick={() => toggleSection("cl_emp")}
                          >
                            <div className="flex items-center">
                              <TrendingUp className="w-5 h-5 mr-2" />
                              <h5 className="font-medium">{t.cl_emp}</h5>
                            </div>
                            <ChevronDownIcon
                              className={`w-5 h-5 transform transition-transform ${
                                expandedSections.cl_emp ? "rotate-180" : ""
                              }`}
                            />
                          </div>
                          {expandedSections.cl_emp && (
                            <ul className="mt-2 space-y-2">
                              {dataCategories.cl_emp.map((key) => (
                                <li
                                  key={key}
                                  className={`flex ${
                                    language === "ar"
                                      ? "flex-row-reverse"
                                      : "justify-between"
                                  } ${
                                    isDarkMode
                                      ? "text-gray-300"
                                      : "text-gray-700"
                                  }`}
                                >
                                  <span className="font-medium">
                                    {t[key as keyof typeof t]}
                                  </span>
                                  <span
                                    className={`${
                                      language === "ar"
                                        ? "text-left flex-1"
                                        : "ml-4"
                                    } `}
                                  >
                                    {typeof selectedPolygon[key] === "number"
                                      ? selectedPolygon[key].toLocaleString()
                                      : selectedPolygon[key]}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <div
                          className={`border rounded-lg p-2 mb-3 ${
                            language === "ar"
                              ? "text-right flex-1"
                              : "text-left"
                          }`}
                        >
                          <div
                            className="flex items-center justify-between cursor-pointer"
                            onClick={() => toggleSection("creation")}
                          >
                            <div className="flex items-center">
                              <Calendar className="w-5 h-5 mr-2" />
                              <h5 className="font-medium">{t.creation}</h5>
                            </div>
                            <ChevronDownIcon
                              className={`w-5 h-5 transform transition-transform ${
                                expandedSections.creation ? "rotate-180" : ""
                              }`}
                            />
                          </div>
                          {expandedSections.creation && (
                            <ul className="mt-2 space-y-2">
                              {dataCategories.creation.map((key) => (
                                <li
                                  key={key}
                                  className={`flex ${
                                    language === "ar"
                                      ? "flex-row-reverse"
                                      : "justify-between"
                                  } ${
                                    isDarkMode
                                      ? "text-gray-300"
                                      : "text-gray-700"
                                  }`}
                                >
                                  <span className="font-medium">
                                    {t[key as keyof typeof t]}
                                  </span>
                                  <span
                                    className={`${
                                      language === "ar"
                                        ? "text-left flex-1"
                                        : "ml-4"
                                    } `}
                                  >
                                    {typeof selectedPolygon[key] === "number"
                                      ? selectedPolygon[key].toLocaleString()
                                      : selectedPolygon[key]}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => setDataWindowVisible(true)}
                    className={`p-2 rounded-lg ${
                      isDarkMode
                        ? "bg-gray-800 hover:bg-gray-700 text-blue-300"
                        : "bg-gray-200 hover:bg-gray-300 text-blue-700"
                    } transition-all duration-300 flex items-center`}
                    aria-label="Afficher les données de recensement"
                  >
                    <BookText className="w-5 h-5" />
                  </button>
                )}
              </div>
              {/* Removed showGraphModal conditional rendering from here */}

              <div
                className={`legend-btn absolute bottom-6 right-6 ${
                  isDarkMode
                    ? "bg-gray-900 scrollbar-dark"
                    : "bg-white scrollbar-light"
                } ${
                  legendVisible ? "p-4" : "p-[8px]"
                } shadow-lg rounded-lg p-4 border border-gray-300 max-h-64 overflow-y-auto`}
              >
                {legendVisible ? (
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h3
                        className={`font-bold ${
                          isDarkMode ? "text-blue-300" : "text-blue-700"
                        } mb-3 text-lg`}
                      >
                        {t.legend}
                      </h3>
                      <button
                        onClick={() => setLegendVisible(false)}
                        className={`absolute top-3 right-3 p-1 rounded-full ${
                          isDarkMode
                            ? "text-gray-300 hover:bg-gray-700"
                            : "text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <ul>
                      {layers.map((item, index) => (
                        <li key={index} className="flex items-center mb-2">
                          {item.type === "polygone" && (
                            <span
                              className="w-4 h-4 inline-block mr-2"
                              style={{ backgroundColor: item.color }}
                            ></span>
                          )}
                          {item.type === "polyline" && (
                            <div
                              className="w-4 h-1 inline-block mr-2"
                              style={{
                                backgroundColor: item.color,
                                transform: "translateY(50%)",
                              }}
                            ></div>
                          )}
                          {item.type === "point" && (
                            <img
                              src="https://static.thenounproject.com/png/265-512.png"
                              alt="Point Icon"
                              className="w-4 h-4 inline-block mr-2"
                            />
                          )}
                          <span
                            className={`${
                              isDarkMode ? "text-white" : "text-black"
                            }`}
                          >
                            {t[item.layer]}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <button
                    onClick={() => setLegendVisible(true)}
                    className={`p-2 rounded-lg ${
                      isDarkMode
                        ? "bg-gray-800 hover:bg-gray-700 text-blue-300"
                        : "bg-gray-200 hover:bg-gray-300 text-blue-700"
                    } transition-all duration-300 flex items-center`}
                    aria-label="Afficher la légende"
                  >
                    <ListOrdered className="w-5 h-5" />
                  </button>
                )}
              </div>
              {showNgrokNotice && (
                <motion.div
                  initial={{ y: -100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -100, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className={`
      absolute top-0 left-0 right-0 z-50 p-4 text-center
      ${isDarkMode ? "bg-yellow-800 text-white" : "bg-yellow-200 text-gray-800"}
      shadow-lg flex items-center justify-between
    `}
                >
                  <p className="flex-grow text-sm md:text-base">
                    {t.ngrokWarningPart1}{" "}
                    <a
                      href="https://42f3-34-82-90-5.ngrok-free.app"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${
                        isDarkMode
                          ? "text-yellow-300 hover:text-yellow-100"
                          : "text-blue-700 hover:text-blue-900"
                      } underline font-semibold`}
                    >
                      {t.ngrokWarningLinkText}
                    </a>{" "}
                    {t.ngrokWarningPart2}
                  </p>
                  <button
                    onClick={() => setShowNgrokNotice(false)}
                    className={`ml-4 p-1 rounded-full ${
                      isDarkMode
                        ? "text-white hover:bg-yellow-700"
                        : "text-gray-800 hover:bg-yellow-300"
                    }`}
                  >
                    <X size={20} />
                  </button>
                </motion.div>
              )}

              {/* Fenêtre de Contrôle des Couches */}
              <div
                className={`absolute bottom-8 transition-all duration-300 ease-in-out ${
                  isNavOpen ? "left-72" : "left-24"
                } ${
                  layersVisible ? "w-56 p-4 rounded-lg" : "w-24 p-2 rounded-lg"
                } ${
                  isDarkMode
                    ? "bg-gray-900 scrollbar-dark"
                    : "bg-white scrollbar-light"
                }
 shadow-lg z-10 max-h-56 overflow-y-auto`}
              >
                {layersVisible ? (
                  <div>
                    <h3
                      className={`font-bold ${
                        isDarkMode ? "text-blue-300" : "text-blue-700"
                      } text-lg mb-4`}
                    >
                      {activePanel === "layers" ? t.selectLayer : t.baseMap}
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setActivePanel((prev) =>
                            prev === "layers" ? "baseMap" : "layers"
                          )
                        }
                        className={` absolute top-10 right-3 p-1 rounded-full ${
                          isDarkMode
                            ? "text-gray-300 hover:bg-gray-700"
                            : "text-gray-700 hover:bg-gray-200"
                        }`}
                        aria-label={
                          activePanel === "layers"
                            ? t.switchToBaseMap
                            : t.switchToLayers
                        }
                      >
                        {activePanel === "layers" ? (
                          <Map className="w-5 h-5" />
                        ) : (
                          <Layers className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => setLayersVisible(false)}
                        className={`absolute top-3 right-3
        p-1 rounded-full ${
          isDarkMode
            ? "text-gray-300 hover:bg-gray-700"
            : "text-gray-700 hover:bg-gray-200"
        }`}
                      >
                        <X className="w-5 h-5" />
                      </button>
                      {/* Contenu dynamique */}
                      {activePanel === "layers" ? (
                        <div className="space-y-2">
                          {/* Groupe Découpage Administratif */}
                          <div className="border rounded-lg p-2 mb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <button
                                  onClick={() =>
                                    setIsAdminExpanded(!isAdminExpanded)
                                  }
                                  className={`font-medium ${
                                    isDarkMode ? "text-white" : "text-black"
                                  }`}
                                >
                                  {t.DA}
                                </button>
                              </div>
                              <ChevronDownIcon
                                onClick={() =>
                                  setIsAdminExpanded(!isAdminExpanded)
                                }
                                className={`w-5 h-5 transform transition-transform ${
                                  isAdminExpanded ? "rotate-180" : ""
                                }`}
                              />
                            </div>

                            {isAdminExpanded && (
                              <div className="ml-4 mt-2 space-y-2">
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={activeLayers.commune}
                                    onChange={() => toggleLayer("commune")}
                                    className="mr-2"
                                  />
                                  <label
                                    className={`${
                                      isDarkMode ? "text-white" : "text-black"
                                    }`}
                                  >
                                    {t.layer3}
                                  </label>
                                </div>
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={activeLayers.province}
                                    onChange={() => toggleLayer("province")}
                                    className="mr-2"
                                  />
                                  <label
                                    className={`${
                                      isDarkMode ? "text-white" : "text-black"
                                    }`}
                                  >
                                    {t.layer2}
                                  </label>
                                </div>
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={activeLayers.region}
                                    onChange={() => toggleLayer("region")}
                                    className="mr-2"
                                  />
                                  <label
                                    className={`${
                                      isDarkMode ? "text-white" : "text-black"
                                    }`}
                                  >
                                    {t.layer1}
                                  </label>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Groupe Réseau Routier */}
                          <div className="border rounded-lg p-2 mb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <button
                                  onClick={() =>
                                    setIsRoadExpanded(!isRoadExpanded)
                                  }
                                  className={`font-medium ${
                                    isDarkMode ? "text-white" : "text-black"
                                  }`}
                                >
                                  {t.RR}
                                </button>
                              </div>
                              <ChevronDownIcon
                                onClick={() =>
                                  setIsRoadExpanded(!isRoadExpanded)
                                }
                                className={`w-5 h-5 transform transition-transform ${
                                  isRoadExpanded ? "rotate-180" : ""
                                }`}
                              />
                            </div>

                            {isRoadExpanded && (
                              <div className="ml-4 mt-2 space-y-2">
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={activeLayers.routenationale}
                                    onChange={() =>
                                      toggleLayer("routenationale")
                                    }
                                    className="mr-2"
                                  />
                                  <label
                                    className={`${
                                      isDarkMode ? "text-white" : "text-black"
                                    }`}
                                  >
                                    {t.layer4}
                                  </label>
                                </div>
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={activeLayers.routeregionale}
                                    onChange={() =>
                                      toggleLayer("routeregionale")
                                    }
                                    className="mr-2"
                                  />
                                  <label
                                    className={`${
                                      isDarkMode ? "text-white" : "text-black"
                                    }`}
                                  >
                                    {t.layer6}
                                  </label>
                                </div>
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={activeLayers.routeprovinciale}
                                    onChange={() =>
                                      toggleLayer("routeprovinciale")
                                    }
                                    className="mr-2"
                                  />
                                  <label
                                    className={`${
                                      isDarkMode ? "text-white" : "text-black"
                                    }`}
                                  >
                                    {t.layer5}
                                  </label>
                                </div>
                              </div>
                            )}
                          </div>
                          {/* Groupe hydrographie */}
                          <div className="border rounded-lg p-2 mb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <button
                                  onClick={() =>
                                    setIsHydroExpanded(!isHydroExpanded)
                                  }
                                  className={`font-medium ${
                                    isDarkMode ? "text-white" : "text-black"
                                  }`}
                                >
                                  {t.HY}
                                </button>
                              </div>
                              <ChevronDownIcon
                                onClick={() =>
                                  setIsHydroExpanded(!isHydroExpanded)
                                }
                                className={`w-5 h-5 transform transition-transform ${
                                  isHydroExpanded ? "rotate-180" : ""
                                }`}
                              />
                            </div>

                            {isHydroExpanded && (
                              <div className="ml-4 mt-2 space-y-2">
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={activeLayers.barrage}
                                    onChange={() => toggleLayer("barrage")}
                                    className="mr-2"
                                  />
                                  <label
                                    className={`${
                                      isDarkMode ? "text-white" : "text-black"
                                    }`}
                                  >
                                    {t.layer7}
                                  </label>
                                </div>
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={activeLayers.bassin}
                                    onChange={() => toggleLayer("bassin")}
                                    className="mr-2"
                                  />
                                  <label
                                    className={`${
                                      isDarkMode ? "text-white" : "text-black"
                                    }`}
                                  >
                                    {t.layer8}
                                  </label>
                                </div>
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={activeLayers.oued}
                                    onChange={() => toggleLayer("oued")}
                                    className="mr-2"
                                  />
                                  <label
                                    className={`${
                                      isDarkMode ? "text-white" : "text-black"
                                    }`}
                                  >
                                    {t.layer9}
                                  </label>
                                </div>
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={activeLayers.nappe}
                                    onChange={() => toggleLayer("nappe")}
                                    className="mr-2"
                                  />
                                  <label
                                    className={`${
                                      isDarkMode ? "text-white" : "text-black"
                                    }`}
                                  >
                                    {t.layer10}
                                  </label>
                                </div>
                              </div>
                            )}
                          </div>
                          {/* Groupe land */}
                          <div className="border rounded-lg p-2 mb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <button
                                  onClick={() =>
                                    setisLandExpanded(!isLandExpanded)
                                  }
                                  className={`font-medium ${
                                    isDarkMode ? "text-white" : "text-black"
                                  }`}
                                >
                                  {t.land}
                                </button>
                              </div>
                              <ChevronDownIcon
                                onClick={() =>
                                  setisLandExpanded(!isLandExpanded)
                                }
                                className={`w-5 h-5 transform transition-transform ${
                                  isLandExpanded ? "rotate-180" : ""
                                }`}
                              />
                            </div>

                            {isLandExpanded && (
                              <div className="ml-4 mt-2 space-y-2">
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={activeLayers.errachidia_P}
                                    onChange={() => toggleLayer("errachidia_P")}
                                    className="mr-2"
                                  />
                                  <label
                                    className={`${
                                      isDarkMode ? "text-white" : "text-black"
                                    }`}
                                  >
                                    {t.layer12}
                                  </label>
                                </div>
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={activeLayers.midelt_P}
                                    onChange={() => toggleLayer("midelt_P")}
                                    className="mr-2"
                                  />
                                  <label
                                    className={`${
                                      isDarkMode ? "text-white" : "text-black"
                                    }`}
                                  >
                                    {t.layer11}
                                  </label>
                                </div>
                              </div>
                            )}
                          </div>
                          {/* Groupe pa */}
                          <div className="border rounded-lg p-2 mb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <button
                                  onClick={() => setisPAExpanded(!isPAExpanded)}
                                  className={`font-medium ${
                                    isDarkMode ? "text-white" : "text-black"
                                  }`}
                                >
                                  {t.PA}
                                </button>
                              </div>
                              <ChevronDownIcon
                                onClick={() => setisPAExpanded(!isPAExpanded)}
                                className={`w-5 h-5 transform transition-transform ${
                                  isPAExpanded ? "rotate-180" : ""
                                }`}
                              />
                            </div>

                            {isPAExpanded && (
                              <div className="ml-4 mt-2 space-y-2">
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={activeLayers.pa1}
                                    onChange={() => toggleLayer("pa1")}
                                    className="mr-2"
                                  />
                                  <label
                                    className={`${
                                      isDarkMode ? "text-white" : "text-black"
                                    }`}
                                  >
                                    {t.PA1}
                                  </label>
                                </div>
                              </div>
                            )}
                          </div>
                          {/* Groupe Cartes de Prédiction */}
                          <div className="border rounded-lg p-2 mb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <button
                                  onClick={() =>
                                    setIsPredictionExpanded((prev) => ({
                                      ...prev,
                                      proximity: !prev.proximity,
                                    }))
                                  }
                                  className={`font-medium ${
                                    isDarkMode ? "text-white" : "text-black"
                                  }`}
                                >
                                  {t.proximityMaps}
                                </button>
                              </div>
                              <ChevronDownIcon
                                onClick={() =>
                                  setIsPredictionExpanded((prev) => ({
                                    ...prev,
                                    proximity: !prev.proximity,
                                  }))
                                }
                                className={`w-5 h-5 transform transition-transform ${
                                  isPredictionExpanded.proximity
                                    ? "rotate-180"
                                    : ""
                                }`}
                              />
                            </div>

                            {isPredictionExpanded.proximity && (
                              <div className="ml-4 mt-2 space-y-2">
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={activeLayers.prox_bat}
                                    onChange={() => toggleLayer("prox_bat")}
                                    className="mr-2"
                                  />
                                  <label
                                    className={`${
                                      isDarkMode ? "text-white" : "text-black"
                                    }`}
                                  >
                                    {t.prox_bat}
                                  </label>
                                </div>
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={activeLayers.prox_route}
                                    onChange={() => toggleLayer("prox_route")}
                                    className="mr-2"
                                  />
                                  <label
                                    className={`${
                                      isDarkMode ? "text-white" : "text-black"
                                    }`}
                                  >
                                    {t.prox_route}
                                  </label>
                                </div>
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={activeLayers.prox_eq}
                                    onChange={() => toggleLayer("prox_eq")}
                                    className="mr-2"
                                  />
                                  <label
                                    className={`${
                                      isDarkMode ? "text-white" : "text-black"
                                    }`}
                                  >
                                    {t.prox_eq}
                                  </label>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Groupe Cartes d'Altitude/Pente */}
                          <div className="border rounded-lg p-2 mb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <button
                                  onClick={() =>
                                    setIsPredictionExpanded((prev) => ({
                                      ...prev,
                                      elevation: !prev.elevation,
                                    }))
                                  }
                                  className={`font-medium ${
                                    isDarkMode ? "text-white" : "text-black"
                                  }`}
                                >
                                  {t.elevationMaps}
                                </button>
                              </div>
                              <ChevronDownIcon
                                onClick={() =>
                                  setIsPredictionExpanded((prev) => ({
                                    ...prev,
                                    elevation: !prev.elevation,
                                  }))
                                }
                                className={`w-5 h-5 transform transition-transform ${
                                  isPredictionExpanded.elevation
                                    ? "rotate-180"
                                    : ""
                                }`}
                              />
                            </div>

                            {isPredictionExpanded.elevation && (
                              <div className="ml-4 mt-2 space-y-2">
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={activeLayers.mnt}
                                    onChange={() => toggleLayer("mnt")}
                                    className="mr-2"
                                  />
                                  <label
                                    className={`${
                                      isDarkMode ? "text-white" : "text-black"
                                    }`}
                                  >
                                    {t.mnt}
                                  </label>
                                </div>
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={activeLayers.pente}
                                    onChange={() => toggleLayer("pente")}
                                    className="mr-2"
                                  />
                                  <label
                                    className={`${
                                      isDarkMode ? "text-white" : "text-black"
                                    }`}
                                  >
                                    {t.pente}
                                  </label>
                                </div>
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={activeLayers.cn}
                                    onChange={() => toggleLayer("cn")}
                                    className="mr-2"
                                  />
                                  <label
                                    className={`${
                                      isDarkMode ? "text-white" : "text-black"
                                    }`}
                                  >
                                    {t.cn}{" "}
                                    {/* Ajoutez la traduction ci-dessous */}
                                  </label>
                                </div>
                              </div>
                            )}
                          </div>
                          {/* Groupe Cartes de Viabilité */}
                          <div className="border rounded-lg p-2 mb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <button
                                  onClick={() =>
                                    setIsPredictionExpanded((prev) => ({
                                      ...prev,
                                      viability: !prev.viability,
                                    }))
                                  }
                                  className={`font-medium ${
                                    isDarkMode ? "text-white" : "text-black"
                                  }`}
                                >
                                  {t.viabilityMaps}
                                </button>
                              </div>
                              <ChevronDownIcon
                                onClick={() =>
                                  setIsPredictionExpanded((prev) => ({
                                    ...prev,
                                    viability: !prev.viability,
                                  }))
                                }
                                className={`w-5 h-5 transform transition-transform ${
                                  isPredictionExpanded.viability
                                    ? "rotate-180"
                                    : ""
                                }`}
                              />
                            </div>

                            {isPredictionExpanded.viability && (
                              <div className="ml-4 mt-2 space-y-2">
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={activeLayers.class_viabl}
                                    onChange={() => toggleLayer("class_viabl")}
                                    className="mr-2"
                                  />
                                  <label
                                    className={`${
                                      isDarkMode ? "text-white" : "text-black"
                                    }`}
                                  >
                                    {t.class_viabl}
                                  </label>
                                </div>
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={activeLayers.ind_viabl}
                                    onChange={() => toggleLayer("ind_viabl")}
                                    className="mr-2"
                                  />
                                  <label
                                    className={`${
                                      isDarkMode ? "text-white" : "text-black"
                                    }`}
                                  >
                                    {t.ind_viabl}
                                  </label>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {Object.entries(baseMaps).map(([key, map], index) => (
                            <button
                              key={key}
                              onClick={() => setBaseMap(key)}
                              className={`w-full text-left px-3 py-1 rounded-md ${
                                index === 0 ? "mt-2 " : ""
                              }${
                                baseMap === key
                                  ? isDarkMode
                                    ? "bg-blue-600 text-white"
                                    : "bg-blue-100 text-blue-800"
                                  : isDarkMode
                                  ? "hover:bg-gray-700 text-gray-300"
                                  : "hover:bg-gray-200 text-gray-700"
                              }`}
                            >
                              {t[key as keyof typeof t]}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setLayersVisible(true);
                        setActivePanel("layers");
                      }}
                      className={`layers-control-btn p-2 rounded-lg ${
                        isDarkMode
                          ? "bg-gray-800 hover:bg-gray-700 text-blue-300"
                          : "bg-gray-200 hover:bg-gray-300 text-blue-700"
                      } transition-all duration-300 flex items-center`}
                      aria-label="Afficher les contrôles des couches"
                    >
                      <Layers className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setLayersVisible(true);
                        setActivePanel("baseMap");
                      }}
                      className={`base-map-btn p-2 rounded-lg ${
                        isDarkMode
                          ? "bg-gray-800 hover:bg-gray-700 text-blue-300"
                          : "bg-gray-200 hover:bg-gray-300 text-blue-700"
                      } transition-all duration-300 flex items-center`}
                      aria-label="Afficher les contrôles des couches"
                    >
                      <Map className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={toggleAllPanels}
                className={`
                   absolute bottom-6 right-1/3 transform -translate-x-1/2
                   p-2 rounded-lg shadow-lg z-20 /* Petits padding et border-radius */
                   text-base font-semibold /* Taille de texte réduite, moins de gras */
                   ${
                     isDarkMode
                       ? "bg-gray-800 hover:bg-gray-700 text-blue-300"
                       : "bg-gray-200 hover:bg-gray-300 text-blue-700"
                   }
                   ${isNavOpen ? "right-1/3" : "right-[570px]"}
                  transition-all duration-300 ease-in-out
                   flex items-center 
                 `}
              >
                {allPanelsVisible ? t.closeAllPanels : t.showAllPanels}
              </button>
            </>
          ) : currentPage === "graph" ? ( // Render GraphPage when currentPage is 'graph'
            <GraphPage
              language={language}
              isDarkMode={isDarkMode}
              onClose={() => setCurrentPage("map")}
              isFirstGraphVisit={isFirstSiteVisit} // Pass the global site visit state
              setIsFirstGraphVisit={setIsFirstSiteVisit} // Pass the setter // Go back to map when closed
            />
          ) : (
            <div
              className={`relative flex flex-col items-center justify-center h-screen text-center ${
                isDarkMode
                  ? "bg-gradient-to-b from-blue-900 to-gray-900 text-white"
                  : "bg-gradient-to-b from-blue-300 to-gray-300 text-black"
              }`}
            >
              {/* Animation du titre */}
              <motion.h1
                initial={{ opacity: 0, y: -60 }}
                animate={{ opacity: 1, y: -40 }}
                transition={{ duration: 1 }}
                className={` ${
                  isDarkMode ? "text-blue-400" : "text-blue-700"
                } text-4xl font-extrabold drop-shadow-md mb-6"`}
              >
                {t.title}
              </motion.h1>
              <motion.h2
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: -20 }}
                transition={{ duration: 1 }}
                className={` ${
                  isDarkMode ? "text-blue-400" : "text-blue-700"
                } text-3xl font-extrabold drop-shadow-md mb-6"`}
              >
                {t.title2}
              </motion.h2>

              {/* Description du site */}
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.3 }}
                className={`text-lg ${
                  isDarkMode ? "text-gray-300" : "text-gray-900"
                } max-w-3xl mb-8`}
              >
                {t.desc}
              </motion.p>

              {/* Bouton pour aller à la carte */}
              <motion.button
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.3 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setCurrentPage("map")}
                className={`map-access-btn ${
                  isDarkMode
                    ? "bg-blue-400 hover:bg-blue-500 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-black"
                } font-semibold px-6 py-3 rounded-lg shadow-lg transition-all duration-300`}
              >
                {t.map2}
              </motion.button>

              {/* Pied de page */}
              <footer
                className={`absolute bottom-4 ${
                  isDarkMode ? "text-gray-400" : "text-gray-900"
                }  text-sm`}
              >
                {t.copy}{" "}
              </footer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  text: string;
  isOpen: boolean;
  onClick?: () => void;
}

function NavItem({ icon, text, isOpen, onClick }: NavItemProps) {
  return (
    <div onClick={onClick}>
      <div className="flex items-center p-3 mb-2 hover:bg-indigo-700 rounded-lg cursor-pointer transition-colors">
        <div className="h-5 w-5">{icon}</div>
        {isOpen && <span className="ml-3">{text}</span>}
      </div>
    </div>
  );
}

export default App;
